"""MODIS NDVI via NASA AppEEARS (free Earthdata login). Two steps:
1) python ndvi_from_appeears.py              -> writes data/appeears_points.csv to upload to AppEEARS
2) python ndvi_from_appeears.py results.csv  -> converts the AppEEARS download to data/raw/ndvi_<id>.json
Full click path is in the README.
"""
import csv
import json
import pathlib
import sys

from sites import SITES

DATA = pathlib.Path(__file__).resolve().parent.parent / "data"


def write_points():
    path = DATA / "appeears_points.csv"
    with open(path, "w", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        w.writerow(["ID", "Category", "Latitude", "Longitude"])
        w.writerows([s["id"], "pin", s["lat"], s["lon"]] for s in SITES)
    print("upload this file to AppEEARS:", path)


def parse_raw(lines):
    """AppEEARS point CSV rows -> {ID as in the CSV: {"YYYY-MM-DD": ndvi}}"""
    rows = csv.DictReader(lines)
    col = next(c for c in rows.fieldnames if c.endswith("_250m_16_days_NDVI"))
    out = {}
    for r in rows:
        v = float(r[col])
        if abs(v) > 1.5:  # raw integer, not yet scaled
            v *= 0.0001
        if v < -0.2:  # -3000 (raw) / -0.3 (scaled) = no data
            continue
        out.setdefault(r["ID"], {})[r["Date"]] = round(v, 4)
    return out


def parse(lines):
    """AppEEARS point CSV rows -> {site_id: {"YYYY-MM-DD": ndvi}}"""
    # AppEEARS can drop underscores from IDs (long_phu -> longphu), so match without them
    known = {s["id"].replace("_", ""): s["id"] for s in SITES}
    out, unknown = {}, set()
    for rid, series in parse_raw(lines).items():
        sid = known.get(rid.replace("_", "").lower())
        if sid is None:
            unknown.add(rid)
        else:
            out.setdefault(sid, {}).update(series)
    if unknown:
        print("WARNING: skipped unknown IDs:", ", ".join(sorted(unknown)))
    return out


def convert(csv_path):
    with open(csv_path, encoding="utf-8", newline="") as f:
        series = parse(f)
    for sid, s in series.items():
        (DATA / "raw" / f"ndvi_{sid}.json").write_text(json.dumps(s), encoding="utf-8")
        print(sid, len(s), "NDVI values")
    missing = {s["id"] for s in SITES} - series.keys()
    if missing:
        print("WARNING: no NDVI for", ", ".join(sorted(missing)))


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
    convert(sys.argv[1]) if len(sys.argv) > 1 else write_points()
