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
        $msg = "File upload failed with error code: {$file['error']}";
        if ($file['error'] === UPLOAD_ERR_INI_SIZE || $file['error'] === UPLOAD_ERR_FORM_SIZE) {
            $msg = 'File size exceeds server upload limit (php.ini upload_max_filesize).';
        } elseif ($file['error'] === UPLOAD_ERR_PARTIAL) {
            $msg = 'File was only partially uploaded.';
        } elseif ($file['error'] === UPLOAD_ERR_NO_FILE) {
            $msg = 'No file was uploaded.';
        }
        jsonError($msg, 400);
    }

    @ini_set('upload_max_filesize', '128M');
    @ini_set('post_max_size', '128M');
    @ini_set('memory_limit', '256M');
    @ini_set('max_execution_time', '300');

    // Maximum file size: 100MB for media and background videos
    if ($file['size'] > 100 * 1024 * 1024) {
        jsonError('File size exceeds 100MB limit.', 400);
    }

    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'mp4', 'webm', 'mov', 'ogg', 'm4v', 'ico'];

    if (!in_array($ext, $allowedExts, true)) {
        jsonError('Invalid file type. Allowed: jpg, jpeg, png, webp, gif, svg, mp4, webm, mov, ogg, m4v, ico.', 400);
    }

    // Generate safe unique filename
    $safeName = 'nxtgen_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $ext;

    // Define primary uploads directory: web root uploads/
    $projectRoot = dirname(__DIR__, 2);
    $primaryDir = $projectRoot . '/uploads';

    if (!is_dir($primaryDir)) {
        @mkdir($primaryDir, 0777, true);
        @chmod($primaryDir, 0777);
    }

    $targetPath = $primaryDir . '/' . $safeName;
    $saved = @move_uploaded_file($file['tmp_name'], $targetPath);

    // Fallback if move_uploaded_file fails due to temp partition or restriction
    if (!$saved && file_exists($file['tmp_name'])) {
        $saved = @copy($file['tmp_name'], $targetPath);
        if ($saved) {
            @unlink($file['tmp_name']);
        }
    }

    if (!$saved) {
        $isWritable = is_writable($primaryDir) ? 'writable' : 'not writable';
        jsonError("Failed to save uploaded file to {$primaryDir} (directory is {$isWritable}). Please check server folder permissions.", 500);
    }

    @chmod($targetPath, 0644);

    // If local Vite development environment has public/ folder, mirror file there
    $publicUploads = $projectRoot . '/public/uploads';
    if (is_dir($projectRoot . '/public')) {
        if (!is_dir($publicUploads)) {
            @mkdir($publicUploads, 0777, true);
        }
        @copy($targetPath, $publicUploads . '/' . $safeName);
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
