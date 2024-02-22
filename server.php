<?php
$host = '127.0.0.1';
$port = 20205;
$null = NULL;

include_once("./core/initialize.php");
// Create a TCP/IP socket

$socket = socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
socket_set_option($socket, SOL_SOCKET, SO_REUSEADDR, 1);

// Bind the socket to the address/port
socket_bind($socket, 0, $port);

// Start listening for connections
socket_listen($socket);

// Clients array
$clients = array($socket);
$players = array();

// Start WebSocket server loop
while (true) {
    $changed = $clients;
    socket_select($changed, $null, $null, 0, 10);

    // Check for new socket
    if (in_array($socket, $changed)) {
        $new_socket = socket_accept($socket);
        $clients[] = $new_socket;
        $header = socket_read($new_socket, 1024);
        perform_handshaking($header, $new_socket, $host, $port);
        socket_getpeername($new_socket, $ip, $port);

        echo "New client connected from IP: $ip PORT: $port \n";
        $response = mask(json_encode(array('type' => 'system', 'message' => $ip . ' connected')));
        send_message($response, $new_socket);
        $found_socket = array_search($socket, $changed);
        unset($changed[$found_socket]);
    }

    broadcast_player_locations();

    foreach ($changed as $changed_socket) {
        while (socket_recv($changed_socket, $buf, 1024, 0) >= 1) {

            $received_text = unmask($buf);
            $received_data = json_decode($received_text);

            // print($received_data->type);

            if ($received_data === null)
                continue;
            switch ($received_data->type) {


                case "register":
                    try {
                        $username = $received_data->username;
                        $password = $received_data->password;
                        $player = new Player($db, $username, $password);
                        $player->register($username, $password);
                    } catch (Exception $e) {
                        $messageData['status'] = 'failed';
                        $messageData['message'] = $e->getMessage();
                        $messageData = mask(json_encode($messageData));
                        send_message($messageData, $changed_socket);
                    }

                    break;

                case "login":
                    $username = $received_data->username;
                    $password = $received_data->password;

                    $messageData = array('type' => 'login');
                    if (array_key_exists($username, $players)) {
                        break;
                    }

                    try {
                        $player = new Player($db, $username, $password);
                        $player->login($username, $password);
                        $playerSessionID = uniqid();
                        $player->setSessionID($playerSessionID);
                        $player->setSocket($changed_socket);
                        $messageData['status'] = 'success';
                        $messageData['player'] = $player;
                        $messageData = mask(json_encode($messageData));

                        $players[$username] = $player;

                        send_message($messageData, $changed_socket);
                    } catch (Exception $e) {
                        $messageData['status'] = 'failed';
                        $messageData['message'] = $e->getMessage();
                        $messageData = mask(json_encode($messageData));
                        send_message($messageData, $changed_socket);
                        break;
                    }

                    break;
                default:
                    if (!(isset($received_data->type)))
                        break;
                    $username = $received_data->username;
                    if (array_key_exists($username, $players)) {
                        $players[$username]->update($received_data);
                    }
                    break;
            }

            // echo count($clients);
            break 2;
        }

        $buf = @socket_read($changed_socket, 1024, PHP_NORMAL_READ);
        if ($buf === false) {
            // Remove client for socket array
            $found_socket = array_search($changed_socket, $clients);
            $p;
            foreach ($players as $player) {
                if ($player->getSocket() === $changed_socket) {
                    $p = $player;
                    unset($players[$player->username]);
                }
            }

            socket_getpeername($changed_socket, $ip);

            unset($clients[$found_socket]);
            $response = mask(json_encode(array('type' => 'logout', 'message' => $ip . ' disconnected', 'player' => $p)));
            print("Client " . $ip . " disconnected\n");
            send_message($response, $changed_socket);
            broadcast_message($response);
        }

    }
}

// Function to send message to all connected WebSocket clients
function broadcast_message($msg)
{
    global $players;
    foreach ($players as $player) {
        @socket_write($player->getSocket(), $msg, strlen($msg));
    }
    return true;
}

function broadcast_player_locations()
{
    global $players;
    // var_dump($players);
    $msg = array("type" => "players", "players" => array_values($players), "playerCount" => count($players));

    // print(count($players));
    // print("\n");

    $msg = mask(json_encode($msg));
    foreach ($players as $player) {
        @socket_write($player->getSocket(), $msg, strlen($msg));

    }

    return true;
}

function send_message($msg, $socket)
{
    @socket_write($socket, $msg, strlen($msg));
    return true;
}

// Function to perform the handshake
function perform_handshaking($receved_header, $client_conn, $host, $port)
{
    $headers = array();
    $lines = preg_split("/\r\n/", $receved_header);
    foreach ($lines as $line) {
        $line = chop($line);
        if (preg_match('/\A(\S+): (.*)\z/', $line, $matches)) {
            $headers[$matches[1]] = $matches[2];
        }
    }

    $secKey = $headers['Sec-WebSocket-Key'];
    $secAccept = base64_encode(pack('H*', sha1($secKey . '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')));
    $upgrade = "HTTP/1.1 101 Web Socket Protocol Handshake\r\n" .
        "Upgrade: websocket\r\n" .
        "Connection: Upgrade\r\n" .
        "WebSocket-Origin: $host\r\n" .
        "WebSocket-Location: ws://$host:$port/demo/shout.php\r\n" .
        "Sec-WebSocket-Accept:$secAccept\r\n\r\n";
    socket_write($client_conn, $upgrade, strlen($upgrade));
}

// Unmask incoming framed message
function unmask($text)
{
    $length = ord($text[1]) & 127;
    if ($length == 126) {
        $masks = substr($text, 4, 4);
        $data = substr($text, 8);
    } elseif ($length == 127) {
        $masks = substr($text, 10, 4);
        $data = substr($text, 14);
    } else {
        $masks = substr($text, 2, 4);
        $data = substr($text, 6);
    }
    $text = "";
    for ($i = 0; $i < strlen($data); ++$i) {
        $text .= $data[$i] ^ $masks[$i % 4];
    }
    return $text;
}

// Encode message for transfer to WebSocket client
function mask($text)
{
    $b1 = 0x80 | (0x1 & 0x0f);
    $length = strlen($text);

    if ($length <= 125)
        $header = pack('CC', $b1, $length);
    elseif ($length > 125 && $length < 65536)
        $header = pack('CCn', $b1, 126, $length);
    elseif ($length >= 65536)
        $header = pack('CCNN', $b1, 127, $length);
    return $header . $text;
}

function getUsernameFromSocket($socket)
{
    global $players; // Assuming $players is the array mapping usernames to Player objects

    // Iterate through $players to find the username associated with the given socket
    foreach ($players as $username => $player) {
        if ($player->getSocket() === $socket) { // Assuming Player class has a getSocket() method
            return $username;
        }
    }

    // If no username is found for the given socket, return null or handle the case accordingly
    return null;
}
?>