// /api/admin - SuperAdmin endpoints
const { query } = require('../lib/db');
const { getUserFromRequest, setCors, handleOptions, parseBody } = require('../lib/auth');

module.exports = async (req, res) => {
  setCors(res);
  if (handleOptions(req, res)) return;

  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Acceso denegado. Se requiere ser SuperAdmin.' });
    }

    const action = req.query.action || '';

    if (action === 'admin_get_users') {
      const result = await query("SELECT id, email, role, created_at FROM users WHERE role != 'superadmin'");
      return res.json(result.rows);
    }

    else if (action === 'admin_delete_user') {
      const id = req.query.id;
      await query("DELETE FROM users WHERE id = $1 AND role != 'superadmin'", [id]);
      return res.json({ success: true });
    }

    else if (action === 'admin_get_psychologists') {
      const result = await query(
        'SELECT p.*, u.email FROM psychologists p JOIN users u ON p.user_id = u.id'
      );
      return res.json(result.rows);
    }

    else if (action === 'admin_update_psychologist') {
      const body = await parseBody(req);
      await query(
        'UPDATE psychologists SET name=$1, specialty=$2, price=$3 WHERE user_id=$4',
        [body.name, body.specialty, body.price, body.user_id]
      );
      return res.json({ success: true });
    }

    else if (action === 'admin_toggle_visibility') {
      const type = req.query.type || '';
      const id = req.query.id;
      let table = '';
      let idCol = 'id';
      if (type === 'psychologist') { table = 'psychologists'; idCol = 'user_id'; }
      else if (type === 'testimonial') { table = 'site_testimonials'; }
      else if (type === 'forum_post') { table = 'forum_posts'; }

      if (!table || !id) return res.status(400).json({ error: 'Parámetros inválidos' });

      await query(`UPDATE ${table} SET is_active = NOT is_active WHERE ${idCol} = $1`, [id]);
      return res.json({ success: true });
    }

    else if (action === 'admin_get_testimonials') {
      const result = await query('SELECT * FROM site_testimonials ORDER BY created_at DESC');
      return res.json(result.rows);
    }

    else if (action === 'admin_update_testimonial') {
      const body = await parseBody(req);
      await query(
        'UPDATE site_testimonials SET name=$1, content=$2, stars=$3 WHERE id=$4',
        [body.name, body.content, body.stars, body.id]
      );
      return res.json({ success: true });
    }

    else if (action === 'admin_delete_testimonial') {
      const id = req.query.id;
      await query('DELETE FROM site_testimonials WHERE id = $1', [id]);
      return res.json({ success: true });
    }

    else if (action === 'admin_get_forum') {
      const result = await query('SELECT * FROM forum_posts ORDER BY timestamp DESC');
      return res.json(result.rows);
    }

    else if (action === 'admin_delete_forum_post') {
      const id = req.query.id;
      await query('DELETE FROM forum_posts WHERE id = $1', [id]);
      return res.json({ success: true });
    }

    else if (action === 'admin_get_contacts') {
      const result = await query('SELECT * FROM contact_messages ORDER BY created_at DESC');
      return res.json(result.rows);
    }

    else if (action === 'admin_delete_contact') {
      const id = req.query.id;
      await query('DELETE FROM contact_messages WHERE id = $1', [id]);
      return res.json({ success: true });
    }

    else if (action === 'admin_delete_news') {
      const id = req.query.id;
      await query('DELETE FROM news WHERE id = $1', [id]);
      return res.json({ success: true });
    }

    else {
      return res.status(404).json({ error: 'Admin action not found' });
    }
  } catch (e) {
    console.error('Admin error:', e);
    return res.status(500).json({ error: e.message || 'Error interno.' });
  }
};
