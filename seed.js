// Database seed script for Vercel Postgres
// Run: node seed.js
// Needs env vars: POSTGRES_URL

const { Pool } = require('pg');
const { hashPassword } = require('./lib/auth');

async function seed() {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ POSTGRES_URL or DATABASE_URL environment variable required');
    console.log('   Use: $env:POSTGRES_URL="postgresql://..."');
    process.exit(1);
  }

  const pool = new Pool({ connectionString });
  console.log('🌱 Seeding database...\n');

  try {
    // === CREATE TABLES ===
    console.log('📦 Creating tables...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'psychologist',
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
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
    `);

    await pool.query(`
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
    `);

    await pool.query(`
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
    `);

    await pool.query(`
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
    `);

    await pool.query(`
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
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS news (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        image_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_testimonials (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        stars INT DEFAULT 5,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS treatment_steps (
        id SERIAL PRIMARY KEY,
        psychologist_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        sort_order INT DEFAULT 0
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS custom_tests (
        id SERIAL PRIMARY KEY,
        psychologist_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS test_questions (
        id SERIAL PRIMARY KEY,
        test_id INT NOT NULL REFERENCES custom_tests(id) ON DELETE CASCADE,
        question_text TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'choice',
        options_json TEXT
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS test_results (
        id SERIAL PRIMARY KEY,
        test_id INT NOT NULL REFERENCES custom_tests(id) ON DELETE CASCADE,
        patient_name VARCHAR(255),
        patient_email VARCHAR(255),
        answers_json TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS patient_documents (
        id SERIAL PRIMARY KEY,
        patient_id INT REFERENCES users(id) ON DELETE SET NULL,
        patient_email VARCHAR(255),
        psychologist_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        file_url VARCHAR(500) NOT NULL,
        title VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS mood_logs (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        mood_score INT,
        energy_level INT,
        note TEXT,
        timestamp TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(255),
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'general',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS milestones (
        id SERIAL PRIMARY KEY,
        patient_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        psychologist_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        achieved_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS rituals (
        id SERIAL PRIMARY KEY,
        appointment_id INT NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
        content_url VARCHAR(500),
        type VARCHAR(50),
        message TEXT
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS circles (
        id SERIAL PRIMARY KEY,
        psychologist_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS circle_members (
        circle_id INT NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        PRIMARY KEY (circle_id, user_id)
      );
    `);

    console.log('✅ All tables created!\n');

    // === SEED DATA ===
    console.log('🌱 Seeding initial data...');

    // Create superadmin
    const superAdminEmail = 'superadmin@activamente.com';
    const existingSuper = await pool.query('SELECT id FROM users WHERE email = $1', [superAdminEmail]);
    if (existingSuper.rows.length === 0) {
      const hashed = await hashPassword('superadmin123');
      await pool.query(
        'INSERT INTO users (email, password, role, name) VALUES ($1, $2, $3, $4)',
        [superAdminEmail, hashed, 'superadmin', 'Super Admin']
      );
      console.log('  ✓ SuperAdmin created (superadmin@activamente.com / superadmin123)');
    }

    // Create seed psychologists
    const psychologists = [
      {
        email: 'pedro.prieto@activamente.com',
        name: 'Pedro Alberto Prieto Lobo',
        specialty: 'Psicólogo',
        bio: 'Mi nombre es Pedro Alberto Prieto Lobo y te doy la bienvenida. Trabajo desde la terapia cognitivo conductual, un enfoque práctico y estructurado que busca entender cómo se relacionan tus pensamientos, tus emociones y tus acciones. Mi papel no es solo escucharte, sino brindarte herramientas concretas que puedas aplicar en tu vida diaria para afrontar las dificultades de una manera más saludable.',
        education: '',
        approach: 'Terapia Cognitivo Conductual (TCC)',
        price: 850,
        image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600'
      },
      {
        email: 'gabriel@activamente.com',
        name: 'Gabriel Cárdenas Sánchez',
        specialty: 'Psicólogo',
        bio: 'En mi trabajo como terapeuta valoro profundamente la interacción genuina, entendiendo la terapia como un encuentro humano además de profesional. Esta visión también implica una responsabilidad constante por seguir formándome y trabajar con intervenciones basadas en evidencia, buscando ofrecer procesos terapéuticos de calidad y orientados al cumplimiento de objetivos en cada sesión.',
        education: '',
        approach: 'Intervenciones basadas en evidencia',
        price: 750,
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600'
      },
      {
        email: 'cristian@activamente.com',
        name: 'Cristian Hernández Cano',
        specialty: 'Psicólogo',
        bio: 'Mi trayectoria profesional se ha nutrido de una diversidad de experiencias que hoy fundamentan mi práctica clínica. He tenido la oportunidad de trabajar en el sector público, colaborando con la Dirección General de Seguridad Ciudadana, donde desarrollé una sólida capacidad para la intervención en crisis.',
        education: '',
        approach: 'Terapia Cognitivo-Conductual',
        price: 700,
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=600'
      }
    ];

    for (const p of psychologists) {
      const existing = await pool.query('SELECT id FROM users WHERE email = $1', [p.email]);
      if (existing.rows.length === 0) {
        const hashed = await hashPassword('password');
        const userResult = await pool.query(
          'INSERT INTO users (email, password, role, name) VALUES ($1, $2, $3, $4) RETURNING id',
          [p.email, hashed, 'psychologist', p.name]
        );
        const uid = userResult.rows[0].id;
        await pool.query(
          `INSERT INTO psychologists (user_id, name, specialty, bio, education, approach, price, image)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [uid, p.name, p.specialty, p.bio, p.education, p.approach, p.price, p.image]
        );
        console.log(`  ✓ Created psychologist: ${p.name}`);
      } else {
        console.log(`  · Skipped (exists): ${p.name}`);
      }
    }

    // Create example patient
    const patientEmail = 'paciente@example.com';
    const existingPatient = await pool.query('SELECT id FROM users WHERE email = $1', [patientEmail]);
    if (existingPatient.rows.length === 0) {
      const hashed = await hashPassword('password');
      await pool.query(
        'INSERT INTO users (email, password, role, name) VALUES ($1, $2, $3, $4)',
        [patientEmail, hashed, 'patient', 'Paciente Ejemplo']
      );
      console.log('  ✓ Patient created (paciente@example.com / password)');
    }

    // Create example news
    const newsCount = await pool.query('SELECT COUNT(*) FROM news');
    if (parseInt(newsCount.rows[0].count) === 0) {
      await pool.query(
        `INSERT INTO news (title, content, image_url) VALUES ($1, $2, $3)`,
        [
          'Bienvenidos a Activamente',
          'Nos complace anunciar el lanzamiento de Activamente, un espacio dedicado a la salud mental y el bienestar emocional. Contamos con un equipo de profesionales comprometidos con tu bienestar.',
          'https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&q=80&w=600'
        ]
      );
      console.log('  ✓ News article created');
    }

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📋 Accounts:');
    console.log('  SuperAdmin: superadmin@activamente.com / superadmin123');
    console.log('  Psychologists: pedro.prieto@activamente.com / password');
    console.log('                gabriel@activamente.com / password');
    console.log('                cristian@activamente.com / password');
    console.log('  Patient: paciente@example.com / password');

  } catch (e) {
    console.error('❌ Seed error:', e);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
