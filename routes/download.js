import express from "express";
import ytdl from "ytdl-core";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "❌ URL is required" });
    }

    if (!ytdl.validateURL(url)) {
      return res.status(400).json({ error: "❌ Invalid YouTube URL" });
    }

    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title;

    res.json({
      success: true,
      title,
      thumbnail: info.videoDetails.thumbnails[0].url,
      url: url,
      formats: info.formats
        .filter(f => f.hasAudio && f.hasVideo)
        .map(f => ({
          quality: f.qualityLabel,
          mimeType: f.mimeType,
          size: f.contentLength,
          downloadUrl: f.url
        }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "⚠️ Something went wrong" });
  }
});

export default router;
