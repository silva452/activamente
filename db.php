<?php
// db.php - Database connection for Activamente
// 127.0.0.1 evita en algunos equipos Windows que "localhost" resuelva a IPv6 (::1) y falle con SQLSTATE[HY000] [2002].
$host = getenv('ACTIVAMENTE_DB_HOST') ?: '127.0.0.1';
$db = getenv('ACTIVAMENTE_DB_NAME') ?: 'activamente';
$user = getenv('ACTIVAMENTE_DB_USER') ?: 'root';
$pass = getenv('ACTIVAMENTE_DB_PASS') !== false ? getenv('ACTIVAMENTE_DB_PASS') : '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
     PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
     PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
     PDO::ATTR_EMULATE_PREPARES => false,
];

try {
     $pdo = new PDO($dsn, $user, $pass, $options);
}
catch (\PDOException $e) {
     error_log('Activamente DB PDO: ' . $e->getMessage());
     header('Content-Type: application/json', true, 503);
     echo json_encode([
          'error' => 'No pudimos conectar con la base de datos. Comprueba que MySQL esté iniciado (en XAMPP el botón «Start» de MySQL en verde) y que exista la base «activamente»; luego recarga la página.',
     ], JSON_UNESCAPED_UNICODE);
     exit;
}
?>
