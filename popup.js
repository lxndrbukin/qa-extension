// Persist settings in localStorage (per request) and mirror to chrome.storage.local
// so the content script can auto-apply them even when the popup is closed.
const DARK_KEY = 'darkThemeEnabled';
const DROPS_KEY = 'dropdownsExpanded';

const darkToggle = document.getElementById('darkThemeToggle');
const dropsToggle = document.getElementById('dropdownsToggle');

async function withActiveTab(fn) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) await fn(tab.id);
  } catch (err) { console.error(err); }
}

async function loadState() {
  // Prefer chrome.storage (shared), fall back to popup localStorage if needed.
  const res = await chrome.storage.local.get([DARK_KEY, DROPS_KEY]);
  const dark = typeof res[DARK_KEY] === 'boolean' ? res[DARK_KEY] : (localStorage.getItem(DARK_KEY) === 'true');
  const drops = typeof res[DROPS_KEY] === 'boolean' ? res[DROPS_KEY] : (localStorage.getItem(DROPS_KEY) === 'true');
  return { dark: !!dark, drops: !!drops };
}

async function persist(key, value) {
  localStorage.setItem(key, String(value)); // as requested
  await chrome.storage.local.set({ [key]: !!value }); // mirror for content script
}

function persistSend(key, value, type) {
  persist(key, value).then(() => {
    withActiveTab(async (tabId) => {
      await chrome.tabs.sendMessage(tabId, { type, value: !!value });
    });
  });
}

// Initialize UI from stored state
loadState().then(({ dark, drops }) => {
  darkToggle.checked = dark;
  dropsToggle.checked = drops;
});

// Wire events

darkToggle.addEventListener('change', () => {
  persistSend(DARK_KEY, darkToggle.checked, 'APPLY_DARK_THEME');
});

dropsToggle.addEventListener('change', () => {
  persistSend(DROPS_KEY, dropsToggle.checked, 'TOGGLE_DROPDOWNS');
});

// When popup opens, push current states to page (ensures page reflects saved prefs
// even if user never opened popup in this tab)
withActiveTab(async (tabId) => {
  const { dark, drops } = await loadState();
  await chrome.tabs.sendMessage(tabId, { type: 'APPLY_DARK_THEME', value: dark });
  await chrome.tabs.sendMessage(tabId, { type: 'TOGGLE_DROPDOWNS', value: drops });
});
