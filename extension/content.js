// ===== Insta Focus: messages + posts, no Reels =====
// Runs on instagram.com. Hides every Reels surface and redirects away from
// Reels pages, while leaving the feed, profiles, posts and DMs untouched.
// This file is used by the browser extension AND bundled into the userscript.

(function () {
  'use strict';

  // ===== SETTINGS =====
  const DEFAULTS = {
    enabled: true,
    blockSharedReels: true, // single reels (/reel/…), incl. ones sent in DMs
    hideExplore: true,      // Explore is almost entirely Reels
  };
  let settings = { ...DEFAULTS };

  const hasExtStorage =
    typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync;

  // ===== CSS =====
  // Selectors key off link targets, because Instagram's class names are
  // randomly generated and change with every deploy.
  const STYLES = {
    base: `
      /* Reels tab in the side / bottom navigation */
      a[href="/reels/"],
      a[href^="/reels/"],
      /* Reels tab on profile pages (/username/reels/) */
      a[href$="/reels/"] { display: none !important; }
    `,
    sharedReels: `
      /* Reels in the home feed, "suggested reels" blocks, profile grids and
         reels shared in DMs */
      article:has(a[href*="/reel/"]) { display: none !important; }
      a[href*="/reel/"] { display: none !important; }
    `,
    explore: `
      a[href="/explore/"],
      a[href^="/explore/"] { display: none !important; }
    `,
  };

  const styleEl = document.createElement('style');
  styleEl.id = 'insta-focus-style';

  function renderStyles() {
    if (!settings.enabled) {
      styleEl.textContent = '';
      return;
    }
    styleEl.textContent =
      STYLES.base +
      (settings.blockSharedReels ? STYLES.sharedReels : '') +
      (settings.hideExplore ? STYLES.explore : '');
  }

  function attachStyles() {
    if (styleEl.isConnected) return;
    const root = document.head || document.documentElement;
    if (root) root.appendChild(styleEl);
  }

  // ===== REDIRECTS =====
  // Returns where to send the user, or null if the page is allowed.
  function redirectTarget(path) {
    if (!settings.enabled) return null;

    // Reels feed: /reels/ and /reels/<id>/
    if (/^\/reels(\/|$)/.test(path)) return '/';

    // Profile Reels tab: /<username>/reels/
    const profileReels = path.match(/^\/([^/]+)\/reels\/?$/);
    if (profileReels) return '/' + profileReels[1] + '/';

    // Single reel: /reel/<id>/ or /<username>/reel/<id>/
    if (settings.blockSharedReels && /(^|\/)reel\//.test(path)) return '/';

    if (settings.hideExplore && /^\/explore(\/|$)/.test(path)) return '/';

    return null;
  }

  let lastPath = null;
  function checkLocation() {
    const path = location.pathname;
    if (path === lastPath) return;
    lastPath = path;
    const target = redirectTarget(path);
    if (target && target !== path) location.replace(target);
  }

  // ===== FALLBACK CLEANUP =====
  // For browsers without CSS :has() support, hide the post card around a reel
  // link from JavaScript.
  const supportsHas = (() => {
    try { return CSS.supports('selector(:has(a))'); }
    catch (_) { return false; }
  })();

  function hideReelCards(root) {
    if (supportsHas || !settings.enabled || !settings.blockSharedReels) return;
    root.querySelectorAll('a[href*="/reel/"]').forEach((a) => {
      const card = a.closest('article');
      if (card) card.style.setProperty('display', 'none', 'important');
    });
  }

  // ===== INIT =====
  function apply() {
    renderStyles();
    attachStyles();
    lastPath = null;
    checkLocation();
    if (document.body) hideReelCards(document.body);
  }

  function start() {
    apply();

    // Instagram is a single-page app: watch for DOM changes and URL changes.
    const observer = new MutationObserver(() => {
      attachStyles();
      checkLocation();
      if (document.body) hideReelCards(document.body);
    });
    observer.observe(document, { childList: true, subtree: true });

    window.addEventListener('popstate', checkLocation);
    setInterval(checkLocation, 400);
  }

  // Apply defaults straight away so Reels never flash on screen, then load
  // the saved settings.
  checkLocation();
  renderStyles();
  attachStyles();

  if (hasExtStorage) {
    chrome.storage.sync.get(DEFAULTS, (saved) => {
      settings = { ...DEFAULTS, ...saved };
      start();
    });
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== 'sync') return;
      for (const key of Object.keys(changes)) settings[key] = changes[key].newValue;
      apply();
    });
  } else {
    start();
  }
})();
