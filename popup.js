/**
 * Content-side logic. Update selectors to match your site.
 *
 * Reads preferences from chrome.storage.local so it can apply them automatically
 * when the page loads or changes — regardless of whether the popup is open.
 */

// Keys (must match popup.js)
const DARK_KEY = 'darkThemeEnabled';
const DROPS_KEY = 'dropdownsExpanded';

// === BEGIN: Customize these to match your site ===
// Dark theme is applied by adding this class to <html> (documentElement)
const DARK_CLASS_ON_HTML = 'ext-dark-theme';

// Minimal demo styles. Replace with site-specific theme adjustments if needed.
const DARK_STYLE_CSS = `
  html.${'ext-dark-theme'} {
    color-scheme: dark;
    background: #0b0f14 !important;
  }
  html.${'ext-dark-theme'} body { background: transparent !important; color: #e7ecf3 !important; }
  html.${'ext-dark-theme'} a { color: #7db3ff !important; }
`;

// Dropdowns you want to expand/collapse. Example targets:
//  - All <details> elements
//  - Or a custom container class (e.g., .accordion-item)
const DROPDOWN_SELECTOR = 'details, .accordion-item';
// If not <details>, we toggle this class to mark the open state
const DROPDOWN_OPEN_CLASS = 'open';
// === END: Customize ===

// Inject dark CSS once
let darkStyleEl;
function ensureDarkStyle() {
  if (!darkStyleEl) {
    darkStyleEl = document.createElement('style');
    darkStyleEl.id = 'ext-dark-theme-style';
    darkStyleEl.textContent = DARK_STYLE_CSS;
    document.documentElement.appendChild(darkStyleEl);
  }
}

function applyDarkTheme(enabled) {
  ensureDarkStyle();
  document.documentElement.classList.toggle(DARK_CLASS_ON_HTML, !!enabled);
}

function toggleAllDropdowns(expand) {
  const nodes = document.querySelectorAll(DROPDOWN_SELECTOR);
  nodes.forEach((el) => {
    const tag = el.tagName.toLowerCase();
    if (tag === 'details') {
      el.open = !!expand;
    } else {
      el.classList.toggle(DROPDOWN_OPEN_CLASS, !!expand);
      // If your site uses a clickable header to expand, you can also simulate a click here when state mismatches.
      // Example (uncomment and tailor):
      // const header = el.querySelector('.accordion-header');
      // const isOpen = el.classList.contains(DROPDOWN_OPEN_CLASS);
      // if (header && isOpen !== !!expand) header.click();
    }
  });
}

// Apply saved state on initial load
(async function initFromStorage() {
  try {
    const res = await chrome.storage.local.get([DARK_KEY, DROPS_KEY]);
    applyDarkTheme(!!res[DARK_KEY]);
    toggleAllDropdowns(!!res[DROPS_KEY]);
  } catch (e) {
    console.warn('Could not read stored prefs', e);
  }
})();

// React to changes coming from the popup (or any other script) via storage
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  if (DARK_KEY in changes) applyDarkTheme(!!changes[DARK_KEY].newValue);
  if (DROPS_KEY in changes) toggleAllDropdowns(!!changes[DROPS_KEY].newValue);
});

// Also keep message-based control for direct toggles
chrome.runtime.onMessage.addListener((msg) => {
  if (!msg || typeof msg !== 'object') return;
  if (msg.type === 'APPLY_DARK_THEME') {
    applyDarkTheme(!!msg.value);
  } else if (msg.type === 'TOGGLE_DROPDOWNS') {
    toggleAllDropdowns(!!msg.value);
  }
});

// Optional: SPA support hooks are available if needed.
