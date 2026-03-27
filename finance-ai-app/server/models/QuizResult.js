class QuizResult {
  constructor({ name, score, xpEarned }) {
    this.name = name;
    this.score = score;
    this.xpEarned = xpEarned;
    this.createdAt = new Date().toISOString();
  }
}

module.exports = QuizResult;
