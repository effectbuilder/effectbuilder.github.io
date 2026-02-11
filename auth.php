<?php
// Start session for user authentication
session_start();

$config = include 'db_config.php';
$pdo = new PDO("mysql:host={$config['address']};port={$config['port']}", $config['username'], $config['password']);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Helper function for JSON response
function json_response($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

// Helper to get input data
function get_input() {
    return json_decode(file_get_contents('php://input'), true);
}

// Routing based on request method and 'action' query param or path
$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = get_input();

    if ($action === 'register') {
        $email = filter_var($input['email'], FILTER_SANITIZE_EMAIL);
        $password = $input['password'];
        $displayName = htmlspecialchars($input['displayName']);

        if (!$email || !$password || !$displayName) {
            json_response(['error' => 'Missing fields'], 400);
        }

        // Check if user exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            json_response(['error' => 'User already exists'], 409);
        }

        // Create user
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO users (email, passwordHash, displayName, provider) VALUES (?, ?, ?, 'email')");
        if ($stmt->execute([$email, $hash, $displayName])) {
            $userId = $pdo->lastInsertId();
            $_SESSION['user_id'] = $userId;
            $_SESSION['email'] = $email;
            $_SESSION['display_name'] = $displayName;
            json_response(['message' => 'Registration successful', 'user' => ['id' => $userId, 'email' => $email, 'displayName' => $displayName]]);
        } else {
            json_response(['error' => 'Registration failed'], 500);
        }

    } elseif ($action === 'login') {
        $email = filter_var($input['email'], FILTER_SANITIZE_EMAIL);
        $password = $input['password'];

        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND provider = 'email'");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user['passwordHash'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['email'] = $user['email'];
            $_SESSION['display_name'] = $user['displayName'];
            json_response(['message' => 'Login successful', 'user' => ['id' => $user['id'], 'email' => $user['email'], 'displayName' => $user['displayName'], 'photoURL' => $user['photoURL']]]);
        } else {
            json_response(['error' => 'Invalid credentials'], 401);
        }

    } elseif ($action === 'google_login') {
        $token = $input['token'];
        // Simple verification using Google's tokeninfo endpoint (for prototype purposes)
        // In production, use Google Client Library for PHP to verify properly
        $googleApiUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" . $token;
        $response = file_get_contents($googleApiUrl);
        $payload = json_decode($response, true);

        if ($payload && isset($payload['email'])) {
            $email = $payload['email'];
            $name = $payload['name'];
            $picture = $payload['picture'];

            // Check if user exists
            $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                // Register new Google user
                $stmt = $pdo->prepare("INSERT INTO users (email, displayName, photoURL, provider) VALUES (?, ?, ?, 'google')");
                $stmt->execute([$email, $name, $picture]);
                $userId = $pdo->lastInsertId();
            } else {
                $userId = $user['id'];
                // Update photo if changed
                if ($user['photoURL'] !== $picture) {
                    $stmt = $pdo->prepare("UPDATE users SET photoURL = ? WHERE id = ?");
                    $stmt->execute([$picture, $userId]);
                }
            }

            $_SESSION['user_id'] = $userId;
            $_SESSION['email'] = $email;
            $_SESSION['display_name'] = $name;

            json_response(['message' => 'Login successful', 'user' => ['id' => $userId, 'email' => $email, 'displayName' => $name, 'photoURL' => $picture]]);
        } else {
             json_response(['error' => 'Invalid Google Token'], 401);
        }

    } elseif ($action === 'logout') {
        session_destroy();
        json_response(['message' => 'Logged out']);
    }

} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'me') {
        if (isset($_SESSION['user_id'])) {
             // Refresh user data from DB to get latest photo/name
            $stmt = $pdo->prepare("SELECT id, email, displayName, photoURL FROM users WHERE id = ?");
            $stmt->execute([$_SESSION['user_id']]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($user) {
                 json_response(['user' => $user]);
            } else {
                session_destroy();
                json_response(['user' => null]);
            }
        } else {
            json_response(['user' => null]);
        }
    }
}

json_response(['error' => 'Invalid action'], 404);
