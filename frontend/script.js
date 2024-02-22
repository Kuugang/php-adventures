let playerUsername; //temporary
let sessionID; //temporary

webSocket = new WebSocket("ws://127.0.0.1:20205");
webSocket.onopen = function (event) {
    console.log("WebSocket is open now.");
};


class MainGameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainGameScene' });
        this.worldLayer;
        this.spawnPoint;
        this.otherPlayers = [];
    }

    preload() {
        this.load.image("tiles", "https://mikewesthad.github.io/phaser-3-tilemap-blog-posts/post-1/assets/tilesets/tuxmon-sample-32px-extruded.png");
        this.load.tilemapTiledJSON("map", "https://mikewesthad.github.io/phaser-3-tilemap-blog-posts/post-1/assets/tilemaps/tuxemon-town.json");
        this.load.atlas("atlas", "https://mikewesthad.github.io/phaser-3-tilemap-blog-posts/post-1/assets/atlas/atlas.png", "https://mikewesthad.github.io/phaser-3-tilemap-blog-posts/post-1/assets/atlas/atlas.json");
    }

    create() {
        const map = this.make.tilemap({ key: "map" });
        const tileset = map.addTilesetImage("tuxmon-sample-32px-extruded", "tiles");
        const belowLayer = map.createLayer("Below Player", tileset, 0, 0);
        this.worldLayer = map.createLayer("World", tileset, 0, 0);
        const aboveLayer = map.createLayer("Above Player", tileset, 0, 0);
        this.worldLayer.setCollisionByProperty({ collides: true });
        aboveLayer.setDepth(10);
        this.spawnPoint = map.findObject("Objects", obj => obj.name === "Spawn Point");

        // Declare player within the scope of MainGameScene

        player = new Player(this, this.spawnPoint.x, this.spawnPoint.y, playerUsername);
        player.initializeInputs();
        player.setSocket(webSocket);

        // this.players.push(player);

        const camera = this.cameras.main;
        camera.startFollow(player.sprite);
        camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        cursors = this.input.keyboard.createCursorKeys();

        // this.add.text(16, 16, 'Arrow keys to move\nPress "D" to show hitboxes', {
        //     font: "18px monospace",
        //     fill: "#000000",
        //     padding: { x: 20, y: 10 },
        //     backgroundColor: "#ffffff"
        // }).setScrollFactor(0).setDepth(30);



        //for debug
        // this.input.keyboard.once("keydown-D", event => {
        //     this.physics.world.createDebugGraphic();
        //     const graphics = this.add.graphics().setAlpha(0.75).setDepth(20);
        //     this.worldLayer.renderDebug(graphics, {
        //         tileColor: null,
        //         collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
        //         faceColor: new Phaser.Display.Color(40, 39, 37, 255)
        //     });
        // });
    }


    update(time, delta) {
        player.update();

        const scene = this;

        webSocket.onmessage = function (event) {
            let data = JSON.parse(event.data);

            switch (data.type) {
                case "players":
                    data.players.forEach(playerData => {
                        if (playerData.username == playerUsername) return;
                        let existingPlayer = scene.otherPlayers.find(p => p.username === playerData.username);

                        // if (playerData.sayMessages.length > 0) {
                        //     existingPlayer.showDialogue(playerData.sayMessages[0].message);
                        // }

                        if (!existingPlayer) {
                            let newPlayer = new OtherPlayer(scene, playerData);
                            scene.otherPlayers.push(newPlayer);
                        } else {
                            existingPlayer.update(playerData);
                        }

                        // if (playerData.sayMessages.length > 0) {
                        //     existingPlayer.showDialogue(playerData.sayMessages[0]);
                        // }


                        // console.log(prevVelocity);


                    });

                    // scene.players = scene.players.filter(player => {
                    //     const foundPlayer = data.players.find(p => p.username === player.username);
                    //     if (!foundPlayer) {
                    //         player.sprite.destroy();
                    //     }
                    //     return foundPlayer;
                    // });
                    break;
            }
        };
    }
}

class LoginRegisterScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LoginRegisterScene' });
    }

    preload() {
        // No need to preload HTML files for direct rendering onto the scene
    }
    create() {
        this.add.text(400, 100, 'Login/Register', { fontSize: '32px', fill: '#000' }).setOrigin(0.5);

        let form = `
        <div class="w-full flex flex-col items-center justify-center gap-2">
            <h1 class="font-semibold">Login / Register</h1>
            <div class="flex flex-col w-[300px] gap-2">
                <input type="text" id="username" class="border rounded p-2" placeholder="Enter username">
                <input type="text" id="password" class="border rounded p-2" placeholder="Enter password">
                <button id="loginButton" class="border border-white rounded text-white">Login</button>
                <button id="reigsterButton" class="border border-white rounded text-white">Register</button>
            </div>
        </div>
    `;

        const formElement = this.add.dom(400, 250).createFromHTML(form);

        const loginButton = formElement.getChildByID("loginButton");

        const scene = this;

        loginButton.addEventListener("click", function () {
            const username = document.getElementById('username').value;
            playerUsername = username;
            const password = document.getElementById('password').value;

            var data = {
                "type": "login",
                "username": username,
                "password": password,
            };

            webSocket.send(JSON.stringify(data));
        });

        webSocket.onmessage = function (event) {
            let data = JSON.parse(event.data);
            if (data.type === "login") {
                if (data.status === "success") {
                    scene.scene.start('MainGameScene');
                    sessionID = data.sessionID;
                } else {
                    scene.add.dom(400, 320).createFromHTML(`
                <p class="text-white">${data.message}</p>
            `);
                }
            }
        };
    }

}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: "game-container",
    pixelArt: true,
    dom: {
        createContainer: true
    },
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 }
        }
    },
    scene: [LoginRegisterScene, MainGameScene] // Add both scenes
};

let game = new Phaser.Game(config);

let cursors;
let player; // Declare player variable globally
let showDebug = false;
