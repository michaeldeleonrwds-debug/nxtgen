<?php
declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

// Route handlers
require_once __DIR__ . '/routes/health.php';
require_once __DIR__ . '/routes/stats.php';
require_once __DIR__ . '/routes/content.php';
require_once __DIR__ . '/routes/services.php';
require_once __DIR__ . '/routes/reviews.php';
require_once __DIR__ . '/routes/projects.php';
require_once __DIR__ . '/routes/team.php';
require_once __DIR__ . '/routes/ideas.php';
require_once __DIR__ . '/routes/settings.php';
require_once __DIR__ . '/routes/inquiries.php';
require_once __DIR__ . '/routes/auth.php';
require_once __DIR__ . '/routes/upload.php';
require_once __DIR__ . '/routes/activity.php';

// Support Method Override header
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method === 'POST' && isset($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'])) {
    $method = strtoupper($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE']);
}

// Parse URL path
$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$path = parse_url($requestUri, PHP_URL_PATH);
$path = trim($path, '/');

// Strip leading 'api/'
if (str_starts_with($path, 'api/')) {
    $path = substr($path, 4);
} elseif ($path === 'api') {
    $path = '';
}

// Split path segments
$segments = $path === '' ? [] : explode('/', $path);

$resource = $segments[0] ?? '';
$param1 = $segments[1] ?? null;
$param2 = $segments[2] ?? null;

// Pure NXTGEN Application Router (Zero EnvKit/Stack Infrastructure)
try {
    switch ($resource) {
        case '':
        case 'health':
            handleHealth();
            break;

        case 'stats':
            handleStats();
            break;

        case 'content':
            handleContent();
            break;

        case 'auth':
            handleAuth($method, $param1);
            break;

        case 'upload':
            handleUpload();
            break;

        case 'activity':
            handleActivity();
            break;

        case 'services':
            handleServices($method, $param1);
            break;

        case 'reviews':
            handleReviews($method, $param1);
            break;

        case 'projects':
            handleProjects($method, $param1);
            break;

        case 'team':
            handleTeam($method, $param1);
            break;

        case 'ideas':
            handleIdeas($method, $param1);
            break;

        case 'settings':
            handleSettings($method);
            break;

        case 'inquiries':
            handleInquiries($method, $param1);
            break;

        default:
            jsonError("Endpoint not found: /api/{$path}", 404);
            break;
    }
} catch (Throwable $e) {
    error_log("Unhandled API Exception: " . $e->getMessage() . "\n" . $e->getTraceAsString());
    jsonError("Internal Server Error: " . $e->getMessage(), 500);
}
