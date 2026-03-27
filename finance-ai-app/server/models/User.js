class User {
  constructor({ name, xp = 0, level = 1 }) {
    this.name = name;
    this.xp = xp;
    this.level = level;
  }
}

module.exports = User;
