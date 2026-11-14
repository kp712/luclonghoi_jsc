/* load.js: the site's data comes only from docs/data/sites.json (built by pipeline/build.py).
   It is read once, before the other scripts run, and reshaped into the two forms the app code uses:
   DATA (map, cards, plan) and RX.DATA (salt model, dashboard). No numbers are added here.
   costs.json (published costs) and research.json (rice varieties, live-data feeds) sit next to this file. */
const SiteData = (() => {
  const get = (url) => {
    const x = new XMLHttpRequest();
    x.open("GET", url, false);   /* synchronous on purpose: every later script expects DATA to exist */
    x.send(null);
    if (x.status !== 200 && x.status !== 0) throw new Error("Could not load " + url + " (" + x.status + ")");
    return JSON.parse(x.responseText);
  };
  const pick = (o, ks) => { const r = {}; ks.forEach((k) => { if (o[k] !== undefined) r[k] = o[k] }); return r };
  const map = (o, f) => Object.fromEntries(Object.entries(o || {}).map(([k, v]) => [k, f(v, k)]));
  const tx = (x) => (x && typeof x === "object" ? { en: x.en || "", vi: x.vi || "" } : x);

  /* DATA: same shape the explorer (app.js) and the dashboard read */
  const CARD_KEYS = ["id", "kind", "name", "calendar", "months", "scores", "confidence", "not_here", "plan", "upland", "needs_brackish", "crop", "src", "benefits", "risks", "gaps", "why", "profit_range"];
  const card = (c) => (c.variants ? { id: c.id, kind: c.kind, variants: map(c.variants, card), crop_default: c.crop_default } : pick(c, CARD_KEYS));
  const line = (x) => ({ en: x.plain ? x.plain.en : x.en, vi: x.plain ? x.plain.vi : x.vi, full: { en: x.en, vi: x.vi }, salt: !!x.salt, src: x.src });
  const view = (v, base) => ({ rain: v.climate.rain_mm, climate: pick(v.climate, ["rain_min_mm", "rain_max_mm"]), et0: v.climate.et0_mm, ndvi: v.ndvi && v.ndvi.monthly,
    crops: (v.ndvi && v.ndvi.crops_per_year) ?? (base && base.ndvi && base.ndvi.crops_per_year),   /* El Niño view: the satellite crop count of the area */ salt: v.salinity.months, saltNote: v.salinity.note, summary: (v.summary || []).map(line), cards: (v.cards || []).map(card) });
  function app(J) {
    return {
      sites: J.sites.map((s) => Object.assign({ id: s.id, lat: s.lat, lon: s.lon, name: s.name }, view(s), s.elnino ? { el: view(s.elnino, s) } : {})),
      resources: map(J.resources, (r) => pick(r, ["name", "seed", "fertiliser", "steps"])),
      sources: J.sources, outlook: J.outlook, chart_src: J.chart_src, salt_src: J.salt_src, elnino_src: J.elnino_src
    };
  }

  /* RX.DATA: the compact form of the prediction model (same rules as drafts/redesign/make_data.py) */
  const one = (c) => (c.variants ? c.variants.watermelon || Object.values(c.variants)[0] : c);
  function rx(J) {
    const nino = (s) => {
      const e = s.elnino; if (!e) return null;
      const sc = {}; (e.cards || []).map(one).forEach((c) => { if (c.scores) sc[c.id] = c.scores });
      const sal = e.salinity || {};
      return { peak: sal.station_ppt, rain: e.climate.rain_mm, et0: e.climate.et0_mm, salt: sal.months, level: sal.level, scores: sc };
    };
    return {
      outlook: tx(J.outlook.text),
      sites: J.sites.map((s) => {
        const sal = s.salinity;
        return { id: s.id, lat: s.lat, lon: s.lon, name: tx(s.name), salt: sal.months, level: sal.level, saltNote: tx(sal.note || {}),
          rain: s.climate.rain_mm, et0: s.climate.et0_mm, crops: s.ndvi.crops_per_year, clay: s.soil.clay_pct,
          cards: s.cards.map(one).filter((c) => c.scores).map((c) => ({ id: c.id, kind: c.kind, name: tx(c.name), cal: tx(c.calendar || {}), months: c.months, scores: c.scores,
            conf: c.confidence, pros: (c.benefits || []).slice(0, 2).map(tx), cons: (c.risks || []).slice(0, 2).map(tx), water: c.water_mm })),
          nino: nino(s), peak: sal.station_ppt, lastYear: sal.last_year };
      }),
      res: map(J.resources, (r) => ({ name: tx(r.name), seed: tx(r.seed || {}), fert: "fertiliser" in r ? tx(r.fertiliser) : { en: "", vi: "" }, days: r.duration_days ?? null, steps: (r.steps || []).slice(0, 3).map(tx) }))
    };
  }
  return { get, app, rx };
})();
const SITES_JSON = SiteData.get("data/sites.json");
const DATA = SiteData.app(SITES_JSON);
const COSTS = SiteData.get("app/costs.json");
const RESEARCH = SiteData.get("app/research.json");
