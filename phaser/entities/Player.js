// Player.js - Player character with climbing mechanics

class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player');
        
        // Add to scene and physics
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Player properties
        this.jumpForce = -500;
        this.moveSpeed = 200;
        this.maxJumps = 2; // Double jump
        this.jumpsRemaining = this.maxJumps;
        this.isGrounded = false;
        this.coyoteTime = 150; // milliseconds of coyote time
        this.coyoteTimeCounter = 0;
        this.jumpBufferTime = 100; // milliseconds for jump buffering
        this.jumpBufferCounter = 0;
        
        // Physics settings
        this.setCollideWorldBounds(true);
        this.setBounce(0.1);
        this.setDragX(100); // Air resistance
        
        // Visual settings
        this.setScale(1);
        this.setDepth(10); // Ensure player is above other objects
        
        // Input tracking
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.wasd = scene.input.keyboard.addKeys('W,S,A,D');
        this.spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        // Animation state
        this.currentState = 'idle';
        
        // Particle system for effects
        this.setupParticles();
        
        console.log('🎮 Player created at', x, y);
    }
    
    setupParticles() {
        // Jump particles
        this.jumpParticles = this.scene.add.particles(0, 0, 'jump-particle', {
            speed: { min: 50, max: 100 },
            scale: { start: 0.5, end: 0 },
            lifespan: 300,
            emitting: false
        });
        
        // Landing dust particles
        this.dustParticles = this.scene.add.particles(0, 0, 'dust-particle', {
            speed: { min: 20, max: 60 },
            scale: { start: 0.3, end: 0 },
            lifespan: 400,
            emitting: false,
            angle: { min: -20, max: 20 }
        });
    }
    
    update(time, delta) {
        this.handleInput(time, delta);
        this.updateTimers(delta);
        this.updateAnimations();
        this.updatePhysics();
    }
    
    handleInput(time, delta) {
        const isLeftPressed = this.cursors.left.isDown || this.wasd.A.isDown;
        const isRightPressed = this.cursors.right.isDown || this.wasd.D.isDown;
        const isJumpPressed = this.cursors.up.isDown || this.wasd.W.isDown || this.spaceKey.isDown;
        const isJumpJustPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) || 
                                 Phaser.Input.Keyboard.JustDown(this.wasd.W) || 
                                 Phaser.Input.Keyboard.JustDown(this.spaceKey);
        
        // Horizontal movement
        if (isLeftPressed) {
            this.setVelocityX(-this.moveSpeed);
            this.setFlipX(true);
        } else if (isRightPressed) {
            this.setVelocityX(this.moveSpeed);
            this.setFlipX(false);
        } else {
            // Apply friction when no input
            this.setVelocityX(this.body.velocity.x * 0.8);
        }
        
        // Jump buffering - if jump is pressed but player isn't grounded yet
        if (isJumpJustPressed) {
            this.jumpBufferCounter = this.jumpBufferTime;
        }
        
        // Jump logic with coyote time and double jump
        if (this.jumpBufferCounter > 0 && (this.coyoteTimeCounter > 0 || this.jumpsRemaining > 0)) {
            this.jump();
            this.jumpBufferCounter = 0;
        }
        
        // Variable jump height - shorter jump if button released early
        if (!isJumpPressed && this.body.velocity.y < 0) {
            this.setVelocityY(this.body.velocity.y * 0.5);
        }
    }
    
    updateTimers(delta) {
        // Update coyote time
        if (this.coyoteTimeCounter > 0) {
            this.coyoteTimeCounter -= delta;
        }
        
        // Update jump buffer
        if (this.jumpBufferCounter > 0) {
            this.jumpBufferCounter -= delta;
        }
    }
    
    updateAnimations() {
        const velocity = this.body.velocity;
        
        if (velocity.y < -50) {
            // Jumping
            if (this.currentState !== 'jump') {
                this.currentState = 'jump';
                this.play('player-jump');
            }
        } else if (velocity.y > 50) {
            // Falling
            if (this.currentState !== 'fall') {
                this.currentState = 'fall';
                this.play('player-fall');
            }
        } else {
            // Grounded
            if (this.currentState !== 'idle') {
                this.currentState = 'idle';
                this.play('player-idle');
            }
        }
    }
    
    updatePhysics() {
        // Check if player is grounded
        const wasGrounded = this.isGrounded;
        this.isGrounded = this.body.touching.down;
        
        if (this.isGrounded) {
            if (!wasGrounded) {
                // Just landed
                this.onLand();
            }
            this.jumpsRemaining = this.maxJumps;
            this.coyoteTimeCounter = this.coyoteTime;
        } else {
            // In air - start coyote time if just left ground
            if (wasGrounded) {
                this.coyoteTimeCounter = this.coyoteTime;
            }
        }
    }
    
    jump() {
        if (this.isGrounded || this.coyoteTimeCounter > 0) {
            // First jump or coyote time jump
            this.setVelocityY(this.jumpForce);
            this.jumpsRemaining = this.maxJumps - 1;
            this.coyoteTimeCounter = 0;
            this.onJump();
        } else if (this.jumpsRemaining > 0) {
            // Double jump
            this.setVelocityY(this.jumpForce * 0.8); // Slightly weaker double jump
            this.jumpsRemaining--;
            this.onDoubleJump();
        }
    }
    
    onJump() {
        // Play jump sound
        if (window.GameManagers.audio) {
            window.GameManagers.audio.playJumpSound();
        }
        
        // Create jump particles
        this.jumpParticles.setPosition(this.x, this.y + this.height / 2);
        this.jumpParticles.explode(5);
        
        // Screen shake for juice
        this.scene.cameras.main.shake(50, 0.005);
        
        console.log('🦘 Player jumped');
    }
    
    onDoubleJump() {
        // Play double jump sound
        if (window.GameManagers.audio) {
            window.GameManagers.audio.playDoubleJumpSound();
        }
        
        // Create more particles for double jump
        this.jumpParticles.setPosition(this.x, this.y + this.height / 2);
        this.jumpParticles.explode(8);
        
        // Brief spin effect for double jump
        this.scene.tweens.add({
            targets: this,
            angle: 360,
            duration: 300,
            ease: 'Power2.easeOut',
            onComplete: () => {
                this.setAngle(0);
            }
        });
        
        console.log('🦘✨ Player double jumped');
    }
    
    onLand() {
        // Play landing sound
        if (window.GameManagers.audio) {
            window.GameManagers.audio.playLandSound();
        }
        
        // Create dust particles
        this.dustParticles.setPosition(this.x, this.y + this.height / 2);
        this.dustParticles.explode(3);
        
        // Small screen shake
        this.scene.cameras.main.shake(30, 0.003);
        
        console.log('🌍 Player landed');
    }
    
    // Method to boost player upward (for special platforms or power-ups)
    boost(force = -700) {
        this.setVelocityY(force);
        this.jumpsRemaining = this.maxJumps; // Reset double jump
        
        // Create boost particles
        this.jumpParticles.setPosition(this.x, this.y + this.height / 2);
        this.jumpParticles.explode(10);
        
        // Play boost sound
        if (window.GameManagers.audio) {
            window.GameManagers.audio.playBoostSound();
        }
        
        console.log('🚀 Player boosted!');
    }
    
    // Method to handle collecting items
    collectItem(item) {
        // Create collection particles
        const collectParticles = this.scene.add.particles(item.x, item.y, 'sparkle-particle', {
            speed: { min: 30, max: 80 },
            scale: { start: 0.5, end: 0 },
            lifespan: 500,
            emitting: false
        });
        collectParticles.explode(8);
        
        // Play collection sound
        if (window.GameManagers.audio) {
            window.GameManagers.audio.playCollectSound();
        }
        
        // Remove particle system after animation
        this.scene.time.delayedCall(1000, () => {
            collectParticles.destroy();
        });
        
        console.log('✨ Player collected item');
    }
    
    // Reset player position and state
    reset(x, y) {
        this.setPosition(x, y);
        this.setVelocity(0, 0);
        this.jumpsRemaining = this.maxJumps;
        this.isGrounded = false;
        this.coyoteTimeCounter = 0;
        this.jumpBufferCounter = 0;
        this.setAngle(0);
        this.setFlipX(false);
        this.currentState = 'idle';
        this.play('player-idle');
        
        console.log('🔄 Player reset to', x, y);
    }
    
    destroy() {
        // Clean up particles
        if (this.jumpParticles) {
            this.jumpParticles.destroy();
        }
        if (this.dustParticles) {
            this.dustParticles.destroy();
        }
        
        super.destroy();
    }
}
