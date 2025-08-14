var GameModel = /** @class */ (function () {
    function GameModel() {
        this.canvasWidth = 800;
        this.canvasHeight = 600;
        this.reset();
    }
    GameModel.prototype.reset = function () {
        this.player = {
            x: 400,
            y: 300,
            speed: 4,
            size: 15
        };
        this.zombies = [];
        this.bullets = [];
        this.isGameOver = false;
        this.timeSurvived = 0;
        this.killCount = 0;
        this.currentScore = 0; // NEW: Reset score
        this.ammo = 30;
        this.maxAmmo = 30;
        this.isReloading = false;
        this.reloadTime = 0;
        this.reloadDuration = 1; // 1 seconds to reload
        this.nextZombieSpawn = 1; // First zombie spawns after 1 second
        this.zombieSpawnRate = 2; // Spawn every 2 seconds initially
        this.lastAmmoRestock = 0;
        // Spawn initial zombie
        this.spawnZombie();
    };
    // NEW: Calculate current score
    GameModel.prototype.updateScore = function () {
        // Same formula as leaderboard: time * 10 + kills * 50
        this.currentScore = Math.round(this.timeSurvived * 10 + this.killCount * 50);
    };
    GameModel.prototype.spawnZombie = function () {
        // Spawn at random edge of screen
        var x, y;
        var side = Math.floor(Math.random() * 4);
        switch (side) {
            case 0: // Top
                x = Math.random() * this.canvasWidth;
                y = -20;
                break;
            case 1: // Right
                x = this.canvasWidth + 20;
                y = Math.random() * this.canvasHeight;
                break;
            case 2: // Bottom
                x = Math.random() * this.canvasWidth;
                y = this.canvasHeight + 20;
                break;
            case 3: // Left
                x = -20;
                y = Math.random() * this.canvasHeight;
                break;
            default:
                x = 0;
                y = 0;
        }
        this.zombies.push({
            x: x,
            y: y,
            speed: 2.8 + Math.random() * 1.2,
            size: 18,
            health: 1
        });
    };
    GameModel.prototype.updateZombies = function () {
        for (var i = this.zombies.length - 1; i >= 0; i--) {
            var zombie = this.zombies[i];
            // Move zombie towards player
            var dx = this.player.x - zombie.x;
            var dy = this.player.y - zombie.y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0) {
                zombie.x += (dx / dist) * zombie.speed;
                zombie.y += (dy / dist) * zombie.speed;
            }
            // Remove zombies that are too far off screen
            if (zombie.x < -100 || zombie.x > this.canvasWidth + 100 ||
                zombie.y < -100 || zombie.y > this.canvasHeight + 100) {
                // Only remove if there are other zombies
                if (this.zombies.length > 1) {
                    this.zombies.splice(i, 1);
                }
            }
        }
    };
    GameModel.prototype.updateBullets = function () {
        var _this = this;
        for (var i = this.bullets.length - 1; i >= 0; i--) {
            var bullet = this.bullets[i];
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;
            // Remove bullets that are off screen
            if (bullet.x < 0 || bullet.x > this.canvasWidth ||
                bullet.y < 0 || bullet.y > this.canvasHeight) {
                this.bullets.splice(i, 1);
                continue;
            }
            // Check bullet-zombie collisions
            for (var j = this.zombies.length - 1; j >= 0; j--) {
                var zombie = this.zombies[j];
                var dx = bullet.x - zombie.x;
                var dy = bullet.y - zombie.y;
                var distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < bullet.size + zombie.size) {
                    // Hit!
                    this.bullets.splice(i, 1);
                    this.zombies.splice(j, 1);
                    this.killCount++;
                    this.updateScore(); // NEW: Update score when kill happens
                    // Spawn new zombie after a short delay
                    setTimeout(function () {
                        if (!_this.isGameOver) {
                            _this.spawnZombie();
                        }
                    }, 500);
                    break;
                }
            }
        }
    };
    GameModel.prototype.updatePlayer = function (keys) {
        var newX = this.player.x;
        var newY = this.player.y;
        // Check for WASD and arrow keys
        if (keys["w"] || keys["W"] || keys["KeyW"] || keys["ArrowUp"])
            newY -= this.player.speed;
        if (keys["s"] || keys["S"] || keys["KeyS"] || keys["ArrowDown"])
            newY += this.player.speed;
        if (keys["a"] || keys["A"] || keys["KeyA"] || keys["ArrowLeft"])
            newX -= this.player.speed;
        if (keys["d"] || keys["D"] || keys["KeyD"] || keys["ArrowRight"])
            newX += this.player.speed;
        // Keep player within bounds
        this.player.x = Math.max(this.player.size, Math.min(this.canvasWidth - this.player.size, newX));
        this.player.y = Math.max(this.player.size, Math.min(this.canvasHeight - this.player.size, newY));
    };
    GameModel.prototype.shoot = function (targetX, targetY) {
        if (this.ammo <= 0 || this.isReloading)
            return false;
        this.ammo--;
        var dx = targetX - this.player.x;
        var dy = targetY - this.player.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var speed = 8;
        this.bullets.push({
            x: this.player.x,
            y: this.player.y,
            vx: (dx / dist) * speed,
            vy: (dy / dist) * speed,
            size: 3
        });
        return true;
    };
    GameModel.prototype.reload = function () {
        if (this.isReloading || this.ammo >= this.maxAmmo)
            return false;
        this.isReloading = true;
        this.reloadTime = 0;
        return true;
    };
    GameModel.prototype.checkCollisions = function () {
        for (var _i = 0, _a = this.zombies; _i < _a.length; _i++) {
            var zombie = _a[_i];
            var dx = this.player.x - zombie.x;
            var dy = this.player.y - zombie.y;
            var distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < (this.player.size + zombie.size)) {
                return true;
            }
        }
        return false;
    };
    GameModel.prototype.update = function (deltaTime) {
        if (this.isGameOver)
            return;
        this.timeSurvived += deltaTime;
        this.updateScore(); // NEW: Update score continuously as time increases
        // Handle reloading
        if (this.isReloading) {
            this.reloadTime += deltaTime;
            if (this.reloadTime >= this.reloadDuration) {
                this.ammo = this.maxAmmo;
                this.isReloading = false;
                this.reloadTime = 0;
            }
        }
        // Spawn more zombies over time
        if (this.timeSurvived >= this.nextZombieSpawn) {
            this.spawnZombie();
            this.nextZombieSpawn += this.zombieSpawnRate;
            // Increase difficulty over time
            if (this.zombieSpawnRate > 0.8) {
                this.zombieSpawnRate -= 0.1;
            }
        }
        this.updateZombies();
        this.updateBullets();
    };
    return GameModel;
}());
