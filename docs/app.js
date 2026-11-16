// Mekong Rotation Explorer: reads data/sites.json (made by pipeline/build.py) and draws everything.
let lang = "en", mode = "typical", data, site, chart, planId = null, upCrop = null;  // planId: card the 12-month plan is built from (null = top-ranked); upCrop: chosen upland crop (null = the area's default)
const markers = {};
let lmap;  // the Leaflet map, if the library loaded
const $ = s => document.querySelector(s);
const t = k => STRINGS[lang][k];
const pick = o => o[lang];
const num = x => lang === "vi" ? String(x).replace(".", ",") : String(x);  // Vietnamese decimal comma: 3.0 -> 3,0
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const KEYS = ["water", "income", "soil", "salt"];
const narrow = matchMedia("(max-width: 600px)");  // phones: chart legend moves into a tap-to-open list
const view = () => mode === "elnino" ? site.elnino : site;  // El Niño year: same site, climate + cards averaged over El Niño seasons
const UI_STORE = "mre-ui-v1";
let ui = "advanced";  // "simple" | "advanced": how much detail; Advanced unless "simple" was saved (#40)
function setUi(next, save = true) {
  ui = next;
  document.body.dataset.ui = ui;
  $("#needsBox").open = ui === "advanced";  // Simple: crop inputs one tap away
  // Simple (#57 amendment 1): map, cards, crop + sliders, then summary + outlook. Nodes move in the DOM so Tab order matches the screen
  const s = ui === "simple", crop = [$("#current").parentElement, $("#satSees")], sum = [$("#siteSummary"), $(".area-more")];
  $("#pArea").after(...["#pCards", "#pWants", "#pYear"].map($)[s ? "slice" : "reverse"]());
  if (s) { $("#weights").before(...crop); $("#outlook").before(...sum); } else $("#siteName").after(...sum, ...crop);
  $("#fieldMore")[s ? "append" : "before"]($("#fieldNote"));  // Simple: the note folds away so the first card fits the first screen
  if (lmap) { lmap.invalidateSize(); s ? lmap.fitBounds(data.sites.map(x => [x.lat, x.lon]), { paddingTopLeft: [24, 16], paddingBottomRight: [24, 36] }) : lmap.setView([9.5, 105.9], 9); }  // Simple: the shorter map still shows every pin
  if (save) try { localStorage.setItem(UI_STORE, ui); } catch (e) { /* not saved: still works for this visit */ }
}

fetch("data/sites.json").then(r => r.ok ? r.json() : Promise.reject(new Error("HTTP " + r.status))).then(d => {  // a 503 page can still be JSON
  data = d;
  if (d.outlook.elnino) mode = "elnino";  // NOAA says El Niño is here or coming: show those years first
  if (window.L) initMap();  // map library blocked: cards and plan still work
  initWeights();
  ["current", "noBrackish", "lowLabour"].forEach(id => $("#" + id).addEventListener("change", renderCards));
  $("#seedCrop").addEventListener("change", renderSeed);
  $("#lang").addEventListener("click", () => { lang = lang === "en" ? "vi" : "en"; render(); });
  $("#modeTypical").addEventListener("click", () => { mode = "typical"; render(); });
  $("#modeElnino").addEventListener("click", () => { mode = "elnino"; render(); });
  let saved = null;
  try { saved = localStorage.getItem(UI_STORE); } catch (e) { /* storage blocked: Advanced */ }
  setUi(saved === "simple" ? "simple" : "advanced", false);
  $("#uiSimple").addEventListener("click", () => { setUi("simple"); render(); });
  $("#uiAdvanced").addEventListener("click", () => { setUi("advanced"); render(); });
  narrow.addEventListener("change", renderChart);
  $("#cards").parentElement.addEventListener("click", e => {  // the section: also the cards in Simple's "Compare other options"
    const u = e.target.closest("[data-crop]");
    if (u) { upCrop = u.dataset.crop; renderCards(); document.querySelector(`[data-crop="${upCrop}"]`).focus(); return; }
    const b = e.target.closest("[data-plan]"); if (!b) return;
    planId = b.dataset.plan; renderCards(); $("#plan").focus(); $("#plan").scrollIntoView({ behavior: "smooth" });
  });
  initFields();
}, e => {  // download failed (offline, file blocked): say so in both languages; code errors are not caught here
  console.error(e);
  document.querySelectorAll("header [data-i18n]").forEach(el => el.textContent = t(el.dataset.i18n));
  $("#lang").hidden = $(".ui-row").hidden = true;  // nothing to switch
  $("main").innerHTML = `<p class="panel wide warn" role="alert">${STRINGS.en.loadFail}<br><span lang="vi">${STRINGS.vi.loadFail}</span></p>`;
});

function initMap() {
  const map = lmap = L.map("map").setView([9.5, 105.9], 9);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    { attribution: "© OpenStreetMap contributors", maxZoom: 15 }).addTo(map);
  data.sites.forEach(s => {
    markers[s.id] = L.circleMarker([s.lat, s.lon], { radius: 10, weight: 3 })
      .addTo(map).on("click", () => selectSite(s));
    const el = markers[s.id].getElement();  // SVG pin: make it a keyboard button
    el.setAttribute("tabindex", "0");
    el.setAttribute("role", "button");
    el.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectSite(s); }
    });
  });
  // clicking anywhere snaps to the nearest pin (we only have data for the pins)
  map.on("click", e => selectSite(data.sites.reduce((a, b) =>
    e.latlng.distanceTo([a.lat, a.lon]) < e.latlng.distanceTo([b.lat, b.lon]) ? a : b)));
}

function initWeights() {
  $("#weights").innerHTML = KEYS.map(k => `
    <div class="weight"><label for="w_${k}"><span data-i18n="w_${k}"></span><output id="o_${k}"></output></label>
    <input type="range" id="w_${k}" min="0" max="3" value="2"></div>`).join("");
  KEYS.forEach(k => $("#w_" + k).addEventListener("input", renderCards));
}

function selectSite(s, keepCrop) {  // keepCrop: a saved field already says what is grown
  site = s;
  Object.entries(markers).forEach(([id, m]) => {
    m.setStyle(id === s.id ? { color: "#c0392b", fillColor: "#c0392b", fillOpacity: .9 } : { color: "#2f7d32", fillColor: "#fff", fillOpacity: .9 });
    m.getElement().setAttribute("aria-pressed", id === s.id);
  });
  if (s.ndvi && !keepCrop) $("#current").value = s.ndvi.crops_per_year >= 2.5 ? "rice3" : "rice2";
  render();
}

function render() {
  document.documentElement.lang = lang;
  const seed = $("#seedCrop").value || "rice";
  $("#seedCrop").innerHTML = Object.keys(site.seed_check).map(k => `<option value="${k}"${k === seed ? " selected" : ""}>${esc(pick(data.resources[k].name))}</option>`).join("");
  $("#step2h").dataset.i18n = mode === "elnino" ? "step2elnino" : "step2";
  $("#modeTypical").setAttribute("aria-pressed", mode === "typical");
  $("#modeElnino").setAttribute("aria-pressed", mode === "elnino");
  $("#uiSimple").setAttribute("aria-pressed", ui === "simple");
  $("#uiAdvanced").setAttribute("aria-pressed", ui === "advanced");
  document.querySelectorAll("[data-i18n]").forEach(el => el.textContent = t(el.dataset.i18n));
  if (ui === "simple") document.querySelectorAll("main h2[data-i18n^=step]").forEach((h, i) => h.textContent = h.textContent.replace(/^\d+/, i + 1));  // Simple: step numbers follow its own order
  renderFields();
  $("#about").innerHTML = t("about").map(x => `<li>${x}</li>`).join("");
  $("#sourcesH").textContent = t("sourcesTitle")(data.sources.length);
  $("#sourceList").innerHTML = data.sources.map((x, i) => `<li id="src-${i + 1}" tabindex="-1">${srcHtml(x)}</li>`).join("");
  $("#soilHelpList").innerHTML = data.soil_help.map(h => `<li><b>${esc(pick(h.title))}</b>. ${esc(pick(h.text))}${cite(h.src)}
    <ul class="chips" aria-label="${t("appliesTo")}">${h.applies.map(id => `<li>${esc(pick(cardsOf(site).find(c => c.id === id).name))}</li>`).join("")}</ul></li>`).join("");
  $("#chartSrc").innerHTML = `${t("chartSrc")} NASA POWER, NASA GPM, NASA MODIS${cite(data.chart_src)}`;
  $("#siteName").textContent = pick(site.name);
  $("#map").setAttribute("aria-label", t("mapLabel"));
  data.sites.forEach(s => markers[s.id]?.getElement().setAttribute("aria-label", pick(s.name)));  // follows language; no markers without the map
  $("#siteSummary").innerHTML = view().summary.map(x => `<li${x.salt ? ' class="salt-line"' : ""}>${esc(pick(ui === "simple" && x.plain || x))}${cite(x.src)}</li>`).join("")
    + (ui === "simple" ? `<li>${esc(t("nasaCredit"))}${cite(view().summary.filter(x => !x.salt).flatMap(x => x.src))}</li>` : "");  // Simple: one plain credit replaces the dataset names
  $("#saltNote").innerHTML = esc(pick(site.salinity.note)) + cite(data.salt_src);
  $("#soilLine").innerHTML = site.soil ? esc(t("soil")(site.soil)) + cite(data.soil_src) : esc(t("soilMissing"));
  $("#ndviNote").textContent = site.ndvi ? "" : t("ndviMissing");
  $("#outlook").innerHTML = esc(pick(data.outlook.text)) + cite(data.outlook.src);
  $("#modeNote").innerHTML = mode === "elnino" ? esc(t("modeNote")) + cite(data.elnino_src) : "";
  $("#modeYearsBox").hidden = mode !== "elnino";
  $("#satSees").textContent = site.ndvi ? t(ui === "simple" ? "satSeesSimple" : "satSees") : "";
  $("#stripKey").innerHTML = t("stripKey").map((x, i) => `<span class="key ${["R", "U", "S", "rest", "salt"][i]}"></span>${esc(x)}`).join(" ");
  renderChart();
  renderCards();
}

function renderChart() {
  if (!window.Chart) return;  // chart library blocked: the rest of the app still works
  const c = view().climate, months = Array.from({ length: 12 }, (_, i) =>
    new Date(2000, i).toLocaleString(lang === "vi" ? "vi-VN" : "en", { month: "short" }));
  const top = Math.max(...c.rain_max_mm, ...c.et0_mm);
  const sets = [
    { type: "bar", label: t("saltBand"), data: months.map((_, i) => site.salinity.months.includes(i + 1) ? top : null),
      backgroundColor: "rgba(192,57,43,.15)", grouped: false, barPercentage: 1, categoryPercentage: 1, order: 3 },
    { type: "bar", label: t("rainRange"), data: c.rain_min_mm.map((v, i) => [v, c.rain_max_mm[i]]),  // floating bar: driest to wettest year
      backgroundColor: "rgba(43,108,176,.2)", grouped: false, barPercentage: .9, order: 2.5 },
    { type: "bar", label: t("rain"), data: c.rain_mm, backgroundColor: "#2b6cb0", grouped: false, barPercentage: .6, order: 2 },
    { type: "line", label: t("et0"), data: c.et0_mm, borderColor: "#e67e22", backgroundColor: "#e67e22", order: 1 },
  ];
  const nd = view().ndvi;  // greenness follows the typical / El Niño toggle
  if (nd) sets.push({ type: "line", label: t("ndvi"), data: nd.monthly, yAxisID: "y2",
    borderColor: "#2f7d32", backgroundColor: "#2f7d32", borderDash: [6, 3], order: 0 },
    // greenness band: an unlabelled lower edge, then the upper edge filled down to it ("-1" = previous dataset)
    { type: "line", label: "", data: nd.monthly_min, yAxisID: "y2", borderWidth: 0, pointRadius: 0, order: 4 },
    { type: "line", label: t("ndviRange"), data: nd.monthly_max, yAxisID: "y2", borderWidth: 0, pointRadius: 0,
      backgroundColor: "rgba(47,125,50,.18)", fill: "-1", order: 4 });
  $("#chart").setAttribute("aria-label", `${t(mode === "elnino" ? "step2elnino" : "step2")}: ${pick(site.name)}. ${view().summary.map(pick).join(" ")}`);
  $("#legendBox").hidden = !narrow.matches;
  $("#legendList").innerHTML = sets.filter(s => s.label).map(s => `<li><span class="swatch" style="background:${
    s.type === "line" && !s.fill ? s.borderColor : s.backgroundColor}"></span>${esc(s.label)}</li>`).join("");
  if (chart) chart.destroy();
  chart = new Chart($("#chart"), {
    data: { labels: months, datasets: sets },
    options: { maintainAspectRatio: false, animation: false, locale: lang === "vi" ? "vi-VN" : "en",
      plugins: { legend: { display: !narrow.matches, labels: { boxWidth: 12, font: { size: 11 }, filter: item => item.text } } },
      scales: { y: { title: { display: true, text: "mm" } },
                y2: { display: !!nd, position: "right", min: 0, max: 1, grid: { drawOnChartArea: false }, title: { display: true, text: "NDVI" } } } }
  });
}

// the upland card holds one variant per crop: show the chosen one if farmers grow it here, else the area's default
const cardsOf = v => v.cards.map(c => {
  if (!c.variants) return c;
  const choices = Object.keys(c.variants).filter(k => c.variants[k].offered);
  return { ...c.variants[choices.includes(upCrop) ? upCrop : c.crop_default], choices };
});

function scoreOf(card, w) {
  const ks = KEYS.filter(k => card.scores[k] != null);  // a crop with no checked profit figure is ranked on the other scores
  const total = ks.reduce((a, k) => a + w[k], 0);
  const avg = total ? ks.reduce((a, k) => a + w[k] * card.scores[k], 0) / total
                    : ks.reduce((a, k) => a + card.scores[k], 0) / ks.length;  // all sliders at 0: treat equally
  return avg - ($("#lowLabour").checked && card.upland ? 0.5 : 0);
}

function renderCards() {
  const w = Object.fromEntries(KEYS.map(k => [k, +$("#w_" + k).value]));
  KEYS.forEach(k => $("#o_" + k).textContent = t("levels")[w[k]]);
  const cur = $("#current").value;
  // a rice farmer sees the other rice option only if it is theirs; a rice-shrimp farmer sees every option
  let cards = cardsOf(view()).filter(c => c.kind === "alt" || c.id === cur || cur === "rice_shrimp");
  const hidden = $("#noBrackish").checked ? cards.filter(c => c.needs_brackish && c.id !== cur) : [];  // never hide the farmer's own rotation
  cards = cards.filter(c => !hidden.includes(c)).map(c => ({ c, s: scoreOf(c, w) })).sort((a, b) => (a.c.not_here - b.c.not_here) || (b.s - a.s));  // "not usually possible here" goes last
  $("#hiddenNote").textContent = hidden.length ? t("hidden") + " " + hidden.map(c => pick(c.name)).join(", ") : "";

  // FLIP animation: remember old card positions so reordering slides (looks good on video)
  const before = {};
  document.querySelectorAll(".card").forEach(el => before[el.dataset.id] = el.getBoundingClientRect());
  const now = cardsOf(view()).find(c => c.id === cur);
  // a reason every shown card gives (e.g. few salinity readings) is said once above the cards
  const all = ({ c }) => c.risks.concat(c.gaps).map(pick);
  const common = cards.length > 1 ? all(cards[0]).filter(x => cards.every(k => all(k).includes(x))) : [];
  $("#commonNote").textContent = common.length ? `${t("allOptions")} ${common.join(" ")}` : "";
  const plan = (cards.find(x => x.c.id === planId) || cards[0]).c;  // a hidden plan card falls back to the top one
  // Simple: the farmer's rotation and the plan stay open; every other option is one tap away, in rank order
  const top = x => ui === "advanced" || x.c.id === now.id || x.c.id === plan.id;
  const html = cards.map(({ c, s }, i) => cardHtml(c, s, i + 1, now, plan, common));
  $("#cards").innerHTML = html.filter((_, i) => top(cards[i])).join("");
  $("#moreList").innerHTML = html.filter((_, i) => !top(cards[i])).join("");
  $("#moreCards").hidden = !$("#moreList").innerHTML;
  $("#moreCards > summary").textContent = t("moreCards")(cards.length - $("#cards").children.length);
  renderPlan(plan);
  saveFields();
  document.querySelectorAll(".card").forEach(el => {
    const b = before[el.dataset.id]; if (!b || !b.width) return;  // no width: it was inside the closed "Compare other options"
    const a = el.getBoundingClientRect();
    el.style.transition = "none";
    el.style.transform = `translate(${b.left - a.left}px, ${b.top - a.top}px)`;
    requestAnimationFrame(() => { el.style.transition = ""; el.style.transform = ""; });
  });
}

function list(key, items, first = []) {  // first: plain strings already in the current language; items may carry src numbers
  return `<h4>${t(key)}</h4><ul>${first.map(x => `<li>${esc(x)}</li>`).join("")}${items.map(x => `<li>${esc(pick(x))}${cite(x.src)}</li>`).join("")}</ul>`;
}

function cite(ids) {  // Wikipedia-style [n] links into the numbered list at the bottom; runs collapse: [5–12]
  if (!ids || !ids.length) return "";
  const n = [...new Set(ids)].map(i => i + 1).sort((a, b) => a - b), runs = [];
  n.forEach(x => runs.length && runs[runs.length - 1][1] === x - 1 ? runs[runs.length - 1][1] = x : runs.push([x, x]));
  const a = x => `<a href="#src-${x}" data-cite aria-label="${t("srcAria")} ${x}">${x}</a>`;
  return `<sup class="cite">[${runs.map(([x, y]) => x === y ? a(x) : y === x + 1 ? `${a(x)}, ${a(y)}` : `${a(x)}–${a(y)}`).join(", ")}]</sup>`;
}
document.addEventListener("click", e => {  // open the folded list, then go to the entry (a plain jump misses it while folded)
  const a = e.target.closest("a[data-cite]"); if (!a) return;
  e.preventDefault();
  $("#sourcesBox").open = true;
  const li = $(a.getAttribute("href"));
  li.scrollIntoView({ block: "center" }); li.focus({ preventScroll: true });
  history.replaceState(null, "", a.getAttribute("href"));
});

function srcHtml(x) {
  return `${x.url ? `<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.title)}</a>` : esc(x.title)} ${x.verified ? "" : t("unverified")}`;
}

function strip(c, now, when) {  // the plan's 12 months from this month; red underline = this pin's usual salt months
  const salt = view().salinity.months, name = i => new Date(2000, i).toLocaleString(lang === "vi" ? "vi-VN" : "en", { month: "short" });
  const ms = Array.from({ length: 12 }, (_, i) => new Date(now.getFullYear(), now.getMonth() + i));
  const code = d => c.months[d.getMonth()];
  const cells = ms.map((d, i) => `<span class="m ${code(d) === "-" ? "rest" : code(d)[0]}${i && code(d) !== code(ms[i - 1]) ? " start" : ""}${
    salt.includes(d.getMonth() + 1) ? " salt" : ""}">${lang === "vi" ? d.getMonth() + 1 : name(d.getMonth())[0]}</span>`).join("");
  const years = ms.map((d, i) => `<span class="y">${!i || !d.getMonth() ? d.getFullYear() : ""}</span>`).join("");  // year on the first block and each January
  return `<div class="strip" role="img" aria-label="${esc(when)}: ${esc(pick(c.calendar))}. ${esc(t("stripKey")[4])}: ${salt.map(m => name(m - 1)).join(", ")}">${cells}${years}</div>`;
}

const dots = x => { const h = Math.round(x * 2) / 2; return "●".repeat(Math.floor(h)) + (h % 1 ? "◐" : "") + "○".repeat(5 - Math.ceil(h)); };  // half dots

function cardHtml(c, s, rank, now, plan, common) {
  const subs = KEYS.map(k => c.scores[k] == null ? `<li>${t("scoreNames")[k]} <span class="dots">${t("noScore")}</span></li>`
    : `<li>${t("scoreNames")[k]} <span class="dots" role="img" aria-label="${num(c.scores[k].toFixed(1))} ${t("of5")}">${num(c.scores[k].toFixed(1))} ${dots(c.scores[k])}</span></li>`).join("");
  const pickCrop = c.choices && c.choices.length > 1 ? `<div class="crop-pick" role="group" aria-label="${t("cropPick")}"><span>${t("cropPick")}</span>${
    c.choices.map(k => `<button type="button" data-crop="${k}" aria-pressed="${k === c.crop}">${esc(pick(data.resources[k].name))}</button>`).join("")}</div>` : "";
  const before = ui === "simple" && c.id === plan.id;  // Simple: every risk and gap of the plan, open, before its plan button
  const risks = list(before ? "beforeChoose" : "risks", c.risks.concat(c.gaps).filter(x => !common.includes(pick(x))));
  return `<article class="card ${c.id === now.id ? "current" : ""}" data-id="${c.id}">
    <span class="rank">#${rank}</span>
    <h3>${esc(pick(c.name))}</h3>
    ${c.id === now.id ? `<span class="tag">${t("yourNow")}</span>` : ""}
    ${c.not_here ? `<span class="tag nothere">${t("notHere")}</span>` : ""}
    <p class="cal">${esc(pick(c.calendar))}${cite(c.cal_src)}</p>
    ${pickCrop}
    <div>${t("match")}: <b>${num(s.toFixed(1))} / 5</b></div>
    <div class="bar"><span style="width:${(s / 5) * 100}%"></span></div>
    <ul class="subs adv-only">${subs}</ul>
    <span class="conf ${c.confidence}">${t("confidence")}: ${t(c.confidence)}</span>
    ${$("#lowLabour").checked && c.upland ? `<p class="warn">${t("labourWarn")}</p>` : ""}
    ${before ? `<div class="more before">${risks}</div>` : ""}
    <details class="more"><summary>${t(ui === "simple" ? "whyAdvice" : "details")}</summary>
      ${list("why", c.why, c.id === now.id ? [t("isNow")] : [])}${list("benefits", c.benefits)}${before ? "" : risks}
      <p class="hint">${t("cardSrc")}${cite(c.src)}</p></details>
    <button type="button" class="plan-btn" data-plan="${c.id}" aria-pressed="${c.id === plan.id}">${t(c.id === plan.id ? "planOn" : "planBtn")}</button>
  </article>`;
}

function resHtml(id) {  // one crop's inputs from resources.json; missing figures say so instead of guessing
  const r = data.resources[id], fig = (k, v) => `<li><b>${t(k)}:</b> ${v ? esc(pick(v)) : t("noFigure")}</li>`;
  return `<details><summary>${esc(pick(r.name))}</summary>${r.scope ? `<p class="hint">${esc(pick(r.scope))}</p>` : ""}
    <ul>${fig(id === "shrimp" ? "stocking" : "seed", r.seed)}${fig(id === "shrimp" ? "prep" : "fert", r.fertiliser)}</ul>
    ${r.steps.length ? `<b>${t("steps")}:</b><ol>${r.steps.map(x => `<li>${esc(pick(x))}</li>`).join("")}</ol>` : ""}
    ${r.src.length ? `<p class="hint">${t("sources")}:${cite(r.src)}</p>` : ""}</details>`;
}

function renderPlan(c) {  // the next 12 months from this month, grouped into runs of the same crop
  const now = new Date(), m0 = now.getMonth();
  const label = i => { const d = new Date(now.getFullYear(), m0 + i);
    return lang === "vi" ? `T${d.getMonth() + 1}/${d.getFullYear()}` : d.toLocaleString("en", { month: "short", year: "numeric" }); };
  const span = (a, b) => a === b ? label(a) : `${label(a)} – ${label(b)}`;
  const code = i => c.months[((m0 + i) % 12 + 12) % 12], salt = view().salinity.months;
  const runs = [];
  for (let i = 0; i < 12; i++) {
    if (i && code(i) === code(i - 1)) runs[runs.length - 1].to = i;
    else runs.push({ code: code(i), from: i, to: i });
  }
  $("#planFor").textContent = `${t("planFor")} ${fieldLabel(active)}: ${pick(c.name)} · ${pick(site.name)}`;
  $("#planStrip").innerHTML = strip(c, now, span(0, 11));
  $("#planWarn").hidden = !data.outlook.elnino;
  $("#planWarn").textContent = data.outlook.elnino ? stepRef(t("planElnino")) : "";  // the NOAA forecast itself is in step 2
  const items = runs.map(r => {
    const when = span(r.from, r.to), sm = [];  // salt months inside this run, as ranges
    for (let i = r.from; i <= r.to; i++) if (salt.includes((m0 + i) % 12 + 1)) {
      if (sm.length && sm[sm.length - 1][1] === i - 1) sm[sm.length - 1][1] = i; else sm.push([i, i]);
    }
    const saltLine = sm.length ? `<span class="salt-badge">${t("planSalt")}: ${sm.map(([a, b]) => span(a, b)).join(", ")}</span>` : "";
    if (r.code === "-") return `<li class="rest"><b>${when}</b>: ${t("planRest")} ${saltLine}</li>`;
    const p = c.plan[r.code], started = r.from === 0 && code(-1) === r.code, ends = code(r.to + 1) !== r.code;
    const marks = [started ? t("planCont") : `${t(r.code === "S" ? "planStock" : "planSow")}: ${label(r.from)}`, ends ? `${t("planHarvest")}: ${label(r.to)}` : ""].filter(Boolean);
    const name = pick(p.name);
    return `<li><b>${when}</b>: ${esc(name[0].toUpperCase() + name.slice(1))} ${saltLine}<div class="hint">${marks.join(" · ")}</div></li>`;
  });
  const first = ui === "simple" ? 2 : 12;  // Simple: now and next first, the rest of the year one tap away
  $("#planList").innerHTML = items.slice(0, first).join("");
  $("#planMoreList").innerHTML = items.slice(first).join("");
  $("#planMoreList").start = first + 1;
  $("#planMore").hidden = items.length <= first;
  // each crop's inputs once, even when it grows in two seasons of the year
  $("#planNeeds").innerHTML = [...new Set(runs.filter(r => r.code !== "-").flatMap(r => c.plan[r.code].res))].map(resHtml).join("");
  renderSeed();
}

const stepRef = s => ui === "simple" ? s.replace(/(step|bước) ([24])/, (_, w, n) => `${w} ${6 - n}`) : s;  // Simple swaps steps 2 and 4

function seedWhen(sc, now = new Date()) {  // safe sowing months -> the next real window from today: [start (null = now), sow_by, harvest_by] as [year, month]
  const y = now.getFullYear(), m = now.getMonth() + 1, after = (a, b) => (b - a + 12) % 12;  // months from a forward to b
  // the pipeline checks starts on day 1: any day before the last safe month ends before that month's day-1 start does; in the last month only day 1 is checked
  const open = after(sc.sow_from, m) < after(sc.sow_from, sc.sow_by) || (m === sc.sow_by && now.getDate() === 1);
  const start = open ? [y, m] : [sc.sow_from > m ? y : y + 1, sc.sow_from];
  const by = [start[0] + (sc.sow_by < start[1] ? 1 : 0), sc.sow_by];
  return [open ? null : start, by, [by[0] + (sc.harvest_by < sc.sow_by ? 1 : 0), sc.harvest_by]];
}

function renderSeed() {  // "Seed I already have": the window before the salt months for this field's pin and view (pipeline seed_check)
  const k = $("#seedCrop").value, sc = view().seed_check[k], r = data.resources[k];
  const ym = ([y, m]) => lang === "vi" ? `T${m}/${y}` : new Date(y, m - 1).toLocaleString("en", { month: "short", year: "numeric" });
  if (!sc) { $("#seedResult").innerHTML = esc(t("seedNone")) + cite(r.src); return; }
  if (!sc.ok) { $("#seedResult").innerHTML = `<span class="warn">${esc(t("seedNoWindow"))}</span>${cite(data.salt_src)} <a href="#cards">${esc(stepRef(t("seedSeeCards")))}</a>`; return; }
  const src = cite([...r.src, ...data.salt_src, ...data.chart_src]);
  if (sc.sow_from === 1 && sc.sow_by === 12) {  // no salt months: the pipeline reports the December start
    $("#seedResult").innerHTML = esc(t(ui === "simple" ? "seedAnySimple" : "seedAny")(lang === "vi" ? `T${sc.harvest_by}` : new Date(2000, sc.harvest_by - 1).toLocaleString("en", { month: "short" }), sc.water_mm)) + src; return;
  }
  const [start, by, harvest] = seedWhen(sc);
  $("#seedResult").innerHTML = esc(t(ui === "simple" ? "seedOkSimple" : "seedOk")(start ? ym(start) : null, ym(by), ym(harvest), sc.water_mm)) + src;
}

// Fields: each keeps its own pin, crop, sliders, limits and plan, saved in this browser only
const STORE = "mre-fields-v1";
let fields = null, active = 0, delArmed = null;  // delArmed: timer while "Tap again to delete" is showing
const fieldLabel = i => (fields[i].name || "").trim() || `${t("fieldWord")} ${i + 1}`;
const snapshot = () => ({ name: fields ? fields[active].name : "", site: site.id, crop: $("#current").value, planId, upCrop,
  w: KEYS.map(k => +$("#w_" + k).value), noBrackish: $("#noBrackish").checked, lowLabour: $("#lowLabour").checked });

function initFields() {
  try {
    const st = JSON.parse(localStorage.getItem(STORE));
    if (st && Array.isArray(st.fields) && st.fields.length) { fields = st.fields; active = Math.min(st.active | 0, fields.length - 1); }
  } catch (e) { /* storage blocked or bad data: start with one field */ }
  if (!fields) { fields = [{ name: "", site: data.sites[0].id }]; active = 0; }  // first visit: crop comes from the satellite
  openField(active);
}

function openField(i) {
  active = i;
  const f = fields[i];
  const s = data.sites.find(x => x.id === f.site);
  if (["rice3", "rice2", "rice_shrimp"].includes(f.crop)) $("#current").value = f.crop;
  KEYS.forEach((k, j) => { if (f.w && f.w[j] >= 0 && f.w[j] <= 3) $("#w_" + k).value = f.w[j]; });
  $("#noBrackish").checked = !!f.noBrackish;
  $("#lowLabour").checked = !!f.lowLabour;
  planId = f.planId || null;
  upCrop = f.upCrop || null;
  selectSite(s || data.sites[0], !!(s && f.crop));  // unknown pin (data changed): first pin, crop from satellite
}

function saveFields() {
  if (!fields) return;
  fields[active] = snapshot();
  try { localStorage.setItem(STORE, JSON.stringify({ fields, active })); } catch (e) { /* not saved: still works for this visit */ }
}

function renderFields() {
  if (!fields) return;
  $("#fieldTabs").innerHTML = fields.map((f, i) => `<button type="button" data-field="${i}" aria-pressed="${i === active}">${esc(fieldLabel(i))}</button>`).join("")
    + `<button type="button" id="fieldAdd">${t("fieldAdd")}</button>`;
  if (document.activeElement !== $("#fieldName")) $("#fieldName").value = fields[active].name || "";  // don't fight the typist
  $("#fieldName").placeholder = `${t("fieldWord")} ${active + 1}`;
  $("#fieldDel").hidden = fields.length < 2;  // always keep one field
  $("#fieldDel").textContent = t(delArmed ? "fieldDelAsk" : "fieldDel");
  $("#yourField").textContent = t("yourField")(fieldLabel(active));
}

$("#fieldTabs").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  saveFields();
  disarm();
  if (b.id === "fieldAdd") { fields.push({ ...snapshot(), name: "" }); openField(fields.length - 1); $("#fieldMore").open = true; $("#fieldName").focus(); }
  else { openField(+b.dataset.field); $(`[data-field="${active}"]`).focus(); }  // tabs were redrawn: keep keyboard focus
});
$("#fieldName").addEventListener("input", e => {
  fields[active].name = e.target.value;
  renderFields();
  renderCards();  // updates the plan title and saves
});
// two taps instead of confirm(): sandboxed frames (the preview) block dialogs, so confirm() silently returns false
const disarm = () => { clearTimeout(delArmed); delArmed = null; };
$("#fieldDel").addEventListener("click", () => {
  if (fields.length < 2) return;
  if (!delArmed) { delArmed = setTimeout(() => { disarm(); renderFields(); }, 5000); return renderFields(); }
  disarm();
  fields.splice(active, 1);
  openField(Math.max(0, active - 1));
  $(`[data-field="${active}"]`).focus();  // the delete button may now be hidden
});
