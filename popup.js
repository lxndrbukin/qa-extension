// Persist settings in localStorage (extension context) and message the active tab.
const DARK_KEY = 'darkThemeEnabled';
const DROPS_KEY = 'dropdownsExpanded';

const darkToggle = document.getElementById('darkThemeToggle');
const dropsToggle = document.getElementById('dropdownsToggle');

// Initialize from localStorage
(() => {
  const dark = localStorage.getItem(DARK_KEY);
  const drops = localStorage.getItem(DROPS_KEY);
  darkToggle.checked = dark === 'true';
  dropsToggle.checked = drops === 'true';
})();

async function withActiveTab(fn) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) await fn(tab.id);
  } catch (err) { console.error(err); }
}

function saveAndSend(key, value, type) {
  localStorage.setItem(key, String(value));
  withActiveTab(async (tabId) => {
    await chrome.tabs.sendMessage(tabId, { type, value });
  });
}

darkToggle.addEventListener('change', () => {
  saveAndSend(DARK_KEY, darkToggle.checked, 'APPLY_DARK_THEME');
});

dropsToggle.addEventListener('change', () => {
  saveAndSend(DROPS_KEY, dropsToggle.checked, 'TOGGLE_DROPDOWNS');
});

// When popup opens, push current states to page (handy if content script was injected earlier)
withActiveTab(async (tabId) => {
  const dark = localStorage.getItem(DARK_KEY) === 'true';
  const drops = localStorage.getItem(DROPS_KEY) === 'true';
  if (dark !== undefined) await chrome.tabs.sendMessage(tabId, { type: 'APPLY_DARK_THEME', value: dark });
  if (drops !== undefined) await chrome.tabs.sendMessage(tabId, { type: 'TOGGLE_DROPDOWNS', value: drops });
});
