// Main game initialization
const canvas = document.getElementById("game") as HTMLCanvasElement;
if (!canvas) {
  throw new Error("Canvas element not found");
}

const ctx = canvas.getContext("2d");
if (!ctx) {
  throw new Error("Could not get 2D rendering context");
}

const leaderboard = new Leaderboard();
const model = new GameModel();
const view = new GameView(ctx);
const controller = new GameController(model, view, leaderboard);

// Initial draw
view.draw(model);

let lastTime = performance.now();

function gameLoop(time: number): void {
  const deltaTime = (time - lastTime) / 1000;
  lastTime = time;
  controller.update(deltaTime);
  requestAnimationFrame(gameLoop);
}

gameLoop(lastTime);