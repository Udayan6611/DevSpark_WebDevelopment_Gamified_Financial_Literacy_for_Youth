const express = require("express");

const router = express.Router();

router.post("/submit", (req, res) => {
  const { name, answers } = req.body;

  if (!name || !answers) {
    return res.status(400).json({ message: "name and answers are required" });
  }

  let score = 0;
  if (answers.q1 === "save") score += 1;
  if (answers.q2 === "invest") score += 1;

  return res.json({
    message: "quiz submitted",
    result: {
      name,
      score,
      xpEarned: score * 10
    }
  });
});

module.exports = router;
