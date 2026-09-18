/* The Wrecking Wire — vanilla JS, no build step.
   Data: data/roster.json + data/posts.json */

const $ = (sel) => document.querySelector(sel);

/* ---------- tiny markdown renderer (## / ### / - / ** / * ) ---------- */

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function inline(s) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

function renderMarkdown(md) {
  const lines = md.split("\n");
  let html = "";
  let inList = false;
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.startsWith("- ")) {
      if (!inList) { html += "<ul>"; inList = true; }
      html += `<li>${inline(line.slice(2))}</li>`;
      continue;
    }
    if (inList) { html += "</ul>"; inList = false; }
    if (line.startsWith("### ")) {
      html += `<h3>${inline(line.slice(4))}</h3>`;
    } else if (line.startsWith("## ")) {
      html += `<h3>${inline(line.slice(3))}</h3>`;
    } else if (line.trim() === "") {
      // paragraph break
    } else {
      html += `<p>${inline(line)}</p>`;
    }
  }
  if (inList) html += "</ul>";
  return html;
}

/* ---------- helpers ---------- */

function fmtDate(iso) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function statusChip(status) {
  const label = status === "questionable" ? "Q" : status === "out" ? "OUT" : "ACTIVE";
  return `<span class="status-chip ${status}">${label}</span>`;
}

function playerCard(p) {
  const note = p.note
    ? `<div class="player-note${/replacement|no action|hold|Listed/i.test(p.note) ? " neutral" : ""}">${esc(p.note)}</div>`
    : "";
  const stats = `
    <div class="card-stats">
      ${p.proj != null ? `<div class="card-stat"><span class="v proj">${p.proj.toFixed(2)}</span><span class="l">proj</span></div>` : ""}
      ${p.pctStart != null ? `<div class="card-stat"><span class="v">${p.pctStart}%</span><span class="l">start</span></div>` : ""}
      ${p.pctRos != null ? `<div class="card-stat"><span class="v">${p.pctRos}%</span><span class="l">ros</span></div>` : ""}
      ${p.bye != null ? `<div class="card-stat"><span class="v">${p.bye}</span><span class="l">bye</span></div>` : ""}
    </div>`;
  return `
    <div class="player-card status-${p.status}">
      <div class="card-top">
        <span class="pos-badge pos-${p.pos}">${p.pos}</span>
        ${statusChip(p.status)}
      </div>
      <div class="player-name">${esc(p.name)}</div>
      <div class="player-team">${esc(p.team)}</div>
      <div class="player-game">${esc(p.game)}</div>
      ${note}
      ${stats}
    </div>`;
}

/* ---------- renderers ---------- */

function renderTicker(roster) {
  const items = [];
  for (const p of [...roster.starters, ...roster.specialists]) {
    if (p.status === "questionable") {
      items.push(`<b>${esc(p.name.toUpperCase())}</b> <span class="t-amber">Q</span> — ${esc(p.note || "status TBD")}`);
    }
  }
  for (const t of roster.pendingTransactions) items.push(`<b>PENDING</b> — ${esc(t)}`);
  for (const b of roster.bench) {
    if (b.note && /Thursday night/i.test(b.note)) items.push(`<b>${esc(b.name.toUpperCase())}</b> — ${esc(b.note)}`);
  }
  const track = items.map((i) => `<span class="ticker-item">${i}</span>`).join("");
  $("#ticker").innerHTML = `<div class="ticker-track">${track}${track}</div>`;
}

function renderMasthead(roster) {
  const t = roster.team;
  $("#stat-season").textContent = t.season;
  $("#stat-week").textContent = "Wk " + t.week;
  $("#stat-waiver").textContent = "#" + t.waiverPriority;
  $("#stat-bench").textContent = t.bench;
}

function renderBriefing(post) {
  $("#briefing-date").textContent = fmtDate(post.date);
  $("#briefing-title").textContent = post.title;
  const labels = ["LINEUP", "VERIFY", "ACTION"];
  $("#briefing-quick").innerHTML = post.quick
    .map((line, i) => {
      const m = line.match(/^([A-Za-z ]+):(.*)$/);
      const label = m ? m[1].toUpperCase() : labels[i] || "NOTE";
      const body = m ? m[2].trim() : line;
      const cls = label === "VERIFY" ? "verify" : label === "ACTION" ? "action" : "lineup";
      return `<div class="quick-line ${cls}"><span class="quick-label">${esc(label)}</span><span>${esc(body)}</span></div>`;
    })
    .join("");
  $("#briefing-full").innerHTML = `<div class="md">${renderMarkdown(post.full)}</div>`;

  const btn = $("#briefing-expand");
  const panel = $("#briefing-full");
  btn.addEventListener("click", () => {
    const open = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!open));
    panel.hidden = open;
    btn.firstChild.textContent = open ? "Expand full briefing " : "Collapse full briefing ";
  });
}

function renderRoster(roster) {
  $("#roster-asof").textContent = `as of ${roster.team.asOf} · ${roster.team.source}`;
  $("#pending").innerHTML = roster.pendingTransactions
    .map((t) => `<div class="pending">${esc(t)}</div>`)
    .join("");
  $("#starters").innerHTML = roster.starters.map(playerCard).join("");
  $("#specialists").innerHTML = roster.specialists.map(playerCard).join("");
  $("#bench-count").textContent = `(${roster.bench.length})`;
  $("#bench").innerHTML = roster.bench
    .map(
      (b) => `
      <div class="bench-row">
        <span class="pos-badge pos-${b.pos}">${b.pos}</span>
        <span class="b-name">${esc(b.name)} <span class="player-team">${esc(b.team)}</span></span>
        <span class="b-proj">${b.proj != null ? b.proj.toFixed(2) : "—"}</span>
        <span class="b-game">${esc(b.game)}</span>
        ${b.note ? `<span class="b-note">${esc(b.note)}</span>` : ""}
      </div>`
    )
    .join("");
  $("#footer-source").textContent = roster.team.source;
}

function renderFeed(posts) {
  $("#feed").innerHTML = posts
    .map((post) => {
      const id = "post-" + post.id;
      return `
      <article class="post">
        <div class="post-head">
          <span class="post-date">${fmtDate(post.date)}</span>
          <span class="post-tag tag-${esc(post.tag)}">${esc(post.tag)}</span>
        </div>
        <h3 class="post-title">${esc(post.title)}</h3>
        <ul class="post-quick">${post.quick.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>
        <button class="expand-btn" data-target="${id}" aria-expanded="false">Full story <span class="chev">▾</span></button>
        <div class="post-full md" id="${id}" hidden>${renderMarkdown(post.full)}</div>
      </article>`;
    })
    .join("");

  document.querySelectorAll(".post .expand-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const panel = document.getElementById(btn.dataset.target);
      const open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      panel.hidden = open;
      btn.firstChild.textContent = open ? "Full story " : "Full story ";
    });
  });
}

/* ---------- boot ---------- */

async function boot() {
  try {
    const [roster, postsData] = await Promise.all([
      fetch("data/roster.json").then((r) => r.json()),
      fetch("data/posts.json").then((r) => r.json()),
    ]);
    const posts = postsData.posts.slice().sort((a, b) => b.date.localeCompare(a.date));
    renderMasthead(roster);
    renderTicker(roster);
    renderBriefing(posts[0]);
    renderRoster(roster);
    renderFeed(posts);
  } catch (err) {
    document.body.innerHTML =
      '<div style="padding:40px;font-family:monospace;color:#f87171">Failed to load data — open via a local server (e.g. <code>python3 -m http.server</code>) so fetch() works. ' +
      err.message + "</div>";
  }
}

boot();
