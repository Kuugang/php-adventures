<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Allow Content-Type and other headers as needed
header("Access-Control-Allow-Credentials: true");
// header('Access-Control-Allow-Methods: POST');

session_start();

if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $authorizationHeader = $_SERVER['HTTP_AUTHORIZATION'];
    if ($authorizationHeader != session_id()) {
        echo json_encode(array("status" => "failed", "message" => session_id()));
        header("HTTP/1.1 401");
        exit();
    }
    echo json_encode(array("status" => "success", "message" => "Authorized"));
    exit();
} else {
    // header("HTTP/1.1 401");
    echo json_encode(array("status" => "failed", "message" => "No  authorization"));
    exit();
}

?>