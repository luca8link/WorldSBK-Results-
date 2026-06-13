// WorldSBK Gap Columns
// Adds "Gap to 1st" and "Gap to prev" after the Time cell on every results table.
// On RACE sessions it also adds a "Pts" column with championship points.

const TABLE_SEL = "table.results-table__table";
const TIME_HEAD = ".results-table__header-cell--time";
const TIME_CELL = ".results-table__body-cell--time";
const POS_CELL = ".results-table__body-cell--pos";
const SESSION_SEL = ".results-filter-session"; // <select> (or wrapper) naming the session
const TAG = "wsbk-col"; // marks cells we inject, so re-runs are idempotent

// Championship points by finishing position.
// Full races (Race 1 / Race 2): top 15 score.
const POINTS_FULL = {
  1: 25, 2: 20, 3: 16, 4: 13, 5: 11, 6: 10, 7: 9, 8: 8,
  9: 7, 10: 6, 11: 5, 12: 4, 13: 3, 14: 2, 15: 1,
};
// Superpole Race (10-lap sprint): top 9 score, reduced scale.
const POINTS_SPRINT = {
  1: 12, 2: 10, 3: 9, 4: 7, 5: 6, 6: 5, 7: 4, 8: 3, 9: 2,
};

// Read the currently selected session label, e.g. "Race 1", "Superpole Race",
// "Free Practice 2". Returns "" if not found.
function currentSession() {
  const node = document.querySelector(SESSION_SEL);
  if (!node) return "";
  const select = node.tagName === "SELECT" ? node : node.querySelector("select");
  if (select && select.selectedOptions && select.selectedOptions.length) {
    return select.selectedOptions[0].textContent.trim();
  }
  return (select || node).textContent.trim();
}

// Decide which (if any) points table applies to the selected session.
function pointsTableFor(session) {
  if (!/race/i.test(session)) return null;          // not a race -> no points column
  return /superpole/i.test(session) ? POINTS_SPRINT : POINTS_FULL;
}

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

function fmtGap(delta) {
  if (delta == null) return "–";
  if (delta <= 0.0005) return "+0.000";
  return "+" + delta.toFixed(3);
}

function th(label, extra) {
  const el = document.createElement("th");
  el.className = "results-table__header-cell " + TAG + (extra ? " " + extra : "");
  el.textContent = label;
  return el;
}

function td(text, extra) {
  const el = document.createElement("td");
  el.className = "results-table__body-cell " + TAG + (extra ? " " + extra : "");
  el.textContent = text;
  return el;
}

function enhance(table) {
  // Clear anything we added before, so this is safe to call repeatedly
  // (lazy loads, live-timing updates, session switches, SPA navigation).
  table.querySelectorAll("." + TAG).forEach((n) => n.remove());

  const headRow = table.querySelector("thead tr");
  const timeHead = headRow && headRow.querySelector(TIME_HEAD);
  if (!timeHead) return;

  const points = pointsTableFor(currentSession()); // null on practice/qualifying
  const isRace = points != null;

  // Headers: Gap 1st, Gap Prev, and (race only) Pts
  const headCells = [th("Gap 1st"), th("Gap Prev")];
  if (isRace) headCells.push(th("Pts", "wsbk-points"));
  timeHead.after(...headCells);

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

    const gapFirst = abs == null ? "–" : fmtGap(abs - firstAbs);
    const gapPrev = abs == null ? "–" : prevAbs == null ? "–" : fmtGap(abs - prevAbs);
    if (abs != null) prevAbs = abs;

    const cells = [td(gapFirst), td(gapPrev)];

    if (isRace) {
      const posCell = row.querySelector(POS_CELL);
      const pos = posCell ? parseInt(posCell.textContent.trim(), 10) : NaN;
      // Classified finisher -> points (0 if outside the scoring range).
      // Unclassified (DNF/DNS, no numeric position) -> "–".
      const pts = Number.isInteger(pos) ? (points[pos] || 0) : "–";
      cells.push(td(String(pts), "wsbk-points"));
    }

    timeCell.after(...cells);
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
  timer = setTimeout(run, 200); // debounce lazy-load / live-timing / filter churn
});

run();
