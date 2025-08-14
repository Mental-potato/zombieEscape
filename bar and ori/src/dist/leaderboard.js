var Leaderboard = /** @class */ (function () {
    function Leaderboard() {
        this.storageKey = 'zombie-game-leaderboard';
        this.maxEntries = 10;
        this.scores = [];
        this.scores = this.loadScores();
        this.updateDisplay();
    }
    Leaderboard.prototype.loadScores = function () {
        try {
            var stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        }
        catch (e) {
            console.warn('Could not load leaderboard from localStorage');
            return [];
        }
    };
    Leaderboard.prototype.saveScores = function () {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.scores));
        }
        catch (e) {
            console.warn('Could not save leaderboard to localStorage');
        }
    };
    Leaderboard.prototype.addScore = function (timeSurvived, kills) {
        var score = {
            time: timeSurvived,
            kills: kills,
            score: Math.round(timeSurvived * 10 + kills * 50),
            date: new Date().toLocaleDateString()
        };
        this.scores.push(score);
        this.scores.sort(function (a, b) { return b.score - a.score; }); // Sort by score descending
        this.scores = this.scores.slice(0, this.maxEntries); // Keep only top 10
        this.saveScores();
        this.updateDisplay();
        return this.scores.findIndex(function (s) { return s === score; }) + 1; // Return rank
    };
    Leaderboard.prototype.updateDisplay = function () {
        var listElement = document.getElementById('leaderboard-list');
        if (!listElement)
            return;
        if (this.scores.length === 0) {
            listElement.innerHTML = '<div class="leaderboard-entry"><span>No scores yet...</span></div>';
            return;
        }
        listElement.innerHTML = this.scores.map(function (score, index) {
            return "\n        <div class=\"leaderboard-entry\">\n          <div>\n            <span class=\"rank\">#" + (index + 1) + "</span>\n            <span>" + score.score + "pts</span>\n          </div>\n          <div class=\"score-details\">\n            " + score.time.toFixed(1) + "s \u2022 " + score.kills + " kills<br>\n            " + score.date + "\n          </div>\n        </div>\n      ";
        }).join('');
    };
    Leaderboard.prototype.highlightScore = function (rank) {
        var entries = document.querySelectorAll('.leaderboard-entry');
        if (entries[rank - 1]) {
            entries[rank - 1].classList.add('current');
            setTimeout(function () {
                entries[rank - 1].classList.remove('current');
            }, 3000);
        }
    };
    return Leaderboard;
}());
