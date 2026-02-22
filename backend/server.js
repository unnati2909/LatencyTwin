const express = require("express");
const cors = require("cors");
const historyRoutes = require("./routes/historyRoutes");

const networkRoutes = require("./routes/networkRoutes");
const analyzeRoutes = require("./routes/analyzeRoutes");

const app = express();
const PORT = process.env.PORT || 8000;

// middlewares
app.use(cors());
app.use(express.json());
app.use("/api", networkRoutes);
app.use("/api", historyRoutes);


// sanity check route
app.get("/", (req, res) => {
  res.send("LatencyTwin backend running 🚀");
});

// API routes
app.use("/api", analyzeRoutes);

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
