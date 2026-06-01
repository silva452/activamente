<?php
/**
 * setup.php - Expanded Doctoralia-Style Database Setup
 */

$host = 'localhost';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $pdo->exec("CREATE DATABASE IF NOT EXISTS activamente;");
    $pdo->exec("USE activamente;");

    // Standard tables (same as before)
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(255) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL, role VARCHAR(50) DEFAULT 'psychologist', name VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);");

    $pdo->exec("CREATE TABLE IF NOT EXISTS psychologists (
        user_id INT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        specialty VARCHAR(255),
        bio TEXT,
        education TEXT,
        approach TEXT,
        languages VARCHAR(255) DEFAULT 'Español',
        location VARCHAR(255) DEFAULT 'Consulta Online',
        price DECIMAL(10,2) DEFAULT 0.00,
        image VARCHAR(255),
        rating DECIMAL(2,1) DEFAULT 5.0,
        reviews_count INT DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );");

    $pdo->exec("CREATE TABLE IF NOT EXISTS forum_posts (id INT AUTO_INCREMENT PRIMARY KEY, author_id INT, author_email VARCHAR(255), title VARCHAR(255) NOT NULL, content TEXT NOT NULL, timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP);");

    // Seed Data: Professional & Diverse
    $pass_hash = password_hash('password', PASSWORD_DEFAULT);

    $psychs = [
        ['dr_ramirez@activamente.com', 'Dr. Alberto Ramírez', 'Psiquiatría y Psicoterapia', 'Especialista en trastornos del ánimo y medicina psicosomática con formación en el extranjero.', 'Especialización en Psiquiatría - Harvard', 'Terapia Farmacológica y TCC', '1200', '4.9', '215', 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400'],
        ['dra_marquez@activamente.com', 'Dra. Sofía Márquez', 'Psicología Infantil y Adolescente', 'Apoyo integral para el desarrollo emocional de niños y jóvenes. Enfoque lúdico y empático.', 'Maestría en Clínica Infantil - IBERO', 'Terapia de Juego', '950', '4.8', '158', 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=400'],
        ['lic_torres@activamente.com', 'Lic. Carmen Torres', 'Terapia de Pareja y Sexualidad', 'Ayudando a construir relaciones sanas y comunicación asertiva en entornos complejos.', 'Especialidad en Terapia Familiar', 'Terapia Sistémica', '800', '5.0', '89', 'https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=400']
    ];

    foreach ($psychs as $p) {
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$p[0]]);
        if (!$stmt->fetch()) {
            $pdo->prepare("INSERT INTO users (email, password) VALUES (?, ?)")->execute([$p[0], $pass_hash]);
            $uid = $pdo->lastInsertId();
            $pdo->prepare("INSERT INTO psychologists (user_id, name, specialty, bio, education, approach, price, rating, reviews_count, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
                ->execute([$uid, $p[1], $p[2], $p[3], $p[4], $p[5], $p[6], $p[7], $p[8], $p[9]]);
        }
    }

    // Add new columns if they don't exist
    $new_cols = [
        'psychologists' => ['modality' => "VARCHAR(50) DEFAULT 'ambos'"],
        'users'         => ['name' => "VARCHAR(255)"]
    ];
    foreach ($new_cols as $tbl => $cols) {
        foreach ($cols as $col => $type) {
            $s = $pdo->query("SHOW COLUMNS FROM $tbl LIKE '$col'");
            if (!$s->fetch()) $pdo->exec("ALTER TABLE $tbl ADD COLUMN $col $type;");
        }
    }

    $apt_cols = ['patient_id' => "INT NULL", 'modality' => "VARCHAR(50) DEFAULT 'online'", 'reminder_sent' => "TINYINT(1) NOT NULL DEFAULT 0"];
    foreach ($apt_cols as $col => $type) {
        try {
            $s = $pdo->query("SHOW COLUMNS FROM appointments LIKE '$col'");
            if (!$s->fetch()) $pdo->exec("ALTER TABLE appointments ADD COLUMN $col $type;");
        } catch(Exception $e) {}
    }

    $test_cols = ['appointment_id' => "INT NULL", 'is_verified' => "TINYINT(1) DEFAULT 0"];
    foreach ($test_cols as $col => $type) {
        try {
            $s = $pdo->query("SHOW COLUMNS FROM testimonials LIKE '$col'");
            if (!$s->fetch()) $pdo->exec("ALTER TABLE testimonials ADD COLUMN $col $type;");
        } catch(Exception $e) {}
    }

    $pdo->exec("CREATE TABLE IF NOT EXISTS contact_messages (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, subject VARCHAR(255), message TEXT NOT NULL, type VARCHAR(50) DEFAULT 'general', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);");

    echo "✅ Base de datos lista con todas las migraciones.<br>";
    echo "<a href='index.html'>Ir a Activamente →</a>";

}
catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
