# The Wrecking Wire

Daily blog/newswire site for the **Big Blue Wrecking Crew** Yahoo Fantasy team (2026 season). Every day gets a dated post: a quick 3-line briefing (lineup / verify / action) that expands into a full story, plus a live roster view.

## Tech Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript (no frameworks, no build tools, no package.json)
- **Hosting**: Local only for now (no git repo, no GitHub Pages yet)
- **Data**: `data/roster.json` + `data/posts.json` (JSON source of truth)
- **Font**: Space Grotesk from Google Fonts
- **Design**: Dark "wire service" aesthetic — deep navy, Big Blue accent, Space Grotesk, monospace labels, scrolling ticker

## Key Files

| File | Purpose |
|------|---------|
| `index.html` | Single page: masthead, ticker, today's briefing, roster, wire feed |
| `styles.css` | Dark theme, CSS custom properties, responsive layout |
| `app.js` | Fetches JSON, renders everything, expand/collapse logic, tiny markdown renderer |
| `data/roster.json` | Team meta, pending transactions, starters, specialists (K/DST), bench |
| `data/posts.json` | Wire feed posts (newest first when rendered) |

## Running Locally

`fetch()` requires a server (file:// won't work):

```bash
cd fantasy_wire
python3 -m http.server 8080
# Open http://127.0.0.1:8080
```

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

## Conventions

- No frameworks or build tools — vanilla JS/CSS/HTML only
- No external JS libraries; the markdown renderer in `app.js` is intentionally tiny (headings, lists, bold, em only)
- CSS custom properties for theming (`--accent`, `--muted`, etc.)
- Roster facts must match the dated screenshot in `../fantasy_football_guidance/screenshots/` — position facts come from Yahoo, not inference
- The companion briefing docs live in `../fantasy_football_guidance/docs/` (linked from the footer)

## Season State (volatile — verify against the briefing docs)

- 2026 season, Week 2 as of 2026-09-17.
- Kittle claim pending (Waiver 1, Sep 19, auto-drops Pitts).
- Collins Q (hamstring, "not that serious"), Piñeiro Q (illness).
