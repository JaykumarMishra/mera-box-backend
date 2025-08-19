const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Test route
app.get("/", (req, res) => {
  res.send("🚀 MeraBox backend is running successfully on port 10000!");
});

// Example download route (you can update logic later)
app.post("/download", (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  // अभी के लिए सिर्फ dummy response
  res.json({
    success: true,
    message: "Download request received",
    url: url,
  });
});

// Port setup
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
