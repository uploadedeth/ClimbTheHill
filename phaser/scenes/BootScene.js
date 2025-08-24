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
        this.load.image('menu-wallpaper', 'assets/images/wallpaper-stick.png');
        
        // Load game wallpapers for different heights
        this.load.image('wallpaper-1', 'assets/images/1.png'); // 0-100m
        this.load.image('wallpaper-2', 'assets/images/2.png'); // 100-250m
        this.load.image('wallpaper-3', 'assets/images/3.png'); // 250m+
        
        // Load collectible item
        this.load.image('stick', 'assets/images/stick2.png');
        
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
        // Wood platform with green plants for low heights (0-100m)
        const platformGraphics = this.add.graphics();
        
        // Wood base - rich brown wood color
        platformGraphics.fillStyle(0x8B4513); // Saddle brown
        platformGraphics.fillRect(0, 0, 64, 16);
        
        // Wood grain pattern
        platformGraphics.fillStyle(0x654321); // Dark brown for wood grain
        for (let i = 0; i < 64; i += 8) {
            platformGraphics.fillRect(i, 12, 8, 4); // Bottom edge details
            platformGraphics.fillRect(i + 2, 8, 4, 2); // Middle grain lines
        }
        
        // Wood highlight
        platformGraphics.fillStyle(0xA0522D); // Lighter brown highlight
        platformGraphics.fillRect(0, 0, 64, 2);
        
        // Add green plant details on top
        platformGraphics.fillStyle(0x228B22); // Forest green for plants
        // Small grass tufts across the platform
        for (let i = 4; i < 60; i += 12) {
            // Grass blades
            platformGraphics.fillRect(i, 0, 2, 3);
            platformGraphics.fillRect(i + 2, 0, 1, 4);
            platformGraphics.fillRect(i + 4, 0, 2, 2);
        }
        
        // Add some small leaves/foliage
        platformGraphics.fillStyle(0x32CD32); // Lime green for variety
        platformGraphics.fillRect(8, 0, 3, 2);
        platformGraphics.fillRect(24, 0, 2, 3);
        platformGraphics.fillRect(40, 0, 3, 2);
        platformGraphics.fillRect(56, 0, 2, 2);
        
        platformGraphics.generateTexture('platform-low', 64, 16);
        platformGraphics.destroy();
        
        // Create rocky platform for medium altitudes (100-250m)
        const rockyPlatformGraphics = this.add.graphics();
        
        // Rocky base - dark gray color
        rockyPlatformGraphics.fillStyle(0x696969); // Dark gray
        rockyPlatformGraphics.fillRect(0, 0, 64, 16);
        
        // Rocky texture with varied grays
        rockyPlatformGraphics.fillStyle(0x2F4F4F); // Dark slate gray
        for (let i = 0; i < 64; i += 12) {
            rockyPlatformGraphics.fillRect(i + 2, 10, 6, 6); // Rocky chunks
            rockyPlatformGraphics.fillRect(i + 1, 4, 3, 4); // Rock variations
        }
        
        // Add dust particles on top
        rockyPlatformGraphics.fillStyle(0xD2B48C); // Tan dust color
        for (let i = 6; i < 58; i += 8) {
            rockyPlatformGraphics.fillRect(i, 0, 2, 1); // Dust spots
            rockyPlatformGraphics.fillRect(i + 3, 0, 1, 2); // More dust
        }
        
        // Rocky cracks and highlights
        rockyPlatformGraphics.fillStyle(0x808080); // Light gray highlights
        rockyPlatformGraphics.fillRect(0, 0, 64, 1);
        rockyPlatformGraphics.fillStyle(0x2F2F2F); // Very dark gray for deep cracks
        rockyPlatformGraphics.fillRect(15, 3, 2, 10);
        rockyPlatformGraphics.fillRect(35, 2, 1, 12);
        rockyPlatformGraphics.fillRect(50, 4, 2, 8);
        
        rockyPlatformGraphics.generateTexture('platform-medium', 64, 16);
        rockyPlatformGraphics.destroy();
        
        // Create winter platform for high altitudes (250m+)
        const winterPlatformGraphics = this.add.graphics();
        
        // Ice/stone base - blue-gray color
        winterPlatformGraphics.fillStyle(0x4682B4); // Steel blue
        winterPlatformGraphics.fillRect(0, 0, 64, 16);
        
        // Darker blue-gray for depth
        winterPlatformGraphics.fillStyle(0x2F4F4F); // Dark slate gray with blue tint
        for (let i = 0; i < 64; i += 10) {
            winterPlatformGraphics.fillRect(i, 12, 8, 4); // Bottom edge
        }
        
        // Snow layer on top
        winterPlatformGraphics.fillStyle(0xFFFAFA); // Snow white
        winterPlatformGraphics.fillRect(0, 0, 64, 3); // Main snow layer
        
        // Snow drifts and details
        winterPlatformGraphics.fillStyle(0xF0F8FF); // Alice blue for snow variation
        for (let i = 4; i < 60; i += 12) {
            winterPlatformGraphics.fillRect(i, 3, 6, 2); // Snow drifts
            winterPlatformGraphics.fillRect(i + 2, 0, 3, 1); // Snow texture on top
        }
        
        // Ice crystals/icicles
        winterPlatformGraphics.fillStyle(0xE0FFFF); // Light cyan for ice
        winterPlatformGraphics.fillRect(10, 16, 2, 2); // Small icicle
        winterPlatformGraphics.fillRect(25, 15, 1, 3); // Thin icicle
        winterPlatformGraphics.fillRect(40, 16, 3, 1); // Ice formation
        winterPlatformGraphics.fillRect(55, 15, 2, 2); // Ice chunk
        
        winterPlatformGraphics.generateTexture('platform-high', 64, 16);
        winterPlatformGraphics.destroy();
        
        // Moving platform for low heights (0-100m) - Wood color only
        const movingLowGraphics = this.add.graphics();
        movingLowGraphics.fillStyle(0x8B4513); // Saddle brown (same as basic platform)
        movingLowGraphics.fillRect(0, 0, 64, 16);
        
        // Simple wood texture without plants
        movingLowGraphics.fillStyle(0x654321); // Dark brown for basic texture
        for (let i = 0; i < 64; i += 8) {
            movingLowGraphics.fillRect(i, 12, 8, 4);
        }
        movingLowGraphics.fillStyle(0xA0522D); // Lighter brown highlight
        movingLowGraphics.fillRect(0, 0, 64, 2);
        
        movingLowGraphics.generateTexture('moving-platform-low', 64, 16);
        movingLowGraphics.destroy();
        
        // Moving platform for medium heights (100-250m) - Rocky gray only
        const movingMediumGraphics = this.add.graphics();
        movingMediumGraphics.fillStyle(0x696969); // Dark gray (same as basic platform)
        movingMediumGraphics.fillRect(0, 0, 64, 16);
        
        // Simple rocky texture without dust
        movingMediumGraphics.fillStyle(0x2F4F4F); // Dark slate gray
        for (let i = 0; i < 64; i += 12) {
            movingMediumGraphics.fillRect(i + 2, 10, 6, 6);
        }
        movingMediumGraphics.fillStyle(0x808080); // Light gray highlight
        movingMediumGraphics.fillRect(0, 0, 64, 1);
        
        movingMediumGraphics.generateTexture('moving-platform-medium', 64, 16);
        movingMediumGraphics.destroy();
        
        // Moving platform for high heights (250m+) - Winter blue only
        const movingHighGraphics = this.add.graphics();
        movingHighGraphics.fillStyle(0x4682B4); // Steel blue (same as basic platform)
        movingHighGraphics.fillRect(0, 0, 64, 16);
        
        // Simple ice texture without snow details
        movingHighGraphics.fillStyle(0x2F4F4F); // Dark blue-gray for depth
        for (let i = 0; i < 64; i += 10) {
            movingHighGraphics.fillRect(i, 12, 8, 4);
        }
        movingHighGraphics.fillStyle(0x87CEEB); // Sky blue highlight
        movingHighGraphics.fillRect(0, 0, 64, 2);
        
        movingHighGraphics.generateTexture('moving-platform-high', 64, 16);
        movingHighGraphics.destroy();
        
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
        
        // Bouncy platform (black galaxy void style with subtle purple)
        const bouncyPlatformGraphics = this.add.graphics();
        
        // Deep black base
        bouncyPlatformGraphics.fillStyle(0x0A0A0A); // Very dark black
        bouncyPlatformGraphics.fillRect(0, 0, 64, 16);
        
        // Add subtle dark purple void areas
        bouncyPlatformGraphics.fillStyle(0x1A0A1A); // Very dark purple
        bouncyPlatformGraphics.fillRect(8, 4, 12, 8);
        bouncyPlatformGraphics.fillRect(32, 2, 16, 10);
        bouncyPlatformGraphics.fillRect(52, 6, 8, 6);
        
        // Add tiny purple "stars" or void sparkles
        bouncyPlatformGraphics.fillStyle(0x301030); // Subtle purple
        bouncyPlatformGraphics.fillRect(12, 2, 1, 1);
        bouncyPlatformGraphics.fillRect(28, 6, 1, 1);
        bouncyPlatformGraphics.fillRect(45, 3, 1, 1);
        bouncyPlatformGraphics.fillRect(58, 8, 1, 1);
        bouncyPlatformGraphics.fillRect(18, 12, 1, 1);
        bouncyPlatformGraphics.fillRect(38, 14, 1, 1);
        
        // Very subtle purple glow at bottom
        bouncyPlatformGraphics.fillStyle(0x200A20); // Dark purple glow
        bouncyPlatformGraphics.fillRect(0, 14, 64, 2);
        
        // Minimal purple highlight at top edge
        bouncyPlatformGraphics.fillStyle(0x2D1B2D); // Darker purple highlight
        bouncyPlatformGraphics.fillRect(0, 0, 64, 1);
        
        // Add bright pink cracks across the platform
        bouncyPlatformGraphics.fillStyle(0xFF1493); // Deep pink for maximum visibility
        
        // Main vertical cracks (much bigger for visibility)
        bouncyPlatformGraphics.fillRect(12, 0, 4, 16); // Left crack (4px wide, full height)
        bouncyPlatformGraphics.fillRect(30, 0, 4, 16); // Center crack (4px wide, full height)
        bouncyPlatformGraphics.fillRect(48, 0, 4, 16); // Right crack (4px wide, full height)
        
        // Horizontal crack connections (much thicker)
        bouncyPlatformGraphics.fillRect(6, 6, 16, 3); // Left horizontal crack (3px tall)
        bouncyPlatformGraphics.fillRect(26, 3, 18, 3); // Center horizontal crack (3px tall)
        bouncyPlatformGraphics.fillRect(42, 9, 16, 3); // Right horizontal crack (3px tall)
        
        // Add brighter crack glow for more visibility
        bouncyPlatformGraphics.fillStyle(0xFF69B4); // Hot pink for glow
        
        // Crack glow effect (bigger glow areas)
        bouncyPlatformGraphics.fillRect(10, 0, 2, 16); // Left glow of left crack
        bouncyPlatformGraphics.fillRect(16, 0, 2, 16); // Right glow of left crack
        bouncyPlatformGraphics.fillRect(28, 0, 2, 16); // Left glow of center crack
        bouncyPlatformGraphics.fillRect(34, 0, 2, 16); // Right glow of center crack
        bouncyPlatformGraphics.fillRect(46, 0, 2, 16); // Left glow of right crack
        bouncyPlatformGraphics.fillRect(52, 0, 2, 16); // Right glow of right crack
        
        // Large diagonal crack details with brighter color
        bouncyPlatformGraphics.fillStyle(0xFF1493); // Back to bright pink
        bouncyPlatformGraphics.fillRect(18, 2, 4, 2); // Bigger diagonal crack
        bouncyPlatformGraphics.fillRect(19, 4, 4, 2);
        bouncyPlatformGraphics.fillRect(20, 6, 4, 2);
        bouncyPlatformGraphics.fillRect(21, 8, 4, 2);
        
        bouncyPlatformGraphics.fillRect(36, 7, 4, 2); // Another big diagonal
        bouncyPlatformGraphics.fillRect(37, 9, 4, 2);
        bouncyPlatformGraphics.fillRect(38, 11, 4, 2);
        
        // Add some extra crack branches for more visible effect
        bouncyPlatformGraphics.fillRect(8, 12, 6, 2); // Bottom left branch
        bouncyPlatformGraphics.fillRect(54, 4, 6, 2); // Top right branch
        
        bouncyPlatformGraphics.generateTexture('bouncy-platform', 64, 16);
        bouncyPlatformGraphics.destroy();
        
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
