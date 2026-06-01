// /api/ics - Download appointment as .ics file
const { query } = require('../lib/db');
const { getUserFromRequest, setCors, handleOptions } = require('../lib/auth');

module.exports = async (req, res) => {
  setCors(res);
  if (handleOptions(req, res)) return;

  try {
    const id = parseInt(req.query.id) || 0;
    if (id < 1) {
      res.status(400);
      return res.end('Solicitud no válida.');
    }

    const result = await query(
      `SELECT a.*, p.name AS psychologist_name
       FROM appointments a JOIN psychologists p ON a.psychologist_id = p.user_id
       WHERE a.id = $1`,
      [id]
    );
    const appointment = result.rows[0];
    if (!appointment) {
      res.status(404);
      return res.end('Cita no encontrada.');
    }

    // Auth check (from header or query param)
    const { verifyToken } = require('../lib/auth');
    const queryToken = req.query.token || '';
    let user = getUserFromRequest(req);
    if (!user && queryToken) {
        const payload = verifyToken(queryToken);
        if (payload) user = { user_id: payload.user_id, email: payload.email, role: payload.role };
    }
    const uid = user?.user_id || 0;
    const email = user?.email || '';
    const role = user?.role || '';

    let allowed = false;
    if (role === 'psychologist' && appointment.psychologist_id === uid) allowed = true;
    if (email && appointment.patient_email?.toLowerCase() === email.toLowerCase()) allowed = true;
    if (uid > 0 && appointment.patient_id === uid) allowed = true;

    if (!allowed) {
      res.status(403);
      return res.end('No autorizado. Inicia sesión con la cuenta asociada a la cita.');
    }

    if (appointment.status === 'cancelada') {
      res.status(410);
      return res.end('Esta cita fue cancelada.');
    }

    // Format dates for ICS
    const dateStr = appointment.date.replace(/\D/g, '');
    const timeParts = (appointment.time || '09:00:00').split(':');
    const dtStart = `${dateStr}T${timeParts[0]}${timeParts[1]}${timeParts[2] || '00'}`;

    // End = start + 1 hour
    const startDate = new Date(`${appointment.date}T${appointment.time || '09:00:00'}`);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    const pad = n => String(n).padStart(2, '0');
    const dtEnd = `${endDate.getFullYear()}${pad(endDate.getMonth()+1)}${pad(endDate.getDate())}T${pad(endDate.getHours())}${pad(endDate.getMinutes())}00`;

    const modality = appointment.modality || 'online';
    const location = modality.includes('presencial') ? 'Consulta presencial' : 'Sesión en línea';
    const summary = `Cita Activamente · ${appointment.psychologist_name}`;
    const desc = `Paciente: ${appointment.patient_name} · Modalidad: ${modality}`;

    const escapeICS = s => String(s).replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n').replace(/\r/g, '');

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Activamente//ES',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:activamente-cita-' + id + '@activamente.vercel.app',
      'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
      'DTSTART:' + dtStart,
      'DTEND:' + dtEnd,
      'SUMMARY:' + escapeICS(summary),
      'DESCRIPTION:' + escapeICS(desc),
      'LOCATION:' + escapeICS(location),
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n') + '\r\n';

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="cita-activamente-${id}.ics"`);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    return res.end(ics);

  } catch (e) {
    console.error('ICS error:', e);
    res.status(500);
    return res.end('Error al generar el archivo.');
  }
};
