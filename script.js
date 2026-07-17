import { GAMES } from './games-data.js';
import { createCarousel } from './carousel.js';
import { probeNumberedImages, probeNumberedVideos, fileExists } from './asset-utils.js';

const root = document.documentElement;

console.log('script.js loaded');

// Console rotates 90° to the right automatically whenever the viewport
// looks like a phone/tablet: either a coarse (touch) pointer, or a narrow
// width. No device motion / gyroscope permission involved.
const mobileQuery = window.matchMedia('(pointer: coarse), (max-width: 900px)');

function applyTilt(isMobile) {
  root.classList.toggle('tilt-right', isMobile);
}

applyTilt(mobileQuery.matches);

// Re-check on orientation/resolution changes (rotating a phone, resizing
// a window across the breakpoint, etc).
if (mobileQuery.addEventListener) {
  mobileQuery.addEventListener('change', (e) => applyTilt(e.matches));
} else {
  // Safari < 14 fallback
  mobileQuery.addListener((e) => applyTilt(e.matches));
}

window.addEventListener('resize', () => applyTilt(mobileQuery.matches));

/* =========================================================================
   CONSOLE APP — screen navigation
   =========================================================================
   Screens: menu -> detail -> docs | demos
   Controls:
     - Sun button / Enter key / click / tap  -> select focused item
     - Up/Down buttons / Arrow keys           -> move focus (menu, detail, docs)
     - Exit (x) button / Esc key              -> leave the app (redirect)
     - Mouse & touch can activate ANY item directly, regardless of focus.
     - Demos & Videos grid is mouse/tap only — no keyboard focus there,
       since a 2x2 grid has no natural single-axis up/down order.

   Game content (titles, descriptions, links) lives in games-data.js.
   Optional per-game assets (preview images, docs, demo clips) are
   auto-detected at runtime — see asset-utils.js — so a game with nothing
   uploaded yet just shows fewer options instead of broken links.
   ========================================================================= */

const EXIT_REDIRECT_URL = 'https://naomibuilds.my.canva.site/';

const screenContent = document.getElementById('screenContent');
const exitBtn = document.getElementById('exitBtn');
const btnSun = document.getElementById('btnSun');
const btnUp = document.getElementById('btnUp');
const btnDown = document.getElementById('btnDown');

// Navigation stack of { name, gameId }. Last entry is the active screen.
let stack = [{ name: 'menu' }];

// Focus state for the *current* screen only.
let focusIndex = 0;
let focusableEls = []; // <div>/<button> elements, in order, for the active screen
let focusChangeHandler = null;

// Guards against a slow async screen finishing after the user has already
// navigated away (e.g. tapping Go Back before doc checks resolve).
let renderToken = 0;

function currentScreen() {
  return stack[stack.length - 1];
}

function findGame(id) {
  return GAMES.find((g) => g.id === id);
}

function go(screen) {
  stack.push(screen);
  render();
}

function goBack() {
  if (stack.length > 1) stack.pop();
  render();
}

function exitApp() {
  window.location.href = EXIT_REDIRECT_URL;
}

/* ---------- focus helpers (keyboard + physical buttons) ---------- */

function setFocus(index) {
  if (!focusableEls.length) return;
  focusIndex = Math.max(0, Math.min(index, focusableEls.length - 1));
  focusableEls.forEach((el, i) => el.classList.toggle('focused', i === focusIndex));
  focusableEls[focusIndex].scrollIntoView({ block: 'nearest' });
  if (typeof focusChangeHandler === 'function') {
    focusChangeHandler(focusIndex);
  }
}

function moveFocus(delta) {
  if (!focusableEls.length) return;
  setFocus(focusIndex + delta);
}

function activateFocused() {
  if (!focusableEls.length) return;
  focusableEls[focusIndex].click();
}

/* ---------- rendering ---------- */

function render() {
  const token = ++renderToken;
  // Clear any active hold intervals when rendering a new screen
  if (holdIntervals && typeof holdIntervals.forEach === 'function') {
    holdIntervals.forEach((iv) => clearInterval(iv));
    holdIntervals.clear();
  }
  const screen = currentScreen();
  screenContent.innerHTML = '';
  focusableEls = [];
  focusIndex = 0;
  focusChangeHandler = null;

  if (screen.name === 'menu') renderMenu();
  else if (screen.name === 'detail') renderDetail(screen.gameId, token);
  else if (screen.name === 'docs') renderDocs(screen.gameId, token);
  else if (screen.name === 'demos') renderDemos(screen.gameId, token);

  if (focusableEls.length) setFocus(0);
}

// Builds one focusable row. `onActivate` runs on select (sun/Enter/click/tap).
function makeRow({ label, disabled = false, isLink = false, onActivate }) {
  const row = document.createElement('button');
  row.type = 'button';
  row.className = 'screen-row' + (disabled ? ' disabled' : '') + (isLink ? ' link' : '');
  row.innerHTML = `<span class="cursor">🍃</span><span>${label}</span>`;
  if (!disabled) {
    row.addEventListener('click', onActivate);
    row.addEventListener('mouseenter', () => {
      const i = focusableEls.indexOf(row);
      if (i !== -1) setFocus(i);
    });
    focusableEls.push(row);
  }
  return row;
}

// Small toast helper for transient messages (download started, etc.)
function showToast(message, duration = 3000) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = message;
  document.body.appendChild(t);
  // show
  requestAnimationFrame(() => t.classList.add('show'));
  // remove after duration
  setTimeout(() => {
    t.classList.remove('show');
    t.addEventListener('transitionend', () => t.remove(), { once: true });
  }, duration);
}

function renderMenu() {
  console.log('renderMenu called');
  const eyebrow = document.createElement('p');
  eyebrow.className = 'screen-eyebrow';
  eyebrow.textContent = 'Game Menu';
  screenContent.appendChild(eyebrow);

  const heading = document.createElement('h2');
  heading.textContent = 'Select a Game';
  screenContent.appendChild(heading);

  const layout = document.createElement('div');
  layout.className = 'menu-layout';

  const list = document.createElement('div');
  list.className = 'screen-list menu-list';
  // Create a focusable preview area. It is added to focusableEls so it
  // can receive focus with Up/Down, but it intentionally has no
  // activation handler so pressing Sun/Enter or clicking does nothing.
  const previewPane = document.createElement('button');
  previewPane.type = 'button';
  previewPane.className = 'menu-preview';
  previewPane.setAttribute('aria-hidden', 'true');
  previewPane.textContent = 'Select a game to preview';

  GAMES.forEach((game) => {
    const row = makeRow({
      label: game.title,
      onActivate: () => go({ name: 'detail', gameId: game.id }),
    });
    // Tag the row with its game index so the focus handler can identify it
    row.dataset.gameIndex = GAMES.indexOf(game);
    list.appendChild(row);
  });

  // Keep track of the last game index shown in the preview so the
  // preview remains stable when the preview pane itself is focused.
  let lastPreviewGameIndex = 0;
  focusChangeHandler = (index) => {
    const el = focusableEls[index];
    if (!el) return;
    const gidx = el.dataset && el.dataset.gameIndex;
    let gameToShow = null;
    if (typeof gidx !== 'undefined') {
      gameToShow = GAMES[Number(gidx)];
      lastPreviewGameIndex = Number(gidx);
    } else {
      gameToShow = GAMES[lastPreviewGameIndex];
    }
    if (!gameToShow) return;
    const previewUrls = Array.isArray(gameToShow.previewImages) && gameToShow.previewImages.length
      ? gameToShow.previewImages
      : [];
    createCarousel(previewPane, previewUrls);
  };

  layout.appendChild(list);
  layout.appendChild(previewPane);

  // Make the preview pane focusable via controller/keyboard: add it to
  // focusableEls and wire mouseenter to update focus. It intentionally
  // has no click handler so activating it does nothing.
  focusableEls.push(previewPane);
  previewPane.addEventListener('mouseenter', () => {
    const i = focusableEls.indexOf(previewPane);
    if (i !== -1) setFocus(i);
  });
  screenContent.appendChild(layout);
}

function renderDetail(gameId, token) {
  const game = findGame(gameId);
  if (!game) return renderMenu();

  const layout = document.createElement('div');
  layout.className = 'detail-layout';

  // Carousel placeholder — populated once preview images are probed.
  const thumb = document.createElement('div');
  thumb.className = 'detail-thumb';
  thumb.textContent = 'Loading previews…';
  layout.appendChild(thumb);

  const info = document.createElement('div');

  const heading = document.createElement('h2');
  heading.textContent = game.title;
  info.appendChild(heading);

  const desc = document.createElement('p');
  desc.className = 'detail-desc';
  desc.textContent = game.shortDesc || '';
  info.appendChild(desc);

  if (game.role || game.technologies) {
    const dl = document.createElement('dl');
    dl.className = 'detail-static';
    if (game.role) {
      dl.innerHTML += `<dt>My Role</dt><dd>${game.role}</dd>`;
    }
    if (game.technologies) {
      dl.innerHTML += `<dt>Technologies</dt><dd>${game.technologies}</dd>`;
    }
    info.appendChild(dl);
  }

  layout.appendChild(info);
  screenContent.appendChild(layout);

  const actions = document.createElement('div');
  actions.className = 'screen-list';
  actions.style.marginTop = '1em';

  if (game.playUrl) {
    actions.appendChild(
      makeRow({
        label: 'Play',
        isLink: true,
        onActivate: () => window.open(game.playUrl, '_blank', 'noopener'),
      })
    );
  }

  actions.appendChild(
    makeRow({
      label: 'Documentations',
      onActivate: () => go({ name: 'docs', gameId: game.id }),
    })
  );

  actions.appendChild(
    makeRow({
      label: 'Demos and Videos',
      onActivate: () => go({ name: 'demos', gameId: game.id }),
    })
  );

  actions.appendChild(makeRow({ label: 'Go Back', onActivate: goBack }));

  screenContent.appendChild(actions);

  const previewUrls = Array.isArray(game.previewImages) && game.previewImages.length
    ? game.previewImages
    : null;

  if (previewUrls) {
    createCarousel(thumb, previewUrls);
  } else {
    // Fire and forget — carousel fills in once images are found. If the
    // user has since navigated away, `token` no longer matches and we bail.
    probeNumberedImages(game.assetsDir).then((urls) => {
      if (token !== renderToken) return;
      createCarousel(thumb, urls);
    });
  }
}

async function renderDocs(gameId, token) {
  const game = findGame(gameId);
  if (!game) return renderMenu();

  const eyebrow = document.createElement('p');
  eyebrow.className = 'screen-eyebrow';
  eyebrow.textContent = game.title;
  screenContent.appendChild(eyebrow);

  const heading = document.createElement('h2');
  heading.textContent = 'Documentations';
  screenContent.appendChild(heading);

  const loading = document.createElement('p');
  loading.className = 'screen-empty';
  loading.textContent = 'Checking for documentation and images…';
  screenContent.appendChild(loading);

  const docs = game.docFiles || {};
  const candidates = [
    ['Game Design Word file', docs.wordUrl],
    ['PowerPoint Presentation', docs.pptUrl],
    ['Download Zip folder', docs.zipUrl],
  ].filter(([, url]) => url);

  const checks = await Promise.all(candidates.map(([, url]) => fileExists(url)));
  if (token !== renderToken) return;
  const docEntries = candidates.filter((_, i) => checks[i]);

  // Probe numbered preview images in the game's assets dir for both png and jpg
  const pngs = await probeNumberedImages(game.assetsDir, { ext: 'png', max: 4 });
  const jpgs = await probeNumberedImages(game.assetsDir, { ext: 'jpg', max: 4 });
  if (token !== renderToken) return;

  const allImgs = Array.from(new Set([...pngs, ...jpgs])).slice(0, 4);

  loading.remove();

  const cols = document.createElement('div');
  cols.className = 'docs-layout';

  const col1 = document.createElement('div');
  col1.className = 'docs-col docs-col-1';

  const list = document.createElement('div');
  list.className = 'screen-list';

  if (game.repoUrl) {
    list.appendChild(
      makeRow({
        label: 'Repository',
        isLink: true,
        onActivate: () => window.open(game.repoUrl, '_blank', 'noopener'),
      })
    );
  }

  if (!docEntries.length && !game.repoUrl) {
    const empty = document.createElement('p');
    empty.className = 'screen-empty';
    empty.textContent = 'No documentation uploaded yet.';
    col1.appendChild(empty);
  } else {
    docEntries.forEach(([label, url]) => {
      list.appendChild(
        makeRow({
          label,
          isLink: true,
          onActivate: () => {
            showToast(`Downloading: ${label}`);
            const a = document.createElement('a');
            a.href = url;
            a.download = '';
            document.body.appendChild(a);
            a.click();
            a.remove();
          },
        })
      );
    });
  }

  list.appendChild(makeRow({ label: 'Go Back', onActivate: goBack }));
  col1.appendChild(list);

  const col2 = document.createElement('div');
  col2.className = 'docs-col docs-col-2';
  const col3 = document.createElement('div');
  col3.className = 'docs-col docs-col-3';

  for (let i = 0; i < 4; i++) {
    const src = allImgs[i] || null;
    const imgWrap = document.createElement('div');
    imgWrap.className = 'docs-img-wrap';
    if (src) {
      const img = document.createElement('img');
      img.src = src;
      img.alt = `${game.title} preview ${i + 1}`;
      img.draggable = false;
      img.className = 'docs-img';
      imgWrap.appendChild(img);
    } else {
      imgWrap.className += ' docs-img-empty';
      imgWrap.textContent = '—';
    }

    if (i <= 1) col2.appendChild(imgWrap);
    else col3.appendChild(imgWrap);
  }

  cols.appendChild(col1);
  cols.appendChild(col2);
  cols.appendChild(col3);

  screenContent.appendChild(cols);

  setFocus(0);
}

async function renderDemos(gameId, token) {
  const game = findGame(gameId);
  if (!game) return renderMenu();

  const eyebrow = document.createElement('p');
  eyebrow.className = 'screen-eyebrow';
  eyebrow.textContent = game.title;
  screenContent.appendChild(eyebrow);

  const heading = document.createElement('h2');
  heading.textContent = 'Demos and Videos';
  screenContent.appendChild(heading);

  const loading = document.createElement('p');
  loading.className = 'screen-empty';
  loading.textContent = 'Checking for demo clips…';
  screenContent.appendChild(loading);

  // Probe numbered demo clips in the game's videos dir (1.mp4, 2.mp4 ...)
  const videoUrls = await probeNumberedVideos(game.videosDir, { max: 4 });
  if (token !== renderToken) return;

  loading.remove();

  // Wrapper for the grid
  const wrapper = document.createElement('div');
  wrapper.className = 'demo-wrapper';

  // Add a focusable Go Back row under the heading (above the grid)
  const backRow = makeRow({ label: 'Go Back', onActivate: goBack });
  screenContent.appendChild(backRow);

  if (!videoUrls.some(Boolean)) {
    const empty = document.createElement('p');
    empty.className = 'screen-empty';
    empty.textContent = 'No demo clips uploaded yet.';
    wrapper.appendChild(empty);
    screenContent.appendChild(wrapper);
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'demo-grid';

  videoUrls.forEach((src, i) => {
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'demo-tile' + (src ? '' : ' empty');
    if (src) {
      const video = document.createElement('video');
      video.src = src;
      video.controls = true;
      video.preload = 'metadata';
      tile.appendChild(video);
    } else {
      tile.textContent = '—';
      tile.disabled = true;
    }
    grid.appendChild(tile);
  });

  wrapper.appendChild(grid);
  screenContent.appendChild(wrapper);
  // Ensure Go Back is the initial focused element on the Demos screen.
  // Use a microtask to avoid timing races with render().
  const backIndex = () => focusableEls.indexOf(backRow);
  setTimeout(() => {
    const i = backIndex();
    if (i !== -1) setFocus(i);
    else if (focusableEls.length) setFocus(0);
  }, 0);
}

/* ---------- input wiring ---------- */

exitBtn.addEventListener('click', exitApp);
btnSun.addEventListener('click', activateFocused);
// Continuous scroll helpers (used by console buttons and keyboard)
const holdIntervals = new Map();
function scrollByOnce(delta) {
  screenContent.scrollBy({ top: delta, behavior: 'smooth' });
}
function startContinuous(id, delta) {
  if (currentScreen().name === 'demos') {
    // immediate first scroll
    scrollByOnce(delta);
    if (holdIntervals.has(id)) return;
    const iv = setInterval(() => scrollByOnce(delta), 120);
    holdIntervals.set(id, iv);
  } else {
    // behave like focus move on other screens
    moveFocus(delta > 0 ? 1 : -1);
  }
}
function stopContinuous(id) {
  const iv = holdIntervals.get(id);
  if (iv) clearInterval(iv);
  holdIntervals.delete(id);
}

// Console buttons: start on pointerdown, stop on pointerup/cancel/leave
btnUp.addEventListener('pointerdown', () => startContinuous('btnUp', -200));
btnUp.addEventListener('pointerup', () => stopContinuous('btnUp'));
btnUp.addEventListener('pointercancel', () => stopContinuous('btnUp'));
btnUp.addEventListener('pointerleave', () => stopContinuous('btnUp'));

btnDown.addEventListener('pointerdown', () => startContinuous('btnDown', 200));
btnDown.addEventListener('pointerup', () => stopContinuous('btnDown'));
btnDown.addEventListener('pointercancel', () => stopContinuous('btnDown'));
btnDown.addEventListener('pointerleave', () => stopContinuous('btnDown'));

// Also allow quick click (mouse click) as a single step
// click fallback removed to avoid double-activating; pointer events handle both tap and press

window.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowUp':
      e.preventDefault();
      if (!e.repeat) startContinuous('keyUp', -200);
      break;
    case 'ArrowDown':
      e.preventDefault();
      if (!e.repeat) startContinuous('keyDown', 200);
      break;
    case 'Enter':
      e.preventDefault();
      activateFocused();
      break;
    case 'Escape':
      e.preventDefault();
      exitApp();
      break;
    default:
      break;
  }
});

window.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    stopContinuous('keyUp');
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    stopContinuous('keyDown');
  }
});

render();