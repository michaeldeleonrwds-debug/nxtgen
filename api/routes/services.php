<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/db.php';

function handleServices(string $method, ?string $id = null): void {
    $pdo = Database::getConnection();

    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT * FROM services ORDER BY sort_order ASC, id ASC");
        jsonResponse($stmt->fetchAll());
    }

    // Mutating endpoints require authentication
    $admin = requireAuth($pdo);

    if ($method === 'POST') {
        $body = getJsonBody();
        $tag = trim($body['tag'] ?? 'Services');
        $title = trim($body['title'] ?? '');
        $description = trim($body['description'] ?? '');
        $imageUrl = trim($body['image_url'] ?? 'web-mobile.webp');
        $sortOrder = (int)($body['sort_order'] ?? 0);
        $isActive = isset($body['is_active']) ? (int)(bool)$body['is_active'] : 1;

        if (!$title) {
            jsonError('Service title is required', 400);
        }

        $stmt = $pdo->prepare("INSERT INTO services (tag, title, description, image_url, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$tag, $title, $description, $imageUrl, $sortOrder, $isActive]);
        $newId = (int)$pdo->lastInsertId();

        logAdminActivity($pdo, $admin['name'], 'Create Service', "Created service: {$title} (ID: {$newId})");

        jsonResponse([
            'id' => $newId,
            'tag' => $tag,
            'title' => $title,
            'description' => $description,
            'image_url' => $imageUrl,
            'sort_order' => $sortOrder,
            'is_active' => $isActive
        ]);
    }

    if ($method === 'PUT') {
        if (!$id) {
            jsonError("Service ID required", 400);
        }
        $body = getJsonBody();
        $tag = $body['tag'] ?? null;
        $title = $body['title'] ?? null;
        $description = $body['description'] ?? null;
        $imageUrl = $body['image_url'] ?? null;
        $sortOrder = isset($body['sort_order']) ? (int)$body['sort_order'] : null;
        $isActive = isset($body['is_active']) ? (int)(bool)$body['is_active'] : null;

        $stmt = $pdo->prepare("
            UPDATE services 
            SET tag = COALESCE(?, tag),
                title = COALESCE(?, title),
                description = COALESCE(?, description),
                image_url = COALESCE(?, image_url),
                sort_order = COALESCE(?, sort_order),
                is_active = COALESCE(?, is_active)
            WHERE id = ?
        ");
        $stmt->execute([$tag, $title, $description, $imageUrl, $sortOrder, $isActive, $id]);

        logAdminActivity($pdo, $admin['name'], 'Update Service', "Updated service ID: {$id}");

        jsonResponse(['success' => true, 'id' => (int)$id]);
    }

    if ($method === 'DELETE') {
        if (!$id) {
            jsonError("Service ID required", 400);
        }
        $stmt = $pdo->prepare("DELETE FROM services WHERE id = ?");
        $stmt->execute([$id]);

        logAdminActivity($pdo, $admin['name'], 'Delete Service', "Deleted service ID: {$id}");

        jsonResponse(['success' => true, 'id' => (int)$id]);
    }

    jsonError("Method not allowed", 405);
}
