import mysql from 'mysql2/promise';

const DB_CONFIG = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'nxtgen_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool = null;
let isConnected = false;

// Fallback in-memory store in case MySQL is temporarily down during stack restarts
const memoryStore = {
  settings: {},
  services: [],
  reviews: [],
  projects: [],
  team: [],
  ideas: [],
  inquiries: [],
  stack_services: [],
  logs: []
};

export async function initDatabase() {
  try {
    // 1. Connect without database to ensure DB exists
    const rootConn = await mysql.createConnection({
      host: DB_CONFIG.host,
      port: DB_CONFIG.port,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password
    });

    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_CONFIG.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await rootConn.end();

    // 2. Create connection pool
    pool = mysql.createPool(DB_CONFIG);

    // 3. Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id VARCHAR(100) PRIMARY KEY,
        value LONGTEXT NOT NULL,
        category VARCHAR(50) DEFAULT 'general',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tag VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        image_url TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS client_reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        client_name VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL,
        quote TEXT NOT NULL,
        project VARCHAR(255) NOT NULL,
        rating INT DEFAULT 5,
        review_date VARCHAR(100) DEFAULT 'Recently',
        is_active BOOLEAN DEFAULT TRUE,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT,
        tags VARCHAR(255),
        status VARCHAR(50) DEFAULT 'Live',
        client VARCHAR(255),
        demo_url VARCHAR(255),
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS team_members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL,
        initials VARCHAR(10),
        sort_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS ideas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        sort_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS inquiries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'new',
        ip_address VARCHAR(50) DEFAULT '127.0.0.1',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS stack_services (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        subtitle VARCHAR(255),
        status VARCHAR(50) NOT NULL,
        port VARCHAR(100),
        version VARCHAR(50),
        category VARCHAR(50),
        actions JSON,
        sort_order INT DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS system_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        service VARCHAR(50) NOT NULL,
        level VARCHAR(20) DEFAULT 'info',
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Seed initial default data if empty
    await seedDefaults(pool);

    isConnected = true;
    console.log(`[MySQL] Connected successfully to database: ${DB_CONFIG.database} on ${DB_CONFIG.host}:${DB_CONFIG.port}`);
    return pool;
  } catch (err) {
    console.warn(`[MySQL Warning] Could not connect to MySQL server at ${DB_CONFIG.host}:${DB_CONFIG.port}:`, err.message);
    console.warn('[MySQL Warning] Falling back to high-fidelity synchronized in-memory database.');
    isConnected = false;
    seedMemoryDefaults();
    return null;
  }
}

async function seedDefaults(p) {
  // Check settings
  const [settings] = await p.query('SELECT COUNT(*) as cnt FROM site_settings');
  if (settings[0].cnt === 0) {
    const defaultSettings = [
      ['hero_badge', 'NXTGEN STUDIO', 'hero'],
      ['hero_heading_1', "Build what's", 'hero'],
      ['hero_heading_italic', 'next', 'hero'],
      ['hero_subheading', 'Transforming ideas into scalable digital realities. We specialize in custom software, web apps, mobile solutions, and cutting-edge engineering.', 'hero'],
      ['hero_video_url', 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_074625_a81f018a-956b-43fb-9aee-4d1508e30e6a.mp4', 'hero'],
      ['about_tagline', 'ABOUT US', 'about'],
      ['about_heading_part1', 'Engineering', 'about'],
      ['about_heading_italic1', 'solutions', 'about'],
      ['about_heading_part2', 'for brands that', 'about'],
      ['about_heading_italic2', 'innovate, scale, and lead.', 'about'],
      ['about_video_url', 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260402_054547_9875cfc5-155a-4229-8ec8-b7ba7125cbf8.mp4', 'about'],
      ['about_approach_text', 'We believe in the power of cutting-edge technology. Every project starts with a complex problem, and every line of code opens a new door to digital transformation.', 'about'],
      ['contact_email', 'hello@nxtgen.studio', 'contact'],
      ['contact_phone', '+63 917 123 4567', 'contact'],
      ['headquarters_line1', 'Cauayan City,', 'contact'],
      ['headquarters_line2', 'Cagayan Valley, Philippines', 'contact'],
      ['footer_brand_text', 'NXTGEN', 'general'],
      ['server_webserver_choice', 'nginx', 'stack'],
      ['server_php_version', '8.5.9', 'stack']
    ];

    for (const [k, v, cat] of defaultSettings) {
      await p.query('INSERT IGNORE INTO site_settings (id, value, category) VALUES (?, ?, ?)', [k, v, cat]);
    }
  }

  // Check services
  const [srvCount] = await p.query('SELECT COUNT(*) as cnt FROM services');
  if (srvCount[0].cnt === 0) {
    const services = [
      ['Development', 'Web & Mobile Apps', 'Custom software development from the ground up. We build scalable, high-performance web applications and native mobile apps tailored to your business needs.', 'web-mobile.webp', 1],
      ['Platforms', 'CMS & No-Code', 'Empowering your digital presence with expertly crafted WordPress, Webflow, and GoHighLevel (GHL) solutions for rapid growth and easy management.', 'CMS & No code.webp', 2],
      ['Hardware', 'Arduino & IoT', 'Bridging the physical and digital worlds. We design and program custom Arduino and IoT hardware solutions for automation, prototyping, and smart devices.', 'Arduino & Iot.webp', 3],
      ['Creative', 'Design & Branding', 'From striking brand identities to intuitive user interfaces, we obsess over every pixel to deliver visual experiences that feel effortless and look extraordinary.', 'Design and Branding.webp', 4]
    ];
    for (const [tag, title, desc, img, order] of services) {
      await p.query('INSERT INTO services (tag, title, description, image_url, sort_order) VALUES (?, ?, ?, ?, ?)', [tag, title, desc, img, order]);
    }
  }

  // Check reviews
  const [revCount] = await p.query('SELECT COUNT(*) as cnt FROM client_reviews');
  if (revCount[0].cnt === 0) {
    const reviews = [
      ['Arielle Santos', 'Founder, LaunchPad Studio', 'NxtGen turned a messy product idea into a polished platform that felt fast, premium, and ready for real users.', 'Product strategy & web platform', 5, '2 weeks ago', 1],
      ['Marco Reyes', 'Operations Lead, Northline', 'The team understood both engineering and brand experience. Every page, flow, and interaction felt intentional.', 'Operations platform', 5, '1 month ago', 2],
      ['Danica Cruz', 'Creative Director, Signal Haus', 'They gave our digital presence the kind of futuristic edge we wanted without making it hard to use.', 'Brand experience & website', 5, '2 months ago', 3]
    ];
    for (const [name, role, quote, proj, rating, date, order] of reviews) {
      await p.query('INSERT INTO client_reviews (client_name, role, quote, project, rating, review_date, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)', [name, role, quote, proj, rating, date, order]);
    }
  }

  // Check team
  const [teamCount] = await p.query('SELECT COUNT(*) as cnt FROM team_members');
  if (teamCount[0].cnt === 0) {
    const team = [
      ['Michael de Leon', 'Full Stack Engineer & Tech Lead', 'MD', 1],
      ['Mc Denver Alba', 'Frontend & Systems Engineer', 'MA', 2],
      ['Bryl Fayosal', 'DevOps & Backend Engineer', 'BF', 3],
      ['Marc Paul Tuquilar', 'UI/UX & Creative Director', 'MT', 4]
    ];
    for (const [name, role, initials, order] of team) {
      await p.query('INSERT INTO team_members (name, role, initials, sort_order) VALUES (?, ?, ?, ?)', [name, role, initials, order]);
    }
  }

  // Check ideas
  const [ideasCount] = await p.query('SELECT COUNT(*) as cnt FROM ideas');
  if (ideasCount[0].cnt === 0) {
    const ideas = [
      'AI', 'AUTOMATION', 'PERFORMANCE', 'SCALABILITY', 
      'DIGITAL PRODUCTS', 'WEB EXPERIENCES', 'DESIGN SYSTEMS', 
      'CREATIVE TECHNOLOGY', 'INTERACTION', 'OPTIMIZATION', 
      'SEO', 'DIGITAL MARKETING'
    ];
    for (let i = 0; i < ideas.length; i++) {
      await p.query('INSERT INTO ideas (title, sort_order) VALUES (?, ?)', [ideas[i], i + 1]);
    }
  }

  // Check projects
  const [projCount] = await p.query('SELECT COUNT(*) as cnt FROM projects');
  if (projCount[0].cnt === 0) {
    const projects = [
      ['NXTGen Digital Ecosystem', 'Full Stack & Cloud', 'High-throughput agency platform with real-time stack monitoring and MySQL data persistence.', 'React, TypeScript, MySQL, Nginx', 'Live', 'NXTGen Core', 'https://nxtgen.test', 1],
      ['LaunchPad SaaS Portal', 'Web Application', 'Client onboarding and automated billing engine with webhook distribution.', 'Node.js, MariaDB, Docker', 'Live', 'LaunchPad Studio', '#', 2],
      ['Signal Haus Creative Core', 'Design & UI System', 'Motion design token library and interactive brand visualizer.', 'Tailwind, WebGL, Framer Motion', 'Live', 'Signal Haus', '#', 3],
      ['Northline Operations Mesh', 'Internal Tooling', 'Enterprise inventory tracking with edge IoT sensor telemetry.', 'Arduino, MQTT, PHP 8.5', 'Live', 'Northline Logistics', '#', 4]
    ];
    for (const [title, cat, desc, tags, status, client, demo, order] of projects) {
      await p.query('INSERT INTO projects (title, category, description, tags, status, client, demo_url, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [title, cat, desc, tags, status, client, demo, order]);
    }
  }

  // Check inquiries
  const [inqCount] = await p.query('SELECT COUNT(*) as cnt FROM inquiries');
  if (inqCount[0].cnt === 0) {
    await p.query(`
      INSERT INTO inquiries (name, email, message, status) VALUES 
      ('Sophia Chen', 'sophia@venturelab.io', 'Looking to build a next-gen dashboard for our distributed microservices. Love the design!', 'new'),
      ('David Miller', 'david@nexussolutions.co', 'Inquiring regarding custom ERP integration and database migration to MySQL 11.8.', 'read')
    `);
  }

  // Check stack services
  const [stackCount] = await p.query('SELECT COUNT(*) as cnt FROM stack_services');
  if (stackCount[0].cnt === 0) {
    const stack = [
      ['nginx', 'Nginx', 'Primary web server with SSL vhosts and reverse proxy', 'Running', '80 · SSL 443', 'v1.28.0', 'web', 1],
      ['apache', 'Apache', 'Alternative web server (httpd) — switchable with nginx', 'Stopped', '—', 'v2.4.68', 'web', 2],
      ['php', 'PHP', 'PHP runtime — multiple versions side by side (FPM)', 'Running', '9000', 'v8.5.9', 'runtime', 3],
      ['mariadb', 'MariaDB / MySQL', 'MySQL-compatible relational database with InnoDB engine', 'Running', '3306', 'v11.8.2', 'database', 4],
      ['minio', 'MinIO', 'S3-compatible object storage server with web console', 'Stopped', '9500 · UI 9501', 'vlatest', 'storage', 5],
      ['node', 'Node.js Engine', 'Backend API runtime powering dynamic admin queries', 'Running', '5000', 'v26.7.0', 'runtime', 6]
    ];
    for (const [id, name, sub, st, pt, ver, cat, ord] of stack) {
      await p.query('INSERT INTO stack_services (id, name, subtitle, status, port, version, category, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [id, name, sub, st, pt, ver, cat, ord]);
    }
  }

  // Insert initial system log
  await p.query(`
    INSERT INTO system_logs (service, level, message) VALUES 
    ('system', 'info', 'Database and stack services initialized successfully.'),
    ('nginx', 'info', 'Nginx v1.28.0 listening on ports 80, 443 (SSL).'),
    ('mysql', 'info', 'MariaDB 11.8.2 listening on 127.0.0.1:3306.')
  `);
}

function seedMemoryDefaults() {
  // Populate fallback memory store
  memoryStore.services = [
    { id: 1, tag: 'Development', title: 'Web & Mobile Apps', description: 'Custom software development from the ground up. We build scalable, high-performance web applications and native mobile apps tailored to your business needs.', image_url: 'web-mobile.webp', is_active: 1, sort_order: 1 },
    { id: 2, tag: 'Platforms', title: 'CMS & No-Code', description: 'Empowering your digital presence with expertly crafted WordPress, Webflow, and GoHighLevel (GHL) solutions for rapid growth and easy management.', image_url: 'CMS & No code.webp', is_active: 1, sort_order: 2 },
    { id: 3, tag: 'Hardware', title: 'Arduino & IoT', description: 'Bridging the physical and digital worlds. We design and program custom Arduino and IoT hardware solutions for automation, prototyping, and smart devices.', image_url: 'Arduino & Iot.webp', is_active: 1, sort_order: 3 },
    { id: 4, tag: 'Creative', title: 'Design & Branding', description: 'From striking brand identities to intuitive user interfaces, we obsess over every pixel to deliver visual experiences that feel effortless and look extraordinary.', image_url: 'Design and Branding.webp', is_active: 1, sort_order: 4 }
  ];
  memoryStore.reviews = [
    { id: 1, client_name: 'Arielle Santos', role: 'Founder, LaunchPad Studio', quote: 'NxtGen turned a messy product idea into a polished platform that felt fast, premium, and ready for real users.', project: 'Product strategy & web platform', rating: 5, review_date: '2 weeks ago', is_active: 1, sort_order: 1 },
    { id: 2, client_name: 'Marco Reyes', role: 'Operations Lead, Northline', quote: 'The team understood both engineering and brand experience. Every page, flow, and interaction felt intentional.', project: 'Operations platform', rating: 5, review_date: '1 month ago', is_active: 1, sort_order: 2 },
    { id: 3, client_name: 'Danica Cruz', role: 'Creative Director, Signal Haus', quote: 'They gave our digital presence the kind of futuristic edge we wanted without making it hard to use.', project: 'Brand experience & website', rating: 5, review_date: '2 months ago', is_active: 1, sort_order: 3 }
  ];
  memoryStore.team = [
    { id: 1, name: 'Michael de Leon', role: 'Full Stack Engineer & Tech Lead', initials: 'MD', sort_order: 1, is_active: 1 },
    { id: 2, name: 'Mc Denver Alba', role: 'Frontend & Systems Engineer', initials: 'MA', sort_order: 2, is_active: 1 },
    { id: 3, name: 'Bryl Fayosal', role: 'DevOps & Backend Engineer', initials: 'BF', sort_order: 3, is_active: 1 },
    { id: 4, name: 'Marc Paul Tuquilar', role: 'UI/UX & Creative Director', initials: 'MT', sort_order: 4, is_active: 1 }
  ];
  memoryStore.ideas = [
    { id: 1, title: 'AI' }, { id: 2, title: 'AUTOMATION' }, { id: 3, title: 'PERFORMANCE' }, { id: 4, title: 'SCALABILITY' },
    { id: 5, title: 'DIGITAL PRODUCTS' }, { id: 6, title: 'WEB EXPERIENCES' }, { id: 7, title: 'DESIGN SYSTEMS' },
    { id: 8, title: 'CREATIVE TECHNOLOGY' }, { id: 9, title: 'INTERACTION' }, { id: 10, title: 'OPTIMIZATION' },
    { id: 11, title: 'SEO' }, { id: 12, title: 'DIGITAL MARKETING' }
  ];
  memoryStore.projects = [
    { id: 1, title: 'NXTGen Digital Ecosystem', category: 'Full Stack & Cloud', description: 'High-throughput agency platform with real-time stack monitoring and MySQL data persistence.', tags: 'React, TypeScript, MySQL, Nginx', status: 'Live', client: 'NXTGen Core', demo_url: 'https://nxtgen.test', sort_order: 1 },
    { id: 2, title: 'LaunchPad SaaS Portal', category: 'Web Application', description: 'Client onboarding and automated billing engine with webhook distribution.', tags: 'Node.js, MariaDB, Docker', status: 'Live', client: 'LaunchPad Studio', demo_url: '#', sort_order: 2 },
    { id: 3, title: 'Signal Haus Creative Core', category: 'Design & UI System', description: 'Motion design token library and interactive brand visualizer.', tags: 'Tailwind, WebGL, Framer Motion', status: 'Live', client: 'Signal Haus', demo_url: '#', sort_order: 3 },
    { id: 4, title: 'Northline Operations Mesh', category: 'Internal Tooling', description: 'Enterprise inventory tracking with edge IoT sensor telemetry.', tags: 'Arduino, MQTT, PHP 8.5', status: 'Live', client: 'Northline Logistics', demo_url: '#', sort_order: 4 }
  ];
  memoryStore.inquiries = [
    { id: 1, name: 'Sophia Chen', email: 'sophia@venturelab.io', message: 'Looking to build a next-gen dashboard for our distributed microservices. Love the design!', status: 'new', created_at: new Date().toISOString() },
    { id: 2, name: 'David Miller', email: 'david@nexussolutions.co', message: 'Inquiring regarding custom ERP integration and database migration to MySQL 11.8.', status: 'read', created_at: new Date().toISOString() }
  ];
  memoryStore.stack_services = [
    { id: 'nginx', name: 'Nginx', subtitle: 'Primary web server with SSL vhosts and reverse proxy', status: 'Running', port: '80 · SSL 443', version: 'v1.28.0', category: 'web', sort_order: 1 },
    { id: 'apache', name: 'Apache', subtitle: 'Alternative web server (httpd) — switchable with nginx', status: 'Stopped', port: '—', version: 'v2.4.68', category: 'web', sort_order: 2 },
    { id: 'php', name: 'PHP', subtitle: 'PHP runtime — multiple versions side by side (FPM)', status: 'Running', port: '9000', version: 'v8.5.9', category: 'runtime', sort_order: 3 },
    { id: 'mariadb', name: 'MariaDB / MySQL', subtitle: 'MySQL-compatible relational database with InnoDB engine', status: 'Running', port: '3306', version: 'v11.8.2', category: 'database', sort_order: 4 },
    { id: 'minio', name: 'MinIO', subtitle: 'S3-compatible object storage server with web console', status: 'Stopped', port: '9500 · UI 9501', version: 'vlatest', category: 'storage', sort_order: 5 },
    { id: 'node', name: 'Node.js Engine', subtitle: 'Backend API runtime powering dynamic admin queries', status: 'Running', port: '5000', version: 'v26.7.0', category: 'runtime', sort_order: 6 }
  ];
  memoryStore.settings = {
    hero_badge: 'NXTGEN STUDIO',
    hero_heading_1: "Build what's",
    hero_heading_italic: 'next',
    hero_subheading: 'Transforming ideas into scalable digital realities. We specialize in custom software, web apps, mobile solutions, and cutting-edge engineering.',
    hero_video_url: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_074625_a81f018a-956b-43fb-9aee-4d1508e30e6a.mp4',
    about_tagline: 'ABOUT US',
    about_heading_part1: 'Engineering',
    about_heading_italic1: 'solutions',
    about_heading_part2: 'for brands that',
    about_heading_italic2: 'innovate, scale, and lead.',
    about_video_url: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260402_054547_9875cfc5-155a-4229-8ec8-b7ba7125cbf8.mp4',
    about_approach_text: 'We believe in the power of cutting-edge technology. Every project starts with a complex problem, and every line of code opens a new door to digital transformation.',
    contact_email: 'hello@nxtgen.studio',
    contact_phone: '+63 917 123 4567',
    headquarters_line1: 'Cauayan City,',
    headquarters_line2: 'Cagayan Valley, Philippines',
    footer_brand_text: 'NXTGEN',
    server_webserver_choice: 'nginx',
    server_php_version: '8.5.9'
  };
}

export function getPool() {
  return pool;
}

export function getDatabaseStatus() {
  return {
    connected: isConnected,
    type: isConnected ? 'MariaDB / MySQL (11.8.2)' : 'Memory Mirror',
    host: DB_CONFIG.host,
    port: DB_CONFIG.port,
    database: DB_CONFIG.database,
    user: DB_CONFIG.user
  };
}

export { memoryStore };
