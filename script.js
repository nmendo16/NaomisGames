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