const express = require("express");

const router = express.Router();

router.get("/:name", (req, res) => {
  const { name } = req.params;

  return res.json({
    name,
    xp: 0,
    level: 1
  });
});

module.exports = router;
