import express from "express";
import cors from "cors";
import ytdl from "@distube/ytdl-core";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.send("✅ Mera Box Backend is running successfully!");
});

// Download route
app.get("/download", async (req, res) => {
  try {
    const { url, format } = req.query;

    if (!url) {
      return res.status(400).json({ error: "❌ Please provide a video URL" });
    }

    // Validate YouTube URL
    if (!ytdl.validateURL(url)) {
      return res.status(400).json({ error: "❌ Invalid YouTube URL" });
    }

    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, "_");

    // Format select
    let filter = "audioandvideo";
    let contentType = "video/mp4";
    let fileExt = "mp4";

    if (format === "mp3") {
      filter = "audioonly";
      contentType = "audio/mpeg";
      fileExt = "mp3";
    }

    res.header("Content-Disposition", `attachment; filename="${title}.${fileExt}"`);
    res.header("Content-Type", contentType);

    ytdl(url, { filter }).pipe(res);

  } catch (err) {
    console.error("❌ Download Error:", err.message);
    res.status(500).json({ error: "❌ Failed to process download" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
