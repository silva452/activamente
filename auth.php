<?php
// auth.php - Authentication for Activamente
require_once 'db.php';
session_start();
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$action = $_GET['action'] ?? '';

try {
    if ($action == 'register') {
        $role = $data['role'] ?? 'patient';

        $check = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $check->execute([$data['email']]);
        if ($check->fetch()) throw new Exception("Este correo ya está registrado.");

        $stmt = $pdo->prepare("INSERT INTO users (email, password, role, name) VALUES (?, ?, ?, ?)");
        $hashed = password_hash($data['password'], PASSWORD_DEFAULT);
        $stmt->execute([$data['email'], $hashed, $role, $data['name']]);
        $uid = $pdo->lastInsertId();

        if ($role === 'psychologist') {
            $stmt = $pdo->prepare("INSERT INTO psychologists (user_id, name) VALUES (?, ?)");
            $stmt->execute([$uid, $data['name']]);
        }

        $_SESSION['user_id'] = $uid;
        $_SESSION['email']   = $data['email'];
        $_SESSION['role']    = $role;
        $_SESSION['name']    = $data['name'];
        echo json_encode(['success' => true, 'user' => ['id' => $uid, 'email' => $data['email'], 'role' => $role, 'name' => $data['name']]]);
    }

    elseif ($action == 'login') {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$data['email']]);
        $user = $stmt->fetch();

        if ($user && password_verify($data['password'], $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['email']   = $user['email'];
            $_SESSION['role']    = $user['role'];
            $_SESSION['name']    = $user['name'] ?? '';
            echo json_encode(['success' => true, 'user' => ['id' => $user['id'], 'email' => $user['email'], 'role' => $user['role'], 'name' => $user['name'] ?? '']]);
        } else {
            throw new Exception("Email o contraseña incorrectos.");
        }
    }

    elseif ($action == 'status') {
        echo json_encode([
            'logged_in' => isset($_SESSION['user_id']),
            'user_id'   => $_SESSION['user_id'] ?? null,
            'email'     => $_SESSION['email']   ?? null,
            'role'      => $_SESSION['role']    ?? null,
            'name'      => $_SESSION['name']    ?? null
        ]);
    }

    elseif ($action == 'logout') {
        session_destroy();
        echo json_encode(['success' => true]);
    }

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
