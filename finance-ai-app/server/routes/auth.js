const express = require("express");

const router = express.Router();

router.post("/login", (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "name is required" });
  }

  return res.json({ message: "login success", user: { name } });
});

module.exports = router;
