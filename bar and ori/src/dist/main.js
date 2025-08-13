// Main game initialization
var canvas = document.getElementById("game");
if (!canvas) {
    throw new Error("Canvas element not found");
}
var ctx = canvas.getContext("2d");
if (!ctx) {
    throw new Error("Could not get 2D rendering context");
}
var leaderboard = new Leaderboard();
var model = new GameModel();
var view = new GameView(ctx);
var controller = new GameController(model, view, leaderboard);
// Initial draw
view.draw(model);
var lastTime = performance.now();
function gameLoop(time) {
    var deltaTime = (time - lastTime) / 1000;
    lastTime = time;
    controller.update(deltaTime);
    requestAnimationFrame(gameLoop);
}
gameLoop(lastTime);
