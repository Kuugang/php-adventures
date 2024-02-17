<?php
$db_user = "root";
$db_password = "";
$db_name = "dbPHPAdventures";
$host = "localhost";
$db_port = "3306";

try {
    $db = new PDO("mysql:host=$host;dbname=$db_name;port=$db_port", $db_user, $db_password);


    $createUserTable = "CREATE TABLE IF NOT EXISTS tblPlayer(
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        posX int DEFAULT 0,
        posY int DEFAULT 0,
        CONSTRAINT unique_username UNIQUE (username),
        CONSTRAINT password_length CHECK (LENGTH(password) >= 4)
    )";

    $db->prepare($createUserTable)->execute();
    header("HTTP/1.1 200 OK");
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}

$db->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
?>