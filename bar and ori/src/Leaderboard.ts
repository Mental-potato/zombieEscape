interface ScoreEntry {
  time: number;
  kills: number;
  score: number;
  date: string;
}

class Leaderboard {
  private storageKey: string = 'zombie-game-leaderboard';
  private maxEntries: number = 10;
  private scores: ScoreEntry[] = [];

  constructor() {
    this.scores = this.loadScores();
    this.updateDisplay();
  }

  private loadScores(): ScoreEntry[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.warn('Could not load leaderboard from localStorage');
      return [];
    }
  }

  private saveScores(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.scores));
    } catch (e) {
      console.warn('Could not save leaderboard to localStorage');
    }
  }

  addScore(timeSurvived: number, kills: number): number {
    const score: ScoreEntry = {
      time: timeSurvived,
      kills: kills,
      score: Math.round(timeSurvived * 10 + kills * 50), // Calculate total score
      date: new Date().toLocaleDateString()
    };

    this.scores.push(score);
    this.scores.sort((a, b) => b.score - a.score); // Sort by score descending
    this.scores = this.scores.slice(0, this.maxEntries); // Keep only top 10
    
    this.saveScores();
    this.updateDisplay();
    
    return this.scores.findIndex(s => s === score) + 1; // Return rank
  }

  updateDisplay(): void {
    const listElement = document.getElementById('leaderboard-list');
    if (!listElement) return;
    
    if (this.scores.length === 0) {
      listElement.innerHTML = '<div class="leaderboard-entry"><span>No scores yet...</span></div>';
      return;
    }

    listElement.innerHTML = this.scores.map((score, index) => {
      return `
        <div class="leaderboard-entry">
          <div>
            <span class="rank">#${index + 1}</span>
            <span>${score.score}pts</span>
          </div>
          <div class="score-details">
            ${score.time.toFixed(1)}s • ${score.kills} kills<br>
            ${score.date}
          </div>
        </div>
      `;
    }).join('');
  }

  highlightScore(rank: number): void {
    const entries = document.querySelectorAll('.leaderboard-entry');
    if (entries[rank - 1]) {
      entries[rank - 1].classList.add('current');
      setTimeout(() => {
        entries[rank - 1].classList.remove('current');
      }, 3000);
    }
  }
}