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

    window.addEventListener("keydown", (e: KeyboardEvent) => {
      this.keys[e.key] = true;
      this.keys[e.code] = true;
      

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

    this.canvas.addEventListener("mouseenter", () => {
      this.canvas.style.cursor = "crosshair";
    });

    this.canvas.addEventListener("mouseleave", () => {
      this.canvas.style.cursor = "default";
      this.view.updateMouse(null, null);
    });

    const startBtn = document.getElementById("startBtn");
    const pauseBtn = document.getElementById("pauseBtn");
    const resetBtn = document.getElementById("resetBtn");

    if (startBtn) startBtn.addEventListener("click", () => this.start());
    if (pauseBtn) pauseBtn.addEventListener("click", () => this.pause());
    if (resetBtn) resetBtn.addEventListener("click", () => this.reset());

    window.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (!this.isRunning && !this.model.isGameOver) {
          this.start();
        } else if (this.isRunning) {
          this.pause();
        } else if (this.model.isGameOver) {
          
          this.reset();
          this.start();
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
    if (this.model.isGameOver) {
      this.reset();
    }
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

    this.model.updatePlayer(this.keys);

    this.model.update(deltaTime);

    this.view.updateUI(this.model);

    if (this.model.checkCollisions()) {
      this.model.isGameOver = true;
      
      const rank = this.leaderboard.addScore(this.model.timeSurvived, this.model.killCount);
      this.leaderboard.highlightScore(rank);
      
      this.view.showGameOver();
      this.isRunning = false;
    }

    this.view.draw(this.model);
  }
}