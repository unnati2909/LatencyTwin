const express = require("express");
const router = express.Router();
const { getHistory } = require("../utils/historyStore");

router.get("/history", (req, res) => {
  res.json(getHistory());
});

module.exports = router;
