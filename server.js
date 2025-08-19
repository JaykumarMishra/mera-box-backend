import express from "express";
import cors from "cors";
import ytdl from "@distube/ytdl-core";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Test route
app.get("/", (req, res) => {
  res.send("✅ MeraBox Backend is Running...");
});

// ✅ YouTube Video Info Route
app.get("/video-info", async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "Video URL required" });

    const info = await ytdl.getInfo(url);

    res.json({
      title: info.videoDetails.title,
      thumbnail: info.videoDetails.thumbnails[0].url,
      length: info.videoDetails.lengthSeconds,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch video info", details: error.message });
  }
});

// ✅ YouTube Download Route
app.get("/download", async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "Video URL required" });

    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[^a-zA-Z0-9 ]/g, "");

    res.header("Content-Disposition", `attachment; filename="${title}.mp4"`);

    ytdl(url, { format: "mp4" }).pipe(res);
  } catch (error) {
    res.status(500).json({ error: "Download failed", details: error.message });
  }
});

// ✅ Server listen on PORT (from env or fallback 10000)
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
