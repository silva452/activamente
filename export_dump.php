<?php
/**
 * Exporta la base `activamente` a SQL (esquema + datos).
 * Uso en navegador: http://localhost/activamente/export_dump.php?key=activamente2026
 * O CLI: php export_dump.php
 *
 * Cambia EXPORT_SECRET en producción o borra este archivo después de usar.
 */
const EXPORT_SECRET = 'activamente2026';

function out($s) { echo $s . "\n"; }

$isCli = PHP_SAPI === 'cli';
if (!$isCli) {
    $k = $_GET['key'] ?? '';
    if (!hash_equals(EXPORT_SECRET, (string)$k)) {
        http_response_code(403);
        header('Content-Type: text/plain; charset=utf-8');
        exit('Acceso denegado. Añade ?key=… o ejecuta por línea de comandos: php export_dump.php');
    }
    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename="activamente_backup_' . date('Y-m-d_His') . '.sql"');
}

require_once __DIR__ . '/db.php';

$pdo->exec("USE `activamente`");

$tables = $pdo->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN);
if (!$tables) {
    if ($isCli) {
        out('-- Sin tablas en activamente');
    } else {
        echo '-- Sin tablas';
    }
    exit(0);
}

$write = function ($sql) use ($isCli) {
    if ($isCli) {
        echo $sql;
    } else {
        echo $sql;
    }
};

$write("-- Activamente dump " . date('c') . "\n");
$write("SET NAMES utf8mb4;\n");
$write("SET FOREIGN_KEY_CHECKS=0;\n\n");

foreach ($tables as $table) {
    $table = preg_replace('/[^a-zA-Z0-9_]/', '', $table);
    if ($table === '') {
        continue;
    }
    $create = $pdo->query("SHOW CREATE TABLE `$table`")->fetch(PDO::FETCH_ASSOC);
    if (!empty($create['Create Table'])) {
        $write("DROP TABLE IF EXISTS `$table`;\n");
        $write($create['Create Table'] . ";\n\n");
    }

    $stmt = $pdo->query("SELECT * FROM `$table`");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    if (!$rows) {
        continue;
    }
    $cols = array_keys($rows[0]);
    $colList = '`' . implode('`,`', $cols) . '`';
    foreach ($rows as $row) {
        $vals = [];
        foreach ($cols as $c) {
            $v = $row[$c];
            if ($v === null) {
                $vals[] = 'NULL';
            } else {
                $vals[] = $pdo->quote((string)$v);
            }
        }
        $write("INSERT INTO `$table` ($colList) VALUES (" . implode(',', $vals) . ");\n");
    }
    $write("\n");
}

$write("SET FOREIGN_KEY_CHECKS=1;\n");
