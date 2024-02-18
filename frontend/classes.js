class Player {
    constructor(scene, worldLayer, x, y, texture, initial, socket, sessionID) {
        this.scene = scene;
        this.username;
        this.sprite = scene.physics.add.sprite(x, y, texture, initial).setSize(30, 40).setOffset(0, 24);
        this.createAnimations();
        this.scene.physics.add.collider(this.sprite, worldLayer);
        this.socket = socket;
        this.sessionID = sessionID;
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

    updatePlayer() {
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

        var data = {
            "type": "move",
            "username": this.username,
            "sessionID": this.sessionID,
            "x": this.sprite.x,
            "y": this.sprite.y,
            "velocity": this.sprite.body.velocity,
            "prevVelocity": prevVelocity
        };
        this.socket.send(JSON.stringify(data));

    }
}

