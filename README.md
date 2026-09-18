# The Wrecking Wire

Daily blog/newswire for the **Big Blue Wrecking Crew** — a Yahoo Fantasy football team (2026 season). Every day gets a dated post: a quick 3-line briefing (lineup / verify / action) that expands into a full story, plus a live roster view.

Static site — vanilla HTML/CSS/JS, no frameworks, no build step, no package.json.

## Project Structure

```
fantasy_wire/
├── index.html          # Single page: masthead, ticker, briefing, roster, wire feed
├── styles.css          # Dark "wire service" theme, CSS custom properties, responsive
├── app.js              # Fetches JSON, renders everything, expand/collapse, tiny markdown renderer
├── data/
│   ├── roster.json     # Team meta, pending transactions, starters, K/DST, bench
│   └── posts.json      # Wire feed posts (rendered newest-first)
└── AGENTS.md           # Agent/bot context: conventions + update procedures
```

## Running Locally

`fetch()` requires a server — opening `index.html` via `file://` will not work:

```bash
python3 -m http.server 8080
# Open http://127.0.0.1:8080
```

## Data Source

`data/roster.json` and `data/posts.json` are the single source of truth. All rendering is driven by them — no content is hardcoded in the HTML/JS.

### Adding a daily post

Append an object to `data/posts.json`:

| Field | Description |
|-------|-------------|
| `id` | Unique slug, e.g. `2026-09-18-week2-results` |
| `date` | `YYYY-MM-DD` — the newest date becomes **Today's Briefing** in the hero |
| `tag` | `Lineup` / `Transactions` / `Postmortem` / `Injury` (drives the badge color) |
| `title` | Headline |
| `quick` | 2–3 short lines. Lines starting with `Lineup:`, `Verify:`, `Action:` get labeled chips in the hero |
| `full` | Markdown: `##`/`###` headings, `-` lists, `**bold**`, `*em*` |

### Updating the roster

Edit `data/roster.json`:

- `team.asOf` / `team.source` — bump whenever the roster snapshot changes (screenshots live in `../fantasy_football_guidance/screenshots/`)
- `starters` / `specialists` / `bench` — move players between arrays as the lineup changes
- `status` — `active` / `questionable` / `out` (drives the chip + card border)
- `note` — shown on the card; amber by default, muted for replacement/hold/no-action notes
- `pendingTransactions` — amber banners under the section head + ticker items

The **ticker** is built automatically from questionable players, pending transactions, and bench players with a "Thursday night" note — no separate config.

## Deployment

GitHub Pages, deployed from the `main` branch (Settings → Pages → Deploy from a branch). No build step, so no Actions workflow is needed.

## Companion Files

The authoritative briefings live in the sibling folder `../fantasy_football_guidance/docs/` (linked from the footer). Roster facts must match the dated screenshots there — position facts come from Yahoo, not inference.
