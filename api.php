<?php
// api.php - Data API for Activamente
require_once 'db.php';
header('Content-Type: application/json');

/** Buzón único para avisos del formulario de contacto (y futuros avisos del sitio). */
const ACTIVAMENTE_INBOX_EMAIL = 'activamentecorreo2026@gmail.com';

$action = $_GET['action'] ?? '';

try {
    if ($action == 'get_psychologists') {
        $search   = $_GET['search']    ?? '';
        $modality = $_GET['modality']  ?? '';
        $priceMax = $_GET['price_max'] ?? '';
        $specialty = $_GET['specialty'] ?? '';

        $where  = ["p.is_active = 1"];
        $params = [];

        if ($search) {
            $where[]  = "(p.name LIKE ? OR p.specialty LIKE ? OR p.bio LIKE ?)";
            $params[] = "%$search%";
            $params[] = "%$search%";
            $params[] = "%$search%";
        }
        if ($specialty) {
            $where[]  = "p.specialty LIKE ?";
            $params[] = "%$specialty%";
        }
        if ($modality && $modality !== 'todos') {
            $where[]  = "(p.modality = ? OR p.modality = 'ambos')";
            $params[] = $modality;
        }
        if ($priceMax) {
            $where[]  = "p.price <= ?";
            $params[] = (float)$priceMax;
        }

        $sql  = "SELECT p.*, u.email FROM psychologists p JOIN users u ON p.user_id = u.id WHERE " . implode(" AND ", $where);
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        echo json_encode($stmt->fetchAll());
    }

    elseif ($action == 'get_forum') {
        $stmt = $pdo->query("SELECT * FROM forum_posts WHERE is_active = 1 ORDER BY timestamp DESC");
        echo json_encode($stmt->fetchAll());
    }

    elseif ($action == 'post_forum') {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data)
            throw new Exception("No data provided");

        $stmt = $pdo->prepare("INSERT INTO forum_posts (author_email, title, content, is_anonymous) VALUES (?, ?, ?, ?)");
        $stmt->execute([
            $data['is_anonymous'] ? 'Anónimo' : $data['author_email'],
            $data['title'],
            $data['content'],
            $data['is_anonymous'] ? 1 : 0
        ]);
        echo json_encode(['success' => true]);
    }

    elseif ($action == 'get_my_profile') {
        session_start();
        $uid = $_SESSION['user_id'] ?? null;
        if (!$uid)
            throw new Exception("No autorizado");
        $stmt = $pdo->prepare("SELECT * FROM psychologists WHERE user_id = ?");
        $stmt->execute([$uid]);
        echo json_encode($stmt->fetch());
    }

    elseif ($action == 'update_profile') {
        session_start();
        $uid = $_SESSION['user_id'] ?? null;
        if (!$uid)
            throw new Exception("No autorizado");

        $image_url = null;
        if (isset($_FILES['image_file']) && $_FILES['image_file']['error'] === UPLOAD_ERR_OK) {
            $ext = pathinfo($_FILES['image_file']['name'], PATHINFO_EXTENSION);
            $filename = 'prof_' . $uid . '_' . time() . '.' . $ext;
            $target = 'uploads/' . $filename;
            if (move_uploaded_file($_FILES['image_file']['tmp_name'], $target)) {
                $image_url = $target;
            }
        }

        $audio_url = null;
        if (isset($_FILES['audio_file']) && $_FILES['audio_file']['error'] === UPLOAD_ERR_OK) {
            $ext = pathinfo($_FILES['audio_file']['name'], PATHINFO_EXTENSION);
            $filename = 'audio_' . $uid . '_' . time() . '.' . $ext;
            $target = 'uploads/' . $filename;
            if (move_uploaded_file($_FILES['audio_file']['tmp_name'], $target)) {
                $audio_url = $target;
            }
        }

        $data = !empty($_POST) ? $_POST : json_decode(file_get_contents('php://input'), true);
        if (!$image_url && isset($data['image']))
            $image_url = $data['image'];
        if (!$audio_url && isset($data['audio_url']))
            $audio_url = $data['audio_url'];

        $stmt = $pdo->prepare("UPDATE psychologists SET name=?, specialty=?, bio=?, education=?, approach=?, price=?, image=?, audio_url=?, whatsapp_number=?, instagram=?, linkedin=?, values_tags=?, profile_vibe=? WHERE user_id=?");
        $stmt->execute([
            $data['name'] ?? '',
            $data['specialty'] ?? '',
            $data['bio'] ?? '',
            $data['education'] ?? '',
            $data['approach'] ?? '',
            $data['price'] ?? 0,
            $image_url,
            $audio_url,
            $data['whatsapp_number'] ?? '',
            $data['instagram'] ?? '',
            $data['linkedin'] ?? '',
            $data['values_tags'] ?? '',
            $data['profile_vibe'] ?? 'zen',
            $uid
        ]);
        echo json_encode(['success' => true]);
    }

    elseif ($action == 'book_appointment') {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data)
            throw new Exception("Datos incompletos");

        session_start();
        $patient_id = $_SESSION['user_id'] ?? null;
        $stmt = $pdo->prepare("INSERT INTO appointments (psychologist_id, patient_id, patient_name, patient_email, patient_phone, date, time, modality) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['psychologist_id'],
            $patient_id,
            $data['name'],
            $data['email'],
            $data['phone'],
            $data['date'],
            $data['time'],
            $data['modality'] ?? 'online'
        ]);
        echo json_encode(['success' => true, 'appointment_id' => (int)$pdo->lastInsertId()]);
    }

    elseif ($action == 'get_appointments') {
        session_start();
        $uid = $_SESSION['user_id'] ?? null;
        if (!$uid)
            throw new Exception("No autorizado");

        $stmt = $pdo->prepare("SELECT * FROM appointments WHERE psychologist_id = ? ORDER BY date ASC, time ASC");
        $stmt->execute([$uid]);
        echo json_encode($stmt->fetchAll());
    }

    elseif ($action == 'get_blog') {
        $uid = $_GET['user_id'] ?? null;
        if ($uid) {
            $stmt = $pdo->prepare("SELECT b.*, p.name as author_name FROM blog_posts b JOIN psychologists p ON b.user_id = p.user_id WHERE b.user_id = ? ORDER BY b.created_at DESC");
            $stmt->execute([$uid]);
        }
        else {
            $stmt = $pdo->query("SELECT b.*, p.name as author_name FROM blog_posts b JOIN psychologists p ON b.user_id = p.user_id ORDER BY b.created_at DESC LIMIT 20");
        }
        echo json_encode($stmt->fetchAll());
    }

    elseif ($action == 'post_blog') {
        session_start();
        $uid = $_SESSION['user_id'] ?? null;
        if (!$uid)
            throw new Exception("No autorizado");

        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("INSERT INTO blog_posts (user_id, type, title, content, media_url) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([
            $uid,
            $data['type'],
            $data['title'],
            $data['content'],
            $data['media_url']
        ]);
        echo json_encode(['success' => true]);
    }

    elseif ($action == 'get_testimonials') {
        $uid = $_GET['user_id'] ?? null;
        if (!$uid)
            throw new Exception("Especialista no especificado");

        $stmt = $pdo->prepare("SELECT * FROM testimonials WHERE psychologist_id = ? ORDER BY created_at DESC");
        $stmt->execute([$uid]);
        echo json_encode($stmt->fetchAll());
    }

    elseif ($action == 'get_news') {
        $stmt = $pdo->query("SELECT * FROM news ORDER BY created_at DESC");
        echo json_encode($stmt->fetchAll());
    }

    elseif ($action == 'post_news') {
        session_start();
        if (!in_array(($_SESSION['role'] ?? ''), ['admin', 'superadmin']))
            throw new Exception("Solo el administrador puede publicar noticias.");

        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("INSERT INTO news (title, content, image_url) VALUES (?, ?, ?)");
        $stmt->execute([$data['title'], $data['content'], $data['image_url']]);
        echo json_encode(['success' => true]);
    }

    elseif ($action == 'get_site_testimonials') {
        $stmt = $pdo->query("SELECT * FROM site_testimonials WHERE is_active = 1 ORDER BY created_at DESC");
        echo json_encode($stmt->fetchAll());
    }

    elseif ($action == 'post_site_testimonial') {
        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['name']) || empty($data['content']))
            throw new Exception("Datos incompletos.");

        $stmt = $pdo->prepare("INSERT INTO site_testimonials (name, content, stars) VALUES (?, ?, ?)");
        $stmt->execute([$data['name'], $data['content'], $data['stars'] ?? 5]);
        echo json_encode(['success' => true]);
    }

    elseif ($action == 'get_journey') {
        $uid = $_GET['user_id'] ?? null;
        if (!$uid) throw new Exception("ID omitido");
        $stmt = $pdo->prepare("SELECT * FROM treatment_steps WHERE psychologist_id = ? ORDER BY sort_order ASC");
        $stmt->execute([$uid]);
        echo json_encode($stmt->fetchAll());
    }

    elseif ($action == 'post_journey') {
        session_start();
        $uid = $_SESSION['user_id'] ?? null;
        if (!$uid) throw new Exception("No autorizado");
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("INSERT INTO treatment_steps (psychologist_id, title, description, sort_order) VALUES (?, ?, ?, ?)");
        $stmt->execute([$uid, $data['title'], $data['description'], $data['sort_order'] ?? 0]);
        echo json_encode(['success' => true]);
    }

    elseif ($action == 'post_mood') {
        session_start();
        $uid = $_SESSION['user_id'] ?? null;
        if (!$uid) throw new Exception("Debes iniciar sesión para registrar tu estado");
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("INSERT INTO mood_logs (user_id, mood_score, energy_level, note) VALUES (?, ?, ?, ?)");
        $stmt->execute([$uid, $data['mood_score'], $data['energy_level'], $data['note'] ?? '']);
        echo json_encode(['success' => true]);
    }

    elseif ($action == 'get_mood_history') {
        session_start();
        $uid = $_SESSION['user_id'] ?? null;
        if (!$uid) throw new Exception("No autorizado");
        $stmt = $pdo->prepare("SELECT * FROM mood_logs WHERE user_id = ? ORDER BY timestamp DESC LIMIT 30");
        $stmt->execute([$uid]);
        echo json_encode($stmt->fetchAll());
    }

    elseif ($action == 'get_tests') {
        $uid = $_GET['user_id'] ?? null;
        if (!$uid) throw new Exception("ID omitido");
        $stmt = $pdo->prepare("SELECT * FROM custom_tests WHERE psychologist_id = ? AND is_active = 1");
        $stmt->execute([$uid]);
        $tests = $stmt->fetchAll();
        // Also fetch questions for each test if requested
        if (isset($_GET['full'])) {
            foreach ($tests as &$t) {
                $qStmt = $pdo->prepare("SELECT * FROM test_questions WHERE test_id = ?");
                $qStmt->execute([$t['id']]);
                $t['questions'] = $qStmt->fetchAll();
            }
        }
        echo json_encode($tests);
    }

    elseif ($action == 'submit_test') {
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("INSERT INTO test_results (test_id, patient_name, patient_email, answers_json) VALUES (?, ?, ?, ?)");
        $stmt->execute([$data['test_id'], $data['name'], $data['email'], json_encode($data['answers'])]);
        echo json_encode(['success' => true]);
    }

    elseif ($action == 'get_vault_docs') {
        session_start();
        $uid = $_SESSION['user_id'] ?? null;
        $email = $_SESSION['email'] ?? null;
        if (!$uid) throw new Exception("No autorizado");
        
        $role = $_SESSION['role'] ?? '';
        if ($role === 'psychologist') {
            $stmt = $pdo->prepare("SELECT * FROM patient_documents WHERE psychologist_id = ?");
            $stmt->execute([$uid]);
        } else {
            $stmt = $pdo->prepare("SELECT * FROM patient_documents WHERE patient_email = ? OR patient_id = ?");
            $stmt->execute([$email, $uid]);
        }
        echo json_encode($stmt->fetchAll());
    }

    elseif ($action == 'upload_vault_doc') {
        session_start();
        $uid = $_SESSION['user_id'] ?? null;
        if (($_SESSION['role'] ?? '') !== 'psychologist') throw new Exception("Solo maestros pueden subir a la bóveda");

        $title = $_POST['title'] ?? 'Documento sin título';
        $p_email = $_POST['patient_email'] ?? '';
        
        if (isset($_FILES['doc_file']) && $_FILES['doc_file']['error'] === UPLOAD_ERR_OK) {
            $filename = 'vault_' . time() . '_' . $_FILES['doc_file']['name'];
            $target = 'uploads/' . $filename;
            if (move_uploaded_file($_FILES['doc_file']['tmp_name'], $target)) {
                $stmt = $pdo->prepare("INSERT INTO patient_documents (psychologist_id, patient_email, file_url, title) VALUES (?, ?, ?, ?)");
                $stmt->execute([$uid, $p_email, $target, $title]);
                echo json_encode(['success' => true, 'url' => $target]);
            } else {
                throw new Exception("Error al mover archivo");
            }
        } else {
            throw new Exception("Archivo no subido");
        }
    }

    elseif ($action == 'get_rituals') {
        session_start();
        $email = $_SESSION['email'] ?? '';
        if (!$email) throw new Exception("No autorizado");
        $stmt = $pdo->prepare("SELECT r.*, a.date FROM rituals r JOIN appointments a ON r.appointment_id = a.id WHERE a.patient_email = ? ORDER BY a.date DESC LIMIT 1");
        $stmt->execute([$email]);
        echo json_encode($stmt->fetch());
    }

    elseif ($action == 'get_patient_appointments') {
        session_start();
        $email = $_SESSION['email'] ?? null;
        $uid   = $_SESSION['user_id'] ?? null;
        if (!$email) throw new Exception("No autorizado");

        $stmt = $pdo->prepare("
            SELECT a.*, p.name as psychologist_name, p.specialty, p.image, p.price
            FROM appointments a
            JOIN psychologists p ON a.psychologist_id = p.user_id
            WHERE a.patient_email = ? OR a.patient_id = ?
            ORDER BY a.date DESC, a.time DESC
        ");
        $stmt->execute([$email, $uid ?? 0]);
        $appointments = $stmt->fetchAll();

        foreach ($appointments as &$appt) {
            $tStmt = $pdo->prepare("SELECT id FROM testimonials WHERE appointment_id = ?");
            $tStmt->execute([$appt['id']]);
            $appt['has_review'] = (bool)$tStmt->fetch();
        }
        echo json_encode($appointments);
    }

    elseif ($action == 'cancel_appointment') {
        session_start();
        $email = $_SESSION['email'] ?? null;
        if (!$email) throw new Exception("No autorizado");
        $id = $_GET['id'] ?? null;
        $stmt = $pdo->prepare("UPDATE appointments SET status = 'cancelada' WHERE id = ? AND patient_email = ? AND status = 'pendiente'");
        $stmt->execute([$id, $email]);
        echo json_encode(['success' => true]);
    }

    elseif ($action == 'confirm_appointment') {
        session_start();
        $uid  = $_SESSION['user_id'] ?? null;
        $role = $_SESSION['role']    ?? '';
        if (!$uid || $role !== 'psychologist') throw new Exception("No autorizado");
        $id     = $_GET['id']     ?? null;
        $status = $_GET['status'] ?? 'confirmada';
        $allowed = ['confirmada', 'cancelada', 'completada'];
        if (!in_array($status, $allowed)) throw new Exception("Estado inválido");
        $stmt = $pdo->prepare("UPDATE appointments SET status = ? WHERE id = ? AND psychologist_id = ?");
        $stmt->execute([$status, $id, $uid]);
        echo json_encode(['success' => true]);
    }

    elseif ($action == 'post_verified_testimonial') {
        session_start();
        $email = $_SESSION['email'] ?? null;
        if (!$email) throw new Exception("Debes iniciar sesión para dejar una reseña.");

        $data = json_decode(file_get_contents('php://input'), true);
        $appointment_id = $data['appointment_id'] ?? null;
        if (!$appointment_id) throw new Exception("Datos incompletos.");

        $stmt = $pdo->prepare("SELECT * FROM appointments WHERE id = ? AND patient_email = ? AND status != 'cancelada'");
        $stmt->execute([$appointment_id, $email]);
        $appt = $stmt->fetch();
        if (!$appt) throw new Exception("No tienes permiso para reseñar esta cita.");

        $tCheck = $pdo->prepare("SELECT id FROM testimonials WHERE appointment_id = ?");
        $tCheck->execute([$appointment_id]);
        if ($tCheck->fetch()) throw new Exception("Ya dejaste una reseña para esta cita.");

        $stmt = $pdo->prepare("INSERT INTO testimonials (psychologist_id, patient_name, content, stars, appointment_id, is_verified) VALUES (?, ?, ?, ?, ?, 1)");
        $stmt->execute([$appt['psychologist_id'], $data['name'] ?? $email, $data['content'], $data['stars'] ?? 5, $appointment_id]);

        $pdo->prepare("UPDATE psychologists SET reviews_count = reviews_count + 1, rating = (SELECT ROUND(AVG(stars),1) FROM testimonials WHERE psychologist_id = ?) WHERE user_id = ?")
            ->execute([$appt['psychologist_id'], $appt['psychologist_id']]);

        echo json_encode(['success' => true]);
    }

    elseif ($action == 'post_contact') {
        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['name']) || empty($data['email']) || empty($data['message']))
            throw new Exception("Por favor completa todos los campos.");
        $stmt = $pdo->prepare("INSERT INTO contact_messages (name, email, subject, message, type) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$data['name'], $data['email'], $data['subject'] ?? '', $data['message'], $data['type'] ?? 'general']);

        $to = ACTIVAMENTE_INBOX_EMAIL;
        $subjectText = '[Activamente] Nuevo mensaje de contacto';
        $body = "Has recibido un mensaje desde el sitio Activamente.\r\n\r\n";
        $body .= 'Nombre: ' . $data['name'] . "\r\n";
        $body .= 'Correo del remitente: ' . $data['email'] . "\r\n";
        $body .= 'Tipo: ' . ($data['type'] ?? 'general') . "\r\n";
        $body .= 'Asunto: ' . ($data['subject'] ?? '') . "\r\n\r\n";
        $body .= "Mensaje:\r\n" . $data['message'] . "\r\n";
        $replyTo = filter_var($data['email'], FILTER_VALIDATE_EMAIL) ? $data['email'] : $to;
        $headers = "MIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\n";
        $headers .= 'From: Activamente <' . $to . ">\r\n";
        $headers .= 'Reply-To: ' . $replyTo . "\r\n";
        @mail($to, '=?UTF-8?B?' . base64_encode($subjectText) . '?=', $body, $headers);

        echo json_encode(['success' => true]);
    }

    // --- SUPERADMIN ACTIONS ---
    elseif (strpos($action, 'admin_') === 0) {
        session_start();
        if (($_SESSION['role'] ?? '') !== 'superadmin') {
            throw new Exception("Acceso denegado. Se requiere ser SuperAdmin.");
        }

        if ($action == 'admin_get_users') {
            $stmt = $pdo->query("SELECT id, email, role, created_at FROM users WHERE role != 'superadmin'");
            echo json_encode($stmt->fetchAll());
        }
        elseif ($action == 'admin_delete_user') {
            $id = $_GET['id'] ?? null;
            $stmt = $pdo->prepare("DELETE FROM users WHERE id = ? AND role != 'superadmin'");
            $stmt->execute([$id]);
            echo json_encode(['success' => true]);
        }
        elseif ($action == 'admin_get_psychologists') {
            $stmt = $pdo->query("SELECT p.*, u.email FROM psychologists p JOIN users u ON p.user_id = u.id");
            echo json_encode($stmt->fetchAll());
        }
        elseif ($action == 'admin_get_testimonials') {
            $stmt = $pdo->query("SELECT * FROM site_testimonials ORDER BY created_at DESC");
            echo json_encode($stmt->fetchAll());
        }
        elseif ($action == 'admin_delete_testimonial') {
            $id = $_GET['id'] ?? null;
            $stmt = $pdo->prepare("DELETE FROM site_testimonials WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true]);
        }
        elseif ($action == 'admin_get_forum') {
            $stmt = $pdo->query("SELECT * FROM forum_posts ORDER BY timestamp DESC");
            echo json_encode($stmt->fetchAll());
        }
        elseif ($action == 'admin_delete_forum_post') {
            $id = $_GET['id'] ?? null;
            $stmt = $pdo->prepare("DELETE FROM forum_posts WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true]);
        }
        elseif ($action == 'admin_toggle_visibility') {
            $type = $_GET['type'] ?? '';
            $id = $_GET['id'] ?? null;
            $table = '';
            if ($type == 'psychologist')
                $table = 'psychologists';
            elseif ($type == 'testimonial')
                $table = 'site_testimonials';
            elseif ($type == 'forum_post')
                $table = 'forum_posts';

            if (!$table || !$id)
                throw new Exception("Parámetros inválidos");

            $stmt = $pdo->prepare("UPDATE $table SET is_active = 1 - is_active WHERE " . ($type == 'psychologist' ? 'user_id' : 'id') . " = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true]);
        }
        elseif ($action == 'admin_update_psychologist') {
            $data = json_decode(file_get_contents('php://input'), true);
            $stmt = $pdo->prepare("UPDATE psychologists SET name=?, specialty=?, price=? WHERE user_id=?");
            $stmt->execute([$data['name'], $data['specialty'], $data['price'], $data['user_id']]);
            echo json_encode(['success' => true]);
        }
        elseif ($action == 'admin_update_testimonial') {
            $data = json_decode(file_get_contents('php://input'), true);
            $stmt = $pdo->prepare("UPDATE site_testimonials SET name=?, content=?, stars=? WHERE id=?");
            $stmt->execute([$data['name'], $data['content'], $data['stars'], $data['id']]);
            echo json_encode(['success' => true]);
        }
        elseif ($action == 'admin_get_contacts') {
            $stmt = $pdo->query("SELECT * FROM contact_messages ORDER BY created_at DESC");
            echo json_encode($stmt->fetchAll());
        }
        elseif ($action == 'admin_delete_contact') {
            $id = $_GET['id'] ?? null;
            $stmt = $pdo->prepare("DELETE FROM contact_messages WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true]);
        }
        elseif ($action == 'admin_delete_news') {
            $id = $_GET['id'] ?? null;
            $stmt = $pdo->prepare("DELETE FROM news WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true]);
        }
    }

    else {
        echo json_encode(['error' => 'Action not found']);
    }

}
catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
