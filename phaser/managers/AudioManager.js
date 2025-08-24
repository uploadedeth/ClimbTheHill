// AudioManager.js - Handles all audio functionality for ClimbTheHill

class AudioManager {
    constructor(scene) {
        this.scene = scene;
        this.isMuted = false;
        this.masterVolume = 0.7;
        this.sfxVolume = 0.8;
        this.musicVolume = 0.5;
        
        // Audio settings
        this.settings = {
            jump: { volume: 0.6, rate: 1.0 },
            doubleJump: { volume: 0.7, rate: 1.2 },
            land: { volume: 0.4, rate: 1.0 },
            boost: { volume: 0.8, rate: 1.0 },
            collect: { volume: 0.5, rate: 1.0 },
            platformBreak: { volume: 0.6, rate: 1.0 },
            gameOver: { volume: 0.7, rate: 1.0 },
            menu: { volume: 0.5, rate: 1.0 }
        };
        
        console.log('🔊 AudioManager initialized');
    }
    
    // Create simple sound effects using Web Audio API tones
    createAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        return this.audioContext;
    }
    
    // Play a tone with specific frequency and duration
    playTone(frequency, duration = 0.2, volume = 0.5, type = 'sine') {
        if (this.isMuted) return;
        
        try {
            const audioContext = this.createAudioContext();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume * this.masterVolume, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
            
        } catch (error) {
            console.warn('Audio playback failed:', error);
        }
    }
    
    // Play a chord (multiple frequencies)
    playChord(frequencies, duration = 0.3, volume = 0.3) {
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.playTone(freq, duration, volume);
            }, index * 50);
        });
    }
    
    // Sound effect methods
    playJumpSound() {
        // Rising tone for jump
        this.playTone(220, 0.15, this.settings.jump.volume, 'square');
        setTimeout(() => {
            this.playTone(330, 0.1, this.settings.jump.volume * 0.7, 'square');
        }, 50);
    }
    
    playDoubleJumpSound() {
        // Special chord for double jump
        this.playChord([220, 330, 440], 0.2, this.settings.doubleJump.volume);
    }
    
    playLandSound() {
        // Short thump for landing
        this.playTone(110, 0.1, this.settings.land.volume, 'sawtooth');
    }
    
    playBoostSound() {
        // Ascending arpeggio for boost
        const notes = [220, 277, 330, 415, 523];
        notes.forEach((freq, index) => {
            setTimeout(() => {
                this.playTone(freq, 0.1, this.settings.boost.volume, 'sine');
            }, index * 30);
        });
    }
    
    playCollectSound() {
        // Pleasant chime for collecting items
        this.playTone(523, 0.1, this.settings.collect.volume, 'sine');
        setTimeout(() => {
            this.playTone(659, 0.1, this.settings.collect.volume, 'sine');
        }, 80);
        setTimeout(() => {
            this.playTone(784, 0.15, this.settings.collect.volume, 'sine');
        }, 140);
    }
    
    playPlatformLandSound(platformType) {
        switch (platformType) {
            case 'normal':
                this.playTone(150, 0.1, 0.3, 'sawtooth');
                break;
            case 'moving':
                this.playTone(200, 0.1, 0.3, 'sine');
                break;
            case 'breakable':
                this.playTone(180, 0.1, 0.4, 'triangle');
                break;
            case 'bouncy':
                this.playTone(300, 0.15, 0.5, 'sine');
                break;
        }
    }
    
    playPlatformBreakSound() {
        // Crashing sound for platform breaking
        this.playTone(80, 0.3, this.settings.platformBreak.volume, 'sawtooth');
        setTimeout(() => {
            this.playTone(60, 0.2, this.settings.platformBreak.volume * 0.8, 'sawtooth');
        }, 100);
    }
    
    playGameOverSound() {
        // Descending sad tone
        const notes = [440, 392, 349, 294, 262];
        notes.forEach((freq, index) => {
            setTimeout(() => {
                this.playTone(freq, 0.4, this.settings.gameOver.volume, 'triangle');
            }, index * 200);
        });
    }
    
    playMenuSound() {
        // Pleasant confirmation tone
        this.playTone(440, 0.1, this.settings.menu.volume, 'sine');
        setTimeout(() => {
            this.playTone(550, 0.15, this.settings.menu.volume, 'sine');
        }, 80);
    }
    
    playScoreSound(points) {
        // Different tones based on score amount
        if (points >= 100) {
            // High score sound
            this.playChord([440, 554, 659], 0.2, 0.6);
        } else if (points >= 50) {
            // Medium score sound
            this.playTone(440, 0.15, 0.5, 'sine');
            setTimeout(() => {
                this.playTone(554, 0.15, 0.5, 'sine');
            }, 80);
        } else {
            // Low score sound
            this.playTone(330, 0.1, 0.4, 'sine');
        }
    }
    
    playHeightMilestoneSound(height) {
        // Special fanfare for height milestones
        if (height % 1000 === 0) {
            // Major milestone
            const fanfare = [523, 659, 784, 1047];
            fanfare.forEach((freq, index) => {
                setTimeout(() => {
                    this.playTone(freq, 0.2, 0.7, 'sine');
                }, index * 100);
            });
        } else if (height % 500 === 0) {
            // Minor milestone
            this.playChord([440, 554, 659], 0.25, 0.5);
        }
    }
    
    // Volume and mute controls
    setMasterVolume(volume) {
        this.masterVolume = Phaser.Math.Clamp(volume, 0, 1);
        console.log('🔊 Master volume set to', this.masterVolume);
    }
    
    setSfxVolume(volume) {
        this.sfxVolume = Phaser.Math.Clamp(volume, 0, 1);
        console.log('🔊 SFX volume set to', this.sfxVolume);
    }
    
    setMusicVolume(volume) {
        this.musicVolume = Phaser.Math.Clamp(volume, 0, 1);
        console.log('🔊 Music volume set to', this.musicVolume);
    }
    
    mute() {
        this.isMuted = true;
        console.log('🔇 Audio muted');
    }
    
    unmute() {
        this.isMuted = false;
        console.log('🔊 Audio unmuted');
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        console.log(this.isMuted ? '🔇 Audio muted' : '🔊 Audio unmuted');
        return this.isMuted;
    }
    
    // Get current audio state
    getAudioState() {
        return {
            isMuted: this.isMuted,
            masterVolume: this.masterVolume,
            sfxVolume: this.sfxVolume,
            musicVolume: this.musicVolume
        };
    }
    
    // Set audio state (useful for restoring settings)
    setAudioState(state) {
        if (state.isMuted !== undefined) this.isMuted = state.isMuted;
        if (state.masterVolume !== undefined) this.masterVolume = state.masterVolume;
        if (state.sfxVolume !== undefined) this.sfxVolume = state.sfxVolume;
        if (state.musicVolume !== undefined) this.musicVolume = state.musicVolume;
        
        console.log('🔊 Audio state restored');
    }
}
