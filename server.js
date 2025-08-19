import express from "express";
import cors from "cors";
import ytdl from "ytdl-core";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
  res.send("✅ Mera Box Backend is Running...");
});

// Video Download Route
app.post("/download", async (req, res) => {
  try {
    const { url, format } = req.body;

    if (!url) {
      return res.status(400).json({ error: "❌ URL is required" });
    }

    // Validate URL
    if (!ytdl.validateURL(url)) {
      return res.status(400).json({ error: "❌ Invalid YouTube URL" });
    }

    // Get video info
    const info = await ytdl.getInfo(url);

    // Choose format (mp4 or mp3)
    let downloadFormat;
    if (format === "mp3") {
      downloadFormat = { filter: "audioonly" };
      res.header("Content-Disposition", `attachment; filename="${info.videoDetails.title}.mp3"`);
    } else {
      downloadFormat = { filter: "audioandvideo", quality: "highest" };
      res.header("Content-Disposition", `attachment; filename="${info.videoDetails.title}.mp4"`);
    }

    // Stream the video/audio
    ytdl(url, downloadFormat).pipe(res);

  } catch (err) {
    console.error("❌ Error in /download:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Port setup
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
