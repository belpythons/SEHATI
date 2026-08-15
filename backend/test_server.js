const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;

app.get("/api/v1/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), db: "connected" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Test request
  const http = require("http");
  http.get(`http://localhost:${PORT}/api/v1/health`, (res) => {
    let data = "";
    res.on("data", chunk => data += chunk);
    res.on("end", () => {
      console.log("Health check response:", data);
      process.exit(0);
    });
  }).on("error", (e) => {
    console.error("Error:", e.message);
    process.exit(1);
  });
});