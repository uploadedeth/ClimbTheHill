// MenuScene.js - Main menu scene for ClimbTheHill

class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }
    
    create() {
        // Initialize scene state
        this.transitionInProgress = false;
        
        // Create background
        this.createBackground();
        
        // Create title
        this.createTitle();
        
        // Create start button
        this.createStartButton();
        
        // Create game instructions
        this.createInstructions();
        
        // Create scoring system info
        this.createScoringInfo();
        
        // Set up input
        this.setupInput();
        
        console.log('🏔️ ClimbTheHill Menu Scene loaded');
    }
    
    createBackground() {
        // Create gradient sky background
        const skyGraphics = this.add.graphics();
        
        // Create a sky gradient from light blue at top to darker at bottom
        for (let i = 0; i < 600; i++) {
            const alpha = i / 600;
            const color = Phaser.Display.Color.Interpolate.ColorWithColor(
                { r: 135, g: 206, b: 235 }, // Light sky blue
                { r: 70, g: 130, b: 180 },  // Steel blue
                100,
                alpha * 100
            );
            skyGraphics.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b));
            skyGraphics.fillRect(0, i, 800, 1);
        }
        
        // Add mountains in background
        this.createMountainBackground();
        
        // Add floating clouds
        this.createClouds();
        
        // Add overlay for better text readability
        const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.3);
    }
    
    createMountainBackground() {
        // Create multiple mountain layers for depth
        const mountainColors = [0x696969, 0x808080, 0xA9A9A9]; // Different shades of gray
        
        for (let layer = 0; layer < 3; layer++) {
            const mountainGraphics = this.add.graphics();
            mountainGraphics.fillStyle(mountainColors[layer]);
            
            // Create jagged mountain silhouette
            mountainGraphics.beginPath();
            mountainGraphics.moveTo(0, 600);
            
            for (let x = 0; x <= 800; x += 50) {
                const height = 400 - (layer * 50) + Math.random() * 100;
                mountainGraphics.lineTo(x, height);
            }
            
            mountainGraphics.lineTo(800, 600);
            mountainGraphics.closePath();
            mountainGraphics.fillPath();
            
            // Set depth
            mountainGraphics.setDepth(-10 + layer);
        }
    }
    
    createClouds() {
        // Add some floating clouds
        for (let i = 0; i < 5; i++) {
            const cloud = this.add.image(
                Math.random() * 800,
                Math.random() * 200 + 50,
                'cloud'
            );
            cloud.setScale(0.5 + Math.random() * 0.5);
            cloud.setAlpha(0.7);
            cloud.setDepth(-5);
            
            // Add floating animation
            this.tweens.add({
                targets: cloud,
                x: cloud.x + 50,
                duration: 5000 + Math.random() * 3000,
                repeat: -1,
                yoyo: true,
                ease: 'Sine.easeInOut'
            });
        }
    }
    
    createTitle() {
        // Main game title
        const title = this.add.text(400, 120, 'CLIMB THE HILL', {
            fontSize: '56px',
            fill: '#4A90E2',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            stroke: '#FFFFFF',
            strokeThickness: 6,
            shadow: {
                offsetX: 4,
                offsetY: 4,
                color: '#000000',
                blur: 8,
                fill: true
            }
        }).setOrigin(0.5);
        
        // Subtitle
        const subtitle = this.add.text(400, 180, 'Climb as high as you can!', {
            fontSize: '24px',
            fill: '#32CD32',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2,
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 4,
                fill: true
            }
        }).setOrigin(0.5);
        
        // Title animation - gentle scaling
        this.tweens.add({
            targets: title,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Subtitle floating animation
        this.tweens.add({
            targets: subtitle,
            y: subtitle.y + 10,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    createStartButton() {
        // Large start button in center
        const startButton = this.add.image(400, 280, 'button-bg');
        startButton.setInteractive({ useHandCursor: true });
        
        const startText = this.add.text(400, 280, 'START CLIMBING', {
            fontSize: '32px',
            fill: '#FFFFFF',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // Button interactions
        startButton.on('pointerover', () => {
            startButton.setTexture('button-hover');
            this.tweens.add({
                targets: [startButton, startText],
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 200,
                ease: 'Back.easeOut'
            });
        });
        
        startButton.on('pointerout', () => {
            startButton.setTexture('button-bg');
            this.tweens.add({
                targets: [startButton, startText],
                scaleX: 1,
                scaleY: 1,
                duration: 200,
                ease: 'Back.easeOut'
            });
        });
        
        startButton.on('pointerdown', () => {
            if (this.transitionInProgress) return;
            
            this.tweens.add({
                targets: [startButton, startText],
                scaleX: 0.95,
                scaleY: 0.95,
                duration: 100,
                yoyo: true,
                onComplete: () => {
                    this.startGame();
                }
            });
        });
        
        this.startButton = startButton;
        this.startText = startText;
    }
    
    createInstructions() {
        // Controls section in bottom left
        const controlsContainer = this.add.container(150, 480);
        
        // Background for controls
        const controlsBg = this.add.rectangle(0, 0, 180, 100, 0x000000, 0.7);
        controlsBg.setStrokeStyle(2, 0x4A90E2);
        controlsContainer.add(controlsBg);
        
        // Controls title
        const controlsTitle = this.add.text(0, -35, 'CONTROLS', {
            fontSize: '16px',
            fill: '#4A90E2',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        controlsContainer.add(controlsTitle);
        
        // Controls text
        const controlsText = this.add.text(0, -5, 'A/D or ←/→: Move\nSPACE or ↑: Jump', {
            fontSize: '12px',
            fill: '#FFFFFF',
            fontFamily: 'Arial, sans-serif',
            align: 'center',
            lineSpacing: 2
        }).setOrigin(0.5);
        controlsContainer.add(controlsText);
        
        // Mobile controls hint
        if (this.isTouchDevice()) {
            const mobileHint = this.add.text(0, 25, 'Touch controls\navailable', {
                fontSize: '10px',
                fill: '#CCCCCC',
                fontFamily: 'Arial, sans-serif',
                align: 'center'
            }).setOrigin(0.5);
            controlsContainer.add(mobileHint);
        }
    }
    
    createScoringInfo() {
        // Scoring info in bottom right
        const scoringContainer = this.add.container(650, 480);
        
        // Background for scoring info
        const scoringBg = this.add.rectangle(0, 0, 180, 100, 0x000000, 0.7);
        scoringBg.setStrokeStyle(2, 0x32CD32);
        scoringContainer.add(scoringBg);
        
        // Scoring title
        const scoringTitle = this.add.text(0, -35, 'SCORING', {
            fontSize: '16px',
            fill: '#32CD32',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        scoringContainer.add(scoringTitle);
        
        // Scoring text
        const scoringText = this.add.text(0, -5, 'Height climbed: +10\nPlatform reached: +50\nBonus items: +100', {
            fontSize: '10px',
            fill: '#FFFFFF',
            fontFamily: 'Arial, sans-serif',
            align: 'center',
            lineSpacing: 2
        }).setOrigin(0.5);
        scoringContainer.add(scoringText);
        
        // Add coin icon
        const coinIcon = this.add.image(-50, 25, 'coin');
        coinIcon.setScale(0.8);
        scoringContainer.add(coinIcon);
        
        // Animate coin
        this.tweens.add({
            targets: coinIcon,
            angle: 360,
            duration: 2000,
            repeat: -1,
            ease: 'Linear'
        });
    }
    
    setupInput() {
        // Keyboard shortcuts
        this.input.keyboard.on('keydown-SPACE', () => {
            if (!this.transitionInProgress) {
                this.startGame();
            }
        });
        
        this.input.keyboard.on('keydown-ENTER', () => {
            if (!this.transitionInProgress) {
                this.startGame();
            }
        });
        
        this.input.keyboard.on('keydown-UP', () => {
            if (!this.transitionInProgress) {
                this.startGame();
            }
        });
    }
    
    startGame() {
        if (this.transitionInProgress) return;
        
        this.transitionInProgress = true;
        console.log('🚀 Starting ClimbTheHill game...');
        
        // Play transition sound
        if (window.GameManagers.audio) {
            try {
                window.GameManagers.audio.playMenuSound();
            } catch (e) {
                console.warn('Audio error during game start:', e);
            }
        }
        
        // Add screen transition effect
        const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0);
        overlay.setDepth(1000);
        
        this.tweens.add({
            targets: overlay,
            alpha: 1,
            duration: 500,
            ease: 'Power2.easeIn',
            onComplete: () => {
                try {
                    console.log('🏔️ Transitioning to GameScene...');
                    this.scene.start('GameScene');
                } catch (e) {
                    console.error('Failed to start GameScene:', e);
                    this.transitionInProgress = false;
                    overlay.destroy();
                }
            }
        });
    }
    
    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
}
