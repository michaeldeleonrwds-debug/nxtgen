<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/db.php';

function handleIdeas(string $method, ?string $id = null): void {
    $pdo = Database::getConnection();

    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT * FROM ideas ORDER BY sort_order ASC, id ASC");
        jsonResponse($stmt->fetchAll());
    }

    $admin = requireAuth($pdo);

    if ($method === 'POST') {
        $body = getJsonBody();
        $title = strtoupper(trim($body['title'] ?? ''));
        $sortOrder = (int)($body['sort_order'] ?? 0);
        $isActive = isset($body['is_active']) ? (int)(bool)$body['is_active'] : 1;

        if (!$title) {
            jsonError("Title is required", 400);
        }

        $stmt = $pdo->prepare("INSERT INTO ideas (title, sort_order, is_active) VALUES (?, ?, ?)");
        $stmt->execute([$title, $sortOrder, $isActive]);
        $newId = (int)$pdo->lastInsertId();

        logAdminActivity($pdo, $admin['name'], 'Create Idea', "Added marquee idea: {$title} (ID: {$newId})");

        jsonResponse([
            'id' => $newId,
            'title' => $title,
            'sort_order' => $sortOrder,
            'is_active' => $isActive
        ]);
    }

    if ($method === 'PUT') {
        if (!$id) {
            jsonError("Idea ID required", 400);
        }
        $body = getJsonBody();
        $title = isset($body['title']) ? strtoupper(trim($body['title'])) : null;
        $sortOrder = isset($body['sort_order']) ? (int)$body['sort_order'] : null;
        $isActive = isset($body['is_active']) ? (int)(bool)$body['is_active'] : null;

        $stmt = $pdo->prepare("
            UPDATE ideas 
            SET title = COALESCE(?, title),
                sort_order = COALESCE(?, sort_order),
                is_active = COALESCE(?, is_active)
            WHERE id = ?
        ");
        $stmt->execute([$title, $sortOrder, $isActive, $id]);

        logAdminActivity($pdo, $admin['name'], 'Update Idea', "Updated marquee idea ID: {$id}");

        jsonResponse(['success' => true, 'id' => (int)$id]);
    }

    if ($method === 'DELETE') {
        if (!$id) {
            jsonError("Idea ID required", 400);
        }
        $stmt = $pdo->prepare("DELETE FROM ideas WHERE id = ?");
        $stmt->execute([$id]);

        logAdminActivity($pdo, $admin['name'], 'Delete Idea', "Deleted marquee idea ID: {$id}");

        jsonResponse(['success' => true, 'id' => (int)$id]);
    }

    jsonError("Method not allowed", 405);
}
