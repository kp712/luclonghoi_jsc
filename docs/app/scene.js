/* scene.js (Draft 5): the home page picture, a riverside in the Mekong Delta.
   Morning in the light theme: sun, egrets, a wide river, a stilt house under coconut palms, a monkey bridge
   over a canal, a sampan with a farmer in a conical hat, paddy rows, lotus. Night in the dark theme:
   moon, stars, fireflies and a lit window. Drawn here as inline SVG; colours come from home.css. */
const HomeScene = (() => {
  /* deterministic "random" so the picture is the same on every load */
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646 };
  const f = (n) => Math.round(n * 10) / 10;

  function palm(x, y, h, lean, k, cls) {
    const tx = x + lean, ty = y - h;
    let s = `<g class="${cls}"><path class="s-trunk" d="M${x} ${y} Q${f(x + lean * 0.2)} ${f(y - h * 0.55)} ${tx} ${ty}" stroke-width="${f(7 * k)}"/>`;
    [-172, -150, -124, -98, -72, -46, -20, 6].forEach((a, i) => {
      const r = (a * Math.PI) / 180, L = (64 + (i % 2) * 12) * k;
      const ex = tx + Math.cos(r) * L, ey = ty + Math.sin(r) * L * 0.55 + 26 * k;
      const cx = tx + Math.cos(r) * L * 0.5, cy = ty - 16 * k + Math.sin(r) * L * 0.2;
      s += `<path class="s-frond" d="M${tx} ${ty} Q${f(cx)} ${f(cy)} ${f(ex)} ${f(ey)}" stroke-width="${f(6 * k)}"/>`;
    });
    return s + `<circle class="s-nut" cx="${tx}" cy="${f(ty + 4 * k)}" r="${f(5 * k)}"/></g>`;
  }
  function tuft(x, y, h) {
    let s = "";
    for (let i = -2; i <= 2; i++) {
      const bend = i * 7 + (rnd() - 0.5) * 6;
      s += `<path d="M${f(x + i * 2)} ${y} q${f(bend * 0.3)} ${f(-h * 0.6)} ${f(bend)} ${f(-h - Math.abs(i) * -3)}"/>`;
    }
    return s;
  }
  function tufts(y0, n, hMin, hMax, x0 = -20, x1 = 1620) {
    let s = "";
    for (let i = 0; i < n; i++) { const x = x0 + ((x1 - x0) * (i + rnd() * 0.6)) / n; s += tuft(f(x), y0 + f(rnd() * 10), hMin + rnd() * (hMax - hMin)) }
    return s;
  }
  function stars(n) {
    let s = "";
    for (let i = 0; i < n; i++) s += `<circle cx="${f(rnd() * 1600)}" cy="${f(20 + rnd() * 360)}" r="${f(0.8 + rnd() * 1.6)}" style="animation-delay:${f(rnd() * 4)}s"/>`;
    return s;
  }
  function flies(n) {
    let s = "";
    for (let i = 0; i < n; i++) s += `<circle cx="${f(560 + rnd() * 760)}" cy="${f(560 + rnd() * 240)}" r="${f(2 + rnd() * 2)}" style="animation-delay:${f(rnd() * 5)}s;animation-duration:${f(3 + rnd() * 3)}s"/>`;
    return s;
  }
  const bird = (x, y, k) => `<path transform="translate(${x} ${y}) scale(${k})" d="M0 0 q9 -9 18 -1 q9 -8 18 1"/>`;

  function svg() {
    seed = 7;
    return `<svg class="hm-svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="sSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="s-sky1"/><stop offset=".62" class="s-sky2"/><stop offset="1" class="s-sky3"/></linearGradient>
    <linearGradient id="sRiver" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="s-riv1"/><stop offset="1" class="s-riv2"/></linearGradient>
    <mask id="sMoon" maskUnits="userSpaceOnUse" x="0" y="0" width="1600" height="560"><rect width="1600" height="560" fill="#fff"/><circle cx="1040" cy="212" r="54" fill="#000"/></mask>
    <radialGradient id="sGlow"><stop offset="0" class="s-glow1"/><stop offset="1" class="s-glow2"/></radialGradient>
  </defs>
  <rect width="1600" height="560" fill="url(#sSky)"/>
  <g class="s-stars">${stars(46)}</g>
  <circle cx="1010" cy="232" r="190" fill="url(#sGlow)"/>
  <g class="s-sunwrap"><circle class="s-sun" cx="1010" cy="232" r="62"/></g>
  <g class="s-clouds">
    <path class="s-cloud" d="M180 170h190a34 34 0 0 0-34-34 50 50 0 0 0-92-12 32 32 0 0 0-64 46z"/>
    <path class="s-cloud c2" d="M1240 120h150a28 28 0 0 0-28-28 40 40 0 0 0-74-8 26 26 0 0 0-48 36z"/>
    <path class="s-cloud c3" d="M640 92h110a20 20 0 0 0-20-20 30 30 0 0 0-56-6 20 20 0 0 0-34 26z"/>
  </g>
  <g class="s-birds">${bird(700, 200, 1)}${bird(748, 176, .8)}${bird(790, 214, .7)}${bird(1260, 300, .9)}</g>
  <!-- far bank: tree line and small palms -->
  <path class="s-far" d="M0 528 C40 500 70 506 100 512 C130 488 170 490 200 506 C240 486 280 494 300 508 C350 492 380 500 420 510 C470 484 520 492 560 506 C600 494 640 498 690 508 C740 488 790 494 840 506 C900 490 940 498 990 508 C1040 486 1100 494 1150 506 C1200 492 1250 498 1300 510 C1350 488 1410 496 1460 506 C1510 492 1560 498 1600 504 V560 H0z"/>
  ${palm(150, 512, 70, 8, .5, "s-palm-far")}${palm(470, 508, 84, -6, .55, "s-palm-far")}${palm(1180, 506, 76, 10, .52, "s-palm-far")}${palm(1420, 508, 88, -8, .58, "s-palm-far")}
  <!-- the river -->
  <rect class="s-river" y="520" width="1600" height="100" fill="url(#sRiver)"/>
  <g class="s-glint"><path d="M960 540h100M940 556h140M970 572h90M950 590h120M985 606h60"/><path d="M180 548h60M330 584h80M1290 566h70M1440 596h60M560 600h50"/></g>
  <!-- sampan with a farmer in a conical hat -->
  <g transform="translate(720 572)"><g class="s-boat"><g class="s-bob">
    <ellipse class="s-shadow" cx="0" cy="12" rx="70" ry="6"/>
    <path class="s-hull" d="M-74 -2 Q0 26 74 -2 L64 -8 Q0 12 -64 -8z"/>
    <path class="s-oar" d="M10 -40 L54 22"/>
    <path class="s-shirt" d="M-6 -6 L-12 -34 Q0 -40 12 -34 L6 -6z"/>
    <circle class="s-skin" cx="0" cy="-42" r="7"/>
    <path class="s-hat" d="M-22 -44 L22 -44 L0 -62z"/>
    <path class="s-basket" d="M-50 -8 h26 l-4 -12 h-18z"/>
  </g></g></g>
  <!-- near bank -->
  <path class="s-bank" d="M0 612 C220 600 460 606 700 604 C960 600 1240 608 1600 600 V900 H0z"/>
  <path class="s-paddy-w" d="M0 640 C300 630 620 636 880 632 C1100 628 1320 632 1600 626 L1600 664 C1320 670 1100 672 880 676 C600 682 300 680 0 690z"/>
  <path class="s-paddy-a" d="M0 690 C300 680 600 682 880 676 C1100 672 1320 670 1600 664 L1600 726 C1200 730 1000 728 880 732 C600 740 300 744 0 752z"/>
  <path class="s-paddy-b" d="M0 752 C300 744 600 740 880 732 C1000 728 1200 730 1600 726 V800 H0z"/>
  <path class="s-bund" d="M0 640 C300 630 620 636 880 632 C1100 628 1320 632 1600 626M0 690 C300 680 600 682 880 676 C1100 672 1320 670 1600 664M0 752 C300 744 600 740 880 732 C1000 728 1200 730 1600 726"/>
  <g class="s-rows">${tufts(688, 70, 12, 18, 0, 1600)}${tufts(748, 80, 14, 22, 0, 1600)}</g>
  <!-- canal with a monkey bridge (cầu khỉ) -->
  <path class="s-canal" d="M330 604 C350 660 300 720 230 780 C180 824 150 860 130 900 L250 900 C270 860 300 824 340 790 C410 730 450 668 420 604z"/>
  <g class="s-bridge">
    <path d="M220 744 L470 732"/><path class="s-rail" d="M222 708 L468 696"/>
    <path class="s-post" d="M248 760 L262 690M300 758 L288 688M392 752 L404 684M444 748 L430 680"/>
  </g>
  <!-- stilt house under coconut palms -->
  <g class="s-house">
    <path class="s-stilt" d="M842 640 V600M872 640 V600M932 640 V600M992 640 V600M1022 640 V600"/>
    <rect class="s-floor" x="828" y="592" width="210" height="12" rx="3"/>
    <rect class="s-wall" x="846" y="528" width="174" height="66"/>
    <rect class="s-win" x="884" y="548" width="34" height="26" rx="3"/>
    <rect class="s-door" x="950" y="544" width="36" height="50" rx="2"/>
    <path class="s-roof" d="M814 536 L934 466 L1052 536z"/>
    <path class="s-thatch" d="M850 516 L934 470M880 526 L934 492M988 526 L934 492M1018 516 L934 470M840 532 H1028"/>
    <path class="s-ladder" d="M1040 604 L1060 642M1052 604 L1072 642M1044 616 L1058 616M1050 628 L1064 628"/>
  </g>
  <rect class="s-winglow" x="852" y="520" width="98" height="80" rx="40"/>
  ${palm(800, 640, 210, -26, 1, "s-palm")}${palm(1090, 640, 260, 30, 1.15, "s-palm")}${palm(1150, 650, 180, 54, .9, "s-palm")}${palm(1380, 660, 230, -20, 1.05, "s-palm")}
  <!-- water palms (dừa nước) on the right bank -->
  <g class="s-nipa">${[1240, 1300, 1470, 1540].map((x, i) => `<path d="M${x} 640 q-40 -60 -90 -70M${x} 640 q-10 -70 -30 -100M${x} 640 q20 -70 50 -96M${x} 640 q46 -50 96 -56"/>`).join("")}</g>
  <!-- foreground: rice and lotus -->
  <path class="s-front" d="M0 796 C300 786 700 792 1000 786 C1240 782 1420 788 1600 784 V900 H0z"/>
  <g class="s-sway s1">${tufts(860, 34, 26, 40, -20, 560)}</g>
  <g class="s-sway s2">${tufts(870, 30, 28, 44, 780, 1620)}</g>
  <g class="s-lotus">
    <ellipse class="s-pond" cx="690" cy="872" rx="170" ry="30"/>
    <ellipse class="s-pad" cx="600" cy="866" rx="46" ry="12"/><ellipse class="s-pad" cx="700" cy="884" rx="38" ry="10"/><ellipse class="s-pad" cx="770" cy="858" rx="30" ry="8"/>
    <path class="s-stem" d="M664 870 Q660 840 668 812"/>
    <g transform="translate(668 812) scale(1.5)"><path class="s-pet2" d="M0 0 C-22 -6 -26 -26 -12 -34 C-8 -20 -4 -10 0 0z M0 0 C22 -6 26 -26 12 -34 C8 -20 4 -10 0 0z"/>
      <path class="s-pet" d="M0 0 C-12 -10 -12 -34 0 -46 C12 -34 12 -10 0 0z"/></g>
    <path class="s-stem" d="M748 862 Q752 846 746 832"/><circle class="s-bud" cx="746" cy="828" r="8"/>
  </g>
  <g class="s-flies">${flies(26)}</g>
</svg>`;
  }
  return { svg };
})();
