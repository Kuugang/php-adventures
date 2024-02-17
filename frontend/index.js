let sessionID;
let username;
let players = [];

webSocket = new WebSocket("ws://127.0.0.1:20205");

webSocket.onopen = function (event) {
    console.log("WebSocket is open now.");

};

webSocket.onmessage = function (event) {
    console.log(event.data);
    let data = JSON.parse(event.data);
    console.log(data);

    if (data.type == "login") {
        sessionID = data.player.sessionID;
        username = data.player.username;
        players.push(data.player);
        createPlayerSquare(data.player);
    }

    if (data.type == "move") {
        players.forEach((player) => {
            if (player.username == data.player.username) {
                player.posX = data.player.posX;
                player.posY = data.player.posY;
            }
        })
    }
};

webSocket.onclose = function (event) {
    var data = {
        "type": "logout",
        "username": username,
        "sessionID": sessionID,
    };
    webSocket.send(JSON.stringify(data));
    console.log("WebSocket is closed now.");
};

document.querySelector("#loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    let username = document.querySelector("#loginUsername").value;
    let password = document.querySelector("#loginPassword").value;

    var data = {
        "type": "login",
        "username": username,
        "password": password,
    };

    webSocket.send(JSON.stringify(data));
})


document.addEventListener("keypress", function (e) {
    if (!sessionID) return;
    let key = e.keyCode;

    var data = {
        "type": "move",
        "username": username,
        "sessionID": sessionID,
        "x": 0,
        "y": 0
    };

    switch (key) {
        case 119:
            data.y = -2;
            break;
        case 115:
            data.y = 2;
            break;
        case 97:
            data.x = -2;
            break;
        case 100:
            data.x = 2;
            break;
        default:
            break;
    }

    data = JSON.stringify(data);
    webSocket.send(data);
});

function sendMessage() {
    var message = document.getElementById("message").value;

    let send = {
        "name": username,
        "message": message
    };

    send = JSON.stringify(send);
    webSocket.send(send);
}

function createPlayerSquare(player) {
    var square = document.createElement('div');
    square.className = 'playerSquare';
    square.style.left = player.x + 'px';
    square.style.top = player.y + 'px';
    square.id = player.username;
    document.getElementById('gameContainer').appendChild(square);
}

setInterval(() => {
    players.forEach(player => {
        let square = document.getElementById(player.username);
        square.style.left = player.posX + "px";
        square.style.top = player.posY + "px";
    });
}, 1);


function disconnectWebSocket() {
    if (webSocket) {
        webSocket.close();
        console.log("WebSocket disconnected.");
    }
}

window.addEventListener("beforeunload", function (event) {
    disconnectWebSocket();
});