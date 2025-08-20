import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import ytdl from "ytdl-core";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Mera Box Backend is running...");
});

// YouTube Download Route
app.get("/download", async (req, res) => {
  try {
    const videoURL = req.query.url;

    if (!ytdl.validateURL(videoURL)) {
      return res.status(400).json({ error: "Invalid YouTube URL" });
    }

    const info = await ytdl.getInfo(videoURL);
    const title = info.videoDetails.title.replace(/[^\w\s]/gi, "");

    res.header("Content-Disposition", `attachment; filename="${title}.mp4"`);

    ytdl(videoURL, {
      format: "mp4",
      quality: "highestvideo"
    }).pipe(res);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Download failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

