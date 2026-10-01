<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/db.php';

function handleUpload(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonError('Method not allowed', 405);
    }

    $pdo = Database::getConnection();
    $admin = requireAuth($pdo);

    if (empty($_FILES['file'])) {
        jsonError('No file was uploaded.', 400);
    }

    $file = $_FILES['file'];

    if ($file['error'] !== UPLOAD_ERR_OK) {
        jsonError("File upload error code: {$file['error']}", 400);
    }

    // Maximum file size: 12MB
    if ($file['size'] > 12 * 1024 * 1024) {
        jsonError('File size exceeds 12MB limit.', 400);
    }

    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'mp4', 'ico'];

    if (!in_array($ext, $allowedExts, true)) {
        jsonError('Invalid file type. Allowed: jpg, jpeg, png, webp, gif, svg, mp4, ico.', 400);
    }

    // Generate safe unique filename
    $safeName = 'nxtgen_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $ext;

    // Define upload destinations: both public/uploads (for Vite dev) and uploads/ (for root Apache)
    $projectRoot = dirname(__DIR__, 2);
    $destDirs = [
        $projectRoot . '/public/uploads',
        $projectRoot . '/uploads'
    ];

    $saved = false;
    foreach ($destDirs as $dir) {
        if (!is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }
        $targetPath = $dir . '/' . $safeName;
        if (!$saved) {
            $saved = move_uploaded_file($file['tmp_name'], $targetPath);
        } else {
            // Copy to secondary target
            @copy($destDirs[0] . '/' . $safeName, $targetPath);
        }
    }

    if (!$saved) {
        jsonError('Failed to save uploaded file.', 500);
    }

    $publicUrl = '/uploads/' . $safeName;

    logAdminActivity($pdo, $admin['name'], 'Upload Media', "Uploaded file {$file['name']} as {$safeName}");

    jsonResponse([
        'success' => true,
        'url' => $publicUrl,
        'filename' => $safeName,
        'size' => $file['size'],
        'originalName' => $file['name']
    ]);
}
