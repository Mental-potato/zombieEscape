/// <reference path="./model/GameModel.ts" />
/// <reference path="./view/GameView.ts" />
/// <reference path="./controller/GameController.ts" />
/// <reference path="./Leaderboard.ts" />
// Only run if we're on the game page (canvas exists)
var canvas = document.getElementById("game");
if (canvas) {
    var ctx = canvas.getContext("2d");
    if (!ctx) {
        throw new Error("Could not get 2D rendering context");
    }
    var leaderboard_1 = new Leaderboard();
    var model_1 = new GameModel();
    var view = new GameView(ctx);
    var controller_1 = new GameController(model_1, view, leaderboard_1);
    // Function to update top score display
    function updateTopScore() {
        var topScoreElement = document.getElementById("top-score-value");
        if (topScoreElement) {
            var topScore = leaderboard_1.getTopScore();
            topScoreElement.textContent = topScore.toString();
        }
    }
    // Function to update game over screen with final stats
    function updateGameOverStats(finalScore, timeSurvived, kills) {
        var finalScoreElement = document.getElementById("final-score");
        var finalTimeElement = document.getElementById("final-time");
        var finalKillsElement = document.getElementById("final-kills");
        if (finalScoreElement)
            finalScoreElement.textContent = finalScore.toString();
        if (finalTimeElement)
            finalTimeElement.textContent = timeSurvived.toFixed(1) + "s survived";
        if (finalKillsElement)
            finalKillsElement.textContent = kills + " kills";
    }
    // Override the controller's update method to handle game over
    var originalUpdate_1 = controller_1.update.bind(controller_1);
    controller_1.update = function (deltaTime) {
        var wasGameOver = model_1.isGameOver;
        originalUpdate_1(deltaTime);
        // Check if game just ended
        if (model_1.isGameOver && !wasGameOver) {
            updateGameOverStats(model_1.currentScore, model_1.timeSurvived, model_1.killCount);
            updateTopScore(); // Update top score after adding new score
        }
    };
    // Initial setup
    updateTopScore();
    view.draw(model_1);
    var lastTime_1 = performance.now();
    function gameLoop(time) {
        var deltaTime = (time - lastTime_1) / 1000;
        lastTime_1 = time;
        controller_1.update(deltaTime);
        requestAnimationFrame(gameLoop);
    }
    gameLoop(lastTime_1);
}
