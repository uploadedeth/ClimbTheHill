// GameConfig.js - Core Phaser game configuration for ClimbTheHill

// Function to create GameConfig with scene references
function createGameConfig() {
    return {
        type: Phaser.AUTO,
        width: 480,  // Mobile vertical width
        height: 800, // Mobile vertical height
        parent: 'gameContainer',
        backgroundColor: '#87CEEB', // Sky blue background
        
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 800 }, // Higher gravity for better platforming feel
                debug: false
            }
        },
        
        scene: [BootScene, MenuScene, GameScene, GameOverScene],
        
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            min: {
                width: 320,
                height: 568
            },
            max: {
                width: 600,
                height: 1024
            }
        },
        
        render: {
            pixelArt: true, // Enable pixel art rendering for crisp graphics
            antialias: false
        }
    };
}

// Create the config when all scripts are loaded
const GameConfig = createGameConfig;

// Make GameConfig available globally for other scripts
window.GameConfig = GameConfig;
