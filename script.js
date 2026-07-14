const pageShell = document.getElementById('pageShell');
const overlay = document.getElementById('overlay');
const startBtn = document.getElementById('startBtn');

const isMobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth <= 900;

if (!isMobile) {
  overlay.style.display = 'none';
}

function updateTilt(beta, gamma) {
  const targetViewingAngle = 55;
  let tiltX = (beta - targetViewingAngle) * 0.35;
  let tiltY = gamma * 0.35;

  tiltX = Math.max(-8, Math.min(8, tiltX));
  tiltY = Math.max(-8, Math.min(8, tiltY));

  pageShell.style.setProperty('--tilt-x', `${-tiltX}deg`);
  pageShell.style.setProperty('--tilt-y', `${tiltY}deg`);
  pageShell.style.transform = `rotateX(${-tiltX}deg) rotateY(${tiltY}deg)`;
}

function handleOrientation(event) {
  if (event.beta === null || event.gamma === null) return;
  updateTilt(event.beta, event.gamma);
}

function enableMotion() {
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission()
      .then((permissionState) => {
        if (permissionState === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation, true);
          overlay.style.display = 'none';
        } else {
          overlay.querySelector('p').textContent = 'Motion permission was denied, so the page will stay static.';
          startBtn.textContent = 'Continue';
        }
      })
      .catch(() => {
        overlay.querySelector('p').textContent = 'Motion was not available, so the page will stay static.';
        startBtn.textContent = 'Continue';
      });
  } else {
    window.addEventListener('deviceorientation', handleOrientation, true);
    overlay.style.display = 'none';
  }
}

if (startBtn) {
  startBtn.addEventListener('click', enableMotion);
}
