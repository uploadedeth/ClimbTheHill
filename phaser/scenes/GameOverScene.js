// GameOverScene.js - Game over scene with stats and restart options

class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }
    
    init(data) {
        // Receive data from GameScene
        this.finalScore = data.score || 0;
        this.finalHeight = data.height || 0;
        this.gameTime = data.time || null; // Time not shown for 60-second challenges
        this.itemsCollected = data.items || 0;
        this.victory = data.victory || false;
        
        console.log('📊 Game Over data received:', data);
    }
    
    create() {
        // Create background
        this.createBackground();
        
        // Create game over title
        this.createTitle();
        
        // Create stats display
        this.createStatsDisplay();
        
        // Create buttons
        this.createButtons();
        
        // Set up input
        this.setupInput();
        
        // Add entrance animation
        this.playEntranceAnimation();
        
        console.log('💀 GameOverScene created');
    }
    
    createBackground() {
        // Dark overlay background
        const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
        
        // Add some stars for atmosphere (since player climbed high)
        this.createStars();
        
        // Add floating particles
        this.createFloatingParticles();
    }
    
    createStars() {
        this.stars = this.add.group();
        
        for (let i = 0; i < 50; i++) {
            const star = this.add.circle(
                Math.random() * 800,
                Math.random() * 600,
                1 + Math.random() * 2,
                0xFFFFFF
            );
            
            star.setAlpha(0.5 + Math.random() * 0.5);
            
            // Add twinkling animation
            this.tweens.add({
                targets: star,
                alpha: 0.2,
                duration: 1000 + Math.random() * 2000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            
            this.stars.add(star);
        }
    }
    
    createFloatingParticles() {
        // Create some floating dust particles for atmosphere
        this.particles = this.add.particles(400, 600, 'dust-particle', {
            speed: { min: 10, max: 30 },
            scale: { start: 0.1, end: 0 },
            lifespan: 3000,
            frequency: 200,
            emitZone: { source: new Phaser.Geom.Rectangle(0, 0, 800, 50) }
        });
    }
    
    createTitle() {
        // Main title
        this.titleText = this.add.text(400, 120, 'CLIMB COMPLETE!', {
            fontSize: '48px',
            fill: this.victory ? '#32CD32' : '#FF6B6B',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4,
            shadow: {
                offsetX: 3,
                offsetY: 3,
                color: '#000000',
                blur: 6,
                fill: true
            }
        }).setOrigin(0.5);
        
        // Subtitle based on performance
        let subtitle = this.getSubtitle();
        this.subtitleText = this.add.text(400, 170, subtitle, {
            fontSize: '20px',
            fill: '#FFFFFF',
            fontFamily: 'Arial, sans-serif',
            align: 'center'
        }).setOrigin(0.5);
        
        // Set initial scale for animation
        this.titleText.setScale(0);
        this.subtitleText.setScale(0);
    }
    
    getSubtitle() {
        if (this.finalHeight >= 1000) {
            return 'INCREDIBLE ASCENT!\nYou reached the clouds!';
        } else if (this.finalHeight >= 500) {
            return 'GREAT CLIMB!\nYou\'re getting higher!';
        } else if (this.finalHeight >= 200) {
            return 'GOOD EFFORT!\nKeep practicing!';
        } else {
            return 'NICE TRY!\nEvery climb starts with a single jump!';
        }
    }
    
    createStatsDisplay() {
        // Stats container
        const statsContainer = this.add.container(400, 320);
        
        // Background for stats
        const statsBg = this.add.rectangle(0, 0, 500, 200, 0x000000, 0.7);
        statsBg.setStrokeStyle(3, 0x4A90E2);
        statsContainer.add(statsBg);
        
        // Stats title
        const statsTitle = this.add.text(0, -80, 'FINAL STATISTICS', {
            fontSize: '24px',
            fill: '#4A90E2',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        statsContainer.add(statsTitle);
        
        // Individual stats (excluding time for 60-second challenge mode)
        const stats = [
            { label: 'Final Score:', value: this.finalScore.toLocaleString(), icon: '🏆' },
            { label: 'Height Reached:', value: `${Math.floor(this.finalHeight)}m`, icon: '🏔️' },
            { label: 'Items Collected:', value: this.itemsCollected, icon: '✨' }
        ];
        
        // Only show time if it was provided (for other game modes)
        if (this.gameTime !== null) {
            stats.splice(2, 0, { label: 'Time Played:', value: this.formatTime(this.gameTime), icon: '⏱️' });
        }
        
        stats.forEach((stat, index) => {
            const y = -40 + (index * 30);
            
            // Stat icon
            const icon = this.add.text(-180, y, stat.icon, {
                fontSize: '20px'
            }).setOrigin(0.5);
            statsContainer.add(icon);
            
            // Stat label
            const label = this.add.text(-150, y, stat.label, {
                fontSize: '16px',
                fill: '#CCCCCC',
                fontFamily: 'Arial, sans-serif'
            }).setOrigin(0, 0.5);
            statsContainer.add(label);
            
            // Stat value
            const value = this.add.text(180, y, stat.value.toString(), {
                fontSize: '16px',
                fill: '#FFFFFF',
                fontFamily: 'Arial, sans-serif',
                fontStyle: 'bold'
            }).setOrigin(1, 0.5);
            statsContainer.add(value);
        });
        
        // Performance rating
        const rating = this.getPerformanceRating();
        const ratingText = this.add.text(0, 70, rating.text, {
            fontSize: '18px',
            fill: rating.color,
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        statsContainer.add(ratingText);
        
        this.statsContainer = statsContainer;
        statsContainer.setScale(0); // For animation
    }
    
    getPerformanceRating() {
        // Performance rating based on score and height (time not used in 60-second challenge)
        if (this.finalScore >= 2000 || this.finalHeight >= 100) {
            return { text: '⭐ LEGENDARY CLIMBER ⭐', color: '#FFD700' };
        } else if (this.finalScore >= 1000 || this.finalHeight >= 50) {
            return { text: '🌟 SKILLED CLIMBER 🌟', color: '#C0C0C0' };
        } else if (this.finalScore >= 500 || this.finalHeight >= 25) {
            return { text: '✨ RISING CLIMBER ✨', color: '#CD7F32' };
        } else {
            return { text: '🔸 NOVICE CLIMBER 🔸', color: '#4A90E2' };
        }
    }
    
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
    
    createButtons() {
        // Play Again button
        this.playAgainButton = this.add.image(280, 480, 'button-bg');
        this.playAgainButton.setInteractive({ useHandCursor: true });
        this.playAgainButton.setScale(0.8);
        
        this.playAgainText = this.add.text(280, 480, 'PLAY AGAIN', {
            fontSize: '20px',
            fill: '#FFFFFF',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Main Menu button
        this.mainMenuButton = this.add.image(520, 480, 'button-bg');
        this.mainMenuButton.setInteractive({ useHandCursor: true });
        this.mainMenuButton.setScale(0.8);
        
        this.mainMenuText = this.add.text(520, 480, 'MAIN MENU', {
            fontSize: '20px',
            fill: '#FFFFFF',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Button interactions
        this.setupButtonInteractions();
        
        // Set initial scale for animation
        this.playAgainButton.setScale(0);
        this.playAgainText.setScale(0);
        this.mainMenuButton.setScale(0);
        this.mainMenuText.setScale(0);
    }
    
    setupButtonInteractions() {
        // Play Again button
        this.playAgainButton.on('pointerover', () => {
            this.playAgainButton.setTexture('button-hover');
            this.tweens.add({
                targets: [this.playAgainButton, this.playAgainText],
                scaleX: 0.9,
                scaleY: 0.9,
                duration: 200,
                ease: 'Back.easeOut'
            });
        });
        
        this.playAgainButton.on('pointerout', () => {
            this.playAgainButton.setTexture('button-bg');
            this.tweens.add({
                targets: [this.playAgainButton, this.playAgainText],
                scaleX: 0.8,
                scaleY: 0.8,
                duration: 200,
                ease: 'Back.easeOut'
            });
        });
        
        this.playAgainButton.on('pointerdown', () => {
            this.playAgainClicked();
        });
        
        // Main Menu button
        this.mainMenuButton.on('pointerover', () => {
            this.mainMenuButton.setTexture('button-hover');
            this.tweens.add({
                targets: [this.mainMenuButton, this.mainMenuText],
                scaleX: 0.9,
                scaleY: 0.9,
                duration: 200,
                ease: 'Back.easeOut'
            });
        });
        
        this.mainMenuButton.on('pointerout', () => {
            this.mainMenuButton.setTexture('button-bg');
            this.tweens.add({
                targets: [this.mainMenuButton, this.mainMenuText],
                scaleX: 0.8,
                scaleY: 0.8,
                duration: 200,
                ease: 'Back.easeOut'
            });
        });
        
        this.mainMenuButton.on('pointerdown', () => {
            this.mainMenuClicked();
        });
    }
    
    setupInput() {
        // Keyboard shortcuts
        this.input.keyboard.on('keydown-SPACE', () => {
            this.playAgainClicked();
        });
        
        this.input.keyboard.on('keydown-ENTER', () => {
            this.playAgainClicked();
        });
        
        this.input.keyboard.on('keydown-ESC', () => {
            this.mainMenuClicked();
        });
    }
    
    playEntranceAnimation() {
        // Animate title
        this.tweens.add({
            targets: this.titleText,
            scale: 1,
            duration: 800,
            ease: 'Back.easeOut',
            delay: 200
        });
        
        this.tweens.add({
            targets: this.subtitleText,
            scale: 1,
            duration: 600,
            ease: 'Back.easeOut',
            delay: 600
        });
        
        // Animate stats container
        this.tweens.add({
            targets: this.statsContainer,
            scale: 1,
            duration: 800,
            ease: 'Back.easeOut',
            delay: 1000
        });
        
        // Animate buttons
        this.tweens.add({
            targets: [this.playAgainButton, this.playAgainText],
            scale: 0.8,
            duration: 600,
            ease: 'Back.easeOut',
            delay: 1400
        });
        
        this.tweens.add({
            targets: [this.mainMenuButton, this.mainMenuText],
            scale: 0.8,
            duration: 600,
            ease: 'Back.easeOut',
            delay: 1600
        });
    }
    
    playAgainClicked() {
        console.log('🔄 Play Again clicked');
        
        // Play sound
        if (window.GameManagers.audio) {
            window.GameManagers.audio.playMenuSound();
        }
        
        // Reset UI
        if (window.GameManagers.ui) {
            window.GameManagers.ui.reset();
        }
        
        // Fade out and start new game
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('GameScene');
        });
    }
    
    mainMenuClicked() {
        console.log('🏠 Main Menu clicked');
        
        // Play sound
        if (window.GameManagers.audio) {
            window.GameManagers.audio.playMenuSound();
        }
        
        // Reset UI
        if (window.GameManagers.ui) {
            window.GameManagers.ui.reset();
        }
        
        // Fade out and go to menu
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('MenuScene');
        });
    }
}
