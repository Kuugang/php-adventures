<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header('Access-Control-Allow-Methods: POST');

require_once("../../core/initialize.php");

$player = new Player($db);


if (isset($_POST["username"]) && isset($_POST['password'])) {
    $username = $_POST['username'];
    $password = $_POST['password'];

    try {
        $player->register($username, $password);
        http_response_code(409);
        echo json_encode(array("status" => "success", "message" => "Registered successfully"));
        exit();
    } catch (PDOException $e) {
        if ($e->getCode() == 23505) {
            header("HTTP/1.1 409");
            echo json_encode(array("status" => "failed", "message" => "Username already taken"));
            exit();
        }
        http_response_code(500);
        echo json_encode(
            array(
                "error" => "Database error"
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