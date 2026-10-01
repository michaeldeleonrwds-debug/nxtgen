<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/db.php';

function handleContent(): void {
    $pdo = Database::getConnection();

    // Fetch site settings mapped as key => value
    $settingsStmt = $pdo->query("SELECT id, value FROM site_settings");
    $settings = [];
    while ($row = $settingsStmt->fetch()) {
        $settings[$row['id']] = $row['value'];
    }

    // Fetch active services
    $servicesStmt = $pdo->query("SELECT * FROM services WHERE is_active = 1 ORDER BY sort_order ASC, id ASC");
    $services = $servicesStmt->fetchAll();

    // Fetch active reviews
    $reviewsStmt = $pdo->query("SELECT * FROM client_reviews WHERE is_active = 1 ORDER BY sort_order ASC, id ASC");
    $reviews = $reviewsStmt->fetchAll();

    // Fetch projects
    $projectsStmt = $pdo->query("SELECT * FROM projects ORDER BY sort_order ASC, id ASC");
    $projects = $projectsStmt->fetchAll();

    // Fetch team members
    $teamStmt = $pdo->query("SELECT * FROM team_members WHERE is_active = 1 ORDER BY sort_order ASC, id ASC");
    $team = $teamStmt->fetchAll();

    // Fetch ideas mapped as string array
    $ideasStmt = $pdo->query("SELECT title FROM ideas WHERE is_active = 1 ORDER BY sort_order ASC, id ASC");
    $ideas = $ideasStmt->fetchAll(PDO::FETCH_COLUMN);

    jsonResponse([
        'settings' => $settings,
        'services' => $services,
        'reviews' => $reviews,
        'projects' => $projects,
        'team' => $team,
        'ideas' => $ideas
    ]);
}
