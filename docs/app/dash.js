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
      viewing: "Đang xem", nowTag: "(tháng này)", resetM: "Về tháng này", pickM: "Chọn tháng để xem", tapTile: "Chạm vào một ô để mở to và xem chi tiết. Chạm vào một tháng để xem tháng đó.", open: "Mở",
      saltA: "Độ mặn trong ruộng", rainMo: "Mưa tháng này", needMo: "Cây cần nước", cropH: "Trồng", needH: "Cây cần nước",
      mOk: (m) => `${m}: cây trồng an toàn`, mBad: (m) => `${m}: cây gặp nước mặn`, mRest: (m) => `${m}: không trồng lúa hay cây màu`,
      rangeK: "thấp nhất · giữa · cao nhất (triệu/công)", figs: "số liệu", cmpH: "So với các cách trồng khác", safeWhy: "Các tháng có lúa hoặc cây màu, tháng nào nước trong ruộng không mặn (dưới 2‰) là an toàn.",
      zOk: "An toàn", zBad: "Gặp mặn", whyScores: "Vì sao có điểm này", rainNeed: "Mưa và nước cây cần, từng tháng", ndviH: "Độ xanh của ruộng (NDVI, NASA MODIS)",
      kWhy: (n) => `(hiệu chỉnh bằng NASA MODIS: vệ tinh thấy ${n} vụ/năm, nên các vụ đó không mất mùa vì mặn năm thường).`,
      peakH: "Mặn cao nhất ở trạm", saltMs: "Tháng mặn", rainCmp: "Mưa từng tháng: năm thường và năm El Niño",
      delThis: "Xoá ruộng này", delH: (n) => `Xoá "${n}"?`, delP: "Kế hoạch của ruộng này sẽ bị xoá khỏi máy. Không lấy lại được.", delYes: "Xoá ruộng", cancel: "Không xoá", deleted: "Đã xoá ruộng",
      modeH: "Giao diện", modeS: "Đơn giản: ít chữ, chỉ điều cần làm", modeA: "Nâng cao: thêm số liệu, thanh kéo và nguồn",
      sNow: "Nước tháng này", sMoney: "Tiền lãi", sTodo: "Việc tháng này",
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
      viewing: "Viewing", nowTag: "(this month)", resetM: "Back to this month", pickM: "Pick a month to view", tapTile: "Tap a tile to open it large with details. Tap a month to view that month.", open: "Open",
      saltA: "Salt in the field", rainMo: "Rain this month", needMo: "Crop water need", cropH: "Growing", needH: "Crop water need",
      mOk: (m) => `${m}: crops are safe`, mBad: (m) => `${m}: crops meet salty water`, mRest: (m) => `${m}: no rice or upland crop`,
      rangeK: "lowest · middle · highest (M₫/công)", figs: "figures", cmpH: "Compared with other plans", safeWhy: "Months with rice or an upland crop; a month is safe when the field water is not salty (under 2‰).",
      zOk: "Safe", zBad: "Salty", whyScores: "Why these scores", rainNeed: "Rain and crop water need, month by month", ndviH: "Field greenness (NDVI, NASA MODIS)",
      kWhy: (n) => `(NASA MODIS calibration: the satellite sees ${n} crops a year, so those crops lose nothing to salt in a typical year).`,
      peakH: "Highest salt at the station", saltMs: "Salty months", rainCmp: "Rain by month: typical and El Niño years",
      delThis: "Delete this field", delH: (n) => `Delete "${n}"?`, delP: "This field's plan will be removed from this device. It cannot be undone.", delYes: "Delete field", cancel: "Keep it", deleted: "Field deleted",
      modeH: "View", modeS: "Simple: few words, just what to do", modeA: "Advanced: more numbers, sliders and sources",
      sNow: "Water this month", sMoney: "Profit", sTodo: "This month's job",
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
    warn: '<path d="M12 3.5 21.5 20h-19L12 3.5Z"/><path d="M12 10v4.5"/><path d="M12 17.4v.1"/>', check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', pin: '<path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.3"/>', bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15L6 16Z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>', basket: '<path d="M3.5 10h17l-2 9.5h-13L3.5 10Z"/><path d="M8 10l3-6M16 10l-3-6M9 14v2.5M12 14v2.5M15 14v2.5"/>',
    coin: '<circle cx="12" cy="12" r="9"/><path d="M12 7v10"/><path d="M14.6 9.2c-.4-.9-1.3-1.4-2.6-1.4-1.6 0-2.6.7-2.6 1.8 0 2.6 5.2 1.2 5.2 3.8 0 1.1-1.1 1.8-2.6 1.8-1.3 0-2.2-.6-2.6-1.5"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', cal: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>', print: '<path d="M6 9V3h12v6M6 18H4v-7h16v7h-2"/><path d="M6 14h12v7H6z"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    swap: '<path d="M7 7h12l-3-3M17 17H5l3 3"/>', map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14M15 6v14"/>', chev: '<path d="M9 6l6 6-6 6"/>', back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    expand: '<path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>',
    seed: '<path d="M12 20c-4 0-7-3-7-8 4 0 7 3 7 8Z"/><path d="M12 20c0-6 3-10 8-11 0 6-3 10-8 11Z"/>', drop: '<path d="M12 3.5c3.5 4.2 6 7.6 6 10.5a6 6 0 0 1-12 0c0-2.9 2.5-6.3 6-10.5Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
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
      <div id="dvSheet" class="dv-sheet" hidden><div class="dv-scrim" data-dv="close"></div><div class="dv-sh" role="dialog" aria-modal="true"><div class="dv-grab" aria-hidden="true"></div><div id="dvShBody"></div></div></div>
      <div id="dvZoom" class="dv-zoom" hidden><div class="z-scrim" data-dvz="close"></div><div id="dvZP" class="z-panel" role="dialog" aria-modal="true" aria-labelledby="dvZT"></div></div>`;
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
  /* the page title is the chosen field's own name, big, so a farmer sees at once which field this is */
  function pageHead() {
    const f = fieldSel(), eb = f ? T("brand") : T("eyebrow");
    const nm = f ? `<span class="dv-nm">${esc(f.name)}</span><small class="dv-area">${ic("pin", 16)}${esc(short(siteOf(f.site)))}</small>` : esc(T("brand"));
    return `<header class="dv-top${f ? " has-f" : ""}"><div class="dv-tt"><p class="sd-eyebrow">${esc(eb)}</p><h2 id="dvH" class="dv-name" data-k="${f ? esc(f.id) : ""}">${nm}</h2></div>
      <div class="dv-tr"><button type="button" class="btn gold dv-addtop" data-dv="add">${ic("plus", 18)}<span>${esc(T("addShort"))}</span></button></div></header>`;
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

  /* SIMPLE: few big cards, plain words, one big icon and one number each */
  function simplePage(f) {
    const x = facts(f), { c } = x, mon = shownMoney(f, x), k0 = c.months[CM][0];
    return `<div class="dv-s">
      <div class="dv-splan"><div><span>${esc(T("yourPlan"))}</span><b>${esc(L(c.name))}</b></div><button type="button" class="dv-deltop" data-dv="delask" aria-label="${esc(T("delThis"))}: ${esc(f.name)}" title="${esc(T("delThis"))}">${ic("trash", 20)}</button></div>
      ${remindCard(f)}
      ${progressCard(f)}
      ${suggestions(f)}
      <button type="button" class="s-card s-job" data-dv="plan"><span class="s-k">${ic("cal", 18)}${esc(T("monthOn")(CM + 1))}</span>
        <span class="s-big"><span class="s-ico k-${k0 === "-" ? "rest" : k0}">${ic({ R: "rice", S: "shrimp", U: "upland" }[k0] || "fallow", 34)}</span><b>${esc(x.job)}</b></span>
        <span class="s-sub">${ic("chev", 14)}${esc(T("nextM")(x.nm + 1))}: ${esc(jobAt(c, x.nm))}</span></button>
      <div class="s-card s-salt lv-${x.lv}"><span class="s-k">${ic("drop", 18)}${esc(T("waterNow"))}</span>
        <div class="s-row"><span class="s-drop" aria-hidden="true">${ic("drop", 46)}</span><div><b class="s-word">${esc(T("lv")[x.lv])}</b>
        <span class="s-light" aria-hidden="true"><i class="ngot"></i><i class="lo"></i><i class="man"></i></span></div></div>
        <span class="s-sub">${esc(x.sl.txt)}</span><small>${esc(T("est"))}</small></div>
      <div class="s-card s-money"><span class="s-k">${ic("coin", 18)}${esc(T("moneyH"))}</span>
        ${mon ? `<div class="s-row"><span class="s-coin" aria-hidden="true">${ic("coin", 46)}</span><div><b class="s-num">${mon.per}</b><span class="s-unit">${esc(T("perCong"))}</span></div></div>${mon.tot ? `<span class="s-sub">${esc(mon.tot)}</span>` : ""}` : `<span class="s-sub">${esc(T("noMoney"))}</span>`}
        <small>${esc(T("moneySrc"))}</small></div>
      ${x.clash.length ? `<div class="s-card s-warn">${ic("warn", 30)}<div><b>${esc(T("clash")(x.clash))}</b>${x.nino ? `<p>${ic("sun", 16)}${esc(T("ninoShort"))}</p>` : ""}</div></div>` : x.nino ? `<div class="s-card s-warn s-ok">${ic("check", 30)}<div><b>${esc(T("noClash"))}</b></div></div>` : ""}
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

  /* ADVANCED: dark data tiles. One month is "in view" (default: this month); every tile follows it.
     Tap a month on the chart or the strip to look at it, "Back to this month" to reset; tap a tile to open it large. */
  let selM = null, zoomKey = null;
  const mv = () => (selM == null ? CM : selM);
  const MLONG = (m) => (lang() === "vi" ? "Tháng " + (m + 1) : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][m]);
  const tile = (key, cls, head, body, src) => `<section class="a-t ${cls}" data-zoom="${key}" tabindex="0" role="button" aria-label="${esc(T("open"))}: ${head.replace(/<[^>]+>/g, "")}">
    <h4 class="a-h">${head}<span class="a-exp" aria-hidden="true">${ic("expand", 14)}</span></h4>${body}${src ? `<p class="a-src">${esc(src)}</p>` : ""}</section>`;
  function gauge(g, big) {
    const max = 4, v = Math.min(g, max), ang = (a) => Math.PI * (1 - a / max), pt = (a, r) => `${(60 + r * Math.cos(ang(a))).toFixed(2)} ${(60 - r * Math.sin(ang(a))).toFixed(2)}`;
    const arc = (a, b, cls) => `<path class="${cls}" d="M${pt(a, 48)} A48 48 0 0 1 ${pt(b, 48)}"/>`;
    return `<svg class="a-gauge${big ? " big" : ""}" viewBox="0 -4 120 76" role="img" aria-label="${nf(g, 1)}‰">${arc(0, 1, "z ngot")}${arc(1, 2, "z lo")}${arc(2, 4, "z man")}
      <line class="ndl" x1="60" y1="60" x2="${(60 + 40 * Math.cos(ang(v))).toFixed(2)}" y2="${(60 - 40 * Math.sin(ang(v))).toFixed(2)}"/><circle class="hub" cx="60" cy="60" r="4"/>
      <text x="8" y="71">0</text><text x="56" y="4">2</text><text x="104" y="71">4‰</text></svg>`;
  }
  /* salt (river and field) as lines, rain as bars; each month column is a button that puts that month in view */
  function lineChart(f, big) {
    const nino = isNino(f), s = siteOf(f.site), rain = (nino && s.el && s.el.rain) || s.rain || [], W0 = 320, H0 = big ? 170 : 150, pl = 26, pr = 26, pt = 12, pb = 20, m0 = mv();
    const rv = [...Array(12)].map((_, m) => riverSalt(f.site, m, nino)), fv = [...Array(12)].map((_, m) => fieldSalt(f.site, m, nino));
    const mx = Math.max(2, ...rv) * 1.1, rmx = Math.max(100, ...rain) * 1.1, X = (m) => pl + m * (W0 - pl - pr) / 11, Y = (v) => pt + (H0 - pt - pb) * (1 - v / mx), YR = (v) => H0 - pb - (H0 - pt - pb) * v / rmx;
    const line = (a) => a.map((v, m) => `${m ? "L" : "M"}${X(m).toFixed(1)} ${Y(v).toFixed(1)}`).join(" ");
    const cw = (W0 - pl - pr) / 11, bw = cw * .55;
    return `<svg class="a-line" viewBox="0 0 ${W0} ${H0}" role="group" aria-label="${esc(T("chartL"))}">
      ${[0, .5, 1].map((k) => `<line class="gr" x1="${pl}" x2="${W0 - pr}" y1="${(pt + (H0 - pt - pb) * k).toFixed(1)}" y2="${(pt + (H0 - pt - pb) * k).toFixed(1)}"/><text class="ax" x="${pl - 4}" y="${(pt + (H0 - pt - pb) * k + 3).toFixed(1)}" text-anchor="end">${nf(mx * (1 - k), 0)}</text><text class="ax r" x="${W0 - pr + 4}" y="${(pt + (H0 - pt - pb) * k + 3).toFixed(1)}">${Math.round(rmx * (1 - k))}</text>`).join("")}
      <rect class="selb" x="${(X(m0) - cw / 2).toFixed(1)}" y="${pt - 6}" width="${cw.toFixed(1)}" height="${H0 - pb - pt + 6}" rx="4"/>
      ${rain.map((v, m) => `<rect class="rn${m === m0 ? " on" : ""}" x="${(X(m) - bw / 2).toFixed(1)}" y="${YR(v).toFixed(1)}" width="${bw.toFixed(1)}" height="${(H0 - pb - YR(v)).toFixed(1)}"/>`).join("")}
      <line class="th" x1="${pl}" x2="${W0 - pr}" y1="${Y(2).toFixed(1)}" y2="${Y(2).toFixed(1)}"/>
      <path class="lr" d="${line(rv)}"/><path class="lf" d="${line(fv)}"/>
      ${fv.map((v, m) => `<circle class="pf ${level(v)}" cx="${X(m).toFixed(1)}" cy="${Y(v).toFixed(1)}" r="${m === m0 ? 4.5 : 2.4}"/>`).join("")}
      <line class="nowl" x1="${X(CM).toFixed(1)}" x2="${X(CM).toFixed(1)}" y1="${pt}" y2="${H0 - pb}"/>
      ${MS().map((t, m) => `<text class="ax${m === m0 ? " on" : ""}" x="${X(m).toFixed(1)}" y="${H0 - 6}" text-anchor="middle">${t}</text>`).join("")}
      ${[...Array(12)].map((_, m) => `<rect class="hit" data-dvsel="${m}" role="button" tabindex="-1" aria-label="${esc(MLONG(m))}" x="${(X(m) - cw / 2).toFixed(1)}" y="0" width="${cw.toFixed(1)}" height="${H0}"/>`).join("")}</svg>
      <p class="a-key"><span><i class="k lf"></i>${esc(T("field"))} ‰</span><span><i class="k lr"></i>${esc(T("river"))} ‰</span><span><i class="k rn"></i>${esc(T("rainM"))} mm</span><span><i class="k th"></i>2‰</span></p>`;
  }
  function donut(n, of, lab) {
    const r = 34, C0 = 2 * Math.PI * r, k = of ? n / of : 0;
    return `<div class="a-donut"><svg viewBox="0 0 90 90" aria-hidden="true"><circle class="bg" cx="45" cy="45" r="${r}"/><circle class="fg" cx="45" cy="45" r="${r}" stroke-dasharray="${(C0 * k).toFixed(1)} ${C0.toFixed(1)}" transform="rotate(-90 45 45)"/></svg>
      <div class="a-dv"><b>${n}<small>/${of}</small></b><span>${esc(lab)}</span></div></div>`;
  }
  /* the month strip: 12 buttons coloured by the field's water level, crop icon on top; the one in view is raised */
  function monthStrip(f, c) {
    const nino = isNino(f), m0 = mv();
    return `<div class="a-months"><div class="a-mhead"><span class="a-mut">${esc(T("viewing"))}</span><b>${esc(MLONG(m0))}${m0 === CM ? ` <em>${esc(T("nowTag"))}</em>` : ""}</b>
        ${m0 !== CM ? `<button type="button" class="a-reset" data-dvsel="now">${ic("back", 14)}<span>${esc(T("resetM"))}</span></button>` : ""}</div>
      <div class="a-mstrip" role="group" aria-label="${esc(T("pickM"))}">${[...Array(12)].map((_, m) => { const lv = level(fieldSalt(f.site, m, nino)), code = c.months[m];
        return `<button type="button" class="lv-${lv}${m === m0 ? " on" : ""}${m === CM ? " now" : ""}" data-dvsel="${m}" aria-pressed="${m === m0}" aria-label="${esc(MLONG(m))}: ${esc(T("lv")[lv])}, ${esc(cropName(c, code))}">${iconOf(code)}<span>${MS()[m]}</span><i></i></button>` }).join("")}</div></div>`;
  }
  function advData(f) {
    const x = facts(f), { c, s, nino } = x, m = mv(), g = fieldSalt(f.site, m, nino), lv = level(g);
    const crop = c.months.map((code, i) => code[0] === "R" || code[0] === "U" ? i : -1).filter((i) => i >= 0);
    const safe = crop.filter((i) => level(fieldSalt(f.site, i, nino)) !== "man").length;
    const t = (() => { try { return RX.DATA.sites.find((y) => y.id === f.site) } catch (e) { return null } })(), k = t ? RX.Model.kFor(t).k : null;
    const rainA = (nino && s.el && s.el.rain) || s.rain || [], et0A = (nino && s.el && s.el.et0) || s.et0 || [];
    curSite = f.site; curNino = nino;
    const job = jobAt(c, m); let nk = 1; while (nk < 12 && jobAt(c, (m + nk) % 12) === job) nk++;
    return { ...x, m, g, lv, crop, safe, t, k, rainA, et0A, job, nm: (m + nk) % 12, mon: shownMoney(f, x), r: rank(f) };
  }
  function advPage(f) {
    const d = advData(f), { c, s, nino, m } = d, best = d.r.find((y) => !y.no);
    const rain = d.rainA.reduce((a, b) => a + b, 0), et0 = d.et0A.reduce((a, b) => a + b, 0), cropM = c.months[m][0] === "R" || c.months[m][0] === "U";
    return `<div class="dv-a">
      <div class="a-bar"><div><span class="a-mut">${esc(T("yourPlan"))}</span><b>${esc(L(c.name))}</b></div><span class="a-bar-r"><span class="a-pill${nino ? " hot" : ""}">${esc(nino ? T("years").elnino : T("years").typical)}</span><button type="button" class="dv-deltop" data-dv="delask" aria-label="${esc(T("delThis"))}: ${esc(f.name)}" title="${esc(T("delThis"))}">${ic("trash", 20)}</button></span></div>
      ${remindCard(f)}
      <div class="a-duo">${progressCard(f)}${suggestions(f)}</div>
      ${monthStrip(f, c)}
      <p class="a-tip">${ic("expand", 14)}${esc(T("tapTile"))}</p>
      <div class="a-grid">
        ${tile("salt", "a-g1", `${esc(T("saltA"))} · ${esc(MS()[m])}`, `${gauge(d.g)}<p class="a-num">${nf(d.g, 1)}<small>‰</small></p><p class="a-mut lv-${d.lv}">${esc(T("lv")[d.lv])} · ${esc(T("lvD")[d.lv])}</p>`, T("est"))}
        ${tile("chart", "a-g2", esc(T("chartH")), lineChart(f), lang() === "vi" ? "Mặn: trạm đo + NASA POWER (ước tính) · Mưa: NASA GPM IMERG · chạm một tháng để xem" : "Salt: stations + NASA POWER (estimate) · Rain: NASA GPM IMERG · tap a month to view it")}
        ${tile("safe", "a-g3", esc(T("safeH")), `${donut(d.safe, d.crop.length, T("safeL"))}<p class="a-mut">${cropM ? esc((level(fieldSalt(f.site, m, nino)) === "man" ? T("mBad") : T("mOk"))(MS()[m])) : esc(T("mRest")(MS()[m]))}</p>`, T("est"))}
        ${tile("money", "a-g4", esc(T("moneyH")), d.mon ? `<p class="a-num big">${d.mon.per}<small> ${esc(T("perCongS"))}</small></p>${d.shown ? rangeBar(d.shown) : ""}${d.mon.tot ? `<p class="a-mut">${esc(d.mon.tot)}</p>` : ""}` : `<p class="a-mut">${esc(T("noMoney"))}</p>`, T("moneySrc"))}
        ${tile("job", "a-g5", esc(T("monthOn")(m + 1)), `<p class="a-job">${iconOf(c.months[m])}<b>${esc(d.job)}</b></p><p class="a-mut">${esc(T("nextM")(d.nm + 1))}: ${esc(jobAt(c, d.nm))}</p>`, "")}
        ${tile("scores", "a-g6", esc(T("scoreH")), `<div class="a-bars">${["salt", "water", "soil", "income"].map((q) => { const v = c.scores[q]; return `<div><span>${esc(T("sc")[q])}</span><i><b style="width:${v == null ? 0 : (v - 1) / 4 * 100}%"></b></i><em>${v == null ? "–" : nf(v, 1)}</em></div>` }).join("")}</div>${c.confidence ? `<p class="a-mut">${esc(T("conf"))}: ${esc(T("confL")[c.confidence] || c.confidence)}</p>` : ""}`, T("scSrc"))}
        ${tile("nums", "a-g7", `${esc(T("nums"))} · ${esc(MS()[m])}`, `<dl class="a-kpi"><div><dt>${esc(T("rainMo"))}</dt><dd>${nf(Math.round(d.rainA[m] || 0), 0)}<small> mm</small></dd><small>NASA GPM IMERG</small></div>
          <div><dt>${esc(T("needMo"))}</dt><dd>${nf(Math.round(d.et0A[m] || 0), 0)}<small> mm</small></dd><small>NASA POWER</small></div>
          <div><dt>${esc(T("cropsY"))}</dt><dd>${typeof s.crops === "number" ? nf(s.crops, 1) : "–"}</dd><small>NASA MODIS NDVI</small></div>
          <div><dt>${esc(T("rainY"))}</dt><dd>${nf(Math.round(rain), 0)}<small> mm</small></dd><small>${esc(T("needY"))}: ${nf(Math.round(et0), 0)} mm</small></div></dl>`, "")}
        ${tile("rank", "a-g8", esc(T("rankH")), `<ol class="a-rank">${d.r.slice(0, 5).map(({ c: y, s: sc, no }) => `<li class="${y.id === f.rot ? "cur" : ""}${no ? " no" : ""}"><span>${esc(L(y.name))}</span><i><b style="width:${((sc - 1) / 4 * 100).toFixed(0)}%"></b></i><em>${nf(sc, 1)}</em></li>`).join("")}</ol>${best && best.c.id !== f.rot ? `<p class="a-mut">${esc(T("bestFor")(L(best.c.name)))}</p>` : ""}`, T("rankSrc"))}
        ${tile("rib", "a-g9", `${ic("cal", 14)}${esc(T("ribbonH"))}`, `<div class="a-rib">${ribbon(f, c, true)}</div>`, T("est"))}
        ${nino ? tile("nino", "a-g10 hot", esc(T("ninoH")), `<p class="a-num">&gt;83<small>%</small></p><p class="a-mut">${esc(T("ninoNote"))}</p>`, "NOAA CPC") : ""}
      </div>
      <div class="dv-acts a-acts"><button type="button" class="btn gold" data-dv="choose">${ic("swap", 16)}<span>${esc(T("change"))}</span></button><button type="button" class="btn" data-dv="plan">${ic("cal", 16)}<span>${esc(T("tapPlanS"))}</span></button><button type="button" class="btn" data-dv="paper">${ic("print", 16)}<span>${esc(T("print"))}</span></button>
        <button type="button" class="btn" data-dv="editmap">${ic("map", 16)}<span>${esc(T("editMap"))}</span></button><button type="button" class="btn" data-dv="opts">${ic("edit", 16)}<span>${esc(T("editAns"))}</span></button><button type="button" class="btn" data-open="sources"><span>${esc(T("sources"))}</span></button></div>
      <p class="a-src">${esc(T("ask"))}</p></div>`;
  }
  function rangeBar(p) {
    const lo = p.lo, hi = Math.max(p.hi, lo + .1), at = (v) => ((v - lo) / (hi - lo) * 100).toFixed(1);
    return `<div class="a-range" aria-label="${esc(T("range")(cong(p.lo), cong(p.mid), cong(p.hi)))}"><i><b style="left:${at(p.mid)}%"></b></i><span><em>${cong(p.lo)}</em><em>${cong(p.mid)}</em><em>${cong(p.hi)}</em></span><small>${esc(T("rangeK"))}${p.n ? ` · ${p.n} ${esc(T("figs"))}` : ""}</small></div>`;
  }

  /* ---------- a tile opened large ---------- */
  function zoomTitle(key, d) {
    return { salt: T("saltA"), chart: T("chartH"), safe: T("safeH"), money: T("moneyH"), job: T("monthOn")(d.m + 1), scores: T("scoreH"), nums: T("nums"), rank: T("rankH"), rib: T("ribbonH"), nino: T("ninoH") }[key] || "";
  }
  function monthTable(f, d, cols) {
    return `<div class="z-tw"><table class="z-t"><thead><tr><th>${esc(T("tMonth"))}</th>${cols.map((x) => `<th>${esc(x.h)}</th>`).join("")}</tr></thead><tbody>${[...Array(12)].map((_, i) =>
      `<tr class="${i === d.m ? "on" : ""}${i === CM ? " now" : ""}" data-dvsel="${i}" tabindex="0"><th scope="row">${MS()[i]}</th>${cols.map((x) => `<td>${x.v(i)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  }
  function zoomBody(key, f) {
    const d = advData(f), { c, s, nino, m } = d, lvCell = (i) => { const lv = level(fieldSalt(f.site, i, nino)); return `<span class="z-lv lv-${lv}">${esc(T("lv")[lv])}</span>` };
    const cropCell = (i) => `<span class="z-crop">${iconOf(c.months[i])}${esc(cropName(c, c.months[i]))}</span>`;
    switch (key) {
      case "salt": return `<div class="z-hero">${gauge(d.g, true)}<div><p class="a-num big">${nf(d.g, 1)}<small>‰</small></p><p class="z-lvw lv-${d.lv}">${esc(T("lv")[d.lv])}</p><p class="a-mut">${esc(T("lvD")[d.lv])}</p></div></div>
        <ul class="z-scale">${["ngot", "lo", "man"].map((x) => `<li class="lv-${x}"><i></i><b>${esc(T("lv")[x])}</b><span>${esc(T("lvD")[x])}</span></li>`).join("")}</ul>
        ${monthTable(f, d, [{ h: T("river"), v: (i) => nf(riverSalt(f.site, i, nino), 1) + "‰" }, { h: T("field"), v: (i) => nf(fieldSalt(f.site, i, nino), 1) + "‰" }, { h: T("tSalt"), v: lvCell }, { h: T("cropH"), v: cropCell }])}
        <p class="a-mut">${lang() === "vi" ? "Trong ruộng = sông × " : "Field = river × "}<b>${d.k == null ? "–" : nf(d.k, 2)}</b> ${esc(T("kWhy")(nf(s.crops, 1)))}</p><p class="a-src">${esc(T("est"))}</p>`;
      case "chart": return `${lineChart(f, true)}${monthTable(f, d, [{ h: T("rainM") + " mm", v: (i) => nf(Math.round(d.rainA[i] || 0), 0) }, { h: T("needH") + " mm", v: (i) => nf(Math.round(d.et0A[i] || 0), 0) }, { h: T("river"), v: (i) => nf(riverSalt(f.site, i, nino), 1) + "‰" }, { h: T("field"), v: (i) => nf(fieldSalt(f.site, i, nino), 1) + "‰" }])}
        <p class="a-src">${lang() === "vi" ? "Mưa: NASA GPM IMERG · Cây cần nước: NASA POWER (phương pháp FAO) · Mặn: ước tính từ báo cáo trạm đo, không đo bằng vệ tinh" : "Rain: NASA GPM IMERG · Crop water need: NASA POWER (FAO method) · Salt: estimate from station reports, not satellite"}</p>`;
      case "safe": return `<div class="z-hero">${donut(d.safe, d.crop.length, T("safeL"))}<p class="a-mut">${esc(T("safeWhy"))}</p></div>
        <ol class="z-cal">${[...Array(12)].map((_, i) => { const code = c.months[i], grow = code[0] === "R" || code[0] === "U", lv = level(fieldSalt(f.site, i, nino)), bad = grow && lv === "man";
          return `<li class="${bad ? "bad" : grow ? "ok" : "rest"}${i === m ? " on" : ""}" data-dvsel="${i}"><b>${MS()[i]}</b>${iconOf(code)}<span>${esc(cropName(c, code))}</span><em>${grow ? esc(bad ? T("zBad") : T("zOk")) : esc(T("crop")[code[0] === "S" ? "S" : "-"])}</em></li>` }).join("")}</ol>
        <p class="a-mut">${esc(d.clash.length ? T("clash")(d.clash) : T("noClash"))}</p><p class="a-src">${esc(T("est"))}</p>`;
      case "money": { const top = d.r.slice(0, 5).map(({ c: y }) => ({ y, p: profit(y) })).filter((x) => x.p), mx = Math.max(1, ...top.map((x) => x.p.hi));
        return `${d.mon ? `<div class="z-hero"><p class="a-num big">${d.mon.per}<small> ${esc(T("perCongS"))}</small></p><div>${rangeBar(d.shown)}${d.mon.tot ? `<p class="a-mut">${esc(d.mon.tot)}</p>` : ""}</div></div>` : `<p class="a-mut">${esc(T("noMoney"))}</p>`}
        ${d.p && d.pe && d.p.mid !== d.pe.mid ? `<p class="a-mut">${esc(T("years").typical)}: <b>${cong(d.p.mid)}</b> · ${esc(T("years").elnino)}: <b>${cong(d.pe.mid)}</b> ${esc(T("perCongS"))}</p>` : ""}
        <h5 class="z-h">${esc(T("cmpH"))}</h5><ul class="z-bars">${top.map(({ y, p }) => `<li class="${y.id === f.rot ? "cur" : ""}"><span>${esc(L(y.name))}</span><i><b style="left:${(p.lo / mx * 100).toFixed(1)}%;width:${((p.hi - p.lo) / mx * 100).toFixed(1)}%"></b><u style="left:${(p.mid / mx * 100).toFixed(1)}%"></u></i><em>${cong(p.mid)}</em></li>`).join("")}</ul>
        <p class="a-src">${esc(T("moneySrc"))}</p>`; }
      case "job": { const code = c.months[m], r = code === "-" ? null : DATA.resources[resKey(c, code)];
        return `<div class="z-hero"><span class="z-big">${ic({ R: "rice", S: "shrimp", U: "upland" }[code[0]] || "fallow", 44)}</span><div><p class="a-job"><b>${esc(d.job)}</b></p><p class="a-mut">${esc(cropName(c, code))}</p></div></div>
        ${r ? `<dl class="z-dl"><div><dt>${ic("seed", 18)}${esc(T("seed"))}</dt><dd>${esc(L(r.seed))}</dd></div>${r.fertiliser && L(r.fertiliser) ? `<div><dt>${ic("drop", 18)}${esc(T("fert"))}</dt><dd>${esc(L(r.fertiliser))}</dd></div>` : ""}</dl>
          <h5 class="z-h">${esc(T("steps"))}</h5><ol class="z-steps">${(r.steps || []).map((x) => `<li>${esc(L(x))}</li>`).join("")}</ol>` : ""}
        <h5 class="z-h">${esc(T("nextM")(d.nm + 1))}</h5><p class="a-job sm">${iconOf(c.months[d.nm])}<span>${esc(jobAt(c, d.nm))}</span></p><p class="a-src">${esc(T("ask"))}</p>`; }
      case "scores": return `<div class="a-bars z-sc">${["salt", "water", "soil", "income"].map((q) => { const v = c.scores[q]; return `<div><span>${esc(T("sc")[q])}</span><i><b style="width:${v == null ? 0 : (v - 1) / 4 * 100}%"></b></i><em>${v == null ? "–" : nf(v, 1)}</em></div>` }).join("")}</div>
        <h5 class="z-h">${esc(T("whyScores"))}</h5><ul class="z-why">${(c.why || []).map((x) => `<li>${esc(L(x))}</li>`).join("")}</ul>${whyFit(c, f)}<p class="a-src">${esc(T("scSrc"))}</p>`;
      case "nums": { const nd = (nino && s.el && s.el.ndvi) || s.ndvi || [], mr = Math.max(1, ...d.rainA, ...d.et0A);
        return `<h5 class="z-h">${esc(T("rainNeed"))}</h5><div class="z-rn">${[...Array(12)].map((_, i) => `<button type="button" class="${i === m ? "on" : ""}" data-dvsel="${i}" aria-label="${esc(MLONG(i))}"><i class="r" style="height:${(d.rainA[i] / mr * 100).toFixed(0)}%"></i><i class="n" style="bottom:${(d.et0A[i] / mr * 100).toFixed(0)}%"></i><span>${MS()[i]}</span></button>`).join("")}</div>
        <p class="a-key"><span><i class="k rn"></i>${esc(T("rainM"))} (NASA GPM IMERG)</span><span><i class="k lf"></i>${esc(T("needH"))} (NASA POWER)</span></p>
        ${nd.length ? `<h5 class="z-h">${esc(T("ndviH"))}</h5><div class="z-nd">${nd.map((v, i) => `<i class="${i === m ? "on" : ""}" style="height:${(Math.max(0, v) * 100).toFixed(0)}%" title="${MS()[i]}: ${nf(v, 2)}"></i>`).join("")}</div><p class="a-mut">${esc(T("seen")(nf(s.crops, 1)))}</p>` : ""}`; }
      case "rank": return `<div class="dv-opts-list">${d.r.map(({ c: y, s: sc, no }) => `<div class="dv-optc${y.id === f.rot ? " cur" : ""}${no ? " no" : ""}"><div class="dv-optt"><b>${esc(L(y.name))}</b><small>${esc(L(y.calendar))}</small><span class="sd-chip">${esc(T("fit"))} ${nf(sc, 1)}/5</span>${whyFit(y, f)}</div>
        ${y.id === f.rot ? `<span class="sd-chip lv-low">${esc(T("current"))}</span>` : `<button type="button" class="btn gold" data-use="${y.id}">${esc(T("use"))}</button>`}</div>`).join("")}</div><p class="a-src">${esc(T("rankSrc"))}</p>`;
      case "rib": return `${ribbon(f, c)}<p class="sd-note">${esc(T("tapMonth"))}</p>${planTable(f, c)}<p class="a-src">${esc(T("est"))}</p>`;
      case "nino": { const ty = d.t, tr = s.rain || [], er = (s.el && s.el.rain) || [], mr = Math.max(1, ...tr, ...er);
        return `<p class="a-num">&gt;83<small>%</small></p><p class="a-mut">${esc(L(DATA.outlook && DATA.outlook.text))}</p>
        ${ty && ty.nino ? `<dl class="a-kpi z-kpi"><div><dt>${esc(T("peakH"))} · ${esc(T("years").typical)}</dt><dd>${nf(ty.peak, 1)}<small>‰</small></dd></div><div><dt>${esc(T("peakH"))} · El Niño</dt><dd>${nf(ty.nino.peak, 1)}<small>‰</small></dd></div>
          <div><dt>${esc(T("saltMs"))} · ${esc(T("years").typical)}</dt><dd class="sm">${(ty.salt || []).map((x) => "T" + x).join(", ") || "–"}</dd></div><div><dt>${esc(T("saltMs"))} · El Niño</dt><dd class="sm">${(ty.nino.salt || []).map((x) => "T" + x).join(", ") || "–"}</dd></div></dl>` : ""}
        <h5 class="z-h">${esc(T("rainCmp"))}</h5><div class="z-cmp">${MS().map((t, i) => `<div><i class="a" style="height:${((tr[i] || 0) / mr * 100).toFixed(0)}%"></i><i class="b" style="height:${((er[i] || 0) / mr * 100).toFixed(0)}%"></i><span>${t}</span></div>`).join("")}</div>
        <p class="a-key"><span><i class="k lr"></i>${esc(T("years").typical)}</span><span><i class="k th"></i>${esc(T("years").elnino)}</span></p><p class="a-src">NOAA CPC · NASA GPM IMERG · ${esc(T("est"))}</p>`; }
    }
    return "";
  }
  function zoomHTML(f) {
    const d = advData(f);
    return `<div class="z-head"><div><p class="a-mut">${esc(f.name)} · ${esc(short(d.s))} · ${esc(T("viewing"))} ${esc(MLONG(d.m))}</p><h3 id="dvZT">${esc(zoomTitle(zoomKey, d))}</h3></div>
      <button type="button" class="icon-btn z-x" data-dvz="close" aria-label="${esc(T("close"))}">${ic("x", 20)}</button></div>
      ${zoomKey === "rank" || zoomKey === "scores" || zoomKey === "money" ? "" : monthStrip(f, d.c)}
      <div class="z-body">${zoomBody(zoomKey, f)}</div>`;
  }
  /* open: the panel grows out of the tile it came from (FLIP), close: it shrinks back into it */
  function zoomOpen(key, fromEl) {
    const f = fieldSel(); if (!f) return;
    zoomKey = key;
    const z = $("#dvZoom"), p = $("#dvZP");
    p.innerHTML = zoomHTML(f); z.hidden = false; document.body.classList.add("dv-zoomed");
    const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (fromEl && !reduce && p.animate) {
      const a = fromEl.getBoundingClientRect(), b = p.getBoundingClientRect();
      p.animate([{ transform: `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${a.width / b.width}, ${a.height / b.height})`, opacity: .4, borderRadius: "14px" },
        { transform: "none", opacity: 1, borderRadius: "20px" }], { duration: 320, easing: "cubic-bezier(.22,1,.36,1)" });
      z.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220 });
    }
    zoomFrom = fromEl ? fromEl.dataset.zoom : null;
    setTimeout(() => { const x = p.querySelector(".z-x"); x && x.focus({ preventScroll: true }) }, 30);
  }
  let zoomFrom = null;
  function zoomClose() {
    const z = $("#dvZoom"); if (!z || z.hidden) return;
    const p = $("#dvZP"), t = zoomFrom && document.querySelector(`#dvPanel [data-zoom="${zoomFrom}"]`), reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    let fin = false;
    const done = () => { if (fin) return; fin = true; z.hidden = true; zoomKey = null; document.body.classList.remove("dv-zoomed"); t && t.focus({ preventScroll: true }) };
    if (t && !reduce && p.animate) {
      const a = t.getBoundingClientRect(), b = p.getBoundingClientRect();
      p.animate([{ transform: "none", opacity: 1 }, { transform: `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${a.width / b.width}, ${a.height / b.height})`, opacity: .2 }], { duration: 220, easing: "cubic-bezier(.4,0,1,1)" }).onfinish = done;
      setTimeout(done, 260);   /* never left half-closed if the animation is paused (background tab) */
      z.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220 });
    } else done();
  }
  function setSel(m) {
    selM = m === "now" ? null : +m;
    render();
    const f = fieldSel(), p = $("#dvZP");
    if (zoomKey && f && p) { const y = p.scrollTop; p.innerHTML = zoomHTML(f); p.scrollTop = y }
  }
  /* ---------------- suggestions, month check-off, feedback after the 12 months ---------------- */
  Object.assign(W.vi, {
    sgH: "Gợi ý cho bạn", sgJob: (m, j) => `Tháng ${m}: ${j}`,
    sgSaltNow: "Nước đang mặn: đo độ mặn trước khi bơm nước vào ruộng. Lúa cần nước dưới 1‰.",
    sgSaltSoon: (m) => `Mặn có thể về từ tháng ${m}: trữ đủ nước ngọt dùng khoảng 15 ngày trong ao, kênh, bồn.`,
    sgSow: "Chỉ gieo sạ khi có nước ngọt ổn định, theo lịch xuống giống của địa phương.",
    sgClash: (ms) => `Cây trồng gặp nước mặn vào ${ms}. Xem cách trồng chịu mặn hơn.`, sgBetter: (n) => `Cách trồng hợp hơn với ưu tiên của bạn: ${n}`,
    sgNino: "Năm El Niño: mặn có thể về sớm và sâu hơn. Theo dõi bản tin độ mặn của tỉnh trên Zalo, đài và loa xã.",
    sgSize: "Nhập diện tích ruộng để xem tiền vốn và tiền lời cho cả ruộng.", sgSrc: "Theo khuyến cáo của ngành nông nghiệp Sóc Trăng (báo Nhân Dân 20/5/2024; Nông nghiệp và Môi trường 23/2/2024). Độ mặn là ước tính.",
    sgGo: "Xem", sgOpen: "Đổi cách trồng", sgEdit: "Sửa ruộng", sgPrev: "Gợi ý trước", sgNext: "Gợi ý sau",
    pgH: "Tiến độ 12 tháng", pgOf: (n) => `${n}/12 tháng xong`, pgD: "Tháng đã qua được đánh dấu tự động. Chạm một tháng để đánh dấu hoặc bỏ đánh dấu.",
    pgTick: (m) => `Xong việc tháng ${m}`, pgDone: (m) => `Đã xong tháng ${m}`, pgAuto: "tự động", pgFuture: "chưa tới",
    pgStart: (m, y) => `Bắt đầu: tháng ${m}/${y}`, pgAt: (k) => `Tháng ${k}/12`,
    yourPlan: "Kế hoạch của bạn", pgLeft: (n) => (n ? `Còn ${n} tháng nữa` : "Đã đi hết 12 tháng"), pgToday: "Hôm nay", pgDoneL: "Đã qua", pgNextL: "Sắp tới",
    rmH: "Nhắc việc gieo và thu hoạch", rmSow: "Gieo sạ", rmStock: "Thả giống", rmHar: "Thu hoạch",
    rmNow: "Ngay tháng này!", rmNext: "Tháng sau", rmIn: (n) => `Còn ${n} tháng`, rmNone: "Không có vụ gieo hay thu hoạch trong 12 tháng tới.",
    rmSalt: "Lúc đó nước có thể mặn: đo độ mặn trước khi lấy nước vào ruộng.",
    rmCal: "Thêm nhắc nhở vào lịch điện thoại", rmCalD: "Điện thoại sẽ báo trước 3 ngày. Tháng là gần đúng, hãy theo lịch xuống giống của địa phương.",
    rmCalOk: "Đã tải tệp lịch. Mở tệp để thêm vào lịch điện thoại.", rmFile: "nhac-gieo-thu-hoach.ics",
    fbAsk: "Đã hết 12 tháng! Kế hoạch có giúp được bạn không? Cho chúng tôi biết nhé.", fbBtn: "Góp ý về kế hoạch", fbEarly: "Góp ý sớm",
    fbH: "Góp ý về kế hoạch 12 tháng", fbRate: "Kế hoạch giúp bạn thế nào?", fbRates: ["Không giúp", "Ít", "Tạm được", "Tốt", "Rất tốt"],
    fbCrop: "Mùa vụ năm nay", fbCrops: { good: "Được mùa", ok: "Bình thường", bad: "Mất mùa" },
    fbSalt: "Mặn có làm hại cây trồng không?", fbYes: "Có", fbNo: "Không", fbNote: "Bạn muốn nói thêm gì? (không bắt buộc)",
    fbSave: "Gửi góp ý", fbThanks: "Cảm ơn bạn đã góp ý!", fbLocal: "Góp ý được lưu trên máy này. Bạn có thể gửi cho cán bộ khuyến nông.",
    fbShare: "Chia sẻ góp ý", fbEdit: "Sửa góp ý", fbNew: "Bắt đầu 12 tháng mới", fbNeed: "Hãy chọn mức giúp đỡ (1 đến 5 sao)", fbCopied: "Đã chép góp ý", fbLater: "Để sau", fbNewP: "Dấu tích các tháng và góp ý hiện tại sẽ được cất vào lịch sử, rồi bắt đầu đếm lại từ tháng này.",
    fbShareT: (n, r, c, sl, note) => `Góp ý kế hoạch 12 tháng (${n}): ${r}/5 sao. Mùa vụ: ${c}. Mặn hại cây: ${sl}.${note ? " " + note : ""}`
  });
  Object.assign(W.en, {
    sgH: "Suggestions for you", sgJob: (m, j) => `Month ${m}: ${j}`,
    sgSaltNow: "The water is salty: measure salt before pumping water in. Rice needs water under 1‰.",
    sgSaltSoon: (m) => `Salt may come from month ${m}: store enough fresh water for about 15 days in ponds, canals or tanks.`,
    sgSow: "Sow only when fresh water is steady, on your local sowing calendar.",
    sgClash: (ms) => `Your crops meet salty water in ${ms}. Look at a more salt-tolerant plan.`, sgBetter: (n) => `A better fit for your priorities: ${n}`,
    sgNino: "El Niño year: salt may come earlier and go further inland. Follow the province's salt bulletins on Zalo, radio and commune speakers.",
    sgSize: "Enter your field size to see cost and profit for the whole field.", sgSrc: "From Sóc Trăng farm-sector advice (Nhân Dân 20 May 2024; Nông nghiệp và Môi trường 23 Feb 2024). Salt is an estimate.",
    sgGo: "See", sgOpen: "Change plan", sgEdit: "Edit field", sgPrev: "Previous tip", sgNext: "Next tip",
    pgH: "12-month progress", pgOf: (n) => `${n} of 12 months done`, pgD: "Months that have passed are ticked for you. Tap a month to tick or untick it.",
    pgTick: (m) => `Month ${m} done`, pgDone: (m) => `Month ${m} is done`, pgAuto: "auto", pgFuture: "not yet",
    pgStart: (m, y) => `Started: ${m}/${y}`, pgAt: (k) => `Month ${k} of 12`,
    yourPlan: "Your plan", pgLeft: (n) => (n ? `${n} months to go` : "All 12 months done"), pgToday: "Today", pgDoneL: "Passed", pgNextL: "Coming",
    rmH: "Sowing and harvest reminders", rmSow: "Sow", rmStock: "Stock", rmHar: "Harvest",
    rmNow: "This month!", rmNext: "Next month", rmIn: (n) => `In ${n} months`, rmNone: "No sowing or harvest in the next 12 months.",
    rmSalt: "The water may be salty then: measure salt before letting water in.",
    rmCal: "Add reminders to my phone calendar", rmCalD: "Your phone will remind you 3 days before. Months are approximate: follow your local sowing calendar.",
    rmCalOk: "Calendar file downloaded. Open it to add it to your phone calendar.", rmFile: "sow-harvest-reminders.ics",
    fbAsk: "Your 12 months are over! Did the plan help? Please tell us.", fbBtn: "Give feedback on the plan", fbEarly: "Give feedback now",
    fbH: "Feedback on your 12-month plan", fbRate: "How much did the plan help?", fbRates: ["Not at all", "A little", "Okay", "Good", "Very good"],
    fbCrop: "This year's harvest", fbCrops: { good: "Good", ok: "Normal", bad: "Lost" },
    fbSalt: "Did salt harm your crops?", fbYes: "Yes", fbNo: "No", fbNote: "Anything else? (optional)",
    fbSave: "Send feedback", fbThanks: "Thank you for your feedback!", fbLocal: "Your feedback is saved on this device. You can send it to your extension officer.",
    fbShare: "Share feedback", fbEdit: "Edit feedback", fbNew: "Start a new 12 months", fbNeed: "Please pick how much it helped (1 to 5 stars)", fbCopied: "Feedback copied", fbLater: "Later", fbNewP: "This year's ticks and feedback are kept in the history, and counting starts again from this month.",
    fbShareT: (n, r, c, sl, note) => `12-month plan feedback (${n}): ${r}/5 stars. Harvest: ${c}. Salt harmed crops: ${sl}.${note ? " " + note : ""}`
  });
  const MNUM = (m) => (lang() === "vi" ? "T" + (m + 1) : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m]);
  const startOf = (f) => { const d = new Date(f.startAt || f.savedAt || Date.now()); return { y: d.getFullYear(), m: d.getMonth() } };
  function months12(f) {
    const s0 = startOf(f), now = new Date(), ni = now.getFullYear() * 12 + now.getMonth(), d = f.done || {};
    return [...Array(12)].map((_, i) => { const idx = s0.y * 12 + s0.m + i, y = Math.floor(idx / 12), m = idx % 12, key = `${y}-${m + 1}`, v = d[key];
      return { i, y, m, key, past: idx < ni, cur: idx === ni, future: idx > ni, done: v === true || v === "auto", auto: v === "auto" } });
  }
  /* a month that is over counts as done unless the farmer unticked it (false) */
  function autoTick(f) { f.done = f.done || {}; let ch = false; months12(f).forEach((x) => { if (x.past && f.done[x.key] === undefined) { f.done[x.key] = "auto"; ch = true } }); if (ch) save() }
  /* sow / harvest moments in the plan: a crop starts (sow or stock) and ends (harvest) */
  function moments(c) {
    const out = [], y0 = new Date().getFullYear();
    for (let i = 0; i < 12; i++) { const m = (CM + i) % 12, code = c.months[m]; if (code === "-") continue;
      const y = y0 + Math.floor((CM + i) / 12);
      if (c.months[(m + 11) % 12] !== code) out.push({ k: "sow", m, i, y, code });
      if (c.months[(m + 1) % 12] !== code) out.push({ k: "har", m, i, y, code }) }
    return out;
  }
  const momLabel = (x) => (x.k === "har" ? T("rmHar") : x.code[0] === "S" ? T("rmStock") : T("rmSow"));
  const momWhen = (i) => (i === 0 ? T("rmNow") : i === 1 ? T("rmNext") : T("rmIn")(i));
  /* "notification" card at the top: the next sowing and the next harvest, with a countdown and a phone-calendar reminder */
  function remindCard(f) {
    const c = cardOf(f), ms = moments(c), nino = isNino(f), pick = ["sow", "har"].map((k) => ms.find((x) => x.k === k)).filter(Boolean).sort((a, b) => a.i - b.i);
    if (!pick.length) return `<section class="dv-rm" aria-labelledby="dvRmH"><h3 id="dvRmH">${ic("bell", 18)}${esc(T("rmH"))}</h3><p class="rm-none">${esc(T("rmNone"))}</p></section>`;
    return `<section class="dv-rm${pick.some((x) => x.i === 0) ? " hot" : ""}" aria-labelledby="dvRmH"><h3 id="dvRmH">${ic("bell", 18)}${esc(T("rmH"))}</h3>
      <ul class="rm-list">${pick.map((x) => { const salty = x.k === "sow" && x.code[0] !== "S" && level(fieldSalt(f.site, x.m, nino)) === "man";
        return `<li class="rm-it k-${x.k}${x.i === 0 ? " now" : ""}"><span class="rm-ic" aria-hidden="true">${ic(x.k === "har" ? "basket" : "seed", 26)}</span>
        <div class="rm-tx"><span class="rm-k">${esc(momLabel(x))}<em class="rm-when">${esc(momWhen(x.i))}</em></span><b>${esc(cropName(c, x.code))}</b><span class="rm-d">${esc(MLONG(x.m))} ${x.y}</span>${salty ? `<span class="rm-salt">${ic("warn", 14)}${esc(T("rmSalt"))}</span>` : ""}</div></li>` }).join("")}</ul>
      <button type="button" class="btn rm-cal" data-dvrm="ics">${ic("cal", 18)}<span>${esc(T("rmCal"))}</span></button><p class="rm-note">${esc(T("rmCalD"))} ${esc(T("est"))}</p></section>`;
  }
  /* a .ics file with every sowing and harvest of the next 12 months; the phone's own calendar does the reminding */
  function icsDownload() {
    const f = fieldSel(); if (!f) return; const c = cardOf(f), p2 = (n) => String(n).padStart(2, "0"), now = new Date();
    const stamp = `${now.getUTCFullYear()}${p2(now.getUTCMonth() + 1)}${p2(now.getUTCDate())}T${p2(now.getUTCHours())}${p2(now.getUTCMinutes())}00Z`;
    const escI = (t) => String(t).replace(/[\\;,]/g, (m) => "\\" + m).replace(/\n/g, "\\n");
    const ev = moments(c).map((x, n) => { const d0 = `${x.y}${p2(x.m + 1)}01`, nx = new Date(x.y, x.m, 2), d1 = `${nx.getFullYear()}${p2(nx.getMonth() + 1)}${p2(nx.getDate())}`, ttl = `${momLabel(x)}: ${cropName(c, x.code)} (${f.name})`;
      return ["BEGIN:VEVENT", `UID:${f.id}-${x.y}-${x.m}-${x.k}-${n}@mekong-rotation`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${d0}`, `DTEND;VALUE=DATE:${d1}`, `SUMMARY:${escI(ttl)}`,
        `DESCRIPTION:${escI(`${jobAt(c, x.m)}. ${T("sgSow")} ${T("est")}.`)}`, "BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${escI(ttl)}`, "TRIGGER:-P3D", "END:VALARM", "END:VEVENT"].join("\r\n") });
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Mekong Rotation Explorer//EN", "CALSCALE:GREGORIAN", ...ev, "END:VCALENDAR"].join("\r\n");
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" })), a = document.createElement("a");
    a.href = url; a.download = T("rmFile"); document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000);
    try { window.App && App.toast && App.toast(T("rmCalOk")) } catch (e) {}
  }
  function progressCard(f) {
    /* the season path: 12 months as a road coloured by crop; a marker walks along it to today; seed flags = sowing, basket flags = harvest */
    const ms = months12(f), past = ms.filter((x) => x.past).length, now = ms.find((x) => x.cur), over = ms[11].past, s0 = startOf(f), c = cardOf(f);
    const d = new Date(), part = now ? (d.getDate() - 1) / new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate() : 0, frac = over ? 1 : Math.min(1, (past + part) / 12);
    const k = over ? 12 : now ? past + 1 : 0, code0 = now ? c.months[now.m] : "-", deg = (frac * 360).toFixed(1);
    curSite = f.site; curNino = isNino(f);
    const fbDone = !!f.feedback;
    const seg = ms.map((x) => { const code = c.months[x.m], kk = code === "-" ? "rest" : code[0], sow = code !== "-" && c.months[(x.m + 11) % 12] !== code, har = code !== "-" && c.months[(x.m + 1) % 12] !== code;
      return `<li class="pg-s pk-${kk}${x.past ? " done" : ""}${x.cur ? " cur" : ""}"${x.cur ? ` style="--p:${Math.max(8, Math.round(part * 100))}%"` : ""} aria-label="${esc(MLONG(x.m))}: ${esc(cropName(c, code))}${sow ? ", " + esc(momLabel({ k: "sow", code })) : ""}${har ? ", " + esc(T("rmHar")) : ""}">
        <span class="pg-fl" aria-hidden="true">${sow ? `<i class="fl sow">${ic("seed", 13)}</i>` : ""}${har ? `<i class="fl har">${ic("basket", 13)}</i>` : ""}</span><i class="pg-bk"></i><span class="pg-l">${esc(MNUM(x.m))}</span></li>` }).join("");
    const kinds = ["R", "S", "U", "-"].filter((q) => c.months.some((x) => x[0] === q));
    return `<section class="dv-prog${over ? " over" : ""}" aria-labelledby="dvPgH">
      <div class="pg-hd"><div class="pg-ring" style="--deg:${deg}deg" aria-hidden="true"><span><b>${k}</b><small>/12</small></span></div>
        <div class="pg-ht"><h3 id="dvPgH">${esc(T("pgH"))}</h3><b class="pg-n">${esc(T("pgAt")(k))}</b><span class="pg-left">${esc(T("pgLeft")(12 - k))}</span></div></div>
      <div class="pg-path" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(frac * 100)}" aria-label="${esc(T("pgH"))}: ${esc(T("pgAt")(k))}">
        <ol class="pg-segs">${seg}</ol>
        ${over ? "" : `<span class="pg-walk" style="left:${Math.min(96, Math.max(4, frac * 100)).toFixed(2)}%" aria-hidden="true"><em>${esc(T("pgToday"))}</em><span class="pg-tok">${iconOf(code0)}</span></span>`}
      </div>
      <p class="pg-key">${kinds.map((q) => `<span><i class="sw pk-${q === "-" ? "rest" : q}"></i>${esc(T("crop")[q])}</span>`).join("")}<span>${ic("seed", 13)}${esc(T("rmSow"))}</span><span>${ic("basket", 13)}${esc(T("rmHar"))}</span></p>
      <p class="pg-d">${esc(T("pgStart")(s0.m + 1, s0.y))}${now ? ` · <b>${esc(jobAt(c, now.m))}</b>` : ""}</p>
      ${over && !fbDone ? `<div class="pg-fb"><p>${esc(T("fbAsk"))}</p><button type="button" class="btn gold" data-dvfb="open">${ic("star", 18)}<span>${esc(T("fbBtn"))}</span></button></div>` : ""}
      ${fbDone ? `<div class="pg-fb ok"><p><b>${esc(T("fbThanks"))}</b> <span class="pg-stars" aria-label="${f.feedback.rate}/5">${"★".repeat(f.feedback.rate)}${"☆".repeat(5 - f.feedback.rate)}</span></p><div class="pg-fba"><button type="button" class="btn" data-dvfb="open">${esc(T("fbEdit"))}</button>${over ? `<button type="button" class="btn gold" data-dvfb="newask">${esc(T("fbNew"))}</button>` : ""}</div></div>` : ""}
      ${!over && !fbDone ? `<button type="button" class="dv-link pg-early" data-dvfb="open">${esc(T("fbEarly"))}</button>` : ""}</section>`;
  }
  function fbSheet() {
    const f = fieldSel(); if (!f) return; const fb = f.feedback || {};
    sheet(`<div class="dv-fbf"><h2>${ic("star", 22)}${esc(T("fbH"))}</h2><p class="sd-note">${esc(f.name)} · ${esc(L(cardOf(f).name))}</p>
      <fieldset class="fb-q"><legend>${esc(T("fbRate"))}</legend><div class="fb-stars">${[1, 2, 3, 4, 5].map((r) => `<label><input type="radio" name="fbRate" value="${r}" ${fb.rate === r ? "checked" : ""}><span aria-hidden="true">★</span><small>${esc(T("fbRates")[r - 1])}</small></label>`).join("")}</div></fieldset>
      <fieldset class="fb-q"><legend>${esc(T("fbCrop"))}</legend><div class="fb-chips">${Object.entries(T("fbCrops")).map(([k, v]) => `<label><input type="radio" name="fbCrop" value="${k}" ${fb.crop === k ? "checked" : ""}><span>${esc(v)}</span></label>`).join("")}</div></fieldset>
      <fieldset class="fb-q"><legend>${esc(T("fbSalt"))}</legend><div class="fb-chips">${[["yes", T("fbYes")], ["no", T("fbNo")]].map(([k, v]) => `<label><input type="radio" name="fbSalt" value="${k}" ${fb.salt === k ? "checked" : ""}><span>${esc(v)}</span></label>`).join("")}</div></fieldset>
      <label class="fb-note"><span>${esc(T("fbNote"))}</span><textarea id="fbNote" rows="3" maxlength="500">${esc(fb.note || "")}</textarea></label>
      <p class="fb-err" id="fbErr" role="alert"></p>
      <div class="dv-acts"><button type="button" class="btn gold" data-dvfb="save">${ic("check", 16)}<span>${esc(T("fbSave"))}</span></button><button type="button" class="btn" data-dv="close"><span>${esc(T("fbLater"))}</span></button></div>
      <p class="sd-note">${esc(T("fbLocal"))}</p></div>`);
  }
  function fbText(f) { const fb = f.feedback; return T("fbShareT")(f.name, fb.rate, fb.crop ? T("fbCrops")[fb.crop] : "–", fb.salt ? (fb.salt === "yes" ? T("fbYes") : T("fbNo")) : "–", fb.note || "") }
  function fbAction(a) {
    const f = fieldSel(); if (!f) return;
    if (a === "open") return fbSheet();
    if (a === "save") {
      const v = (n) => { const x = document.querySelector(`#dvShBody input[name="${n}"]:checked`); return x ? x.value : null };
      const rate = +v("fbRate"); if (!rate) { const e = $("#fbErr"); if (e) e.textContent = T("fbNeed"); return }
      f.feedback = { rate, crop: v("fbCrop"), salt: v("fbSalt"), note: String(($("#fbNote") || {}).value || "").trim().slice(0, 500), at: Date.now(), rot: f.rot };
      save(); closeSheet(); render();
      sheet(`<div class="dv-fbf"><h2>${ic("check", 22)}${esc(T("fbThanks"))}</h2><p class="sd-note">${esc(T("fbLocal"))}</p><div class="dv-acts"><button type="button" class="btn gold" data-dvfb="share">${esc(T("fbShare"))}</button><button type="button" class="btn" data-dv="close">${esc(T("close"))}</button></div></div>`);
      return;
    }
    if (a === "share") { const txt = fbText(f), tst = (m) => { try { window.App && App.toast && App.toast(m) } catch (e) {} };
      if (navigator.share) { navigator.share({ text: txt }).catch(() => {}) } else if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(txt).then(() => tst(T("fbCopied"))).catch(() => tst(txt)) } else tst(txt); return }
    if (a === "newask") { sheet(`<div class="dv-fbf"><h2>${ic("cal", 22)}${esc(T("fbNew"))}?</h2><p class="sd-note">${esc(T("fbNewP"))}</p><div class="dv-acts"><button type="button" class="btn gold" data-dvfb="new">${esc(T("fbNew"))}</button><button type="button" class="btn" data-dv="close">${esc(T("fbLater"))}</button></div></div>`); return }
    if (a === "new") { closeSheet(); (f.history = f.history || []).push({ startAt: f.startAt || f.savedAt, done: f.done, feedback: f.feedback }); f.startAt = Date.now(); f.done = {}; f.feedback = null; save(); render() }
  }
  function tickMonth(key) { const f = fieldSel(); if (!f) return; f.done = f.done || {}; const x = months12(f).find((y) => y.key === key); if (!x || x.future) return; f.done[key] = x.done ? false : true; save(); render() }
  let sgOpen = 0;   /* the tip deck always shows one tip; warnings come first */
  function suggestions(f) {
    const x = facts(f), { c } = x, out = [], nino = x.nino;
    out.push({ i: "cal", t: T("sgJob")(CM + 1, x.job) });
    if (x.lv !== "ngot") out.push({ i: "drop", t: T("sgSaltNow"), w: 1 });
    else { for (let k = 1; k <= 2; k++) { const m = (CM + k) % 12; if (level(fieldSalt(f.site, m, nino)) !== "ngot") { out.push({ i: "drop", t: T("sgSaltSoon")(m + 1), w: 1 }); break } } }
    const k0 = c.months[(CM + 1) % 12][0]; if ((k0 === "R" || k0 === "U") && c.months[CM][0] !== k0) out.push({ i: "seed", t: T("sgSow") });
    const best = rank(f).find((y) => !y.no);
    if (x.clash.length) out.push({ i: "warn", t: T("sgClash")(x.clash.join(", ")), a: "choose", al: T("sgOpen"), w: 1 });
    else if (best && best.c.id !== c.id) out.push({ i: "star", t: T("sgBetter")(L(best.c.name)), a: "choose", al: T("sgOpen") });
    if (nino) out.push({ i: "sun", t: T("sgNino") });
    if (!f.size) out.push({ i: "coin", t: T("sgSize"), a: "editmap", al: T("sgEdit") });
    const xs = out.slice(0, 5).map((y, i) => ({ ...y, o: i })).sort((p, q) => (q.w || 0) - (p.w || 0) || p.o - q.o); if (sgOpen >= xs.length || sgOpen < 0) sgOpen = 0;
    const n = xs.length, prev = (sgOpen + n - 1) % n, next = (sgOpen + 1) % n;
    /* a deck of tip cards: one tip open as a big card, the rest peek out behind it; icons are tabs, arrows flip */
    return `<section class="dv-sug deck" aria-labelledby="dvSgH" style="--left:${Math.min(2, n - 1)}"><h3 id="dvSgH">${ic("star", 18)}${esc(T("sgH"))}<span class="sg-n">${sgOpen + 1} / ${n}</span></h3>
      <div class="sg-stack">${xs.map((y, i) => `<div class="sg-p${y.w ? " warn" : ""}" id="dvSgP${i}" role="tabpanel" aria-live="polite" ${i === sgOpen ? "" : "hidden"}><span class="sg-big" aria-hidden="true">${ic(y.i, 30)}</span><p class="sg-t">${esc(y.t)}</p>${y.a ? `<button type="button" class="btn sg-a" data-dv="${y.a}">${esc(y.al)}${ic("chev", 14)}</button>` : ""}<p class="a-src">${esc(T("sgSrc"))}</p></div>`).join("")}</div>
      <div class="sg-nav">${n > 1 ? `<button type="button" class="sg-arr" data-dvsg="${prev}" aria-label="${esc(T("sgPrev"))}">${ic("back", 18)}</button>` : ""}
        <div class="sg-row" role="tablist" aria-labelledby="dvSgH">${xs.map((y, i) => `<button type="button" role="tab" class="sg-c${y.w ? " warn" : ""}${i === sgOpen ? " on" : ""}" data-dvsg="${i}" aria-selected="${i === sgOpen}" aria-controls="dvSgP${i}" aria-label="${esc(y.t)}" title="${esc(y.t)}">${ic(y.i, 18)}</button>`).join("")}</div>
        ${n > 1 ? `<button type="button" class="sg-arr nx" data-dvsg="${next}" aria-label="${esc(T("sgNext"))}">${ic("chev", 18)}</button>` : ""}</div></section>`;
  }
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#dv")) return;
    const t = e.target.closest("[data-dvtick]"); if (t) { e.stopPropagation(); return tickMonth(t.dataset.dvtick) }
    const g = e.target.closest("[data-dvsg]"); if (g) { e.stopPropagation(); const box = g.closest(".dv-sug"), fwd = g.classList.contains("nx") || +g.dataset.dvsg > sgOpen; sgOpen = +g.dataset.dvsg;
      const ref = document.createElement("div"); ref.innerHTML = suggestions(fieldSel()); const nb = ref.firstElementChild; nb.classList.add(fwd ? "flip-f" : "flip-b"); box.replaceWith(nb);
      const fc = nb.querySelector(g.classList.contains("sg-arr") ? (g.classList.contains("nx") ? ".sg-arr.nx" : ".sg-arr:not(.nx)") : ".sg-c.on"); fc && fc.focus({ preventScroll: true }); return }
    const b = e.target.closest("[data-dvfb]"); if (b) { e.stopPropagation(); return fbAction(b.dataset.dvfb) }
    if (e.target.closest("[data-dvrm]")) { e.stopPropagation(); return icsDownload() }
  }, true);

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
      ${r ? `<dl class="dv-dl"><dt>${esc(T("seed"))}</dt><dd>${esc(L(r.seed))}</dd>${r.fertiliser && L(r.fertiliser) ? `<dt>${esc(T("fert"))}</dt><dd>${esc(L(r.fertiliser))}</dd>` : ""}</dl><p class="sd-k">${esc(T("steps"))}</p><ol class="dv-steps">${(r.steps || []).map((x) => `<li>${esc(L(x))}</li>`).join("")}</ol>` : ""}
      <div class="dv-salt"><span class="sd-dot lv-${LVC[lv]}"></span><div><b>${esc(T("lv")[lv])}: ${esc(T("lvD")[lv])}</b><small>${esc(T("est"))}</small></div></div>
      <button type="button" class="btn gold dv-full" data-dv="close">${esc(T("close"))}</button>`);
  }

  /* ---------------- print: a 12-month farm calendar on paper, one box per month, icons for every job ---------------- */
  const PW = {
    vi: { title: "Lịch làm ruộng 12 tháng", year: "Cả năm nhìn nhanh", legend: "Ký hiệu", water: "Nước", job: "Việc chính", seed: "Giống", fert: "Phân bón", steps: "Các bước", done: "Đã làm", note: "Ghi chú",
      k: { sow: "Gieo / thả giống", tend: "Chăm sóc", harvest: "Thu hoạch", rest: "Nghỉ đất", wait: "Đo mặn, chờ mưa" }, size: "Diện tích", made: "In ngày", start: "Bắt đầu vụ", tip: "Mỗi tháng làm xong, đánh dấu vào ô ☐. Mang tờ này khi gặp cán bộ khuyến nông.",
      money: "Tiền lãi ước tính", fresh: "Nước ngọt", brack: "Hơi mặn", salty: "Mặn" },
    en: { title: "12-month farm calendar", year: "The year at a glance", legend: "Key", water: "Water", job: "Main job", seed: "Seed", fert: "Fertiliser", steps: "Steps", done: "Done", note: "Notes",
      k: { sow: "Sow / stock", tend: "Look after", harvest: "Harvest", rest: "Rest the field", wait: "Measure salt, wait for rain" }, size: "Size", made: "Printed", start: "Season starts", tip: "Tick the box ☐ when a month's work is done. Bring this sheet to your extension officer.",
      money: "Estimated profit", fresh: "Fresh", brack: "Brackish", salty: "Salty" }
  };
  const PI = {
    sow: '<path d="M12 21v-7"/><path d="M12 14c-3 0-5-2-5-5 3 0 5 2 5 5Z"/><path d="M12 14c0-3 2-5 5-5 0 3-2 5-5 5Z"/><path d="M5 21h14"/>',
    tend: '<path d="M7 4v6a5 5 0 0 0 10 0V4"/><path d="M12 15v6M8 21h8"/><path d="M4 8h3M17 8h3"/>',
    harvest: '<path d="M4 11h16l-2 9H6l-2-9Z"/><path d="M8 11 12 4l4 7"/>',
    rest: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/>',
    wait: '<path d="M12 3.5 21.5 20h-19L12 3.5Z"/><path d="M12 10v4.5"/><path d="M12 17.4v.1"/>'
  };
  const pic = (k, n = 22) => `<svg class="pi" viewBox="0 0 24 24" width="${n}" height="${n}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PI[k] || ICON[k] || ""}</svg>`;
  const pcrop = (code, n = 22) => `<svg class="pi" viewBox="0 0 24 24" width="${n}" height="${n}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[{ R: "rice", S: "shrimp", U: "upland" }[code[0]] || "fallow"]}</svg>`;
  function jobKind(c, m, site, nino) {
    const ms = c.months, code = ms[m], prev = ms[(m + 11) % 12], next = ms[(m + 1) % 12];
    if (code === "-") return "rest";
    const st0 = prev !== code;
    if (st0 && code[0] !== "S" && level(fieldSalt(site, m, nino)) === "man") return "wait";
    return st0 ? "sow" : next !== code ? "harvest" : "tend";
  }
  function paperHTML() {
    const f = fieldSel(), c = cardOf(f), s = siteOf(f.site), nino = isNino(f), P = PW[lang()], d = new Date().toLocaleDateString(lang() === "vi" ? "vi-VN" : "en-GB");
    curSite = f.site; curNino = nino;
    const order = [...Array(12)].map((_, i) => (CM + i) % 12), mon = shownMoney(f, facts(f));
    const lvw = { ngot: P.fresh, lo: P.brack, man: P.salty };
    const strip = order.map((m) => { const code = c.months[m], lv = level(fieldSalt(f.site, m, nino)), k = jobKind(c, m, f.site, nino);
      return `<td class="c-${code[0] === "-" ? "rest" : code[0]}"><b>T${m + 1}</b>${pcrop(code, 18)}<span class="w ${lv}">${pic("drop", 12)}</span>${pic(k, 14)}</td>` }).join("");
    const boxes = order.map((m) => {
      const code = c.months[m], lv = level(fieldSalt(f.site, m, nino)), k = jobKind(c, m, f.site, nino), start = c.months[(m + 11) % 12] !== code && code !== "-";
      const r = start ? DATA.resources[resKey(c, code)] : null;
      return `<section class="mb c-${code[0] === "-" ? "rest" : code[0]}${m === CM ? " now" : ""}">
        <header><span class="mn">${lang() === "vi" ? "Tháng" : "Month"} ${m + 1}</span><span class="cr">${pcrop(code, 20)}${esc(cropName(c, code))}</span><span class="tick">☐ ${esc(P.done)}</span></header>
        <p class="job k-${k}">${pic(k, 26)}<span><small>${esc(P.k[k])}</small><b>${esc(jobAt(c, m))}</b></span></p>
        <p class="wat ${lv}">${pic("drop", 16)}<span>${esc(P.water)}: <b>${esc(lvw[lv])}</b> · ${esc(T("lvD")[lv])}</span></p>
        ${r ? `<div class="res"><p class="st">${pic("sow", 14)}${esc(P.start)}</p><p>${pic("seed", 14)}<b>${esc(P.seed)}:</b> ${esc(L(r.seed))}</p>${r.fertiliser && L(r.fertiliser) ? `<p>${pic("drop", 14)}<b>${esc(P.fert)}:</b> ${esc(L(r.fertiliser))}</p>` : ""}
          ${(r.steps || []).length ? `<ol>${r.steps.map((x) => `<li>${esc(L(x))}</li>`).join("")}</ol>` : ""}</div>` : ""}
        <p class="nt">${esc(P.note)}: ________________________________</p></section>`;
    }).join("");
    return `<div class="paper"><header class="ph"><div><p class="pp-k">${esc(T("brand"))} · Mekong Rotation Explorer</p><h1>${esc(P.title)}</h1>
        <p class="who"><b>${esc(f.name)}</b> · ${esc(L(c.name))}<br>${esc(L(s.name))}${f.size ? ` · ${esc(P.size)} ${nf(f.size, 1)} ha` : ""} · ${esc(P.made)} ${esc(d)}</p></div>
        ${mon ? `<div class="pm">${pic("coin", 22)}<span><small>${esc(P.money)}</small><b>${mon.per}</b> ${esc(T("perCongS"))}</span></div>` : ""}</header>
      <h2>${esc(P.year)}</h2><table class="strip"><tr>${strip}</tr></table>
      <p class="legend"><b>${esc(P.legend)}:</b> ${["sow", "tend", "harvest", "rest", "wait"].map((k) => `<span>${pic(k, 14)}${esc(P.k[k])}</span>`).join("")}
        <span class="w ngot">${pic("drop", 12)}${esc(P.fresh)}</span><span class="w lo">${pic("drop", 12)}${esc(P.brack)}</span><span class="w man">${pic("drop", 12)}${esc(P.salty)}</span></p>
      <p class="tip">${esc(P.tip)}</p>
      <div class="boxes">${boxes}</div>
      <footer><p>${lang() === "vi" ? "Dữ liệu: NASA GPM IMERG (mưa), NASA POWER (nhiệt độ, nhu cầu nước), NASA MODIS NDVI (số vụ), NOAA (El Niño), SoilGrids (đất). Độ mặn: ước tính từ báo cáo trạm đo công khai, không đo bằng vệ tinh. Giống, phân bón và các bước: tài liệu khuyến nông đã công bố." : "Data: NASA GPM IMERG (rain), NASA POWER (heat, water need), NASA MODIS NDVI (crop count), NOAA (El Niño), SoilGrids (soil). Salinity: estimate from public station reports, not satellite. Seed, fertiliser and steps: published extension guides."}</p><p><b>${esc(T("ask"))}</b></p></footer></div>`;
  }
  const PAPER_CSS = `*{box-sizing:border-box}body{margin:0;background:#fff;color:#1a1a1a;font:13px/1.45 "Be Vietnam Pro",Arial,sans-serif}
.paper{max-width:820px;margin:0 auto;padding:22px}.pi{display:inline-block;vertical-align:-.2em;flex:none}
.ph{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;border-bottom:3px solid #1a1a1a;padding-bottom:10px}
.pp-k{margin:0;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#666}h1{margin:2px 0;font-size:24px}.who{margin:0;color:#333}
.pm{display:flex;gap:8px;align-items:center;padding:8px 12px;border:2px solid #b8860b;border-radius:10px;color:#7a5a00}.pm small{display:block;font-size:10px;color:#666}.pm b{font-size:20px}
h2{font-size:13px;letter-spacing:.06em;text-transform:uppercase;margin:14px 0 6px;color:#444}
.strip{width:100%;border-collapse:separate;border-spacing:3px;table-layout:fixed}.strip td{text-align:center;padding:5px 2px;border-radius:6px;border:1px solid #ccc;vertical-align:top}
.strip td b{display:block;font-size:11px}.strip td .pi{display:block;margin:2px auto}
.c-R{background:#eef6e8}.c-S{background:#e8f1f7}.c-U{background:#fbf3e0}.c-rest{background:#f3f3f3}
.w{display:inline-flex;align-items:center;gap:2px}.w.ngot{color:#1f8a4c}.w.lo{color:#b8860b}.w.man{color:#c0392b}
.legend{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:11px;margin:6px 0}.legend span{display:inline-flex;align-items:center;gap:3px}
.tip{margin:4px 0 10px;padding:6px 10px;background:#fff8e1;border-left:4px solid #b8860b;font-size:12px}
.boxes{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.mb{border:1.5px solid #999;border-radius:10px;padding:8px 10px;break-inside:avoid;page-break-inside:avoid}.mb.now{border:2.5px solid #b8860b}
.mb header{display:flex;align-items:center;gap:8px;border-bottom:1px dashed #bbb;padding-bottom:4px;margin-bottom:6px}
.mn{font-weight:800;font-size:15px}.cr{display:inline-flex;align-items:center;gap:4px;font-weight:600}.tick{margin-left:auto;font-size:12px;color:#444;white-space:nowrap}
.job{display:flex;gap:8px;align-items:flex-start;margin:0 0 4px}.job small{display:block;font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:#666}.job b{font-size:13.5px}
.k-wait{color:#c0392b}.k-wait b{color:#c0392b}.k-sow .pi{color:#1f8a4c}.k-harvest .pi{color:#b8860b}.k-rest .pi{color:#777}.k-tend .pi{color:#2c6e9b}
.wat{display:flex;gap:6px;align-items:flex-start;margin:0 0 4px;font-size:12px}.wat.ngot{color:#1f6e3c}.wat.lo{color:#7a5a00}.wat.man{color:#c0392b}
.res{margin:4px 0;padding:6px 8px;background:#f7f7f2;border-radius:8px;font-size:11.5px}.res p{margin:0 0 3px;display:flex;gap:5px;align-items:flex-start}.res .st{font-weight:700;color:#1f8a4c}
.res ol{margin:2px 0 0;padding-left:18px}.res li{margin:1px 0}
.nt{margin:6px 0 0;font-size:11px;color:#888;white-space:nowrap;overflow:hidden}
footer{margin-top:12px;font-size:10.5px;color:#444;border-top:1px solid #999;padding-top:6px}
@media (max-width:600px){.boxes{grid-template-columns:1fr}.paper{padding:12px}.ph{flex-direction:column}}
@media print{.paper{padding:0;max-width:none}@page{size:A4;margin:12mm}.mb.now{border-width:1.5px}}`;
  function paperSheet() {
    const doc = `<!doctype html><html><head><meta charset="utf-8"><style>${PAPER_CSS}</style></head><body>${paperHTML()}</body></html>`;
    sheet(`<h2>${esc(T("preview"))}</h2><p class="sd-note">${esc(T("printHint"))}</p><iframe class="paper-frame" title="${esc(T("preview"))}" srcdoc="${esc(doc)}"></iframe>
      <div class="dv-acts"><button type="button" class="btn gold" data-dv="doprint">${ic("print", 16)}<span>${esc(T("doPrint"))}</span></button><button type="button" class="btn" data-dv="savefile"><span>${esc(T("save"))}</span></button></div><p class="sd-note" id="dvSaveMsg" role="status"></p>`, true);
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
    sheet(`<div class="dv-sheethead"><h2>${esc(T("optsH"))}</h2><button type="button" class="dv-deltop" data-dv="delask" aria-label="${esc(T("del"))}: ${esc(f.name)}" title="${esc(T("del"))}">${ic("trash", 20)}</button></div><div class="dv-opts">
      <div class="o-g"><span>${esc(T("seasons"))}</span>${[0, 1, 2].map((i) => `<small>${esc(T("sz")[i])}</small><div class="seg o-seg">${["R", "S", "U", "-"].map((v) => opt("sz" + i, v, (f.seasons || [])[i], T("crop")[v])).join("")}</div>`).join("")}</div>
      <div class="o-g"><span>${esc(T("goal"))}</span><div class="seg o-seg">${Object.keys(GOALS).map((g) => opt("goal", g, f.weights ? "" : f.goal, T("goals")[g])).join("")}</div></div>
      <div class="o-g"><span>${esc(T("people"))}</span><div class="seg o-seg">${[0, 1, 2].map((v) => opt("wfP", String(v), String(f.wfP ?? 1), T("pv")[v])).join("")}</div></div>
      <div class="o-g"><span>${esc(T("machines"))}</span><div class="seg o-seg">${[0, 1, 2].map((v) => opt("wfM", String(v), String(f.wfM ?? 0), T("mv")[v])).join("")}</div></div>
      <label class="o-chk"><input type="checkbox" data-opt="noBrackish" ${f.noBrackish ? "checked" : ""}> ${esc(T("brack"))}</label>
      <div class="o-g"><span>${esc(T("year"))}</span><div class="seg o-seg">${["typical", "elnino"].map((y) => opt("year", y, yr(f), T("years")[y])).join("")}</div></div>
      <label class="o-g"><span>${esc(T("size"))}</span><input type="text" inputmode="decimal" data-opt="size" value="${f.size ? nf(f.size, 2).replace(/[,.]?0+$/, "") : ""}" placeholder="1,5"></label>
      <label class="o-g"><span>${esc(T("name"))}</span><input type="text" data-opt="name" maxlength="30" value="${esc(f.name)}"></label>
      ${top && top.c.id !== f.rot && !top.no ? `<div class="dv-better"><p>${esc(T("better")(L(top.c.name)))}</p><button type="button" class="btn gold" data-use="${top.c.id}">${esc(T("use"))}</button></div>` : ""}</div>`);
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
    try { zoomClose() } catch (e) {}
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
    /* the name and size the farmer typed in the planner's field form (app.js) */
    try { const af = A.fields && A.fieldId && A.fields().find((x) => x.id === A.fieldId()); if (af) { f.name = af.name || f.name; if (af.ha > 0) f.size = af.ha } } catch (e) {}
    Object.assign(f, { site: s.id, rot: A.planId ? A.planId() : null, weights: w, goal: null, year: m === "elnino" ? "elnino" : null, crop: A.upCrop ? A.upCrop() : null, seasons: SEAS_OF[cur] || ["R", "R", "R"], wfP: wf.p, wfM: wf.m, savedAt: Date.now() });
    if (!f.startAt) f.startAt = Date.now();
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
  let shT = 0;   /* a sheet opened right after another one closed must not be hidden by the old close timer */
  function sheet(html, wide) { clearTimeout(shT); const sh = $("#dvSheet"); $("#dvShBody").innerHTML = html; sh.classList.toggle("wide", !!wide); sh.hidden = false; requestAnimationFrame(() => sh.classList.add("on")) }
  function closeSheet() { const sh = $("#dvSheet"); if (!sh) return; sh.classList.remove("on"); clearTimeout(shT); shT = setTimeout(() => (sh.hidden = true), 220) }
  let lastSite = null, lastName = null;
  function render() {
    if (!$("#dv")) return;
    const p = $("#dvPanel"), y = p.scrollTop;
    if (view === "plan" && !fieldSel()) view = "dash";
    p.innerHTML = view === "plan" ? panelPlan() : panelDash();
    p.scrollTop = view === "plan" ? 0 : y;
    document.body.classList.toggle("dv-simple", !adv());
    p.classList.toggle("is-adv", adv() && view !== "plan" && !!fieldSel()); p.classList.toggle("is-simple", !adv() || view === "plan" || !fieldSel());
    const hn = p.querySelector("#dvH.dv-name"); if (hn) { if (lastName !== null && hn.dataset.k !== lastName) hn.classList.add("in"); lastName = hn.dataset.k }
    const tb = p.querySelector('.dv-ftabs [aria-selected="true"]'); if (tb) { const bar = tb.parentNode; bar.scrollLeft = Math.max(0, tb.offsetLeft - (bar.clientWidth - tb.offsetWidth) / 2) }
  }
  document.addEventListener("change", (e) => { if (e.target.closest && e.target.closest(".dv-fbf")) { const er = document.getElementById("fbErr"); if (er) er.textContent = "" } });
  function go(v) { view = v; closeSheet(); render(); $("#dvPanel").scrollTop = 0 }

  document.addEventListener("click", (e) => {
    if (e.target.closest("#dvBack")) return backToDash();
    if (e.target.closest(".dv-savefield")) return saveFromMap();
    if (!e.target.closest("#dv")) return;
    const sel = e.target.closest("[data-dvsel]"); if (sel) return setSel(sel.dataset.dvsel);
    const zc = e.target.closest("[data-dvz]"); if (zc) return zoomClose();
    const zt = e.target.closest("[data-zoom]"); if (zt && !e.target.closest("button, a, input, [data-dvm], [data-use], details")) return zoomOpen(zt.dataset.zoom, zt);
    const a = e.target.closest("[data-dv],[data-dvf],[data-dvui],[data-use],[data-tab],[data-opt],[data-dvm]"); if (!a || a.matches("input")) return;
    const d = a.dataset;
    if (d.dvui) { st.ui = d.dvui; save(); paintModes(); return render() }
    if (d.dvf) { st.sel = d.dvf; save(); view = "dash"; selM = null; render(); $("#dvPanel").scrollTop = 0; return }
    if (d.use) { const f = fieldSel(); f.rot = d.use; f.savedAt = Date.now(); save(); closeSheet(); render(); if (zoomKey) { const p = $("#dvZP"); p.innerHTML = zoomHTML(f) } return }
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
      case "delask": { const f = fieldSel(); if (!f) return; sheet(`<div class="dv-delq"><span class="dv-delico">${ic("trash", 30)}</span><h2>${esc(T("delH")(f.name))}</h2><p class="sd-note">${esc(T("delP"))}</p>
        <div class="dv-acts"><button type="button" class="btn dv-delyes" data-dv="del">${ic("trash", 16)}<span>${esc(T("delYes"))}</span></button><button type="button" class="btn gold" data-dv="close"><span>${esc(T("cancel"))}</span></button></div></div>`); return }
      case "del": { const f = fieldSel(); if (f) { st.fields = st.fields.filter((x) => x.id !== f.id); st.sel = st.fields[0] ? st.fields[0].id : null; selM = null; save(); closeSheet(); try { zoomClose() } catch (e) {} render(); try { window.App && App.toast && App.toast(T("deleted")) } catch (e) {} } return }
    }
  });
  document.addEventListener("change", (e) => { const i = e.target.closest("#dv [data-opt]"); if (!i) return; setOpt(i.dataset.opt, i.type === "checkbox" ? i.checked : i.value); render(); optsSheet() });
  document.addEventListener("keydown", (e) => {
    const sh = $("#dvSheet"); if (e.key === "Escape" && sh && !sh.hidden) return closeSheet();
    if ((e.key === "Enter" || e.key === " ") && e.target.matches && e.target.matches("#dv [data-zoom], #dv tr[data-dvsel]")) { e.preventDefault(); if (e.target.dataset.zoom) zoomOpen(e.target.dataset.zoom, e.target); else setSel(e.target.dataset.dvsel); return }
    if ((e.key === "Enter" || e.key === " ") && e.target.matches && e.target.matches("#dv .dv-hero, #dv tr[data-dvm]")) { e.preventDefault(); e.target.click() }
  });
  /* top-bar language buttons re-draw the panel; the brand (MEKONG) goes back to the dashboard */
  document.addEventListener("click", (e) => { if (e.target.closest("#lEn, #lVi")) setTimeout(() => { render(); backLabel() }, 30) });
  document.addEventListener("click", (e) => { if (e.target.closest("#brand") && $("#dv")) { e.preventDefault(); e.stopPropagation(); backToDash() } }, true);

  /* one Simple / Advanced switch for the whole app: dashboard, Settings and the planner drawer */
  const modeSeg = (cls) => `<div class="${cls}"><p class="dv-ml">${esc(T("modeH"))}</p><div class="seg" role="group" aria-label="${esc(T("modeH"))}"><button type="button" data-dvmode="simple" aria-pressed="${!adv()}">${esc(T("simple"))}</button><button type="button" data-dvmode="advanced" aria-pressed="${adv()}">${esc(T("adv"))}</button></div><p class="dv-mh">${esc(adv() ? T("modeA") : T("modeS"))}</p></div>`;
  function paintModes() {
    const sb = document.getElementById("setBody");
    if (sb) { let x = sb.querySelector(".dv-setmode"); const h = modeSeg("dv-setmode"); if (!x) sb.insertAdjacentHTML("afterbegin", h); else x.outerHTML = h }
    /* the switch lives in the top bar, next to EN / VI; the old copy inside the planner drawer is removed */
    const db = document.querySelector("#drawer .d-body"), old = db && db.querySelector(":scope > .dv-modebar"); if (old) old.remove();
    const tools = document.querySelector("#topbar .tools, .tools"), ls = document.getElementById("langSeg");
    if (tools && ls) { const h = `<div class="seg" id="uiSeg" role="group" aria-label="${esc(T("modeH"))}"><button type="button" data-dvmode="simple" aria-pressed="${!adv()}">${esc(T("simple"))}</button><button type="button" data-dvmode="advanced" aria-pressed="${adv()}">${esc(T("adv"))}</button></div><button type="button" id="uiSw" role="switch" aria-checked="${adv()}" data-dvmode="${adv() ? "simple" : "advanced"}"><span>${esc(T("adv"))}</span><i aria-hidden="true"></i></button>`;
      const sw = document.getElementById("uiSw"); if (sw) sw.remove();
      const x = document.getElementById("uiSeg"); if (x) x.outerHTML = h; else ls.insertAdjacentHTML("afterend", h) }
    document.body.classList.toggle("dv-simple", !adv()); document.body.classList.toggle("dv-adv", adv());
    /* the planner (app.js) has its own detail switch: keep it the same, so Simple really shows less in the rotation cards */
    try { if (window.App && App.setUi) App.setUi(adv() ? "advanced" : "simple"); if (typeof Cost !== "undefined") Cost.cards() } catch (e) {}
  }
  document.addEventListener("click", (e) => { const b = e.target.closest("[data-dvmode]"); if (!b) return; st.ui = b.dataset.dvmode; save(); paintModes(); render() });
  window.addEventListener("keydown", (e) => { const zz = $("#dvZoom"), sh = $("#dvSheet"); if (e.key === "Escape" && zz && !zz.hidden && (!sh || sh.hidden)) { e.preventDefault(); e.stopPropagation(); zoomClose() } }, true);
  function init() {
    shell();
    setTimeout(paintModes, 0); document.addEventListener("click", (e) => { if (e.target.closest("#lEn, #lVi, #gearBtn")) setTimeout(paintModes, 40) });
    /* Settings and the drawer are re-drawn by app.js: put the switch back whenever it goes missing */
    let mq = 0; new MutationObserver(() => { if (mq) return; mq = setTimeout(() => { mq = 0; const sb = document.getElementById("setBody"), db = document.querySelector("#drawer .d-body");
      if ((sb && !sb.querySelector(".dv-setmode")) || (db && db.querySelector(":scope > .dv-modebar")) || !document.getElementById("uiSeg")) paintModes() }, 50) }).observe(document.body, { childList: true, subtree: true });
    let hq = 0; new MutationObserver(() => { if (!hq) hq = setTimeout(() => { hq = 0; hookPlanOk() }, 30) }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
    document.body.classList.toggle("dv-simple", !adv());
    if (location.hash === "#plan-lab") { document.body.classList.add("dv-off"); $("#dvBack").hidden = false; backLabel(); return }
    on = true; document.body.classList.add("dv-on"); render();
  }
  return { init, render, get state() { return st } };
})();
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(Dash.init, 0)); else setTimeout(Dash.init, 0);
