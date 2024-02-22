<?php
class Player
{
    private $conn;
    private $table = 'tblPlayer';
    public $id;
    public $username;
    public $posX = 352;
    public $posY = 1216;
    public $velocity;
    public $prevVelocity;
    private Socket $socket;
    public $sessionID;
    public $sayMessages = array();
    public function __construct($db, $username, $password)
    {
        $this->conn = $db;
    }

    public function getUser($name)
    {
        $query = "SELECT id, username, posX, posY FROM " . $this->table . "WHERE username = :username";
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
        try {

            $query = 'INSERT INTO ' . $this->table . ' (username, password) VALUES (:username, :password)';
            $stmt = $this->conn->prepare($query);
            $this->username = htmlspecialchars(strip_tags($username));
            $password = htmlspecialchars(strip_tags(password_hash($password, PASSWORD_DEFAULT)));
            $stmt->bindParam(':username', $this->username);
            $stmt->bindParam(':password', $password);

            if ($stmt->execute())
                return true;
        } catch (PDOException $e) {
            throw new Exception($e->getMessage());
        }
    }

    public function login($username, $password)
    {
        try {
            $query = "SELECT * FROM " . $this->table . " WHERE username = :username";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':username', $username);
            $stmt->execute();
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                throw new Exception("User not found");
            }

            password_verify($password, $user['password']);
            $this->id = $user['id'];
            $this->username = $user['username'];
            $this->posX = $user['posX'];
            $this->posY = $user['posY'];
        } catch (PDOException $e) {
            throw new Exception($e->getMessage());
        }
    }

    public function setSessionId($sessionId)
    {
        $this->sessionID = $sessionId;
    }

    public function getSocket()
    {
        return $this->socket;
    }

    public function setSocket($socket)
    {
        $this->socket = $socket;
    }


    public function update($data)
    {
        $currentTime = time();

        foreach ($this->sayMessages as &$message) {
            if (($currentTime - $message['timestamp']) > 10) {
                unset($message);
            }
        }

        if (!isset($data->type))
            return;
        switch ($data->type) {
            case "move":
                $this->posX = $data->x;
                $this->posY = $data->y;

                $this->velocity = $data->velocity;
                $this->prevVelocity = $data->prevVelocity;

                $messageData = array('type' => 'move', 'player' => $this);
                $messageData = mask(json_encode($messageData));
                send_message($messageData, $this->socket);
                break;

            case "sayMessage":
                print($data->message);
                $messageData = array(
                    "message" => $data->message,
                    "timestamp" => time(),
                );
                array_push($this->sayMessages, $messageData);
                break;
            default:
                break;
        }
    }
}
?>