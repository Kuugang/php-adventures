<?php

class Player
{
    private $conn;
    private $table = 'tblPlayer';

    private $id;
    private $username;
    private $password;
    private $cluster;
    private $posX;
    private $posY;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function read()
    {
        $query = "SELECT username, cluster, posX, posY FROM " . $this->table;

        $stmt = $this->conn->prepare($query);

        $stmt->execute();
        return $stmt;
    }
}
?>