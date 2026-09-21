# The Wrecking Wire

**The primary briefing instrument and source of truth** for Martin's 2026 fantasy ops — three tabs on one page: **Fantasy** (Big Blue Wrecking Crew, Yahoo), **Pick'em** (MetLife Crisis), **Survivor** (MetLife Crisis). Every update gets a dated post: a Quick Check (3-line briefing) that expands into the full Deep Dive story, plus a live roster/pool view.

## Tech Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript (no frameworks, no build tools, no package.json)
- **Hosting**: GitHub Pages from `main` → https://mgonzalvez.github.io/newswire/ (repo: `mgonzalvez/newswire`)
- **Data**: `data/roster.json` + `data/pickem.json` + `data/survivor.json` + `data/posts.json`
- **Font**: Space Grotesk from Google Fonts
- **Design**: Dark "wire service" aesthetic — deep navy, Big Blue accent, Space Grotesk, monospace labels, scrolling ticker

## Key Files

| File | Purpose |
|------|---------|
| `index.html` | Single page: masthead, ticker, 3 tabs (Fantasy / Pick'em / Survivor), footer |
| `styles.css` | Dark theme, CSS custom properties, responsive layout |
| `app.js` | Fetches JSON, renders all 3 tabs, tab switching (hash-routed), tiny markdown renderer |
| `data/roster.json` | Fantasy: team meta, pending transactions, starters, specialists (K/DST), bench |
| `data/pickem.json` | Pick'em: score, 16 games (fav/dog/line/pick/crowd/result), tiebreakers, notes |
| `data/survivor.json` | Survivor: status, current pick, pool distribution, ledger, rationale, verify list |
| `data/posts.json` | Wire feed posts; each has a `domain` tag (fantasy/pickem/survivor) |

## Running Locally

`fetch()` requires a server (file:// won't work):

```bash
cd fantasy_wire
python3 -m http.server 8080
# Open http://127.0.0.1:8080
```

## Source of Truth

The **site's JSON is canonical**. Inputs the agent reconciles into it:

1. **Screenshots** in `../fantasy_football_guidance/screenshots/` — canonical for roster and pool facts (dated, sourced). Position facts come from the Yahoo listing, not inference.
2. **Curated web sources** — volatile facts only (injuries, practice/active lists, lines, claim outcomes, scores):
   - ESPN (injury tracker, scores, transactions)
   - Rotowire (injury news, projections)
   - FantasyPros (usage/snap data)
   - Yahoo (league/roster facts, waiver processing)
   - Official NFL injury report (game designations)
   - Prioritize speed + accuracy: the best data, not all the data. No SEO listicles, no preseason rankings, no unsupported social posts.
3. **Archive** `../fantasy_football_guidance/archive/` — the old 2026 briefing docs, frozen 2026-09-21. **Reference only — never edit, never sync from.**

Update order every time:

1. Read the screenshot, diff against current `data/*.json`
2. Web search (3-search cap) the volatile items
3. Update the site's `data/*.json` + write the day's post
4. Commit + push to `origin/main`

## Updating the Site

### Daily post (Quick Check > Deep Dive)

1. Add a new object to `data/posts.json` (`app.js` sorts by date desc).
2. Fields: `id` (date-slug), `date` (YYYY-MM-DD), `tag` (Lineup / Transactions / Postmortem / Injury), `title`, `quick` (array of 2–3 short lines — the first line should start with `Lineup:` / `Verify:` / `Action:` so the hero labels render), `full` (markdown: `##`/`###` headings, `-` lists, `**bold**`, `*em*`).
3. **`quick` is the Quick Check** — what a glance must answer. **`full` is the Deep Dive** — the full analysis lives here, not in chat.
4. The newest post automatically becomes **Today's Briefing** in the hero.

### Roster changes

Edit `data/roster.json`:
- `team.asOf` / `team.source` — update whenever the roster snapshot changes (keep the screenshot in `../fantasy_football_guidance/screenshots/`).
- `starters` / `specialists` / `bench` — move players between arrays as the lineup changes; set `status` to `active` / `questionable` / `out`; `note` is shown on the card (amber, unless it matches replacement/hold/no-action patterns).
- `pendingTransactions` — shown as amber banners under the section head and in the ticker.

### Ticker

Built automatically from: questionable players (starters + specialists), pending transactions, and bench players with a "Thursday night" note. No separate config.

## Daily Update Workflow

The site is updated by the agent (pi) from a small daily input from Martin. Goal: Martin sends two things, the agent does the rest, the site is pushed within minutes.

### What Martin sends

| When | What | Why |
|------|------|-----|
| **Sat (lineup day)** | 1. Roster screenshot — Yahoo "Current Week" tab, same framing as `Roster 2026-09-17.png` (starters, bench, K, DST, pending transactions visible) · 2. One line: the lineup decision ("no changes" or "start X, bench Y") plus any confirmed facts he has | Screenshot = canonical roster facts. The decision is his call, not the agent's |
| **Sun (after games)** | 1. Opponent's final score (or a league results screenshot) · 2. Roster screenshot (optional) | The opponent score is the only league data the agent cannot get from web search |
| **Any day (something breaks)** | Screenshot + one line | Injury, trade, or claim outcome that changes the plan |
| **Any day (pool)** | Pick'em / Survivor screenshot + one line | Card saved, score, pool distribution, or a lock decision |

Save screenshots to `../fantasy_football_guidance/screenshots/` (`<Type> YYYY-MM-DD.png`).

### What the agent does (no input needed)

1. Save the screenshot, read it, diff against current `data/roster.json`
2. Web search (3-search cap, curated sources only) for volatile items: injuries, practice reports, active/inactive lists, claim outcomes, player stats, lines
3. Update the site JSON: `data/roster.json` (lineup moves, `status`, `note`, `team.asOf`/`team.source`, `pendingTransactions`), plus `data/pickem.json` / `data/survivor.json` when pool screenshots arrive
4. Write the day's post in `data/posts.json` (template below)
5. Commit + push to `origin/main` (repo: `mgonzalvez/newswire`), one commit per update, message `Week N: <short summary>`

### Post template (Quick Check > Deep Dive)

- `id`: `YYYY-MM-DD-<slug>` · `date`: `YYYY-MM-DD`
- `tag`: `Lineup` (Sat) · `Postmortem` (Sun) · `Injury` / `Transactions` (as needed)
- `quick`: 3 lines starting with `Lineup:` / `Verify:` / `Action:` — these render as labeled chips in the hero. Glance-readable.
- `full`: `##` sections — the Deep Dive. Sat: injury board, bench read, Sunday checklist · Sun: the result, player-by-player, lessons

### Cadence

| Day | Update |
|-----|--------|
| Sat | Main update: roster + "Week N: ..." lineup post |
| Sun | Postmortem post (needs the opponent score) |
| Thu | Optional: ticker note only, if a benched player plays TNF |
| Mon–Fri | Only if something breaks — short `Injury` / `Transactions` post |

## Operating Rules

- **No overthinking.** Speed and accuracy over exhaustiveness. Fast, accurate, minimal tokens and system resources — no update delay, no token thrash.
- **Quick Check > Deep Dive.** Chat answers stay quick (lineup / verify / action, 3 lines). The full analysis is written into the post's `full` field, never into chat.
- **3-search cap per update.** Tight queries against the curated sources only. No clear answer → tag `⚠ verify: [question]` in the post and move on. Never retry a failed search.
- Apply locked decisions without re-deriving them. No procedure narration.
- Screenshot arrives with **no decision**: output a Quick Check with recommendations, wait for confirmation, then push. Never push a lineup post with an unconfirmed change.
- Screenshot arrives with **"no changes"** and the locks are intact: push immediately, no re-confirmation.
- Roster facts come from the screenshot, not from search. Position facts come from Yahoo, not inference.
- If a search fails (oMLX down), tag the item `⚠ verify` in the post and move on — do not block the update.
- **Bake in confirmed facts** Martin hands over — update the site JSON so the next update is faster.

## Conventions

- No frameworks or build tools — vanilla JS/CSS/HTML only
- No external JS libraries; the markdown renderer in `app.js` is intentionally tiny (headings, lists, bold, em only)
- CSS custom properties for theming (`--accent`, `--muted`, etc.)
- Roster facts must match the dated screenshot in `../fantasy_football_guidance/screenshots/` — position facts come from Yahoo, not inference
- The archived reference docs live in `../fantasy_football_guidance/archive/` (reference only, frozen)

## Season State (volatile — verify against the data JSON + curated sources)

- 2026 season, Week 3 prep as of 2026-09-21.
- Fantasy: Wk2 W 135.08 vs Sandra's Fantasy Fumble (blowout, 8 of 9 starters 8+). Wk3 lineup holds (Purdy, Walker, Hubbard, Chase, Egbuka, Schultz, McMillan, Bass, Ravens DST); Collins OUT again, Etienne benched (LV = 3rd-fewest to RBs). Opponent: Runnin with the Bison! (proj 100.77 vs 93.29). Waiver priority 7.
- Pick'em (ATS league): Wk2 = 6 pts, 25/28, 13-18 — PHI won 24-20 but failed -7.0; 9 of 15 played games went to the dog. Wk3 card recommended 9 favs + 7 dogs (in pickem.json `recommendedCard`), not yet saved by Martin.
- Survivor: alive, 12 remain. Wk2 SF cashed (35-13); SF burned (no reuse). Wk3 recommended: KC (home vs MIA, -10.5), alt BUF — pending live pool recheck.
