interface Player {
  x: number;
  y: number;
  speed: number;
  size: number;
}

interface Zombie {
  x: number;
  y: number;
  speed: number;
  size: number;
  health: number;
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

class GameModel {
  public player: Player;
  public zombies: Zombie[];
  public bullets: Bullet[];
  public isGameOver: boolean;
  public timeSurvived: number;
  public killCount: number;
  public currentScore: number; // NEW: Live score
  public ammo: number;
  public maxAmmo: number;
  public isReloading: boolean;
  public reloadTime: number;
  public reloadDuration: number;
  public canvasWidth: number;
  public canvasHeight: number;
  public nextZombieSpawn: number;
  public zombieSpawnRate: number;
  public lastAmmoRestock: number;

  constructor() {
    this.canvasWidth = 800;
    this.canvasHeight = 600;
    this.reset();
  }

  reset(): void {
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
  }

  // NEW: Calculate current score
  private updateScore(): void {
    // Same formula as leaderboard: time * 10 + kills * 50
    this.currentScore = Math.round(this.timeSurvived * 10 + this.killCount * 50);
  }

  spawnZombie(): void {
    // Spawn at random edge of screen
    let x: number, y: number;
    const side = Math.floor(Math.random() * 4);
    
    switch(side) {
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
      speed: 2.8 + Math.random() * 1.2, // Variable speed 2.8-4.0
      size: 18,
      health: 1
    });
  }

  updateZombies(): void {
    for (let i = this.zombies.length - 1; i >= 0; i--) {
      const zombie = this.zombies[i];
      
      // Move zombie towards player
      const dx = this.player.x - zombie.x;
      const dy = this.player.y - zombie.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
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
  }

  updateBullets(): void {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      
      bullet.x += bullet.vx;
      bullet.y += bullet.vy;
      
      // Remove bullets that are off screen
      if (bullet.x < 0 || bullet.x > this.canvasWidth || 
          bullet.y < 0 || bullet.y > this.canvasHeight) {
        this.bullets.splice(i, 1);
        continue;
      }
      
      // Check bullet-zombie collisions
      for (let j = this.zombies.length - 1; j >= 0; j--) {
        const zombie = this.zombies[j];
        const dx = bullet.x - zombie.x;
        const dy = bullet.y - zombie.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < bullet.size + zombie.size) {
          // Hit!
          this.bullets.splice(i, 1);
          this.zombies.splice(j, 1);
          this.killCount++;
          this.updateScore(); // NEW: Update score when kill happens
          
          // Spawn new zombie after a short delay
          setTimeout(() => {
            if (!this.isGameOver) {
              this.spawnZombie();
            }
          }, 500);
          
          break;
        }
      }
    }
  }

  updatePlayer(keys: { [key: string]: boolean }): void {
    let newX = this.player.x;
    let newY = this.player.y;

    // Check for WASD and arrow keys
    if (keys["w"] || keys["W"] || keys["KeyW"] || keys["ArrowUp"]) newY -= this.player.speed;
    if (keys["s"] || keys["S"] || keys["KeyS"] || keys["ArrowDown"]) newY += this.player.speed;
    if (keys["a"] || keys["A"] || keys["KeyA"] || keys["ArrowLeft"]) newX -= this.player.speed;
    if (keys["d"] || keys["D"] || keys["KeyD"] || keys["ArrowRight"]) newX += this.player.speed;

    // Keep player within bounds
    this.player.x = Math.max(this.player.size, Math.min(this.canvasWidth - this.player.size, newX));
    this.player.y = Math.max(this.player.size, Math.min(this.canvasHeight - this.player.size, newY));
  }

  shoot(targetX: number, targetY: number): boolean {
    if (this.ammo <= 0 || this.isReloading) return false;
    
    this.ammo--;
    
    const dx = targetX - this.player.x;
    const dy = targetY - this.player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const speed = 8;
    
    this.bullets.push({
      x: this.player.x,
      y: this.player.y,
      vx: (dx / dist) * speed,
      vy: (dy / dist) * speed,
      size: 3
    });
    
    return true;
  }

  reload(): boolean {
    if (this.isReloading || this.ammo >= this.maxAmmo) return false;
    
    this.isReloading = true;
    this.reloadTime = 0;
    return true;
  }

  checkCollisions(): boolean {
    for (const zombie of this.zombies) {
      const dx = this.player.x - zombie.x;
      const dy = this.player.y - zombie.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < (this.player.size + zombie.size)) {
        return true;
      }
    }
    return false;
  }

  update(deltaTime: number): void {
    if (this.isGameOver) return;
    
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
  }
}