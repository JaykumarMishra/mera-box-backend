from flask import Flask, request, jsonify, send_file
import yt_dlp
import os
from uuid import uuid4

app = Flask(__name__)
DOWNLOAD_FOLDER = "downloads"
os.makedirs(DOWNLOAD_FOLDER, exist_ok=True)

@app.route("/")
def home():
    return "Mera Box Backend is Running"

@app.route("/download", methods=["POST"])
def download_video():
    data = request.get_json()
    url = data.get("url")
    format = data.get("format", "mp4")

    if not url:
        return jsonify({"error": "No URL provided"}), 400

    output_template = f"{DOWNLOAD_FOLDER}/%(title)s-{uuid4().hex}.%(ext)s"

    ydl_opts = {
        "outtmpl": output_template,
        "format": "bestvideo+bestaudio/best",
    }

    if format.lower() == "3gp":
        ydl_opts["format"] = "17"
    elif format.lower() == "mp4":
        ydl_opts["format"] = "18"
    elif format.lower() == "720":
        ydl_opts["format"] = "22"
    elif format.lower() == "full hd":
        ydl_opts["format"] = "137+140"
    elif format.lower() == "4k":
        ydl_opts["format"] = "313+140"

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            file_path = ydl.prepare_filename(info)
        return send_file(file_path, as_attachment=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)