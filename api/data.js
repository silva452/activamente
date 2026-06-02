// /api/data - All data endpoints (replaces api.php)
const { query } = require('../lib/db');
const { getUserFromRequest, setCors, handleOptions, parseBody } = require('../lib/auth');
const ACTIVAMENTE_INBOX_EMAIL = process.env.CONTACT_EMAIL || 'activamentecorreo2026@gmail.com';

module.exports = async (req, res) => {
  setCors(res);
  if (handleOptions(req, res)) return;

  try {
    const action = req.query.action || '';
    const user = getUserFromRequest(req);
    const send = (data, status = 200) => res.status(status).json(data);

    // ===================== PSYCHOLOGISTS =====================
    if (action === 'get_psychologists') {
      const search = req.query.search || '';
      const modality = req.query.modality || '';
      const priceMax = req.query.price_max || '';
      const specialty = req.query.specialty || '';

      let sql = `SELECT p.*, u.email FROM psychologists p JOIN users u ON p.user_id = u.id WHERE p.is_active = true`;
      const params = [];
      let idx = 1;

      if (search) {
        sql += ` AND (p.name ILIKE $${idx} OR p.specialty ILIKE $${idx} OR p.bio ILIKE $${idx})`;
        params.push(`%${search}%`);
        idx++;
      }
      if (specialty) {
        sql += ` AND p.specialty ILIKE $${idx}`;
        params.push(`%${specialty}%`);
        idx++;
      }
      if (modality && modality !== 'todos') {
        sql += ` AND (p.modality = $${idx} OR p.modality = 'ambos')`;
        params.push(modality);
        idx++;
      }
      if (priceMax) {
        sql += ` AND p.price <= $${idx}`;
        params.push(parseFloat(priceMax));
        idx++;
      }
      sql += ' ORDER BY p.rating DESC, p.reviews_count DESC';

      const result = await query(sql, params);
      return send(result.rows);
    }

    // ===================== FORUM =====================
    else if (action === 'get_forum') {
      const result = await query(
        'SELECT fp.*, u.role as author_role FROM forum_posts fp LEFT JOIN users u ON fp.author_id = u.id WHERE fp.is_active = true ORDER BY fp.timestamp DESC'
      );
      return send(result.rows);
    }

    else if (action === 'post_forum') {
      const body = await parseBody(req);
      if (!body) return send({ error: 'No data provided' }, 400);

      const result = await query(
        `INSERT INTO forum_posts (author_id, author_email, title, content, is_anonymous)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [
          user?.user_id || null,
          body.is_anonymous ? 'Anónimo' : (body.author_email || 'Anónimo'),
          body.title,
          body.content,
          body.is_anonymous ? true : false
        ]
      );
      return send({ success: true, id: result.rows[0].id });
    }

    // ===================== PROFILE =====================
    else if (action === 'get_my_profile') {
      if (!user) return send({ error: 'No autorizado' }, 401);
      const result = await query('SELECT p.*, u.email FROM psychologists p JOIN users u ON p.user_id = u.id WHERE p.user_id = $1', [user.user_id]);
      return send(result.rows[0] || { error: 'Perfil no encontrado' });
    }

    else if (action === 'update_profile') {
      if (!user) return send({ error: 'No autorizado' }, 401);

      // For multipart, data comes as query params or body JSON
      const body = req.method === 'POST' ? await parseBody(req) : {};

      await query(
        `UPDATE psychologists SET name=$1, specialty=$2, bio=$3, education=$4, approach=$5, price=$6,
         whatsapp_number=$7, instagram=$8, linkedin=$9, profile_vibe=$10
         WHERE user_id=$11`,
        [
          body.name || '', body.specialty || '', body.bio || '',
          body.education || '', body.approach || '', body.price || 0,
          body.whatsapp_number || '', body.instagram || '', body.linkedin || '',
          body.profile_vibe || 'zen', user.user_id
        ]
      );
      return send({ success: true });
    }

    // ===================== APPOINTMENTS =====================
    else if (action === 'book_appointment') {
      const body = await parseBody(req);
      if (!body) return send({ error: 'Datos incompletos' }, 400);

      const result = await query(
        `INSERT INTO appointments (psychologist_id, patient_id, patient_name, patient_email, patient_phone, date, time, modality)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
        [
          body.psychologist_id, user?.user_id || null,
          body.name, body.email, body.phone,
          body.date, body.time, body.modality || 'online'
        ]
      );
      return send({ success: true, appointment_id: result.rows[0].id });
    }

    else if (action === 'get_appointments') {
      if (!user) return send({ error: 'No autorizado' }, 401);
      const result = await query(
        'SELECT * FROM appointments WHERE psychologist_id = $1 ORDER BY date ASC, time ASC',
        [user.user_id]
      );
      return send(result.rows);
    }

    else if (action === 'get_patient_appointments') {
      if (!user) return send({ error: 'No autorizado' }, 401);
      const result = await query(
        `SELECT a.*, p.name as psychologist_name, p.specialty, p.image, p.price
         FROM appointments a JOIN psychologists p ON a.psychologist_id = p.user_id
         WHERE a.patient_email = $1 OR a.patient_id = $2
         ORDER BY a.date DESC, a.time DESC`,
        [user.email, user.user_id]
      );

      // Check if each has a review
      for (const appt of result.rows) {
        const tRes = await query('SELECT id FROM testimonials WHERE appointment_id = $1', [appt.id]);
        appt.has_review = tRes.rows.length > 0;
      }
      return send(result.rows);
    }

    else if (action === 'cancel_appointment') {
      if (!user) return send({ error: 'No autorizado' }, 401);
      const id = req.query.id;
      await query(
        `UPDATE appointments SET status = 'cancelada' WHERE id = $1 AND patient_email = $2 AND status = 'pendiente'`,
        [id, user.email]
      );
      return send({ success: true });
    }

    else if (action === 'confirm_appointment') {
      if (!user || user.role !== 'psychologist') return send({ error: 'No autorizado' }, 401);
      const id = req.query.id;
      const status = req.query.status || 'confirmada';
      const allowed = ['confirmada', 'cancelada', 'completada'];
      if (!allowed.includes(status)) return send({ error: 'Estado inválido' }, 400);
      await query(
        'UPDATE appointments SET status = $1 WHERE id = $2 AND psychologist_id = $3',
        [status, id, user.user_id]
      );
      return send({ success: true });
    }

    // ===================== BLOG =====================
    else if (action === 'get_blog') {
      const uid = req.query.user_id;
      if (uid) {
        const result = await query(
          'SELECT b.*, p.name as author_name FROM blog_posts b JOIN psychologists p ON b.user_id = p.user_id WHERE b.user_id = $1 ORDER BY b.created_at DESC',
          [uid]
        );
        return send(result.rows);
      } else {
        const result = await query(
          'SELECT b.*, p.name as author_name FROM blog_posts b JOIN psychologists p ON b.user_id = p.user_id ORDER BY b.created_at DESC LIMIT 20'
        );
        return send(result.rows);
      }
    }

    else if (action === 'post_blog') {
      if (!user) return send({ error: 'No autorizado' }, 401);
      const body = await parseBody(req);
      const result = await query(
        `INSERT INTO blog_posts (user_id, type, title, content, media_url) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [user.user_id, body.type, body.title, body.content, body.media_url]
      );
      return send({ success: true, id: result.rows[0].id });
    }

    // ===================== TESTIMONIALS =====================
    else if (action === 'get_testimonials') {
      const uid = req.query.user_id;
      if (!uid) return send({ error: 'Especialista no especificado' }, 400);
      const result = await query(
        'SELECT * FROM testimonials WHERE psychologist_id = $1 ORDER BY created_at DESC',
        [uid]
      );
      return send(result.rows);
    }

    else if (action === 'post_verified_testimonial') {
      if (!user) return send({ error: 'Debes iniciar sesión para dejar una reseña.' }, 401);
      const body = await parseBody(req);
      const appointment_id = body.appointment_id;
      if (!appointment_id) return send({ error: 'Datos incompletos.' }, 400);

      const apptRes = await query(
        "SELECT * FROM appointments WHERE id = $1 AND patient_email = $2 AND status != 'cancelada'",
        [appointment_id, user.email]
      );
      const appt = apptRes.rows[0];
      if (!appt) return send({ error: 'No tienes permiso para reseñar esta cita.' }, 403);

      const checkRes = await query('SELECT id FROM testimonials WHERE appointment_id = $1', [appointment_id]);
      if (checkRes.rows.length > 0) return send({ error: 'Ya dejaste una reseña para esta cita.' }, 409);

      const result = await query(
        `INSERT INTO testimonials (psychologist_id, patient_name, content, stars, appointment_id, is_verified)
         VALUES ($1, $2, $3, $4, $5, 1) RETURNING id`,
        [appt.psychologist_id, body.name || user.email, body.content, body.stars || 5, appointment_id]
      );

      await query(
        `UPDATE psychologists SET reviews_count = reviews_count + 1,
         rating = (SELECT ROUND(AVG(stars), 1) FROM testimonials WHERE psychologist_id = $1)
         WHERE user_id = $1`,
        [appt.psychologist_id]
      );

      return send({ success: true });
    }

    // ===================== SITE TESTIMONIALS =====================
    else if (action === 'get_site_testimonials') {
      const result = await query(
        'SELECT * FROM site_testimonials WHERE is_active = true ORDER BY created_at DESC'
      );
      return send(result.rows);
    }

    else if (action === 'post_site_testimonial') {
      const body = await parseBody(req);
      if (!body.name || !body.content) return send({ error: 'Datos incompletos.' }, 400);
      await query(
        'INSERT INTO site_testimonials (name, content, stars) VALUES ($1, $2, $3)',
        [body.name, body.content, body.stars || 5]
      );
      return send({ success: true });
    }

    // ===================== NEWS =====================
    else if (action === 'get_news') {
      const result = await query('SELECT * FROM news ORDER BY created_at DESC');
      return send(result.rows);
    }

    else if (action === 'post_news') {
      if (!user || !['admin', 'superadmin'].includes(user.role)) {
        return send({ error: 'Solo el administrador puede publicar noticias.' }, 403);
      }
      const body = await parseBody(req);
      await query(
        'INSERT INTO news (title, content, image_url) VALUES ($1, $2, $3)',
        [body.title, body.content, body.image_url]
      );
      return send({ success: true });
    }

    // ===================== JOURNEY =====================
    else if (action === 'get_journey') {
      const uid = req.query.user_id;
      if (!uid) return send({ error: 'ID omitido' }, 400);
      const result = await query(
        'SELECT * FROM treatment_steps WHERE psychologist_id = $1 ORDER BY sort_order ASC',
        [uid]
      );
      return send(result.rows);
    }

    else if (action === 'post_journey') {
      if (!user) return send({ error: 'No autorizado' }, 401);
      const body = await parseBody(req);
      const result = await query(
        'INSERT INTO treatment_steps (psychologist_id, title, description, sort_order) VALUES ($1, $2, $3, $4) RETURNING id',
        [user.user_id, body.title, body.description, body.sort_order || 0]
      );
      return send({ success: true, id: result.rows[0].id });
    }

    else if (action === 'delete_journey') {
      if (!user) return send({ error: 'No autorizado' }, 401);
      const id = req.query.id;
      await query('DELETE FROM treatment_steps WHERE id = $1 AND psychologist_id = $2', [id, user.user_id]);
      return send({ success: true });
    }

    // ===================== MOOD =====================
    else if (action === 'post_mood') {
      if (!user) return send({ error: 'Debes iniciar sesión para registrar tu estado' }, 401);
      const body = await parseBody(req);
      await query(
        'INSERT INTO mood_logs (user_id, mood_score, energy_level, note) VALUES ($1, $2, $3, $4)',
        [user.user_id, body.mood_score, body.energy_level, body.note || '']
      );
      return send({ success: true });
    }

    else if (action === 'get_mood_history') {
      if (!user) return send({ error: 'No autorizado' }, 401);
      const result = await query(
        'SELECT * FROM mood_logs WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 30',
        [user.user_id]
      );
      return send(result.rows);
    }

    // ===================== TESTS =====================
    else if (action === 'get_tests') {
      const uid = req.query.user_id;
      if (!uid) return send({ error: 'ID omitido' }, 400);
      const result = await query(
        'SELECT * FROM custom_tests WHERE psychologist_id = $1 AND is_active = true',
        [uid]
      );
      const tests = result.rows;
      if (req.query.full) {
        for (const t of tests) {
          const qRes = await query('SELECT * FROM test_questions WHERE test_id = $1', [t.id]);
          t.questions = qRes.rows;
        }
      }
      return send(tests);
    }

    else if (action === 'create_test') {
      if (!user) return send({ error: 'No autorizado' }, 401);
      const body = await parseBody(req);
      const result = await query(
        'INSERT INTO custom_tests (psychologist_id, title, description) VALUES ($1, $2, $3) RETURNING id',
        [user.user_id, body.title, body.description]
      );
      return send({ success: true, id: result.rows[0].id });
    }

    else if (action === 'submit_test') {
      const body = await parseBody(req);
      await query(
        'INSERT INTO test_results (test_id, patient_name, patient_email, answers_json) VALUES ($1, $2, $3, $4)',
        [body.test_id, body.name, body.email, JSON.stringify(body.answers)]
      );
      return send({ success: true });
    }

    // ===================== VAULT =====================
    else if (action === 'get_vault_docs') {
      if (!user) return send({ error: 'No autorizado' }, 401);
      let result;
      if (user.role === 'psychologist') {
        result = await query('SELECT * FROM patient_documents WHERE psychologist_id = $1', [user.user_id]);
      } else {
        result = await query(
          'SELECT * FROM patient_documents WHERE patient_email = $1 OR patient_id = $2',
          [user.email, user.user_id]
        );
      }
      return send(result.rows);
    }

    else if (action === 'get_rituals') {
      if (!user) return send({ error: 'No autorizado' }, 401);
      const result = await query(
        `SELECT r.*, a.date FROM rituals r JOIN appointments a ON r.appointment_id = a.id
         WHERE a.patient_email = $1 ORDER BY a.date DESC LIMIT 1`,
        [user.email]
      );
      return send(result.rows[0] || null);
    }

    // ===================== CONTACT =====================
    else if (action === 'post_contact') {
      const body = await parseBody(req);
      if (!body.name || !body.email || !body.message) {
        return send({ error: 'Por favor completa todos los campos.' }, 400);
      }

      await query(
        'INSERT INTO contact_messages (name, email, subject, message, type) VALUES ($1, $2, $3, $4, $5)',
        [body.name, body.email, body.subject || '', body.message, body.type || 'general']
      );

      // Send email notification via Resend or similar (optional)
      // In production, use Resend/SendGrid here

      return send({ success: true });
    }

    // ===================== UNKNOWN =====================
    else {
      return send({ error: 'Action not found' }, 404);
    }

  } catch (e) {
    console.error('API error:', e);
    return res.status(500).json({ error: e.message || 'Error interno del servidor.' });
  }
};
