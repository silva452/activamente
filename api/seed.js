// /api/seed - One-time database initialization endpoint
// Visit: /api/seed?key=activamente-deploy-2026 after deployment
const { getPool } = require('../lib/db');
const { hashPassword } = require('../lib/auth');

const SEED_KEY = process.env.SEED_KEY || 'activamente-deploy-2026';

const CREATE_TABLES = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'psychologist',
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS psychologists (
  user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  specialty VARCHAR(255),
  bio TEXT,
  education TEXT,
  approach TEXT,
  languages VARCHAR(255) DEFAULT 'Español',
  location VARCHAR(255) DEFAULT 'Consulta Online',
  price DECIMAL(10,2) DEFAULT 0.00,
  image VARCHAR(500),
  rating DECIMAL(2,1) DEFAULT 5.0,
  reviews_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  modality VARCHAR(50) DEFAULT 'ambos',
  audio_url VARCHAR(500),
  whatsapp_number VARCHAR(50),
  instagram VARCHAR(500),
  linkedin VARCHAR(500),
  values_tags TEXT,
  profile_vibe VARCHAR(50) DEFAULT 'zen'
);

CREATE TABLE IF NOT EXISTS forum_posts (
  id SERIAL PRIMARY KEY,
  author_id INT REFERENCES users(id) ON DELETE SET NULL,
  author_email VARCHAR(255),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  psychologist_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  patient_id INT REFERENCES users(id) ON DELETE SET NULL,
  patient_name VARCHAR(255) NOT NULL,
  patient_email VARCHAR(255) NOT NULL,
  patient_phone VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status VARCHAR(50) DEFAULT 'pendiente',
  modality VARCHAR(50) DEFAULT 'online',
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL DEFAULT 'article',
  title VARCHAR(255) NOT NULL,
  content TEXT,
  media_url VARCHAR(500),
  pdf_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS testimonials (
  id SERIAL PRIMARY KEY,
  psychologist_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  patient_name VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  stars INT DEFAULT 5,
  appointment_id INT REFERENCES appointments(id) ON DELETE SET NULL,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS news (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_testimonials (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  stars INT DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS treatment_steps (
  id SERIAL PRIMARY KEY,
  psychologist_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS custom_tests (
  id SERIAL PRIMARY KEY,
  psychologist_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS test_questions (
  id SERIAL PRIMARY KEY,
  test_id INT NOT NULL REFERENCES custom_tests(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'choice',
  options_json TEXT
);

CREATE TABLE IF NOT EXISTS test_results (
  id SERIAL PRIMARY KEY,
  test_id INT NOT NULL REFERENCES custom_tests(id) ON DELETE CASCADE,
  patient_name VARCHAR(255),
  patient_email VARCHAR(255),
  answers_json TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patient_documents (
  id SERIAL PRIMARY KEY,
  patient_id INT REFERENCES users(id) ON DELETE SET NULL,
  patient_email VARCHAR(255),
  psychologist_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_url VARCHAR(500) NOT NULL,
  title VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mood_logs (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mood_score INT,
  energy_level INT,
  note TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'general',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS milestones (
  id SERIAL PRIMARY KEY,
  patient_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  psychologist_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  achieved_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rituals (
  id SERIAL PRIMARY KEY,
  appointment_id INT NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  content_url VARCHAR(500),
  type VARCHAR(50),
  message TEXT
);

CREATE TABLE IF NOT EXISTS circles (
  id SERIAL PRIMARY KEY,
  psychologist_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS circle_members (
  circle_id INT NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (circle_id, user_id)
);
`;

module.exports = async (req, res) => {
  // Only allow POST or GET with correct key
  const key = req.query.key || '';
  if (key !== SEED_KEY) {
    res.status(401);
    return res.json({ error: 'Invalid seed key. Use ?key=activamente-deploy-2026' });
  }

  const startTime = Date.now();

  try {
    const pool = getPool();
    const client = await pool.connect();

    // Create tables
    const results = { tables: 0, users: 0, error: null };

    try {
      await client.query('BEGIN');

      // Run all CREATE TABLE statements
      const statements = CREATE_TABLES.split(';').filter(s => s.trim());
      for (const stmt of statements) {
        if (stmt.trim().toUpperCase().startsWith('CREATE')) {
          await client.query(stmt);
          results.tables++;
        }
      }

      // Create users
      const password = await hashPassword('password');
      const superPassword = await hashPassword('superadmin123');

      // SuperAdmin
      const superCheck = await client.query('SELECT id FROM users WHERE email = $1', ['superadmin@activamente.com']);
      if (superCheck.rows.length === 0) {
        await client.query(
          "INSERT INTO users (email, password, role, name) VALUES ($1, $2, 'superadmin', $3)",
          ['superadmin@activamente.com', superPassword, 'Super Admin']
        );
        results.users++;
      }

      // Psychologists
      const psychs = [
        { email: 'pedro.prieto@activamente.com', name: 'Pedro Alberto Prieto Lobo', specialty: 'Psicólogo', bio: 'Mi nombre es Pedro Alberto Prieto Lobo y te doy la bienvenida. Trabajo desde la terapia cognitivo conductual, un enfoque práctico y estructurado que busca entender cómo se relacionan tus pensamientos, tus emociones y tus acciones.', approach: 'Terapia Cognitivo Conductual (TCC)', price: 850, image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600' },
        { email: 'gabriel@activamente.com', name: 'Gabriel Cárdenas Sánchez', specialty: 'Psicólogo', bio: 'En mi trabajo como terapeuta valoro profundamente la interacción genuina, entendiendo la terapia como un encuentro humano además de profesional.', approach: 'Intervenciones basadas en evidencia', price: 750, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600' },
        { email: 'cristian@activamente.com', name: 'Cristian Hernández Cano', specialty: 'Psicólogo', bio: 'Mi trayectoria profesional se ha nutrido de una diversidad de experiencias que hoy fundamentan mi práctica clínica.', approach: 'Terapia Cognitivo-Conductual', price: 700, image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=600' }
      ];

      for (const p of psychs) {
        const existing = await client.query('SELECT id FROM users WHERE email = $1', [p.email]);
        if (existing.rows.length === 0) {
          const userResult = await client.query(
            "INSERT INTO users (email, password, role, name) VALUES ($1, $2, 'psychologist', $3) RETURNING id",
            [p.email, password, p.name]
          );
          const uid = userResult.rows[0].id;
          await client.query(
            'INSERT INTO psychologists (user_id, name, specialty, bio, approach, price, image) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [uid, p.name, p.specialty, p.bio, p.approach, p.price, p.image]
          );
          results.users++;
        }
      }

      // Patient
      const patientCheck = await client.query('SELECT id FROM users WHERE email = $1', ['paciente@example.com']);
      if (patientCheck.rows.length === 0) {
        await client.query(
          "INSERT INTO users (email, password, role, name) VALUES ($1, $2, 'patient', $3)",
          ['paciente@example.com', password, 'Paciente Ejemplo']
        );
        results.users++;
      }

      // News
      const newsCheck = await client.query('SELECT COUNT(*) as count FROM news');
      if (parseInt(newsCheck.rows[0].count) === 0) {
        await client.query(
          'INSERT INTO news (title, content, image_url) VALUES ($1, $2, $3)',
          ['Bienvenidos a Activamente', 'Nos complace anunciar el lanzamiento de Activamente, un espacio dedicado a la salud mental y el bienestar emocional.', 'https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&q=80&w=600']
        );
      }

      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    return res.json({
      success: true,
      message: 'Base de datos inicializada correctamente',
      tables_created: results.tables,
      users_created: results.users,
      elapsed_seconds: elapsed,
      accounts: {
        superadmin: 'superadmin@activamente.com / superadmin123',
        psychologist1: 'pedro.prieto@activamente.com / password',
        psychologist2: 'gabriel@activamente.com / password',
        psychologist3: 'cristian@activamente.com / password',
        patient: 'paciente@example.com / password'
      }
    });

  } catch (e) {
    console.error('Seed error:', e);
    res.status(500);
    return res.json({ error: e.message || 'Error al inicializar la base de datos' });
  }
};
