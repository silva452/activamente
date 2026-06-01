// /api/auth - Authentication endpoints (login, register, status, logout)
const { query } = require('../lib/db');
const { signToken, hashPassword, comparePassword, setCors, handleOptions, parseBody } = require('../lib/auth');

module.exports = async (req, res) => {
  setCors(res);
  if (handleOptions(req, res)) return;

  try {
    const action = req.query.action || '';
    const body = req.method === 'POST' ? await parseBody(req) : {};

    if (action === 'login') {
      const { email, password } = body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña requeridos.' });
      }

      const result = await query('SELECT * FROM users WHERE email = $1', [email]);
      const user = result.rows[0];
      if (!user || !(await comparePassword(password, user.password))) {
        return res.status(401).json({ error: 'Email o contraseña incorrectos.' });
      }

      const token = signToken({
        user_id: user.id,
        email: user.email,
        role: user.role,
        name: user.name || ''
      });

      return res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name || ''
        }
      });
    }

    else if (action === 'register') {
      const { name, email, password, role = 'patient' } = body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
      }

      const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'Este correo ya está registrado.' });
      }

      const hashed = await hashPassword(password);
      const result = await query(
        'INSERT INTO users (email, password, role, name) VALUES ($1, $2, $3, $4) RETURNING id, email, role, name',
        [email, hashed, role, name]
      );
      const user = result.rows[0];

      if (role === 'psychologist') {
        await query(
          'INSERT INTO psychologists (user_id, name) VALUES ($1, $2)',
          [user.id, name]
        );
      }

      const token = signToken({
        user_id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      });

      return res.json({
        success: true,
        token,
        user
      });
    }

    else if (action === 'status') {
      const authHeader = req.headers.authorization || '';
      const tokenStr = authHeader.replace('Bearer ', '');
      if (!tokenStr) {
        return res.json({
          logged_in: false,
          user_id: null,
          email: null,
          role: null,
          name: null
        });
      }

      const { verifyToken } = require('../lib/auth');
      const payload = verifyToken(tokenStr);
      if (!payload) {
        return res.json({
          logged_in: false,
          user_id: null,
          email: null,
          role: null,
          name: null
        });
      }

      return res.json({
        logged_in: true,
        user_id: payload.user_id,
        email: payload.email,
        role: payload.role,
        name: payload.name || ''
      });
    }

    else if (action === 'change_password') {
      const user = getUserFromRequest(req);
      if (!user) return res.status(401).json({ error: 'No autorizado.' });
      const { new_password } = await parseBody(req);
      if (!new_password || new_password.length < 6) {
        return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres.' });
      }
      const hashed = await hashPassword(new_password);
      await query('UPDATE users SET password = $1 WHERE id = $2', [hashed, user.user_id]);
      return res.json({ success: true, message: 'Contraseña actualizada correctamente.' });
    }

    else if (action === 'logout') {
      // With JWT, logout is handled client-side by removing the token
      return res.json({ success: true });
    }

    else {
      return res.status(404).json({ error: 'Action not found' });
    }
  } catch (e) {
    console.error('Auth error:', e);
    return res.status(500).json({ error: e.message || 'Error interno del servidor.' });
  }
};
