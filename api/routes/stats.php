<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/db.php';

function handleStats(): void {
    $pdo = Database::getConnection();

    // Summary counts
    $inqTotal = (int)$pdo->query("SELECT COUNT(*) FROM inquiries")->fetchColumn();
    $inqNew = (int)$pdo->query("SELECT COUNT(*) FROM inquiries WHERE status = 'new'")->fetchColumn();
    $srvCount = (int)$pdo->query("SELECT COUNT(*) FROM services")->fetchColumn();
    $srvActive = (int)$pdo->query("SELECT COUNT(*) FROM services WHERE is_active = 1")->fetchColumn();
    $revCount = (int)$pdo->query("SELECT COUNT(*) FROM client_reviews")->fetchColumn();
    $revActive = (int)$pdo->query("SELECT COUNT(*) FROM client_reviews WHERE is_active = 1")->fetchColumn();
    $projCount = (int)$pdo->query("SELECT COUNT(*) FROM projects")->fetchColumn();
    $teamCount = (int)$pdo->query("SELECT COUNT(*) FROM team_members")->fetchColumn();
    $ideasCount = (int)$pdo->query("SELECT COUNT(*) FROM ideas")->fetchColumn();

    // Recent items for dashboard widgets
    $recentInquiries = $pdo->query("SELECT id, name, email, message, status, created_at FROM inquiries ORDER BY id DESC LIMIT 5")->fetchAll();
    $recentProjects = $pdo->query("SELECT id, title, category, status, client, created_at FROM projects ORDER BY id DESC LIMIT 5")->fetchAll();
    $recentReviews = $pdo->query("SELECT id, client_name, role, rating, project, created_at FROM client_reviews ORDER BY id DESC LIMIT 5")->fetchAll();
    $recentActivity = $pdo->query("SELECT id, user_name, action, details, created_at FROM admin_activity ORDER BY id DESC LIMIT 10")->fetchAll();

    jsonResponse([
        'inquiries' => ['total' => $inqTotal, 'new' => $inqNew],
        'services' => $srvCount,
        'servicesActive' => $srvActive,
        'reviews' => $revCount,
        'reviewsActive' => $revActive,
        'projects' => $projCount,
        'team' => $teamCount,
        'ideas' => $ideasCount,
        'recentInquiries' => $recentInquiries,
        'recentProjects' => $recentProjects,
        'recentReviews' => $recentReviews,
        'recentActivity' => $recentActivity
    ]);
}
