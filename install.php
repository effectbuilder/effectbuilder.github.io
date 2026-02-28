<?php
$config = include 'db_config.php';

try {
    $pdo = new PDO("mysql:host={$config['address']};port={$config['port']}", $config['username'], $config['password']);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Create database if not exists
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$config['database']}`");
    $pdo->exec("USE `{$config['database']}`");

    // Users table
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        passwordHash VARCHAR(255),
        displayName VARCHAR(100),
        photoURL TEXT,
        provider ENUM('email', 'google') DEFAULT 'email',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    // Projects table
    // Storing configs and objects as JSON for compatibility with Firebase structure
    // likes and likedBy (JSON) match the Firebase document structure
    $pdo->exec("CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT,
        name VARCHAR(255),
        description TEXT,
        thumbnail LONGTEXT,
        configs JSON,
        objects JSON,
        isPublic BOOLEAN DEFAULT FALSE,
        likes INT DEFAULT 0,
        likedBy JSON,
        downloadCount INT DEFAULT 0,
        viewCount INT DEFAULT 0,
        featured BOOLEAN DEFAULT FALSE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )");

    // Comments table
    $pdo->exec("CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        projectId INT,
        ownerId INT,
        ownerName VARCHAR(100),
        ownerPhoto TEXT,
        text TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (ownerId) REFERENCES users(id) ON DELETE CASCADE
    )");

    // Notifications table
    $pdo->exec("CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        recipientId INT,
        senderId INT,
        projectId INT,
        eventType VARCHAR(50),
        `read` BOOLEAN DEFAULT FALSE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (recipientId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
    )");

    echo "Database setup completed successfully.";

} catch (PDOException $e) {
    die("DB Setup Error: " . $e->getMessage());
}
