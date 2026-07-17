/* =========================================================================
   asset-utils.js — existence checks for optional per-game assets
   =========================================================================
   The static site has no directory listing, so instead of guessing what's
   uploaded we just ask the browser "does this file load?" and hide
   whatever answers no. Every check here is O(1) request / O(1) memory —
   nothing is cached beyond the single boolean result the caller keeps.
   ========================================================================= */

// Does an image load? Resolves true/false, never throws.
export function imageExists(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = encodeURI(url);
  });
}

// Does any file exist at this URL? Uses a lightweight HEAD request.
// encodeURI handles filenames with spaces or other special characters —
// without it, fetch() can fail before the request even reaches the
// network, which looks identical to a real 404 from the caller's side.
export async function fileExists(url) {
  try {
    const res = await fetch(encodeURI(url), { method: 'HEAD' });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Probes numbered image files (1.png, 2.png, ...) in a folder and stops
 * at the first gap. Assumes contiguous numbering starting at 1 — that's
 * the only assumption needed, so authors can add/remove screenshots by
 * just renumbering files.
 *
 * Cost: exactly (found + 1) requests — one failed probe past the last
 * real file, nothing more. No directory scan, no unbounded growth.
 */
export async function probeNumberedImages(dir, { ext = 'png', max = 12 } = {}) {
  const found = [];
  for (let n = 1; n <= max; n++) {
    const url = `${dir}/${n}.${ext}`;
    // eslint-disable-next-line no-await-in-loop -- intentionally sequential:
    // we need to stop as soon as a number is missing.
    if (!(await imageExists(url))) break;
    found.push(url);
  }
  return found;
}

/**
 * Given an explicit list of filenames (from games-data.js, in turn from the
 * CSV) checks all of them in parallel and returns only the ones that
 * actually exist, as { name, url } pairs, preserving the original order.
 *
 * This is the "known filenames, some may not be uploaded yet" counterpart
 * to probeNumberedImages — used for doc downloads, development screenshots,
 * and demo videos, none of which follow a numbered naming convention.
 */
export async function resolveExistingFiles(dir, filenames = []) {
  if (!filenames.length) return [];
  const urls = filenames.map((name) => `${dir}/${name}`);
  const checks = await Promise.all(urls.map((url) => fileExists(url)));
  return filenames
    .map((name, i) => (checks[i] ? { name, url: urls[i] } : null))
    .filter(Boolean);
}

/**
 * Probes numbered video files (1.mp4, 2.mp4, ...) up to `max`.
 * Unlike images, the demo grid shows fixed number of tiles (max),
 * so we check all slots in parallel and return an array with either
 * the URL or null for a missing slot.
 */
export async function probeNumberedVideos(dir, { ext = 'mp4', max = 4 } = {}) {
  const slots = Array.from({ length: max }, (_, i) => i + 1);
  const results = await Promise.all(slots.map((n) => fileExists(`${dir}/${n}.${ext}`)));
  return results.map((exists, i) => (exists ? `${dir}/${slots[i]}.${ext}` : null));
}