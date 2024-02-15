<?php
header("Access-Control-Allow-Origin: http://localhost:5500");
header("Access-Control-Allow-Credentials: true");

header("Content-Type: application/json");
header('Access-Control-Allow-Methods: POST');

require_once("../../core/initialize.php");

$player = new Player($db);

if (isset($_POST["username"]) && isset($_POST['password'])) {
    $username = $_POST['username'];
    $password = $_POST['password'];

    try {
        $loggedIn = $player->login($username, $password);
        if ($loggedIn) {
            session_start();
            header("HTTP/1.1 200");
            echo json_encode(array("status" => "success", "message" => "Logged in successfully", "sessionID" => session_id()));
        } else {
            header("HTTP/1.1 401");
            echo json_encode(array("status" => "failed", "message" => "Incorrect username or password"));
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(
            array(
                "error" => "Database error",
                "message" => $e->getMessage(),
                "code" => $e->getCode()
            )
        );
        exit();
    }
} else {
    echo json_encode(array("status" => "failed", "message" => "Please provide username and password"));
    http_response_code(404);
    exit();
}
?>