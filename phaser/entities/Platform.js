// Platform.js - Platform entity for procedural generation

class Platform extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type = 'normal') {
        // Select texture based on type
        let texture = 'platform';
        if (type === 'moving') {
            texture = 'moving-platform';
        } else if (type === 'breakable') {
            texture = 'breakable-platform';
        }
        
        super(scene, x, y, texture);
        
        // Add to scene and physics
        scene.add.existing(this);
        // All platforms are static bodies - moving platforms will use manual position updates
        scene.physics.add.existing(this, true);
        
        // Platform properties
        this.platformType = type;
        this.isActive = true;
        this.originalX = x;
        this.originalY = y;
        
        // Type-specific setup
        this.setupByType();
        
        console.log(`🏗️ ${type} platform created at`, x, y);
    }
    
    setupByType() {
        switch (this.platformType) {
            case 'normal':
                this.setupNormalPlatform();
                break;
            case 'moving':
                this.setupMovingPlatform();
                break;
            case 'breakable':
                this.setupBreakablePlatform();
                break;
            case 'bouncy':
                this.setupBouncyPlatform();
                break;
        }
    }
    
    setupNormalPlatform() {
        // Standard platform - no special behavior
        this.setDepth(1);
    }
    
    setupMovingPlatform() {
        // Moving platform properties - static bodies are immovable by default
        this.moveSpeed = 60; // pixels per second
        this.moveDistance = 120;
        this.moveDirection = 1;
        this.setDepth(1);
        
        // Movement boundaries
        this.leftBound = this.originalX - this.moveDistance;
        this.rightBound = this.originalX + this.moveDistance;
        
        // Ensure boundaries are within screen bounds
        this.leftBound = Math.max(50, this.leftBound);
        this.rightBound = Math.min(750, this.rightBound);
        
        // Initialize movement
        this.isMoving = true;
        
        console.log(`🟢 Moving platform setup: X=${this.originalX}, Y=${this.originalY}, bounds=[${this.leftBound}, ${this.rightBound}]`);
    }
    
    setupBreakablePlatform() {
        // Breakable platform properties
        this.health = 1;
        this.isBreaking = false;
        this.breakDelay = 800; // milliseconds before breaking
        this.setDepth(1);
        
        // Add visual crack effect
        this.addCrackEffect();
    }
    
    setupBouncyPlatform() {
        // Bouncy platform properties
        this.bounceForce = -700;
        this.setTint(0x32CD32); // Green tint to distinguish
        this.setDepth(1);
        
        // Add bouncy animation
        this.scene.tweens.add({
            targets: this,
            scaleY: 1.1,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    // Override update to handle manual movement for moving platforms
    update(time, delta) {
        if (this.platformType !== 'moving' || !this.isActive || !this.isMoving) return;
        
        // Calculate movement distance for this frame
        const deltaSeconds = delta / 1000;
        const moveDistance = this.moveSpeed * deltaSeconds * this.moveDirection;
        
        // Calculate new position
        const newX = this.x + moveDistance;
        
        // Check boundaries and reverse direction if needed
        if (newX <= this.leftBound && this.moveDirection < 0) {
            this.moveDirection = 1;
            this.setPosition(this.leftBound, this.y);
        } else if (newX >= this.rightBound && this.moveDirection > 0) {
            this.moveDirection = -1;
            this.setPosition(this.rightBound, this.y);
        } else {
            // Move to new position
            this.setPosition(newX, this.y);
        }
        
        // Update physics body position
        if (this.body) {
            this.body.updateFromGameObject();
        }
    }
    
    addCrackEffect() {
        // Add a subtle crack overlay for breakable platforms
        this.crackGraphics = this.scene.add.graphics();
        this.crackGraphics.lineStyle(1, 0x8B4513, 0.5);
        
        // Draw some cracks
        this.crackGraphics.beginPath();
        this.crackGraphics.moveTo(this.x - 20, this.y - 5);
        this.crackGraphics.lineTo(this.x + 10, this.y + 5);
        this.crackGraphics.moveTo(this.x + 5, this.y - 8);
        this.crackGraphics.lineTo(this.x + 25, this.y + 2);
        this.crackGraphics.strokePath();
        
        this.crackGraphics.setDepth(2);
    }
    
    onPlayerLand(player) {
        if (!this.isActive) return;
        
        switch (this.platformType) {
            case 'breakable':
                this.startBreaking();
                break;
            case 'bouncy':
                this.bounce(player);
                break;
        }
        
        // Play landing sound specific to platform type
        if (window.GameManagers.audio) {
            window.GameManagers.audio.playPlatformLandSound(this.platformType);
        }
    }
    
    startBreaking() {
        if (this.isBreaking) return;
        
        this.isBreaking = true;
        
        // Visual breaking effect - shake and fade
        this.scene.tweens.add({
            targets: this,
            angle: { from: -2, to: 2 },
            duration: 50,
            repeat: Math.floor(this.breakDelay / 100),
            yoyo: true,
            ease: 'Power1.easeInOut'
        });
        
        // Start fading out
        this.scene.tweens.add({
            targets: this,
            alpha: 0.3,
            duration: this.breakDelay,
            ease: 'Power2.easeIn'
        });
        
        // Break after delay
        this.scene.time.delayedCall(this.breakDelay, () => {
            this.breakPlatform();
        });
        
        console.log('💥 Breakable platform starting to break');
    }
    
    breakPlatform() {
        if (!this.isActive) return;
        
        this.isActive = false;
        
        // Create breaking particles
        const breakParticles = this.scene.add.particles(this.x, this.y, 'dust-particle', {
            speed: { min: 50, max: 150 },
            scale: { start: 0.5, end: 0 },
            lifespan: 800,
            emitting: false,
            angle: { min: 0, max: 360 }
        });
        breakParticles.explode(10);
        
        // Disable physics body instead of destroying immediately
        if (this.body) {
            this.body.enable = false;
            this.body.checkCollision.none = true;
        }
        
        // Remove from platforms group to stop collision detection
        if (this.scene && this.scene.platforms) {
            this.scene.platforms.remove(this);
        }
        
        // Store scene reference before destruction
        const scene = this.scene;
        
        // Fade out and destroy
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            y: this.y + 50,
            duration: 300,
            ease: 'Power2.easeIn',
            onComplete: () => {
                // Now safely destroy the platform
                this.destroy();
                // Clean up particles using stored scene reference
                if (scene && scene.time) {
                    scene.time.delayedCall(1000, () => {
                        if (breakParticles) {
                            breakParticles.destroy();
                        }
                    });
                } else {
                    // Fallback: clean up particles immediately if scene is gone
                    if (breakParticles) {
                        breakParticles.destroy();
                    }
                }
            }
        });
        
        // Clean up crack graphics
        if (this.crackGraphics) {
            this.crackGraphics.destroy();
        }
        
        // Play breaking sound
        if (window.GameManagers.audio) {
            window.GameManagers.audio.playPlatformBreakSound();
        }
        
        console.log('💥 Platform broken!');
    }
    
    bounce(player) {
        if (!player || !this.isActive) return;
        
        // Apply bounce force to player
        player.boost(this.bounceForce);
        
        // Visual bounce effect
        this.scene.tweens.add({
            targets: this,
            scaleY: 0.7,
            duration: 100,
            yoyo: true,
            ease: 'Power2.easeOut'
        });
        
        // Create bounce particles
        const bounceParticles = this.scene.add.particles(this.x, this.y - 8, 'sparkle-particle', {
            speed: { min: 30, max: 80 },
            scale: { start: 0.5, end: 0 },
            lifespan: 500,
            emitting: false,
            angle: { min: -45, max: -135 }
        });
        bounceParticles.explode(6);
        
        // Clean up particles
        this.scene.time.delayedCall(1000, () => {
            bounceParticles.destroy();
        });
        
        console.log('🚀 Player bounced from platform');
    }
    
    // Static method to create platforms with appropriate spacing
    static generatePlatformCluster(scene, centerX, centerY, count = 3) {
        const platforms = [];
        const types = ['normal', 'normal', 'moving', 'breakable', 'bouncy'];
        
        for (let i = 0; i < count; i++) {
            const offsetX = (Math.random() - 0.5) * 300; // Random horizontal spread
            const offsetY = Math.random() * 50; // Small vertical variation
            const type = types[Math.floor(Math.random() * types.length)];
            
            // Ensure platform is within screen bounds
            const x = Phaser.Math.Clamp(centerX + offsetX, 50, 750);
            const y = centerY + offsetY;
            
            const platform = new Platform(scene, x, y, type);
            platforms.push(platform);
        }
        
        return platforms;
    }
    
    // Method to check if platform is too far below camera (for cleanup)
    isBelowCamera(camera) {
        return this.y > camera.scrollY + camera.height + 100;
    }
    
    destroy() {
        // Clean up tweens
        if (this.moveTween) {
            this.moveTween.destroy();
        }
        
        // Clean up timer
        if (this.moveTimer) {
            this.moveTimer.destroy();
        }
        
        // Clean up graphics
        if (this.crackGraphics) {
            this.crackGraphics.destroy();
        }
        
        // Remove from platforms group if still there
        if (this.scene && this.scene.platforms && this.scene.platforms.children) {
            this.scene.platforms.remove(this, true);
        }
        
        super.destroy();
    }
}
