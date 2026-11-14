# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary: rice farmers in coastal Sóc Trăng, Mekong Delta.** They are choosing next season's rotation for one or more fields. They use a phone, often outdoors, and read Vietnamese. When a trade-off appears, they win.
- **Secondary: NASA Space Apps 2026 judges.** They open the live site, mostly in English on a computer, to see how NASA data is used and whether the advice can be trusted.

## Product Purpose

Mekong Rotation Explorer compares a farmer's current rotation with other local options (rice–shrimp, rice plus a dry-season upland crop, salt-tolerant rice with a rest period, three rice crops) for the area they pick. It ranks them against the farmer's own priorities (water, income, soil, weather and salt safety) in a typical year and an El Niño year, then gives a 12-month plan with seed, fertiliser and key steps.

Success: a farmer can see which rotation suits their field and why, and a judge can trace every number to its source.

## Positioning

Every score is computed from named NASA data for that place (rain, water demand, greenness, soil) and from published figures with their source, never from opinion. The tool states how sure it is and where it is guessing. It helps the farmer think; it does not replace their judgement or the local extension officer.

## Operating Context

- Five map pins in Sóc Trăng; the farmer taps a pin or the map to pick the nearest area.
- Several fields per farmer, one tab each; each keeps its own area, crop, priorities, limits and plan, saved on that phone only.
- Two views: **Advanced** (default: chart, sub-scores, evidence) and **Simple** (answer first, plain words, larger text and controls).
- Two scenarios: typical year and El Niño year, with the NOAA outlook.
- Built by six AI agents and their human users under the rules in `AGENTS.md`; changes go through issues, proposals and reviewed pull requests.

## Capabilities and Constraints

Confirmed as fixed by @kp712:

- **Trust rules.** Every number names its NASA dataset and keeps its `[n]` source link. The disclaimer stays.
- **Salinity** is labelled an estimate unless concrete, direct salinity data is found. (Today it is an estimate from public station reports; it is not measured by satellite.)
- **English and Vietnamese parity.** All user-facing text exists in both languages.
- **Static and offline-light.** A static site with no build step or installs, reading only `docs/data/sites.json`. It must still show the cards and the plan when the map or chart library fails to load.

Other facts:

- Scores are 1.0–5.0 with one decimal; the formulas live in the README and `pipeline/rotations.json`.
- Out-of-scope and declined ideas are in `DECISIONS.md`.

Open, not confirmed as fixed:

- The phone and accessibility floor used in today's checks (WCAG 2.2 AA with 0 axe-core violations, no horizontal scroll down to 215 px, Simple view text at least 18 px and controls at least 44 px). `AGENTS.md` and `agents/claude-pro1.md` still require these checks; @kp712 did not mark them as durable for future design work.
- Proposal #69 (bigger map, one section order for both views) will replace the current Simple order and first-screen test once approved and merged.

## Brand Commitments

- Name: **Mekong Rotation Explorer**, by Team Lục Long Hội.
- Voice: plain words a farmer would use; honest about uncertainty.
- Visual theme, binding by @kp712's decision (11 Nov 2026): **Aurora**, the blue "Gateway" direction, with a bright tangerine accent used as highlights only. System fonts. A dark theme that follows the phone setting.

## Evidence on Hand

- Data: NASA POWER (rain, temperature, water demand), NASA GPM (rain), NASA MODIS NDVI (greenness), SoilGrids (soil), NOAA El Niño index and forecast; salinity estimates from public station reports. Built into `docs/data/sites.json`.
- Published profit figures, seed rates and fertiliser guidance with source quotes in `pipeline/profits.json` and `pipeline/resources.json`; a numbered source list in the app.
- Screenshots: `media/phone.jpg`, `media/desktop.jpg`.
- Not on hand, do not invent: testimonials, user counts, farmer trial results, a logo.

## Product Principles

1. Farmers first: a decision that helps a judge but slows a farmer on a phone is the wrong one.
2. Show the source and the doubt next to the number.
3. Answer first, evidence one tap away.
4. Refine what exists before adding features.
5. The app must keep working when something fails to load.
