# Design system: Mekong Rotation Explorer

What the live site looks like today (16 Nov 2026), written down so new work matches it. The tokens are in `docs/app/style.css`; the dashboard shell is in `docs/app/today.css` and uses only those tokens. PRODUCT.md holds the users, purpose and trust rules; this file covers how the app looks and behaves.

## Mode and feel
- **Operate**: a field tool used outdoors, on a phone, in Vietnamese first. Scanability and big, sure targets come before decoration.
- **Feel: a living paddy.** Deep green-black (dark) or pale rice-paper green (light), a warm gold accent, and soft "leaf" shapes. Nature shows up in shape and in the drawn field scene; there is no texture noise or stock photography.

## Colour tokens (light / dark)
| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` / `--bg-2` | #F2F5F1 / #E7ECE7 | #0F1714 / #16211D | page, inset tiles |
| `--panel-solid` | #FFFFFF | #16211D | cards |
| `--ink` / `-2` / `-3` | #15302A / #4F625B / #6E7F78 | #E8EFEA / #A3B3AB / #7F918A | text: main, secondary, notes |
| `--gold` (+ `--gold-soft`) | #A8730F | #E5B24F | the one accent: primary actions, current month, badges |
| `--water` | #2F78A3 | #74ABD1 | rain, fresh water, shrimp |
| `--rice` | #5C9A3C | #86C064 | rice, greenness, crops |
| `--risk` | #C9492F | #EF7A5E | salt, high pest pressure, warnings |
| `--ok` | #2F7D3E | #7CC98A | safe, enough rain, low pressure |
| `--line` / `--line-2` | ink at 10% / 18% | | borders |

- Meaning is fixed: water is blue, crops are green, salt and risk are red, safe is green, and gold is the accent. Never use colour alone: every level also has a word (Ngọt / Lợ / Mặn, Thấp / Vừa / Cao).
- Mix tints with `color-mix(in srgb, var(--x) N%, transparent)` instead of new hex values. Fixed hex values are allowed only inside the field-scene drawing (soil, shrimp).
- The status bar follows the theme through `<meta name="theme-color">` (the `--bg` values).

## Type
- **Be Vietnam Pro** everywhere (400–800; full Vietnamese diacritics), with a system-ui fallback. Fraunces is the home page's display face only, and it loads only when that page opens.
- Scale: card titles 1.125 rem/700, hero number 3.5 rem (3 rem on phones), tile number 1.875 rem, body 0.9375–1 rem, notes 0.75 rem. **No dashboard text below 12 px**, chart labels included (SVG text sizes are raised on narrow phones).
- Numbers use `font-variant-numeric: tabular-nums`. Keep units attached to their numbers with a non-breaking space (`26,8 °C`).

## Shape and space
- **Leaf cut**: cards use `--card-r: 28px 10px 28px 10px`; icon badges use `--leaf: 62% 14% 62% 14% / 62% 14% 62% 14%`; tiles use `18px 6px 18px 6px`. Cards have a 2 px outline tinted toward `--rice` (the hero card toward its crop colour).
- Spacing steps: 4 · 8 · 12 · 16 · 20 · 24 · 32. Card padding 20 px (16 px under 420 px).
- Touch: every control is at least **44 × 44 px**. On narrow phones a row wraps or splits into two lines instead of shrinking targets (the clock's year switch, the month strip).

## Layout
- Phone first: a fixed top bar, then the live date bar (`#dvClock`: play, today's date and time, the 1/2/3-year switch, the season strip), then the scrolling page, then a floating bottom nav (Hôm nay · Mùa vụ · **+ Kế hoạch** · Số liệu · Ruộng).
- Laptop (≥ 1000 px): full width with no side gaps; the Today cards flow in 2 masonry columns (3 at ≥ 1500 px); Season and Fields become auto-fill grids.
- While the dashboard is on, the map layers underneath are hidden and `inert`.

## Components (dashboard)
- **Crop hero** (`.hx`): a drawn field scene (rice clumps that grow and ripen, a shrimp pond, bushes; sun or rain from the month's NASA rain vs water need; yellow water when salty), then the crop name, days to harvest, a progress bar with the published rice-step ticks, the next job and what follows.
- **Tiles** (`.t-tile`): a badge, a label, a large number with its unit, a meter, a one-line meaning and the NASA dataset name. Tiles share the row evenly, so a missing tile leaves no gap.
- **Pest card** (`.t-pest`): this month's level, the pest, why (temperature against the Horgan curve), and 12 monthly bars over the plan window.
- **Badges**: the leaf shape, tinted with the meaning colour at 16–18%.

## Motion
- Purposeful and quiet: rice sways (4.5 s, alternating), rain falls, the live dot pulses, press feedback scales to 0.98 in 160 ms, and pages crossfade in 180 ms (View Transitions).
- Year playback updates the page in place (`patch` in dash.js): only changed nodes are touched, so bars glide and running animations do not restart.
- `prefers-reduced-motion`: sway, rain, pulse, crossfade and press scaling switch off; playback steps every 1.5 s.

## Code rules that keep this coherent
- **Prefix new class names by surface** (`t-`, `hx-`, `ss-`, `nk-`, `ps-`, `tc-`, `ck-`, `nv-`, `sc-`). The site loads 13 global stylesheets, and short names such as `.green`, `.need`, `.k-R` and `.on` already mean something elsewhere; reusing them has broken screens.
- Every number names its dataset next to it; salinity always says "ước tính" (estimate).
- Every user-facing string exists in Vietnamese and English.
- Check at 320, 375, 768, 1000, 1280 and 1700 px, in light and dark, with axe-core at 0 violations.
