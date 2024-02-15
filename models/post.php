<?php
  
class Post{
  private $conn;
  private $table = 'tblPost';

  private $id;
  private $category_id;
  private $category_name;
  private $title;
  private $body;
  private $author;

  public function __construct($db){
    $this->conn = $db;
  }

  public function read(){
    $query = "SELECT * FROM " .$this->table;
    
    $stmt = $this->conn->prepare($query);

  $stmt->execute();  
  return $stmt;
  }
  }
?> 
