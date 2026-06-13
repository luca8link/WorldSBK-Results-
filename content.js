// WorldSBK Gap Columns — adds "Gap to 1st" and "Gap to prev" after the Time cell.

const TABLE_SEL = "table.results-table__table";
const TIME_HEAD = ".results-table__header-cell--time";
const TIME_CELL = ".results-table__body-cell--time";
const TAG = "wsbk-gap-cell"; // marks cells we inject, so re-runs are idempotent

// Parse a lap/gap string. Returns { v: seconds, rel: isGapToLeader } or null.
//   "1'32.733"  -> { v: 92.733, rel: false }
//   "+0.059"    -> { v: 0.059,  rel: true  }   (race pages: P1 absolute, rest relative)
//   "44.812"    -> { v: 44.812, rel: false }
//   "+1 Lap" / "DNF" / "" -> null
function parseLap(raw) {
  let s = (raw || "").trim();
  let rel = false;
  if (s[0] === "+") { rel = true; s = s.slice(1).trim(); }
  const m = s.match(/^(?:(\d+)')?(\d{1,2}(?:\.\d+)?)$/);
  if (!m) return null;
  const mins = m[1] ? parseInt(m[1], 10) : 0;
  return { v: mins * 60 + parseFloat(m[2]), rel };
}

function fmt(delta) {
  if (delta == null) return "–";
  if (delta <= 0.0005) return "+0.000";
  return "+" + delta.toFixed(3);
}

function th(label) {
  const el = document.createElement("th");
  el.className = "results-table__header-cell " + TAG;
  el.textContent = label;
  return el;
}

function td(text) {
  const el = document.createElement("td");
  el.className = "results-table__body-cell " + TAG;
  el.textContent = text;
  return el;
}

function enhance(table) {
  // Clear anything we added before, so this is safe to call repeatedly
  // (lazy loads, live-timing updates, SPA navigation).
  table.querySelectorAll("." + TAG).forEach((n) => n.remove());

  const headRow = table.querySelector("thead tr");
  const timeHead = headRow && headRow.querySelector(TIME_HEAD);
  if (!timeHead) return;
  timeHead.after(th("Gap 1st"), th("Gap Prev"));

  let firstAbs = null;
  let prevAbs = null;

  table.querySelectorAll("tbody tr").forEach((row) => {
    const timeCell = row.querySelector(TIME_CELL);
    if (!timeCell) return;

    const p = parseLap(timeCell.textContent);
    let abs = null;
    if (p) {
      abs = p.rel && firstAbs != null ? firstAbs + p.v : p.v;
      if (firstAbs == null) firstAbs = abs;
    }

    const gapFirst = abs == null ? "–" : fmt(abs - firstAbs);
    const gapPrev = abs == null ? "–" : prevAbs == null ? "–" : fmt(abs - prevAbs);
    if (abs != null) prevAbs = abs;

    timeCell.after(td(gapFirst), td(gapPrev));
  });
}

let timer = null;
let observer = null;

function run() {
  if (observer) observer.disconnect(); // avoid reacting to our own edits
  document.querySelectorAll(TABLE_SEL).forEach(enhance);
  if (observer) observer.observe(document.body, { childList: true, subtree: true });
}

observer = new MutationObserver(() => {
  clearTimeout(timer);
  timer = setTimeout(run, 200); // debounce lazy-load / live-timing churn
});

run();
