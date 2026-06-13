# Settings Popup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a static Manifest V3 toolbar popup (an about & support panel) that shows the icon, name, and version plus a Buy Me a Coffee button, and standardize the proper name "WorldSBK Results Plus".

**Architecture:** A standalone `action` popup (`popup.html` / `popup.css` / `popup.js`), fully independent of the content script. `popup.js` fills the version from `chrome.runtime.getManifest()` so it can't drift from the manifest. No new permissions, no storage, no remote assets.

**Tech Stack:** Manifest V3 browser extension; plain HTML/CSS/JS. No build step, no test framework.

**Spec:** `docs/superpowers/specs/2026-06-13-settings-panel-design.md`

---

## Testing approach

This repo has no automated test harness, and the popup is static content whose only logic is a one-line version injection via a browser API. Adding a JS test toolchain (npm + jsdom, mocking `chrome.runtime`) for one line would be disproportionate — YAGNI. Verification is therefore **manual**, with exact steps and expected results in each task; the rename is additionally checked with `grep`.

**Branch & commit hygiene:** Execute on the existing `add-settings-popup` branch. Commit **only the files each task names** — never `git add -A` or `git commit -a` — because `styles.css` has an unrelated uncommitted change (the `.wsbk-jump` button polish) that must stay out of these commits.

---

## File structure

| File | Responsibility |
|------|----------------|
| `popup.html` (new) | Popup markup: header (icon + name + version), divider, blurb, BMC button. |
| `popup.css` (new) | Popup styling: ~268px white card, BMC-yellow button. |
| `popup.js` (new) | Inject the manifest version into the header. Only logic in the feature. |
| `manifest.json` (modify) | Rename `name`; declare the `action` popup. |
| `README.md` (modify) | Rename heading; add a short popup note. |

---

### Task 1: Create the popup UI

**Files:**
- Create: `popup.html`
- Create: `popup.css`
- Create: `popup.js`

- [ ] **Step 1: Create `popup.html`**

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <link rel="stylesheet" href="popup.css" />
</head>
<body>
  <div class="wsbk-popup">
    <header class="wsbk-popup__head">
      <img class="wsbk-popup__icon" src="icon48.png" width="38" height="38" alt="" />
      <div class="wsbk-popup__id">
        <h1 class="wsbk-popup__name">WorldSBK Results Plus</h1>
        <p class="wsbk-popup__ver"><span id="ext-version"></span> · unofficial</p>
      </div>
    </header>
    <hr class="wsbk-popup__rule" />
    <p class="wsbk-popup__blurb">Find it useful? You can support development.</p>
    <a class="wsbk-popup__bmc" href="https://www.buymeacoffee.com/luca8link" target="_blank" rel="noopener noreferrer">
      <svg class="wsbk-popup__bmc-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M5 9h11v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V9z" />
        <path d="M16 10h2a2 2 0 0 1 0 4h-2" />
        <path d="M8 5c0 1-1 1-1 2M11 5c0 1-1 1-1 2" />
      </svg>
      Buy me a coffee
    </a>
  </div>
  <script src="popup.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create `popup.css`**

```css
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
  color: #1a1a1a;
  background: #fff;
}
.wsbk-popup { width: 268px; padding: 16px; }
.wsbk-popup__head { display: flex; align-items: center; gap: 11px; }
.wsbk-popup__icon { flex: none; display: block; }
.wsbk-popup__id { min-width: 0; }
.wsbk-popup__name { margin: 0; font-size: 15px; font-weight: 600; line-height: 1.2; }
.wsbk-popup__ver { margin: 3px 0 0; font-size: 12px; color: #6b6b6b; }
.wsbk-popup__rule { border: 0; border-top: 1px solid rgba(0, 0, 0, 0.1); margin: 13px 0; }
.wsbk-popup__blurb { margin: 0 0 11px; font-size: 12.5px; line-height: 1.5; color: #6b6b6b; }
.wsbk-popup__bmc {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 10px;
  background: #ffdd00;
  color: #101010;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
}
.wsbk-popup__bmc:hover { background: #f2d200; }
.wsbk-popup__bmc-icon { flex: none; }
```

- [ ] **Step 3: Create `popup.js`**

```js
document.getElementById("ext-version").textContent =
  "v" + chrome.runtime.getManifest().version;
```

- [ ] **Step 4: Eyeball the static layout**

Run: `open popup.html`
Expected: the popup card renders — motorbike icon at left, "WorldSBK Results Plus", a line reading "· unofficial" (the version is blank in this standalone view), the support blurb, and a yellow "Buy me a coffee" button with a coffee glyph. The browser console will show an error like `Cannot read properties of undefined (reading 'getManifest')` because `chrome.runtime` exists only in the extension context — this is expected and gets resolved in Task 2.

- [ ] **Step 5: Commit**

```bash
git add popup.html popup.css popup.js
git commit -m "Add settings popup (icon, name, version, support link)" -m "Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Register the popup and fix the name in the manifest

**Files:**
- Modify: `manifest.json` — `name` on line 3, and add an `action` block after the `icons` object.

- [ ] **Step 1: Rename `name`**

Change line 3 from:
```json
  "name": "WorldSBK Results+",
```
to:
```json
  "name": "WorldSBK Results Plus",
```

- [ ] **Step 2: Add the `action` block**

Add the `action` block right after the `icons` object so the top of the manifest reads exactly:
```json
  "icons": {
    "16": "icon16.png",
    "48": "icon48.png",
    "128": "icon128.png"
  },
  "action": {
    "default_popup": "popup.html",
    "default_title": "WorldSBK Results Plus"
  },
  "content_scripts": [
```
(Only the `action` block and its preceding comma are new; `content_scripts` and everything after it are unchanged.)

- [ ] **Step 3: Verify the manifest is valid JSON**

Run: `python3 -c "import json; json.load(open('manifest.json')); print('valid')"`
Expected: `valid`

- [ ] **Step 4: Load the extension and verify the popup**

1. Open `chrome://extensions`, enable Developer mode, click "Load unpacked", and select the repo folder. (If already loaded, click its reload icon instead.)
2. Confirm the entry's name reads **WorldSBK Results Plus**.
3. Confirm the toolbar shows the motorbike icon; pin it if needed, then click it.
   Expected: the popup opens and the version line now reads **v1.0.0 · unofficial** (matching `manifest.json`'s `version`).
4. Click "Buy me a coffee".
   Expected: `https://www.buymeacoffee.com/luca8link` opens in a new tab.
5. On the extension's card, confirm it lists **no permissions**.

- [ ] **Step 5: Commit**

```bash
git add manifest.json
git commit -m "Register toolbar popup and rename to WorldSBK Results Plus" -m "Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Update the README

**Files:**
- Modify: `README.md` — heading on line 1, and insert a popup note before the "## Install (Chrome / Edge / Brave)" heading.

- [ ] **Step 1: Rename the heading**

Change line 1 from:
```markdown
# WorldSBK Results+
```
to:
```markdown
# WorldSBK Results Plus
```

- [ ] **Step 2: Add a popup note**

Immediately before the line `## Install (Chrome / Edge / Brave)`, insert this block (note the trailing blank line before the Install heading):
```markdown
### The toolbar popup

Clicking the extension's toolbar icon opens a small popup showing the version and a quick link to support development. It's informational only — no settings to configure, and nothing is stored.

```

- [ ] **Step 3: Verify the old name is gone**

Run: `grep -rn -- "Results+" README.md manifest.json`
Expected: no output (the command exits non-zero) — the `+` form of the name no longer appears.

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "Update README: rename to WorldSBK Results Plus, note the popup" -m "Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Final verification

- [ ] Reload the unpacked extension and re-confirm: name reads "WorldSBK Results Plus", the popup opens with `v1.0.0 · unofficial`, the "Buy me a coffee" link opens `buymeacoffee.com/luca8link`, and no permissions are requested.
- [ ] Run `git status` and confirm only the unrelated `styles.css` modification is still pending — the popup work (`popup.html`, `popup.css`, `popup.js`, `manifest.json`, `README.md`) is fully committed across three commits.
