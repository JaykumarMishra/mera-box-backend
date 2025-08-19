import express from "express";
import cors from "cors";
import ytdl from "@distube/ytdl-core";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Root test route
app.get("/", (req, res) => {
  res.send("✅ MeraBox Backend is running...");
});

// Download route
app.get("/download", async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: "❌ URL is required!" });
    }

    if (!ytdl.validateURL(url)) {
      return res.status(400).json({ error: "❌ Invalid YouTube URL!" });
    }

    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, "_");

    res.header("Content-Disposition", `attachment; filename="${title}.mp4"`);

    ytdl(url, { format: "mp4", quality: "highestvideo" }).pipe(res);

  } catch (error) {
    console.error("❌ Download Error:", error);
    res.status(500).json({ error: "❌ Failed to download video" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
