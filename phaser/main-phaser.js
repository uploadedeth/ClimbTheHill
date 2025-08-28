// main-phaser.js - Phaser Game Initialization with Authentication for ClimbTheHill

class ClimbTheHillGame {
    constructor() {
        // Initialize global managers object
        window.GameManagers = {};
        
        // Get loading screen elements
        this.loadingScreen = document.getElementById('loading-screen');
        this.loadingProgress = document.querySelector('.loading-progress');
        this.loadingText = document.querySelector('.loading-text');
        this.loadingPercentage = document.querySelector('.loading-percentage');
        this.loadingSteps = document.querySelectorAll('.loading-step');
        
        // Initialize iframe communication
        this.isInIframe = window.self !== window.top;
        
        // Initialize user authentication state
        this.initializeAuth();
        
        // Setup communication
        this.setupCommunication();
        
        // Initialize game
        this.init();
    }
    
    initializeAuth() {
        // User authentication state
        this.userAuth = {
            isAuthenticated: false,
            userId: null,
            username: null,
            sessionId: null,
            authTimestamp: null,
            gamePermissions: {
                canPlay: false,
                canSaveScores: false,
                canViewLeaderboard: false
            }
        };
        
        // Check for debug mode
        this.debugMode = window.location.search.includes('debug=true') || 
                        window.location.hash.includes('debug') ||
                        localStorage.getItem('cth_debug_mode') === 'true';
        
        // Security settings
        this.securityConfig = {
            allowedOrigins: [
                window.location.origin,
                'https://your-nextjs-app.com', // Replace with your actual domain
                'https://aethercade-app-cristianberbecaru-lord-team.vercel.app',
                'https://aethercade.com',
                'https://www.aethercade.com',
                'http://localhost:3000', // For development
                'https://localhost:3000' // For development with HTTPS
            ],
            sessionTimeout: 30 * 60 * 1000, // 30 minutes
            maxScoreSubmissions: 10000, // Per session
            requireAuthForPlay: this.debugMode ? false : true // In debug mode, allow anonymous play
        };
        
        // Track score submissions to prevent abuse
        this.scoreSubmissions = {
            count: 0,
            lastSubmission: null
        };
        
        // Authentication state callbacks
        this.authCallbacks = {
            onAuthenticated: [],
            onLogout: [],
            onAuthError: []
        };
        
        // Debug mode setup
        if (this.debugMode) {
            this.setupDebugMode();
        }
        
        console.log('🔐 Authentication system initialized', this.debugMode ? '(DEBUG MODE)' : '');
    }
    
    init() {
        // Show loading screen
        this.showLoadingScreen();
        
        // If authentication is required and we're in iframe, wait for auth
        if (this.securityConfig.requireAuthForPlay && this.isInIframe) {
            this.updateLoadingProgress(10, 'Waiting for authentication...');
            // Game will be created after authentication
        } else {
            // Initialize the game after a short delay for loading screen
            setTimeout(() => {
                this.createGame();
            }, 500);
        }
    }
    
    setupCommunication() {
        if (this.isInIframe) {
            // Listen for messages from parent window
            window.addEventListener('message', (event) => {
                // Enhanced security check
                if (!this.isValidOrigin(event.origin)) {
                    console.warn('🚫 Message rejected from unauthorized origin:', event.origin);
                    return;
                }
                
                const { type, data, source } = event.data;
                
                // Validate message structure
                if (!type || source !== 'nextjs-parent') {
                    console.warn('🚫 Invalid message structure received');
                    return;
                }
                
                this.handleParentMessage(type, data);
            });
            
            // Send initial ready message to parent
            this.postMessageToParent('GAME_READY', {
                gameVersion: '1.0.0',
                gameName: 'ClimbTheHill',
                timestamp: Date.now(),
                requiresAuth: this.securityConfig.requireAuthForPlay
            });
        }
    }
    
    isValidOrigin(origin) {
        return this.securityConfig.allowedOrigins.includes(origin);
    }
    
    handleParentMessage(type, data) {
        switch (type) {
            case 'SET_USER_AUTH':
                this.handleUserAuthentication(data);
                break;
            case 'LOGOUT_USER':
                this.handleUserLogout();
                break;
            case 'RESUME_GAME':
                this.resume();
                break;
            case 'RESTART_GAME':
                this.restart();
                break;
            case 'GET_GAME_STATE':
                this.sendGameState();
                break;
            case 'MUTE_AUDIO':
                if (window.GameManagers.audio) {
                    window.GameManagers.audio.mute();
                }
                break;
            case 'UNMUTE_AUDIO':
                if (window.GameManagers.audio) {
                    window.GameManagers.audio.unmute();
                }
                break;
            case 'USER_DATA_RESPONSE':
                this.handleUserDataResponse(data);
                break;
            case 'SCORE_SAVED':
                this.handleScoreSaveResponse(data);
                break;
            default:
                console.warn('🤷 Unknown message type received:', type);
        }
    }
    
    handleUserAuthentication(authData) {
        try {
            console.log('🔐 Processing authentication data...');
            
            // Validate the authentication data
            if (!this.validateAuthData(authData)) {
                throw new Error('Invalid authentication data structure');
            }
            
            // Update authentication state
            this.userAuth = {
                isAuthenticated: true,
                userId: authData.userId,
                username: authData.username || authData.email,
                sessionId: authData.sessionId,
                authTimestamp: Date.now(),
                gamePermissions: {
                    canPlay: true,
                    canSaveScores: true,
                    canViewLeaderboard: true,
                    ...authData.permissions // Allow custom permissions
                }
            };
            
            console.log(`✅ User authenticated: ${this.userAuth.username} (ID: ${this.userAuth.userId})`);
            
            // Notify parent that authentication was successful
            this.postMessageToParent('AUTH_SUCCESS', {
                userId: this.userAuth.userId,
                username: this.userAuth.username,
                timestamp: this.userAuth.authTimestamp
            });
            
            // Initialize authenticated features
            this.initializeAuthenticatedFeatures();
            
            // Trigger authentication callbacks
            this.triggerAuthCallbacks('onAuthenticated', this.userAuth);
            
            // If game hasn't been created yet, create it now
            if (!this.game && this.securityConfig.requireAuthForPlay) {
                this.updateLoadingProgress(50, 'Authentication successful! Loading game...');
                setTimeout(() => {
                    this.createGame();
                }, 500);
            }
            
        } catch (error) {
            console.error('❌ Authentication error:', error);
            this.postMessageToParent('AUTH_ERROR', { 
                error: error.message || 'Failed to process authentication',
                timestamp: Date.now()
            });
            
            this.triggerAuthCallbacks('onAuthError', error);
        }
    }
    
    validateAuthData(authData) {
        if (!authData || typeof authData !== 'object') {
            console.error('Auth data is not an object');
            return false;
        }
        
        if (!authData.userId || typeof authData.userId !== 'string') {
            console.error('Invalid or missing userId');
            return false;
        }
        
        if (!authData.username && !authData.email) {
            console.error('Missing username or email');
            return false;
        }
        
        if (!authData.sessionId || typeof authData.sessionId !== 'string') {
            console.error('Invalid or missing sessionId');
            return false;
        }
        
        return true;
    }
    
    handleUserLogout() {
        console.log('🔓 Processing user logout...');
        
        const previousAuth = { ...this.userAuth };
        
        // Clear authentication state
        this.userAuth = {
            isAuthenticated: false,
            userId: null,
            username: null,
            sessionId: null,
            authTimestamp: null,
            gamePermissions: {
                canPlay: false,
                canSaveScores: false,
                canViewLeaderboard: false
            }
        };
        
        // Reset score submission tracking
        this.scoreSubmissions = {
            count: 0,
            lastSubmission: null
        };
        
        // Clear any user-specific data
        this.clearUserData();
        
        // Notify parent
        this.postMessageToParent('USER_LOGGED_OUT', {
            previousUserId: previousAuth.userId,
            timestamp: Date.now()
        });
        
        // Trigger logout callbacks
        this.triggerAuthCallbacks('onLogout', previousAuth);
        
        // If authentication is required for play, reset game
        if (this.securityConfig.requireAuthForPlay && this.game) {
            this.showAuthRequiredMessage();
        }
        
        console.log('✅ User logout processed');
    }
    
    initializeAuthenticatedFeatures() {
        if (!this.userAuth.isAuthenticated) return;
        
        console.log('🎮 Initializing authenticated features...');
        
        // Request user's game data
        this.loadUserGameData();
        
        // Update UI for authenticated user
        this.updateUIForAuthenticatedUser();
        
        // Enable score saving
        this.enableScoreSaving();
        
        // Set up session timeout
        this.setupSessionTimeout();
        
        // Update global managers with user info
        if (window.GameManagers.ui) {
            window.GameManagers.ui.setUserInfo(this.userAuth);
        }
    }
    
    loadUserGameData() {
        if (!this.userAuth.isAuthenticated) return;
        
        console.log('📊 Requesting user game data...');
        
        this.postMessageToParent('REQUEST_USER_DATA', {
            userId: this.userAuth.userId,
            sessionId: this.userAuth.sessionId,
            dataTypes: ['settings', 'highScores', 'achievements', 'preferences'],
            timestamp: Date.now()
        });
    }
    
    handleUserDataResponse(userData) {
        if (!this.userAuth.isAuthenticated) {
            console.warn('⚠️ Received user data but user is not authenticated');
            return;
        }
        
        console.log('📊 Processing user data response...');
        
        try {
            // Store user data
            this.userData = userData;
            
            // Apply user settings
            if (userData.settings) {
                this.applyUserSettings(userData.settings);
            }
            
            // Update UI with user data
            if (window.GameManagers.ui && userData.highScores) {
                window.GameManagers.ui.setUserHighScores(userData.highScores);
            }
            
            console.log('✅ User data applied successfully');
            
        } catch (error) {
            console.error('❌ Error processing user data:', error);
        }
    }
    
    applyUserSettings(settings) {
        // Apply audio settings
        if (settings.audioEnabled !== undefined && window.GameManagers.audio) {
            if (settings.audioEnabled) {
                window.GameManagers.audio.unmute();
            } else {
                window.GameManagers.audio.mute();
            }
        }
        
        // Apply other game settings
        if (settings.difficulty) {
            this.gameSettings = { ...this.gameSettings, difficulty: settings.difficulty };
        }
    }
    
    enableScoreSaving() {
        if (!this.userAuth.gamePermissions.canSaveScores) {
            console.log('⚠️ Score saving not permitted for this user');
            return;
        }
        
        this.scoreSavingEnabled = true;
        console.log('💾 Score saving enabled');
    }
    
    setupSessionTimeout() {
        // Clear any existing timeout
        if (this.sessionTimeoutId) {
            clearTimeout(this.sessionTimeoutId);
        }
        
        // Set up new timeout
        this.sessionTimeoutId = setTimeout(() => {
            console.log('⏰ Session timeout reached');
            this.handleSessionTimeout();
        }, this.securityConfig.sessionTimeout);
    }
    
    handleSessionTimeout() {
        console.log('🔒 Session expired, logging out user...');
        
        this.postMessageToParent('SESSION_EXPIRED', {
            userId: this.userAuth.userId,
            timestamp: Date.now()
        });
        
        this.handleUserLogout();
    }
    
    // Enhanced score saving with security checks
    saveGameScore(score, gameStats, victory = false) {
        if (!this.canSaveScore()) {
            console.warn('⚠️ Score save rejected - validation failed');
            return false;
        }
        
        // Validate score data
        if (!this.validateScoreData(score, gameStats)) {
            console.error('❌ Invalid score data');
            return false;
        }
        
        // Check rate limiting
        if (!this.checkRateLimit()) {
            console.warn('⚠️ Score save rejected - rate limit exceeded');
            return false;
        }
        
        const scoreData = {
            userId: this.userAuth.userId,
            sessionId: this.userAuth.sessionId,
            score: score,
            gameStats: {
                ...gameStats,
                victory: victory,
                gameVersion: '1.0.0',
                gameName: 'ClimbTheHill',
                timestamp: Date.now()
            },
            gameMetrics: this.collectGameMetrics(),
            timestamp: Date.now()
        };
        
        // Update submission tracking
        this.scoreSubmissions.count++;
        this.scoreSubmissions.lastSubmission = Date.now();
        
        console.log('💾 Saving game score...', scoreData);
        
        this.postMessageToParent('SAVE_GAME_SCORE', scoreData);
        
        return true;
    }
    
    canSaveScore() {
        if (!this.userAuth.isAuthenticated) {
            console.log('Cannot save score: User not authenticated');
            return false;
        }
        
        if (!this.userAuth.gamePermissions.canSaveScores) {
            console.log('Cannot save score: No permission');
            return false;
        }
        
        if (!this.scoreSavingEnabled) {
            console.log('Cannot save score: Score saving disabled');
            return false;
        }
        
        return true;
    }
    
    validateScoreData(score, gameStats) {
        // Basic validation for ClimbTheHill
        if (typeof score !== 'number' || score < 0 || score > 100000) {
            console.error('Invalid score value:', score);
            return false;
        }
        
        if (!gameStats || typeof gameStats !== 'object') {
            console.error('Invalid gameStats object');
            return false;
        }
        
        // Game-specific validation
        if (gameStats.height !== undefined && (gameStats.height < 0 || gameStats.height > 10000)) {
            console.error('Invalid height:', gameStats.height);
            return false;
        }
        
        if (gameStats.timeSeconds !== undefined && (gameStats.timeSeconds < 0 || gameStats.timeSeconds > 3600)) {
            console.error('Invalid time:', gameStats.timeSeconds);
            return false;
        }
        
        return true;
    }
    
    checkRateLimit() {
        if (this.scoreSubmissions.count >= this.securityConfig.maxScoreSubmissions) {
            console.warn('Rate limit exceeded:', this.scoreSubmissions.count);
            return false;
        }
        
        // Check if last submission was too recent (prevent spam)
        if (this.scoreSubmissions.lastSubmission) {
            const timeSinceLastSubmission = Date.now() - this.scoreSubmissions.lastSubmission;
            if (timeSinceLastSubmission < 5000) { // 5 seconds minimum between submissions
                console.warn('Submission too recent, please wait');
                return false;
            }
        }
        
        return true;
    }
    
    collectGameMetrics() {
        // Collect anonymous game metrics for analytics
        return {
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            browserInfo: navigator.userAgent.substring(0, 100), // Limited for privacy
            gamePerformance: this.getGamePerformance(),
            totalPlayTime: this.getTotalPlayTime()
        };
    }
    
    getGamePerformance() {
        if (this.game && this.game.loop) {
            return {
                averageFPS: Math.round(this.game.loop.actualFps),
                targetFPS: this.game.loop.targetFps
            };
        }
        return null;
    }
    
    getTotalPlayTime() {
        if (this.gameStartTime) {
            return Date.now() - this.gameStartTime;
        }
        return 0;
    }
    
    handleScoreSaveResponse(responseData) {
        if (responseData.success) {
            console.log('✅ Score saved successfully:', responseData);
            
            // Show success message to user
            if (window.GameManagers.ui) {
                window.GameManagers.ui.showScoreSavedMessage(responseData);
            }
            
        } else {
            console.error('❌ Score save failed:', responseData.error);
            
            // Show error message to user
            if (window.GameManagers.ui) {
                window.GameManagers.ui.showScoreSaveError(responseData.error);
            }
        }
    }
    
    clearUserData() {
        this.userData = null;
        this.scoreSavingEnabled = false;
        
        if (this.sessionTimeoutId) {
            clearTimeout(this.sessionTimeoutId);
            this.sessionTimeoutId = null;
        }
        
        console.log('🗑️ User data cleared');
    }
    
    updateUIForAuthenticatedUser() {
        if (!this.userAuth.isAuthenticated) return;
        
        // Update UI elements to show user info
        if (window.GameManagers.ui) {
            window.GameManagers.ui.setUsername(this.userAuth.username);
            window.GameManagers.ui.showAuthenticatedFeatures(true);
        }
        
        // Update page title
        document.title = `ClimbTheHill - ${this.userAuth.username}`;
    }
    
    showAuthRequiredMessage() {
        // Show message that authentication is required
        if (window.GameManagers.ui) {
            window.GameManagers.ui.showAuthRequiredMessage();
        } else {
            // Fallback message
            console.log('🔐 Authentication required to continue playing');
        }
    }
    
    // Authentication callback system
    onAuthenticated(callback) {
        this.authCallbacks.onAuthenticated.push(callback);
    }
    
    onLogout(callback) {
        this.authCallbacks.onLogout.push(callback);
    }
    
    onAuthError(callback) {
        this.authCallbacks.onAuthError.push(callback);
    }
    
    triggerAuthCallbacks(event, data) {
        if (this.authCallbacks[event]) {
            this.authCallbacks[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in ${event} callback:`, error);
                }
            });
        }
    }
    
    postMessageToParent(type, data = {}) {
        if (this.isInIframe && window.parent) {
            const message = {
                type: type,
                data: data,
                source: 'climb-the-hill',
                timestamp: Date.now()
            };
            
            window.parent.postMessage(message, '*');
            console.log('📤 Message sent to parent:', type, data);
        }
    }
    
    sendGameState() {
        const baseState = {
            gameVersion: '1.0.0',
            gameName: 'ClimbTheHill',
            timestamp: Date.now(),
            userAuth: {
                isAuthenticated: this.userAuth.isAuthenticated,
                userId: this.userAuth.userId,
                username: this.userAuth.username
            }
        };
        
        if (this.game && this.game.scene.isActive('GameScene')) {
            const gameScene = this.game.scene.getScene('GameScene');
            this.postMessageToParent('GAME_STATE', {
                ...baseState,
                score: gameScene.gameData?.score || 0,
                height: gameScene.gameData?.height || 0,
                time: gameScene.gameData?.gameTime || 0,
                gameState: 'playing'
            });
        } else if (this.game && this.game.scene.isActive('GameOverScene')) {
            const gameOverScene = this.game.scene.getScene('GameOverScene');
            this.postMessageToParent('GAME_STATE', {
                ...baseState,
                score: gameOverScene.finalScore || 0,
                height: gameOverScene.finalHeight || 0,
                time: gameOverScene.gameTime || 0,
                gameState: 'game_over',
                victory: gameOverScene.victory || false
            });
        } else {
            this.postMessageToParent('GAME_STATE', {
                ...baseState,
                gameState: 'menu'
            });
        }
    }
    
    setupGameEventListeners() {
        if (this.isInIframe) {
            // Listen for custom game events and send to parent
            document.addEventListener('gameStart', (event) => {
                this.gameStartTime = Date.now();
                this.postMessageToParent('GAME_STARTED', {
                    userId: this.userAuth.userId,
                    sessionId: this.userAuth.sessionId,
                    timestamp: this.gameStartTime
                });
            });
            
            document.addEventListener('gameEnd', (event) => {
                const endData = {
                    victory: event.detail.victory,
                    score: event.detail.score,
                    height: event.detail.height,
                    timeSeconds: event.detail.timeSeconds,
                    itemsCollected: event.detail.itemsCollected,
                    userId: this.userAuth.userId,
                    sessionId: this.userAuth.sessionId,
                    playTime: this.getTotalPlayTime(),
                    timestamp: Date.now()
                };
                
                this.postMessageToParent('GAME_ENDED', endData);
                
                // Auto-save score if authenticated
                if (this.userAuth.isAuthenticated && event.detail.score !== undefined) {
                    this.saveGameScore(
                        event.detail.score,
                        {
                            height: event.detail.height,
                            timeSeconds: event.detail.timeSeconds,
                            itemsCollected: event.detail.itemsCollected,
                            victory: event.detail.victory,
                            playTime: this.getTotalPlayTime()
                        },
                        event.detail.victory
                    );
                }
            });
            
            document.addEventListener('scoreUpdate', (event) => {
                this.postMessageToParent('SCORE_UPDATE', {
                    score: event.detail.score,
                    points: event.detail.points,
                    userId: this.userAuth.userId,
                    timestamp: Date.now()
                });
            });
        }
    }
    
    createGame() {
        try {
            // Record game creation time
            this.gameStartTime = Date.now();
            
            // Check if authentication is required and user is not authenticated
            if (this.securityConfig.requireAuthForPlay && !this.userAuth.isAuthenticated && this.isInIframe) {
                console.log('⏳ Waiting for authentication before creating game...');
                this.updateLoadingProgress(25, 'Please authenticate to continue...');
                return;
            }
            
            // Check if all required scene classes are available
            console.log('Checking scene classes...');
            console.log('BootScene:', typeof BootScene);
            console.log('MenuScene:', typeof MenuScene);
            console.log('GameScene:', typeof GameScene);
            console.log('GameOverScene:', typeof GameOverScene);
            console.log('GameConfig:', typeof GameConfig);
            
            // Check if GameConfig is available
            if (typeof GameConfig === 'undefined') {
                console.error('GameConfig is not defined! Check if GameConfig.js loaded properly.');
                this.showError('GameConfig not found. Please refresh the page.');
                return;
            }
            
            // Check if scene classes are available
            const missingScenes = [];
            if (typeof BootScene === 'undefined') missingScenes.push('BootScene');
            if (typeof MenuScene === 'undefined') missingScenes.push('MenuScene');
            if (typeof GameScene === 'undefined') missingScenes.push('GameScene');
            if (typeof GameOverScene === 'undefined') missingScenes.push('GameOverScene');
            
            if (missingScenes.length > 0) {
                console.error('Missing scene classes:', missingScenes.join(', '));
                console.error('Check if these scene files loaded properly and have no syntax errors.');
                this.showError(`Missing scenes: ${missingScenes.join(', ')}. Check browser console for errors.`);
                return;
            }
            
            // Create the Phaser game instance
            this.game = new Phaser.Game(GameConfig());
            
            // Set up global game reference
            window.phaserGame = this.game;
            
            // Set up game event listeners for iframe communication
            this.setupGameEventListeners();
            
            // Set up loading progress tracking
            this.setupLoadingTracking();
            
            console.log('🎮 ClimbTheHill initialized!');
            
        } catch (error) {
            console.error('Failed to initialize game:', error);
            console.error('Error stack:', error.stack);
            this.showError('Failed to load game. Please refresh and try again.');
        }
    }
    
    setupLoadingTracking() {
        // Track loading progress with real asset loading
        this.loadingSteps = [
            { text: 'Loading assets...', progress: 0, stepIndex: 0 },
            { text: 'Creating platforms...', progress: 25, stepIndex: 1 },
            { text: 'Preparing your climber...', progress: 50, stepIndex: 2 },
            { text: 'Finishing up...', progress: 75, stepIndex: 3 },
            { text: 'ClimbTheHill ready!', progress: 100, stepIndex: 3 }
        ];
        
        this.currentLoadingStep = 0;
        this.isLoadingComplete = false;
        
        // Store reference to this instance for BootScene to access
        window.gameInstance = this;
    }
    
    updateRealLoadingProgress(percentage) {
        // Map real loading percentage to our loading steps
        const progress = Math.round(percentage * 100);
        
        // Determine which step we should be on based on progress
        let stepIndex = 0;
        let stepText = 'Loading assets...';
        
        if (progress >= 75) {
            stepIndex = 3;
            stepText = 'Finishing up...';
        } else if (progress >= 50) {
            stepIndex = 2;
            stepText = 'Preparing your climber...';
        } else if (progress >= 25) {
            stepIndex = 1;
            stepText = 'Creating platforms...';
        }
        
        // Update loading display
        this.updateLoadingProgress(progress, stepText);
        this.updateLoadingSteps(stepIndex);
        this.currentLoadingStep = stepIndex;
    }
    
    completeLoading() {
        // When assets are completely loaded, finish immediately
        this.isLoadingComplete = true;
        this.updateLoadingProgress(100, 'ClimbTheHill ready!');
        this.updateLoadingSteps(3);
        
        // Hide loading screen after a brief moment
        setTimeout(() => this.hideLoadingScreen(), 300);
    }
    
    updateLoadingSteps(activeIndex) {
        // Get DOM elements for loading steps
        const stepElements = document.querySelectorAll('.loading-step');
        if (stepElements) {
            stepElements.forEach((step, index) => {
                step.classList.remove('active', 'completed');
                if (index < activeIndex) {
                    step.classList.add('completed');
                } else if (index === activeIndex) {
                    step.classList.add('active');
                }
            });
        }
    }
    
    showLoadingScreen() {
        if (this.loadingScreen) {
            this.loadingScreen.classList.remove('hidden');
        }
        this.updateLoadingProgress(0, 'Initializing game...');
    }
    
    hideLoadingScreen() {
        if (this.loadingScreen) {
            this.loadingScreen.classList.add('hidden');
        }
        
        // Enable mobile controls if on touch device
        if (this.isTouchDevice()) {
            const mobileControls = document.getElementById('mobile-controls');
            if (mobileControls) {
                mobileControls.classList.remove('hidden');
            }
        }
    }
    
    updateLoadingProgress(percentage, text) {
        if (this.loadingProgress) {
            this.loadingProgress.style.width = `${percentage}%`;
        }
        if (this.loadingText) {
            this.loadingText.textContent = text;
        }
        if (this.loadingPercentage) {
            this.loadingPercentage.textContent = `${percentage}%`;
        }
    }
    
    showError(message) {
        if (this.loadingText) {
            this.loadingText.textContent = message;
            this.loadingText.style.color = '#ff6b6b';
        }
    }
    
    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
    
    // Game control methods
    restart() {
        if (this.securityConfig.requireAuthForPlay && !this.userAuth.isAuthenticated) {
            console.warn('⚠️ Cannot restart game: Authentication required');
            this.showAuthRequiredMessage();
            return;
        }
        
        if (this.game && this.game.scene.isActive('GameScene')) {
            this.game.scene.restart('GameScene');
        } else {
            this.game.scene.start('GameScene');
        }
        
        // Reset game start time
        this.gameStartTime = Date.now();
    }
    
    destroy() {
        // Clear authentication timeouts
        if (this.sessionTimeoutId) {
            clearTimeout(this.sessionTimeoutId);
        }
        
        // Clear user data
        this.clearUserData();
        
        if (this.game) {
            this.game.destroy(true);
            this.game = null;
        }
        
        console.log('🗑️ Game destroyed and cleaned up');
    }
    
    setupDebugMode() {
        console.log('🐛 Debug mode enabled for ClimbTheHill. Authentication requirements are relaxed.');
        
        // Create debug panel for authentication testing
        this.createDebugAuthPanel();
        
        // Set up debug keyboard shortcuts
        this.setupDebugKeyboard();
        
        // Allow the game to run without authentication
        this.securityConfig.requireAuthForPlay = false;
        
        // Mock iframe environment for testing
        this.isInIframe = true;
        
        console.log('🐛 Debug mode setup complete. Use F2 to toggle debug panel.');
    }
    
    createDebugAuthPanel() {
        // Create debug authentication panel for ClimbTheHill
        const debugPanel = document.createElement('div');
        debugPanel.id = 'debug-auth-panel';
        debugPanel.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 15px;
            border-radius: 8px;
            border: 2px solid #4A90E2;
            z-index: 2000;
            font-family: Arial, sans-serif;
            font-size: 12px;
            min-width: 250px;
            display: none;
        `;
        
        debugPanel.innerHTML = `
            <div style="margin-bottom: 10px; font-weight: bold; color: #4A90E2;">
                🐛 DEBUG AUTH PANEL - CLIMBTHEHILL
            </div>
            
            <div style="margin-bottom: 10px;">
                Status: <span id="debug-auth-status" style="font-weight: bold; color: #e74c3c;">Not Authenticated</span>
            </div>
            
            <div style="margin-bottom: 10px;">
                <input type="text" id="debug-username" placeholder="Username" value="TestClimber" 
                       style="width: 100px; padding: 4px; margin-right: 5px; background: #2c3e50; border: 1px solid #555; color: white; border-radius: 4px;">
                <input type="text" id="debug-user-id" placeholder="User ID" value="climb_test_123" 
                       style="width: 80px; padding: 4px; background: #2c3e50; border: 1px solid #555; color: white; border-radius: 4px;">
            </div>
            
            <div style="margin-bottom: 15px;">
                <button id="debug-auth-btn" style="padding: 5px 10px; margin-right: 5px; background: #2ecc71; border: none; color: white; border-radius: 4px; cursor: pointer;">
                    🔐 Authenticate
                </button>
                <button id="debug-logout-btn" style="padding: 5px 10px; margin-right: 5px; background: #e74c3c; border: none; color: white; border-radius: 4px; cursor: pointer;">
                    🔓 Logout
                </button>
                <button id="debug-save-score-btn" style="padding: 5px 10px; background: #3498db; border: none; color: white; border-radius: 4px; cursor: pointer;">
                    💾 Test Save
                </button>
            </div>
            
            <div style="font-size: 10px; color: #95a5a6; border-top: 1px solid #555; padding-top: 8px;">
                Press F2 to toggle this panel<br>
                Press F3 to test score save<br>
                Press F4 to simulate session timeout
            </div>
        `;
        
        document.body.appendChild(debugPanel);
        
        // Add event listeners
        this.setupDebugPanelEvents(debugPanel);
        
        this.debugPanel = debugPanel;
    }
    
    setupDebugPanelEvents(panel) {
        // Authenticate button
        panel.querySelector('#debug-auth-btn').addEventListener('click', () => {
            this.debugAuthenticate();
        });
        
        // Logout button
        panel.querySelector('#debug-logout-btn').addEventListener('click', () => {
            this.debugLogout();
        });
        
        // Test save score button
        panel.querySelector('#debug-save-score-btn').addEventListener('click', () => {
            this.debugTestScoreSave();
        });
    }
    
    setupDebugKeyboard() {
        document.addEventListener('keydown', (event) => {
            // Only process debug keys if debug mode is on
            if (!this.debugMode) return;
            
            switch(event.code) {
                case 'F2':
                    event.preventDefault();
                    this.toggleDebugPanel();
                    break;
                case 'F3':
                    event.preventDefault();
                    this.debugTestScoreSave();
                    break;
                case 'F4':
                    event.preventDefault();
                    this.debugSimulateSessionTimeout();
                    break;
                case 'F5':
                    event.preventDefault();
                    this.debugToggleAuth();
                    break;
            }
        });
    }
    
    toggleDebugPanel() {
        if (this.debugPanel) {
            const isVisible = this.debugPanel.style.display !== 'none';
            this.debugPanel.style.display = isVisible ? 'none' : 'block';
            console.log('🐛 Debug panel', isVisible ? 'hidden' : 'shown');
        }
    }
    
    debugAuthenticate() {
        const username = document.getElementById('debug-username').value || 'TestClimber';
        const userId = document.getElementById('debug-user-id').value || 'climb_test_123';
        
        const authData = {
            userId: userId,
            username: username,
            email: username + '@climbthehill.debug',
            sessionId: this.generateDebugSessionId()
        };
        
        console.log('🐛 Debug authentication with:', authData);
        this.handleUserAuthentication(authData);
        
        // Update debug panel status
        this.updateDebugAuthStatus(true, username);
    }
    
    debugLogout() {
        console.log('🐛 Debug logout');
        this.handleUserLogout();
        this.updateDebugAuthStatus(false);
    }
    
    debugTestScoreSave() {
        if (!this.userAuth.isAuthenticated) {
            alert('Please authenticate first before testing score save');
            return;
        }
        
        const testScore = Math.floor(Math.random() * 5000) + 100;
        const testStats = {
            height: Math.floor(Math.random() * 1000),
            timeSeconds: Math.floor(Math.random() * 300),
            itemsCollected: Math.floor(Math.random() * 20),
            victory: Math.random() > 0.7
        };
        
        console.log('🐛 Testing score save:', testScore, testStats);
        
        const success = this.saveGameScore(testScore, testStats, testStats.victory);
        
        if (success) {
            // Simulate response after delay
            setTimeout(() => {
                this.handleScoreSaveResponse({
                    success: true,
                    scoreId: 'debug_climb_score_' + Date.now(),
                    ranking: Math.floor(Math.random() * 100) + 1
                });
            }, 1000);
        }
    }
    
    debugSimulateSessionTimeout() {
        console.log('🐛 Simulating session timeout');
        this.handleSessionTimeout();
    }
    
    debugToggleAuth() {
        if (this.userAuth.isAuthenticated) {
            this.debugLogout();
        } else {
            this.debugAuthenticate();
        }
    }
    
    generateDebugSessionId() {
        return 'debug_climb_session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    updateDebugAuthStatus(authenticated, username = null) {
        const statusElement = document.getElementById('debug-auth-status');
        if (statusElement) {
            if (authenticated) {
                statusElement.textContent = `Authenticated as ${username}`;
                statusElement.style.color = '#2ecc71';
            } else {
                statusElement.textContent = 'Not Authenticated';
                statusElement.style.color = '#e74c3c';
            }
        }
    }
}

// Global game managers and utilities
window.GameManagers = {
    audio: null,
    ui: null
};

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.climbTheHillGame = new ClimbTheHillGame();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    // Page visibility handling - no pause functionality needed for infinite climbing
});

// Handle window resize
window.addEventListener('resize', () => {
    if (window.climbTheHillGame && window.climbTheHillGame.game) {
        window.climbTheHillGame.game.scale.refresh();
    }
});

// Expose global functions for debugging
window.debugGame = {
    restart: () => window.climbTheHillGame.restart(),
    getGame: () => window.climbTheHillGame.game,
    enablePhysicsDebug: () => {
        if (window.phaserGame && window.phaserGame.scene.isActive('GameScene')) {
            const scene = window.phaserGame.scene.getScene('GameScene');
            scene.physics.world.debugGraphic.setVisible(true);
        }
    }
};
