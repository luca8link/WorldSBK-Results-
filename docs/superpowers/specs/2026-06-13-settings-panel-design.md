# WorldSBK Results Plus — Settings popup design

- Date: 2026-06-13
- Status: Approved (pending spec review)

## Overview

Add a toolbar popup to the extension that acts as a lightweight "about & support" panel. Clicking the extension's toolbar icon opens a small popup showing the extension's icon, name, and version, plus a Buy Me a Coffee button. The panel is purely informational — it does not control any extension behavior.

## Goals

- Give the Buy Me a Coffee link a home inside the product (today it lives only in the README).
- Show the extension identity: icon, name, and version.
- Use the proper name "WorldSBK Results Plus" consistently, and the same icon everywhere.
- Add zero new permissions and store nothing, preserving the extension's current privacy stance.

## Non-goals (explicitly out of scope)

- Feature toggles (enabling/disabling the gap columns, points column, or PDF panel).
- Formatting / display options (gap decimal precision, PDF embed height, default PDF tab).
- GitHub / "report an issue" links, a "what it does" summary, or a Web Store review link.
- Any use of `chrome.storage`, and any new permissions.
- An options page or an in-page injected panel (both considered and rejected in favor of the toolbar popup).

## Naming and icon consistency

- **Proper name:** the canonical name is **WorldSBK Results Plus** (spelled out — not "WorldSBK Results+"). It must be used consistently everywhere it appears.
- The name currently appears as "WorldSBK Results+" in exactly two places, both of which are corrected as part of this work:
  - `manifest.json` → the `name` field.
  - `README.md` → the top-level `# WorldSBK Results+` heading.
  - (The folder is already named `worldsbk-results-plus`; the manifest `description` does not contain the name.)
- The new popup and the manifest `action.default_title` use "WorldSBK Results Plus" from the start.
- **One icon everywhere:** the existing motorbike icon (`icon16/32/48/128.png`) is the single icon used by the toolbar button and the popup header. No separate, restyled, or monochrome variant is introduced.

## Architecture

The popup is a standalone static page declared via the Manifest V3 `action` key. It is fully independent of the existing content script (`content.js`) — they share no code, state, or storage.

New and changed files:

- `manifest.json` (changed) — rename `name`, and add an `action` block.
- `popup.html` (new) — popup markup.
- `popup.css` (new) — popup styles.
- `popup.js` (new) — injects the version string from the manifest.

### manifest.json

1. Rename the existing `name` field from `WorldSBK Results+` to `WorldSBK Results Plus`.
2. Add an `action` block:

```json
"action": {
  "default_popup": "popup.html",
  "default_title": "WorldSBK Results Plus"
}
```

The toolbar button reuses the existing top-level `icons` (16/48/128), so no `default_icon` is needed. No new permissions are added.

### popup.html

Structure, top to bottom:

1. Header row: the extension icon (`icon48.png`) at ~38px, then the name "WorldSBK Results Plus" with a version line beneath it reading `v<version> · unofficial`.
2. A thin divider.
3. Microcopy line: "Find it useful? You can support development."
4. Buy Me a Coffee button: an `<a>` linking to `https://www.buymeacoffee.com/luca8link` with `target="_blank"` and `rel="noopener noreferrer"`, styled as a Buy Me a Coffee-yellow button with a coffee glyph and the label "Buy me a coffee".

References `popup.css` and `popup.js`.

The version number is the only dynamic content: a `<span id="ext-version"></span>` is filled by `popup.js`; the literal ` · unofficial` follows it as static text.

### popup.css

- Popup width ~268px, white background, system font stack.
- The motorbike icon is shown directly (it already carries the brand red); no colored tile behind it.
- Buy Me a Coffee button: background `#ffdd00`, text `#101010`, rounded corners, coffee glyph to the left of the label.
- The extension's existing red (`#c1121f`, used in `styles.css`) may be reused for a subtle accent (e.g., link hover) to stay visually consistent.
- Light-appearance only — extension popups render on a white surface.

Icon note: the approved mockup used a white motorbike glyph on a red tile as a stylization. The real popup uses the actual colourful motorbike icon (`icon48.png`) displayed directly — the same icon the toolbar button uses — since that is the shipped asset and it already contains the brand red. Per the "one icon everywhere" rule above, no separate variant is created.

### popup.js

Single responsibility: set the version text so it can never drift from the manifest.

```js
document.getElementById("ext-version").textContent =
  "v" + chrome.runtime.getManifest().version;
```

It is an external file because MV3's content-security policy blocks inline scripts. `chrome.runtime.getManifest()` requires no permission.

## Data flow

1. User clicks the toolbar icon.
2. The browser renders `popup.html`.
3. `popup.js` runs, reads the version from the manifest, and writes it into the header.
4. User optionally clicks "Buy me a coffee", which opens `buymeacoffee.com/luca8link` in a new browser tab. The popup closes (standard popup behavior on focus loss).

The popup itself makes no network requests — the button is styled locally with no remote image or badge, so nothing leaves the browser until the user clicks the link.

## Permissions & privacy

- No permissions are added. The `action`/popup mechanism and `chrome.runtime.getManifest()` need none.
- Nothing is stored; no `chrome.storage` is used.
- No remote assets are loaded by the popup.
- The README's existing claim — "No permissions are requested beyond a content-script match on a single domain… stores nothing" — remains accurate.

## README update

- Rename the top-level heading from `# WorldSBK Results+` to `# WorldSBK Results Plus`.
- Add a short note (under "What it does", or a brief dedicated mention) that clicking the toolbar icon opens an about/support popup showing the version and a way to support development.
- Leave the privacy paragraph unchanged.

## Browser compatibility

- Chrome / Edge / Brave: `action` + `default_popup` is standard Manifest V3.
- Safari (Web Extension): supports `action` popups; `chrome.runtime.getManifest()` works under Safari's web extension shim, so the single line in `popup.js` is compatible.

## Testing / verification

Manual — this repo has no automated test harness:

1. Load unpacked (`chrome://extensions` → Developer mode → Load unpacked).
2. Confirm the toolbar icon (the motorbike icon) appears; click it and confirm the popup opens.
3. Verify the header shows the motorbike icon, "WorldSBK Results Plus", and `v1.0.0 · unofficial` (matching the manifest version).
4. Confirm the extension's display name reads "WorldSBK Results Plus" at `chrome://extensions`.
5. Click "Buy me a coffee" and confirm `buymeacoffee.com/luca8link` opens in a new tab.
6. Temporarily bump the manifest `version` and reconfirm the popup reflects it (proves no drift).
7. Confirm the extension still requests no permissions (`chrome://extensions` shows none).

## Implementation sequence

1. Rename `name` in `manifest.json` and add the `action` block.
2. Create `popup.html`, `popup.css`, and `popup.js`.
3. Update the README (rename heading, add the popup note).
4. Manually verify per the steps above.
