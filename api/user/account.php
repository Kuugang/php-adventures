<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once("../../core/initialize.php");
function getAllUsers()
{
    global $db;
    $query = "SELECT id, username FROM tblAccount";
    $statement = $db->prepare($query);
    $statement->execute();
    $rowCount = $statement->rowCount();

    if ($rowCount > 0) {
        $users = array();
        $users['users'] = array();
        while ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
            extract($row);
            $user = array(
                'id' => $id,
                'username' => $username,
            );
            array_push($users['users'], $user);
        }
        return $users;
    } else {
        return array();
    }
}

function getUser($name)
{
    global $db;
    $query = "SELECT id, username FROM tblAccount WHERE username = :username";
    $statement = $db->prepare($query);
    $statement->execute(array(':username' => $name));
    $account = $statement->fetch(PDO::FETCH_ASSOC);

    return $account;
}

if (isset($_GET['user'])) {
    $accountname = $_GET['user'];

    $account = getUser($accountname);

    if ($account) {
        echo json_encode($account);
    } else {
        http_response_code(404);
        echo json_encode(array("error" => "Account not found"));
    }
} else {
    echo json_encode(getAllUsers());
}
?>