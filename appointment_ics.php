<?php
/**
 * Descarga un evento .ics para una cita (paciente o psicólogo autenticado).
 */
session_start();
require_once __DIR__ . '/db.php';

function ics_escape_text(string $s): string
{
    return str_replace(["\\", ",", ";", "\n", "\r"], ["\\\\", "\\,", "\\;", "\\n", ""], $s);
}

function ical_local_datetime(string $date, string $time): string
{
    $d = preg_replace('/\D/', '', $date);
    $parts = explode(':', $time);
    $h = str_pad((string)($parts[0] ?? '0'), 2, '0', STR_PAD_LEFT);
    $m = str_pad((string)($parts[1] ?? '0'), 2, '0', STR_PAD_LEFT);
    $s = str_pad((string)($parts[2] ?? '0'), 2, '0', STR_PAD_LEFT);
    return $d . 'T' . $h . $m . $s;
}

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if ($id < 1) {
    http_response_code(400);
    header('Content-Type: text/plain; charset=utf-8');
    exit('Solicitud no válida.');
}

$stmt = $pdo->prepare("
    SELECT a.*, p.name AS psychologist_name
    FROM appointments a
    JOIN psychologists p ON a.psychologist_id = p.user_id
    WHERE a.id = ?
");
$stmt->execute([$id]);
$a = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$a) {
    http_response_code(404);
    header('Content-Type: text/plain; charset=utf-8');
    exit('Cita no encontrada.');
}

$uid   = isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : 0;
$email = $_SESSION['email'] ?? '';
$role  = $_SESSION['role'] ?? '';

$allowed = false;
if ($role === 'psychologist' && (int)$a['psychologist_id'] === $uid) {
    $allowed = true;
}
if ($email !== '' && strcasecmp((string)$a['patient_email'], $email) === 0) {
    $allowed = true;
}
if ($uid > 0 && isset($a['patient_id']) && (int)$a['patient_id'] === $uid) {
    $allowed = true;
}

if (!$allowed) {
    http_response_code(403);
    header('Content-Type: text/plain; charset=utf-8');
    exit('No autorizado. Inicia sesión con la cuenta asociada a la cita.');
}

if ($a['status'] === 'cancelada') {
    http_response_code(410);
    header('Content-Type: text/plain; charset=utf-8');
    exit('Esta cita fue cancelada.');
}

$dtStart = ical_local_datetime($a['date'], $a['time']);
try {
    $start = new DateTime($a['date'] . ' ' . $a['time']);
    $end   = clone $start;
    $end->modify('+1 hour');
    $dtEnd = $end->format('Ymd\THis');
} catch (Exception $e) {
    $dtEnd = $dtStart;
}

$modality = $a['modality'] ?? 'online';
$loc      = stripos((string)$modality, 'presencial') !== false ? 'Consulta presencial' : 'Sesión en línea';

$summary = 'Cita Activamente · ' . $a['psychologist_name'];
$desc    = 'Paciente: ' . $a['patient_name'] . ' · Modalidad: ' . $modality;

$lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Activamente//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:activamente-cita-' . $id . '@activamente.local',
    'DTSTAMP:' . gmdate('Ymd\THis\Z'),
    'DTSTART:' . $dtStart,
    'DTEND:' . $dtEnd,
    'SUMMARY:' . ics_escape_text($summary),
    'DESCRIPTION:' . ics_escape_text($desc),
    'LOCATION:' . ics_escape_text($loc),
    'END:VEVENT',
    'END:VCALENDAR',
];

$body = implode("\r\n", $lines) . "\r\n";

header('Content-Type: text/calendar; charset=utf-8');
header('Content-Disposition: attachment; filename="cita-activamente-' . $id . '.ics"');
header('Cache-Control: no-store, no-cache, must-revalidate');
echo $body;
