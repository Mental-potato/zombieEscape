var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var GameSettings = /** @class */ (function () {
    function GameSettings() {
        this.storageKey = 'zombie-game-settings';
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
        this.settings = __assign({}, this.defaultSettings);
        this.init();
    }
    GameSettings.prototype.init = function () {
        this.loadSettings();
        this.setupEventListeners();
        this.updateUI();
    };
    // Load settings from localStorage
    GameSettings.prototype.loadSettings = function () {
        try {
            var saved = localStorage.getItem(this.storageKey);
            if (saved) {
                var parsedSettings = JSON.parse(saved);
                Object.assign(this.settings, parsedSettings);
            }
        }
        catch (e) {
            console.warn('Could not load settings from localStorage:', e);
        }
    };
    // Save settings to localStorage
    GameSettings.prototype.saveSettings = function () {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
            return true;
        }
        catch (e) {
            console.warn('Could not save settings to localStorage:', e);
            return false;
        }
    };
    // Get current settings (useful for game integration)
    GameSettings.prototype.getSettings = function () {
        return __assign({}, this.settings);
    };
    // Get specific setting
    GameSettings.prototype.getSetting = function (key) {
        return this.settings[key];
    };
    // Update specific setting
    GameSettings.prototype.setSetting = function (key, value) {
        if (key in this.settings) {
            this.settings[key] = value;
            this.saveSettings();
            return true;
        }
        return false;
    };
    // Update UI elements with current settings
    GameSettings.prototype.updateUI = function () {
        var difficultyElement = document.getElementById('difficulty');
        var playerSpeedElement = document.getElementById('playerSpeed');
        var zombieCountElement = document.getElementById('zombieCount');
        var soundEnabledElement = document.getElementById('soundEnabled');
        var musicEnabledElement = document.getElementById('musicEnabled');
        var volumeElement = document.getElementById('volume');
        var showGridElement = document.getElementById('showGrid');
        var showDistanceLinesElement = document.getElementById('showDistanceLines');
        var glowEffectsElement = document.getElementById('glowEffects');
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
    };
    // Update display values for sliders
    GameSettings.prototype.updateDisplayValues = function () {
        var speedValue = document.getElementById('speedValue');
        var zombieValue = document.getElementById('zombieValue');
        var volumeValue = document.getElementById('volumeValue');
        if (speedValue)
            speedValue.textContent = String(this.settings.playerSpeed);
        if (zombieValue)
            zombieValue.textContent = String(this.settings.zombieCount);
        if (volumeValue)
            volumeValue.textContent = this.settings.volume + '%';
    };
    // Collect settings from UI
    GameSettings.prototype.collectSettingsFromUI = function () {
        var difficultyElement = document.getElementById('difficulty');
        var playerSpeedElement = document.getElementById('playerSpeed');
        var zombieCountElement = document.getElementById('zombieCount');
        var soundEnabledElement = document.getElementById('soundEnabled');
        var musicEnabledElement = document.getElementById('musicEnabled');
        var volumeElement = document.getElementById('volume');
        var showGridElement = document.getElementById('showGrid');
        var showDistanceLinesElement = document.getElementById('showDistanceLines');
        var glowEffectsElement = document.getElementById('glowEffects');
        if (difficultyElement) {
            this.settings.difficulty = difficultyElement.value;
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
    };
    // Save current settings
    GameSettings.prototype.save = function () {
        this.collectSettingsFromUI();
        var success = this.saveSettings();
        if (success) {
            this.showNotification('Settings saved successfully!', 'success');
        }
        else {
            this.showNotification('Failed to save settings. Please try again.', 'error');
        }
        return success;
    };
    // Reset to default settings
    GameSettings.prototype.reset = function () {
        if (confirm('Reset all settings to default values? This action cannot be undone.')) {
            this.settings = __assign({}, this.defaultSettings);
            localStorage.removeItem(this.storageKey);
            this.updateUI();
            this.showNotification('Settings reset to default values.', 'success');
            return true;
        }
        return false;
    };
    // Show notification to user
    GameSettings.prototype.showNotification = function (message, type) {
        if (type === void 0) { type = 'info'; }
        // Create notification element if it doesn't exist
        var notification = document.getElementById('settings-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'settings-notification';
            notification.style.cssText = "\n        position: fixed;\n        top: 100px;\n        right: 20px;\n        padding: 1rem 1.5rem;\n        border-radius: 5px;\n        font-family: 'Courier New', monospace;\n        font-weight: bold;\n        z-index: 1001;\n        transform: translateX(100%);\n        transition: transform 0.3s ease;\n      ";
            document.body.appendChild(notification);
        }
        // Set notification style based on type
        var colors = {
            success: { bg: 'rgba(0, 255, 136, 0.9)', border: '#00ff88' },
            error: { bg: 'rgba(255, 68, 68, 0.9)', border: '#ff4444' },
            info: { bg: 'rgba(255, 255, 68, 0.9)', border: '#ffff44' }
        };
        var color = colors[type] || colors.info;
        notification.style.background = color.bg;
        notification.style.border = "2px solid " + color.border;
        notification.style.color = '#000';
        notification.textContent = message;
        // Show notification
        notification.style.transform = 'translateX(0)';
        // Hide after 3 seconds
        setTimeout(function () {
            notification.style.transform = 'translateX(100%)';
        }, 3000);
    };
    // Setup event listeners
    GameSettings.prototype.setupEventListeners = function () {
        var _this = this;
        // Save button
        var saveBtn = document.getElementById('saveSettings');
        if (saveBtn) {
            saveBtn.addEventListener('click', function () { return _this.save(); });
        }
        // Reset button
        var resetBtn = document.getElementById('resetSettings');
        if (resetBtn) {
            resetBtn.addEventListener('click', function () { return _this.reset(); });
        }
        // Real-time slider updates
        var sliders = [
            { id: 'playerSpeed', display: 'speedValue', suffix: '' },
            { id: 'zombieCount', display: 'zombieValue', suffix: '' },
            { id: 'volume', display: 'volumeValue', suffix: '%' }
        ];
        sliders.forEach(function (slider) {
            var element = document.getElementById(slider.id);
            var display = document.getElementById(slider.display);
            if (element && display) {
                element.addEventListener('input', function (e) {
                    var target = e.target;
                    display.textContent = target.value + slider.suffix;
                });
            }
        });
    };
    // Get difficulty multipliers (useful for game integration)
    GameSettings.prototype.getDifficultySettings = function () {
        var difficultyMap = {
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
    };
    return GameSettings;
}());
document.addEventListener('DOMContentLoaded', function () {
    window.gameSettings = new GameSettings();
});
