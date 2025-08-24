# ClimbTheHill

A vertical platformer game built with Phaser 3 where players climb as high as possible. The game features infinite climbing mechanics, various platform types, and is designed to be embedded in iframe environments with full authentication integration.

## 🎮 Game Features

### Core Gameplay
- **Vertical Platformer**: Infinite climbing gameplay with procedurally generated platforms
- **Platform Types**: 
  - Normal platforms (standard landing surfaces)
  - Moving platforms (horizontal movement)
  - Breakable platforms (collapse after stepping on them)
  - Bouncy platforms (provide extra jump boost)
- **Player Mechanics**:
  - Double jump system
  - Coyote time (brief grace period for jumping after leaving a platform)
  - Variable jump height (shorter jumps when releasing jump button early)
  - Jump buffering (register jump inputs slightly before landing)

### Scoring System
- **Height-based scoring**: Points earned for every meter climbed
- **Platform bonuses**: Extra points for successfully reaching platforms
- **Collectibles**: Coins and items scattered throughout the level
- **Time bonuses**: Additional scoring based on time efficiency

### Visual & Audio
- **Procedural graphics**: All game elements generated programmatically
- **Parallax backgrounds**: Multi-layer mountain scenery with depth
- **Dynamic sky**: Color changes based on climbing height
- **Audio system**: Web Audio API-based sound effects and music
- **Particle effects**: Visual feedback for jumps, landings, and interactions

## 🚀 Technical Features

### Framework & Architecture
- **Phaser 3.70.0**: Latest stable version of Phaser game framework
- **Modular design**: Separate files for scenes, entities, and managers
- **Entity-Component system**: Clean separation of game objects and behaviors

### Iframe Integration
- **PostMessage API**: Full parent-child communication
- **Authentication system**: User login/logout with session management
- **Score saving**: Secure score submission with validation
- **Debug mode**: Built-in testing tools for development

### Responsive Design
- **Mobile support**: Touch controls for mobile devices
- **Scalable UI**: Responsive interface that adapts to different screen sizes
- **Cross-platform**: Works on desktop, tablet, and mobile browsers

## 📁 Project Structure

```
ClimbTheHill/
├── index.html                 # Main game page
├── iframe-test.html           # Test page for iframe integration
├── style.css                  # Game styling and UI
├── package.json              # Node.js dependencies and scripts
├── assets/                   # Game assets (images, sounds)
│   ├── images/              # Image assets (sprites, backgrounds)
│   └── sounds/              # Audio assets
├── phaser/                  # Game source code
│   ├── main-phaser.js       # Main game initialization
│   ├── config/              # Game configuration
│   │   └── GameConfig.js    # Phaser game settings
│   ├── scenes/              # Game scenes
│   │   ├── BootScene.js     # Asset loading and texture generation
│   │   ├── MenuScene.js     # Main menu
│   │   ├── GameScene.js     # Core gameplay
│   │   └── GameOverScene.js # End game screen
│   ├── entities/            # Game objects
│   │   ├── Player.js        # Player character with climbing mechanics
│   │   └── Platform.js      # Platform entities with various types
│   └── managers/            # System managers
│       ├── AudioManager.js  # Sound and music management
│       └── UIManager.js     # User interface management
└── README.md               # This file
```

## 🛠️ Setup & Development

### Prerequisites
- Node.js (v14.0.0 or higher)
- A modern web browser
- HTTP server for local development

### Installation
1. Clone or download the project
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```

### Development
Start the development server:
```bash
npm run dev
```
This will start a local HTTP server on port 8080 and open the game in your browser.

### Testing Iframe Integration
To test the iframe integration:
```bash
npm run test:iframe
```
This opens the iframe test page where you can test parent-child communication.

### Build for Production
```bash
npm run build
```

### Deployment
The game can be deployed to any static hosting service:
- GitHub Pages
- Netlify
- Vercel
- Any web server

## 🎯 Iframe Integration Guide

### Basic Integration
```html
<iframe 
    src="https://your-domain.com/climbthehill"
    width="800"
    height="600"
    title="ClimbTheHill Game">
</iframe>
```

### PostMessage Communication
The game communicates with its parent window using the PostMessage API:

#### Messages you can send to the game:
- `RESTART_GAME`: Restart the current game
- `GET_GAME_STATE`: Request current game state
- `MUTE_AUDIO` / `UNMUTE_AUDIO`: Control audio
- `SET_USER_AUTH`: Authenticate a user
- `LOGOUT_USER`: Log out the current user

#### Messages the game sends to parent:
- `GAME_READY`: Game has loaded and is ready
- `GAME_STARTED`: Player started a new game
- `GAME_ENDED`: Game over with final statistics
- `SCORE_UPDATE`: Score changed during gameplay
- `GAME_STATE`: Current game state response

### Authentication Integration
```javascript
// Authenticate a user
const authData = {
    userId: "user123",
    username: "PlayerName",
    sessionId: "session_abc123",
    email: "player@example.com"
};

iframe.contentWindow.postMessage({
    type: 'SET_USER_AUTH',
    data: authData,
    source: 'nextjs-parent'
}, '*');

// Listen for authentication response
window.addEventListener('message', (event) => {
    if (event.data.type === 'AUTH_SUCCESS') {
        console.log('User authenticated:', event.data.data);
    }
});
```

## 🎮 Game Controls

### Keyboard Controls
- **A/D** or **Arrow Keys**: Move left/right
- **Space** or **Up Arrow**: Jump
- **ESC**: Pause game (in development)

### Mobile Controls
- Touch buttons appear automatically on mobile devices
- **Left/Right arrows**: Movement
- **Up arrow**: Jump

## 🏗️ Development Notes

### Phase 1 (Current)
- ✅ Basic game template and structure
- ✅ Core platformer mechanics
- ✅ Procedural graphics and textures
- ✅ Iframe integration with authentication
- ✅ Mobile support and responsive design

### Future Phases
- 🔄 **Graphics & Assets**: Replace procedural graphics with custom sprites
- 🔄 **Audio**: Add music tracks and enhanced sound effects
- 🔄 **Game Features**: Power-ups, special abilities, weather effects
- 🔄 **Social Features**: Leaderboards, achievements, social sharing

### Code Architecture
The game follows a modular architecture:
- **Scenes**: Handle different game states (Menu, Game, GameOver)
- **Entities**: Self-contained game objects with their own logic
- **Managers**: Handle cross-cutting concerns (Audio, UI, Authentication)
- **Config**: Central configuration for game settings

### Performance Considerations
- Efficient platform cleanup to prevent memory leaks
- Optimized particle systems
- Responsive canvas scaling
- Minimal DOM manipulation

## 🐛 Debug Mode

The game includes a built-in debug mode for development:
- Add `?debug=true` to the URL
- Press **F2** to toggle debug panel
- Test authentication, score saving, and other features

## 📝 License

MIT License - feel free to use this project as a base for your own games!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For questions or issues:
- Check the iframe-test.html page for integration examples
- Review the console logs for debugging information
- Ensure all script files are loaded in the correct order
