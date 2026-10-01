<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/db.php';

function handleSettings(string $method): void {
    $pdo = Database::getConnection();

    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT * FROM site_settings ORDER BY id ASC");
        jsonResponse($stmt->fetchAll());
    }

    $admin = requireAuth($pdo);

    if ($method === 'POST') {
        $updates = getJsonBody();
        if (empty($updates)) {
            jsonResponse(['success' => true, 'updates' => []]);
        }

        $stmt = $pdo->prepare("
            INSERT INTO site_settings (id, value, category) 
            VALUES (?, ?, ?) 
            ON DUPLICATE KEY UPDATE value = ?
        ");

        foreach ($updates as $key => $val) {
            $cat = 'general';
            if (str_starts_with($key, 'hero_')) $cat = 'hero';
            elseif (str_starts_with($key, 'about_')) $cat = 'about';
            elseif (str_starts_with($key, 'contact_') || str_starts_with($key, 'headquarters_')) $cat = 'contact';
            elseif (str_starts_with($key, 'meta_') || str_starts_with($key, 'seo_') || str_starts_with($key, 'default_og_')) $cat = 'seo';
            elseif (str_starts_with($key, 'social_')) $cat = 'social';

            $stmt->execute([(string)$key, (string)$val, $cat, (string)$val]);
        }

        logAdminActivity($pdo, $admin['name'], 'Update Settings', "Updated " . count($updates) . " site settings");

        jsonResponse([
            'success' => true,
            'updates' => $updates
        ]);
    }

    jsonError("Method not allowed", 405);
}
