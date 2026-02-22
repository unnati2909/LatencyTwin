const express = require("express");
const router = express.Router();

/**
 * PING API
 * Purpose: Measure RTT from client to server
 */
router.get("/ping", (req, res) => {
  res.json({
    message: "pong",
    timestamp: Date.now(),
  });
});

/**
 * THROUGHPUT API
 * Purpose: Send fixed-size payload to measure download speed
 */
router.get("/throughput", (req, res) => {
  // ~200KB payload
  const sizeKB = 200;
  const payload = "x".repeat(sizeKB * 1024);

  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Cache-Control", "no-store");
  res.send(payload);
});

module.exports = router;
