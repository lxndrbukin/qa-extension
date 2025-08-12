/**
 * Content-side logic. Update selectors to match your site.
 */

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

// Listen for popup messages
chrome.runtime.onMessage.addListener((msg) => {
  if (!msg || typeof msg !== 'object') return;
  if (msg.type === 'APPLY_DARK_THEME') {
    applyDarkTheme(!!msg.value);
  } else if (msg.type === 'TOGGLE_DROPDOWNS') {
    toggleAllDropdowns(!!msg.value);
  }
});

// Optional: re-apply when navigating on single-page apps
const observer = new MutationObserver((mutations) => {
  // no-op; hook available if you want to auto-reapply based on saved prefs
});
observer.observe(document.documentElement, { childList: true, subtree: true });
