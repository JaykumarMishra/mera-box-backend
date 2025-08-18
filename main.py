from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict, Any
import yt_dlp

app = FastAPI(title="MeraBox Downloader API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def extract_info(url: str) -> Dict[str, Any]:
    ydl_opts = {
        "quiet": True,
        "noplaylist": True,
        "skip_download": True,
        "nocheckcertificate": True,
        "ignoreerrors": True,
        "concurrent_fragment_downloads": 1,
        # Some sites (e.g., Instagram) need realistic headers:
        "http_headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                          "AppleWebKit/537.36 (KHTML, like Gecko) "
                          "Chrome/124.0.0.0 Safari/537.36"
        },
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)
    if not info:
        raise HTTPException(status_code=400, detail="Extraction failed.")
    # If playlist-like, pick first entry
    if info.get("_type") == "playlist" and info.get("entries"):
        info = next((e for e in info["entries"] if e), None)
        if not info:
            raise HTTPException(status_code=400, detail="No playable entries found.")
    return info

def pick_best_url(info: Dict[str, Any], prefer_ext: Optional[str] = None) -> Optional[Dict[str, Any]]:
    formats: List[Dict[str, Any]] = info.get("formats", []) or []
    # Keep only formats with direct URLs
    fmts = [f for f in formats if f.get("url")]
    if prefer_ext:
        # Prefer progressive (has both a&v) with requested ext
        prog = [f for f in fmts if f.get("vcodec") != "none" and f.get("acodec") != "none" and f.get("ext") == prefer_ext]
        if prog:
            # Highest quality first
            prog.sort(key=lambda f: (f.get("height") or 0, f.get("tbr") or 0), reverse=True)
            return prog[0]
    # Fallback: any progressive best
    prog_any = [f for f in fmts if f.get("vcodec") != "none" and f.get("acodec") != "none"]
    if prog_any:
        prog_any.sort(key=lambda f: (f.get("height") or 0, f.get("tbr") or 0), reverse=True)
        return prog_any[0]
    # Last resort: best overall
    if fmts:
        fmts.sort(key=lambda f: (f.get("height") or 0, f.get("tbr") or 0), reverse=True)
        return fmts[0]
    return None

def simplify_formats(formats: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    out = []
    for f in formats or []:
        out.append({
            "format_id": f.get("format_id"),
            "ext": f.get("ext"),
            "filesize": f.get("filesize") or f.get("filesize_approx"),
            "tbr": f.get("tbr"),
            "fps": f.get("fps"),
            "vcodec": f.get("vcodec"),
            "acodec": f.get("acodec"),
            "width": f.get("width"),
            "height": f.get("height"),
            "quality_note": f.get("format_note"),
            "url": f.get("url")  # for direct play/download
        })
    return out

@app.get("/healthz")
def health():
    return {"status": "ok"}

@app.get("/api/resolve")
def resolve(
    url: str = Query(..., description="Video page URL"),
    ext: Optional[str] = Query(None, description="Preferred file extension (e.g., mp4, webm)"),
    format_id: Optional[str] = Query(None, description="Force a specific format_id"),
):
    try:
        info = extract_info(url)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    formats = info.get("formats") or []
    chosen = None

    if format_id:
        chosen = next((f for f in formats if f.get("format_id") == format_id and f.get("url")), None)

    if not chosen:
        chosen = pick_best_url(info, prefer_ext=ext)

    if not chosen:
        raise HTTPException(status_code=404, detail="No playable/downloadable format found.")

    response = {
        "source": url,
        "id": info.get("id"),
        "title": info.get("title"),
        "uploader": info.get("uploader"),
        "duration": info.get("duration"),
        "thumbnail": info.get("thumbnail"),
        "is_live": info.get("is_live"),
        "best": {
            "format_id": chosen.get("format_id"),
            "ext": chosen.get("ext"),
            "width": chosen.get("width"),
            "height": chosen.get("height"),
            "tbr": chosen.get("tbr"),
            "url": chosen.get("url"),  # direct playable/downloadable URL
        },
        "formats": simplify_formats(formats),
    }
    return response