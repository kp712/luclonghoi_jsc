/* dash.js: "Ruộng của tôi" — the dashboard of saved fields, drawn as a glass panel over the satellite map
   (same look as the area panel, side.js). "Thêm ruộng" opens the map flow (app.js steps 1–4); the plan chosen
   there is saved back here with "Lưu vào Ruộng của tôi". Reads DATA, RX.Model, MapView, window.App. */
const Dash = (() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (x) => String(x == null ? "" : x).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const KEY = "mre-farm";
  const get = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d } catch (e) { return d } };
  const put = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch (e) {} };
  const lang = () => (window.App && App.lang && App.lang()) || "vi";
  const L = (o) => (o == null ? "" : typeof o === "string" ? o : o[lang()] || o.vi || o.en || "");
  const nf = (x, d = 0) => { const s = (+x).toFixed(d); return lang() === "vi" ? s.replace(".", ",") : s };
  const CM = new Date().getMonth();

  /* ---------------- words ---------------- */
  const W = {
    vi: {
      modeL: "Chế độ", addShort: "Thêm ruộng", welcome: "Chào mừng! Hãy tạo ruộng đầu tiên", welcomeP: "Bạn chưa có ruộng nào. Tạo ruộng để xem lịch làm, nước mặn và tiền lãi của ruộng mình.",
      wsteps: ["Chọn khu vực của bạn trên bản đồ", "Trả lời vài câu về ruộng", "Chọn cách trồng và lưu lại"], create: "Tạo ruộng",
      waterNow: "Nước trong ruộng tháng này", perCong: "triệu đồng mỗi công mỗi năm", perCongS: "tr/công", tapPlanS: "Kế hoạch 12 tháng", ninoShort: "Năm nay có thể hạn mặn (El Niño). Mặn có thể đến sớm hơn.",
      saltNowA: "Độ mặn trong ruộng, tháng này", chartH: "Mặn và mưa trong 12 tháng", chartL: "Biểu đồ độ mặn và lượng mưa theo tháng", rainM: "Mưa", safeH: "Tháng có cây trồng an toàn mặn", safeL: "tháng",
      nums: "Số liệu khu vực", cropsY: "Vụ/năm thấy từ vệ tinh", rainY: "Mưa cả năm", needY: "Cây cần nước cả năm", kL: "hệ số sông → ruộng", rankH: "Cách trồng hợp nhất", rankSrc: "Điểm 1–5 theo câu trả lời của bạn", ninoH: "El Niño năm nay",
      eyebrow: "Bờ biển Sóc Trăng · dữ liệu NASA", brand: "Ruộng của tôi", lead: "Các ruộng bạn đã lập kế hoạch. Chạm vào một ruộng để xem lại kế hoạch đã chọn.",
      add: "Thêm ruộng trên bản đồ", emptyP: "Chọn khu vực trên bản đồ, trả lời vài câu, rồi chọn cách luân canh. Kế hoạch sẽ được lưu ở đây.",
      simple: "Đơn giản", adv: "Nâng cao", monthOn: (m) => `Tháng ${m} trên ruộng của bạn`, nextM: (m) => `Tháng ${m}`,
      saltIn: (a, b) => `Nước mặn từ tháng ${a} đến khoảng tháng ${b}`, saltNow: (lv, m) => `Nước đang ${lv}, đến khoảng tháng ${m}`, saltNone: "Ruộng không bị mặn trong năm (có cống ngăn mặn)",
      est: "Độ mặn là ước tính từ báo cáo trạm đo, không đo bằng vệ tinh", ribbonH: "Lịch 12 tháng", tapPlan: "Xem bảng kế hoạch 12 tháng",
      lv: { ngot: "Ngọt", lo: "Hơi mặn", man: "Mặn" }, lvL: { ngot: "ngọt", lo: "hơi mặn", man: "mặn" },
      lvD: { ngot: "dưới 1‰: lúa an toàn", lo: "1–2‰: lúa bắt đầu yếu", man: "trên 2‰: lúa giảm năng suất (FAO)" },
      clash: (xs) => `Chú ý: lúa gặp nước mặn ở ${xs.join(", ")}. Đo độ mặn trước khi sạ, nước còn mặn thì chờ mưa.`, noClash: "Tốt: lịch này tránh được tháng nước mặn",
      ninoNote: "Năm nay nhiều khả năng là năm hạn mặn (El Niño, NOAA dự báo trên 83%). Mặn có thể đến sớm hơn và mặn hơn.", thisYr: "Năm nay", years: { typical: "Năm thường", elnino: "Năm El Niño" },
      moneyH: "Tiền lãi ước tính", money: (a, b) => `Năm nay khoảng <b>${b}</b> triệu/công. Năm bình thường: ${a} triệu/công.`, money1: (a) => `Khoảng <b>${a}</b> triệu/công mỗi năm.`,
      tot: (h, v) => `Cả ruộng ${h} ha: khoảng ${v} triệu.`, noMoney: "Chưa đủ số liệu lợi nhuận cho cách trồng này", moneySrc: "Trung vị lợi nhuận đã công bố 2018–2026 · 1 công = 1.000 m²",
      whyH: "Vì sao chọn cách này", riskH: "Cần lưu ý", scoreH: "Điểm của cách trồng (1–5)", sc: { salt: "An toàn mặn", water: "Tiết kiệm nước", soil: "Tốt cho đất", income: "Thu nhập" },
      print: "In / lưu file", change: "Đổi cách trồng", editMap: "Sửa trên bản đồ", sources: "Nguồn dữ liệu NASA", back: "Quay lại", close: "Đóng",
      crop: { R: "Lúa", S: "Tôm", U: "Cây màu", "-": "Nghỉ" },
      job: { restA: "Cho ruộng nghỉ, dọn rơm rạ", rest: "Ruộng nghỉ, chuẩn bị vụ sau", R0: (n) => `Làm đất, gieo sạ ${n}`, R1: (n) => `Thu hoạch ${n}`, R: (n) => `Chăm ${n}: bón phân, giữ nước`,
        S0: "Cải tạo ao, thả giống tôm", S1: "Thu hoạch tôm", S: "Chăm tôm: giữ mực nước, đo độ mặn", U0: (n) => `Làm luống, gieo ${n}`, U1: (n) => `Thu hoạch ${n}`, U: (n) => `Chăm ${n}: tưới, bón phân` },
      sowWait: (n) => `Đo độ mặn trước khi sạ ${n}. Nước còn mặn thì chờ mưa rửa mặn.`,
      tMonth: "Tháng", tJob: "Việc chính", tSalt: "Nước", seed: "Giống", fert: "Phân bón", steps: "Các bước chính", tapMonth: "Chạm vào một tháng để xem giống, phân bón và các bước.",
      preview: "Bản in", save: "Lưu file", doPrint: "In", printHint: "Bản in khổ A4. Lưu file rồi mở để in hoặc lưu PDF.", saved: "Đã lưu",
      ask: "Hỏi cán bộ khuyến nông trước khi đổi cách canh tác.", chooseH: "Đổi cách trồng", chooseP: "Các cách trồng xếp theo độ hợp với ruộng của bạn:", bestFor: (n) => `Hợp nhất với ruộng bạn: ${n}`,
      use: "Dùng cách này", current: "Đang dùng", fit: "Hợp", optsH: "Câu trả lời về ruộng", editAns: "Sửa câu trả lời",
      seasons: "Ba vụ trong năm", sz: ["Vụ Đông Xuân (T11–T2)", "Vụ Hè Thu (T4–T7)", "Vụ Thu Đông (T8–T10)"],
      people: "Người làm trong nhà", machines: "Máy móc", pv: ["Ít", "Vừa", "Nhiều"], mv: ["Không có", "Thuê được", "Có sẵn"], brack: "Ruộng không lấy được nước lợ",
      goal: "Điều quan trọng nhất", goals: { salt: "Tránh mặn", profit: "Lãi nhiều", water: "Ít nước" }, year: "Tính theo", size: "Diện tích (ha)", name: "Tên ruộng",
      better: (n) => `Với câu trả lời mới, cách trồng hợp hơn: ${n}`, del: "Xoá ruộng", delQ: "Xoá ruộng này?", fieldN: (i) => `Ruộng ${i}`,
      saveField: "Lưu vào Ruộng của tôi", updField: "Cập nhật ruộng này", savedT: "Đã lưu vào Ruộng của tôi", toDash: "Ruộng của tôi",
      tabs: { salt: "Mặn", money: "Tiền", soil: "Đất & nước" }, river: "Sông (trạm đo)", field: "Trong ruộng (ước tính)",
      seen: (n) => `Vệ tinh NASA MODIS thấy khoảng ${n} vụ/năm`, rain: (n) => `Mưa cả năm khoảng ${n} mm (NASA GPM IMERG)`, clay: "Đất sét", range: (a, b, c) => `${a}–${c} triệu/công (giữa ${b})`,
      areaSalt: { high: "Mặn cao", medium: "Mặn vừa", low: "Mặn thấp" }, conf: "Độ tin cậy", confL: { high: "cao", medium: "vừa", low: "thấp" },
      scSrc: "Nước: NASA POWER + GPM IMERG · Mặn: trạm đo + NASA POWER · Thu nhập: lợi nhuận đã công bố", why: "Vì sao"
    },
    en: {
      modeL: "Mode", addShort: "Add field", welcome: "Welcome! Please create your first field", welcomeP: "You have no fields yet. Create one to see your jobs, salty water and profit for your field.",
      wsteps: ["Pick your area on the map", "Answer a few questions about the field", "Choose a plan and save it"], create: "Create a field",
      waterNow: "Water in your field this month", perCong: "million ₫ per công per year", perCongS: "M₫/công", tapPlanS: "12-month plan", ninoShort: "This may be a drought-and-salt year (El Niño). Salt may come earlier.",
      saltNowA: "Salt in the field, this month", chartH: "Salt and rain over 12 months", chartL: "Chart of salt and rain by month", rainM: "Rain", safeH: "Crop months safe from salt", safeL: "months",
      nums: "Area numbers", cropsY: "Crops/year seen by satellite", rainY: "Rain in a year", needY: "Crop water need in a year", kL: "river → field factor", rankH: "Best-fitting plans", rankSrc: "Scores 1–5 from your answers", ninoH: "El Niño this year",
      eyebrow: "Sóc Trăng coast · NASA data", brand: "My fields", lead: "Fields you have planned. Tap one to see the plan you chose.",
      add: "Add a field on the map", emptyP: "Pick your area on the map, answer a few questions, then choose a rotation. The plan is saved here.",
      simple: "Simple", adv: "Advanced", monthOn: (m) => `Month ${m} on your field`, nextM: (m) => `Month ${m}`,
      saltIn: (a, b) => `Salty water from month ${a} to about month ${b}`, saltNow: (lv, m) => `Water is ${lv} now, until about month ${m}`, saltNone: "No salt in this field all year (sluice protected)",
      est: "Salt is an estimate from station reports, not measured by satellite", ribbonH: "12-month calendar", tapPlan: "See the 12-month plan table",
      lv: { ngot: "Fresh", lo: "Brackish", man: "Salty" }, lvL: { ngot: "fresh", lo: "brackish", man: "salty" },
      lvD: { ngot: "under 1‰: rice is safe", lo: "1–2‰: rice starts to suffer", man: "over 2‰: rice loses yield (FAO)" },
      clash: (xs) => `Careful: crops meet salty water in ${xs.join(", ")}. Measure salt before sowing; wait for rain if it is still salty.`, noClash: "Good: this plan avoids the salty months",
      ninoNote: "This is likely a drought-and-salt year (El Niño, NOAA: over 83%). Salt may come earlier and stronger.", thisYr: "This year", years: { typical: "Typical year", elnino: "El Niño year" },
      moneyH: "Estimated profit", money: (a, b) => `This year about <b>${b}</b> M₫/công. Typical year: ${a} M₫/công.`, money1: (a) => `About <b>${a}</b> M₫/công a year.`,
      tot: (h, v) => `Whole field ${h} ha: about ${v} M₫.`, noMoney: "Not enough profit data for this plan yet", moneySrc: "Median of published profit figures 2018–2026 · 1 công = 1,000 m²",
      whyH: "Why this plan", riskH: "Watch out for", scoreH: "Plan scores (1–5)", sc: { salt: "Salt safety", water: "Saves water", soil: "Better soil", income: "Income" },
      print: "Print / save file", change: "Change plan", editMap: "Edit on the map", sources: "NASA data sources", back: "Back", close: "Close",
      crop: { R: "Rice", S: "Shrimp", U: "Upland crop", "-": "Rest" },
      job: { restA: "Rest the field, clear the straw", rest: "Field rests, prepare the next crop", R0: (n) => `Prepare the field, sow ${n}`, R1: (n) => `Harvest ${n}`, R: (n) => `Tend ${n}: fertilise, keep water`,
        S0: "Clean the pond, stock shrimp", S1: "Harvest shrimp", S: "Tend shrimp: keep water level, check salt", U0: (n) => `Make beds, sow ${n}`, U1: (n) => `Harvest ${n}`, U: (n) => `Tend ${n}: water, fertilise` },
      sowWait: (n) => `Measure salt before sowing ${n}. If the water is still salty, wait for rain.`,
      tMonth: "Month", tJob: "Main job", tSalt: "Water", seed: "Seed", fert: "Fertiliser", steps: "Key steps", tapMonth: "Tap a month to see seed, fertiliser and steps.",
      preview: "Print view", save: "Save file", doPrint: "Print", printHint: "A4 print view. Save the file, then open it to print or save as PDF.", saved: "Saved",
      ask: "Talk to your extension officer before you change how you farm.", chooseH: "Change plan", chooseP: "Plans ranked by how well they fit your field:", bestFor: (n) => `Best fit for your field: ${n}`,
      use: "Use this plan", current: "In use", fit: "Fit", optsH: "About your field", editAns: "Change my answers",
      seasons: "Three seasons", sz: ["Winter–spring (Nov–Feb)", "Summer–autumn (Apr–Jul)", "Autumn–winter (Aug–Oct)"],
      people: "People at home", machines: "Machines", pv: ["Few", "Some", "Many"], mv: ["None", "Can hire", "Own"], brack: "No brackish water reaches the field",
      goal: "What matters most", goals: { salt: "Avoid salt", profit: "More profit", water: "Less water" }, year: "Based on", size: "Size (ha)", name: "Field name",
      better: (n) => `With your new answers, a better fit: ${n}`, del: "Delete field", delQ: "Delete this field?", fieldN: (i) => `Field ${i}`,
      saveField: "Save to My fields", updField: "Update this field", savedT: "Saved to My fields", toDash: "My fields",
      tabs: { salt: "Salt", money: "Money", soil: "Soil & water" }, river: "River (station)", field: "In the field (estimate)",
      seen: (n) => `NASA MODIS sees about ${n} crops a year`, rain: (n) => `Rain about ${n} mm a year (NASA GPM IMERG)`, clay: "Clay", range: (a, b, c) => `${a}–${c} M₫/công (middle ${b})`,
      areaSalt: { high: "High salt", medium: "Medium salt", low: "Low salt" }, conf: "Confidence", confL: { high: "high", medium: "medium", low: "low" },
      scSrc: "Water: NASA POWER + GPM IMERG · Salt: stations + NASA POWER · Income: published profit", why: "Why"
    }
  };
  const T = (k) => W[lang()][k];

  /* line icons, same set and stroke as the Plan Lab */
  const ICON = {
    rice: '<path d="M12 21V8"/><path d="M12 8c-2.4-.6-3.6-2.4-3.6-5 2.4.6 3.6 2.4 3.6 5Z"/><path d="M12 8c2.4-.6 3.6-2.4 3.6-5-2.4.6-3.6 2.4-3.6 5Z"/><path d="M12 14c-2.4-.6-3.6-2.4-3.6-5"/><path d="M12 14c2.4-.6 3.6-2.4 3.6-5"/>',
    shrimp: '<path d="M4 16c.8-6 5.6-10 11.5-9.2 3.2.4 4 3.4 2 5.2-1.8 1.7-4.6 1-5.8 3.2L9 20"/><path d="M4 16l3 1"/><circle cx="16" cy="9.5" r=".6"/>',
    upland: '<path d="M12 21v-8"/><path d="M12 13c-4.2 0-6.2-3-6.2-7 4.2 0 6.2 3 6.2 7Z"/><path d="M12 15c0-4 2-6 6-6 0 4-2 6-6 6Z"/>',
    fallow: '<path d="M4 12h3"/><path d="M10.5 12h3"/><path d="M17 12h3"/>',
    warn: '<path d="M12 3.5 21.5 20h-19L12 3.5Z"/><path d="M12 10v4.5"/><path d="M12 17.4v.1"/>', check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    coin: '<circle cx="12" cy="12" r="9"/><path d="M12 7v10"/><path d="M14.6 9.2c-.4-.9-1.3-1.4-2.6-1.4-1.6 0-2.6.7-2.6 1.8 0 2.6 5.2 1.2 5.2 3.8 0 1.1-1.1 1.8-2.6 1.8-1.3 0-2.2-.6-2.6-1.5"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', cal: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>', print: '<path d="M6 9V3h12v6M6 18H4v-7h16v7h-2"/><path d="M6 14h12v7H6z"/>',
    swap: '<path d="M7 7h12l-3-3M17 17H5l3 3"/>', map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14M15 6v14"/>', chev: '<path d="M9 6l6 6-6 6"/>', back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    edit: '<path d="M4 20l4-1 11-11-3-3L5 16l-1 4Z"/><path d="M14 7l3 3"/>'
  };
  const ic = (n, s = 18) => `<svg class="dv-i" viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICON[n] || ""}</svg>`;

  /* ---------------- model helpers ---------------- */
  const sites = () => DATA.sites;
  const siteOf = (id) => sites().find((s) => s.id === id) || sites()[0];
  const short = (s) => { const m = lang() === "vi" ? L(s.name).match(/Khu vực (.+?) cũ/) : L(s.name).match(/Former (.+?) area/); return m ? m[1] : L(s.name).split(" (")[0] };
  const areaLv = (id) => { try { return (RX.DATA.sites.find((x) => x.id === id) || {}).level || "medium" } catch (e) { return "medium" } };
  const GOALS = { salt: { salt: 3, water: 2, income: 1, soil: 1 }, profit: { income: 3, salt: 1, water: 1, soil: 1 }, water: { water: 3, salt: 2, income: 1, soil: 1 } };
  const PEN = [[0.5, 0.4, 0.3], [0, 0, 0], [0, 0, 0]];
  const SEAS_OF = { rice3: ["R", "R", "R"], rice2: ["R", "R", "-"], rice_shrimp: ["S", "S", "R"], rice_upland: ["U", "R", "R"] };
  const resolve = (c, crop) => { if (!c.variants) return c; const ks = Object.keys(c.variants); return { ...(c.variants[ks.includes(crop) ? crop : c.crop_default] || c.variants[ks[0]]), id: c.id } };
  const cardsFor = (s, year, crop) => ((year === "elnino" && s.el && s.el.cards) ? s.el.cards : s.cards).map((c) => resolve(c, crop));
  const isNino = (f) => (f.year ? f.year === "elnino" : true);   /* default: this season, NOAA >83% El Niño */
  const yr = (f) => (isNino(f) ? "elnino" : "typical");
  const cardOf = (f, year) => { const cs = cardsFor(siteOf(f.site), year || yr(f), f.crop); return cs.find((c) => c.id === f.rot) || cs[0] };
  const weightsOf = (f) => f.weights || GOALS[f.goal || "salt"];
  function scoreOf(c, f) {
    const w = weightsOf(f), ks = ["water", "income", "soil", "salt"].filter((k) => c.scores[k] != null), tot = ks.reduce((a, k) => a + w[k], 0);
    let s = tot ? ks.reduce((a, k) => a + w[k] * c.scores[k], 0) / tot : ks.reduce((a, k) => a + c.scores[k], 0) / ks.length;
    if (c.upland) s -= PEN[f.wfP ?? 1][f.wfM ?? 0];
    return Math.max(1, s);
  }
  const rank = (f) => cardsFor(siteOf(f.site), yr(f), f.crop).map((c) => ({ c, s: scoreOf(c, f), no: !!(c.not_here || (c.needs_brackish && f.noBrackish)) })).sort((a, b) => (a.no - b.no) || (b.s - a.s));
  const fieldSalt = (id, m, nino) => { try { return RX.Model.saltAt(id, m, nino, true) || 0 } catch (e) { return 0 } };
  const riverSalt = (id, m, nino) => { try { return RX.Model.saltAt(id, m, nino, false) || 0 } catch (e) { return 0 } };
  const level = (g) => (g < 1 ? "ngot" : g < 2 ? "lo" : "man");
  const LVC = { ngot: "low", lo: "medium", man: "high" };
  const resKey = (c, code) => { const p = c.plan && c.plan[code]; if (p && p.res && p.res[0]) return p.res[0]; return code[0] === "S" ? "shrimp" : code[0] === "U" ? (c.crop || "watermelon") : c.id === "salt_tolerant" ? "rice_st" : "rice" };
  const cropName = (c, code) => { if (code === "-") return T("crop")["-"]; const p = c.plan && c.plan[code]; if (p && p.name) return L(p.name); const r = DATA.resources[resKey(c, code)]; return r ? L(r.name) : T("crop")[code[0]] };
  const iconOf = (code) => ic({ R: "rice", S: "shrimp", U: "upland" }[code[0]] || "fallow", 16);
  let curSite = null, curNino = true;
  function jobAt(c, m) {
    const ms = c.months, code = ms[m], prev = ms[(m + 11) % 12], next = ms[(m + 1) % 12], J = T("job");
    if (code === "-") return prev !== "-" ? J.restA : J.rest;
    const k = code[0], n = cropName(c, code), st0 = prev !== code, en = next !== code, f = (x) => (typeof x === "function" ? x(n) : x);
    if (st0 && k !== "S" && curSite && level(fieldSalt(curSite, m, curNino)) === "man") return T("sowWait")(n);
    return st0 ? f(J[k + "0"]) : en ? f(J[k + "1"]) : f(J[k]);
  }
  const clashOf = (f, c) => { const nino = isNino(f), out = []; c.months.forEach((code, m) => { if ((code[0] === "R" || code[0] === "U") && level(fieldSalt(f.site, m, nino)) === "man") out.push((lang() === "vi" ? "T" : "M") + (m + 1)) }); return out };
  function saltLine(f) {
    const nino = isNino(f), lvs = [...Array(12)].map((_, m) => level(fieldSalt(f.site, m, nino)));
    if (lvs.every((x) => x === "ngot")) return { txt: T("saltNone"), lv: "ngot" };
    if (lvs[CM] !== "ngot") { let e = CM; for (let i = 1; i < 12; i++) { const m = (CM + i) % 12; if (lvs[m] === "ngot") break; e = m } return { txt: T("saltNow")(T("lvL")[lvs[CM]], e + 1), lv: lvs[CM] } }
    for (let i = 1; i < 12; i++) { const m = (CM + i) % 12; if (lvs[m] !== "ngot") { let e = m; for (let j = 1; j < 12; j++) { const k = (m + j) % 12; if (lvs[k] === "ngot") break; e = k } return { txt: T("saltIn")(m + 1, e + 1), lv: lvs.includes("man") ? "man" : lvs[m] } } }
    return { txt: T("saltNone"), lv: "ngot" };
  }
  const profit = (c) => (c && c.profit_range && c.profit_range.mid ? c.profit_range : null);
  const cong = (m) => nf(m / 10, 1);

  /* ---------------- state ---------------- */
  const st = get(KEY, null) || { fields: [], sel: null, ui: "simple" };
  const save = () => put(KEY, st);
  const fieldSel = () => st.fields.find((f) => f.id === st.sel) || st.fields[0] || null;
  const adv = () => st.ui === "advanced";
  let view = "dash", tab = "salt", editing = null, on = false;

  /* ---------------- panel ---------------- */
  function shell() {
    if ($("#dv")) return;
    const d = document.createElement("div"); d.id = "dv";
    d.innerHTML = `<main id="dvPanel" class="dv-page" aria-labelledby="dvH"></main>
      <div id="dvSheet" class="dv-sheet" hidden><div class="dv-scrim" data-dv="close"></div><div class="dv-sh" role="dialog" aria-modal="true"><div class="dv-grab" aria-hidden="true"></div><div id="dvShBody"></div></div></div>`;
    document.body.appendChild(d);
    const b = document.createElement("button"); b.type = "button"; b.id = "dvBack"; b.className = "dv-backmap"; b.hidden = true; document.body.appendChild(b);
  }
  /* ---------------- dashboard page: tiles ---------------- */
  const MS = () => (lang() === "vi" ? ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"] : ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"]);
  function ribbon(f, c, small) {
    const nino = isNino(f), order = [...Array(12)].map((_, i) => (CM + i) % 12);
    const crops = ["R", "S", "U", "-"].filter((k) => c.months.some((x) => x[0] === k));
    return `<ol class="rb${small ? " sm" : ""}">${order.map((m) => { const code = c.months[m]; return `<li class="${code[0] === "-" ? "rest" : code[0]}${m === CM ? " now" : ""}" title="${esc(cropName(c, code))}">${iconOf(code)}<span class="mo">T${m + 1}</span><i class="sb ${level(fieldSalt(f.site, m, nino))}"></i></li>` }).join("")}</ol>
      <span class="rb-key">${crops.map((k) => `<span>${iconOf(k)}${esc(T("crop")[k])}</span>`).join("")}${["ngot", "lo", "man"].map((k) => `<span><i class="sb ${k}"></i>${esc(T("lv")[k])}</span>`).join("")}</span>`;
  }
  function fieldTabs() {
    const f0 = fieldSel();
    return `<div class="dv-ftabs" role="tablist" aria-label="${esc(T("brand"))}">${st.fields.map((f) => { const sel = !!(f0 && f.id === f0.id), lv = areaLv(f.site);
      return `<button type="button" role="tab" data-dvf="${f.id}" aria-selected="${sel}"><i class="sd-dot lv-${lv}" aria-hidden="true"></i><b>${esc(f.name)}</b><small>${esc(short(siteOf(f.site)))}</small></button>` }).join("")}</div>`;
  }
  function pageHead() {
    const seg = `<div class="seg dv-mode" role="group" aria-label="${esc(T("modeL"))}"><button type="button" data-dvui="simple" aria-pressed="${!adv()}">${esc(T("simple"))}</button><button type="button" data-dvui="advanced" aria-pressed="${adv()}">${esc(T("adv"))}</button></div>`;
    return `<header class="dv-top"><div class="dv-tt"><p class="sd-eyebrow">${esc(T("eyebrow"))}</p><h2 id="dvH">${esc(T("brand"))}</h2></div>
      <div class="dv-tr">${st.fields.length ? seg : ""}<button type="button" class="btn gold dv-addtop" data-dv="add">${ic("plus", 18)}<span>${esc(T("addShort"))}</span></button></div></header>`;
  }
  function welcome() {
    return `<section class="dv-welcome"><div class="dv-wi">${ic("rice", 40)}</div><h3>${esc(T("welcome"))}</h3><p>${esc(T("welcomeP"))}</p>
      <ol class="dv-wsteps">${T("wsteps").map((x, i) => `<li><b>${i + 1}</b><span>${esc(x)}</span></li>`).join("")}</ol>
      <button type="button" class="btn gold dv-addbig" data-dv="add">${ic("plus", 20)}<span>${esc(T("create"))}</span></button>
      <p class="sd-note"><button type="button" class="dv-link" data-open="sources">${esc(T("sources"))}</button></p></section>`;
  }
  function facts(f) {
    const c = cardOf(f), s = siteOf(f.site), nino = isNino(f); curSite = f.site; curNino = nino;
    const job = jobAt(c, CM); let nk = 1; while (nk < 12 && jobAt(c, (CM + nk) % 12) === job) nk++;
    const p = profit(c), pe = profit(cardOf(f, "elnino")), shown = pe || p;
    const g = fieldSalt(f.site, CM, nino);
    return { c, s, nino, job, nm: (CM + nk) % 12, p, pe, shown, g, lv: level(g), sl: saltLine(f), clash: clashOf(f, c) };
  }

  /* SIMPLE: few big cards, plain words, one number each */
  function simplePage(f) {
    const x = facts(f), { c } = x, mon = shownMoney(f, x);
    return `<div class="dv-s">
      <div class="dv-splan"><span>${esc(f.name)} · ${esc(short(x.s))}</span><b>${esc(L(c.name))}</b></div>
      <button type="button" class="s-card s-job" data-dv="plan"><span class="s-k">${esc(T("monthOn")(CM + 1))}</span>
        <span class="s-big">${ic({ R: "rice", S: "shrimp", U: "upland" }[c.months[CM][0]] || "fallow", 34)}<b>${esc(x.job)}</b></span>
        <span class="s-sub">${esc(T("nextM")(x.nm + 1))}: ${esc(jobAt(c, x.nm))}</span></button>
      <div class="s-card s-salt lv-${x.lv}"><span class="s-k">${esc(T("waterNow"))}</span>
        <span class="s-light" aria-hidden="true"><i class="ngot"></i><i class="lo"></i><i class="man"></i></span>
        <b class="s-word">${esc(T("lv")[x.lv])}</b><span class="s-sub">${esc(x.sl.txt)}</span><small>${esc(T("est"))}</small></div>
      <div class="s-card s-money"><span class="s-k">${esc(T("moneyH"))}</span>
        ${mon ? `<b class="s-num">${mon.per}</b><span class="s-unit">${esc(T("perCong"))}</span>${mon.tot ? `<span class="s-sub">${esc(mon.tot)}</span>` : ""}` : `<span class="s-sub">${esc(T("noMoney"))}</span>`}
        <small>${esc(T("moneySrc"))}</small></div>
      ${x.clash.length || x.nino ? `<div class="s-card s-warn">${ic("warn", 26)}<div>${x.clash.length ? `<b>${esc(T("clash")(x.clash))}</b>` : `<b>${esc(T("noClash"))}</b>`}${x.nino ? `<p>${esc(T("ninoShort"))}</p>` : ""}</div></div>` : ""}
      <button type="button" class="s-card s-cal" data-dv="plan"><span class="s-k">${ic("cal", 18)}${esc(T("ribbonH"))}</span>${ribbon(f, c)}<span class="dv-more">${esc(T("tapPlan"))} ${ic("chev", 14)}</span></button>
      <div class="dv-acts s-acts"><button type="button" class="btn gold" data-dv="plan">${ic("cal", 18)}<span>${esc(T("tapPlanS"))}</span></button><button type="button" class="btn" data-dv="paper">${ic("print", 18)}<span>${esc(T("print"))}</span></button>
        <button type="button" class="btn" data-dv="choose">${ic("swap", 18)}<span>${esc(T("change"))}</span></button><button type="button" class="btn" data-dv="editmap">${ic("map", 18)}<span>${esc(T("editMap"))}</span></button></div>
      <p class="sd-note">${esc(T("ask"))}</p></div>`;
  }
  function shownMoney(f, x) {
    const m = x.shown; if (!m) return null;
    const per = +(m.mid / 10).toFixed(1);
    return { per: nf(per, 1), tot: f.size ? T("tot")(nf(f.size, 1), nf(per * 10 * f.size, 0)) : "" };
  }

  /* ADVANCED: dense dark tile grid with charts */
  const tile = (cls, head, body, src) => `<section class="a-t ${cls}"><h4 class="a-h">${head}</h4>${body}${src ? `<p class="a-src">${esc(src)}</p>` : ""}</section>`;
  function gauge(g) {
    const max = 4, v = Math.min(g, max), ang = (a) => Math.PI * (1 - a / max), pt = (a, r) => `${(60 + r * Math.cos(ang(a))).toFixed(2)} ${(60 - r * Math.sin(ang(a))).toFixed(2)}`;
    const arc = (a, b, cls) => `<path class="${cls}" d="M${pt(a, 48)} A48 48 0 0 1 ${pt(b, 48)}"/>`;
    return `<svg class="a-gauge" viewBox="0 0 120 70" role="img" aria-label="${nf(g, 1)}‰">${arc(0, 1, "z ngot")}${arc(1, 2, "z lo")}${arc(2, 4, "z man")}
      <line class="ndl" x1="60" y1="60" x2="${(60 + 40 * Math.cos(ang(v))).toFixed(2)}" y2="${(60 - 40 * Math.sin(ang(v))).toFixed(2)}"/><circle class="hub" cx="60" cy="60" r="4"/>
      <text x="10" y="69">0</text><text x="56" y="9">2</text><text x="104" y="69">4‰</text></svg>`;
  }
  function lineChart(f) {
    const nino = isNino(f), s = siteOf(f.site), rain = (nino && s.el && s.el.rain) || s.rain || [], W0 = 320, H0 = 150, pl = 26, pr = 26, pt = 10, pb = 20;
    const rv = [...Array(12)].map((_, m) => riverSalt(f.site, m, nino)), fv = [...Array(12)].map((_, m) => fieldSalt(f.site, m, nino));
    const mx = Math.max(2, ...rv) * 1.1, rmx = Math.max(100, ...rain) * 1.1, X = (m) => pl + m * (W0 - pl - pr) / 11, Y = (v) => pt + (H0 - pt - pb) * (1 - v / mx), YR = (v) => H0 - pb - (H0 - pt - pb) * v / rmx;
    const line = (a) => a.map((v, m) => `${m ? "L" : "M"}${X(m).toFixed(1)} ${Y(v).toFixed(1)}`).join(" ");
    const bw = (W0 - pl - pr) / 12 * .55;
    return `<svg class="a-line" viewBox="0 0 ${W0} ${H0}" role="img" aria-label="${esc(T("chartL"))}">
      ${[0, .5, 1].map((k) => `<line class="gr" x1="${pl}" x2="${W0 - pr}" y1="${(pt + (H0 - pt - pb) * k).toFixed(1)}" y2="${(pt + (H0 - pt - pb) * k).toFixed(1)}"/><text class="ax" x="${pl - 4}" y="${(pt + (H0 - pt - pb) * k + 3).toFixed(1)}" text-anchor="end">${nf(mx * (1 - k), 0)}</text><text class="ax r" x="${W0 - pr + 4}" y="${(pt + (H0 - pt - pb) * k + 3).toFixed(1)}">${Math.round(rmx * (1 - k))}</text>`).join("")}
      ${rain.map((v, m) => `<rect class="rn" x="${(X(m) - bw / 2).toFixed(1)}" y="${YR(v).toFixed(1)}" width="${bw.toFixed(1)}" height="${(H0 - pb - YR(v)).toFixed(1)}"/>`).join("")}
      <line class="th" x1="${pl}" x2="${W0 - pr}" y1="${Y(2).toFixed(1)}" y2="${Y(2).toFixed(1)}"/>
      <path class="lr" d="${line(rv)}"/><path class="lf" d="${line(fv)}"/>
      ${fv.map((v, m) => `<circle class="pf ${level(v)}" cx="${X(m).toFixed(1)}" cy="${Y(v).toFixed(1)}" r="${m === CM ? 4 : 2.4}"/>`).join("")}
      <line class="nowl" x1="${X(CM).toFixed(1)}" x2="${X(CM).toFixed(1)}" y1="${pt}" y2="${H0 - pb}"/>
      ${MS().map((t, m) => `<text class="ax" x="${X(m).toFixed(1)}" y="${H0 - 6}" text-anchor="middle">${t}</text>`).join("")}</svg>
      <p class="a-key"><span><i class="k lf"></i>${esc(T("field"))} ‰</span><span><i class="k lr"></i>${esc(T("river"))} ‰</span><span><i class="k rn"></i>${esc(T("rainM"))} mm</span><span><i class="k th"></i>2‰</span></p>`;
  }
  function donut(n, of, lab) {
    const r = 34, C0 = 2 * Math.PI * r, k = of ? n / of : 0;
    return `<div class="a-donut"><svg viewBox="0 0 90 90" aria-hidden="true"><circle class="bg" cx="45" cy="45" r="${r}"/><circle class="fg" cx="45" cy="45" r="${r}" stroke-dasharray="${(C0 * k).toFixed(1)} ${C0.toFixed(1)}" transform="rotate(-90 45 45)"/></svg>
      <div class="a-dv"><b>${n}<small>/${of}</small></b><span>${esc(lab)}</span></div></div>`;
  }
  function advPage(f) {
    const x = facts(f), { c, s, nino } = x, mon = shownMoney(f, x), r = rank(f), best = r.find((y) => !y.no);
    const crop = c.months.map((code, m) => code[0] === "R" || code[0] === "U" ? m : -1).filter((m) => m >= 0);
    const safe = crop.filter((m) => level(fieldSalt(f.site, m, nino)) !== "man").length;
    const t = (() => { try { return RX.DATA.sites.find((y) => y.id === f.site) } catch (e) { return null } })(), k = t ? RX.Model.kFor(t).k : null;
    const rain = ((nino && s.el && s.el.rain) || s.rain || []).reduce((a, b) => a + b, 0), et0 = ((nino && s.el && s.el.et0) || s.et0 || []).reduce((a, b) => a + b, 0);
    const job = `<p class="a-job">${iconOf(c.months[CM])}<b>${esc(x.job)}</b></p><p class="a-mut">${esc(T("nextM")(x.nm + 1))}: ${esc(jobAt(c, x.nm))}</p>`;
    return `<div class="dv-a">
      <div class="a-bar"><div><span class="a-mut">${esc(f.name)} · ${esc(short(s))}</span><b>${esc(L(c.name))}</b></div><span class="a-pill${nino ? " hot" : ""}">${esc(nino ? T("years").elnino : T("years").typical)}</span></div>
      <div class="a-grid">
        ${tile("a-g1", esc(T("saltNowA")), `${gauge(x.g)}<p class="a-num">${nf(x.g, 1)}<small>‰</small></p><p class="a-mut lv-${x.lv}">${esc(T("lv")[x.lv])} · ${esc(T("lvD")[x.lv])}</p>`, T("est"))}
        ${tile("a-g2", esc(T("chartH")), lineChart(f), (lang() === "vi" ? "Mặn: trạm đo + NASA POWER (ước tính) · Mưa: NASA GPM IMERG" : "Salt: stations + NASA POWER (estimate) · Rain: NASA GPM IMERG"))}
        ${tile("a-g3", esc(T("safeH")), `${donut(safe, crop.length, T("safeL"))}<p class="a-mut">${esc(x.clash.length ? T("clash")(x.clash) : T("noClash"))}</p>`, T("est"))}
        ${tile("a-g4", esc(T("moneyH")), mon ? `<p class="a-num big">${mon.per}<small> ${esc(T("perCongS"))}</small></p>${x.p && x.pe && x.p.mid !== x.pe.mid ? `<p class="a-mut">${esc(T("years").typical)}: ${cong(x.p.mid)} · ${esc(T("years").elnino)}: ${cong(x.pe.mid)}</p>` : ""}${x.shown ? `<p class="a-mut">${esc(T("range")(cong(x.shown.lo), cong(x.shown.mid), cong(x.shown.hi)))}</p>` : ""}${mon.tot ? `<p class="a-mut">${esc(mon.tot)}</p>` : ""}` : `<p class="a-mut">${esc(T("noMoney"))}</p>`, T("moneySrc"))}
        ${tile("a-g5", esc(T("monthOn")(CM + 1)), job, "")}
        ${tile("a-g6", esc(T("scoreH")), `<div class="a-bars">${["salt", "water", "soil", "income"].map((q) => { const v = c.scores[q]; return `<div><span>${esc(T("sc")[q])}</span><i><b style="width:${v == null ? 0 : (v - 1) / 4 * 100}%"></b></i><em>${v == null ? "–" : nf(v, 1)}</em></div>` }).join("")}</div>${c.confidence ? `<p class="a-mut">${esc(T("conf"))}: ${esc(T("confL")[c.confidence] || c.confidence)}</p>` : ""}`, T("scSrc"))}
        ${tile("a-g7", esc(T("nums")), `<dl class="a-kpi"><div><dt>${esc(T("cropsY"))}</dt><dd>${typeof s.crops === "number" ? nf(s.crops, 1) : "–"}</dd><small>NASA MODIS NDVI</small></div>
          <div><dt>${esc(T("rainY"))}</dt><dd>${nf(Math.round(rain), 0)}<small> mm</small></dd><small>NASA GPM IMERG</small></div>
          <div><dt>${esc(T("needY"))}</dt><dd>${nf(Math.round(et0), 0)}<small> mm</small></dd><small>NASA POWER</small></div>
          <div><dt>k</dt><dd>${k == null ? "–" : nf(k, 2)}</dd><small>${esc(T("kL"))}</small></div></dl>`, "")}
        ${tile("a-g8", esc(T("rankH")), `<ol class="a-rank">${r.slice(0, 5).map(({ c: y, s: sc, no }) => `<li class="${y.id === f.rot ? "cur" : ""}${no ? " no" : ""}"><span>${esc(L(y.name))}</span><i><b style="width:${((sc - 1) / 4 * 100).toFixed(0)}%"></b></i><em>${nf(sc, 1)}</em></li>`).join("")}</ol>${best && best.c.id !== f.rot ? `<p class="a-mut">${esc(T("bestFor")(L(best.c.name)))}</p>` : ""}`, T("rankSrc"))}
        ${tile("a-g9", `${ic("cal", 14)}${esc(T("ribbonH"))}`, `<button type="button" class="a-rib" data-dv="plan">${ribbon(f, c, true)}</button>`, T("est"))}
        ${nino ? tile("a-g10 hot", esc(T("ninoH")), `<p class="a-num">&gt;83<small>%</small></p><p class="a-mut">${esc(T("ninoNote"))}</p>`, "NOAA CPC") : ""}
      </div>
      <div class="dv-acts a-acts"><button type="button" class="btn gold" data-dv="choose">${ic("swap", 16)}<span>${esc(T("change"))}</span></button><button type="button" class="btn" data-dv="plan">${ic("cal", 16)}<span>${esc(T("tapPlanS"))}</span></button><button type="button" class="btn" data-dv="paper">${ic("print", 16)}<span>${esc(T("print"))}</span></button>
        <button type="button" class="btn" data-dv="editmap">${ic("map", 16)}<span>${esc(T("editMap"))}</span></button><button type="button" class="btn" data-dv="opts">${ic("edit", 16)}<span>${esc(T("editAns"))}</span></button><button type="button" class="btn" data-open="sources"><span>${esc(T("sources"))}</span></button></div>
      <p class="a-src">${esc(T("ask"))}</p></div>`;
  }
  function panelDash() {
    const f = fieldSel();
    if (!f) return `${pageHead()}${welcome()}`;
    return `${pageHead()}${fieldTabs()}${adv() ? advPage(f) : simplePage(f)}`;
  }

  /* ---------------- plan table (in the panel) ---------------- */
  function planTable(f, c) {
    const nino = isNino(f), ML = (i) => (lang() === "vi" ? "Tháng " + (i + 1) : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][i]);
    curSite = f.site; curNino = nino;
    return `<table class="dv-table"><thead><tr><th>${esc(T("tMonth"))}</th><th>${esc(T("tJob"))}</th><th>${esc(T("tSalt"))}</th></tr></thead><tbody>${[...Array(12)].map((_, k) => { const m = (CM + k) % 12, code = c.months[m], g = fieldSalt(f.site, m, nino), lv = level(g);
      return `<tr class="${m === CM ? "now" : ""}" data-dvm="${m}" tabindex="0"><th scope="row">${esc(ML(m))}</th><td><span class="dv-tc">${iconOf(code)}${esc(cropName(c, code))}</span>${esc(jobAt(c, m))}</td><td><span class="sd-dot lv-${LVC[lv]}"></span> ${esc(T("lv")[lv])}${adv() ? `<small> ${nf(g, 1)}‰</small>` : ""}</td></tr>` }).join("")}</tbody></table>`;
  }
  function panelPlan() {
    const f = fieldSel(), c = cardOf(f), s = siteOf(f.site);
    return `<button type="button" class="dv-link back" data-dv="home">${ic("back", 16)}${esc(T("back"))}</button>
      <p class="sd-eyebrow">${esc(f.name)} · ${esc(short(s))}</p><h2 class="sd-h">${esc(L(c.name))}</h2><p class="sd-lead">${esc(L(c.calendar))}</p>
      <p class="sd-note">${esc(T("tapMonth"))}</p>${planTable(f, c)}<p class="sd-src">${esc(T("est"))}</p>
      <div class="dv-acts"><button type="button" class="btn gold" data-dv="paper">${ic("print", 16)}<span>${esc(T("print"))}</span></button><button type="button" class="btn" data-dv="home">${ic("back", 16)}<span>${esc(T("back"))}</span></button></div>`;
  }
  function monthSheet(m) {
    const f = fieldSel(), c = cardOf(f), code = c.months[m], r = code === "-" ? null : DATA.resources[resKey(c, code)], g = fieldSalt(f.site, m, isNino(f)), lv = level(g);
    curSite = f.site; curNino = isNino(f);
    sheet(`<h2>${esc(lang() === "vi" ? "Tháng " + (m + 1) : "Month " + (m + 1))}: ${esc(cropName(c, code))}</h2><p class="dv-job sm">${iconOf(code)}<span>${esc(jobAt(c, m))}</span></p>
      ${r ? `<dl class="dv-dl"><dt>${esc(T("seed"))}</dt><dd>${esc(L(r.seed))}</dd><dt>${esc(T("fert"))}</dt><dd>${esc(L(r.fertiliser))}</dd></dl><p class="sd-k">${esc(T("steps"))}</p><ol class="dv-steps">${(r.steps || []).map((x) => `<li>${esc(L(x))}</li>`).join("")}</ol>` : ""}
      <div class="dv-salt"><span class="sd-dot lv-${LVC[lv]}"></span><div><b>${esc(T("lv")[lv])}: ${esc(T("lvD")[lv])}</b><small>${esc(T("est"))}</small></div></div>
      <button type="button" class="btn gold dv-full" data-dv="close">${esc(T("close"))}</button>`);
  }

  /* ---------------- print ---------------- */
  function paperHTML() {
    const f = fieldSel(), c = cardOf(f), s = siteOf(f.site), d = new Date().toLocaleDateString(lang() === "vi" ? "vi-VN" : "en-GB");
    return `<div class="paper"><p class="pp-k">${esc(T("brand"))} · Mekong Rotation Explorer</p><h1>${esc(f.name)}: ${esc(L(c.name))}</h1><p>${esc(L(s.name))} · ${esc(d)}${f.size ? ` · ${nf(f.size, 1)} ha` : ""}</p>
      ${planTable(f, c)}<p>${esc(saltLine(f).txt)}. ${esc(T("est"))}.</p>
      <table class="pp-tick"><tr>${[...Array(12)].map((_, k) => `<td>${(CM + k) % 12 + 1}<br>☐</td>`).join("")}</tr></table>
      <footer><p>${lang() === "vi" ? "Dữ liệu: NASA GPM IMERG (mưa), NASA POWER (nhiệt độ, nhu cầu nước), NASA MODIS NDVI (số vụ), NOAA (El Niño), SoilGrids (đất). Độ mặn: ước tính từ báo cáo trạm đo công khai, không đo bằng vệ tinh." : "Data: NASA GPM IMERG (rain), NASA POWER (heat, water need), NASA MODIS NDVI (crop count), NOAA (El Niño), SoilGrids (soil). Salinity: estimate from public station reports, not satellite."}</p><p>${esc(T("ask"))}</p></footer></div>`;
  }
  const PAPER_CSS = `body{margin:0;background:#fff;color:#111;font:14px/1.45 "Be Vietnam Pro",Arial,sans-serif}.paper{max-width:780px;margin:0 auto;padding:24px}.paper h1{font-size:22px;margin:4px 0}.pp-k{font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#555;margin:0}.dv-table{width:100%;border-collapse:collapse;margin:12px 0}.dv-table th,.dv-table td{border:1px solid #999;padding:6px 8px;text-align:left;vertical-align:top}.dv-table thead th{background:#eee}.dv-table tr.now{background:#fff6cc}.dv-tc{display:block;font-weight:700}.dv-i{display:none}.sd-dot{display:inline-block;width:10px;height:10px;border-radius:50%;border:1px solid #333}.sd-dot.lv-low{background:#fff}.sd-dot.lv-medium{background:repeating-linear-gradient(45deg,#333 0 2px,#fff 2px 4px)}.sd-dot.lv-high{background:#333}.pp-tick{width:100%;border-collapse:collapse;text-align:center;font-size:12px}.pp-tick td{border:1px solid #999;padding:4px}footer{margin-top:14px;font-size:11px;color:#333;border-top:1px solid #999}@media print{.paper{padding:0}@page{size:A4;margin:14mm}}`;
  function paperSheet() {
    sheet(`<h2>${esc(T("preview"))}</h2><p class="sd-note">${esc(T("printHint"))}</p><div class="paper-wrap">${paperHTML()}</div>
      <div class="dv-acts"><button type="button" class="btn gold" data-dv="savefile"><span>${esc(T("save"))}</span></button><button type="button" class="btn" data-dv="doprint">${ic("print", 16)}<span>${esc(T("doPrint"))}</span></button></div><p class="sd-note" id="dvSaveMsg" role="status"></p>`, true);
  }
  let dl = null; try { if (window.claude && claude.use) claude.use("downloads").then((x) => (dl = x)).catch(() => {}) } catch (e) {}
  async function saveFile() {
    const f = fieldSel(), name = (f.name || "ruong").replace(/[^\p{L}\p{N}]+/gu, "-") + "-ke-hoach.html";
    const html = `<!doctype html><html lang="${lang()}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(f.name)}</title><style>${PAPER_CSS}</style></head><body>${paperHTML()}<script>setTimeout(function(){try{print()}catch(e){}},700)<\/script></body></html>`;
    const msg = $("#dvSaveMsg");
    if (dl) { try { await dl.save({ filename: name, data: html }); if (msg) msg.textContent = T("saved"); return } catch (e) { if (e && e.code === "declined") return } }
    try { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([html], { type: "text/html" })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); if (msg) msg.textContent = T("saved") } catch (e) {}
  }

  /* ---------------- change plan / answers ---------------- */
  function whyFit(c, f) {
    const w = weightsOf(f), ks = ["salt", "water", "soil", "income"].filter((k) => c.scores[k] != null), tw = ks.reduce((a, k) => a + w[k], 0), pen = c.upland ? PEN[f.wfP ?? 1][f.wfM ?? 0] : 0;
    return `<details class="dv-whyfit"><summary>${esc(T("why"))} ${nf(scoreOf(c, f), 1)}?</summary><pre class="dv-math">${esc(ks.map((k) => `${T("sc")[k].padEnd(15)} ${nf(c.scores[k], 1)} × ${w[k]}`).join("\n") + `\n= ${nf(ks.reduce((a, k) => a + w[k] * c.scores[k], 0), 1)} ÷ ${tw}${pen ? " − " + nf(pen, 1) : ""} = ${nf(scoreOf(c, f), 2)}`)}</pre></details>`;
  }
  function chooseSheet() {
    const f = fieldSel(), r = rank(f), best = r.find((x) => !x.no);
    sheet(`<h2>${esc(T("chooseH"))}</h2>${best && best.c.id !== f.rot ? `<p class="dv-best">${esc(T("bestFor")(L(best.c.name)))}</p>` : ""}<p class="sd-note">${esc(T("chooseP"))}</p>
      <div class="dv-opts-list">${r.map(({ c, s, no }) => `<div class="dv-optc${c.id === f.rot ? " cur" : ""}${no ? " no" : ""}"><div class="dv-optt"><b>${esc(L(c.name))}</b><small>${esc(L(c.calendar))}</small><span class="sd-chip">${esc(T("fit"))} ${nf(s, 1)}/5</span>${adv() ? whyFit(c, f) : ""}</div>
        ${c.id === f.rot ? `<span class="sd-chip lv-low">${esc(T("current"))}</span>` : `<button type="button" class="btn gold" data-use="${c.id}">${esc(T("use"))}</button>`}</div>`).join("")}</div>`);
  }
  function optsSheet() {
    const f = fieldSel(); if (!f) return;
    const opt = (k, v, cur, txt) => `<button type="button" data-opt="${k}" data-v="${v}" aria-pressed="${cur === v}">${esc(txt)}</button>`, top = rank(f)[0];
    sheet(`<h2>${esc(T("optsH"))}</h2><div class="dv-opts">
      <div class="o-g"><span>${esc(T("seasons"))}</span>${[0, 1, 2].map((i) => `<small>${esc(T("sz")[i])}</small><div class="seg o-seg">${["R", "S", "U", "-"].map((v) => opt("sz" + i, v, (f.seasons || [])[i], T("crop")[v])).join("")}</div>`).join("")}</div>
      <div class="o-g"><span>${esc(T("goal"))}</span><div class="seg o-seg">${Object.keys(GOALS).map((g) => opt("goal", g, f.weights ? "" : f.goal, T("goals")[g])).join("")}</div></div>
      <div class="o-g"><span>${esc(T("people"))}</span><div class="seg o-seg">${[0, 1, 2].map((v) => opt("wfP", String(v), String(f.wfP ?? 1), T("pv")[v])).join("")}</div></div>
      <div class="o-g"><span>${esc(T("machines"))}</span><div class="seg o-seg">${[0, 1, 2].map((v) => opt("wfM", String(v), String(f.wfM ?? 0), T("mv")[v])).join("")}</div></div>
      <label class="o-chk"><input type="checkbox" data-opt="noBrackish" ${f.noBrackish ? "checked" : ""}> ${esc(T("brack"))}</label>
      <div class="o-g"><span>${esc(T("year"))}</span><div class="seg o-seg">${["typical", "elnino"].map((y) => opt("year", y, yr(f), T("years")[y])).join("")}</div></div>
      <label class="o-g"><span>${esc(T("size"))}</span><input type="text" inputmode="decimal" data-opt="size" value="${f.size ? nf(f.size, 2).replace(/[,.]?0+$/, "") : ""}" placeholder="1,5"></label>
      <label class="o-g"><span>${esc(T("name"))}</span><input type="text" data-opt="name" maxlength="30" value="${esc(f.name)}"></label>
      ${top && top.c.id !== f.rot && !top.no ? `<div class="dv-better"><p>${esc(T("better")(L(top.c.name)))}</p><button type="button" class="btn gold" data-use="${top.c.id}">${esc(T("use"))}</button></div>` : ""}
      <button type="button" class="dv-link danger" data-dv="del">${esc(T("del"))}</button></div>`);
  }
  function setOpt(k, v) {
    const f = fieldSel(); if (!f) return;
    if (k.startsWith("sz")) { f.seasons = f.seasons || ["R", "R", "R"]; f.seasons[+k.slice(2)] = v }
    else if (k === "goal") { f.goal = v; f.weights = null }
    else if (k === "wfP" || k === "wfM") f[k] = +v;
    else if (k === "year") f.year = v;
    else if (k === "noBrackish") f.noBrackish = !!v;
    else if (k === "size") { const n = parseFloat(String(v).replace(",", ".")); f.size = n > 0 && n < 1000 ? n : null }
    else if (k === "name") f.name = String(v).trim() || f.name;
    save();
  }

  /* ---------------- map flow: add / edit a field, save the chosen plan back ---------------- */
  const backLabel = () => { const b = $("#dvBack"); if (b) b.innerHTML = `${ic("back", 16)}<span>${esc(T("toDash"))}</span>` };
  function toMap(field) {
    editing = field ? field.id : null; on = false;
    closeSheet(); document.body.classList.remove("dv-on"); document.body.classList.add("dv-off"); lastSite = null;
    $("#dvBack").hidden = false; backLabel();
    try { if (typeof MapView !== "undefined" && MapView.resize) setTimeout(() => MapView.resize(), 60) } catch (e) {}
    if (field) { const i = sites().findIndex((s) => s.id === field.site), p = $$("path.sg-area")[i]; if (p) setTimeout(() => p.dispatchEvent(new MouseEvent("click", { bubbles: true })), 200) }
    else { try { MapView.select(null); MapView.home() } catch (e) {} }
  }
  function backToDash() {
    on = true; editing = null; lastSite = null; $("#dvBack").hidden = true; document.body.classList.add("dv-on"); document.body.classList.remove("dv-off");
    try { if (window.App && App.closePanel) App.closePanel() } catch (e) {} view = "dash";
    if (location.hash) { try { history.replaceState(null, "", location.pathname + location.search) } catch (e) {} }
    render();
  }
  function saveFromMap() {
    const A = window.App; if (!A || !A.site || !A.site()) return;
    const s = A.site(), cur = A.cur ? A.cur() : "rice3", w = A.weights ? A.weights() : null, m = A.mode ? A.mode() : "typical";
    let wf = { p: 1, m: 0 }; try { wf = JSON.parse(localStorage.getItem("mre-wf2") || "null") || wf } catch (e) {}
    const base = editing && st.fields.find((f) => f.id === editing);
    const f = base || { id: "f" + Date.now(), name: T("fieldN")(st.fields.length + 1), size: null };
    Object.assign(f, { site: s.id, rot: A.planId ? A.planId() : null, weights: w, goal: null, year: m === "elnino" ? "elnino" : null, crop: A.upCrop ? A.upCrop() : null, seasons: SEAS_OF[cur] || ["R", "R", "R"], wfP: wf.p, wfM: wf.m, savedAt: Date.now() });
    const nb = document.getElementById("noBrackish"); f.noBrackish = !!(nb && nb.checked);
    if (!f.rot) f.rot = rank(f)[0].c.id;
    if (!base) st.fields.push(f); st.sel = f.id; save();
    try { A.toast && A.toast(T("savedT")) } catch (e) {}
    backToDash();
  }
  /* add the save button to the plan confirmation box of the map flow (#planOk, app.js renderPlan) */
  function hookPlanOk() {
    /* the "about your field" questions come right after the plan box, before the 12-month ring */
    const pr = document.getElementById("d5Pred"), ring = document.getElementById("d5W4");
    if (pr && ring && pr.parentNode === ring.parentNode && (ring.compareDocumentPosition(pr) & Node.DOCUMENT_POSITION_FOLLOWING)) ring.parentNode.insertBefore(pr, ring);
    const foot = document.querySelector("#drawer .d-foot"); if (!foot) return;
    let b = foot.querySelector(".dv-savefield");
    if (!b) { b = document.createElement("button"); b.type = "button"; b.className = "btn gold dv-savefield"; foot.appendChild(b) }
    const lab = editing ? T("updField") : T("saveField"), h = `${ic("plus", 16)}<span>${esc(lab)}</span>`;
    if (b.dataset.l !== lab) { b.innerHTML = h; b.dataset.l = lab }
    const v4 = document.getElementById("v4"), show = !on && !!(v4 && v4.classList.contains("on")) && !!(window.App && App.site && App.site());
    if (b.hidden === show) b.hidden = !show;
    foot.classList.toggle("has-save", show);
    const nx = document.getElementById("dNext"); if (nx) nx.classList.toggle("gold", !show);
  }
  /* ---------------- sheet + render ---------------- */
  function sheet(html, wide) { const sh = $("#dvSheet"); $("#dvShBody").innerHTML = html; sh.classList.toggle("wide", !!wide); sh.hidden = false; requestAnimationFrame(() => sh.classList.add("on")) }
  function closeSheet() { const sh = $("#dvSheet"); if (!sh) return; sh.classList.remove("on"); setTimeout(() => (sh.hidden = true), 220) }
  let lastSite = null;
  function render() {
    if (!$("#dv")) return;
    const p = $("#dvPanel"), y = p.scrollTop;
    if (view === "plan" && !fieldSel()) view = "dash";
    p.innerHTML = view === "plan" ? panelPlan() : panelDash();
    p.scrollTop = view === "plan" ? 0 : y;
    document.body.classList.toggle("dv-simple", !adv());
    p.classList.toggle("is-adv", adv() && view !== "plan" && !!fieldSel()); p.classList.toggle("is-simple", !adv() || view === "plan" || !fieldSel());
  }
  function go(v) { view = v; closeSheet(); render(); $("#dvPanel").scrollTop = 0 }

  document.addEventListener("click", (e) => {
    if (e.target.closest("#dvBack")) return backToDash();
    if (e.target.closest(".dv-savefield")) return saveFromMap();
    if (!e.target.closest("#dv")) return;
    const a = e.target.closest("[data-dv],[data-dvf],[data-dvui],[data-use],[data-tab],[data-opt],[data-dvm]"); if (!a || a.matches("input")) return;
    const d = a.dataset;
    if (d.dvui) { st.ui = d.dvui; save(); return render() }
    if (d.dvf) { st.sel = d.dvf; save(); view = "dash"; return render() }
    if (d.use) { const f = fieldSel(); f.rot = d.use; f.savedAt = Date.now(); save(); closeSheet(); return render() }
    if (d.tab) { tab = d.tab; return render() }
    if (d.opt) { setOpt(d.opt, d.v); render(); return optsSheet() }
    if (d.dvm != null) return monthSheet(+d.dvm);
    switch (d.dv) {
      case "home": return go("dash");
      case "plan": return go("plan");
      case "add": return toMap(null);
      case "editmap": return toMap(fieldSel());
      case "paper": return paperSheet();
      case "choose": return chooseSheet();
      case "opts": return optsSheet();
      case "close": return closeSheet();
      case "savefile": return saveFile();
      case "doprint": { const w = document.createElement("iframe"); w.style.cssText = "position:fixed;width:0;height:0;border:0"; document.body.appendChild(w); w.srcdoc = `<html><head><meta charset="utf-8"><style>${PAPER_CSS}</style></head><body>${paperHTML()}</body></html>`; w.onload = () => { try { w.contentWindow.print() } catch (er) { saveFile() } setTimeout(() => w.remove(), 4000) }; return }
      case "del": { const f = fieldSel(); if (f && confirm(T("delQ"))) { st.fields = st.fields.filter((x) => x.id !== f.id); st.sel = st.fields[0] ? st.fields[0].id : null; save(); closeSheet(); render() } return }
    }
  });
  document.addEventListener("change", (e) => { const i = e.target.closest("#dv [data-opt]"); if (!i) return; setOpt(i.dataset.opt, i.type === "checkbox" ? i.checked : i.value); render(); optsSheet() });
  document.addEventListener("keydown", (e) => {
    const sh = $("#dvSheet"); if (e.key === "Escape" && sh && !sh.hidden) return closeSheet();
    if ((e.key === "Enter" || e.key === " ") && e.target.matches && e.target.matches("#dv .dv-hero, #dv tr[data-dvm]")) { e.preventDefault(); e.target.click() }
  });
  /* top-bar language buttons re-draw the panel; the brand (MEKONG) goes back to the dashboard */
  document.addEventListener("click", (e) => { if (e.target.closest("#lEn, #lVi")) setTimeout(() => { render(); backLabel() }, 30) });
  document.addEventListener("click", (e) => { if (e.target.closest("#brand") && $("#dv")) { e.preventDefault(); e.stopPropagation(); backToDash() } }, true);

  function init() {
    shell();
    let hq = 0; new MutationObserver(() => { if (!hq) hq = setTimeout(() => { hq = 0; hookPlanOk() }, 30) }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
    document.body.classList.toggle("dv-simple", !adv());
    if (location.hash === "#plan-lab") { document.body.classList.add("dv-off"); $("#dvBack").hidden = false; backLabel(); return }
    on = true; document.body.classList.add("dv-on"); render();
  }
  return { init, render, get state() { return st } };
})();
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(Dash.init, 0)); else setTimeout(Dash.init, 0);
