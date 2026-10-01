<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/db.php';

function handleHealth(): void {
    $dbOnline = false;
    try {
        $pdo = Database::getConnection();
        $pdo->query("SELECT 1");
        $dbOnline = true;
    } catch (Exception $e) {
        $dbOnline = false;
    }

    jsonResponse([
        'status' => $dbOnline ? 'healthy' : 'degraded',
        'application' => 'NXTGen Studio CMS',
        'version' => '2.0.0',
        'timestamp' => gmdate('Y-m-d\TH:i:s\Z'),
        'database' => [
            'connected' => $dbOnline,
            'engine' => 'MySQL / MariaDB (PDO)'
        ]
    ]);
}
