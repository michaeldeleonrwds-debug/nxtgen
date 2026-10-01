<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/db.php';

function handleInquiries(string $method, ?string $id = null): void {
    $pdo = Database::getConnection();

    // PUBLIC: Submit inquiry from website contact form
    if ($method === 'POST') {
        $body = getJsonBody();
        $name = trim($body['name'] ?? '');
        $email = trim($body['email'] ?? '');
        $message = trim($body['message'] ?? '');

        if (!$name || !$email || !$message) {
            jsonError('Please provide name, email, and message.', 400);
        }

        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? ($_SERVER['REMOTE_ADDR'] ?? '127.0.0.1');
        if (str_contains($ip, ',')) {
            $ip = trim(explode(',', $ip)[0]);
        }

        $stmt = $pdo->prepare("INSERT INTO inquiries (name, email, message, ip_address, status) VALUES (?, ?, ?, ?, 'new')");
        $stmt->execute([$name, $email, $message, $ip]);
        $newId = (int)$pdo->lastInsertId();

        jsonResponse([
            'success' => true,
            'id' => $newId,
            'message' => 'Message sent successfully! We will get back to you shortly.'
        ]);
    }

    // Administrative actions require authentication
    $admin = requireAuth($pdo);

    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT * FROM inquiries ORDER BY id DESC");
        jsonResponse($stmt->fetchAll());
    }

    if ($method === 'PATCH') {
        if (!$id) {
            jsonError("Inquiry ID required", 400);
        }
        $body = getJsonBody();
        $status = trim($body['status'] ?? 'read');

        $stmt = $pdo->prepare("UPDATE inquiries SET status = ? WHERE id = ?");
        $stmt->execute([$status, $id]);

        logAdminActivity($pdo, $admin['name'], 'Update Inquiry', "Marked inquiry #{$id} as '{$status}'");

        jsonResponse([
            'success' => true,
            'id' => (int)$id,
            'status' => $status
        ]);
    }

    if ($method === 'DELETE') {
        if (!$id) {
            jsonError("Inquiry ID required", 400);
        }
        $stmt = $pdo->prepare("DELETE FROM inquiries WHERE id = ?");
        $stmt->execute([$id]);

        logAdminActivity($pdo, $admin['name'], 'Delete Inquiry', "Deleted inquiry #{$id}");

        jsonResponse(['success' => true, 'id' => (int)$id]);
    }

    jsonError("Method not allowed", 405);
}
