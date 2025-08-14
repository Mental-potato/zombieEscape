class GameView {
  private ctx: CanvasRenderingContext2D;
  private mouseX: number | null = null;
  private mouseY: number | null = null;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  draw(model: GameModel): void {
    // Clear canvas with dark background
    this.ctx.fillStyle = "#111";
    this.ctx.fillRect(0, 0, 800, 600);

    // Draw grid pattern for atmosphere
    this.ctx.strokeStyle = "rgba(255,255,255,0.05)";
    this.ctx.lineWidth = 1;
    for (let x = 0; x < 800; x += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, 600);
      this.ctx.stroke();
    }
    for (let y = 0; y < 600; y += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(800, y);
      this.ctx.stroke();
    }

    // Draw bullets
    this.ctx.shadowColor = "#ffff88";
    this.ctx.shadowBlur = 10;
    this.ctx.fillStyle = "#ffff88";
    for (const bullet of model.bullets) {
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
    for (const zombie of model.zombies) {
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
    for (const zombie of model.zombies) {
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
    for (let i = 0; i < model.zombies.length; i++) {
      const zombie = model.zombies[i];
      this.ctx.fillText(`Z${i+1}`, zombie.x - 10, zombie.y - 30);
    }

    // Draw crosshair at mouse position if available
    if (this.mouseX !== null && this.mouseY !== null) {
      // Change crosshair color based on game state
      let crosshairColor = "#ffff88";
      if (model.isReloading) {
        crosshairColor = "#ff8844";
      } else if (model.ammo <= 0) {
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
  }

  updateMouse(x: number | null, y: number | null): void {
    this.mouseX = x;
    this.mouseY = y;
  }

  showGameOver(): void {
    const gameOverElement = document.getElementById("gameOver");
    if (gameOverElement) {
      gameOverElement.style.display = "block";
    }
  }

  hideGameOver(): void {
    const gameOverElement = document.getElementById("gameOver");
    if (gameOverElement) {
      gameOverElement.style.display = "none";
    }
  }

  updateUI(model: GameModel): void {
    // Update timer
    const timerElement = document.getElementById("timer");
    if (timerElement) {
      timerElement.textContent = `Time survived: ${model.timeSurvived.toFixed(1)}s`;
    }

    // Update kill count
    const killCountElement = document.getElementById("killCount");
    if (killCountElement) {
      killCountElement.textContent = `Kills: ${model.killCount}`;
    }

    // Update current score
    const currentScoreElement = document.getElementById("currentScore");
    if (currentScoreElement) {
      currentScoreElement.textContent = `Score: ${model.currentScore}`;
    }
    
    // Update ammo display
    const ammoElement = document.getElementById("ammo");
    if (ammoElement) {
      const ammoText = model.isReloading ? "RELOADING..." : `Ammo: ${model.ammo}`;
      ammoElement.textContent = ammoText;
      
      // Change ammo color based on amount and state
      if (model.isReloading) {
        ammoElement.style.color = "#ff8844";
        ammoElement.style.textShadow = "0 0 10px rgba(255,136,68,0.5)";
      } else if (model.ammo <= 0) {
        ammoElement.style.color = "#ff4444";
        ammoElement.style.textShadow = "0 0 10px rgba(255,68,68,0.5)";
      } else if (model.ammo <= 5) {
        ammoElement.style.color = "#ff8844";
        ammoElement.style.textShadow = "0 0 10px rgba(255,136,68,0.5)";
      } else {
        ammoElement.style.color = "#ffff44";
        ammoElement.style.textShadow = "0 0 10px rgba(255,255,68,0.3)";
      }
    }
    
    // Update reload progress bar
    const reloadBar = document.getElementById("reloadBar");
    const reloadProgress = document.getElementById("reloadProgress");
    
    if (reloadBar && reloadProgress) {
      if (model.isReloading) {
        reloadBar.style.display = "block";
        const progressPercent = (model.reloadTime / model.reloadDuration) * 100;
        reloadProgress.style.width = `${progressPercent}%`;
      } else {
        reloadBar.style.display = "none";
      }
    }
  }
}