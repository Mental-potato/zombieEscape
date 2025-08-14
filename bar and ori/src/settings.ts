interface SettingsConfig {
  difficulty: 'easy' | 'normal' | 'hard' | 'nightmare';
  playerSpeed: number;
  zombieCount: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
  volume: number;
  showGrid: boolean;
  showDistanceLines: boolean;
  glowEffects: boolean;
}

interface DifficultyMultipliers {
  zombieSpeedMultiplier: number;
  zombieSpawnRateMultiplier: number;
  playerHealthMultiplier: number;
  ammoMultiplier: number;
}

class GameSettings {
  private readonly defaultSettings: SettingsConfig;
  private settings: SettingsConfig;
  private readonly storageKey: string = 'zombie-game-settings';

  constructor() {
    this.defaultSettings = {
      difficulty: 'normal',
      playerSpeed: 4,
      zombieCount: 1,
      soundEnabled: true,
      musicEnabled: true,
      volume: 70,
      showGrid: true,
      showDistanceLines: true,
      glowEffects: true
    };
    
    this.settings = { ...this.defaultSettings };
    
    this.init();
  }

  private init(): void {
    this.loadSettings();
    this.setupEventListeners();
    this.updateUI();
  }

  // Load settings from localStorage
  private loadSettings(): void {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsedSettings = JSON.parse(saved) as Partial<SettingsConfig>;
        Object.assign(this.settings, parsedSettings);
      }
    } catch (e) {
      console.warn('Could not load settings from localStorage:', e);
    }
  }

  // Save settings to localStorage
  private saveSettings(): boolean {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
      return true;
    } catch (e) {
      console.warn('Could not save settings to localStorage:', e);
      return false;
    }
  }

  // Get current settings (useful for game integration)
  public getSettings(): SettingsConfig {
    return { ...this.settings };
  }

  // Get specific setting
  public getSetting<K extends keyof SettingsConfig>(key: K): SettingsConfig[K] {
    return this.settings[key];
  }

  // Update specific setting
  public setSetting<K extends keyof SettingsConfig>(key: K, value: SettingsConfig[K]): boolean {
    if (key in this.settings) {
      this.settings[key] = value;
      this.saveSettings();
      return true;
    }
    return false;
  }

  // Update UI elements with current settings
  private updateUI(): void {
    const difficultyElement = document.getElementById('difficulty') as HTMLSelectElement;
    const playerSpeedElement = document.getElementById('playerSpeed') as HTMLInputElement;
    const zombieCountElement = document.getElementById('zombieCount') as HTMLInputElement;
    const soundEnabledElement = document.getElementById('soundEnabled') as HTMLInputElement;
    const musicEnabledElement = document.getElementById('musicEnabled') as HTMLInputElement;
    const volumeElement = document.getElementById('volume') as HTMLInputElement;
    const showGridElement = document.getElementById('showGrid') as HTMLInputElement;
    const showDistanceLinesElement = document.getElementById('showDistanceLines') as HTMLInputElement;
    const glowEffectsElement = document.getElementById('glowEffects') as HTMLInputElement;

    if (difficultyElement) {
      difficultyElement.value = this.settings.difficulty;
    }
    
    if (playerSpeedElement) {
      playerSpeedElement.value = String(this.settings.playerSpeed);
    }
    
    if (zombieCountElement) {
      zombieCountElement.value = String(this.settings.zombieCount);
    }
    
    if (soundEnabledElement) {
      soundEnabledElement.checked = this.settings.soundEnabled;
    }
    
    if (musicEnabledElement) {
      musicEnabledElement.checked = this.settings.musicEnabled;
    }
    
    if (volumeElement) {
      volumeElement.value = String(this.settings.volume);
    }
    
    if (showGridElement) {
      showGridElement.checked = this.settings.showGrid;
    }
    
    if (showDistanceLinesElement) {
      showDistanceLinesElement.checked = this.settings.showDistanceLines;
    }
    
    if (glowEffectsElement) {
      glowEffectsElement.checked = this.settings.glowEffects;
    }

    // Update display values
    this.updateDisplayValues();
  }

  // Update display values for sliders
  private updateDisplayValues(): void {
    const speedValue = document.getElementById('speedValue');
    const zombieValue = document.getElementById('zombieValue');
    const volumeValue = document.getElementById('volumeValue');

    if (speedValue) speedValue.textContent = String(this.settings.playerSpeed);
    if (zombieValue) zombieValue.textContent = String(this.settings.zombieCount);
    if (volumeValue) volumeValue.textContent = this.settings.volume + '%';
  }

  // Collect settings from UI
  private collectSettingsFromUI(): void {
    const difficultyElement = document.getElementById('difficulty') as HTMLSelectElement;
    const playerSpeedElement = document.getElementById('playerSpeed') as HTMLInputElement;
    const zombieCountElement = document.getElementById('zombieCount') as HTMLInputElement;
    const soundEnabledElement = document.getElementById('soundEnabled') as HTMLInputElement;
    const musicEnabledElement = document.getElementById('musicEnabled') as HTMLInputElement;
    const volumeElement = document.getElementById('volume') as HTMLInputElement;
    const showGridElement = document.getElementById('showGrid') as HTMLInputElement;
    const showDistanceLinesElement = document.getElementById('showDistanceLines') as HTMLInputElement;
    const glowEffectsElement = document.getElementById('glowEffects') as HTMLInputElement;

    if (difficultyElement) {
      this.settings.difficulty = difficultyElement.value as SettingsConfig['difficulty'];
    }
    
    if (playerSpeedElement) {
      this.settings.playerSpeed = parseFloat(playerSpeedElement.value);
    }
    
    if (zombieCountElement) {
      this.settings.zombieCount = parseInt(zombieCountElement.value);
    }
    
    if (soundEnabledElement) {
      this.settings.soundEnabled = soundEnabledElement.checked;
    }
    
    if (musicEnabledElement) {
      this.settings.musicEnabled = musicEnabledElement.checked;
    }
    
    if (volumeElement) {
      this.settings.volume = parseInt(volumeElement.value);
    }
    
    if (showGridElement) {
      this.settings.showGrid = showGridElement.checked;
    }
    
    if (showDistanceLinesElement) {
      this.settings.showDistanceLines = showDistanceLinesElement.checked;
    }
    
    if (glowEffectsElement) {
      this.settings.glowEffects = glowEffectsElement.checked;
    }
  }

  // Save current settings
  public save(): boolean {
    this.collectSettingsFromUI();
    const success = this.saveSettings();
    
    if (success) {
      this.showNotification('Settings saved successfully!', 'success');
    } else {
      this.showNotification('Failed to save settings. Please try again.', 'error');
    }
    
    return success;
  }

  // Reset to default settings
  public reset(): boolean {
    if (confirm('Reset all settings to default values? This action cannot be undone.')) {
      this.settings = { ...this.defaultSettings };
      localStorage.removeItem(this.storageKey);
      this.updateUI();
      this.showNotification('Settings reset to default values.', 'success');
      return true;
    }
    return false;
  }

  // Show notification to user
  private showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('settings-notification');
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'settings-notification';
      notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 5px;
        font-family: 'Courier New', monospace;
        font-weight: bold;
        z-index: 1001;
        transform: translateX(100%);
        transition: transform 0.3s ease;
      `;
      document.body.appendChild(notification);
    }

    // Set notification style based on type
    const colors = {
      success: { bg: 'rgba(0, 255, 136, 0.9)', border: '#00ff88' },
      error: { bg: 'rgba(255, 68, 68, 0.9)', border: '#ff4444' },
      info: { bg: 'rgba(255, 255, 68, 0.9)', border: '#ffff44' }
    };

    const color = colors[type] || colors.info;
    notification.style.background = color.bg;
    notification.style.border = `2px solid ${color.border}`;
    notification.style.color = '#000';
    notification.textContent = message;

    // Show notification
    notification.style.transform = 'translateX(0)';

    // Hide after 3 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
    }, 3000);
  }

  // Setup event listeners
  private setupEventListeners(): void {
    // Save button
    const saveBtn = document.getElementById('saveSettings');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.save());
    }

    // Reset button
    const resetBtn = document.getElementById('resetSettings');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.reset());
    }

    // Real-time slider updates
    const sliders = [
      { id: 'playerSpeed', display: 'speedValue', suffix: '' },
      { id: 'zombieCount', display: 'zombieValue', suffix: '' },
      { id: 'volume', display: 'volumeValue', suffix: '%' }
    ];

    sliders.forEach(slider => {
      const element = document.getElementById(slider.id) as HTMLInputElement;
      const display = document.getElementById(slider.display);
      
      if (element && display) {
        element.addEventListener('input', (e) => {
          const target = e.target as HTMLInputElement;
          display.textContent = target.value + slider.suffix;
        });
      }
    });
  }

  // Get difficulty multipliers (useful for game integration)
  public getDifficultySettings(): DifficultyMultipliers {
    const difficultyMap: Record<SettingsConfig['difficulty'], DifficultyMultipliers> = {
      easy: {
        zombieSpeedMultiplier: 0.7,
        zombieSpawnRateMultiplier: 1.5,
        playerHealthMultiplier: 1.5,
        ammoMultiplier: 1.5
      },
      normal: {
        zombieSpeedMultiplier: 1.0,
        zombieSpawnRateMultiplier: 1.0,
        playerHealthMultiplier: 1.0,
        ammoMultiplier: 1.0
      },
      hard: {
        zombieSpeedMultiplier: 1.3,
        zombieSpawnRateMultiplier: 0.7,
        playerHealthMultiplier: 0.8,
        ammoMultiplier: 0.8
      },
      nightmare: {
        zombieSpeedMultiplier: 1.6,
        zombieSpawnRateMultiplier: 0.5,
        playerHealthMultiplier: 0.5,
        ammoMultiplier: 0.6
      }
    };

    return difficultyMap[this.settings.difficulty];
  }
}


document.addEventListener('DOMContentLoaded', () => {
  (window as any).gameSettings = new GameSettings();
});