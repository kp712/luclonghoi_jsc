"""Join drafts/sigma/src into one page: dist/mekong-draft5-full.html."""
from pathlib import Path
SRC = Path(__file__).parent / "src"
OUT = Path(__file__).parent / "dist" / "mekong-draft5-full.html"
CSS = ["leaflet.css", "style.css", "map.css", "content.css", "lab.css", "draft5.css", "side.css", "home.css", "onboard.css", "cost.css", "dash.css"]
JS = ["data.js", "tiles.js", "districts.js", "nitrogen.js", "strings.js", "map.js", "app.js", "lab.js", "rx.js", "extra.js", "side.js", "cost.js", "srcextra.js", "scene.js", "home.js", "onboard.js", "dash.js"]
def read(name):
    p = SRC / name
    return p.read_text(encoding="utf-8") if p.exists() else f"/* missing {name} */"
body = read("index.html")
css = "\n".join(read(n) for n in CSS)
costs = SRC / "costs.json"
COSTS_JS = "const COSTS = " + (costs.read_text(encoding="utf-8") if costs.exists() else '{"figures": []}') + ";"
js = f"<script>/* costs.json */\n{COSTS_JS}\n</script>\n" + "\n".join(f"<script>/* {n} */\n{read(n).replace('</script', '<\\/script')}\n</script>" for n in JS)
head = """<!doctype html><html lang="vi"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Mekong Explorer Draft 5</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..700&family=JetBrains+Mono:wght@400;500;700&display=swap">
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
"""
OUT.parent.mkdir(exist_ok=True)
OUT.write_text(f"{head}<style>\n{css}\n</style></head>\n<body>\n{body}\n{js}\n</body></html>\n", encoding="utf-8")
print(f"wrote {OUT} ({OUT.stat().st_size/1e6:.2f} MB)")
# Artifact variant: no doctype/html/head of its own (the artifact service wraps the page).
ART = OUT.parent / "mekong-draft5.html"
art_head = head.split("<head>", 1)[1].replace('<meta charset="utf-8">\n', "")
ART.write_text(f"{art_head}<style>\n{css}\n</style>\n{body}\n{js}\n", encoding="utf-8")
print(f"wrote {ART} ({ART.stat().st_size/1e6:.2f} MB)")
