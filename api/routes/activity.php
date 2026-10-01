<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/db.php';

function handleActivity(): void {
    $pdo = Database::getConnection();
    requireAuth($pdo);

    $stmt = $pdo->query("SELECT * FROM admin_activity ORDER BY id DESC LIMIT 50");
    jsonResponse($stmt->fetchAll());
}
