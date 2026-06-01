<?php
require_once 'db.php';

try {
    // 1. Create a Maestro Psychologist User
    $email = 'maestro@activamente.com';
    $pass = password_hash('maestro123', PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO users (email, password, role) VALUES (?, ?, 'psychologist')");
    $stmt->execute([$email, $pass]);
    $userId = $pdo->lastInsertId();

    // 2. Create the Masterpiece Profile
    $stmt = $pdo->prepare("INSERT INTO psychologists (user_id, name, specialty, bio, education, approach, price, rating, reviews_count, profile_vibe, whatsapp_number, audio_url) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $userId,
        'Dr. Aurelio Zen',
        'Psicología Transpersonal & Alta Performance',
        'Guío a líderes y visionarios hacia el equilibrio profundo a través de la maestría mental y la serenidad clínica.',
        'Doctorado en Psicología Clínica - Stanford. Maestría en Mindfulness Oriental.',
        'Enfoque holístico basado en la integración de la ciencia cognitiva y la sabiduría ancestral.',
        2500,
        5.0,
        42,
        'zen',
        '+521234567890',
        'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' // Placeholder audio
    ]);

    // 3. Seed Growth Journey
    $steps = [
        ['Despertar de la Consciencia', 'Identificación de patrones limitantes y apertura al cambio.'],
        ['Abismo de Reflexión', 'Navegar las sombras emocionales con herramientas de resiliencia.'],
        ['Trascendencia Activa', 'Implementación de nuevos hábitos de paz y propósito.'],
        ['Maestría del Ser', 'Consolidación del equilibrio y liderazgo emocional.']
    ];
    $stmt = $pdo->prepare("INSERT INTO treatment_steps (psychologist_id, title, description, sort_order) VALUES (?, ?, ?, ?)");
    foreach ($steps as $i => $s) {
        $stmt->execute([$userId, $s[0], $s[1], $i]);
    }

    // 4. Seed a Custom Test
    $pdo->prepare("INSERT INTO custom_tests (psychologist_id, title, description) VALUES (?, ?, ?)")
        ->execute([$userId, 'Escala de Serenidad Interior', 'Evalúa tu estado actual de calma y presencia ante el caos cotidiano.']);
    $testId = $pdo->lastInsertId();

    $questions = [
        '¿Con qué frecuencia logras observar tus pensamientos sin identificarte con ellos?',
        'Describe un momento de esta semana donde la calma fue tu elección consciente.',
        '¿Qué hito de tu paz interior te gustaría alcanzar en este ciclo?'
    ];
    $stmt = $pdo->prepare("INSERT INTO test_questions (test_id, question_text) VALUES (?, ?)");
    foreach ($questions as $q) {
        $stmt->execute([$testId, $q]);
    }

    // 5. Seed Blog Posts
    $pdo->prepare("INSERT INTO blog_posts (user_id, type, title, content) VALUES (?, ?, ?, ?)")
        ->execute([$userId, 'article', 'El Silencio como Herramienta de Poder', 'En la quietud encontramos las respuestas que el ruido nos oculta...']);

    // 6. Seed Site Testimonials
    $pdo->exec("INSERT INTO site_testimonials (name, content, stars) VALUES ('Elena R.', 'Activamente cambió mi forma de ver la salud mental. Es un refugio de paz.', 5)");

    echo "✨ Masterpiece Seeded Successfully! Login: maestro@activamente.com / maestro123";
} catch (Exception $e) {
    echo "❌ Error Seeding: " . $e->getMessage();
}
?>
