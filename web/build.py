"""Build the website (GitHub Pages serves docs/) from web/src.

    python web/build.py

Writes:
  docs/index.html      the page: web/src/index.html body + links to the files below
  docs/app/*.css|*.js  copies of the web/src files listed in CSS and JS (load order matters)
  docs/app/costs.json  published cost figures (web/src/costs.json)
  docs/app/research.json  rice varieties and live-data feeds (web/src/research/*.json)

Data: the page reads docs/data/sites.json at start-up (web/src/load.js), so run
python pipeline/build.py first when the data changes. Standard library only.
The old explorer stays at docs/classic.html (docs/app.js, style.css, i18n.js), untouched by this script.
"""
import json
import shutil
from pathlib import Path

HERE = Path(__file__).resolve().parent
SRC = HERE / "src"
ROOT = HERE.parent
DOCS = ROOT / "docs"
OUT = DOCS / "app"

CSS = ["leaflet.css", "style.css", "map.css", "content.css", "lab.css", "draft5.css", "side.css", "home.css",
       "onboard.css", "cost.css", "mentor.css", "dash.css"]
JS = ["load.js", "builder.js", "tiles.js", "districts.js", "nitrogen.js", "strings.js", "map.js", "app.js", "lab.js", "rx.js",
      "extra.js", "side.js", "cost.js", "srcextra.js", "scene.js", "home.js", "onboard.js", "learn.js", "mentor.js",
      "dash.js"]

HEAD = """<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Mekong Rotation Explorer</title>
<meta name="description" content="Crop rotation and salt planning for coastal Sóc Trăng farmers, from NASA data.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..700&family=JetBrains+Mono:wght@400;500;700&display=swap">
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
"""


def main():
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)
    for name in CSS + JS:
        shutil.copyfile(SRC / name, OUT / name)
    shutil.copyfile(SRC / "costs.json", OUT / "costs.json")
    research = {}
    for key, name in (("varieties", "varieties.json"), ("live", "live-data.json")):
        p = SRC / "research" / name
        if p.exists():
            research[key] = json.loads(p.read_text(encoding="utf-8"))
    (OUT / "research.json").write_text(json.dumps(research, ensure_ascii=False), encoding="utf-8")

    body = (SRC / "index.html").read_text(encoding="utf-8")
    links = "\n".join(f'<link rel="stylesheet" href="app/{n}">' for n in CSS)
    scripts = "\n".join(f'<script src="app/{n}"></script>' for n in JS)
    page = f"{HEAD}{links}\n</head>\n<body>\n{body}\n{scripts}\n</body>\n</html>\n"
    (DOCS / "index.html").write_text(page, encoding="utf-8")
    size = sum(f.stat().st_size for f in OUT.iterdir()) / 1e6
    print(f"wrote docs/index.html and docs/app/ ({len(CSS)} css, {len(JS)} js, {size:.1f} MB)")


if __name__ == "__main__":
    main()
