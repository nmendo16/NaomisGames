/* =========================================================================
   carousel.js — minimal, dependency-free image carousel
   =========================================================================
   Deliberately simple:
     - ONE <img> element on screen at a time (not N preloaded elements),
       so memory use doesn't grow with the number of preview images.
     - Navigation is plain modulo arithmetic on a single index — O(1) per
       step, no array scanning, no copying, no recursion.
     - No external deps, no build step.
   ========================================================================= */

export function createCarousel(container, urls) {
  container.innerHTML = '';
  container.classList.add('carousel');
  container.classList.add('carousel-vertical');

  if (!urls || !urls.length) {
    container.classList.add('carousel-empty');
    container.textContent = 'Preview image';
    return;
  }

  let index = 0;

  const img = document.createElement('img');
  img.className = 'carousel-img';
  img.alt = '';

  const dots = document.createElement('div');
  dots.className = 'carousel-dots';
  const dotEls = urls.map((_, i) => {
    const dot = document.createElement('span');
    dot.className = 'carousel-dot';
    dot.addEventListener('click', () => setIndex(i));
    dots.appendChild(dot);
    return dot;
  });

  let prevIndex = -1;
  function setIndex(i) {
    // Wraps in either direction with a single modulo op — O(1), no matter
    // how many images there are.
    index = ((i % urls.length) + urls.length) % urls.length;
    img.src = urls[index];
    dotEls.forEach((d, i2) => d.classList.toggle('active', i2 === index));
  }

  container.appendChild(img);

  if (urls.length > 1) {
    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'carousel-nav carousel-prev';
    prevBtn.setAttribute('aria-label', 'Previous image');
    prevBtn.textContent = '▲';
    prevBtn.addEventListener('click', () => setIndex(index - 1));

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'carousel-nav carousel-next';
    nextBtn.setAttribute('aria-label', 'Next image');
    nextBtn.textContent = '▼';
    nextBtn.addEventListener('click', () => setIndex(index + 1));

    container.appendChild(prevBtn);
    container.appendChild(nextBtn);
    container.appendChild(dots);
  }

  setIndex(0);
}