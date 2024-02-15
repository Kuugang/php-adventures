<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once("../../core/initialize.php");

session_start();
session_destroy();
//should also destroy client side cookie

echo json_encode(array("status" => "success", "message" => "Logged out successfully"));
exit();
?>