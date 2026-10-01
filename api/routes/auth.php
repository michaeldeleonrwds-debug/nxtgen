<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/db.php';

function handleAuth(string $method, ?string $subRoute = null): void {
    $pdo = Database::getConnection();

    if ($method === 'POST' && $subRoute === 'login') {
        $body = getJsonBody();
        $username = trim($body['username'] ?? '');
        $password = (string)($body['password'] ?? '');

        if (!$username || !$password) {
            jsonError('Username and password are required', 400);
        }

        $stmt = $pdo->prepare("SELECT * FROM admin_users WHERE username = ? OR email = ? LIMIT 1");
        $stmt->execute([$username, $username]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            jsonError('Invalid username or password', 401);
        }

        // Generate secure 64-char session token
        $token = bin2hex(random_bytes(32));
        $expiresAt = date('Y-m-d H:i:s', time() + (86400 * 7)); // 7 days

        $sessStmt = $pdo->prepare("INSERT INTO admin_sessions (token, user_id, expires_at) VALUES (?, ?, ?)");
        $sessStmt->execute([$token, $user['id'], $expiresAt]);

        ensureSession();
        $_SESSION['nxtgen_auth_token'] = $token;

        logAdminActivity($pdo, $user['name'], 'Login', "Admin {$user['username']} logged in successfully");

        jsonResponse([
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => (int)$user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'name' => $user['name'],
                'role' => $user['role']
            ]
        ]);
    }

    if ($method === 'POST' && $subRoute === 'logout') {
        $token = getAuthToken();
        if ($token) {
            $stmt = $pdo->prepare("DELETE FROM admin_sessions WHERE token = ?");
            $stmt->execute([$token]);
        }
        ensureSession();
        unset($_SESSION['nxtgen_auth_token']);
        session_destroy();

        jsonResponse(['success' => true, 'message' => 'Logged out successfully']);
    }

    if ($method === 'GET' && ($subRoute === 'me' || $subRoute === null)) {
        $user = getAuthenticatedUser($pdo);
        if (!$user) {
            jsonError('Unauthorized', 401);
        }
        jsonResponse([
            'authenticated' => true,
            'user' => $user
        ]);
    }

    jsonError('Auth route not found', 404);
}
