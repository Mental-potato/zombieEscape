var GameView = /** @class */ (function () {
    function GameView(ctx) {
        this.mouseX = null;
        this.mouseY = null;
        this.ctx = ctx;
    }
    GameView.prototype.draw = function (model) {
        // Clear canvas with dark background
        this.ctx.fillStyle = "#111";
        this.ctx.fillRect(0, 0, 800, 600);
        // Draw grid pattern for atmosphere
        this.ctx.strokeStyle = "rgba(255,255,255,0.05)";
        this.ctx.lineWidth = 1;
        for (var x = 0; x < 800; x += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, 600);
            this.ctx.stroke();
        }
        for (var y = 0; y < 600; y += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(800, y);
            this.ctx.stroke();
        }
        // Draw bullets
        this.ctx.shadowColor = "#ffff88";
        this.ctx.shadowBlur = 10;
        this.ctx.fillStyle = "#ffff88";
        for (var _i = 0, _a = model.bullets; _i < _a.length; _i++) {
            var bullet = _a[_i];
            this.ctx.beginPath();
            this.ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        // Draw player with glow effect
        this.ctx.shadowColor = "#4488ff";
        this.ctx.shadowBlur = 15;
        this.ctx.fillStyle = "#4488ff";
        this.ctx.beginPath();
        this.ctx.arc(model.player.x, model.player.y, model.player.size, 0, Math.PI * 2);
        this.ctx.fill();
        // Draw zombies with menacing glow
        this.ctx.shadowColor = "#ff4444";
        this.ctx.shadowBlur = 20;
        this.ctx.fillStyle = "#ff4444";
        for (var _b = 0, _c = model.zombies; _b < _c.length; _b++) {
            var zombie = _c[_b];
            this.ctx.beginPath();
            this.ctx.arc(zombie.x, zombie.y, zombie.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        // Reset shadow
        this.ctx.shadowBlur = 0;
        // Draw distance lines to zombies for tension
        this.ctx.strokeStyle = "rgba(255,68,68,0.15)";
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([3, 3]);
        for (var _d = 0, _e = model.zombies; _d < _e.length; _d++) {
            var zombie = _e[_d];
            this.ctx.beginPath();
            this.ctx.moveTo(model.player.x, model.player.y);
            this.ctx.lineTo(zombie.x, zombie.y);
            this.ctx.stroke();
        }
        this.ctx.setLineDash([]);
        // Draw labels
        this.ctx.fillStyle = "#fff";
        this.ctx.font = "12px Courier New";
        this.ctx.fillText("YOU", model.player.x - 15, model.player.y - 25);
        // Label zombies
        for (var i = 0; i < model.zombies.length; i++) {
            var zombie = model.zombies[i];
            this.ctx.fillText("Z" + (i + 1), zombie.x - 10, zombie.y - 30);
        }
        // Draw crosshair at mouse position if available
        if (this.mouseX !== null && this.mouseY !== null) {
            // Change crosshair color based on game state
            var crosshairColor = "#ffff88";
            if (model.isReloading) {
                crosshairColor = "#ff8844";
            }
            else if (model.ammo <= 0) {
                crosshairColor = "#ff4444";
            }
            this.ctx.strokeStyle = crosshairColor;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(this.mouseX - 10, this.mouseY);
            this.ctx.lineTo(this.mouseX + 10, this.mouseY);
            this.ctx.moveTo(this.mouseX, this.mouseY - 10);
            this.ctx.lineTo(this.mouseX, this.mouseY + 10);
            this.ctx.stroke();
            // Show "RELOADING" text near crosshair when reloading
            if (model.isReloading) {
                this.ctx.fillStyle = "#ff8844";
                this.ctx.font = "14px Courier New";
                this.ctx.fillText("RELOADING...", this.mouseX + 15, this.mouseY - 5);
            }
        }
    };
    GameView.prototype.updateMouse = function (x, y) {
        this.mouseX = x;
        this.mouseY = y;
    };
    GameView.prototype.showGameOver = function () {
        var gameOverElement = document.getElementById("gameOver");
        if (gameOverElement) {
            gameOverElement.style.display = "block";
        }
    };
    GameView.prototype.hideGameOver = function () {
        var gameOverElement = document.getElementById("gameOver");
        if (gameOverElement) {
            gameOverElement.style.display = "none";
        }
    };
    GameView.prototype.updateUI = function (model) {
        // Update timer
        var timerElement = document.getElementById("timer");
        if (timerElement) {
            timerElement.textContent = "Time survived: " + model.timeSurvived.toFixed(1) + "s";
        }
        // Update kill count
        var killCountElement = document.getElementById("killCount");
        if (killCountElement) {
            killCountElement.textContent = "Kills: " + model.killCount;
        }
        // Update current score
        var currentScoreElement = document.getElementById("currentScore");
        if (currentScoreElement) {
            currentScoreElement.textContent = "Score: " + model.currentScore;
        }
        // Update ammo display
        var ammoElement = document.getElementById("ammo");
        if (ammoElement) {
            var ammoText = model.isReloading ? "RELOADING..." : "Ammo: " + model.ammo;
            ammoElement.textContent = ammoText;
            // Change ammo color based on amount and state
            if (model.isReloading) {
                ammoElement.style.color = "#ff8844";
                ammoElement.style.textShadow = "0 0 10px rgba(255,136,68,0.5)";
            }
            else if (model.ammo <= 0) {
                ammoElement.style.color = "#ff4444";
                ammoElement.style.textShadow = "0 0 10px rgba(255,68,68,0.5)";
            }
            else if (model.ammo <= 5) {
                ammoElement.style.color = "#ff8844";
                ammoElement.style.textShadow = "0 0 10px rgba(255,136,68,0.5)";
            }
            else {
                ammoElement.style.color = "#ffff44";
                ammoElement.style.textShadow = "0 0 10px rgba(255,255,68,0.3)";
            }
        }
        // Update reload progress bar
        var reloadBar = document.getElementById("reloadBar");
        var reloadProgress = document.getElementById("reloadProgress");
        if (reloadBar && reloadProgress) {
            if (model.isReloading) {
                reloadBar.style.display = "block";
                var progressPercent = (model.reloadTime / model.reloadDuration) * 100;
                reloadProgress.style.width = progressPercent + "%";
            }
            else {
                reloadBar.style.display = "none";
            }
        }
    };
    return GameView;
}());
