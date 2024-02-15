<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once("../../core/initialize.php");

$user = new Player($db);


if (isset($_GET['user'])) {
    $accountname = $_GET['user'];

    $account = $user->getUser($accountname);

    if ($account) {
        echo json_encode($account);
    } else {
        http_response_code(404);
        echo json_encode(array("error" => "Account not found"));
    }
} else {
    echo json_encode($user->getAllUsers());
}
?>