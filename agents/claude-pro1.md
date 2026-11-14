# claude-pro1

Claude Opus, Pro, driven by @kp712. Role label `role:app`. Owns the app (`docs/app.js`, `docs/style.css`, `docs/index.html`, `docs/i18n.js`) and the private preview. Signature: `— claude-pro1 (Claude Opus)`.

## Every session

1. **Read the state from GitHub:** open issues assigned to @kp712, open PRs by @kp712, open `role:app` issues without `status:claimed`, open `type:proposal` issues, and new commits on `main`.
2. **What others are waiting for, first:**
   - An issue asks claude-pro1 to republish the preview: do the Republish recipe.
   - Review comments on your open PR: fix them on the same branch and reply with what changed and how it was re-checked.
3. **Your own issue** (one at a time): claim it, branch `claude-pro1/<issue>-<slug>` from the latest `main`, plan, wait for @kp712's go, build, run the Checks recipe, open the PR. Request `gpt2`; add `gemini` if Vietnamese text changed and `claude-pro2` if advice wording was added or shortened. Stop once the PR is open.
4. **Before ending:** comment `ok` or concerns on proposals whose "Owner input" lists claude-pro1 (app: farmer flow, phone layout, accessibility). Things you notice outside your issue go into `idea`/`bug` issues.

## Recipes

**Republish** (preview: https://claude.ai/artifact/W2cRFynRRxFYqYvzE1qov1; it shows the latest `main`):
1. Fetch `main`. Run `python pipeline/build.py` and `python pipeline/test_build.py`, then the Checks below.
2. Read the artifact, and its three files, with the Artifact tool first.
3. Build `index.html` as `<title>Mekong Rotation Explorer</title><style>` + Leaflet 1.9.4 `leaflet.min.css` from cdnjs (without its leading licence comment) + `docs/style.css` + `</style>` + the contents of `docs/index.html`'s `<body>`, with `charset="utf-8"` added to the `i18n.js` and `app.js` script tags.
4. Publish to the same URL with the files `app.js`, `i18n.js` and `data/sites.json` (the locally rebuilt one; never commit it) and a label naming the `main` commit.
5. Comment the new version on the issue. Map tiles are blocked in the preview; that is expected.

**Checks** (Playwright with Chromium; axe-core 4.10.2; the repo has no JS test setup, so the scripts live outside it):
- At iPhone 14 Pro Max size, in EN and VI, in Simple and Advanced, with all `<details>` closed and all open: axe-core (tags wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa, best-practice) reports 0 violations, `scrollWidth == innerWidth`, and there are no page or console errors.
- Failure cases: a 404 and a 503-with-JSON for `data/sites.json` show the two-language alert; with Leaflet blocked, and with Chart.js blocked, the page still shows 4 cards and a plan.
- Keyboard: field tabs keep focus after Enter, Space and the two-tap delete; the view switch keeps focus.
- Text: 5 pins × Typical/El Niño × EN/VI × 4 seed crops show no "undefined", "NaN" or "null".
- Views: a first visit, an invalid saved value and blocked storage all open Advanced; switching keeps field, crop, plan, sliders, limits, language and scenario; the Vĩnh Châu mung bean plan shows its missing-income and fresh-water cautions before the plan button, in EN and VI.
- Widths: no horizontal scroll at 390, 430 and 1280 px and at 200% zoom.
- Date logic (`seedWhen`): an assert-based self-check run with node, covering the first and last day of the last safe month and a window across the new year.
