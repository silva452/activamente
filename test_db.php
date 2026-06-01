<?php
require_once 'db.php';
header('Content-Type: application/json');
try {
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM psychologists");
    echo json_encode(['db' => 'ok', 'count' => $stmt->fetch()['count']]);
}
catch (Exception $e) {
    echo json_encode(['db' => 'error', 'msg' => $e->getMessage()]);
}
?>
