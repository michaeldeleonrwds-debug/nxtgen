import express from 'express';
import cors from 'cors';
import net from 'net';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase, getPool, getDatabaseStatus, memoryStore } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Helper function to check if a TCP port is responding
function checkPort(port, host = '127.0.0.1', timeout = 800) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let isConnected = false;

    socket.setTimeout(timeout);
    socket.once('connect', () => {
      isConnected = true;
      socket.destroy();
      resolve(true);
    });

    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });

    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });

    socket.connect(port, host);
  });
}

// Ensure database is initialized
await initDatabase();

// --- 1. HEALTH & STACK TELEMETRY ---
app.get('/api/health', async (req, res) => {
  const dbStatus = getDatabaseStatus();
  const pool = getPool();
  let dbOnline = false;

  if (pool) {
    try {
      await pool.query('SELECT 1');
      dbOnline = true;
    } catch {
      dbOnline = false;
    }
  }

  const [nginx80, nginx443, php9000, vite5173] = await Promise.all([
    checkPort(80),
    checkPort(443),
    checkPort(9000),
    checkPort(5173)
  ]);

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: {
      ...dbStatus,
      online: dbOnline
    },
    ports: {
      nginx: nginx80 || nginx443,
      nginx80,
      nginx443,
      mysql3306: dbOnline,
      php9000,
      vite5173,
      api5000: true
    },
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// --- 2. DASHBOARD SUMMARY STATS ---
app.get('/api/stats', async (req, res) => {
  const pool = getPool();
  if (pool) {
    try {
      const [[inqTotal]] = await pool.query('SELECT COUNT(*) as count FROM inquiries');
      const [[inqNew]] = await pool.query("SELECT COUNT(*) as count FROM inquiries WHERE status = 'new'");
      const [[srvCount]] = await pool.query('SELECT COUNT(*) as count FROM services WHERE is_active = 1');
      const [[revCount]] = await pool.query('SELECT COUNT(*) as count FROM client_reviews WHERE is_active = 1');
      const [[projCount]] = await pool.query('SELECT COUNT(*) as count FROM projects');
      const [[teamCount]] = await pool.query('SELECT COUNT(*) as count FROM team_members');

      return res.json({
        inquiries: { total: inqTotal.count, new: inqNew.count },
        services: srvCount.count,
        reviews: revCount.count,
        projects: projCount.count,
        team: teamCount.count,
        dbEngine: 'MariaDB 11.8.2 (InnoDB)',
        dbName: 'nxtgen_db'
      });
    } catch (err) {
      console.error('Error fetching stats:', err.message);
    }
  }

  // Fallback
  res.json({
    inquiries: { total: memoryStore.inquiries.length, new: memoryStore.inquiries.filter(i => i.status === 'new').length },
    services: memoryStore.services.length,
    reviews: memoryStore.reviews.length,
    projects: memoryStore.projects.length,
    team: memoryStore.team.length,
    dbEngine: 'In-Memory Mirror',
    dbName: 'nxtgen_db'
  });
});

// --- 3. STACK SERVICES LIST ---
app.get('/api/stack/services', async (req, res) => {
  const pool = getPool();
  const [nginxLive, phpLive, mysqlLive] = await Promise.all([
    checkPort(80),
    checkPort(9000),
    checkPort(3306)
  ]);

  if (pool) {
    try {
      const [rows] = await pool.query('SELECT * FROM stack_services ORDER BY sort_order ASC');
      // Update real status
      const mapped = rows.map(svc => {
        let liveStatus = svc.status;
        if (svc.id === 'nginx') liveStatus = nginxLive ? 'Running' : 'Stopped';
        if (svc.id === 'php') liveStatus = phpLive ? 'Running' : 'Stopped';
        if (svc.id === 'mariadb') liveStatus = mysqlLive ? 'Running' : 'Stopped';
        if (svc.id === 'node') liveStatus = 'Running';
        return { ...svc, status: liveStatus };
      });
      return res.json(mapped);
    } catch (err) {
      console.error('Error fetching stack services:', err.message);
    }
  }

  res.json(memoryStore.stack_services.map(svc => {
    let liveStatus = svc.status;
    if (svc.id === 'nginx') liveStatus = nginxLive ? 'Running' : 'Stopped';
    if (svc.id === 'php') liveStatus = phpLive ? 'Running' : 'Stopped';
    if (svc.id === 'mariadb') liveStatus = mysqlLive ? 'Running' : 'Stopped';
    return { ...svc, status: liveStatus };
  }));
});

// Service action (start/stop/restart)
app.post('/api/stack/services/:id/action', async (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // 'start', 'stop', 'restart'
  const pool = getPool();

  const nextStatus = action === 'stop' ? 'Stopped' : 'Running';

  if (pool) {
    try {
      await pool.query('UPDATE stack_services SET status = ? WHERE id = ?', [nextStatus, id]);
      await pool.query('INSERT INTO system_logs (service, level, message) VALUES (?, ?, ?)', [
        id,
        'info',
        `Service ${id} received action: ${action}. Status set to ${nextStatus}.`
      ]);
    } catch (err) {
      console.error(err.message);
    }
  } else {
    const s = memoryStore.stack_services.find(item => item.id === id);
    if (s) s.status = nextStatus;
  }

  res.json({ success: true, id, action, status: nextStatus });
});

// --- 4. TOPOLOGY ---
app.get('/api/stack/topology', async (req, res) => {
  const [nginxLive, phpLive, mysqlLive, viteLive] = await Promise.all([
    checkPort(80),
    checkPort(9000),
    checkPort(3306),
    checkPort(5173)
  ]);

  res.json({
    nodes: [
      { id: 'client', name: 'Web Traffic / Clients', port: 'Public', status: 'Active', type: 'ingress' },
      { id: 'nginx', name: 'Nginx Web Server', port: '80 · SSL 443', status: nginxLive ? 'Running' : 'Stopped', type: 'proxy', version: 'v1.28.0' },
      { id: 'vite', name: 'Vite Frontend (NXTGen)', port: '5173', status: viteLive ? 'Running' : 'Stopped', type: 'app', version: 'v8.3.0' },
      { id: 'node', name: 'Node.js Express API', port: '5000', status: 'Running', type: 'api', version: 'v26.7.0' },
      { id: 'php', name: 'PHP FastCGI (FPM)', port: '9000', status: phpLive ? 'Running' : 'Stopped', type: 'runtime', version: 'v8.5.9' },
      { id: 'mariadb', name: 'MariaDB / MySQL', port: '3306', status: mysqlLive ? 'Running' : 'Stopped', type: 'database', version: 'v11.8.2' },
      { id: 'minio', name: 'MinIO S3 Storage', port: '9500 · UI 9501', status: 'Stopped', type: 'storage', version: 'vlatest' }
    ],
    connections: [
      { from: 'client', to: 'nginx', label: 'HTTP / HTTPS' },
      { from: 'nginx', to: 'vite', label: 'Proxy /' },
      { from: 'nginx', to: 'node', label: 'Proxy /api' },
      { from: 'nginx', to: 'php', label: 'FastCGI *.php' },
      { from: 'node', to: 'mariadb', label: 'TCP 3306 (Pool)' },
      { from: 'node', to: 'minio', label: 'S3 API' }
    ]
  });
});

// --- 5. NGINX CONFIGURATION MANAGER ---
const NGINX_CUSTOM_DIR = 'C:/ProgramData/envkit/generated/nginx/custom';
const NXTGEN_CONF_PATH = path.join(NGINX_CUSTOM_DIR, 'nxtgen.conf');

app.get('/api/stack/nginx-config', (req, res) => {
  let customContent = '';
  if (fs.existsSync(NXTGEN_CONF_PATH)) {
    try {
      customContent = fs.readFileSync(NXTGEN_CONF_PATH, 'utf-8');
    } catch {
      // fallback
    }
  }

  if (!customContent) {
    customContent = `# NXTGen Local Stack Reverse Proxy Configuration
server {
    listen 80;
    listen 443 ssl;
    server_name nxtgen.test admin.nxtgen.test;

    ssl_certificate     "C:/ProgramData/envkit/certs/fullchain.crt";
    ssl_certificate_key "C:/ProgramData/envkit/certs/leaf.key";

    # Proxy to Vite React Dev Server
    location / {
        proxy_pass http://127.0.0.1:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Proxy to Node.js Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Custom Error Pages
    error_page 502 503 504 /50x.html;
}
`;
  }

  res.json({
    configPath: NXTGEN_CONF_PATH,
    content: customContent,
    customDirExists: fs.existsSync(NGINX_CUSTOM_DIR)
  });
});

app.post('/api/stack/nginx-config', async (req, res) => {
  const { content } = req.body;
  try {
    if (!fs.existsSync(NGINX_CUSTOM_DIR)) {
      fs.mkdirSync(NGINX_CUSTOM_DIR, { recursive: true });
    }
    fs.writeFileSync(NXTGEN_CONF_PATH, content, 'utf-8');

    const pool = getPool();
    if (pool) {
      await pool.query('INSERT INTO system_logs (service, level, message) VALUES (?, ?, ?)', [
        'nginx',
        'info',
        'Updated Nginx configuration at ' + NXTGEN_CONF_PATH
      ]);
    }

    res.json({ success: true, message: 'Nginx configuration saved successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- 6. LOGS ---
app.get('/api/stack/logs', async (req, res) => {
  const pool = getPool();
  let dbLogs = [];

  if (pool) {
    try {
      const [rows] = await pool.query('SELECT * FROM system_logs ORDER BY id DESC LIMIT 50');
      dbLogs = rows;
    } catch {
      dbLogs = [];
    }
  }

  // Also read envkit default access log if available
  const accessLogPath = 'C:/ProgramData/envkit/logs/sites/default/access.log';
  let nginxLogs = [];
  if (fs.existsSync(accessLogPath)) {
    try {
      const raw = fs.readFileSync(accessLogPath, 'utf-8');
      nginxLogs = raw.split('\n').filter(Boolean).slice(-20).map((line, idx) => ({
        id: `nginx-${idx}`,
        service: 'nginx',
        level: 'access',
        message: line,
        created_at: new Date().toISOString()
      }));
    } catch {
      // ignore
    }
  }

  res.json({
    systemLogs: dbLogs.length > 0 ? dbLogs : [
      { id: 1, service: 'nginx', level: 'info', message: 'Nginx worker processes active on :80 and :443', created_at: new Date().toISOString() },
      { id: 2, service: 'mysql', level: 'info', message: 'MariaDB 11.8.2 connected with InnoDB buffer pool', created_at: new Date().toISOString() },
      { id: 3, service: 'api', level: 'info', message: 'Node.js Express backend serving dynamic endpoints on :5000', created_at: new Date().toISOString() }
    ],
    nginxLogs
  });
});

// --- 7. SQL QUERY RUNNER ---
app.post('/api/stack/query', async (req, res) => {
  const { sql } = req.body;
  if (!sql || typeof sql !== 'string') {
    return res.status(400).json({ error: 'SQL query is required.' });
  }

  const pool = getPool();
  if (!pool) {
    return res.status(503).json({ error: 'MySQL is not currently connected.' });
  }

  try {
    const startTime = Date.now();
    const [result, fields] = await pool.query(sql);
    const durationMs = Date.now() - startTime;

    if (Array.isArray(result)) {
      const columns = fields ? fields.map(f => f.name) : (result.length > 0 ? Object.keys(result[0]) : []);
      return res.json({
        success: true,
        type: 'select',
        rows: result,
        columns,
        rowCount: result.length,
        durationMs
      });
    } else {
      return res.json({
        success: true,
        type: 'mutation',
        affectedRows: result.affectedRows,
        insertId: result.insertId,
        message: result.message,
        durationMs
      });
    }
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// --- 8. DATABASE DUMP / EXPORT ---
app.get('/api/stack/dump', async (req, res) => {
  const pool = getPool();
  if (!pool) {
    return res.status(503).json({ error: 'MySQL is not currently connected.' });
  }

  try {
    let dump = `-- NXTGen Database Dump\n-- Generated at: ${new Date().toISOString()}\n-- MariaDB / MySQL 11.8.2\n\n`;
    dump += `CREATE DATABASE IF NOT EXISTS \`nxtgen_db\`;\nUSE \`nxtgen_db\`;\n\n`;

    const tables = ['site_settings', 'services', 'client_reviews', 'projects', 'team_members', 'ideas', 'inquiries', 'stack_services'];
    for (const table of tables) {
      const [createRes] = await pool.query(`SHOW CREATE TABLE \`${table}\``);
      if (createRes && createRes[0]) {
        dump += `DROP TABLE IF EXISTS \`${table}\`;\n`;
        dump += `${createRes[0]['Create Table']};\n\n`;
      }

      const [rows] = await pool.query(`SELECT * FROM \`${table}\``);
      if (rows.length > 0) {
        dump += `INSERT INTO \`${table}\` VALUES \n`;
        const values = rows.map(r => {
          const rowVals = Object.values(r).map(val => {
            if (val === null) return 'NULL';
            if (typeof val === 'number') return val;
            if (typeof val === 'boolean') return val ? 1 : 0;
            return `'${String(val).replace(/'/g, "''")}'`;
          });
          return `(${rowVals.join(', ')})`;
        });
        dump += values.join(',\n') + ';\n\n';
      }
    }

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', 'attachment; filename="nxtgen_db_backup.sql"');
    res.send(dump);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 9. PUBLIC FULL SITE CONTENT BUNDLE ---
app.get('/api/content', async (req, res) => {
  const pool = getPool();
  if (pool) {
    try {
      const [settingsRows] = await pool.query('SELECT id, value FROM site_settings');
      const settings = {};
      for (const row of settingsRows) {
        settings[row.id] = row.value;
      }

      const [services] = await pool.query('SELECT * FROM services WHERE is_active = 1 ORDER BY sort_order ASC');
      const [reviews] = await pool.query('SELECT * FROM client_reviews WHERE is_active = 1 ORDER BY sort_order ASC');
      const [projects] = await pool.query('SELECT * FROM projects ORDER BY sort_order ASC');
      const [team] = await pool.query('SELECT * FROM team_members WHERE is_active = 1 ORDER BY sort_order ASC');
      const [ideas] = await pool.query('SELECT * FROM ideas WHERE is_active = 1 ORDER BY sort_order ASC');

      return res.json({
        settings,
        services,
        reviews,
        projects,
        team,
        ideas: ideas.map(i => i.title)
      });
    } catch (err) {
      console.error('Error fetching content:', err.message);
    }
  }

  // Fallback to memoryStore
  res.json({
    settings: memoryStore.settings,
    services: memoryStore.services,
    reviews: memoryStore.reviews,
    projects: memoryStore.projects,
    team: memoryStore.team,
    ideas: memoryStore.ideas.map(i => i.title)
  });
});

// --- 10. SITE SETTINGS CRUD ---
app.get('/api/settings', async (req, res) => {
  const pool = getPool();
  if (pool) {
    try {
      const [rows] = await pool.query('SELECT * FROM site_settings');
      return res.json(rows);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
  res.json(Object.entries(memoryStore.settings).map(([id, value]) => ({ id, value })));
});

app.post('/api/settings', async (req, res) => {
  const updates = req.body; // { key: value, ... }
  const pool = getPool();

  if (pool) {
    try {
      for (const [key, val] of Object.entries(updates)) {
        await pool.query(
          'INSERT INTO site_settings (id, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?',
          [key, String(val), String(val)]
        );
      }
      return res.json({ success: true, updates });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  for (const [key, val] of Object.entries(updates)) {
    memoryStore.settings[key] = String(val);
  }
  res.json({ success: true, updates });
});

// --- 11. SERVICES CRUD ---
app.get('/api/services', async (req, res) => {
  const pool = getPool();
  if (pool) {
    const [rows] = await pool.query('SELECT * FROM services ORDER BY sort_order ASC, id ASC');
    return res.json(rows);
  }
  res.json(memoryStore.services);
});

app.post('/api/services', async (req, res) => {
  const { tag, title, description, image_url, sort_order = 0 } = req.body;
  const pool = getPool();
  if (pool) {
    const [result] = await pool.query(
      'INSERT INTO services (tag, title, description, image_url, sort_order) VALUES (?, ?, ?, ?, ?)',
      [tag, title, description, image_url || 'web-mobile.webp', sort_order]
    );
    return res.json({ id: result.insertId, tag, title, description, image_url, sort_order, is_active: 1 });
  }
  const newItem = { id: Date.now(), tag, title, description, image_url: image_url || 'web-mobile.webp', sort_order, is_active: 1 };
  memoryStore.services.push(newItem);
  res.json(newItem);
});

app.put('/api/services/:id', async (req, res) => {
  const { id } = req.params;
  const { tag, title, description, image_url, sort_order, is_active } = req.body;
  const pool = getPool();
  if (pool) {
    await pool.query(
      'UPDATE services SET tag = COALESCE(?, tag), title = COALESCE(?, title), description = COALESCE(?, description), image_url = COALESCE(?, image_url), sort_order = COALESCE(?, sort_order), is_active = COALESCE(?, is_active) WHERE id = ?',
      [tag, title, description, image_url, sort_order, is_active, id]
    );
    return res.json({ success: true, id });
  }
  const item = memoryStore.services.find(s => s.id === Number(id));
  if (item) Object.assign(item, req.body);
  res.json({ success: true, id });
});

app.delete('/api/services/:id', async (req, res) => {
  const { id } = req.params;
  const pool = getPool();
  if (pool) {
    await pool.query('DELETE FROM services WHERE id = ?', [id]);
    return res.json({ success: true, id });
  }
  memoryStore.services = memoryStore.services.filter(s => s.id !== Number(id));
  res.json({ success: true, id });
});

// --- 12. CLIENT REVIEWS CRUD ---
app.get('/api/reviews', async (req, res) => {
  const pool = getPool();
  if (pool) {
    const [rows] = await pool.query('SELECT * FROM client_reviews ORDER BY sort_order ASC, id ASC');
    return res.json(rows);
  }
  res.json(memoryStore.reviews);
});

app.post('/api/reviews', async (req, res) => {
  const { client_name, role, quote, project, rating = 5, review_date = 'Just now', sort_order = 0 } = req.body;
  const pool = getPool();
  if (pool) {
    const [result] = await pool.query(
      'INSERT INTO client_reviews (client_name, role, quote, project, rating, review_date, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [client_name, role, quote, project, rating, review_date, sort_order]
    );
    return res.json({ id: result.insertId, ...req.body, is_active: 1 });
  }
  const newItem = { id: Date.now(), client_name, role, quote, project, rating, review_date, sort_order, is_active: 1 };
  memoryStore.reviews.push(newItem);
  res.json(newItem);
});

app.put('/api/reviews/:id', async (req, res) => {
  const { id } = req.params;
  const { client_name, role, quote, project, rating, review_date, is_active, sort_order } = req.body;
  const pool = getPool();
  if (pool) {
    await pool.query(
      'UPDATE client_reviews SET client_name = COALESCE(?, client_name), role = COALESCE(?, role), quote = COALESCE(?, quote), project = COALESCE(?, project), rating = COALESCE(?, rating), review_date = COALESCE(?, review_date), is_active = COALESCE(?, is_active), sort_order = COALESCE(?, sort_order) WHERE id = ?',
      [client_name, role, quote, project, rating, review_date, is_active, sort_order, id]
    );
    return res.json({ success: true, id });
  }
  const item = memoryStore.reviews.find(r => r.id === Number(id));
  if (item) Object.assign(item, req.body);
  res.json({ success: true, id });
});

app.delete('/api/reviews/:id', async (req, res) => {
  const { id } = req.params;
  const pool = getPool();
  if (pool) {
    await pool.query('DELETE FROM client_reviews WHERE id = ?', [id]);
    return res.json({ success: true, id });
  }
  memoryStore.reviews = memoryStore.reviews.filter(r => r.id !== Number(id));
  res.json({ success: true, id });
});

// --- 13. PROJECTS CRUD ---
app.get('/api/projects', async (req, res) => {
  const pool = getPool();
  if (pool) {
    const [rows] = await pool.query('SELECT * FROM projects ORDER BY sort_order ASC, id ASC');
    return res.json(rows);
  }
  res.json(memoryStore.projects);
});

app.post('/api/projects', async (req, res) => {
  const { title, category, description, tags, status = 'Live', client, demo_url, sort_order = 0 } = req.body;
  const pool = getPool();
  if (pool) {
    const [result] = await pool.query(
      'INSERT INTO projects (title, category, description, tags, status, client, demo_url, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, category, description, tags, status, client, demo_url, sort_order]
    );
    return res.json({ id: result.insertId, ...req.body });
  }
  const newItem = { id: Date.now(), title, category, description, tags, status, client, demo_url, sort_order };
  memoryStore.projects.push(newItem);
  res.json(newItem);
});

app.put('/api/projects/:id', async (req, res) => {
  const { id } = req.params;
  const { title, category, description, tags, status, client, demo_url, sort_order } = req.body;
  const pool = getPool();
  if (pool) {
    await pool.query(
      'UPDATE projects SET title = COALESCE(?, title), category = COALESCE(?, category), description = COALESCE(?, description), tags = COALESCE(?, tags), status = COALESCE(?, status), client = COALESCE(?, client), demo_url = COALESCE(?, demo_url), sort_order = COALESCE(?, sort_order) WHERE id = ?',
      [title, category, description, tags, status, client, demo_url, sort_order, id]
    );
    return res.json({ success: true, id });
  }
  const item = memoryStore.projects.find(p => p.id === Number(id));
  if (item) Object.assign(item, req.body);
  res.json({ success: true, id });
});

app.delete('/api/projects/:id', async (req, res) => {
  const { id } = req.params;
  const pool = getPool();
  if (pool) {
    await pool.query('DELETE FROM projects WHERE id = ?', [id]);
    return res.json({ success: true, id });
  }
  memoryStore.projects = memoryStore.projects.filter(p => p.id !== Number(id));
  res.json({ success: true, id });
});

// --- 14. TEAM MEMBERS CRUD ---
app.get('/api/team', async (req, res) => {
  const pool = getPool();
  if (pool) {
    const [rows] = await pool.query('SELECT * FROM team_members ORDER BY sort_order ASC, id ASC');
    return res.json(rows);
  }
  res.json(memoryStore.team);
});

app.post('/api/team', async (req, res) => {
  const { name, role, initials, sort_order = 0 } = req.body;
  const pool = getPool();
  const init = initials || name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  if (pool) {
    const [result] = await pool.query(
      'INSERT INTO team_members (name, role, initials, sort_order) VALUES (?, ?, ?, ?)',
      [name, role, init, sort_order]
    );
    return res.json({ id: result.insertId, name, role, initials: init, sort_order, is_active: 1 });
  }
  const newItem = { id: Date.now(), name, role, initials: init, sort_order, is_active: 1 };
  memoryStore.team.push(newItem);
  res.json(newItem);
});

app.delete('/api/team/:id', async (req, res) => {
  const { id } = req.params;
  const pool = getPool();
  if (pool) {
    await pool.query('DELETE FROM team_members WHERE id = ?', [id]);
    return res.json({ success: true, id });
  }
  memoryStore.team = memoryStore.team.filter(t => t.id !== Number(id));
  res.json({ success: true, id });
});

// --- 15. IDEAS & CAPABILITIES CRUD ---
app.get('/api/ideas', async (req, res) => {
  const pool = getPool();
  if (pool) {
    const [rows] = await pool.query('SELECT * FROM ideas ORDER BY sort_order ASC');
    return res.json(rows);
  }
  res.json(memoryStore.ideas);
});

app.post('/api/ideas', async (req, res) => {
  const { title } = req.body;
  const pool = getPool();
  if (pool) {
    const [result] = await pool.query('INSERT INTO ideas (title) VALUES (?)', [title.toUpperCase()]);
    return res.json({ id: result.insertId, title: title.toUpperCase() });
  }
  const item = { id: Date.now(), title: title.toUpperCase() };
  memoryStore.ideas.push(item);
  res.json(item);
});

app.delete('/api/ideas/:id', async (req, res) => {
  const { id } = req.params;
  const pool = getPool();
  if (pool) {
    await pool.query('DELETE FROM ideas WHERE id = ?', [id]);
    return res.json({ success: true, id });
  }
  memoryStore.ideas = memoryStore.ideas.filter(i => i.id !== Number(id));
  res.json({ success: true, id });
});

// --- 16. CONTACT INQUIRIES ---
app.get('/api/inquiries', async (req, res) => {
  const pool = getPool();
  if (pool) {
    const [rows] = await pool.query('SELECT * FROM inquiries ORDER BY id DESC');
    return res.json(rows);
  }
  res.json(memoryStore.inquiries);
});

// Public contact submission from frontend
app.post('/api/inquiries', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Please provide name, email, and message.' });
  }

  const pool = getPool();
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  if (pool) {
    try {
      const [result] = await pool.query(
        'INSERT INTO inquiries (name, email, message, ip_address, status) VALUES (?, ?, ?, ?, "new")',
        [name, email, message, String(ip)]
      );
      await pool.query('INSERT INTO system_logs (service, level, message) VALUES (?, ?, ?)', [
        'public-web',
        'info',
        `New inquiry received from ${name} (${email})`
      ]);
      return res.json({ success: true, id: result.insertId, message: 'Message sent successfully!' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  const newInq = { id: Date.now(), name, email, message, status: 'new', ip_address: ip, created_at: new Date().toISOString() };
  memoryStore.inquiries.unshift(newInq);
  res.json({ success: true, id: newInq.id, message: 'Message sent successfully!' });
});

app.patch('/api/inquiries/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'read', 'replied', 'archived'
  const pool = getPool();
  if (pool) {
    await pool.query('UPDATE inquiries SET status = ? WHERE id = ?', [status, id]);
    return res.json({ success: true, id, status });
  }
  const item = memoryStore.inquiries.find(i => i.id === Number(id));
  if (item) item.status = status;
  res.json({ success: true, id, status });
});

app.delete('/api/inquiries/:id', async (req, res) => {
  const { id } = req.params;
  const pool = getPool();
  if (pool) {
    await pool.query('DELETE FROM inquiries WHERE id = ?', [id]);
    return res.json({ success: true, id });
  }
  memoryStore.inquiries = memoryStore.inquiries.filter(i => i.id !== Number(id));
  res.json({ success: true, id });
});

app.listen(PORT, () => {
  console.log(`[API Server] Running on http://127.0.0.1:${PORT}`);
});
