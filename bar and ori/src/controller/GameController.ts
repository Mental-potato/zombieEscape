class GameController {
  private model: GameModel;
  private view: GameView;
  private leaderboard: Leaderboard;
  private keys: { [key: string]: boolean } = {};
  private isRunning: boolean = false;
  private canvas: HTMLCanvasElement;

  constructor(model: GameModel, view: GameView, leaderboard: Leaderboard) {
    this.model = model;
    this.view = view;
    this.leaderboard = leaderboard;
    
    const canvasElement = document.getElementById("game") as HTMLCanvasElement;
    if (!canvasElement) {
      throw new Error("Canvas element not found");
    }
    this.canvas = canvasElement;

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Use both key and code for better compatibility
    window.addEventListener("keydown", (e: KeyboardEvent) => {
      this.keys[e.key] = true;
      this.keys[e.code] = true;
      
      // Don't prevent default for movement keys to avoid conflicts
      if (!["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
        e.preventDefault();
      }
    });
    
    window.addEventListener("keyup", (e: KeyboardEvent) => {
      this.keys[e.key] = false;
      this.keys[e.code] = false;
      
      if (!["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
        e.preventDefault();
      }
    });

    // Mouse events for shooting
    this.canvas.addEventListener("mousemove", (e: MouseEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.view.updateMouse(x, y);
    });

    this.canvas.addEventListener("click", (e: MouseEvent) => {
      if (!this.isRunning || this.model.isGameOver) return;
      
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.model.shoot(x, y);
    });

    // Change cursor to crosshair when over canvas
    this.canvas.addEventListener("mouseenter", () => {
      this.canvas.style.cursor = "crosshair";
    });

    this.canvas.addEventListener("mouseleave", () => {
      this.canvas.style.cursor = "default";
      this.view.updateMouse(null, null);
    });

    // Button event listeners
    const startBtn = document.getElementById("startBtn");
    const pauseBtn = document.getElementById("pauseBtn");
    const resetBtn = document.getElementById("resetBtn");

    if (startBtn) startBtn.addEventListener("click", () => this.start());
    if (pauseBtn) pauseBtn.addEventListener("click", () => this.pause());
    if (resetBtn) resetBtn.addEventListener("click", () => this.reset());

    // Allow spacebar to start/pause and R to reload
    window.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (!this.isRunning && !this.model.isGameOver) {
          this.start();
        } else if (this.isRunning) {
          this.pause();
        }
      } else if (e.code === "KeyR" || e.key === "r" || e.key === "R") {
        e.preventDefault();
        if (this.isRunning && !this.model.isGameOver) {
          this.model.reload();
        }
      }
    });
  }

  start(): void {
    this.isRunning = true;
    this.view.hideGameOver();
  }

  pause(): void {
    this.isRunning = false;
  }

  reset(): void {
    this.model.reset();
    this.view.hideGameOver();
    this.isRunning = false;
    this.view.updateUI(this.model);
    this.view.draw(this.model);
  }

  update(deltaTime: number): void {
    if (!this.isRunning || this.model.isGameOver) return;

    // Update player position
    this.model.updatePlayer(this.keys);

    // Update game model
    this.model.update(deltaTime);

    // Update UI
    this.view.updateUI(this.model);

    // Check collision
    if (this.model.checkCollisions()) {
      this.model.isGameOver = true;
      
      // Add score to leaderboard
      const rank = this.leaderboard.addScore(this.model.timeSurvived, this.model.killCount);
      this.leaderboard.highlightScore(rank);
      
      this.view.showGameOver();
      this.isRunning = false;
    }

    // Draw everything
    this.view.draw(this.model);
  }
}