<?php
class Player
{
    private $conn;
    private $table = 'tblPlayer';

    public $id;
    public $username;
    public $password;


    public function __construct($db)
    {
        $this->conn = $db;
    }


    public function getUser($name)
    {
        $query = "SELECT id, username FROM " . $this->table . "WHERE username = :username";
        $statement = $this->conn->prepare($query);
        $statement->execute(array(':username' => $name));
        $user = $statement->fetch(PDO::FETCH_ASSOC);

        return $user;
    }

    public function getAllUsers()
    {
        $query = "SELECT id, username FROM " . $this->table;
        $statement = $this->conn->prepare($query);
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


    public function register($username, $password)
    {
        $query = 'INSERT INTO ' . $this->table . ' (username, password) VALUES (:username, :password)';
        $stmt = $this->conn->prepare($query);

        $this->username = htmlspecialchars(strip_tags($username));
        $this->password = htmlspecialchars(strip_tags(password_hash($password, PASSWORD_DEFAULT)));

        $stmt->bindParam(':username', $this->username);
        $stmt->bindParam(':password', $this->password);

        if ($stmt->execute())
            return true;
    }

    public function login($username, $password)
    {
        $query = "SELECT * FROM " . $this->table . " WHERE username = :username";
        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':username', $username);
        $stmt->execute();

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            if (password_verify($password, $user['password'])) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

}
?>