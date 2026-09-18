# The Wrecking Wire

Daily newswire site for Martin's 2026 fantasy ops — three tabs on one page: **Fantasy** (Big Blue Wrecking Crew, Yahoo), **Pick'em** (MetLife Crisis), **Survivor** (MetLife Crisis). Every day gets a dated post: a quick 3-line briefing (lineup / verify / action) that expands into a full story, plus a live roster view.

## Tech Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript (no frameworks, no build tools, no package.json)
- **Hosting**: GitHub Pages from `main` → https://mgonzalvez.github.io/newswire/ (repo: `mgonzalvez/newswire`)
- **Data**: `data/roster.json` + `data/pickem.json` + `data/survivor.json` + `data/posts.json` (derived from the briefing docs — see Source of Truth)
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

## Source of Truth (one-way sync)

The **briefing docs** in `../fantasy_football_guidance/docs/` are canonical. The site's JSON is a derived, user-facing projection. Update order every time:

1. Briefing docs first (bake in confirmed facts + volatile web-search data)
2. Project into the site's `data/*.json`
3. Commit + push to `origin/main`

Never edit site JSON without the matching briefing-doc update. The site can't read the `.md` files at runtime (separate repo) — the agent maintains the sync.

## Updating the Site

### Daily post

1. Add a new object to `data/posts.json` (newest date first is not required — `app.js` sorts by date desc).
2. Fields: `id` (date-slug), `date` (YYYY-MM-DD), `tag` (Lineup / Transactions / Postmortem / Injury), `title`, `quick` (array of 2–3 short lines — the first line should start with `Lineup:` / `Verify:` / `Action:` so the hero labels render), `full` (markdown: `##`/`###` headings, `-` lists, `**bold**`, `*em*`).
3. The newest post automatically becomes **Today's Briefing** in the hero.

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
| **Sat (lineup day)** | 1. Roster screenshot — Yahoo "Current Week" tab, same framing as `roster 2026-09-17.png` (starters, bench, K, DST, pending transactions visible) · 2. One line: the lineup decision ("no changes" or "start X, bench Y") plus any confirmed facts he has ("Kittle claim cleared") | Screenshot = canonical roster facts. The decision is his call, not the agent's |
| **Sun (after games)** | 1. Opponent's final score (or a league results screenshot) · 2. Roster screenshot (optional) | The opponent score is the only league data the agent cannot get from web search |
| **Any day (something breaks)** | Screenshot + one line | Injury, trade, or claim outcome that changes the plan |
| **Any day (pool)** | Pick'em / Survivor screenshot + one line | Card saved, score, pool distribution, or a lock decision |

Save screenshots to `../fantasy_football_guidance/screenshots/roster YYYY-MM-DD.png`.

### What the agent does (no input needed)

1. Save the screenshot, read it, diff against current `data/roster.json`
2. Web search (FAST READ budget: 3) for volatile items: injuries, practice reports, active/inactive lists, claim outcomes, player stats
3. Update the site JSON: `data/roster.json` (lineup moves, `status`, `note`, `team.asOf`/`team.source`, `pendingTransactions`), plus `data/pickem.json` / `data/survivor.json` when pool screenshots arrive
4. Write the day's post in `data/posts.json` (template below)
5. Commit + push to `origin/main` (repo: `mgonzalvez/newswire`), one commit per update, message `Week N: <short summary>`
6. Bake confirmed facts into the matching briefing doc(s) in `../fantasy_football_guidance/docs/` (fantasy / pickem / survivor) so the next FAST READ is faster

### Post template

- `id`: `YYYY-MM-DD-<slug>` · `date`: `YYYY-MM-DD`
- `tag`: `Lineup` (Sat) · `Postmortem` (Sun) · `Injury` / `Transactions` (as needed)
- `quick`: 3 lines starting with `Lineup:` / `Verify:` / `Action:` — these render as labeled chips in the hero
- `full`: `##` sections — Sat: injury board, bench read, Sunday checklist · Sun: the result, player-by-player, lessons

### Cadence

| Day | Update |
|-----|--------|
| Sat | Main update: roster + "Week N: ..." lineup post |
| Sun | Postmortem post (needs the opponent score) |
| Thu | Optional: ticker note only, if a benched player plays TNF |
| Mon–Fri | Only if something breaks — short `Injury` / `Transactions` post |

### Rules

- Screenshot arrives with **no decision**: output a FAST READ with recommendations, wait for confirmation, then push. Never push a lineup post with an unconfirmed change.
- Screenshot arrives with **"no changes"** and the locks are intact: push immediately, no re-confirmation.
- Roster facts come from the screenshot, not from search. Position facts come from Yahoo, not inference.
- If a search fails (oMLX down), tag the item `⚠ verify` in the post and move on — do not block the update.

## Conventions

- No frameworks or build tools — vanilla JS/CSS/HTML only
- No external JS libraries; the markdown renderer in `app.js` is intentionally tiny (headings, lists, bold, em only)
- CSS custom properties for theming (`--accent`, `--muted`, etc.)
- Roster facts must match the dated screenshot in `../fantasy_football_guidance/screenshots/` — position facts come from Yahoo, not inference
- The companion briefing docs live in `../fantasy_football_guidance/docs/` (linked from the footer)

## Season State (volatile — verify against the briefing docs)

- 2026 season, Week 2 as of 2026-09-18.
- Fantasy: Egbuka at WR2 (Collins benched, Q/trending out), Bass at K (Piñeiro dropped). Kittle claim pending (Waiver 1, Sep 19, auto-drops Pitts).
- Pick'em: Wk2 picks saved 16/16, 1 pt (Buffalo ✓), rank 15/28, 8-9.
- Survivor: alive; Wk2 pick = SF 49ers (pool #2, 33.07%).
