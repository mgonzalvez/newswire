# The Wrecking Wire

Daily newswire and **source of truth** for Martin's 2026 fantasy ops — three tabs on one page: **Fantasy** (Big Blue Wrecking Crew, Yahoo), **Pick'em** (MetLife Crisis), **Survivor** (MetLife Crisis). Every update gets a dated post: a Quick Check (3-line briefing) that expands into the full Deep Dive story, plus a live roster/pool view.

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

Posts are written in the voice of a veteran NFL analyst: full, readable paragraphs with wry humor — decisive advice first, personality second. `quick` is the glance layer (3 labeled lines); `full` is the prose layer. See `AGENTS.md` → "Briefing voice" for the style guide.

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

- Roster and pool facts come from dated screenshots in `../fantasy_football_guidance/screenshots/` — position facts come from Yahoo, not inference.
- Volatile facts (injuries, lines, active lists, scores) come from a curated set of sources: ESPN, Rotowire, FantasyPros, Yahoo, official NFL injury report.
- The old 2026 briefing docs live in `../fantasy_football_guidance/archive/` — frozen reference material, not a live source.
