class Player {
    socket = null;
    sayInput = null;
    dialogueBox = null;
    scene = null;
    username = null;

    constructor(scene, x, y, username) {
        this.scene = scene;
        this.username = username;
        this.sprite = scene.physics.add.sprite(x, y, "atlas", "misha-front").setSize(30, 40).setOffset(0, 24);
        this.createAnimations();
        this.scene.physics.add.collider(this.sprite, scene.worldLayer);

        this.playerUsernameDialogue = this.scene.add.text(this.sprite.x, this.sprite.y - this.sprite.height / 2, this.username, {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: {
                x: 5,
                y: 5
            }
        }).setOrigin(0.5);
    }

    initializeInputs() {
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        this.scene.input.keyboard.on('keydown-T', this.#openSayInput, this);
        this.scene.input.keyboard.on('keydown-ENTER', this.#sendMessage, this);
    }

    setSocket(socket) {
        this.socket = socket;
    }

    #openSayInput() {
        // Ensure only one input exists at a time
        if (!this.sayInput) {
            // Create and display the input field
            this.sayInput = document.createElement('input');
            this.sayInput.type = 'text';
            this.sayInput.placeholder = 'Say something...';
            this.sayInput.style.position = 'absolute';
            this.sayInput.style.top = '50%';
            this.sayInput.style.left = '50%';
            this.sayInput.style.transform = 'translate(-50%, -50%)';
            document.body.appendChild(this.sayInput);
        }
    }

    #sendMessage() {
        // Ensure input exists and contains a message
        if (this.sayInput && this.sayInput.value.trim() !== '') {
            const message = this.sayInput.value.trim();
            const data = {
                type: 'sayMessage',
                username: this.username,
                sessionID: this.sessionID,
                message: message
            };

            this.socket.send(JSON.stringify(data));
            this.sayInput.value = '';
            this.sayInput.remove();
            this.sayInput = null;
        }
    }

    createAnimations() {
        const anims = this.scene.anims;
        anims.create({
            key: "misa-left-walk",
            frames: anims.generateFrameNames("atlas", { prefix: "misa-left-walk.", start: 0, end: 3, zeroPad: 3 }),
            frameRate: 10,
            repeat: -1
        });

        anims.create({
            key: "misa-right-walk",
            frames: anims.generateFrameNames("atlas", { prefix: "misa-right-walk.", start: 0, end: 3, zeroPad: 3 }),
            frameRate: 10,
            repeat: -1
        });

        anims.create({
            key: "misa-front-walk",
            frames: anims.generateFrameNames("atlas", { prefix: "misa-front-walk.", start: 0, end: 3, zeroPad: 3 }),
            frameRate: 10,
            repeat: -1
        });

        anims.create({
            key: "misa-back-walk",
            frames: anims.generateFrameNames("atlas", { prefix: "misa-back-walk.", start: 0, end: 3, zeroPad: 3 }),
            frameRate: 10,
            repeat: -1
        });
    }

    update() {
        const speed = 175;
        const prevVelocity = this.sprite.body.velocity.clone();

        // Stop any previous movement from the last frame
        this.sprite.body.setVelocity(0);
        // console.log(prevVelocity);

        // Horizontal movement
        if (cursors.left.isDown) {
            this.sprite.body.setVelocityX(-speed);
        } else if (cursors.right.isDown) {
            this.sprite.body.setVelocityX(speed);
        }

        // Vertical movement
        if (cursors.up.isDown) {
            this.sprite.body.setVelocityY(-speed);
        } else if (cursors.down.isDown) {
            this.sprite.body.setVelocityY(speed);
        }

        // Normalize and scale the velocity so that player can't move faster along a diagonal
        this.sprite.body.velocity.normalize().scale(speed);

        // Update the animation last and give left/right animations precedence over up/down animations

        if (cursors.left.isDown) {
            this.sprite.anims.play("misa-left-walk", true);
        } else if (cursors.right.isDown) {
            this.sprite.anims.play("misa-right-walk", true);
        } else if (cursors.up.isDown) {
            this.sprite.anims.play("misa-back-walk", true);
        } else if (cursors.down.isDown) {
            this.sprite.anims.play("misa-front-walk", true);
        } else {
            this.sprite.anims.stop();

            // If we were moving, pick and idle frame to use
            if (prevVelocity.x < 0) this.sprite.setTexture("atlas", "misa-left"); else
                if (prevVelocity.x > 0) this.sprite.setTexture("atlas", "misa-right"); else
                    if (prevVelocity.y < 0) this.sprite.setTexture("atlas", "misa-back"); else
                        if (prevVelocity.y > 0) this.sprite.setTexture("atlas", "misa-front");
        }

        if (this.dialogueBox) {
            this.dialogueBox.x = this.sprite.x;
            this.dialogueBox.y = this.sprite.y;
        }

        if (this.playerUsernameDialogue) {
            this.playerUsernameDialogue.x = this.sprite.x;
            this.playerUsernameDialogue.y = this.sprite.y - this.sprite.height / 2;
        }

        var data = {
            "type": "move",
            "username": this.username,
            "sessionID": this.sessionID,
            "x": this.sprite.x,
            "y": this.sprite.y,
            "velocity": this.sprite.body.velocity,
            "prevVelocity": prevVelocity
        };
        console.log(data);
        this.socket.send(JSON.stringify(data));
    }


    #showDialogue(message) {
        // Ensure only one dialogue box exists at a time

        // if (!this.dialogueBox) {
        //     this.dialogueBox = this.scene.add.text(this.sprite.x, this.sprite.y - this.sprite.height / 2 - 10, message, {
        //         fontFamily: 'Arial',
        //         fontSize: '12px',
        //         color: '#ffffff',
        //         backgroundColor: '#000000',
        //         padding: {
        //             x: 5,
        //             y: 5
        //         }
        //     }).setOrigin(0.5);
        // } else {
        //     this.dialogueBox.setText(message);
        // }
    }

    #hideDialogue() {
        // Remove the dialogue box
        if (this.dialogueBox) {
            this.dialogueBox.destroy();
            this.dialogueBox = null;
        }
    }
}

class OtherPlayer {
    constructor(scene, playerData) {
        this.scene = scene;
        this.username = playerData.username;
        this.sprite = scene.physics.add.sprite(playerData.posX, playerData.poxY, "atlas", "misha-front").setSize(30, 40).setOffset(0, 24);
        this.createAnimations();
        this.scene.physics.add.collider(this.sprite, scene.worldLayer);

        this.playerUsernameDialogue = this.scene.add.text(this.sprite.x, this.sprite.y - this.sprite.height / 2, this.username, {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: {
                x: 5,
                y: 5
            }
        }).setOrigin(0.5);
    }


    createAnimations() {
        const anims = this.scene.anims;
        anims.create({
            key: "misa-left-walk",
            frames: anims.generateFrameNames("atlas", { prefix: "misa-left-walk.", start: 0, end: 3, zeroPad: 3 }),
            frameRate: 10,
            repeat: -1
        });

        anims.create({
            key: "misa-right-walk",
            frames: anims.generateFrameNames("atlas", { prefix: "misa-right-walk.", start: 0, end: 3, zeroPad: 3 }),
            frameRate: 10,
            repeat: -1
        });

        anims.create({
            key: "misa-front-walk",
            frames: anims.generateFrameNames("atlas", { prefix: "misa-front-walk.", start: 0, end: 3, zeroPad: 3 }),
            frameRate: 10,
            repeat: -1
        });

        anims.create({
            key: "misa-back-walk",
            frames: anims.generateFrameNames("atlas", { prefix: "misa-back-walk.", start: 0, end: 3, zeroPad: 3 }),
            frameRate: 10,
            repeat: -1
        });
    }


    update(playerData) {
        this.sprite.x = playerData.posX;
        this.sprite.y = playerData.posY;

        if (this.playerUsernameDialogue) {
            this.playerUsernameDialogue.x = this.sprite.x;
            this.playerUsernameDialogue.y = this.sprite.y - this.sprite.height / 2;
        }

        if (playerData.velocity.x < 0) {
            this.sprite.anims.play("misa-left-walk", true);
        } else if (playerData.velocity.x > 0) {
            this.sprite.anims.play("misa-right-walk", true);
        } else if (playerData.velocity.y < 0) {
            this.sprite.anims.play("misa-back-walk", true);
        } else if (playerData.velocity.y > 0) {
            this.sprite.anims.play("misa-front-walk", true);
        } else {
            this.sprite.anims.stop();
            if (playerData.prevVelocity.x < 0) this.sprite.setTexture("atlas", "misa-left"); else
                if (playerData.prevVelocity.x > 0) this.sprite.setTexture("atlas", "misa-right"); else
                    if (playerData.prevVelocity.y < 0) this.sprite.setTexture("atlas", "misa-back"); else
                        if (playerData.prevVelocity.y > 0) this.sprite.setTexture("atlas", "misa-front");
        }
    }
}
