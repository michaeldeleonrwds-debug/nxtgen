<?php
declare(strict_types=1);

// Prevent error leaks in production JSON responses
ini_set('display_errors', '0');
error_reporting(E_ALL);

// Load .env file if present in project root or api folder
$envPaths = [dirname(__DIR__) . '/.env', __DIR__ . '/.env'];
foreach ($envPaths as $envFile) {
    if (file_exists($envFile)) {
        $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#')) {
                continue;
            }
            if (str_contains($line, '=')) {
                [$key, $val] = explode('=', $line, 2);
                $key = trim($key);
                $val = trim($val, " \t\n\r\0\x0B\"'");
                if (!isset($_SERVER[$key]) && !isset($_ENV[$key])) {
                    putenv("{$key}={$val}");
                    $_ENV[$key] = $val;
                    $_SERVER[$key] = $val;
                }
            }
        }
        break;
    }
}

// Database Credentials from Environment or defaults
define('DB_HOST', getenv('DB_HOST') ?: ($_ENV['DB_HOST'] ?? ($_SERVER['DB_HOST'] ?? '127.0.0.1')));
define('DB_PORT', (int)(getenv('DB_PORT') ?: ($_ENV['DB_PORT'] ?? ($_SERVER['DB_PORT'] ?? 3306))));
define('DB_NAME', getenv('DB_NAME') ?: ($_ENV['DB_NAME'] ?? ($_SERVER['DB_NAME'] ?? 'nxtgen_db')));
define('DB_USER', getenv('DB_USER') ?: ($_ENV['DB_USER'] ?? ($_SERVER['DB_USER'] ?? 'root')));
define('DB_PASS', getenv('DB_PASSWORD') !== false ? getenv('DB_PASSWORD') : ($_ENV['DB_PASSWORD'] ?? ($_SERVER['DB_PASSWORD'] ?? '')));

// Handle Cross-Origin Resource Sharing (CORS)
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
header("Access-Control-Allow-Origin: {$origin}");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Origin, Accept');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

/**
 * Standard JSON Response helper
 */
function jsonResponse(mixed $data, int $statusCode = 200): void {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Error JSON Response helper
 */
function jsonError(string $message, int $statusCode = 400): void {
    jsonResponse(['success' => false, 'error' => $message], $statusCode);
}

/**
 * Parse incoming JSON body
 */
function getJsonBody(): array {
    $raw = file_get_contents('php://input');
    if (!$raw) {
        return [];
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

/**
 * Start session securely
 */
function ensureSession(): void {
    if (session_status() === PHP_SESSION_NONE) {
        session_start([
            'cookie_httponly' => true,
            'cookie_samesite' => 'Lax'
        ]);
    }
}

/**
 * Retrieve Bearer Token or Session Cookie
 */
function getAuthToken(): ?string {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? ($_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '');
    if (preg_match('/Bearer\s+(\S+)/i', $authHeader, $matches)) {
        return $matches[1];
    }
    ensureSession();
    return $_SESSION['nxtgen_auth_token'] ?? null;
}

/**
 * Verify authentication and return user data
 */
function getAuthenticatedUser(PDO $pdo): ?array {
    $token = getAuthToken();
    if (!$token) {
        return null;
    }

    $stmt = $pdo->prepare("
        SELECT u.id, u.username, u.email, u.name, u.role
        FROM admin_sessions s
        JOIN admin_users u ON s.user_id = u.id
        WHERE s.token = ? AND s.expires_at > NOW()
        LIMIT 1
    ");
    $stmt->execute([$token]);
    $user = $stmt->fetch();
    return $user ?: null;
}

/**
 * Middleware: Require Authentication
 */
function requireAuth(PDO $pdo): array {
    $user = getAuthenticatedUser($pdo);
    if (!$user) {
        jsonError('Unauthorized. Please log in to access the NXTGEN Admin CMS.', 401);
    }
    return $user;
}

/**
 * Log administrative activity
 */
function logAdminActivity(PDO $pdo, string $userName, string $action, string $details): void {
    try {
        $stmt = $pdo->prepare("INSERT INTO admin_activity (user_name, action, details) VALUES (?, ?, ?)");
        $stmt->execute([$userName, $action, $details]);
    } catch (Exception $e) {
        error_log("Failed to log admin activity: " . $e->getMessage());
    }
}
