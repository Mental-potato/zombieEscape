/// <reference path="./model/GameModel.ts" />
/// <reference path="./view/GameView.ts" />
/// <reference path="./controller/GameController.ts" />
/// <reference path="./Leaderboard.ts" />

// Only run if we're on the game page (canvas exists)
const canvas = document.getElementById("game") as HTMLCanvasElement;
if (canvas) {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get 2D rendering context");
  }

  const leaderboard = new Leaderboard();
  const model = new GameModel();
  const view = new GameView(ctx);
  const controller = new GameController(model, view, leaderboard);

  // Function to update top score display
  function updateTopScore(): void {
    const topScoreElement = document.getElementById("top-score-value");
    if (topScoreElement) {
      const topScore = leaderboard.getTopScore();
      topScoreElement.textContent = topScore.toString();
    }
  }

  // Function to update game over screen with final stats
  function updateGameOverStats(finalScore: number, timeSurvived: number, kills: number): void {
    const finalScoreElement = document.getElementById("final-score");
    const finalTimeElement = document.getElementById("final-time");
    const finalKillsElement = document.getElementById("final-kills");

    if (finalScoreElement) finalScoreElement.textContent = finalScore.toString();
    if (finalTimeElement) finalTimeElement.textContent = `${timeSurvived.toFixed(1)}s survived`;
    if (finalKillsElement) finalKillsElement.textContent = `${kills} kills`;
  }

  // Override the controller's update method to handle game over
  const originalUpdate = controller.update.bind(controller);
  controller.update = function(deltaTime: number): void {
    const wasGameOver = model.isGameOver;
    originalUpdate(deltaTime);
    
    // Check if game just ended
    if (model.isGameOver && !wasGameOver) {
      updateGameOverStats(model.currentScore, model.timeSurvived, model.killCount);
      updateTopScore(); // Update top score after adding new score
    }
  };

  // Initial setup
  updateTopScore();
  view.draw(model);

  let lastTime = performance.now();

  function gameLoop(time: number): void {
    const deltaTime = (time - lastTime) / 1000;
    lastTime = time;
    controller.update(deltaTime);
    requestAnimationFrame(gameLoop);
  }

  gameLoop(lastTime);
}