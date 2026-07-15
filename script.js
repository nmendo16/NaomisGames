const root = document.documentElement;

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
   ========================================================================= */

// TODO: set this to wherever "exiting" the app should send visitors
// (e.g. your main portfolio site). Left as a placeholder until confirmed.
const EXIT_REDIRECT_URL = 'https://naomilopez19.wixsite.com/naomisportfolio';

/* ---------- Placeholder game data ----------
   Replace/extend this array with your real content table. Schema:
   {
     id: unique slug,
     title: string,
     shortDesc: string,
     role: string | null           -> shown as static text if present
     technologies: string | null   -> shown as static text if present
     playUrl: string | null        -> opens in new tab; item hidden if null
     docs: { wordUrl, pptUrl, zipUrl } (any may be null) -> hidden if ALL null
     videos: [url, url, url, url]  -> up to 4; empty tiles shown for the rest
   }
*/
const GAMES = [
  {
    id: 'game-1',
    title: 'A.D.A.M.',
    shortDesc: 'Advanced Drone Asteroid Miner',
    role: 'AI Feature Developer. Designed a Split Architecture between logic and complex personality-based assistance for the pilot.',
    technologies: 'Unity, C#, Aseprite',
    playUrl: 'https://adam-client.onrender.com',
    docs: {
      wordUrl: 'files/game-1/critical_alert.jpg',
      pptUrl: 'files/game-1/A.D.A.M - Advanced Drone Asteroid Miner.pptx',
      zipUrl: 'files/game-1/game-1-source.zip',
    },
    videos: null,
  },
  {
    id: 'game-2',
    title: 'Game Title 2',
    shortDesc: 'Another placeholder description — swap in real copy any time.',
    role: 'Programmer on a 3-person team.',
    technologies: 'Godot, GDScript',
    playUrl: null, // no Play link for this one yet
    docs: {
      wordUrl: 'files/game-2/design-doc.docx',
      pptUrl: null,
      zipUrl: null,
    },
    videos: [],
  },
  {
    id: 'game-3',
    title: 'Game Title 3',
    shortDesc: 'Coming soon.',
    role: null,
    technologies: null,
    playUrl: null,
    docs: { wordUrl: null, pptUrl: null, zipUrl: null },
    videos: [],
  },
];

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
  const screen = currentScreen();
  screenContent.innerHTML = '';
  focusableEls = [];
  focusIndex = 0;

  if (screen.name === 'menu') renderMenu();
  else if (screen.name === 'detail') renderDetail(screen.gameId);
  else if (screen.name === 'docs') renderDocs(screen.gameId);
  else if (screen.name === 'demos') renderDemos(screen.gameId);

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

function renderMenu() {
  const eyebrow = document.createElement('p');
  eyebrow.className = 'screen-eyebrow';
  eyebrow.textContent = 'Game Menu';
  screenContent.appendChild(eyebrow);

  const heading = document.createElement('h2');
  heading.textContent = 'Select a Game';
  screenContent.appendChild(heading);

  const list = document.createElement('div');
  list.className = 'screen-list menu-list';

  GAMES.forEach((game) => {
    const row = makeRow({
      label: game.title,
      onActivate: () => go({ name: 'detail', gameId: game.id }),
    });
    list.appendChild(row);
  });

  screenContent.appendChild(list);
}

function renderDetail(gameId) {
  const game = findGame(gameId);
  if (!game) return renderMenu();

  const layout = document.createElement('div');
  layout.className = 'detail-layout';

  const thumb = document.createElement('div');
  thumb.className = 'detail-thumb';
  thumb.textContent = 'Preview image';
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

  const hasDocs = game.docs && (game.docs.wordUrl || game.docs.pptUrl || game.docs.zipUrl);
  if (hasDocs) {
    actions.appendChild(
      makeRow({
        label: 'Documentations',
        onActivate: () => go({ name: 'docs', gameId: game.id }),
      })
    );
  }

  if (game.videos && game.videos.length) {
    actions.appendChild(
      makeRow({
        label: 'Demos and Videos',
        onActivate: () => go({ name: 'demos', gameId: game.id }),
      })
    );
  }

  actions.appendChild(makeRow({ label: 'Go Back', onActivate: goBack }));

  screenContent.appendChild(actions);
}

function renderDocs(gameId) {
  const game = findGame(gameId);
  if (!game) return renderMenu();

  const eyebrow = document.createElement('p');
  eyebrow.className = 'screen-eyebrow';
  eyebrow.textContent = game.title;
  screenContent.appendChild(eyebrow);

  const heading = document.createElement('h2');
  heading.textContent = 'Documentations';
  screenContent.appendChild(heading);

  const list = document.createElement('div');
  list.className = 'screen-list';

  const docEntries = [
    ['Game Design Word file', game.docs && game.docs.wordUrl],
    ['PowerPoint Presentation', game.docs && game.docs.pptUrl],
    ['Download Zip folder', game.docs && game.docs.zipUrl],
  ].filter(([, url]) => url);

  if (!docEntries.length) {
    const empty = document.createElement('p');
    empty.className = 'screen-empty';
    empty.textContent = 'No documentation uploaded yet.';
    screenContent.appendChild(empty);
  } else {
    docEntries.forEach(([label, url]) => {
      list.appendChild(
        makeRow({
          label,
          isLink: true,
          onActivate: () => {
            const a = document.createElement('a');
            a.href = url;
            a.download = '';
            a.click();
          },
        })
      );
    });
  }

  list.appendChild(makeRow({ label: 'Go Back', onActivate: goBack }));
  screenContent.appendChild(list);
}

function renderDemos(gameId) {
  const game = findGame(gameId);
  if (!game) return renderMenu();

  const eyebrow = document.createElement('p');
  eyebrow.className = 'screen-eyebrow';
  eyebrow.textContent = game.title;
  screenContent.appendChild(eyebrow);

  const heading = document.createElement('h2');
  heading.textContent = 'Demos and Videos';
  screenContent.appendChild(heading);

  const grid = document.createElement('div');
  grid.className = 'demo-grid';

  for (let i = 0; i < 4; i++) {
    const src = game.videos && game.videos[i];
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
  }
  screenContent.appendChild(grid);

  // Demos screen is mouse/tap only — Go Back is still a normal clickable
  // row, but it is NOT added to focusableEls, so Up/Down do nothing here.
  const backRow = document.createElement('button');
  backRow.type = 'button';
  backRow.className = 'screen-row';
  backRow.innerHTML = '<span class="cursor"></span><span>Go Back</span>';
  backRow.addEventListener('click', goBack);
  screenContent.appendChild(backRow);
}

/* ---------- input wiring ---------- */

exitBtn.addEventListener('click', exitApp);
btnSun.addEventListener('click', activateFocused);
btnUp.addEventListener('click', () => moveFocus(-1));
btnDown.addEventListener('click', () => moveFocus(1));

window.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowUp':
      e.preventDefault();
      moveFocus(-1);
      break;
    case 'ArrowDown':
      e.preventDefault();
      moveFocus(1);
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

render();