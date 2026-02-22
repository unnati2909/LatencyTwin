const express = require("express");
const router = express.Router();
const { analyzeSite } = require("../services/siteAnalyzer");
const { saveSnapshot } = require("../utils/historyStore");


router.post("/analyze", async (req, res) => {
  const { url, networkProfile } = req.body;


  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const result = await analyzeSite(url, networkProfile);
    saveSnapshot(result);
    res.json(result);
    
  } catch (error) {
    res.status(500).json({
      error: "Failed to analyze website",
      details: error.message,
    });
  }
});

module.exports = router;
