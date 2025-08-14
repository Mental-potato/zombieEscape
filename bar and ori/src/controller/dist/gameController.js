var GameController = /** @class */ (function () {
    function GameController(model, view, leaderboard) {
        this.keys = {};
        this.isRunning = false;
        this.model = model;
        this.view = view;
        this.leaderboard = leaderboard;
        var canvasElement = document.getElementById("game");
        if (!canvasElement) {
            throw new Error("Canvas element not found");
        }
        this.canvas = canvasElement;
        this.setupEventListeners();
    }
    GameController.prototype.setupEventListeners = function () {
        var _this = this;
        window.addEventListener("keydown", function (e) {
            _this.keys[e.key] = true;
            _this.keys[e.code] = true;
            if (!["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
                e.preventDefault();
            }
        });
        window.addEventListener("keyup", function (e) {
            _this.keys[e.key] = false;
            _this.keys[e.code] = false;
            if (!["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
                e.preventDefault();
            }
        });
        this.canvas.addEventListener("mousemove", function (e) {
            var rect = _this.canvas.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;
            _this.view.updateMouse(x, y);
        });
        this.canvas.addEventListener("click", function (e) {
            if (!_this.isRunning || _this.model.isGameOver)
                return;
            var rect = _this.canvas.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;
            _this.model.shoot(x, y);
        });
        this.canvas.addEventListener("mouseenter", function () {
            _this.canvas.style.cursor = "crosshair";
        });
        this.canvas.addEventListener("mouseleave", function () {
            _this.canvas.style.cursor = "default";
            _this.view.updateMouse(null, null);
        });
        var startBtn = document.getElementById("startBtn");
        var pauseBtn = document.getElementById("pauseBtn");
        var resetBtn = document.getElementById("resetBtn");
        if (startBtn)
            startBtn.addEventListener("click", function () { return _this.start(); });
        if (pauseBtn)
            pauseBtn.addEventListener("click", function () { return _this.pause(); });
        if (resetBtn)
            resetBtn.addEventListener("click", function () { return _this.reset(); });
        window.addEventListener("keydown", function (e) {
            if (e.code === "Space") {
                e.preventDefault();
                if (!_this.isRunning && !_this.model.isGameOver) {
                    _this.start();
                }
                else if (_this.isRunning) {
                    _this.pause();
                }
                else if (_this.model.isGameOver) {
                    _this.reset();
                    _this.start();
                }
            }
            else if (e.code === "KeyR" || e.key === "r" || e.key === "R") {
                e.preventDefault();
                if (_this.isRunning && !_this.model.isGameOver) {
                    _this.model.reload();
                }
            }
        });
    };
    GameController.prototype.start = function () {
        if (this.model.isGameOver) {
            this.reset();
        }
        this.isRunning = true;
        this.view.hideGameOver();
    };
    GameController.prototype.pause = function () {
        this.isRunning = false;
    };
    GameController.prototype.reset = function () {
        this.model.reset();
        this.view.hideGameOver();
        this.isRunning = false;
        this.view.updateUI(this.model);
        this.view.draw(this.model);
    };
    GameController.prototype.update = function (deltaTime) {
        if (!this.isRunning || this.model.isGameOver)
            return;
        this.model.updatePlayer(this.keys);
        this.model.update(deltaTime);
        this.view.updateUI(this.model);
        if (this.model.checkCollisions()) {
            this.model.isGameOver = true;
            var rank = this.leaderboard.addScore(this.model.timeSurvived, this.model.killCount);
            this.leaderboard.highlightScore(rank);
            this.view.showGameOver();
            this.isRunning = false;
        }
        this.view.draw(this.model);
    };
    return GameController;
}());
