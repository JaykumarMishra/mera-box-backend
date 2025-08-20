import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import downloadRoute from "./routes/download.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("✅ MeraBox Backend is Running...");
});

app.use("/download", downloadRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
