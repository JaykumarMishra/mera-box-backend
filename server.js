import express from "express";
import cors from "cors";
import ytdl from "ytdl-core";

const app = express();

// CORS allow
app.use(cors());

// Health check
app.get("/", (req, res) => {
  res.send("✅ MeraBox Backend is running!");
});

// API route
app.get("/download", async (req, res) => {
  const videoURL = req.query.url;

  if (!videoURL) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    if (!ytdl.validateURL(videoURL)) {
      return res.status(400).json({ error: "Invalid YouTube URL" });
    }

    const info = await ytdl.getInfo(videoURL);
    const title = info.videoDetails.title;

    res.header("Content-Disposition", `attachment; filename="${title}.mp4"`);

    ytdl(videoURL, {
      format: "mp4",
      quality: "highest",
    }).pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process video" });
  }
});

// Render will give PORT from env
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
