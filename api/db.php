<?php
declare(strict_types=1);

require_once __DIR__ . '/config.php';

/**
 * PDO Database Manager & Schema Initialization for NXTGEN CMS
 */
class Database {
    private static ?PDO $instance = null;

    public static function getConnection(): PDO {
        if (self::$instance !== null) {
            return self::$instance;
        }

        $host = DB_HOST;
        $port = DB_PORT;
        $dbname = DB_NAME;
        $user = DB_USER;
        $pass = DB_PASS;

        try {
            $dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset=utf8mb4";
            self::$instance = new PDO($dsn, $user, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $e) {
            try {
                $rootDsn = "mysql:host={$host};port={$port};charset=utf8mb4";
                $rootPdo = new PDO($rootDsn, $user, $pass, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
                ]);
                $rootPdo->exec("CREATE DATABASE IF NOT EXISTS `{$dbname}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");

                self::$instance = new PDO("mysql:host={$host};port={$port};dbname={$dbname};charset=utf8mb4", $user, $pass, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]);
            } catch (PDOException $ex) {
                error_log("Database connection failure: " . $ex->getMessage());
                jsonError("Database connection failed. Please check your MySQL configuration.", 500);
            }
        }

        self::ensureSchema(self::$instance);

        return self::$instance;
    }

    private static function ensureSchema(PDO $pdo): void {
        try {
            // Drop legacy EnvKit tables if they exist
            $pdo->exec("DROP TABLE IF EXISTS stack_services;");
            $pdo->exec("DROP TABLE IF EXISTS system_logs;");

            // 1. Site Settings
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS site_settings (
                    id VARCHAR(100) PRIMARY KEY,
                    value LONGTEXT NOT NULL,
                    category VARCHAR(50) DEFAULT 'general',
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");

            // 2. Services
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS services (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    tag VARCHAR(100) NOT NULL,
                    title VARCHAR(255) NOT NULL,
                    description TEXT NOT NULL,
                    image_url TEXT,
                    is_active BOOLEAN DEFAULT TRUE,
                    sort_order INT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");

            // 3. Client Reviews
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS client_reviews (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    client_name VARCHAR(255) NOT NULL,
                    role VARCHAR(255) NOT NULL,
                    quote TEXT NOT NULL,
                    project VARCHAR(255) NOT NULL,
                    rating INT DEFAULT 5,
                    review_date VARCHAR(100) DEFAULT 'Recently',
                    avatar_url TEXT,
                    is_active BOOLEAN DEFAULT TRUE,
                    sort_order INT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");

            // 4. Projects
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS projects (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    category VARCHAR(100) NOT NULL,
                    description TEXT,
                    tags VARCHAR(255),
                    status VARCHAR(50) DEFAULT 'Live',
                    client VARCHAR(255),
                    demo_url VARCHAR(255),
                    image_url TEXT,
                    sort_order INT DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");

            // 5. Team Members
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS team_members (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    role VARCHAR(255) NOT NULL,
                    bio TEXT,
                    initials VARCHAR(10),
                    image_url TEXT,
                    social_links TEXT,
                    sort_order INT DEFAULT 0,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");

            // 6. Marquee Ideas
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS ideas (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    sort_order INT DEFAULT 0,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");

            // 7. Contact Inquiries
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS inquiries (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) NOT NULL,
                    message TEXT NOT NULL,
                    status VARCHAR(50) DEFAULT 'new',
                    ip_address VARCHAR(50) DEFAULT '127.0.0.1',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");

            // 8. Admin Users
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS admin_users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    email VARCHAR(100) NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    name VARCHAR(100) NOT NULL,
                    role VARCHAR(20) DEFAULT 'admin',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");

            // 9. Admin Sessions
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS admin_sessions (
                    token VARCHAR(128) PRIMARY KEY,
                    user_id INT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    expires_at DATETIME NOT NULL,
                    INDEX (user_id),
                    INDEX (expires_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");

            // 10. Admin Activity Logs
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS admin_activity (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_name VARCHAR(100) NOT NULL,
                    action VARCHAR(100) NOT NULL,
                    details TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");

            // Add any missing columns to existing tables safely
            self::ensureColumns($pdo);

            // Seed initial records
            self::seedDefaultsIfEmpty($pdo);
        } catch (Exception $e) {
            error_log("Schema initialization error: " . $e->getMessage());
        }
    }

    private static function ensureColumns(PDO $pdo): void {
        $columns = [
            'projects' => ['image_url' => 'TEXT NULL'],
            'team_members' => ['bio' => 'TEXT NULL', 'image_url' => 'TEXT NULL', 'social_links' => 'TEXT NULL'],
            'client_reviews' => ['avatar_url' => 'TEXT NULL'],
            'ideas' => ['created_at' => 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP']
        ];

        foreach ($columns as $table => $colDefs) {
            foreach ($colDefs as $col => $definition) {
                try {
                    $stmt = $pdo->query("SHOW COLUMNS FROM `{$table}` LIKE '{$col}'");
                    if ($stmt->rowCount() === 0) {
                        $pdo->exec("ALTER TABLE `{$table}` ADD COLUMN `{$col}` {$definition}");
                    }
                } catch (Exception $e) {
                    // ignore if table doesn't exist yet
                }
            }
        }
    }

    private static function seedDefaultsIfEmpty(PDO $pdo): void {
        // Seed default Admin User if none exists
        $adminCount = (int)$pdo->query("SELECT COUNT(*) FROM admin_users")->fetchColumn();
        if ($adminCount === 0) {
            $defaultPasswordHash = password_hash('adminpassword123', PASSWORD_BCRYPT);
            $stmt = $pdo->prepare("
                INSERT INTO admin_users (username, email, password_hash, name, role) 
                VALUES (?, ?, ?, ?, 'admin')
            ");
            $stmt->execute(['admin', 'admin@nxtgen.studio', $defaultPasswordHash, 'NXTGen Administrator']);
        }

        // Clean out any legacy EnvKit keys from site_settings
        $pdo->exec("DELETE FROM site_settings WHERE id LIKE 'server_%' OR id LIKE 'envkit_%'");

        // Seed site settings
        $stmt = $pdo->query("SELECT COUNT(*) FROM site_settings");
        if ((int)$stmt->fetchColumn() === 0) {
            $defaultSettings = [
                ['site_name', 'NXTGEN STUDIO', 'general'],
                ['site_tagline', 'Engineering Digital Reality', 'general'],
                ['site_description', 'High-performance agency engineering custom software, web platforms, and creative technology.', 'general'],
                ['meta_title', 'NXTGEN Studio — Digital Engineering & Creative Technology', 'seo'],
                ['meta_description', 'Transforming ideas into scalable digital realities. Custom software, web apps, and design engineering.', 'seo'],
                ['seo_keywords', 'Software Engineering, Web Development, Mobile Apps, UI/UX, Creative Technology, NXTGEN', 'seo'],
                ['hero_badge', 'NXTGEN STUDIO', 'hero'],
                ['hero_heading_1', "Build what's", 'hero'],
                ['hero_heading_italic', 'next', 'hero'],
                ['hero_subheading', 'Transforming ideas into scalable digital realities. We specialize in custom software, web apps, mobile solutions, and cutting-edge engineering.', 'hero'],
                ['hero_video_url', 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_074625_a81f018a-956b-43fb-9aee-4d1508e30e6a.mp4', 'hero'],
                ['hero_cta_text', 'Explore Services', 'hero'],
                ['hero_cta_url', '#services', 'hero'],
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
                ['social_instagram', 'https://instagram.com', 'social'],
                ['social_twitter', 'https://twitter.com', 'social'],
                ['social_linkedin', 'https://linkedin.com', 'social'],
                ['social_github', 'https://github.com', 'social'],
                ['social_facebook', 'https://facebook.com', 'social'],
                ['footer_brand_text', 'NXTGEN', 'general'],
                ['copyright_text', '2026 NXTGEN Company. All rights reserved.', 'general'],
                ['default_og_image', '/assets/sitelogo.webp', 'seo']
            ];
            $insert = $pdo->prepare("INSERT IGNORE INTO site_settings (id, value, category) VALUES (?, ?, ?)");
            foreach ($defaultSettings as $setting) {
                $insert->execute($setting);
            }
        }

        // Seed services
        $stmt = $pdo->query("SELECT COUNT(*) FROM services");
        if ((int)$stmt->fetchColumn() === 0) {
            $services = [
                ['Development', 'Web & Mobile Apps', 'Custom software development from the ground up. We build scalable, high-performance web applications and native mobile apps tailored to your business needs.', 'web-mobile.webp', 1],
                ['Platforms', 'CMS & No-Code', 'Empowering your digital presence with expertly crafted WordPress, Webflow, and GoHighLevel (GHL) solutions for rapid growth and easy management.', 'CMS & No code.webp', 2],
                ['Hardware', 'Arduino & IoT', 'Bridging the physical and digital worlds. We design and program custom Arduino and IoT hardware solutions for automation, prototyping, and smart devices.', 'Arduino & Iot.webp', 3],
                ['Creative', 'Design & Branding', 'From striking brand identities to intuitive user interfaces, we obsess over every pixel to deliver visual experiences that feel effortless and look extraordinary.', 'Design and Branding.webp', 4]
            ];
            $insert = $pdo->prepare("INSERT INTO services (tag, title, description, image_url, sort_order) VALUES (?, ?, ?, ?, ?)");
            foreach ($services as $svc) {
                $insert->execute($svc);
            }
        }

        // Seed reviews
        $stmt = $pdo->query("SELECT COUNT(*) FROM client_reviews");
        if ((int)$stmt->fetchColumn() === 0) {
            $reviews = [
                ['Arielle Santos', 'Founder, LaunchPad Studio', 'NxtGen turned a messy product idea into a polished platform that felt fast, premium, and ready for real users.', 'Product strategy & web platform', 5, '2 weeks ago', 1],
                ['Marco Reyes', 'Operations Lead, Northline', 'The team understood both engineering and brand experience. Every page, flow, and interaction felt intentional.', 'Operations platform', 5, '1 month ago', 2],
                ['Danica Cruz', 'Creative Director, Signal Haus', 'They gave our digital presence the kind of futuristic edge we wanted without making it hard to use.', 'Brand experience & website', 5, '2 months ago', 3]
            ];
            $insert = $pdo->prepare("INSERT INTO client_reviews (client_name, role, quote, project, rating, review_date, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)");
            foreach ($reviews as $rev) {
                $insert->execute($rev);
            }
        }

        // Seed team
        $stmt = $pdo->query("SELECT COUNT(*) FROM team_members");
        if ((int)$stmt->fetchColumn() === 0) {
            $team = [
                ['Michael de Leon', 'Full Stack Engineer & Tech Lead', 'MD', 1],
                ['Mc Denver Alba', 'Frontend & Systems Engineer', 'MA', 2],
                ['Bryl Fayosal', 'DevOps & Backend Engineer', 'BF', 3],
                ['Marc Paul Tuquilar', 'UI/UX & Creative Director', 'MT', 4]
            ];
            $insert = $pdo->prepare("INSERT INTO team_members (name, role, initials, sort_order) VALUES (?, ?, ?, ?)");
            foreach ($team as $m) {
                $insert->execute($m);
            }
        }

        // Seed ideas
        $stmt = $pdo->query("SELECT COUNT(*) FROM ideas");
        if ((int)$stmt->fetchColumn() === 0) {
            $ideas = [
                'AI', 'AUTOMATION', 'PERFORMANCE', 'SCALABILITY', 
                'DIGITAL PRODUCTS', 'WEB EXPERIENCES', 'DESIGN SYSTEMS', 
                'CREATIVE TECHNOLOGY', 'INTERACTION', 'OPTIMIZATION', 
                'SEO', 'DIGITAL MARKETING'
            ];
            $insert = $pdo->prepare("INSERT INTO ideas (title, sort_order) VALUES (?, ?)");
            foreach ($ideas as $idx => $idea) {
                $insert->execute([$idea, $idx + 1]);
            }
        }

        // Seed projects
        $stmt = $pdo->query("SELECT COUNT(*) FROM projects");
        if ((int)$stmt->fetchColumn() === 0) {
            $projects = [
                ['NXTGen Digital Ecosystem', 'Full Stack & Cloud', 'High-throughput agency platform with real-time MySQL data persistence.', 'React, TypeScript, MySQL, PHP', 'Live', 'NXTGen Core', 'https://nxtgen.test', 1],
                ['LaunchPad SaaS Portal', 'Web Application', 'Client onboarding and automated billing engine with webhook distribution.', 'PHP, MariaDB, PDO', 'Live', 'LaunchPad Studio', '#', 2],
                ['Signal Haus Creative Core', 'Design & UI System', 'Motion design token library and interactive brand visualizer.', 'Tailwind, WebGL, Framer Motion', 'Live', 'Signal Haus', '#', 3],
                ['Northline Operations Mesh', 'Internal Tooling', 'Enterprise inventory tracking with edge IoT sensor telemetry.', 'Arduino, MQTT, PHP 8.5', 'Live', 'Northline Logistics', '#', 4]
            ];
            $insert = $pdo->prepare("INSERT INTO projects (title, category, description, tags, status, client, demo_url, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            foreach ($projects as $proj) {
                $insert->execute($proj);
            }
        }
    }
}
