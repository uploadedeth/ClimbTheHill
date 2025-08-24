// GameScene.js - Main game scene with vertical platformer mechanics

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }
    
    create() {
        console.log('🎮 Starting ClimbTheHill GameScene');
        
        // Initialize game state
        this.initializeGameState();
        
        // Create world bounds (infinite height)
        this.physics.world.setBounds(0, -10000, 800, 20000);
        
        // Create background
        this.createBackground();
        
        // Create player
        this.createPlayer();
        
        // Create initial platforms
        this.createPlatforms();
        
        // Set up camera
        this.setupCamera();
        
        // Set up collision detection
        this.setupCollisions();
        
        // Set up input
        this.setupInput();
        
        // Create UI elements
        this.createUI();
        
        // Start game loop
        this.startGameLoop();
        
        // Send game started event
        this.sendGameEvent('gameStart', {
            timestamp: Date.now()
        });
    }
    
    initializeGameState() {
        this.gameData = {
            score: 0,
            height: 0,
            maxHeight: 0,
            highestPlatformReached: 0, // Track highest platform index reached
            currentPlatformIndex: 0, // Current platform the player is on
            gameTime: 60, // Start with 60 seconds (countdown)
            startTime: Date.now(),
            isGameOver: false,
            platformsCreated: 0,
            itemsCollected: 0
        };
        
        // Platform generation settings
        this.platformSettings = {
            minDistance: 80,
            maxDistance: 150,
            minHeight: 80,
            maxHeight: 120,
            clusterSize: 2,
            lastPlatformY: 500,
            generationThreshold: 200, // Generate new platforms when camera is this close
            nextPlatformIndex: 1 // Start indexing from 1 (0 is ground level)
        };
        
        // Scoring system
        this.scoring = {
            heightMultiplier: 10,
            platformReached: 50,
            itemCollected: 100,
            timeBonus: 1
        };
        
        // Arrays and groups to hold game objects
        this.platforms = [];
        this.collectibles = this.physics.add.staticGroup(); // Use physics group for collision detection
        this.backgroundElements = [];
    }
    
    createBackground() {
        // Create scrolling sky background
        this.createSkyBackground();
        
        // Add parallax mountains
        this.createParallaxMountains();
        
        // Add floating clouds
        this.createFloatingClouds();
    }
    
    createSkyBackground() {
        // Create gradient sky that changes with height
        this.skyGraphics = this.add.graphics();
        this.updateSkyGradient(0);
        this.skyGraphics.setScrollFactor(0); // Fixed to camera
    }
    
    updateSkyGradient(height) {
        this.skyGraphics.clear();
        
        // Calculate sky colors based on height
        const heightRatio = Math.min(height / 2000, 1); // Changes over first 2000m
        
        // Sky blue to dark space
        const skyBlue = { r: 135, g: 206, b: 235 };
        const spaceBlue = { r: 25, g: 25, b: 112 };
        
        for (let i = 0; i < 600; i++) {
            const y = i;
            const localRatio = (i / 600) + heightRatio;
            const clampedRatio = Math.min(localRatio, 1);
            
            const color = Phaser.Display.Color.Interpolate.ColorWithColor(
                skyBlue,
                spaceBlue,
                100,
                clampedRatio * 100
            );
            
            this.skyGraphics.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b));
            this.skyGraphics.fillRect(0, y, 800, 1);
        }
    }
    
    createParallaxMountains() {
        // Create multiple mountain layers for depth
        this.mountainLayers = [];
        
        for (let layer = 0; layer < 3; layer++) {
            const mountains = this.add.group();
            
            // Create mountain sprites
            for (let i = 0; i < 5; i++) {
                const mountain = this.add.image(i * 200, 500 + layer * 20, 'mountain');
                mountain.setScrollFactor(0.1 + layer * 0.1); // Different parallax speeds
                mountain.setScale(0.5 + layer * 0.2);
                mountain.setAlpha(0.7 - layer * 0.2);
                mountain.setTint(0x888888 + layer * 0x222222);
                mountains.add(mountain);
            }
            
            this.mountainLayers.push(mountains);
        }
    }
    
    createFloatingClouds() {
        this.clouds = this.add.group();
        
        // Create initial clouds
        for (let i = 0; i < 8; i++) {
            this.createCloud();
        }
    }
    
    createCloud() {
        const cloud = this.add.image(
            Math.random() * 1000 - 100,
            Math.random() * 1000,
            'cloud'
        );
        
        cloud.setScale(0.3 + Math.random() * 0.4);
        cloud.setAlpha(0.6 + Math.random() * 0.3);
        cloud.setScrollFactor(0.2 + Math.random() * 0.3);
        
        // Add gentle floating animation
        this.tweens.add({
            targets: cloud,
            x: cloud.x + 100,
            duration: 8000 + Math.random() * 4000,
            repeat: -1,
            yoyo: true,
            ease: 'Sine.easeInOut'
        });
        
        this.clouds.add(cloud);
        return cloud;
    }
    
    createPlayer() {
        // Start at height 10: height = (550 - y) / 10, so y = 550 - (height * 10) = 550 - 100 = 450
        this.player = new Player(this, 400, 450);
        
        // Set up player event listeners
        this.player.on('jumped', () => {
            this.addScore(1); // Small score for jumping
        });
    }
    
    createPlatforms() {
        this.platforms = this.add.group();
        
        // Create ground reference platform at height 0 (y=550)
        const groundPlatform = new Platform(this, 400, 550, 'normal');
        groundPlatform.platformIndex = -1; // Below starting level
        this.platforms.add(groundPlatform);
        
        // Create starting platform near player (index 0) at height ~7
        const startPlatform = new Platform(this, 400, 480, 'normal');
        startPlatform.platformIndex = 0; // Starting level
        this.platforms.add(startPlatform);
        
        // Create initial platform clusters with indices
        this.generatePlatformCluster(400, 350); // Higher up
        this.generatePlatformCluster(300, 200); // Even higher
        this.generatePlatformCluster(500, 100);
    }
    
    generatePlatformCluster(centerX, centerY) {
        const clusterSize = 2 + Math.floor(Math.random() * 3); // 2-4 platforms per cluster
        
        for (let i = 0; i < clusterSize; i++) {
            const offsetX = (Math.random() - 0.5) * 400;
            const offsetY = Math.random() * 60;
            
            const x = Phaser.Math.Clamp(centerX + offsetX, 50, 750);
            const y = centerY + offsetY;
            
            // Choose platform type based on height
            let type = 'normal';
            const random = Math.random();
            
            if (centerY < 0) { // Higher up, more variety
                if (random < 0.3) type = 'moving';
                else if (random < 0.5) type = 'breakable';
                else if (random < 0.6) type = 'bouncy';
            } else if (random < 0.2) {
                type = 'moving';
            }
            
            const platform = new Platform(this, x, y, type);
            
            // Assign platform index based on height (higher platforms get higher indices)
            platform.platformIndex = this.platformSettings.nextPlatformIndex;
            this.platformSettings.nextPlatformIndex++;
            
            this.platforms.add(platform);
            
            // Occasionally add collectibles
            if (Math.random() < 0.3) {
                this.createCollectible(x, y - 30);
            }
        }
        
        this.platformSettings.lastPlatformY = Math.min(this.platformSettings.lastPlatformY, centerY);
    }
    
    createCollectible(x, y) {
        const collectible = this.add.image(x, y, 'coin');
        collectible.setScale(0.8);
        
        // Add floating animation
        this.tweens.add({
            targets: collectible,
            y: y - 10,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Add rotation
        this.tweens.add({
            targets: collectible,
            angle: 360,
            duration: 2000,
            repeat: -1,
            ease: 'Linear'
        });
        
        // Enable physics for collection
        this.physics.add.existing(collectible, true);
        
        // Add to physics group for collision detection
        this.collectibles.add(collectible);
        return collectible;
    }
    
    setupCamera() {
        // Set camera to follow player with vertical offset
        this.cameras.main.startFollow(this.player, true, 0.1, 0.2);
        this.cameras.main.setFollowOffset(0, 100);
        
        // Set camera bounds
        this.cameras.main.setBounds(0, -10000, 800, 20000);
        
        // Set camera lerp for smooth following
        this.cameras.main.setLerp(0.1, 0.2);
    }
    
    setupCollisions() {
        // Player-platform collisions
        this.platformLandingCooldown = new Set(); // Track recent landings to prevent multiple triggers
        
        this.physics.add.collider(this.player, this.platforms, (player, platform) => {
            // Check if player is touching the platform from above (landing on top)
            if (player.body.touching.down && platform.body.touching.up) {
                // Only trigger landing effects once per platform
                if (!this.platformLandingCooldown.has(platform)) {
                    platform.onPlayerLand(player);
                    
                    // Update score based on platform reached
                    this.updateScoreForPlatform(platform.platformIndex);
                    
                    // Add to cooldown to prevent multiple triggers
                    this.platformLandingCooldown.add(platform);
                    
                    // Remove from cooldown after a short delay
                    this.time.delayedCall(500, () => {
                        this.platformLandingCooldown.delete(platform);
                    });
                }
            }
        });
        
        // Player-collectible overlaps
        this.physics.add.overlap(this.player, this.collectibles, (player, collectible) => {
            this.collectItem(collectible);
        });
    }
    
    setupInput() {
        // Mobile controls setup
        this.setupMobileControls();
        
        // Keyboard controls are handled by Player class
        
        // Pause key
        this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    }
    
    setupMobileControls() {
        // Get mobile control elements
        this.mobileLeftBtn = document.getElementById('move-left');
        this.mobileRightBtn = document.getElementById('move-right');
        this.mobileJumpBtn = document.getElementById('jump-btn');
        
        if (this.mobileLeftBtn) {
            this.mobileLeftBtn.addEventListener('touchstart', () => {
                this.mobileLeftBtn.classList.add('pressed');
            });
            this.mobileLeftBtn.addEventListener('touchend', () => {
                this.mobileLeftBtn.classList.remove('pressed');
            });
        }
        
        // Similar setup for other mobile buttons...
    }
    
    createUI() {
        // UI is handled by UIManager, just update it
        this.updateUI();
    }
    
    startGameLoop() {
        // Create game timer
        this.gameTimer = this.time.addEvent({
            delay: 100, // Update every 100ms
            callback: this.updateGameLoop,
            callbackScope: this,
            loop: true
        });
    }
    
    updateGameLoop() {
        if (this.gameData.isGameOver) return;
        
        // Update game time (countdown from 60 seconds)
        const elapsedSeconds = (Date.now() - this.gameData.startTime) / 1000;
        this.gameData.gameTime = Math.max(0, 60 - elapsedSeconds);
        
        // Check if time is up
        if (this.gameData.gameTime <= 0) {
            console.log('⏰ Time Up! Game ended after 60 seconds');
            this.gameOver();
            return;
        }
        
        // Update height display only (no scoring)
        this.updateHeightDisplay();
        
        // Generate new platforms if needed
        this.checkPlatformGeneration();
        
        // Clean up old platforms
        this.cleanupOldPlatforms();
        
        // Update sky based on height
        if (this.gameData.height % 100 === 0) { // Update every 100m
            this.updateSkyGradient(this.gameData.height);
        }
        
        // Check game over conditions (only fall detection now, time is main constraint)
        this.checkGameOver();
        
        // Update UI
        this.updateUI();
    }
    
    updateScoreForPlatform(platformIndex) {
        // Update current platform index
        this.gameData.currentPlatformIndex = platformIndex;
        
        // Check if this is a new highest platform reached
        if (platformIndex > this.gameData.highestPlatformReached) {
            this.gameData.highestPlatformReached = platformIndex;
            
            // Calculate score based on platform index
            const baseScore = platformIndex * this.scoring.platformReached;
            
            // Set score to match highest platform reached (plus any collectible bonuses)
            const newScore = baseScore + (this.gameData.itemsCollected * this.scoring.itemCollected);
            
            console.log(`🏔️ New platform reached! Platform ${platformIndex}, Score: ${newScore}`);
            
            // Update score directly (don't add, set it)
            this.gameData.score = newScore;
            
            // Send score update event
            this.sendGameEvent('scoreUpdate', {
                score: this.gameData.score,
                platformIndex: platformIndex
            });
        }
        
        // Update height for display
        this.updateHeightDisplay();
    }
    
    updateHeightDisplay() {
        // Calculate height based on player position for display only
        const currentHeight = Math.max(0, (550 - this.player.y) / 10);
        this.gameData.height = currentHeight;
        
        // Update max height for display
        if (currentHeight > this.gameData.maxHeight) {
            this.gameData.maxHeight = currentHeight;
        }
    }
    
    checkPlatformGeneration() {
        const cameraY = this.cameras.main.scrollY;
        
        // Generate new platforms if camera is approaching the top platforms
        if (this.platformSettings.lastPlatformY - cameraY > -this.platformSettings.generationThreshold) {
            const newY = this.platformSettings.lastPlatformY - this.platformSettings.minHeight;
            const newX = 200 + Math.random() * 400;
            
            this.generatePlatformCluster(newX, newY);
        }
    }
    
    cleanupOldPlatforms() {
        const cameraY = this.cameras.main.scrollY;
        const cleanupThreshold = cameraY + 800; // Remove platforms below camera view
        
        this.platforms.children.entries.forEach(platform => {
            if (platform.y > cleanupThreshold) {
                platform.destroy();
            }
        });
        
        // Clean up collectibles too
        this.collectibles.children.entries.forEach(collectible => {
            if (collectible.y > cleanupThreshold) {
                this.collectibles.remove(collectible, true, true); // Remove and destroy
            }
        });
    }
    
    checkGameOver() {
        if (this.gameData.isGameOver) return;
        
        // Calculate current height
        const currentHeight = Math.max(0, (550 - this.player.y) / 10);
        
        // Show warning when approaching very low height (optional fall protection)
        if (currentHeight <= 1 && currentHeight > -5) {
            this.showFallWarning();
        } else if (this.fallWarning) {
            this.hideFallWarning();
        }
        
        // Game over only if player falls way below the starting area (emergency failsafe)
        // Main game over condition is now time-based
        if (currentHeight <= -10) {
            console.log(`💀 Game Over: Player fell too far below starting area (Height: ${currentHeight.toFixed(1)})`);
            this.gameOver();
        }
    }
    
    showFallWarning() {
        if (this.fallWarning) return; // Already showing
        
        this.fallWarning = this.add.text(400, 100, '⚠️ CLIMB HIGHER! ⚠️', {
            fontSize: '24px',
            fill: '#FF0000',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            stroke: '#FFFFFF',
            strokeThickness: 2
        }).setOrigin(0.5).setScrollFactor(0);
        
        // Pulsing animation
        this.tweens.add({
            targets: this.fallWarning,
            alpha: 0.3,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Power2'
        });
    }
    
    hideFallWarning() {
        if (this.fallWarning) {
            this.fallWarning.destroy();
            this.fallWarning = null;
        }
    }
    
    addScore(points) {
        this.gameData.score += points;
        
        // Send score update event
        this.sendGameEvent('scoreUpdate', {
            score: this.gameData.score,
            points: points
        });
        
        // Play score sound
        if (window.GameManagers.audio) {
            window.GameManagers.audio.playScoreSound(points);
        }
    }
    
    collectItem(collectible) {
        // Remove from physics group
        this.collectibles.remove(collectible, true, true); // Remove from group and destroy
        
        // Update items collected count
        this.gameData.itemsCollected++;
        
        // Recalculate total score (platform score + collectible bonuses)
        const platformScore = this.gameData.highestPlatformReached * this.scoring.platformReached;
        const collectibleScore = this.gameData.itemsCollected * this.scoring.itemCollected;
        this.gameData.score = platformScore + collectibleScore;
        
        // Player handles visual/audio effects
        this.player.collectItem(collectible);
        
        // Remove the collectible
        collectible.destroy();
        
        // Send score update event
        this.sendGameEvent('scoreUpdate', {
            score: this.gameData.score,
            points: this.scoring.itemCollected
        });
        
        // Play score sound
        if (window.GameManagers.audio) {
            window.GameManagers.audio.playScoreSound(this.scoring.itemCollected);
        }
        
        console.log('✨ Item collected! Total items:', this.gameData.itemsCollected, 'Score:', this.gameData.score);
    }
    
    updateUI() {
        if (window.GameManagers.ui) {
            window.GameManagers.ui.updateScore(this.gameData.score);
            window.GameManagers.ui.updateHeight(this.gameData.height);
            window.GameManagers.ui.updateTime(this.gameData.gameTime);
        }
    }
    
    gameOver() {
        if (this.gameData.isGameOver) return;
        
        this.gameData.isGameOver = true;
        
        console.log('💀 Game Over! Final score:', this.gameData.score);
        
        // Stop game timer
        if (this.gameTimer) {
            this.gameTimer.destroy();
        }
        
        // Clean up fall warning
        this.hideFallWarning();
        
        // Play game over sound
        if (window.GameManagers.audio) {
            window.GameManagers.audio.playGameOverSound();
        }
        
        // Send game end event (no time since it's always 60 seconds)
        this.sendGameEvent('gameEnd', {
            score: this.gameData.score,
            height: this.gameData.maxHeight, // Use maximum height reached, not current height
            itemsCollected: this.gameData.itemsCollected,
            victory: false
        });
        
        // Show game over screen after a delay (no time since it's always 60 seconds)
        this.time.delayedCall(2000, () => {
            this.scene.start('GameOverScene', {
                score: this.gameData.score,
                height: this.gameData.maxHeight, // Use maximum height reached, not current height
                items: this.gameData.itemsCollected
            });
        });
    }
    
    sendGameEvent(eventType, data) {
        // Create custom event for iframe communication
        const event = new CustomEvent(eventType, { detail: data });
        document.dispatchEvent(event);
    }
    
    update(time, delta) {
        if (this.gameData.isGameOver) return;
        
        // Update player
        if (this.player) {
            this.player.update(time, delta);
        }
        
        // Update platforms (for moving platforms)
        if (this.platforms) {
            this.platforms.children.entries.forEach(platform => {
                if (platform.update) {
                    platform.update(time, delta);
                }
            });
        }
        
        // Check game over conditions every frame for immediate response
        this.checkGameOver();
        
        // Check pause
        if (Phaser.Input.Keyboard.JustDown(this.pauseKey)) {
            this.scene.pause();
            // Could add pause menu here
        }
    }
}
