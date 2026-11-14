/* dash.js: "Ruộng của tôi" — the farmer dashboard (first screen), the 4-step add-field wizard,
   the plan page with print/PDF, and the Sources + How-we-calculate page.
   Reads DATA (data.js), RX.Model (rx.js), MapView (map.js) and window.App (app.js). Owns its own storage key. */
const Dash = (() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (x) => String(x == null ? "" : x).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const KEY = "mre-farm";
  const get = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d } catch (e) { return d } };
  const put = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch (e) {} };
  const lang = () => (window.App && App.lang && App.lang()) || "vi";
  const L = (o) => (o == null ? "" : typeof o === "string" ? o : o[lang()] || o.vi || o.en || "");
  const nf = (x, d = 0) => { const s = (+x).toFixed(d); return lang() === "vi" ? s.replace(".", ",") : s };
  const NOW = new Date(), CM = NOW.getMonth();

  /* ---------------- words (VI first; short and plain) ---------------- */
  const W = {
    vi: {
      brand: "Ruộng của tôi", simple: "Đơn giản", adv: "Nâng cao", add: "Thêm ruộng", addFirst: "Thêm ruộng đầu tiên",
      emptyH: "Lập lịch trồng 12 tháng cho ruộng của bạn", emptyP: "Trả lời 4 câu ngắn. Ứng dụng ước tính độ mặn và gợi ý nên trồng gì từng tháng.",
      monthOn: (m) => `Tháng ${m} trên ruộng của bạn`, now: "Việc tháng này", next: "Tháng sau", nextM: (m) => `Tháng ${m}`,
      clash: (xs) => `Chú ý: lúa gặp nước mặn ở ${xs.join(", ")}. Đo độ mặn trước khi sạ, nước còn mặn thì chờ mưa.`, noClash: "Tốt: lịch này tránh được tháng nước mặn",
      saltIn: (a, b) => `Nước mặn từ tháng ${a} đến khoảng tháng ${b}`, saltNow: (lv, m) => `Nước đang ${lv}, đến khoảng tháng ${m}`, saltNone: "Ruộng không bị mặn trong năm (có cống ngăn mặn)",
      est: "Độ mặn là ước tính từ trạm đo, không đo bằng vệ tinh", ribbonH: "Lịch 12 tháng", tapPlan: "Bấm để xem bảng kế hoạch", today: "Hôm nay",
      lv: { ngot: "Ngọt", lo: "Hơi mặn", man: "Mặn" }, lvL: { ngot: "ngọt", lo: "hơi mặn", man: "mặn" },
      lvD: { ngot: "dưới 1‰: lúa an toàn", lo: "1–2‰: lúa bắt đầu yếu", man: "trên 2‰: lúa giảm năng suất" },
      money: (a, b) => `Năm nay lãi khoảng <b>${b}</b> triệu/công (1.000 m²). Năm bình thường: ${a} triệu.`, money1: (a) => `Lãi khoảng <b>${a}</b> triệu/công/năm.`,
      noMoney: "Chưa đủ số liệu lợi nhuận cho phương án này", moneySrc: "Trung vị lợi nhuận đã công bố 2018–2026 (báo cáo nhà nước, đại học, báo chí; xem Nguồn) · 1 công = 1.000 m²",
      nino: "Năm nay", ninoNote: "Năm nay nhiều khả năng là năm hạn mặn (El Niño, NOAA dự báo trên 83%). Mặn có thể đến sớm hơn và mặn hơn.", thisYr: "Năm nay",
      cropS: { R: "Lúa", S: "Tôm", U: "Màu", "-": "Nghỉ" }, pickB: "Chọn", goalD: { salt: "Ít bị mất mùa vì mặn", profit: "Thu nhập cao hơn", water: "Dùng ít nước kênh hơn" },
      print: "In ra giấy", change: "Đổi cách trồng", plan: "Kế hoạch 12 tháng", back: "Quay lại", close: "Đóng",
      crop: { R: "Lúa", S: "Tôm", U: "Cây màu", "-": "Nghỉ" },
      job: {
        restA: "Cho ruộng nghỉ, dọn rơm rạ", rest: "Ruộng nghỉ, chuẩn bị vụ sau",
        R0: (n) => `Làm đất, gieo sạ ${n}`, R1: (n) => `Thu hoạch ${n}`, R: (n) => `Chăm ${n}: bón phân, giữ nước`,
        S0: "Cải tạo ao, thả giống tôm", S1: "Thu hoạch tôm", S: "Chăm tôm: giữ mực nước, đo độ mặn",
        U0: (n) => `Làm luống, gieo ${n}`, U1: (n) => `Thu hoạch ${n}`, U: (n) => `Chăm ${n}: tưới, bón phân`
      },
      sowWait: (n) => `Đo độ mặn trước khi sạ ${n}. Nước còn mặn thì chờ mưa rửa mặn.`, tMonth: "Tháng", tCrop: "Trồng gì", tJob: "Việc chính", tSalt: "Nước", seed: "Giống", fert: "Phân bón", steps: "Các bước chính",
      preview: "Xem bản in (PDF)", save: "Lưu file", doPrint: "In", printHint: "Bản in khổ A4. Bấm \"Lưu file\" rồi mở file để in hoặc lưu thành PDF.",
      saved: "Đã lưu", ask: "Hỏi cán bộ khuyến nông trước khi đổi cách canh tác.",
      chooseH: "Đổi cách trồng", chooseP: "3 cách trồng hợp nhất với ruộng của bạn:", bestFor: (n) => `Hợp nhất với ruộng bạn: ${n}`, use: "Dùng cách trồng này", current: "Đang dùng", editAns: "Sửa câu trả lời",
      fit: "Hợp", optsH: "Câu trả lời về ruộng", seasons: "Ba vụ trong năm", sz: ["Vụ Đông Xuân (T11–T2)", "Vụ Hè Thu (T4–T7)", "Vụ Thu Đông (T8–T10)"],
      people: "Người làm trong nhà", machines: "Máy móc", pv: ["Ít", "Vừa", "Nhiều"], mv: ["Không có", "Thuê được", "Có sẵn"],
      brack: "Ruộng không lấy được nước lợ", goal: "Điều quan trọng nhất", goals: { salt: "Tránh mặn", profit: "Lãi nhiều", water: "Ít nước" },
      year: "Tính theo", years: { typical: "Năm thường", elnino: "Năm El Niño" }, size: "Diện tích (ha)", name: "Tên ruộng",
      better: (n) => `Với câu trả lời mới, cách trồng hợp hơn: ${n}`, del: "Xoá ruộng", delQ: "Xoá ruộng này?",
      wiz: ["Ruộng ở đâu?", "Ruộng đang trồng gì?", "Bạn muốn gì nhất?", "Kế hoạch hợp nhất"], step: (a, b) => `Bước ${a}/${b}`,
      w1p: "Bấm vào vùng của bạn trên bản đồ.", pickFirst: "Bấm vào vùng của bạn trên bản đồ để đi tiếp", pickGoal: "Chọn một điều ở trên để đi tiếp", w2p: "Vệ tinh NASA MODIS thấy ruộng ở vùng này thường trồng:", right: "Đúng", fix: "Sửa",
      w3p: "Chọn một. Bạn đổi lại được sau.", w4p: "Đây là cách trồng hợp nhất với ruộng của bạn.", others: "Xem 2 cách trồng khác",
      nextB: "Tiếp", saveB: "Lưu và xem", why: "Vì sao", mapFull: "Bản đồ đầy đủ", lab: "Tự chỉnh lịch (Plan Lab)", toDash: "Ruộng của tôi",
      tabs: { plan: "Kế hoạch", salt: "Mặn", money: "Tiền", soil: "Đất & nước" }, info: "Nguồn số liệu", src: "Nguồn số liệu", math: "Giới thiệu & mô hình",
      river: "Sông (trạm đo)", field: "Trong ruộng (ước tính)", seen: (n) => `Vệ tinh NASA MODIS thấy khoảng ${n} vụ/năm ở đây`,
      rain: (n) => `Mưa cả năm khoảng ${n} mm (NASA GPM IMERG)`, scoreH: "Điểm của phương án (1–5, cao là tốt)",
      sc: { salt: "An toàn mặn", water: "Tiết kiệm nước", soil: "Tốt cho đất", income: "Thu nhập" },
      range: (a, b, c) => `${a} – ${c} triệu đ/công/năm (giữa: ${b})`, fieldN: (i) => `Ruộng ${i}`, ha: "ha", cong: "công",
      areaSalt: { high: "mặn cao", medium: "mặn vừa", low: "mặn thấp" }, verified: "đã kiểm tra", estTag: "ước tính",
      nasaG: "Dữ liệu NASA", otherG: "Dữ liệu khác", saltG: "Độ mặn (ước tính từ báo cáo công khai)", moneyG: "Lợi nhuận, chi phí, kỹ thuật"
    },
    en: {
      brand: "My fields", simple: "Simple", adv: "Advanced", add: "Add field", addFirst: "Add your first field",
      emptyH: "A 12-month crop plan for your field", emptyP: "Answer 4 short questions. The app works out the salt and what to grow each month.",
      monthOn: (m) => `Month ${m} on your field`, now: "This month", next: "Next month", nextM: (m) => `Month ${m}`,
      clash: (xs) => `Careful: crops meet salty water in ${xs.join(", ")}. Measure salt before sowing; wait for rain if it is still salty.`, noClash: "Good: this plan avoids the salty months",
      saltIn: (a, b) => `Salty water from month ${a} to about month ${b}`, saltNow: (lv, m) => `Water is ${lv} now, until about month ${m}`, saltNone: "No salt in this field all year (sluice protected)",
      est: "Estimate from station reports, not measured by satellite", ribbonH: "12-month plan", tapPlan: "Tap to see the plan table", today: "Today",
      lv: { ngot: "Fresh", lo: "Brackish", man: "Salty" }, lvL: { ngot: "fresh", lo: "brackish", man: "salty" },
      lvD: { ngot: "under 1‰: rice is safe", lo: "1–2‰: rice starts to suffer", man: "over 2‰: rice loses yield" },
      money: (a, b) => `This year profit about <b>${b}</b> M₫/công (1,000 m²). Typical year: ${a} M₫.`, money1: (a) => `Profit about <b>${a}</b> M₫/công/year (typical year)`,
      noMoney: "Not enough profit data for this plan yet", moneySrc: "Median of published profit figures 2018–2026 (government, university, press; see Sources) · 1 công = 1,000 m²",
      nino: "This year", ninoNote: "This is likely a drought-and-salt year (El Niño, NOAA: over 83%). Salt may come earlier and stronger.", thisYr: "This year",
      cropS: { R: "Rice", S: "Shrimp", U: "Upland", "-": "Rest" }, pickB: "Choose", goalD: { salt: "Lose less to salt", profit: "Earn more", water: "Use less canal water" },
      print: "Print / PDF", change: "Change plan", plan: "12-month plan", back: "Back", close: "Close",
      crop: { R: "Rice", S: "Shrimp", U: "Upland crop", "-": "Rest" },
      job: {
        restA: "Rest the field, clear the straw", rest: "Field rests, prepare the next crop",
        R0: (n) => `Prepare the field, sow ${n}`, R1: (n) => `Harvest ${n}`, R: (n) => `Tend ${n}: fertilise, keep water`,
        S0: "Clean the pond, stock shrimp", S1: "Harvest shrimp", S: "Tend shrimp: keep water level, check salt",
        U0: (n) => `Make beds, sow ${n}`, U1: (n) => `Harvest ${n}`, U: (n) => `Tend ${n}: water, fertilise`
      },
      sowWait: (n) => `Measure salt before sowing ${n}. If the water is still salty, wait for rain.`, tMonth: "Month", tCrop: "Crop", tJob: "Main job", tSalt: "Water", seed: "Seed", fert: "Fertiliser", steps: "Key steps",
      preview: "Print view (PDF)", save: "Save file", doPrint: "Print", printHint: "A4 print view. Tap \"Save file\", then open it to print or save as PDF.",
      saved: "Saved", ask: "Talk to your extension officer before you change how you farm.",
      chooseH: "Change plan", chooseP: "The 3 plans that fit your field best:", bestFor: (n) => `Best fit for your field: ${n}`, use: "Use this plan", current: "In use", editAns: "Change my answers",
      fit: "Fit", optsH: "About your field", seasons: "Three seasons", sz: ["Winter–spring (Nov–Feb)", "Summer–autumn (Apr–Jul)", "Autumn–winter (Aug–Oct)"],
      people: "People at home", machines: "Machines", pv: ["Few", "Some", "Many"], mv: ["None", "Can hire", "Own"],
      brack: "No brackish water reaches the field", goal: "What matters most", goals: { salt: "Avoid salt", profit: "More profit", water: "Less water" },
      year: "Based on", years: { typical: "Typical year", elnino: "El Niño year" }, size: "Size (ha)", name: "Field name",
      better: (n) => `With your new answers, a better fit: ${n}`, del: "Delete field", delQ: "Delete this field?",
      wiz: ["Where is your field?", "What does it grow now?", "What do you want most?", "Your best plan"], step: (a, b) => `Step ${a} of ${b}`,
      w1p: "Tap your area on the map.", pickFirst: "Pick an area above to continue", pickGoal: "Pick one above to continue", w2p: "NASA MODIS satellite sees fields in this area usually grow:", right: "Right", fix: "Change",
      w3p: "Pick one. You can change it later.", w4p: "This plan fits your answers best.", others: "See 2 other plans",
      nextB: "Next", saveB: "Save and view", why: "Why", mapFull: "Full map", lab: "Edit the calendar (Plan Lab)", toDash: "My fields",
      tabs: { plan: "Plan", salt: "Salt", money: "Money", soil: "Soil & water" }, info: "Data sources", src: "Data sources", math: "About & model",
      river: "River (station)", field: "In the field (estimate)", seen: (n) => `NASA MODIS sees about ${n} crops a year here`,
      rain: (n) => `Rain about ${n} mm a year (NASA GPM IMERG)`, scoreH: "Plan scores (1–5, higher is better)",
      sc: { salt: "Salt safety", water: "Saves water", soil: "Better soil", income: "Income" },
      range: (a, b, c) => `${a} – ${c} M₫/công/year (middle: ${b})`, fieldN: (i) => `Field ${i}`, ha: "ha", cong: "công",
      areaSalt: { high: "high salt", medium: "medium salt", low: "low salt" }, verified: "checked", estTag: "estimate",
      nasaG: "NASA data", otherG: "Other data", saltG: "Salinity (estimate from public reports)", moneyG: "Profit, costs, farming steps"
    }
  };
  const T = (k) => W[lang()][k];

  /* ---------------- model helpers ---------------- */
  const sites = () => DATA.sites;
  const siteOf = (id) => sites().find((s) => s.id === id) || sites()[0];
  const areaLv = (id) => { try { return (RX.DATA.sites.find((x) => x.id === id) || {}).level || "medium" } catch (e) { return "medium" } };
  const lvDot = (l) => (l === "low" ? "ngot" : l === "medium" ? "lo" : "man");
  const short = (s) => { const m = lang() === "vi" ? L(s.name).match(/Khu vực (.+?) cũ/) : L(s.name).match(/Former (.+?) area/); return m ? m[1] : L(s.name).split(" (")[0] };
  const GOALS = { salt: { salt: 3, water: 2, income: 1, soil: 1 }, profit: { income: 3, salt: 1, water: 1, soil: 1 }, water: { water: 3, salt: 2, income: 1, soil: 1 } };
  const PEN = [[0.5, 0.4, 0.3], [0, 0, 0], [0, 0, 0]];
  const SEAS_OF = { rice3: ["R", "R", "R"], rice2: ["R", "R", "-"], rice_shrimp: ["S", "S", "R"], rice_upland: ["U", "R", "R"] };
  const resolve = (c, crop) => { if (!c.variants) return c; const ks = Object.keys(c.variants); return c.variants[ks.includes(crop) ? crop : c.crop_default] || c.variants[ks[0]] };
  const cardsFor = (s, year, crop) => ((year === "elnino" && s.el && s.el.cards) ? s.el.cards : s.cards).map((c) => resolve(c, crop));
  const cardOf = (f, year) => cardsFor(siteOf(f.site), year || f.year, f.crop).find((c) => c.id === f.rot) || cardsFor(siteOf(f.site), year || f.year, f.crop)[0];
  const weightsOf = (f) => f.weights || GOALS[f.goal || "salt"];
  function scoreOf(c, f) {
    const w = weightsOf(f), ks = ["water", "income", "soil", "salt"].filter((k) => c.scores[k] != null), tot = ks.reduce((a, k) => a + w[k], 0);
    let s = tot ? ks.reduce((a, k) => a + w[k] * c.scores[k], 0) / tot : ks.reduce((a, k) => a + c.scores[k], 0) / ks.length;
    if (c.upland) s -= PEN[f.wfP ?? 1][f.wfM ?? 0];
    return Math.max(1, s);
  }
  function rank(f) {
    return cardsFor(siteOf(f.site), f.year, f.crop).map((c) => {
      const no = c.not_here || (c.needs_brackish && f.noBrackish);
      return { c, s: scoreOf(c, f), no };
    }).sort((a, b) => (a.no - b.no) || (b.s - a.s));
  }
  const guessSeasons = (s) => (s.crops >= 2.5 ? ["R", "R", "R"] : s.crops >= 1.5 ? ["R", "R", "-"] : ["S", "S", "R"]);
  const curFrom = (sz) => { let best = "rice2", bs = -1; Object.keys(SEAS_OF).forEach((k) => { const n = SEAS_OF[k].reduce((a, x, i) => a + (x === sz[i]), 0); if (n > bs) { bs = n; best = k } }); return best };
  /* salt in the field water (‰), the same model as the map: river station profile × MODIS calibration; sluice areas fresh */
  const fieldSalt = (id, m, nino) => { try { return RX.Model.saltAt(id, m, nino, true) || 0 } catch (e) { return 0 } };
  const riverSalt = (id, m, nino) => { try { return RX.Model.saltAt(id, m, nino, false) || 0 } catch (e) { return 0 } };
  const level = (g) => (g < 1 ? "ngot" : g < 2 ? "lo" : "man");
  const isNino = (f) => (f.year ? f.year === "elnino" : true);   /* Simple: this season = El Niño (NOAA >83%) */
  const resKey = (c, code) => { const p = c.plan && c.plan[code]; if (p && p.res && p.res[0]) return p.res[0]; return code[0] === "S" ? "shrimp" : code[0] === "U" ? (c.crop || "watermelon") : c.id === "salt_tolerant" ? "rice_st" : "rice" };
  const cropName = (c, code) => { if (code === "-") return T("crop")["-"]; const p = c.plan && c.plan[code]; if (p && p.name) return L(p.name); const r = DATA.resources[resKey(c, code)]; return r ? L(r.name) : T("crop")[code[0]] };
  let curSite = null, curNino = true;
  function jobAt(c, m) {
    const ms = c.months, code = ms[m], prev = ms[(m + 11) % 12], next = ms[(m + 1) % 12], J = T("job");
    if (code === "-") return prev !== "-" ? J.restA : J.rest;
    const k = code[0], n = cropName(c, code), st = prev !== code, en = next !== code;
    const f = (x) => (typeof x === "function" ? x(n) : x);
    if (st && k !== "S" && level(fieldSalt(curSite, m, curNino)) === "man") return T("sowWait")(n);
    return st ? f(J[k + "0"]) : en ? f(J[k + "1"]) : f(J[k]);
  }
  /* months where rice or an upland crop is in the field while the field water is salty (over 2‰, the rice limit) */
  const clashOf = (f, c) => { const nino = isNino(f), out = []; c.months.forEach((code, m) => { if ((code[0] === "R" || code[0] === "U") && level(fieldSalt(f.site, m, nino)) === "man") out.push((lang() === "vi" ? "T" : "M") + (m + 1)) }); return out };
  const profit = (c) => (c && c.profit_range && c.profit_range.mid ? c.profit_range : null);
  const cong = (m) => nf(m / 10, 1);   /* M ₫/ha → M ₫/công (1 công = 1,000 m²) */
  const ICON = { R: "🌾", S: "🦐", U: "🍉", "-": "🟫" };
  const adv = () => st.ui === "advanced";
  const iconOf = (c, code) => !adv() ? "" : (code[0] === "U" ? ({ maize: "🌽", mungbean: "🫘", watermelon: "🍉" }[resKey(c, code)] || "🌱") : ICON[code[0]] || "🟫");

  /* Tap map from the real district outlines (geoBoundaries, in districts.js), coloured by the area's salt level */
  function areaMap(sel, opts = {}) {
    if (typeof DISTRICTS === "undefined") return "";
    const ids = sites().map((x) => x.id).filter((id) => DISTRICTS[id]); let w = 999, e = -999, so = 999, n = -999;
    ids.forEach((id) => DISTRICTS[id].forEach(([x, y]) => { w = Math.min(w, x); e = Math.max(e, x); so = Math.min(so, y); n = Math.max(n, y) }));
    const kx = Math.cos(9.5 * Math.PI / 180), W = 360, H = Math.round(W * (n - so) / ((e - w) * kx)), px = (x) => ((x - w) / (e - w) * (W - 8) + 4).toFixed(1), py = (y) => ((n - y) / (n - so) * (H - 8) + 4).toFixed(1);
    const fill = { low: "#CFE8EC", medium: "#F6E2B0", high: "#F4C9C5" };
    const polys = ids.map((id) => { const r = DISTRICTS[id], on = id === sel, cx = r.reduce((a, p) => a + p[0], 0) / r.length, cy = r.reduce((a, p) => a + p[1], 0) / r.length, s = siteOf(id);
      return `<g class="am${on ? " on" : ""}" data-wsite="${id}" role="button" tabindex="0" aria-pressed="${on}" aria-label="${esc(short(s))}"><polygon points="${r.map((p) => px(p[0]) + "," + py(p[1])).join(" ")}" fill="${fill[areaLv(id)]}"/><text x="${px(cx)}" y="${py(cy)}" text-anchor="middle">${esc(short(s))}</text>${opts.levels ? `<text class="lv" x="${px(cx)}" y="${(+py(cy) + 16).toFixed(1)}" text-anchor="middle">${esc(T("areaSalt")[areaLv(id)])}</text>` : ""}</g>` }).join("");
    return `<svg class="amap2" viewBox="0 0 ${W} ${H}" role="group" aria-label="${esc(T("wiz")[0])}">${polys}</svg>`;
  }

  /* ---------------- state ---------------- */
  const st = get(KEY, null) || { fields: [], sel: null, ui: "simple" };
  if (!st.fields.length) {   /* migrate fields saved by the older form (mre-fields) */
    get("mre-fields", []).forEach((o, i) => st.fields.push({ id: o.id || "f" + Date.now() + i, name: o.name || T("fieldN")(i + 1), site: o.site, seasons: o.seasons || SEAS_OF[o.cur] || ["R", "R", "R"], size: o.ha || o.size || null, wfP: 1, wfM: 0, noBrackish: false, goal: "salt", rot: null, crop: null, year: null, savedAt: Date.now() }));
    st.fields.forEach((f) => { if (!f.rot) f.rot = rank(f)[0].c.id });
  }
  const save = () => put(KEY, st);
  const fieldSel = () => st.fields.find((f) => f.id === st.sel) || st.fields[0] || null;
  let view = "dash", tab = "plan", railOpen = true, draft = null, wstep = 0, fixing = false;

  /* ---------------- shell ---------------- */
  function shell() {
    if ($("#dv")) return;
    const d = document.createElement("div"); d.id = "dv";
    d.innerHTML = `<header class="dv-top"><button type="button" class="dv-brand" data-dv="home"><span class="dv-bt"></span></button>
      <div class="dv-seg" role="group" aria-label="Mode"><button type="button" data-dvui="simple"></button><button type="button" data-dvui="advanced"></button></div>
      <div class="dv-seg dv-lang" role="group" aria-label="Language"><button type="button" data-dl="vi" lang="vi">VI</button><button type="button" data-dl="en" lang="en">EN</button></div></header>
      <main id="dvMain"></main><div id="dvSheet" class="dv-sheet" hidden><div class="dv-scrim" data-dv="close"></div><div class="dv-sh" role="dialog" aria-modal="true"><div class="dv-grab" aria-hidden="true"></div><div id="dvShBody"></div></div></div>
      <button type="button" id="dvBack" class="dv-backmap" hidden></button>`;
    document.body.appendChild(d);
  }
  function setUI(u) { st.ui = u; save(); document.body.classList.toggle("dv-adv", u === "advanced"); document.body.classList.toggle("dv-simple", u !== "advanced"); render() }
  function head() {
    $(".dv-bt").textContent = T("brand");
    $$("[data-dvui]", $("#dv")).forEach((b) => { b.textContent = T(b.dataset.dvui === "simple" ? "simple" : "adv"); b.setAttribute("aria-pressed", (st.ui === "advanced") === (b.dataset.dvui === "advanced")) });
    $$("[data-dl]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.dl === lang()));
    $("#dvBack").textContent = "← " + T("toDash");
  }

  /* ---------------- dashboard ---------------- */
  function chips() {
    const f0 = fieldSel();
    return `<nav class="dv-chips" aria-label="${esc(T("brand"))}">${st.fields.map((f) => {
      const s = siteOf(f.site), lv = level(fieldSalt(f.site, CM, isNino(f)));
      return `<button type="button" class="dv-chip" data-dvf="${f.id}" aria-pressed="${f0 && f.id === f0.id}"><i class="dot ${lv}" aria-hidden="true"></i><b>${esc(f.name)}</b><small>${esc(short(s))}</small></button>`;
    }).join("")}<button type="button" class="dv-chip add" data-dv="wiz">+ ${esc(T("add"))}</button></nav>`;
  }
  function saltLine(f) {
    const nino = isNino(f), lvs = [...Array(12)].map((_, m) => level(fieldSalt(f.site, m, nino)));
    if (lvs.every((x) => x === "ngot")) return { txt: T("saltNone"), lv: "ngot" };
    if (lvs[CM] !== "ngot") { let e = CM; for (let i = 1; i < 12; i++) { const m = (CM + i) % 12; if (lvs[m] === "ngot") break; e = m } return { txt: T("saltNow")(T("lvL")[lvs[CM]], e + 1), lv: lvs[CM] } }
    for (let i = 1; i < 12; i++) { const m = (CM + i) % 12; if (lvs[m] !== "ngot") { let e = m; for (let j = 1; j < 12; j++) { const k = (m + j) % 12; if (lvs[k] === "ngot") break; e = k } return { txt: T("saltIn")(m + 1, e + 1), lv: lvs.slice().sort().includes("man") ? "man" : lvs[m] } } }
    return { txt: T("saltNone"), lv: "ngot" };
  }
  function ribbon(f, c) {
    const nino = isNino(f), ms = lang() === "vi" ? ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"] : ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
    const order = [...Array(12)].map((_, i) => (CM + i) % 12);
    const cells = order.map((m) => { const code = c.months[m]; return `<li class="${code[0] === "-" ? "rest" : code[0]}${m === CM ? " now" : ""}"><span class="ic"${adv() ? ' aria-hidden="true"' : ""}>${adv() ? iconOf(c, code) : esc(T("cropS")[code[0]] || T("cropS")["-"])}</span><span class="mo">${ms[m]}</span><i class="sb ${level(fieldSalt(f.site, m, nino))}" aria-hidden="true"></i></li>` }).join("");
    return `<button type="button" class="dv-card dv-ribbon" data-dv="plan" aria-label="${esc(T("tapPlan"))}">
      <span class="dv-h3">${esc(T("ribbonH"))} · ${esc(L(c.name))}</span>
      <ol class="rb">${cells}</ol>
      <span class="rb-key">${["ngot", "lo", "man"].map((k) => `<span><i class="sb ${k}"></i>${esc(T("lv")[k])}</span>`).join("")}<span class="rb-today">▲ ${esc(T("today"))}</span></span>
      <span class="dv-more">${esc(T("tapPlan"))} →</span></button>`;
  }
  function moneyLine(f, c) {
    const p = profit(c), pe = profit(cardOf(f, "elnino"));
    if (!p) return `<p class="dv-money none">${esc(T("noMoney"))}</p>`;
    const tot = f.size ? (lang() === "vi" ? `Cả ruộng ${nf(f.size, 1)} ha: khoảng ${nf(+((pe || p).mid / 10).toFixed(1) * 10 * f.size, 0)} triệu.` : `Whole field ${nf(f.size, 1)} ha: about ${nf(+((pe || p).mid / 10).toFixed(1) * 10 * f.size, 0)} M₫.`) : "";
    return `<p class="dv-money">${pe && pe.mid !== p.mid ? T("money")(cong(p.mid), cong(pe.mid)) : T("money1")(cong(p.mid))}${tot ? `<span class="tot">${esc(tot)}</span>` : ""}<small>${esc(T("moneySrc"))} · <a href="#" data-dv="info" data-it="src">${lang() === "vi" ? "nguồn" : "source"}</a></small></p>`;
  }
  function empty() {
    return `<section class="dv-empty"><h1>${esc(T("emptyH"))}</h1><p>${esc(T("emptyP"))}</p>
      <button type="button" class="dv-btn gold big" data-dv="wiz">+ ${esc(T("addFirst"))}</button>
      <p class="dv-foot"><a href="#" data-dv="info" data-it="src">${esc(T("info"))}</a></p></section>`;
  }
  function advBlocks(f, c) {
    const s = siteOf(f.site), nino = isNino(f), ms = lang() === "vi" ? ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"] : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const tabs = `<div class="dv-tabs" role="tablist">${Object.keys(T("tabs")).map((k) => `<button type="button" role="tab" data-tab="${k}" aria-selected="${tab === k}">${esc(T("tabs")[k])}</button>`).join("")}</div>`;
    let body = "";
    if (tab === "plan") body = planTable(f, c, true);
    if (tab === "salt") {
      const mx = Math.max(1, ...[...Array(12)].map((_, m) => riverSalt(f.site, m, nino)));
      body = `<p class="dv-note">${esc(T("est"))}. ${esc(L(s.saltNote))}</p><p class="dv-note"><b>${lang() === "vi" ? "Trong ruộng = sông × " : "Field = river × "}${nf(RX.Model.kFor(RX.DATA.sites.find((x) => x.id === f.site)).k, 2)}</b> ${lang() === "vi" ? `(hiệu chỉnh bằng NASA MODIS: vệ tinh thấy ${nf(s.crops, 1)} vụ/năm, nên các vụ đó không bị mất mùa vì mặn năm thường). Tháng mặn mô hình dùng: ${(isNino(f) && s.el ? s.el.salt : s.salt).map((m) => "T" + m).join(", ")}.` : `(NASA MODIS calibration: the satellite sees ${nf(s.crops, 1)} crops a year, so those crops do not lose yield to salt in a typical year). Salt months the model uses: ${(isNino(f) && s.el ? s.el.salt : s.salt).join(", ")}.`}</p><div class="sb2">${[...Array(12)].map((_, m) => { const r = riverSalt(f.site, m, nino), g = fieldSalt(f.site, m, nino); return `<div class="sb2-c"><i class="r" style="height:${(r / mx * 100).toFixed(0)}%" title="${nf(r, 1)}‰"></i><i class="g ${level(g)}" style="height:${(g / mx * 100).toFixed(0)}%" title="${nf(g, 1)}‰"></i><span>${ms[m]}</span></div>` }).join("")}</div>
        <p class="sb2-k"><span><i class="r"></i>${esc(T("river"))}</span><span><i class="g lo"></i>${esc(T("field"))}</span> · ${lang() === "vi" ? "đơn vị" : "unit"} ‰ (g/L)</p>`;
    }
    if (tab === "money") body = `<ul class="dv-list">${rank(f).slice(0, 5).map(({ c: x, no }) => { const p = profit(x); return `<li class="${no ? "no" : ""}"><b>${esc(L(x.name))}</b><span>${p ? esc(T("range")(cong(p.lo), cong(p.mid), cong(p.hi))) : esc(T("noMoney"))}</span></li>` }).join("")}</ul><p class="dv-note">${esc(T("moneySrc"))}</p>`;
    if (tab === "soil") {
      const rain = (nino && s.el ? s.el.rain : s.rain).reduce((a, b) => a + b, 0);
      body = `<p class="dv-h3">${esc(T("scoreH"))}</p><div class="scb">${["salt", "water", "soil", "income"].map((k) => { const v = c.scores[k]; return `<div><span>${esc(T("sc")[k])}</span><i><b style="width:${v == null ? 0 : (v - 1) / 4 * 100}%"></b></i><em>${v == null ? "–" : nf(v, 1)}</em></div>` }).join("")}</div>
        <ul class="dv-facts"><li>🛰 ${esc(T("seen")(nf(s.crops, 1)))}</li><li>🌧 ${esc(T("rain")(Math.round(rain)))}</li><li>🧪 ${lang() === "vi" ? "Đất sét" : "Clay"} ${s.soil && s.soil.clay != null ? nf(s.soil.clay, 0) + "%" : "–"} (SoilGrids)</li></ul>`;
    }
    return `<section class="dv-card dv-adv-only">${tabs}<div class="dv-tabbody">${body}</div>
      <div class="dv-row"><button type="button" class="dv-btn" data-dv="mapfull">🗺 ${esc(T("mapFull"))}</button><button type="button" class="dv-btn" data-dv="lab">✏️ ${esc(T("lab"))}</button></div></section>`;
  }
  function rail(f) {
    const sz = f ? f.seasons : ["R", "R", "R"], opt = (k, v, cur, txt) => `<button type="button" data-opt="${k}" data-v="${v}" aria-pressed="${cur === v}">${esc(txt)}</button>`;
    if (!f) return "";
    return `<div class="dv-opts">
      <p class="dv-h3">${esc(T("optsH"))}</p>
      <div class="o-g"><span>${esc(T("seasons"))}</span>${[0, 1, 2].map((i) => `<div class="o-sz"><small>${esc(T("sz")[i])}</small><div class="dv-seg sm">${["R", "S", "U", "-"].map((v) => opt("sz" + i, v, sz[i], T("crop")[v])).join("")}</div></div>`).join("")}</div>
      <div class="o-g"><span>${esc(T("goal"))}</span><div class="dv-seg sm">${Object.keys(GOALS).map((g) => opt("goal", g, f.weights ? "" : f.goal, T("goals")[g])).join("")}</div></div>
      <div class="o-g"><span>${esc(T("people"))}</span><div class="dv-seg sm">${[0, 1, 2].map((v) => opt("wfP", String(v), String(f.wfP ?? 1), T("pv")[v])).join("")}</div></div>
      <div class="o-g"><span>${esc(T("machines"))}</span><div class="dv-seg sm">${[0, 1, 2].map((v) => opt("wfM", String(v), String(f.wfM ?? 0), T("mv")[v])).join("")}</div></div>
      <label class="o-chk"><input type="checkbox" data-opt="noBrackish" ${f.noBrackish ? "checked" : ""}> ${esc(T("brack"))}</label>
      <div class="o-g dv-adv-only"><span>${esc(T("year"))}</span><div class="dv-seg sm">${["typical", "elnino"].map((y) => opt("year", y, f.year || "elnino", T("years")[y])).join("")}</div></div>
      <label class="o-g"><span>${esc(T("size"))}</span><input type="text" inputmode="decimal" data-opt="size" value="${f.size ? nf(f.size, 2).replace(/[,.]?0+$/, "") : ""}" placeholder="1,5"></label>
      <label class="o-g"><span>${esc(T("name"))}</span><input type="text" data-opt="name" maxlength="30" value="${esc(f.name)}"></label>
      ${betterHTML(f)}
      <button type="button" class="dv-link danger" data-dv="del">${esc(T("del"))}</button></div>`;
  }
  function betterHTML(f) { const top = rank(f)[0]; return top && top.c.id !== f.rot && !top.no ? `<div class="dv-better"><p>${esc(T("better")(L(top.c.name)))}</p><button type="button" class="dv-btn gold" data-use="${top.c.id}">${esc(T("use"))}</button></div>` : "" }
  function dash() {
    const f = fieldSel();
    if (!f) return empty();
    curSite = f.site; curNino = isNino(f);
    const c = cardOf(f), s = siteOf(f.site), sl = saltLine(f), nino = isNino(f);
    const job = jobAt(c, CM); let nk = 1; while (nk < 12 && jobAt(c, (CM + nk) % 12) === job) nk++; const nm = (CM + nk) % 12, jobN = jobAt(c, nm), clash = clashOf(f, c);
    const mapSvg = areaMap(f.site);
    return `${chips()}
      <div class="dv-grid">
        <aside class="dv-rail${railOpen ? "" : " shut"}"><button type="button" class="dv-railt" data-dv="rail" aria-expanded="${railOpen}">${railOpen ? "⟨" : "⟩"}</button>${rail(f)}</aside>
        <div class="dv-center">
          <section class="dv-card dv-hero" data-dv="plan" role="button" tabindex="0">
            <p class="dv-kick">${esc(T("monthOn")(CM + 1))}</p>
            <h1 class="dv-job">${esc(job)}</h1>
            <p class="dv-nextj"><b>${esc(T("nextM")(nm + 1))}:</b> ${esc(jobN)}</p>
            <p class="dv-salt ${sl.lv}"><i class="dot ${sl.lv}" aria-hidden="true"></i><b>${esc(sl.txt)}</b><span class="dv-tag">${esc(nino ? (f.year ? T("years").elnino : T("thisYr") + " · El Niño") : T("years").typical)}</span></p>
            <p class="dv-clash ${clash.length ? "bad" : "ok"}">${clash.length ? esc(T("clash")(clash)) : esc(T("noClash"))}</p>
            <p class="dv-est">${esc(T("est"))}</p>
          </section>
          ${nino ? `<p class="dv-alert dv-adv-only">${esc(T("ninoNote"))}</p>` : ""}
          ${ribbon(f, c)}
          ${moneyLine(f, c)}
          ${advBlocks(f, c)}
          <p class="dv-foot"><a href="#" data-dv="info" data-it="src">${esc(T("info"))}</a> · <span>${esc(T("ask"))}</span></p>
          <div class="dv-bar"><button type="button" class="dv-btn" data-dv="paper">${esc(T("print"))}</button><button type="button" class="dv-btn gold" data-dv="choose">${esc(T("change"))}</button></div>
        </div>
        <aside class="dv-side"><div class="dv-card"><p class="dv-h3">${esc(short(s))} · ${esc(T("areaSalt")[areaLv(s.id)])}</p><div class="dv-mini">${mapSvg}</div><p class="dv-note">${esc(L(s.saltNote))}</p></div></aside>
      </div>`;
  }

  /* ---------------- plan page ---------------- */
  function planTable(f, c, compact) {
    const nino = isNino(f), ML = lang() === "vi" ? (i) => "Tháng " + (i + 1) : (i) => ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][i];
    const rows = [...Array(12)].map((_, k) => { const m = (CM + k) % 12, code = c.months[m], lv = level(fieldSalt(f.site, m, nino)), g = fieldSalt(f.site, m, nino);
      return `<tr class="${m === CM ? "now" : ""}" data-dvm="${m}" tabindex="0"><th scope="row">${esc(ML(m))}</th><td>${esc(cropName(c, code))}</td><td>${esc(jobAt(c, m))}</td><td><i class="dot ${lv}"></i>${esc(T("lv")[lv])}<span class="dv-adv-only"> ${nf(g, 1)}‰</span></td></tr>` }).join("");
    return `<table class="dv-table${compact ? " compact" : ""}"><thead><tr><th>${esc(T("tMonth"))}</th><th>${esc(T("tCrop"))}</th><th>${esc(T("tJob"))}</th><th>${esc(T("tSalt"))}</th></tr></thead><tbody>${rows}</tbody></table>`;
  }
  function planPage() {
    const f = fieldSel(); if (!f) return empty(); curSite = f.site; curNino = isNino(f);
    const c = cardOf(f), s = siteOf(f.site);
    return `<section class="dv-page"><div class="dv-ph"><button type="button" class="dv-btn ghost" data-dv="home">← ${esc(T("back"))}</button><div><p class="dv-kick">${esc(f.name)} · ${esc(short(s))}</p><h1>${esc(L(c.name))}</h1><p class="dv-note dv-adv-only">${esc(L(c.calendar))}</p></div></div>
      <p class="dv-note">${lang() === "vi" ? "Bấm vào một tháng để xem giống, phân bón và các bước." : "Tap a month to see seed, fertiliser and steps."}</p>
      ${planTable(f, c)}
      <p class="dv-est">${esc(T("est"))}</p><p class="dv-note">${esc(T("ask"))}</p></section>
      <div class="dv-bar one"><button type="button" class="dv-btn gold big" data-dv="paper">${esc(T("preview"))}</button></div>`;
  }
  function monthSheet(m) {
    const f = fieldSel(), c = cardOf(f), code = c.months[m], r = code === "-" ? null : DATA.resources[resKey(c, code)];
    const ML = lang() === "vi" ? "Tháng " + (m + 1) : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][m];
    sheet(`<h2>${esc(ML)}: ${esc(cropName(c, code))}</h2><p class="dv-job sm">${esc(jobAt(c, m))}</p>
      ${r ? `<dl class="dv-dl"><dt>${esc(T("seed"))}</dt><dd>${esc(L(r.seed))}</dd><dt>${esc(T("fert"))}</dt><dd>${esc(L(r.fertiliser))}</dd></dl><p class="dv-h3">${esc(T("steps"))}</p><ol class="dv-steps">${(r.steps || []).map((x) => `<li>${esc(L(x))}</li>`).join("")}</ol>` : ""}
      <p class="dv-salt ${level(fieldSalt(f.site, m, isNino(f)))}"><i class="dot ${level(fieldSalt(f.site, m, isNino(f)))}"></i>${esc(T("lv")[level(fieldSalt(f.site, m, isNino(f)))])}: ${esc(T("lvD")[level(fieldSalt(f.site, m, isNino(f)))])}</p><p class="dv-est">${esc(T("est"))}</p>
      <button type="button" class="dv-btn gold big" data-dv="close">${esc(T("close"))}</button>`);
  }
  /* A4 print view, saved as a printable file (the artifact frame cannot open the print dialog itself) */
  function paperHTML() {
    const f = fieldSel(), c = cardOf(f), s = siteOf(f.site), d = NOW.toLocaleDateString(lang() === "vi" ? "vi-VN" : "en-GB");
    return `<div class="paper"><header><p class="pp-k">${esc(T("brand"))} · Mekong Rotation Explorer</p><h1>${esc(f.name)}: ${esc(L(c.name))}</h1><p>${esc(L(s.name))} · ${esc(d)}${f.size ? ` · ${nf(f.size, 1)} ha` : ""}</p></header>
      ${planTable(f, c)}<p class="pp-salt">${esc(saltLine(f).txt)}. ${esc(T("est"))}.</p>
      <table class="pp-tick"><tr>${[...Array(12)].map((_, k) => `<td>${(CM + k) % 12 + 1}<br>☐</td>`).join("")}</tr></table>
      <footer><p>${lang() === "vi" ? "Dữ liệu: NASA GPM IMERG (mưa), NASA POWER (nhiệt độ, nhu cầu nước), NASA MODIS NDVI (số vụ), NOAA (El Niño), SoilGrids (đất). Độ mặn: ước tính từ báo cáo trạm đo công khai, không đo bằng vệ tinh." : "Data: NASA GPM IMERG (rain), NASA POWER (heat, water need), NASA MODIS NDVI (crop count), NOAA (El Niño), SoilGrids (soil). Salinity: estimate from public station reports, not satellite."}</p><p>${esc(T("ask"))}</p></footer></div>`;
  }
  const PAPER_CSS = `body{margin:0;background:#fff;color:#111;font:15px/1.45 "Be Vietnam Pro",Arial,sans-serif}.paper{max-width:780px;margin:0 auto;padding:28px}.paper h1{font:700 26px/1.2 "Source Serif 4",Georgia,serif;margin:4px 0}.pp-k{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#555;margin:0}.dv-table{width:100%;border-collapse:collapse;margin:14px 0}.dv-table th,.dv-table td{border:1px solid #999;padding:6px 8px;text-align:left;vertical-align:top}.dv-table thead th{background:#eee}.dv-table tr.now{background:#fff6cc}.dot{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:5px;border:1px solid #333}.dot.ngot{background:#fff}.dot.lo{background:repeating-linear-gradient(45deg,#333 0 2px,#fff 2px 4px)}.dot.man{background:#333}.dv-adv-only{display:none}.pp-tick{width:100%;border-collapse:collapse;text-align:center;font-size:13px}.pp-tick td{border:1px solid #999;padding:4px}footer{margin-top:16px;font-size:12px;color:#333;border-top:1px solid #999}@media print{.paper{padding:0}@page{size:A4;margin:14mm}}`;
  function paperSheet() {
    sheet(`<h2>${esc(T("preview"))}</h2><p class="dv-note">${esc(T("printHint"))}</p><div class="paper-wrap">${paperHTML()}</div>
      <div class="dv-row"><button type="button" class="dv-btn gold big" data-dv="savefile">${esc(T("save"))}</button><button type="button" class="dv-btn big" data-dv="doprint">${esc(T("doPrint"))}</button></div><p class="dv-note" id="dvSaveMsg" role="status"></p>`, true);
  }
  let dl = null; try { if (window.claude && claude.use) claude.use("downloads").then((x) => (dl = x)).catch(() => {}) } catch (e) {}
  async function saveFile() {
    const f = fieldSel(), name = (f.name || "ruong").replace(/[^\p{L}\p{N}]+/gu, "-") + "-ke-hoach.html";
    const html = `<!doctype html><html lang="${lang()}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(f.name)}</title><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;600;700&family=Source+Serif+4:opsz,wght@8..60,600;8..60,700&display=swap"><style>${PAPER_CSS}</style></head><body>${paperHTML()}<script>setTimeout(function(){try{print()}catch(e){}},700)<\/script></body></html>`;
    const msg = $("#dvSaveMsg");
    if (dl) { try { await dl.save({ filename: name, data: html }); if (msg) msg.textContent = T("saved"); return } catch (e) { if (e && e.code === "declined") return } }
    try { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([html], { type: "text/html" })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); if (msg) msg.textContent = T("saved") } catch (e) {}
  }

  /* ---------------- change plan sheet ---------------- */
  function chooseSheet() {
    const f = fieldSel(), r = rank(f).slice(0, 3);
    const best = r.find((x) => !x.no); sheet(`<h2>${esc(T("chooseH"))}</h2>${best && best.c.id !== f.rot ? `<p class="dv-better-l">${esc(T("bestFor")(L(best.c.name)))}</p>` : ""}<p class="dv-note">${esc(T("chooseP"))}</p>
      <div class="dv-opts-list">${r.map(({ c, s, no }) => `<div class="dv-optc${c.id === f.rot ? " cur" : ""}${no ? " no" : ""}"><div><b>${esc(L(c.name))}</b>${adv() ? `<small>${esc(L(c.calendar))}</small><span class="fitb">${esc(T("fit"))} ${nf(s, 1)}/5</span>${whyFit(c, f)}` : ""}</div>
        ${c.id === f.rot ? `<span class="dv-tag">${esc(T("current"))}</span>` : `<button type="button" class="dv-btn gold" data-use="${c.id}">${esc(T("pickB"))}</button>`}</div>`).join("")}</div>
      <button type="button" class="dv-btn big" data-dv="opts">${esc(T("editAns"))}</button>`);
  }
  function whyFit(c, f) {
    const w = weightsOf(f), ks = ["salt", "water", "soil", "income"].filter((k) => c.scores[k] != null), tw = ks.reduce((a, k) => a + w[k], 0), pen = c.upland ? PEN[f.wfP ?? 1][f.wfM ?? 0] : 0;
    const src = { salt: "station reports + NASA POWER", water: "NASA POWER + NASA GPM IMERG", soil: lang() === "vi" ? "lịch 12 tháng" : "12-month calendar", income: lang() === "vi" ? "lợi nhuận đã công bố" : "published profit" };
    return `<details class="dv-whyfit"><summary>${lang() === "vi" ? "Vì sao" : "Why"} ${nf(scoreOf(c, f), 1)}?</summary><pre class="dv-math">${esc(ks.map((k) => `${T("sc")[k].padEnd(15)} ${nf(c.scores[k], 1)} × ${w[k]}   (${src[k]})`).join("\n") + `\n= ${nf(ks.reduce((a, k) => a + w[k] * c.scores[k], 0), 1)} ÷ ${tw}${pen ? " − " + nf(pen, 1) : ""} = ${nf(scoreOf(c, f), 2)}`)}</pre></details>`;
  }
  function optsSheet() { sheet(rail(fieldSel())) }

  /* ---------------- wizard ---------------- */
  function wizard() {
    const n = 4, d = draft;
    const prog = `<div class="dv-prog" aria-label="${esc(T("step")(wstep + 1, n))}"><div>${[...Array(n)].map((_, i) => `<i class="${i <= wstep ? "on" : ""}"></i>`).join("")}</div><span>${esc(T("step")(wstep + 1, n))}</span></div>`;
    let body = "", canNext = true;
    if (wstep === 0) {
      canNext = !!d.site;
      body = `<p class="dv-note">${esc(T("w1p"))}</p><div class="dv-wmap">${areaMap(d.site, { levels: true })}</div>
        ${d.site ? `<p class="dv-picked"><i class="dot ${lvDot(areaLv(d.site))}"></i><b>${esc(short(siteOf(d.site)))}</b> · ${esc(T("areaSalt")[areaLv(d.site)])}</p>` : ""}`;
    }
    if (wstep === 1) {
      body = `<p class="dv-note">${esc(T("w2p"))}</p><p class="dv-big">${d.seasons.map((x) => `<span>${esc(T("crop")[x])}</span>`).join(" – ")}</p>
        ${fixing ? `<div class="dv-opts">${[0, 1, 2].map((i) => `<div class="o-sz"><small>${esc(T("sz")[i])}</small><div class="dv-seg">${["R", "S", "U", "-"].map((v) => `<button type="button" data-wsz="${i}" data-v="${v}" aria-pressed="${d.seasons[i] === v}">${esc(T("crop")[v])}</button>`).join("")}</div></div>`).join("")}</div>`
        : `<div class="dv-row"><button type="button" class="dv-btn gold big" data-wnext="1">${esc(T("right"))}</button><button type="button" class="dv-btn big" data-dv="wfix">${esc(T("fix"))}</button></div>`}`;
      canNext = fixing;
    }
    if (wstep === 2) {
      canNext = !!d.goal;
      body = `<p class="dv-note">${esc(T("w3p"))}</p><div class="dv-tiles g3">${Object.keys(GOALS).map((g) => `<button type="button" class="dv-tile big" data-wgoal="${g}" aria-pressed="${d.goal === g}"><b>${esc(T("goals")[g])}</b><small>${esc(T("goalD")[g])}</small></button>`).join("")}</div>`;
    }
    if (wstep === 3) {
      const r = rank(d), top = r[0], c = top.c;
      d.rot = d.rot || c.id; const pick = r.find((x) => x.c.id === d.rot) || top;
      body = `<p class="dv-note">${esc(T("w4p"))}</p>
        <div class="dv-card dv-res"><h2>${esc(L(pick.c.name))}</h2><p class="dv-note">${esc(L(pick.c.calendar))}</p>
        <ol class="rb small">${[...Array(12)].map((_, i) => { const code = pick.c.months[i]; return `<li class="${code[0] === "-" ? "rest" : code[0]}"><span class="ic">${esc(T("cropS")[code[0]] || T("cropS")["-"])}</span><span class="mo">${i + 1}</span><i class="sb ${level(fieldSalt(d.site, i, true))}"></i></li>` }).join("")}</ol>
        <p class="dv-why"><b>${esc(T("why"))}:</b> ${esc(L((pick.c.benefits || [])[0]))}</p><span class="fitb">${esc(T("fit"))} ${nf(pick.s, 1)}/5</span></div>
        <details class="dv-others"><summary>${esc(T("others"))}</summary>${r.slice(0, 3).filter((x) => x.c.id !== pick.c.id).map((x) => `<button type="button" class="dv-optc" data-wrot="${x.c.id}"><b>${esc(L(x.c.name))}</b><small>${esc(T("fit"))} ${nf(x.s, 1)}/5</small></button>`).join("")}</details>
        <label class="o-g"><span>${esc(T("name"))}</span><input type="text" id="dvWName" maxlength="30" value="${esc(d.name)}"></label>`;
    }
    return `<section class="dv-wiz"><div class="dv-ph"><button type="button" class="dv-btn ghost" data-dv="wback">← ${esc(T("back"))}</button>${prog}</div>
      <h1>${esc(T("wiz")[wstep])}</h1>${body}</section>
      <div class="dv-bar one">${!canNext && (wstep === 0 || wstep === 2) ? `<p class="dv-hint">${esc(T(wstep === 0 ? "pickFirst" : "pickGoal"))}</p>` : ""}<button type="button" class="dv-btn gold big" data-wnext="1" ${canNext ? "" : "disabled"}>${esc(wstep === 3 ? T("saveB") : T("nextB"))} →</button></div>`;
  }
  function startWizard() { draft = { id: "f" + Date.now(), name: T("fieldN")(st.fields.length + 1), site: null, seasons: ["R", "R", "R"], size: null, wfP: 1, wfM: 0, noBrackish: false, goal: null, rot: null, crop: null, year: null }; wstep = 0; fixing = false; go("wiz") }
  function wNext() {
    if (wstep === 3) { const nm = $("#dvWName"); draft.name = (nm && nm.value.trim()) || draft.name; draft.savedAt = Date.now(); st.fields.push(draft); st.sel = draft.id; save(); draft = null; go("dash"); return }
    if (wstep === 0 && !draft.site) return; if (wstep === 2 && !draft.goal) return;
    wstep++; fixing = false; if (wstep === 3) draft.rot = null; render(); focusTop();
  }

  /* ---------------- sources + how we calculate ---------------- */
  let infoTab = "src";
  function infoPage() {
    const tabs = "";   /* About tab removed (owner, 14 Nov): the model and formulas live in the model doc */
    return `<section class="dv-page"><div class="dv-ph"><button type="button" class="dv-btn ghost" data-dv="home">← ${esc(T("back"))}</button><h1>${esc(T("info"))}</h1></div>${tabs}<ul class="dv-sum">${(lang() === "vi" ? [["Mưa", "vệ tinh NASA (GPM IMERG)"], ["Nắng nóng, nước cây cần", "NASA POWER"], ["Số vụ lúa mỗi năm", "vệ tinh NASA MODIS"], ["Độ mặn", "ước tính từ báo cáo trạm đo, không đo bằng vệ tinh"], ["Năm hạn mặn (El Niño)", "NOAA (Mỹ)"], ["Lãi, giống, phân bón", "báo cáo nhà nước, trường đại học, báo chí"]] : [["Rain", "NASA satellite (GPM IMERG)"], ["Heat, crop water need", "NASA POWER"], ["Crops per year", "NASA MODIS satellite"], ["Salt", "estimate from station reports, not satellite"], ["Drought-and-salt years (El Niño)", "NOAA (USA)"], ["Profit, seed, fertiliser", "government, university and press reports"]]).map(([k, v]) => `<li><b>${esc(k)}</b><span>${esc(v)}</span></li>`).join("")}</ul>
      <details class="dv-allsrc"${adv() ? " open" : ""}><summary>${lang() === "vi" ? `Xem đủ ${DATA.sources.length} nguồn` : `See all ${DATA.sources.length} sources`}</summary>${srcList()}</details></section>`;
  }
  function srcList() {
    const all = DATA.sources.map((s, i) => ({ s, i })), salt = new Set(DATA.salt_src || []);
    const nasa = all.filter((x) => /NASA|MODIS|GPM|POWER|AppEEARS|Earthdata/i.test(x.s.title) && !salt.has(x.i));
    const sal = all.filter((x) => salt.has(x.i));
    const money = all.filter((x) => !nasa.includes(x) && !sal.includes(x) && /lợi nhuận|profit|cost|chi phí|giống|phân|seed|fertil|khuyến nông|extension|shrimp|tôm|rice|lúa|price|giá/i.test(x.s.title));
    const other = all.filter((x) => !nasa.includes(x) && !sal.includes(x) && !money.includes(x));
    const grp = (h, xs, tag) => xs.length ? `<h2 class="dv-h2">${esc(h)} <small>(${xs.length})</small></h2><ol class="dv-src">${xs.map(({ s, i }) => `<li id="dsrc-${i + 1}"><span class="n">${i + 1}</span><div><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>${tag ? `<span class="dv-tag">${esc(tag)}</span>` : ""}${s.verified ? `<span class="dv-ok">✓ ${esc(T("verified"))}</span>` : ""}</div></li>`).join("")}</ol>` : "";
    return grp(T("nasaG"), nasa) + grp(T("saltG"), sal, T("estTag")) + grp(T("moneyG"), money) + grp(T("otherG"), other);
  }
  function mathPage() {
    const f = fieldSel() || { site: sites()[0].id, rot: "rice3", goal: "salt", wfP: 1, wfM: 0 };
    const vi = lang() === "vi", s = siteOf(f.site), t = RX.DATA.sites.find((x) => x.id === f.site) || RX.DATA.sites[0];
    const c = cardOf(f), rc = t.cards.find((x) => x.id === c.id) || t.cards[0];
    let pr = null; try { pr = RX.Model.predict(rc, t.id) } catch (e) {}
    const k = RX.Model.kFor(t).k, P = t.peak || 0, Pn = (t.nino && t.nino.peak) || P, g = P * k, gn = Pn * k;
    const ec = (x) => (x <= 3.2 ? x / 0.64 : x / 0.8), loss = (x) => Math.min(100, Math.max(0, 12 * (ec(x) - 3)));
    const w = weightsOf(f), ks = ["salt", "water", "soil", "income"].filter((x) => c.scores[x] != null), tw = ks.reduce((a, x) => a + w[x], 0);
    const pen = c.upland ? PEN[f.wfP ?? 1][f.wfM ?? 0] : 0, match = Math.max(1, ks.reduce((a, x) => a + w[x] * c.scores[x], 0) / tw - pen);
    const step = (n, h, plain, math) => `<section class="dv-card dv-step"><p class="dv-kick">${vi ? "Bước" : "Step"} ${n}</p><h2>${esc(h)}</h2><p>${plain}</p>${math ? `<pre class="dv-math">${esc(math)}</pre>` : ""}</section>`;
    const sm = t.salt.map((m) => (vi ? "T" : "") + m).join(", ");
    return `<section class="dv-card dv-about"><h2>${vi ? "App này làm gì" : "What this app does"}</h2><p>${vi ? "Giúp nông dân ven biển Sóc Trăng chọn lịch trồng 12 tháng khi nước mặn lấn sâu. App ước tính độ mặn trong ruộng từng tháng, tính phần lúa có thể mất, rồi xếp hạng 5 phương án theo điều bạn coi trọng." : "Helps coastal Sóc Trăng farmers choose a 12-month crop plan as salt water moves inland. It estimates field salt each month, works out how much rice could be lost, then ranks 5 plans by what you care about."}</p>
      <h3 class="dv-h3">${vi ? "Mô hình gồm 6 bước" : "The model in 6 steps"}</h3><ol class="dv-steps"><li>${vi ? "Mặn trên sông mỗi tháng (trạm đo)" : "River salt each month (station)"}</li><li>${vi ? "Mặn trong ruộng (hiệu chỉnh bằng vệ tinh NASA MODIS)" : "Field salt (calibrated with NASA MODIS)"}</li><li>${vi ? "Đổi sang đơn vị FAO (dS/m)" : "Convert to the FAO unit (dS/m)"}</li><li>${vi ? "Phần mùa vụ mất (quy tắc FAO)" : "Crop loss (FAO rule)"}</li><li>${vi ? "Bốn điểm: mặn, nước, đất, thu nhập" : "Four scores: salt, water, soil, income"}</li><li>${vi ? "Độ hợp với bạn" : "Fit for you"}</li></ol>
      <p class="dv-note">${vi ? "Độ mặn không đo bằng vệ tinh: luôn là ước tính từ báo cáo trạm đo công khai. Mưa: NASA GPM IMERG. Nhiệt độ, nhu cầu nước: NASA POWER. Số vụ: NASA MODIS NDVI. El Niño: NOAA." : "Salt is never measured by satellite: always an estimate from public station reports. Rain: NASA GPM IMERG. Heat, water need: NASA POWER. Crop count: NASA MODIS NDVI. El Niño: NOAA."}</p></section>
      <p class="dv-note">${vi ? `Ví dụ tính cho <b>${esc(f.name || short(s))}</b> (${esc(short(s))}), phương án <b>${esc(L(c.name))}</b>. Đây là đúng công thức app dùng.` : `Worked for <b>${esc(f.name || short(s))}</b> (${esc(short(s))}), plan <b>${esc(L(c.name))}</b>. These are the exact formulas the app uses.`}</p>
      ${step(1, vi ? "Mặn trên sông mỗi tháng" : "River salt each month", vi ? `Trạm đo gần nhất: đỉnh mặn trung bình <b>${nf(P, 1)}‰</b> năm thường, <b>${nf(Pn, 1)}‰</b> năm El Niño. Tháng mặn: ${esc(sm)}. Tháng giữa lấy đỉnh, tháng đầu và cuối lấy một nửa (ước tính của nhóm). <i>Ước tính từ báo cáo công khai, không đo bằng vệ tinh.</i>` : `Nearest station: average peak <b>${nf(P, 1)}‰</b> typical, <b>${nf(Pn, 1)}‰</b> El Niño. Salt months: ${esc(sm)}. Middle months get the peak, first and last get half (team estimate). <i>Estimate from public reports, not satellite.</i>`, `S_river(month) = P  (middle salt months)\n               = P/2 (first, last)\n               = 0   (other months)`)}
      ${step(2, vi ? "Mặn trong ruộng (hiệu chỉnh bằng vệ tinh)" : "Salt in the field (satellite calibration)", vi ? `NASA MODIS thấy khoảng <b>${nf(t.crops || 0, 1)} vụ/năm</b>. Những vụ đó không thể bị mất mùa vì mặn năm thường, nên nước trong ruộng chỉ mặn bằng <b>${Math.round(k * 100)}%</b> nước sông.${t.level === "low" ? " Vùng này có cống ngăn mặn: tính là ngọt." : ""}` : `NASA MODIS sees about <b>${nf(t.crops || 0, 1)} crops a year</b>. Those crops cannot be losing yield to salt in a typical year, so field water is <b>${Math.round(k * 100)}%</b> as salty as the river.${t.level === "low" ? " This area is sluice-protected: counted as fresh." : ""}`, `k = min(1, 1.92 ÷ highest river salt in the seen crops' months) = ${nf(k, 2)}\nfield peak = ${nf(P, 1)} × ${nf(k, 2)} = ${nf(g, 2)}‰   (El Niño: ${nf(gn, 2)}‰)`)}
      ${step(3, vi ? "Đổi sang đơn vị FAO" : "Convert to the FAO unit", vi ? "FAO đo độ mặn bằng dS/m." : "FAO measures salt in dS/m.", `EC = ‰ ÷ 0.64 (up to 3.2‰), ÷ 0.80 above\n${nf(g, 2)}‰ → ${nf(ec(g), 2)} dS/m   (El Niño: ${nf(ec(gn), 2)} dS/m)`)}
      ${step(4, vi ? "Lúa mất bao nhiêu" : "How much rice is lost", vi ? "Quy tắc FAO (Maas–Hoffman): lúa bắt đầu mất mùa trên 3,0 dS/m, mỗi 1 dS/m thêm mất 12%. Lấy tháng tệ nhất của mỗi vụ." : "FAO rule (Maas–Hoffman): rice starts losing above 3.0 dS/m, 12% more for each extra dS/m. Each crop's worst month counts.", `loss = min(100, max(0, 12 × (EC − 3.0)))\npeak month: ${nf(loss(g), 0)}% typical, ${nf(loss(gn), 0)}% El Niño${pr ? `\naverage over this plan's crops: ${Math.round(pr.typ)}% typical, ${Math.round(pr.nino)}% El Niño\nmixed by NOAA's 83% chance: 0.83 × ${Math.round(pr.nino)} + 0.17 × ${Math.round(pr.typ)} = ${Math.round(pr.blend)}%` : ""}`)}
      ${step(5, vi ? "Bốn điểm của phương án" : "The plan's four scores", vi ? "Mỗi điểm từ 1,0 đến 5,0. Công thức đầy đủ ở README dự án." : "Each from 1.0 to 5.0. Full formulas in the project README.", ks.map((x) => `${T("sc")[x].padEnd(16)} ${nf(c.scores[x], 1)}`).join("\n") + `\n\nSalt  = 0.6×salt + 0.2×heat + 0.2×canal water, each = 1 + 4×(1 − risk)\nWater = 1 + 4 × share of 3-rice canal water saved   (NASA POWER, GPM)\nSoil  = 1 + rest + non-rice + legume + cover − brackish\nIncome= 3 + 2 × log2(profit ÷ profit of 3 rice), kept in 1–5`)}
      ${step(6, vi ? "Độ hợp với bạn" : "Fit for you", vi ? "Điều bạn chọn quan trọng nhất được tính nặng hơn." + (pen ? ` Cây màu trừ ${nf(pen, 1)} vì nhà ít người, không có máy.` : "") : "What you picked as most important counts more." + (pen ? ` Upland crops lose ${nf(pen, 1)}: few people, no machines.` : ""), `fit = Σ(weight × score) ÷ Σ weight${pen ? " − " + nf(pen, 1) : ""}\n    = (${ks.map((x) => w[x] + "×" + nf(c.scores[x], 1)).join(" + ")}) ÷ ${tw}${pen ? " − " + nf(pen, 1) : ""}\n    = ${nf(match, 2)}`)}
      <p class="dv-note">${vi ? "Hằng số chưa có số liệu đo (hình dạng mặn theo tháng, mức trừ nước lợ, phần mất năm El Niño) là ước tính của nhóm và làm giảm độ tin cậy." : "Constants without a measured source (salt shape by month, brackish penalty, El Niño loss shares) are team estimates and lower the confidence."}</p>`;
  }

  /* ---------------- sheet, routing, render ---------------- */
  function sheet(html, wide) { const sh = $("#dvSheet"); $("#dvShBody").innerHTML = html; sh.classList.toggle("wide", !!wide); sh.hidden = false; requestAnimationFrame(() => sh.classList.add("on")); const b = $("#dvShBody button, #dvShBody a"); if (b) b.focus({ preventScroll: true }) }
  function closeSheet() { const sh = $("#dvSheet"); sh.classList.remove("on"); setTimeout(() => (sh.hidden = true), 220) }
  function go(v) { view = v; closeSheet(); render(); focusTop() }
  const focusTop = () => { const m = $("#dvMain"); if (m) m.scrollTop = 0; window.scrollTo(0, 0) };
  function render() {
    if (!$("#dv")) return; head();
    $("#dvMain").innerHTML = view === "wiz" ? wizard() : view === "plan" ? planPage() : view === "info" ? infoPage() : dash();
    document.body.dataset.dv = view;
  }
  function mapFull(lab) {
    const f = fieldSel(); document.body.classList.add("dv-off"); $("#dvBack").hidden = false;
    try { if (window.MapView && MapView.resize) setTimeout(() => MapView.resize(), 60) } catch (e) {}
    if (f) { const i = sites().findIndex((s) => s.id === f.site), p = $$("path.sg-area")[i]; if (p) setTimeout(() => p.dispatchEvent(new MouseEvent("click", { bubbles: true })), 150) }
    if (lab && window.App && App.go) setTimeout(() => App.go("lab"), 500);
  }
  function backFromMap() { document.body.classList.remove("dv-off"); $("#dvBack").hidden = true; render() }
  function setOpt(k, v) {
    const f = fieldSel(); if (!f) return;
    if (k.startsWith("sz")) f.seasons[+k.slice(2)] = v;
    else if (k === "goal") { f.goal = v; f.weights = null }
    else if (k === "wfP" || k === "wfM") f[k] = +v;
    else if (k === "year") f.year = v;
    else if (k === "noBrackish") f.noBrackish = !!v;
    else if (k === "size") { const n = parseFloat(String(v).replace(",", ".")); f.size = n > 0 && n < 1000 ? n : null }
    else if (k === "name") f.name = String(v).trim() || f.name;
    save();
  }

  document.addEventListener("click", (e) => {
    if (!e.target.closest("#dv")) return;
    const a = e.target.closest("[data-dv],[data-dvf],[data-dvui],[data-dl],[data-use],[data-tab],[data-it],[data-opt],[data-wsite],[data-wsz],[data-wgoal],[data-wrot],[data-wnext],[data-dvm],.mp[data-site]");
    if (!a) return;
    const d = a.dataset;
    if (a.matches("input")) return;
    if (d.dv || a.tagName === "A") e.preventDefault();
    if (d.dl) { const b = document.getElementById(d.dl === "vi" ? "lVi" : "lEn"); if (b) b.click(); setTimeout(render, 30); return }
    if (d.dvui) return setUI(d.dvui);
    if (d.dvf) { st.sel = d.dvf; save(); return render() }
    if (d.use) { const f = fieldSel(); f.rot = d.use; f.savedAt = Date.now(); save(); closeSheet(); return render() }
    if (d.tab) { tab = d.tab; return render() }
    if (d.it && !d.dv) { infoTab = d.it; return render() }
    if (d.opt) { setOpt(d.opt, d.v); const inSheet = !!a.closest("#dvSheet"); render(); if (inSheet) optsSheet(); return }
    if (d.dvm != null && a.closest(".dv-table") && !a.closest(".paper")) return monthSheet(+d.dvm);
    if (a.matches(".mp[data-site]") && view === "wiz") { draft.site = a.dataset.site; draft.seasons = guessSeasons(siteOf(draft.site)); return render() }
    if (d.wsite && view !== "wiz") return;
    if (d.wsite) { draft.site = d.wsite; draft.seasons = guessSeasons(siteOf(draft.site)); return render() }
    if (d.wsz) { draft.seasons[+d.wsz] = d.v; return render() }
    if (d.wgoal) { draft.goal = d.wgoal; return render() }
    if (d.wrot) { draft.rot = d.wrot; return render() }
    if (d.wnext) return wNext();
    switch (d.dv) {
      case "home": return go("dash");
      case "wiz": return startWizard();
      case "plan": return go("plan");
      case "info": infoTab = "src"; return go("info");
      case "paper": return paperSheet();
      case "choose": return chooseSheet();
      case "opts": return optsSheet();
      case "close": return closeSheet();
      case "rail": railOpen = !railOpen; return render();
      case "savefile": return saveFile();
      case "doprint": { const w = document.createElement("iframe"); w.style.cssText = "position:fixed;width:0;height:0;border:0"; document.body.appendChild(w); w.srcdoc = `<html><head><meta charset="utf-8"><style>${PAPER_CSS}</style></head><body>${paperHTML()}</body></html>`; w.onload = () => { try { w.contentWindow.print() } catch (er) { saveFile() } setTimeout(() => w.remove(), 4000) }; return }
      case "wfix": fixing = true; return render();
      case "wback": if (wstep === 0) { draft = null; return go("dash") } wstep--; fixing = false; return render();
      case "mapfull": return mapFull(false);
      case "lab": return mapFull(true);
      case "del": { const f = fieldSel(); if (f && confirm(T("delQ"))) { st.fields = st.fields.filter((x) => x.id !== f.id); st.sel = st.fields[0] ? st.fields[0].id : null; save(); closeSheet(); render() } return }
    }
  });
  document.addEventListener("change", (e) => { const i = e.target.closest("#dv [data-opt]"); if (!i) return; setOpt(i.dataset.opt, i.type === "checkbox" ? i.checked : i.value); const inSheet = !!i.closest("#dvSheet"); render(); if (inSheet) optsSheet() });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !$("#dvSheet").hidden) return closeSheet();
    if ((e.key === "Enter" || e.key === " ") && e.target.matches && e.target.matches("#dv .dv-hero, #dv tr[data-dvm]")) { e.preventDefault(); e.target.click() }
  });
  document.addEventListener("click", (e) => { if (e.target.closest("#dvBack")) backFromMap() });

  function init() {
    /* the old app opens its own dialog for #sources/#about links; while the dashboard is showing, close it */
    const md = document.getElementById("modal");
    if (md) new MutationObserver(() => { if (md.open && !document.body.classList.contains("dv-off")) { try { md.close() } catch (e) {} document.body.classList.remove("modal-open") } }).observe(md, { attributes: true, attributeFilter: ["open"] });
    if (md && md.open) { try { md.close() } catch (e) {} }
    shell(); document.body.classList.add("dv-on"); setUI(st.ui || "simple");
    const h = location.hash.slice(1);
    if (h === "plan-lab") mapFull(true);
    else if (h === "plan" && fieldSel()) go("plan");
    else if (h === "about" || h === "sources") { infoTab = "src"; go("info") }
    else if (h === "add") startWizard();
    else if (h === "change" && fieldSel()) chooseSheet();
    else if (h === "paper" && fieldSel()) paperSheet();
  }
  return { init, render, get state() { return st } };
})();
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(Dash.init, 0)); else setTimeout(Dash.init, 0);
