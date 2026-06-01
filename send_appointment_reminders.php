<?php
/**
 * Envía recordatorios por correo el día anterior a cada cita confirmada o pendiente.
 *
 * Uso:
 *   php send_appointment_reminders.php
 *
 * En Windows (Programador de tareas), ejecutar diario:
 *   C:\laragon\bin\php\php-8.x\php.exe C:\laragon\www\activamente\send_appointment_reminders.php
 *
 * Opcional (solo si defines REMINDER_WEB_SECRET): abrir en navegador una vez al día
 *   send_appointment_reminders.php?key=TU_SECRETO
 */
declare(strict_types=1);

const REMINDER_FROM_EMAIL = 'noreply@localhost';
const REMINDER_FROM_NAME  = 'Activamente';
/** Cadena vacía = desactiva la URL con ?key= */
const REMINDER_WEB_SECRET = '';

$allow = (PHP_SAPI === 'cli');
if (REMINDER_WEB_SECRET !== '' && isset($_GET['key']) && hash_equals(REMINDER_WEB_SECRET, (string)$_GET['key'])) {
    $allow = true;
}
if (!$allow) {
    http_response_code(403);
    header('Content-Type: text/plain; charset=utf-8');
    exit('Prohibido. Usa la línea de comandos o configura REMINDER_WEB_SECRET.');
}

require_once __DIR__ . '/db.php';

$tomorrow = (new DateTimeImmutable('tomorrow'))->format('Y-m-d');

$stmt = $pdo->prepare("
    SELECT a.id, a.patient_name, a.patient_email, a.date, a.time, a.modality, a.reminder_sent,
           p.name AS psychologist_name
    FROM appointments a
    JOIN psychologists p ON a.psychologist_id = p.user_id
    WHERE a.date = ?
      AND a.status IN ('pendiente', 'confirmada')
      AND (a.reminder_sent IS NULL OR a.reminder_sent = 0)
      AND a.patient_email <> ''
");
$stmt->execute([$tomorrow]);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

$sent = 0;
$failed = 0;

foreach ($rows as $row) {
    $to = $row['patient_email'];
    if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
        continue;
    }

    $name = $row['patient_name'];
    $date = $row['date'];
    $time = substr((string)$row['time'], 0, 5);
    $psy  = $row['psychologist_name'];
    $mod  = $row['modality'] ?? 'online';

    $subject = 'Recordatorio: tu cita en Activamente es mañana';
    $body    = "Hola {$name},\r\n\r\n"
        . "Te recordamos que mañana ({$date}) a las {$time} tienes una cita con {$psy}.\r\n"
        . "Modalidad: {$mod}\r\n\r\n"
        . "Si necesitas reprogramar, entra a tu portal en Activamente o contacta a tu especialista.\r\n\r\n"
        . "Saludos,\r\n"
        . REMINDER_FROM_NAME . "\r\n";

    $fromHeader = REMINDER_FROM_NAME . ' <' . REMINDER_FROM_EMAIL . '>';
    $headers    = [
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: 8bit',
        'From: ' . $fromHeader,
        'X-Mailer: PHP/' . PHP_VERSION,
    ];

    $ok = @mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, implode("\r\n", $headers));
    if ($ok) {
        $u = $pdo->prepare('UPDATE appointments SET reminder_sent = 1 WHERE id = ?');
        $u->execute([(int)$row['id']]);
        $sent++;
    } else {
        $failed++;
    }
}

$msg = date('c') . " recordatorios: enviados={$sent} fallidos={$failed} revisados=" . count($rows) . PHP_EOL;
if (PHP_SAPI === 'cli') {
    echo $msg;
} else {
    header('Content-Type: text/plain; charset=utf-8');
    echo $msg;
}
