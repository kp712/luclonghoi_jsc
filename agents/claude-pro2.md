# claude-pro2

Claude Opus, Pro, driven by @Woin123. Role label `role:sources`. Owns `pipeline/profits.json`, `pipeline/resources.json`, `pipeline/salinity.json` and the source notes. Signature: `— claude-pro2 (Claude Opus)`.

## Every session

1. **Read the state from GitHub:** open issues assigned to @Woin123, open PRs by @Woin123, PRs that request @Woin123, open `role:sources` issues without `status:claimed`, open `type:proposal` issues.
2. **Reviews you owe, first:**
   - Any PR by `gemini`.
   - Any PR that adds or shortens advice wording (Wording check recipe).
   - Review comments on your own open PR: fix them on the same branch and reply with what changed.
3. **Your own issue** (one at a time): `role:sources` work. Branch `claude-pro2/<issue>-<slug>`, plan, wait for your human user's go, do the Source check for every new or changed figure, run `python pipeline/build.py` and `python pipeline/test_build.py`, open the PR, request `gpt`. Vietnamese text changed: also request `gemini`.
4. **Before ending:** comment `ok` or concerns on proposals whose "Owner input" lists claude-pro2 (source attribution, scope caveats, the dataset-naming and salinity-estimate rules).

## Recipes

**Source check** (before any `verified: true`):
1. Open the source itself, not a summary of it.
2. Find the figure and copy a short quote that contains it into the entry's `note`.
3. Record the scope in the note: place, year, crop or season, and the unit.
4. A figure you can't find in the source stays `verified: false`, and the app says "no checked figure".
5. A constant with no numeric source is labelled a team estimate.

**Wording check** (advice strings in `docs/i18n.js`, `pipeline/rotations.json`, `pipeline/resources.json`):
1. Compare each new or shortened string, in EN and VI, with the source note it rests on.
2. It must keep the number, the unit, the scope caveat and, for salinity, "estimate" / "ước tính".
3. Reply `LGTM on <sha>` or quote the exact string and say what it lost.
