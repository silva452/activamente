<?php
require_once 'db.php';

try {
    // 1. Create appointments table
    $pdo->exec("CREATE TABLE IF NOT EXISTS appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        psychologist_id INT NOT NULL,
        patient_name VARCHAR(255) NOT NULL,
        patient_email VARCHAR(255) NOT NULL,
        patient_phone VARCHAR(50) NOT NULL,
        date DATE NOT NULL,
        time TIME NOT NULL,
        status VARCHAR(50) DEFAULT 'pendiente',
        reminder_sent TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (psychologist_id) REFERENCES users(id) ON DELETE CASCADE
    );");

    // 2. Create blog_posts table
    $pdo->exec("CREATE TABLE IF NOT EXISTS blog_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type VARCHAR(50) NOT NULL, -- 'video', 'article', 'link'
        title VARCHAR(255) NOT NULL,
        content TEXT,
        media_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );");

    // 3. Create testimonials table
    $pdo->exec("CREATE TABLE IF NOT EXISTS testimonials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        psychologist_id INT NOT NULL,
        patient_name VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        stars INT DEFAULT 5,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (psychologist_id) REFERENCES users(id) ON DELETE CASCADE
    );");

    // 4. Update forum_posts with is_anonymous
    $stmt = $pdo->query("SHOW COLUMNS FROM forum_posts LIKE 'is_anonymous'");
    if (!$stmt->fetch()) {
        $pdo->exec("ALTER TABLE forum_posts ADD COLUMN is_anonymous TINYINT(1) DEFAULT 0;");
    }

    // 5. Create news table
    $pdo->exec("CREATE TABLE IF NOT EXISTS news (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        image_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );");

    // 6. Create site_testimonials table
    $pdo->exec("CREATE TABLE IF NOT EXISTS site_testimonials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        stars INT DEFAULT 5,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );");

    // --- MASTERPIECE EXPANSION ---

    // 7. Update psychologists with Masterpiece columns
    $psych_cols = [
        'audio_url' => "VARCHAR(255)",
        'whatsapp_number' => "VARCHAR(50)",
        'instagram' => "VARCHAR(255)",
        'linkedin' => "VARCHAR(255)",
        'values_tags' => "TEXT", // JSON of vibrartional tags
        'profile_vibe' => "VARCHAR(50) DEFAULT 'zen'" // 'zen', 'energy', 'mountain', 'ocean'
    ];
    foreach ($psych_cols as $col => $type) {
        $stmt = $pdo->query("SHOW COLUMNS FROM psychologists LIKE '$col'");
        if (!$stmt->fetch()) {
            $pdo->exec("ALTER TABLE psychologists ADD COLUMN $col $type;");
        }
    }

    // 8. Update blog_posts for PDF support
    $stmt = $pdo->query("SHOW COLUMNS FROM blog_posts LIKE 'pdf_url'");
    if (!$stmt->fetch()) {
        $pdo->exec("ALTER TABLE blog_posts ADD COLUMN pdf_url VARCHAR(255);");
    }

    // 9. Create treatment_steps (Journey)
    $pdo->exec("CREATE TABLE IF NOT EXISTS treatment_steps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        psychologist_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        sort_order INT DEFAULT 0,
        FOREIGN KEY (psychologist_id) REFERENCES users(id) ON DELETE CASCADE
    );");

    // 10. Create Assessment System (Tests)
    $pdo->exec("CREATE TABLE IF NOT EXISTS custom_tests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        psychologist_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (psychologist_id) REFERENCES users(id) ON DELETE CASCADE
    );");

    $pdo->exec("CREATE TABLE IF NOT EXISTS test_questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        test_id INT NOT NULL,
        question_text TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'choice',
        options_json TEXT, -- For multiple choice
        FOREIGN KEY (test_id) REFERENCES custom_tests(id) ON DELETE CASCADE
    );");

    $pdo->exec("CREATE TABLE IF NOT EXISTS test_results (
        id INT AUTO_INCREMENT PRIMARY KEY,
        test_id INT NOT NULL,
        patient_name VARCHAR(255),
        patient_email VARCHAR(255),
        answers_json TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (test_id) REFERENCES custom_tests(id) ON DELETE CASCADE
    );");

    // 11. Create Sanctuary Vaults (Documents)
    $pdo->exec("CREATE TABLE IF NOT EXISTS patient_documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT, -- If registered
        patient_email VARCHAR(255),
        psychologist_id INT NOT NULL,
        file_url VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (psychologist_id) REFERENCES users(id) ON DELETE CASCADE
    );");

    // 12. Create Mood Echoes & Milestones
    $pdo->exec("CREATE TABLE IF NOT EXISTS mood_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        mood_score INT, -- 1-10
        energy_level INT, -- 1-10
        note TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );");

    $pdo->exec("CREATE TABLE IF NOT EXISTS milestones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        psychologist_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        achieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (psychologist_id) REFERENCES users(id) ON DELETE CASCADE
    );");

    // 13. Create Rituals & Circles
    $pdo->exec("CREATE TABLE IF NOT EXISTS rituals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        appointment_id INT NOT NULL,
        content_url VARCHAR(255),
        type VARCHAR(50), -- 'audio', 'video', 'text'
        message TEXT,
        FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
    );");

    $pdo->exec("CREATE TABLE IF NOT EXISTS circles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        psychologist_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (psychologist_id) REFERENCES users(id) ON DELETE CASCADE
    );");

    $pdo->exec("CREATE TABLE IF NOT EXISTS circle_members (
        circle_id INT NOT NULL,
        user_id INT NOT NULL,
        PRIMARY KEY (circle_id, user_id),
        FOREIGN KEY (circle_id) REFERENCES circles(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );");

    // 14. Visibility update
    $tables_to_update = ['psychologists', 'site_testimonials', 'forum_posts', 'custom_tests', 'circles'];
    foreach ($tables_to_update as $table) {
        $stmt = $pdo->query("SHOW COLUMNS FROM $table LIKE 'is_active'");
        if (!$stmt->fetch()) {
            $pdo->exec("ALTER TABLE $table ADD COLUMN is_active TINYINT(1) DEFAULT 1;");
        }
    }

    // 15. Ensure superadmin
    $super_email = 'superadmin@activamente.com';

    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$super_email]);
    if (!$stmt->fetch()) {
        $hashed = password_hash('superadmin123', PASSWORD_DEFAULT);
        $pdo->prepare("INSERT INTO users (email, password, role) VALUES (?, ?, 'superadmin')")
            ->execute([$super_email, $hashed]);
    }

    // 16. Patient system & new features
    $stmt = $pdo->query("SHOW COLUMNS FROM psychologists LIKE 'modality'");
    if (!$stmt->fetch()) {
        $pdo->exec("ALTER TABLE psychologists ADD COLUMN modality VARCHAR(50) DEFAULT 'ambos';");
    }
    $stmt = $pdo->query("SHOW COLUMNS FROM appointments LIKE 'patient_id'");
    if (!$stmt->fetch()) {
        $pdo->exec("ALTER TABLE appointments ADD COLUMN patient_id INT NULL;");
    }
    $stmt = $pdo->query("SHOW COLUMNS FROM appointments LIKE 'modality'");
    if (!$stmt->fetch()) {
        $pdo->exec("ALTER TABLE appointments ADD COLUMN modality VARCHAR(50) DEFAULT 'online';");
    }
    $stmt = $pdo->query("SHOW COLUMNS FROM testimonials LIKE 'appointment_id'");
    if (!$stmt->fetch()) {
        $pdo->exec("ALTER TABLE testimonials ADD COLUMN appointment_id INT NULL;");
    }
    $stmt = $pdo->query("SHOW COLUMNS FROM testimonials LIKE 'is_verified'");
    if (!$stmt->fetch()) {
        $pdo->exec("ALTER TABLE testimonials ADD COLUMN is_verified TINYINT(1) DEFAULT 0;");
    }
    $stmt = $pdo->query("SHOW COLUMNS FROM appointments LIKE 'reminder_sent'");
    if (!$stmt->fetch()) {
        $pdo->exec("ALTER TABLE appointments ADD COLUMN reminder_sent TINYINT(1) NOT NULL DEFAULT 0;");
    }
    $pdo->exec("CREATE TABLE IF NOT EXISTS contact_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(255),
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'general',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );");
    $stmt = $pdo->query("SHOW COLUMNS FROM users LIKE 'name'");
    if (!$stmt->fetch()) {
        $pdo->exec("ALTER TABLE users ADD COLUMN name VARCHAR(255);");
    }

    echo "✅ Database migrated successfully. Admin: admin@activamente.com, SuperAdmin: superadmin@activamente.com / superadmin123";
}
catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage();
}
?>
