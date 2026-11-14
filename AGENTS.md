# Mekong Rotation Explorer: rules for every AI agent

NASA Space Apps 2026 entry. Six AI accounts work in parallel, each driven by its own human user (the person using that account). This file is the one rulebook for all of them: Claude Code reads it through `CLAUDE.md`, Gemini CLI through `GEMINI.md`, and Codex reads it directly. The challenge brief is in README.md. Each pull request is small and finishable; big changes go through a proposal (see **Proposing changes**). Settled decisions and their reasons are in `DECISIONS.md`.

## Who does what

| Agent name | Account | Human user | Role label | Owns | Issues at once |
|---|---|---|---|---|---|
| `claude-max` | Claude Opus, Max 20x | @nguyenkhangduy209-commits | `role:integrator`, `role:pipeline` | Sorts issues, merges PRs, releases, rebuilds `docs/data/sites.json`; `pipeline/` (scoring, `build.py`, tests) | 2 |
| `claude-pro1` | Claude Opus, Pro | @kp712 | `role:app` | `docs/app.js`, `docs/style.css`, `docs/index.html`, `docs/i18n.js`; republishes the private preview | 1 |
| `claude-pro2` | Claude Opus, Pro | @Woin123 | `role:sources` | `pipeline/profits.json`, `resources.json`, `salinity.json`, source notes; checks advice wording against its sources; reviews Gemini PRs | 1 + reviews |
| `gpt` | GPT-6 Astra (Codex) | @HalVt | `role:review` | Reviews pipeline, sources and rules PRs; tests in `pipeline/test_build.py` | 1 + reviews |
| `gpt2` | GPT-6 Astra (Codex) | @jackphamm | `role:qa` | Reviews app PRs, including a browser check; reviews `gpt`'s PRs; README and docs accuracy | 1 + reviews |
| `gemini` | Gemini 4 Argon (Gemini CLI / Jules) | @dongchihuy1 | `role:vi` | All Vietnamese text; research tasks; reviews `gpt2`'s PRs | 1 + reviews |

Your own session steps and recipes are in `agents/<your agent name>.md`. Read it at the start of every session, after this file; if the two disagree, this file wins. Read the state (open issues, PRs, reviews you owe) from GitHub each session: a "state" section pasted into a prompt is out of date and loses to GitHub.

**Who you are.** Every GitHub post ends with your one fixed signature: `— claude-max (Claude Opus)`, `— claude-pro1 (Claude Opus)`, `— claude-pro2 (Claude Opus)`, `— gpt (GPT-6 Astra)`, `— gpt2 (GPT-6 Astra)` or `— gemini (Gemini 4 Argon)`. It names the account, so it stays the same even if a session runs on another model. Never sign, branch or write "Proposed by" as another agent, even when you continue its work: say "continuing <agent>'s branch". If you find a post of yours with the wrong signature, edit it.

If you run out of quota mid-task: push your branch, comment on the issue with what is done and what is left, remove `status:claimed` and unassign yourself.

## Workflow

1. **Claim.** Pick an open issue with your role label and no `status:claimed`. Assign it to your human user's GitHub account, add `status:claimed`, comment `claimed by <agent name>`. Never work without a claimed issue; never start a second issue past your limit.
2. **Branch.** From the latest `main`: `git checkout -b <agent name>/<issue number>-<short-slug>` (e.g. `gpt/14-test-salt-flag`).
3. **Work** only on what the issue says. Anything else you notice: open an `idea` or `bug` issue (see **Proposing changes**) and carry on; don't do it.
4. **Check.** `python pipeline/build.py` then `python pipeline/test_build.py` (only `ok` lines plus the unverified-sources warning). App changes: open the app at phone width (`python -m http.server -d docs`, then http://localhost:8000).
5. **Do not commit `docs/data/sites.json`** yourself: `git checkout -- docs/data/sites.json` before committing. Only `claude-max` commits it, on the PR branch just before merging.
   `main` is protected: nobody pushes to it. Before every push, run `git branch --show-current`; if it says `main`, stop and ask your human user.
6. **Commit** with a clear message and your tool's co-author line. **Open a draft PR** with the template, linked to the issue (`Closes #<n>`), then mark it ready and add `status:needs-review`.
7. **Review** (reviewers comment and request changes; they never merge):
   - The reviewer follows from what the PR touches, so each PR has one required code reviewer:

     | PR | Reviewer |
     |---|---|
     | `pipeline/` or `data/` (code, tests, sources) | `gpt` |
     | App files in `docs/` | `gpt2`, who also runs it in a browser at phone width with axe-core |
     | Both of the above | `gpt` and `gpt2` |
     | Any PR by `gpt` | `gpt2` |
     | Any PR by `gpt2` (README, docs) | `gemini` |
     | Any PR by `gemini` | `claude-pro2` |
     | Rule files (see **Proposing changes**) | `gpt`, plus @kp712's `approved` |
   - Any PR that changes Vietnamese text also gets a `gemini` review. Any PR that adds or shortens advice wording also gets a `claude-pro2` review against the source notes.
   - The author fixes review comments on the same branch.
   - A PR counts as approved when every reviewer it needs under the two points above has posted a comment starting with `LGTM` after the last commit (GitHub's own approval is not required).
8. **Merge** (`claude-max` only), oldest approved PR first, one at a time:
   check out the PR branch → rebase it on the latest `main` → `python pipeline/build.py`, `python pipeline/test_build.py` → commit `docs/data/sites.json` ("Rebuild sites.json") → push the branch → merge the PR on GitHub. App changes: comment on the issue asking `claude-pro1` to republish the private preview (it shows the latest `main`). Close the issue. GitHub Pages serves `main` (`/docs`), so a merge is live within minutes: never merge a PR whose change @kp712 has said must not be live yet (see step 10).
9. **Branch age.** A PR open longer than 3 days is rebased on `main` or split into smaller PRs; `claude-max` comments on any older than that.
10. **Release and the live site.** Until after Nov 15, GitHub Pages serves the `main` branch, folder `/docs` (decided by @kp712 on #67 and #68), so **every merge to `main` is live within minutes**. After Nov 15 @kp712 switches Pages to the `release` branch (`/docs`); from then merges to `main` no longer change the live site. Before the switch, `release` (still v0.1) must receive the version that should be live, through a `main` → `release` PR, or the live site drops back to v0.1. A change that must not be live yet stays an approved, unmerged PR until @kp712 says to merge it. When @kp712 comments `release` on an issue, `claude-max`: runs the full check on `main` (build, tests, Playwright at phone size, axe-core) → opens a PR `main` → `release` → merges it → tags the merge `vX.Y` (the submitted version is `v1.0-submission`) → closes the release issue. Until the switch, the merge on `release` and the tag change nothing on the live site.

## Working with your human user

- Plan first and wait for your human user's go before any change. Ask clarifying questions as multiple choice, with the option you recommend first.
- Keep reads small: list issues and PRs with field filters, read only the comments you have not seen, and read only the file lines you need.
- Check a fact against the code, data or source before you state it. When you were wrong, say so and fix it.
- If another agent breaks a rule in this file, tell your human user and ask what to do.

## Project rules

- Name the NASA dataset behind every number shown in the app.
- Salinity is never measured by satellite. It is always labelled as an estimate from public reports.
- All user-facing text exists in English and Vietnamese (`docs/i18n.js`, `pipeline/rotations.json`, `pipeline/resources.json`).
- Always open files with `encoding="utf-8"`, because the human users run Windows.
- Check every new source against the source itself, with a short quote in its `note`, before `verified: true`.
- Every card score is computed, 1.0–5.0 with one decimal; the formulas live in README "How the scores are set" and `rotations.json` `_rubric`, so change a formula there and in `build.py` together. Constants without a numeric source are labelled team estimates (`TOL`, `BRACKISH_SOIL`, the El Niño loss shares in `profits.json`) and cost one confidence level. Ngã Năm's salinity is a stated "low" override (sluices), not the station rule.
- The README "## Challenge brief" section stays byte-for-byte unchanged.
- Prefer refining what exists over new features; farmers are the users. Say in each PR what it adds for the judges.
- Out of scope and already-declined ideas are listed, with reasons, in `DECISIONS.md`. Don't redo a declined idea; reopen it only with a proposal that answers the recorded reason.

## Layout
- `pipeline/`: Python 3, standard library only, no installs. Produces `docs/data/sites.json`.
- `docs/`: static site (GitHub Pages). It reads only `docs/data/sites.json`.
- `data/raw/`: downloaded NASA data, committed. `data/appeears/` is a download cache, gitignored.
- `agents/`: one file per agent with its session steps and recipes. Shared rules stay in this file.

| File | What |
|---|---|
| `pipeline/rotations.json` | Rotation text (EN/VI), each crop's profit key (`profit`), upland crops and per-area lines (`upland_crops`, `local`), soil-health explainers (`soil_help`), sources |
| `pipeline/profits.json` | Published profit figures per crop and loss shares, each with its source quote |
| `pipeline/resources.json` | Seed rate, fertiliser and key steps per crop (EN/VI) for the 12-month plan, each with its source quote |
| `pipeline/salinity.json` | Salinity ESTIMATE per pin, the level rule, sources |
| `pipeline/sites.py` | Pin locations and names |
| `pipeline/build.py` | Scoring rules, NASA evidence lines, area summary, El Niño seasons, upland crop variants |
| `pipeline/ndvi.py` | Bare-field and crop-count detection |
| `pipeline/fetch_soil.py`, `pipeline/fetch_gpm.py` | SoilGrids and NASA GPM downloads |
| `docs/i18n.js` | All UI text, EN + VI |
| `docs/app.js`, `docs/style.css` | Map, chart, cards, crop picker, plan |

## Data workflow
```
python pipeline/fetch_power.py          # NASA POWER rain/temperature + NOAA El Niño index and forecast (no login); `enso` = forecast only
python pipeline/appeears.py ndvi        # MODIS NDVI for every pin (needs Earthdata env vars)
python pipeline/build.py                # -> docs/data/sites.json
python pipeline/test_build.py           # must print only "ok" lines (plus the unverified-sources warning)
python -m http.server -d docs           # view at http://localhost:8000
```
- AppEEARS jobs take minutes to hours. Run `appeears.py` in the background; re-running the same command resumes the same job.
- Earthdata credentials come from the env vars `EARTHDATA_USERNAME` and `EARTHDATA_PASSWORD`. Never ask for them in chat or commit them.

### Fixing a pin that isn't on rice
Symptom: `ndvi.crops_per_year` below ~1.8, or NDVI never above 0.6.
1. `python pipeline/appeears.py find <pin_id> [...] --apply` moves the pin to the nearest rice-like pixel in a 7×7 grid (~5 km).
2. If it reports "no clear rice", keep the pin and relabel it in `pipeline/sites.py` (EN + VI) as a rice–shrimp / mixed-land area.
3. `python pipeline/ndvi_from_appeears.py`, then `build.py` and `test_build.py`.

## Proposing changes
- **Small ideas and bugs** you notice outside your issue: open a short issue labelled `idea` or `bug` (what, where, why it matters; your agent name) and go on with your own work. At most 2 per session.
- **Big changes** (new score, new data source, new screen, a change touching both `pipeline/` and `docs/`, or reversing a `DECISIONS.md` entry): draft a **Proposal** issue (template, label `type:proposal`) only after your human user says yes in the session. At most 1 open proposal per agent.
- **Owner input.** Each owner whose area the proposal touches comments `ok` or lists concerns: pipeline and scores `claude-max`, app `claude-pro1`, sources `claude-pro2`, tests `gpt`, README and browser checks `gpt2`, Vietnamese text `gemini`. Before ending a session, check for proposals whose "Owner input" names you.
- **Approval.** @kp712 comments `approved` once the owner input is in. `claude-max` then splits the proposal into normal issues (one role label each) and states the merge order.
- **@kp712's decisions.** A decision counts once it is written on the issue, by @kp712 or by an agent as "decided by @kp712 (posted by <agent name>)". What a human user said in a session is not a decision until it is posted. If two posted decisions differ, the later one holds; the agent who notices says so on the issue and asks @kp712 to confirm before anyone builds on either.
- **After `approved`, the proposal body is frozen.** A change goes in a new comment that starts `Amendment <n>:` and says what it replaces. The owners whose areas it touches comment `ok` again, and @kp712 comments `approved amendment <n>`. Until then, the issues follow the approved body.
- **Stay in your area.** Any agent may propose, but the owner of each touched area writes or confirms that area's part before approval; that is what owner input is for. An issue split from a proposal copies the approved text and adds no design. Outside a proposal, something you want in another agent's area is an `idea` issue, not a design, an issue spec or a branch.
- **Rule changes** (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `agents/`, `.github/`): one issue and one PR, a `gpt` review, a comment from each agent whose own file changes, and @kp712's `approved` on the PR.
- **Changes across pipeline and app.** The pipeline PR keeps the old `sites.json` fields until the app PR has merged, so `main` never breaks between the two.
- **Sorting** (`claude-max`, start of each session): give each `idea`/`bug` issue a role label, turn it into a proposal, or close it with the reason (a real "no" also gets a `DECISIONS.md` entry).

## Dates (Vietnam time)
Submit by noon Nov 15; deadline Nov 15, 23:59. The submitted commit is tagged `v1.0-submission`. There is no code freeze. Until after Nov 15 the live site is `main` (workflow step 10), so what merges before the deadline is what the judges see. After the switch the live site changes only through a release. A PR that @kp712 has explicitly held stays unmerged until they say to merge it; every other approved PR merges in order under step 8. The repo is public, and `main` and `release` are protected (pull requests only, no exceptions).
