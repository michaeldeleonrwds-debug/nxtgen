<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/db.php';

function handleProjects(string $method, ?string $id = null): void {
    $pdo = Database::getConnection();

    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT * FROM projects ORDER BY sort_order ASC, id ASC");
        jsonResponse($stmt->fetchAll());
    }

    $admin = requireAuth($pdo);

    if ($method === 'POST') {
        $body = getJsonBody();
        $title = trim($body['title'] ?? '');
        $category = trim($body['category'] ?? '');
        $description = trim($body['description'] ?? '');
        $tags = trim($body['tags'] ?? '');
        $status = trim($body['status'] ?? 'Live');
        $client = trim($body['client'] ?? '');
        $demoUrl = trim($body['demo_url'] ?? '');
        $imageUrl = trim($body['image_url'] ?? '');
        $sortOrder = (int)($body['sort_order'] ?? 0);

        if (!$title) {
            jsonError('Project title is required', 400);
        }

        $stmt = $pdo->prepare("
            INSERT INTO projects (title, category, description, tags, status, client, demo_url, image_url, sort_order) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$title, $category, $description, $tags, $status, $client, $demoUrl, $imageUrl, $sortOrder]);
        $newId = (int)$pdo->lastInsertId();

        logAdminActivity($pdo, $admin['name'], 'Create Project', "Created project: {$title} (ID: {$newId})");

        jsonResponse(array_merge($body, ['id' => $newId]));
    }

    if ($method === 'PUT') {
        if (!$id) {
            jsonError("Project ID required", 400);
        }
        $body = getJsonBody();
        $title = $body['title'] ?? null;
        $category = $body['category'] ?? null;
        $description = $body['description'] ?? null;
        $tags = $body['tags'] ?? null;
        $status = $body['status'] ?? null;
        $client = $body['client'] ?? null;
        $demoUrl = $body['demo_url'] ?? null;
        $imageUrl = $body['image_url'] ?? null;
        $sortOrder = isset($body['sort_order']) ? (int)$body['sort_order'] : null;

        $stmt = $pdo->prepare("
            UPDATE projects 
            SET title = COALESCE(?, title),
                category = COALESCE(?, category),
                description = COALESCE(?, description),
                tags = COALESCE(?, tags),
                status = COALESCE(?, status),
                client = COALESCE(?, client),
                demo_url = COALESCE(?, demo_url),
                image_url = COALESCE(?, image_url),
                sort_order = COALESCE(?, sort_order)
            WHERE id = ?
        ");
        $stmt->execute([$title, $category, $description, $tags, $status, $client, $demoUrl, $imageUrl, $sortOrder, $id]);

        logAdminActivity($pdo, $admin['name'], 'Update Project', "Updated project ID: {$id}");

        jsonResponse(['success' => true, 'id' => (int)$id]);
    }

    if ($method === 'DELETE') {
        if (!$id) {
            jsonError("Project ID required", 400);
        }
        $stmt = $pdo->prepare("DELETE FROM projects WHERE id = ?");
        $stmt->execute([$id]);

        logAdminActivity($pdo, $admin['name'], 'Delete Project', "Deleted project ID: {$id}");

        jsonResponse(['success' => true, 'id' => (int)$id]);
    }

    jsonError("Method not allowed", 405);
}
