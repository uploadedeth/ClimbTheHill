// BootScene.js - Asset loading and procedural texture generation for ClimbTheHill

class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }
    
    preload() {
        // Set loading progress tracking
        this.load.on('progress', (percentage) => {
            console.log('Loading assets: ' + Math.round(percentage * 100) + '%');
        });
        
        this.load.on('complete', () => {
            console.log('All assets loaded!');
        });
        
        console.log('🎮 Loading ClimbTheHill assets...');
        
        // Load player sprite
        this.load.image('player-sprite', 'assets/images/right-sticky.png');
        
        // Load menu wallpaper
        this.load.image('menu-wallpaper', 'assets/images/menu-wallpaper.png');
        
        // Load game wallpapers for different heights
        this.load.image('wallpaper-1', 'assets/images/1.png'); // 0-100m
        this.load.image('wallpaper-2', 'assets/images/2.png'); // 100-250m
        this.load.image('wallpaper-3', 'assets/images/3.png'); // 250m+
        
        // Generate procedural textures for other game elements
        this.generateTextures();
    }
    
    generateTextures() {
        console.log('🎨 Generating procedural textures...');
        
        // Skip player texture generation - using sprite image instead
        
        // Generate platform textures
        this.generatePlatformTextures();
        
        // Generate background elements
        this.generateBackgroundTextures();
        
        // Generate particle textures
        this.generateParticleTextures();
        
        // Generate UI textures
        this.generateUITextures();
    }
    

    
    generatePlatformTextures() {
        // Standard platform (64x16)
        const platformGraphics = this.add.graphics();
        platformGraphics.fillStyle(0x8B4513); // Brown color
        platformGraphics.fillRect(0, 0, 64, 16);
        
        // Add texture details
        platformGraphics.fillStyle(0x654321); // Darker brown for texture
        for (let i = 0; i < 64; i += 8) {
            platformGraphics.fillRect(i, 12, 8, 4);
        }
        
        // Add highlights
        platformGraphics.fillStyle(0xA0522D); // Lighter brown
        platformGraphics.fillRect(0, 0, 64, 2);
        
        platformGraphics.generateTexture('platform', 64, 16);
        platformGraphics.destroy();
        
        // Moving platform (different color)
        const movingPlatformGraphics = this.add.graphics();
        movingPlatformGraphics.fillStyle(0x32CD32); // Green color
        movingPlatformGraphics.fillRect(0, 0, 64, 16);
        
        // Add glowing effect
        movingPlatformGraphics.fillStyle(0x228B22); // Darker green
        movingPlatformGraphics.fillRect(0, 12, 64, 4);
        movingPlatformGraphics.fillStyle(0x90EE90); // Light green highlight
        movingPlatformGraphics.fillRect(0, 0, 64, 2);
        
        movingPlatformGraphics.generateTexture('moving-platform', 64, 16);
        movingPlatformGraphics.destroy();
        
        // Breakable platform (fragile looking)
        const breakablePlatformGraphics = this.add.graphics();
        breakablePlatformGraphics.fillStyle(0xD2691E); // Orange-brown color
        breakablePlatformGraphics.fillRect(0, 0, 64, 16);
        
        // Add cracks
        breakablePlatformGraphics.fillStyle(0x8B4513); // Dark brown for cracks
        breakablePlatformGraphics.fillRect(16, 4, 2, 8);
        breakablePlatformGraphics.fillRect(32, 2, 2, 12);
        breakablePlatformGraphics.fillRect(48, 6, 2, 6);
        
        breakablePlatformGraphics.generateTexture('breakable-platform', 64, 16);
        breakablePlatformGraphics.destroy();
        
        console.log('✅ Platform textures generated');
    }
    
    generateBackgroundTextures() {
        // Cloud texture
        const cloudGraphics = this.add.graphics();
        cloudGraphics.fillStyle(0xFFFFFF); // White
        cloudGraphics.fillCircle(0, 0, 20);
        cloudGraphics.fillCircle(15, -5, 15);
        cloudGraphics.fillCircle(-15, -5, 15);
        cloudGraphics.fillCircle(10, 5, 12);
        cloudGraphics.fillCircle(-10, 5, 12);
        
        cloudGraphics.generateTexture('cloud', 40, 40);
        cloudGraphics.destroy();
        
        // Mountain silhouette for background
        const mountainGraphics = this.add.graphics();
        mountainGraphics.fillStyle(0x696969); // Gray
        mountainGraphics.beginPath();
        mountainGraphics.moveTo(0, 100);
        mountainGraphics.lineTo(50, 20);
        mountainGraphics.lineTo(100, 60);
        mountainGraphics.lineTo(150, 10);
        mountainGraphics.lineTo(200, 80);
        mountainGraphics.lineTo(200, 100);
        mountainGraphics.closePath();
        mountainGraphics.fillPath();
        
        mountainGraphics.generateTexture('mountain', 200, 100);
        mountainGraphics.destroy();
        
        console.log('✅ Background textures generated');
    }
    
    generateParticleTextures() {
        // Jump particle
        const jumpParticleGraphics = this.add.graphics();
        jumpParticleGraphics.fillStyle(0xFFD700); // Gold color
        jumpParticleGraphics.fillCircle(2, 2, 2);
        jumpParticleGraphics.generateTexture('jump-particle', 4, 4);
        jumpParticleGraphics.destroy();
        
        // Land particle (dust)
        const dustParticleGraphics = this.add.graphics();
        dustParticleGraphics.fillStyle(0xDEB887); // Burlywood
        dustParticleGraphics.fillCircle(3, 3, 3);
        dustParticleGraphics.generateTexture('dust-particle', 6, 6);
        dustParticleGraphics.destroy();
        
        // Pickup sparkle
        const sparkleGraphics = this.add.graphics();
        sparkleGraphics.fillStyle(0x00FFFF); // Cyan
        sparkleGraphics.fillCircle(2, 2, 2);
        sparkleGraphics.fillStyle(0xFFFFFF); // White center
        sparkleGraphics.fillCircle(2, 2, 1);
        sparkleGraphics.generateTexture('sparkle-particle', 4, 4);
        sparkleGraphics.destroy();
        
        console.log('✅ Particle textures generated');
    }
    
    generateUITextures() {
        // Button background (Orange)
        const buttonGraphics = this.add.graphics();
        buttonGraphics.fillStyle(0xFF6600); // Orange
        buttonGraphics.fillRoundedRect(0, 0, 250, 60, 10); // Increased width from 200 to 250
        buttonGraphics.lineStyle(2, 0xCC5500); // Darker orange border
        buttonGraphics.strokeRoundedRect(0, 0, 250, 60, 10);
        buttonGraphics.generateTexture('button-bg', 250, 60);
        buttonGraphics.destroy();
        
        // Button hover state (Lighter Orange)
        const buttonHoverGraphics = this.add.graphics();
        buttonHoverGraphics.fillStyle(0xFF8533); // Lighter orange
        buttonHoverGraphics.fillRoundedRect(0, 0, 250, 60, 10); // Increased width from 200 to 250
        buttonHoverGraphics.lineStyle(2, 0xFF6600); // Orange border
        buttonHoverGraphics.strokeRoundedRect(0, 0, 250, 60, 10);
        buttonHoverGraphics.generateTexture('button-hover', 250, 60);
        buttonHoverGraphics.destroy();
        
        // Score coin texture
        const coinGraphics = this.add.graphics();
        coinGraphics.fillStyle(0xFFD700); // Gold
        coinGraphics.fillCircle(8, 8, 8);
        coinGraphics.fillStyle(0xFFA500); // Orange for inner circle
        coinGraphics.fillCircle(8, 8, 5);
        coinGraphics.fillStyle(0xFFD700); // Gold center
        coinGraphics.fillCircle(8, 8, 3);
        coinGraphics.generateTexture('coin', 16, 16);
        coinGraphics.destroy();
        
        console.log('✅ UI textures generated');
    }
    
    create() {
        // Initialize managers
        window.GameManagers = window.GameManagers || {};
        
        // Initialize audio manager
        window.GameManagers.audio = new AudioManager(this);
        
        // Initialize UI manager
        window.GameManagers.ui = new UIManager();
        
        // Create player animations
        this.createPlayerAnimations();
        
        console.log('✅ Boot Scene complete - all textures and animations ready');
        
        // Proceed to menu scene
        this.scene.start('MenuScene');
    }
    
    createPlayerAnimations() {
        try {
            console.log('🎭 Creating player animations...');
            
            // Using the player sprite image for all animations
            
            // Idle animation
            this.anims.create({
                key: 'player-idle',
                frames: [{ key: 'player-sprite', frame: 0 }],
                frameRate: 1
            });
            
            // Jump animation
            this.anims.create({
                key: 'player-jump',
                frames: [{ key: 'player-sprite', frame: 0 }],
                frameRate: 1
            });
            
            // Fall animation
            this.anims.create({
                key: 'player-fall',
                frames: [{ key: 'player-sprite', frame: 0 }],
                frameRate: 1
            });
            
            console.log('✅ Player animations created successfully');
            
        } catch (error) {
            console.error('❌ Error creating player animations:', error);
        }
    }
}
