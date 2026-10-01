<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/db.php';

function handleTeam(string $method, ?string $id = null): void {
    $pdo = Database::getConnection();

    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT * FROM team_members ORDER BY sort_order ASC, id ASC");
        jsonResponse($stmt->fetchAll());
    }

    $admin = requireAuth($pdo);

    if ($method === 'POST') {
        $body = getJsonBody();
        $name = trim($body['name'] ?? '');
        $role = trim($body['role'] ?? '');
        $bio = trim($body['bio'] ?? '');
        $imageUrl = trim($body['image_url'] ?? '');
        $socialLinks = is_array($body['social_links'] ?? null) ? json_encode($body['social_links']) : ($body['social_links'] ?? null);
        $sortOrder = (int)($body['sort_order'] ?? 0);
        $isActive = isset($body['is_active']) ? (int)(bool)$body['is_active'] : 1;

        if (!$name || !$role) {
            jsonError('Name and role are required', 400);
        }

        // Generate initials if not provided
        $initials = trim($body['initials'] ?? '');
        if (!$initials && $name) {
            $words = explode(' ', $name);
            $initials = '';
            foreach ($words as $w) {
                if ($w !== '') {
                    $initials .= mb_substr($w, 0, 1);
                }
            }
            $initials = mb_substr(strtoupper($initials), 0, 2);
        }

        $stmt = $pdo->prepare("
            INSERT INTO team_members (name, role, bio, initials, image_url, social_links, sort_order, is_active) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$name, $role, $bio, $initials, $imageUrl, $socialLinks, $sortOrder, $isActive]);
        $newId = (int)$pdo->lastInsertId();

        logAdminActivity($pdo, $admin['name'], 'Create Team Member', "Added team member: {$name} (ID: {$newId})");

        jsonResponse([
            'id' => $newId,
            'name' => $name,
            'role' => $role,
            'bio' => $bio,
            'initials' => $initials,
            'image_url' => $imageUrl,
            'social_links' => $socialLinks,
            'sort_order' => $sortOrder,
            'is_active' => $isActive
        ]);
    }

    if ($method === 'PUT') {
        if (!$id) {
            jsonError("Team member ID required", 400);
        }
        $body = getJsonBody();
        $name = $body['name'] ?? null;
        $role = $body['role'] ?? null;
        $bio = $body['bio'] ?? null;
        $initials = $body['initials'] ?? null;
        $imageUrl = $body['image_url'] ?? null;
        $socialLinks = is_array($body['social_links'] ?? null) ? json_encode($body['social_links']) : ($body['social_links'] ?? null);
        $sortOrder = isset($body['sort_order']) ? (int)$body['sort_order'] : null;
        $isActive = isset($body['is_active']) ? (int)(bool)$body['is_active'] : null;

        $stmt = $pdo->prepare("
            UPDATE team_members 
            SET name = COALESCE(?, name),
                role = COALESCE(?, role),
                bio = COALESCE(?, bio),
                initials = COALESCE(?, initials),
                image_url = COALESCE(?, image_url),
                social_links = COALESCE(?, social_links),
                sort_order = COALESCE(?, sort_order),
                is_active = COALESCE(?, is_active)
            WHERE id = ?
        ");
        $stmt->execute([$name, $role, $bio, $initials, $imageUrl, $socialLinks, $sortOrder, $isActive, $id]);

        logAdminActivity($pdo, $admin['name'], 'Update Team Member', "Updated team member ID: {$id}");

        jsonResponse(['success' => true, 'id' => (int)$id]);
    }

    if ($method === 'DELETE') {
        if (!$id) {
            jsonError("Team member ID required", 400);
        }
        $stmt = $pdo->prepare("DELETE FROM team_members WHERE id = ?");
        $stmt->execute([$id]);

        logAdminActivity($pdo, $admin['name'], 'Delete Team Member', "Deleted team member ID: {$id}");

        jsonResponse(['success' => true, 'id' => (int)$id]);
    }

    jsonError("Method not allowed", 405);
}
