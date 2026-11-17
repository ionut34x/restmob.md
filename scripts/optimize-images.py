"""Build responsive, metadata-free WebP assets from the original RESTMOB photos.

Usage: python scripts/optimize-images.py [--source PATH]
Original photographs are read only. No image is enlarged.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


PHOTO_MAP = {
    "fotoliu-design": "56.jpg",
    "canapea-clasica": "photo18.jpg",
    "canapea-inainte": "photo17.jpg",
    "set-clasic": "photo16.jpg",
    "fotoliu-clasic": "photo19.jpg",
    "fotoliu-inainte": "20.jpg",
    "scaune-albe": "22.jpg",
    "scaune-inainte": "21.jpg",
    "scaun-alb": "24.jpg",
    "scaun-inainte": "23.jpg",
    "masa-lacuita": "40.jpg",
    "masa-inainte": "38.jpg",
    "masa-lacuita-detaliu": "41.jpg",
    "masa-rotunda": "25.jpg",
    "masa-rotunda-inainte": "26.jpg",
    "vitrina-clasica": "43.jpg",
    "vitrina-detaliu": "44.jpg",
    "vitrina-ornament": "48.jpg",
    "dormitor-alb": "36.jpg",
    "dulap-alb": "35.jpg",
    "comoda-alba": "37.jpg",
    "pat-clasic": "50.jpg",
    "tablie-pat": "49.jpg",
    "ornament-restaurat": "52.jpg",
    "ornament-inainte": "53.jpg",
    "canapea-piele": "28.jpg",
    "masa-alba": "photo9.jpg",
    "biblioteca-alba": "photo7.jpg",
    "scaun-retapitat": "photo14.jpg",
    "scaun-cadru": "photo13.jpg",
    "fotoliu-design-inainte": "55.jpg",
}


def font(filename: str, size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [Path("C:/Windows/Fonts") / filename, Path("/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf")]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size)
    return ImageFont.load_default(size=size)


def build_og_cover(source: Path, output: Path) -> dict:
    cover = Image.new("RGB", (1200, 630), "#f5f1e8")
    with Image.open(source / PHOTO_MAP["fotoliu-design"]) as original:
        picture = ImageOps.exif_transpose(original).convert("RGB")
        picture = ImageOps.fit(picture, (560, 630), Image.Resampling.LANCZOS, centering=(0.5, 0.72))
    cover.paste(picture, (640, 0))
    draw = ImageDraw.Draw(cover)
    draw.rectangle((64, 62, 104, 65), fill="#8d5136")
    draw.text((64, 88), "RESTMOB", font=font("arialbd.ttf", 46), fill="#292c25")
    draw.text((64, 216), "Restaurare", font=font("georgia.ttf", 65), fill="#292c25")
    draw.text((64, 295), "mobila", font=font("georgiai.ttf", 65), fill="#8d5136")
    draw.line((64, 420, 570, 420), fill="#cec5b8", width=1)
    draw.text((64, 453), "Chisinau, Moldova", font=font("arial.ttf", 24), fill="#53584e")
    draw.text((64, 505), "restmob.2bd.net", font=font("arial.ttf", 22), fill="#53584e")
    path = output / "og-cover.jpg"
    cover.save(path, format="JPEG", quality=87, optimize=True, progressive=True)
    return {"file": path.name, "width": 1200, "height": 630, "bytes": path.stat().st_size}


def main() -> None:
    project = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=Path(r"C:\Users\ionpo\OneDrive\Desktop\RESTMOB PROJECT\images"))
    args = parser.parse_args()
    output = project / "public" / "assets" / "images"
    output.mkdir(parents=True, exist_ok=True)
    entries = []
    for slug, filename in PHOTO_MAP.items():
        source = args.source / filename
        with Image.open(source) as original:
            photo = ImageOps.exif_transpose(original).convert("RGB")
            entry = {"slug": slug, "source": filename, "source_width": photo.width, "source_height": photo.height, "source_bytes": source.stat().st_size, "variants": []}
            for width in (480, 900, 1440):
                actual_width = min(width, photo.width)
                actual_height = max(1, round(photo.height * actual_width / photo.width))
                variant = photo.resize((actual_width, actual_height), Image.Resampling.LANCZOS)
                target = output / f"{slug}-{width}.webp"
                variant.save(target, format="WEBP", quality=80, method=6)
                entry["variants"].append({"file": target.name, "requested_width": width, "width": actual_width, "height": actual_height, "bytes": target.stat().st_size})
        entries.append(entry)
    og = build_og_cover(args.source, output)
    report = {
        "source_images_available": len(list(args.source.glob("*.jpg"))),
        "selected_images": len(entries),
        "webp_files": sum(len(entry["variants"]) for entry in entries),
        "selected_source_bytes": sum(entry["source_bytes"] for entry in entries),
        "all_webp_bytes": sum(variant["bytes"] for entry in entries for variant in entry["variants"]),
        "largest_webp_bytes": max(variant["bytes"] for entry in entries for variant in entry["variants"]),
        "entries": entries,
        "og_cover": og,
    }
    (project / "asset-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({key: value for key, value in report.items() if key not in ("entries", "og_cover")}, ensure_ascii=False))


if __name__ == "__main__":
    main()
