<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/db.php';

function handleReviews(string $method, ?string $id = null): void {
    $pdo = Database::getConnection();

    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT * FROM client_reviews ORDER BY sort_order ASC, id ASC");
        jsonResponse($stmt->fetchAll());
    }

    $admin = requireAuth($pdo);

    if ($method === 'POST') {
        $body = getJsonBody();
        $clientName = trim($body['client_name'] ?? '');
        $role = trim($body['role'] ?? '');
        $quote = trim($body['quote'] ?? '');
        $project = trim($body['project'] ?? '');
        $rating = (int)($body['rating'] ?? 5);
        $reviewDate = trim($body['review_date'] ?? 'Recently');
        $avatarUrl = trim($body['avatar_url'] ?? '');
        $sortOrder = (int)($body['sort_order'] ?? 0);
        $isActive = isset($body['is_active']) ? (int)(bool)$body['is_active'] : 1;

        if (!$clientName || !$quote) {
            jsonError('Client name and testimonial quote are required', 400);
        }

        $stmt = $pdo->prepare("
            INSERT INTO client_reviews (client_name, role, quote, project, rating, review_date, avatar_url, sort_order, is_active) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$clientName, $role, $quote, $project, $rating, $reviewDate, $avatarUrl, $sortOrder, $isActive]);
        $newId = (int)$pdo->lastInsertId();

        logAdminActivity($pdo, $admin['name'], 'Create Review', "Created review from {$clientName} (ID: {$newId})");

        jsonResponse(array_merge($body, ['id' => $newId, 'is_active' => $isActive]));
    }

    if ($method === 'PUT') {
        if (!$id) {
            jsonError("Review ID required", 400);
        }
        $body = getJsonBody();
        $clientName = $body['client_name'] ?? null;
        $role = $body['role'] ?? null;
        $quote = $body['quote'] ?? null;
        $project = $body['project'] ?? null;
        $rating = isset($body['rating']) ? (int)$body['rating'] : null;
        $reviewDate = $body['review_date'] ?? null;
        $avatarUrl = $body['avatar_url'] ?? null;
        $isActive = isset($body['is_active']) ? (int)(bool)$body['is_active'] : null;
        $sortOrder = isset($body['sort_order']) ? (int)$body['sort_order'] : null;

        $stmt = $pdo->prepare("
            UPDATE client_reviews 
            SET client_name = COALESCE(?, client_name),
                role = COALESCE(?, role),
                quote = COALESCE(?, quote),
                project = COALESCE(?, project),
                rating = COALESCE(?, rating),
                review_date = COALESCE(?, review_date),
                avatar_url = COALESCE(?, avatar_url),
                is_active = COALESCE(?, is_active),
                sort_order = COALESCE(?, sort_order)
            WHERE id = ?
        ");
        $stmt->execute([$clientName, $role, $quote, $project, $rating, $reviewDate, $avatarUrl, $isActive, $sortOrder, $id]);

        logAdminActivity($pdo, $admin['name'], 'Update Review', "Updated review ID: {$id}");

        jsonResponse(['success' => true, 'id' => (int)$id]);
    }

    if ($method === 'DELETE') {
        if (!$id) {
            jsonError("Review ID required", 400);
        }
        $stmt = $pdo->prepare("DELETE FROM client_reviews WHERE id = ?");
        $stmt->execute([$id]);

        logAdminActivity($pdo, $admin['name'], 'Delete Review', "Deleted review ID: {$id}");

        jsonResponse(['success' => true, 'id' => (int)$id]);
    }

    jsonError("Method not allowed", 405);
}
