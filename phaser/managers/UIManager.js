// UIManager.js - Handles UI updates and interactions for ClimbTheHill

class UIManager {
    constructor() {
        this.isAuthenticated = false;
        this.userInfo = null;
        this.currentScore = 0;
        this.currentHeight = 0;
        this.gameTime = 0;
        
        // DOM elements
        this.scoreDisplay = document.getElementById('score-display');
        this.heightDisplay = document.getElementById('height-display');
        this.timeDisplay = document.getElementById('time-display');
        this.userStatus = document.getElementById('user-status');
        
        console.log('📱 UIManager initialized');
    }
    
    // Update score display
    updateScore(score, points = 0) {
        this.currentScore = score;
        
        if (this.scoreDisplay) {
            this.scoreDisplay.textContent = `Score: ${score}`;
            
            // Add score update animation
            this.scoreDisplay.classList.add('score-update');
            setTimeout(() => {
                this.scoreDisplay.classList.remove('score-update');
            }, 300);
        }
        
        // Show score popup if points were gained
        if (points > 0) {
            this.showScorePopup(points);
        }
        
        console.log('📊 Score updated:', score);
    }
    
    // Update height display
    updateHeight(height) {
        this.currentHeight = height;
        
        if (this.heightDisplay) {
            this.heightDisplay.textContent = `Height: ${Math.floor(height)}m`;
            
            // Check for height milestones
            if (height > 0 && height % 500 === 0) {
                this.showHeightMilestone(height);
            }
        }
        
        console.log('📏 Height updated:', Math.floor(height));
    }
    
    // Update game time
    updateTime(timeInSeconds) {
        this.gameTime = timeInSeconds;
        
        if (this.timeDisplay) {
            const minutes = Math.floor(timeInSeconds / 60);
            const seconds = Math.floor(timeInSeconds % 60);
            this.timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    // Show score popup animation
    showScorePopup(points) {
        // Create floating score popup
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.textContent = `+${points}`;
        popup.style.left = Math.random() * 200 + 300 + 'px';
        popup.style.top = Math.random() * 100 + 200 + 'px';
        
        document.body.appendChild(popup);
        
        // Remove after animation
        setTimeout(() => {
            if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
        }, 1500);
    }
    
    // Show height milestone celebration
    showHeightMilestone(height) {
        console.log(`🎯 Height milestone reached: ${height}m`);
        
        // Create milestone notification
        const notification = document.createElement('div');
        notification.className = 'milestone-notification';
        notification.innerHTML = `
            <div class="milestone-content">
                <div class="milestone-icon">🏔️</div>
                <div class="milestone-text">
                    <h3>${height}m Reached!</h3>
                    <p>Keep climbing!</p>
                </div>
            </div>
        `;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(74, 144, 226, 0.95);
            color: white;
            padding: 20px;
            border-radius: 10px;
            border: 3px solid #4A90E2;
            z-index: 1000;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            animation: notificationPop 0.5s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 2 seconds
        setTimeout(() => {
            notification.style.animation = 'notificationFade 0.5s ease-in forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 500);
        }, 2000);
        
        // Play milestone sound
        if (window.GameManagers.audio) {
            window.GameManagers.audio.playHeightMilestoneSound(height);
        }
    }
    
    // Show game over screen
    showGameOver(finalScore, finalHeight, timeSeconds) {
        console.log('🎮 Showing game over screen');
        
        const gameOverDiv = document.createElement('div');
        gameOverDiv.className = 'game-over-screen';
        gameOverDiv.innerHTML = `
            <div class="game-over-content">
                <h2>Game Over!</h2>
                <div class="final-stats">
                    <div class="stat">
                        <span class="stat-label">Final Score:</span>
                        <span class="stat-value">${finalScore}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Height Reached:</span>
                        <span class="stat-value">${Math.floor(finalHeight)}m</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Time Played:</span>
                        <span class="stat-value">${Math.floor(timeSeconds / 60)}:${(timeSeconds % 60).toFixed(0).padStart(2, '0')}</span>
                    </div>
                </div>
                <div class="game-over-buttons">
                    <button id="restart-btn" class="game-over-btn primary">Play Again</button>
                    <button id="menu-btn" class="game-over-btn secondary">Main Menu</button>
                </div>
            </div>
        `;
        
        // Style the game over screen
        gameOverDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
            animation: notificationPop 0.5s ease-out;
        `;
        
        document.body.appendChild(gameOverDiv);
        
        // Add event listeners to buttons
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.hideGameOver();
            if (window.phaserGame) {
                window.phaserGame.scene.start('GameScene');
            }
        });
        
        document.getElementById('menu-btn').addEventListener('click', () => {
            this.hideGameOver();
            if (window.phaserGame) {
                window.phaserGame.scene.start('MenuScene');
            }
        });
        
        this.gameOverScreen = gameOverDiv;
    }
    
    hideGameOver() {
        if (this.gameOverScreen && this.gameOverScreen.parentNode) {
            this.gameOverScreen.parentNode.removeChild(this.gameOverScreen);
            this.gameOverScreen = null;
        }
    }
    
    // Authentication-related methods
    setUserInfo(userInfo) {
        this.userInfo = userInfo;
        this.isAuthenticated = userInfo && userInfo.isAuthenticated;
        this.updateUserStatus();
        console.log('👤 User info updated:', userInfo);
    }
    
    setUsername(username) {
        if (this.userInfo) {
            this.userInfo.username = username;
        }
        this.updateUserStatus();
    }
    
    updateUserStatus() {
        if (!this.userStatus) return;
        
        if (this.isAuthenticated && this.userInfo) {
            this.userStatus.innerHTML = `
                <div class="user-info">
                    <span class="username">${this.userInfo.username}</span>
                    <span class="auth-indicator">✓</span>
                </div>
            `;
            this.userStatus.style.display = 'block';
        } else {
            this.userStatus.style.display = 'none';
        }
    }
    
    showAuthenticatedFeatures(show) {
        // Show/hide features that require authentication
        const authElements = document.querySelectorAll('.auth-required');
        authElements.forEach(element => {
            element.style.display = show ? 'block' : 'none';
        });
    }
    
    showAuthRequiredMessage() {
        const authMessage = document.createElement('div');
        authMessage.className = 'auth-required-message';
        authMessage.innerHTML = `
            <div class="auth-message">
                <h3>🔐 Authentication Required</h3>
                <p>Please log in to save your scores and track progress.</p>
            </div>
        `;
        
        document.body.appendChild(authMessage);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (authMessage.parentNode) {
                authMessage.parentNode.removeChild(authMessage);
            }
        }, 3000);
    }
    
    showScoreSavedMessage(responseData) {
        const message = document.createElement('div');
        message.className = 'score-saved-message success';
        message.innerHTML = `
            <div class="message-content">
                <span class="icon">✅</span>
                <span>Score saved!</span>
                ${responseData.ranking ? `<span class="ranking">#${responseData.ranking}</span>` : ''}
            </div>
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 3000);
    }
    
    showScoreSaveError(error) {
        const message = document.createElement('div');
        message.className = 'score-saved-message error';
        message.innerHTML = `
            <div class="message-content">
                <span class="icon">❌</span>
                <span>Failed to save score</span>
            </div>
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 3000);
    }
    
    // Screen shake effect for dramatic moments
    shakeScreen(duration = 500, intensity = 5) {
        const gameContainer = document.getElementById('gameContainer');
        if (gameContainer) {
            gameContainer.classList.add('screen-shake');
            setTimeout(() => {
                gameContainer.classList.remove('screen-shake');
            }, duration);
        }
    }
    
    // Reset UI state
    reset() {
        this.currentScore = 0;
        this.currentHeight = 0;
        this.gameTime = 0;
        
        this.updateScore(0);
        this.updateHeight(0);
        this.updateTime(0);
        this.hideGameOver();
        
        console.log('🔄 UI state reset');
    }
    
    // Get current UI state for saving/restoring
    getUIState() {
        return {
            score: this.currentScore,
            height: this.currentHeight,
            time: this.gameTime,
            isAuthenticated: this.isAuthenticated
        };
    }
}
