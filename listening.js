// Listening page — horizontal scroll + centered 3D album tilt

const track = document.getElementById('albumsTrack');
const slots = document.querySelectorAll('.album-slot[data-album]');
const detailsPanel = document.getElementById('detailsPanel');
const detailsArtist = document.getElementById('detailsArtist');
const detailsDate = document.getElementById('detailsDate');
const detailsNotes = document.getElementById('detailsNotes');

if (!track || !slots.length) throw new Error('Missing album track or slots');

let currentCenterSlot = null;

// Which slot is at center
function getCenterSlot() {
  const trackRect = track.getBoundingClientRect();
  const centerX = trackRect.left + trackRect.width / 2;
  let closest = null;
  let closestDist = Infinity;

  slots.forEach((slot) => {
    const rect = slot.getBoundingClientRect();
    const slotCenter = rect.left + rect.width / 2;
    const dist = Math.abs(centerX - slotCenter);
    if (dist < closestDist) {
      closestDist = dist;
      closest = slot;
    }
  });

  return closest;
}

function resetSlotTilt(slot) {
  const cover = slot?.querySelector('.album-slot-cover');
  if (cover) cover.style.transform = 'rotateX(0deg) rotateY(0deg)';
}

function updateCenter() {
  const centerSlot = getCenterSlot();
  if (!centerSlot) return;

  const centerChanged = centerSlot !== currentCenterSlot;
  currentCenterSlot = centerSlot;

  if (!centerChanged && currentCenterSlot) return;

  slots.forEach((slot) => {
    slot.classList.remove('is-center');
    resetSlotTilt(slot);
  });
  centerSlot.classList.add('is-center');

  // Update details panel
  if (detailsPanel && detailsArtist && detailsDate && detailsNotes) {
    const artist = centerSlot.dataset.artist || '';
    const date = centerSlot.dataset.date || '';
    const rating = centerSlot.dataset.rating || '';
    const notes = centerSlot.dataset.notes || '';

    detailsArtist.textContent = artist;
    detailsDate.textContent = `Listened: ${date} • Rating: ${rating}`;
    detailsNotes.textContent = notes;
    detailsPanel.classList.add('is-visible');
  }

  startTiltTracking();
}

// 3D tilt — single mousemove, only affects center album
const tiltStrength = 14;
const smoothness = 0.1;
let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
let rafId = null;

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function updateTilt() {
  const centerSlot = document.querySelector('.album-slot.is-center');
  const cover = centerSlot?.querySelector('.album-slot-cover');
  if (!cover) return;

  currentX = lerp(currentX, targetX, smoothness);
  currentY = lerp(currentY, targetY, smoothness);
  cover.style.transform = `rotateX(${-currentY}deg) rotateY(${currentX}deg)`;
  if (Math.abs(currentX - targetX) > 0.01 || Math.abs(currentY - targetY) > 0.01) {
    rafId = requestAnimationFrame(updateTilt);
  } else {
    rafId = null;
  }
}

function onGlobalMouseMove(e) {
  const centerSlot = document.querySelector('.album-slot.is-center');
  const inner = centerSlot?.querySelector('.album-slot-inner');
  const cover = centerSlot?.querySelector('.album-slot-cover');
  if (!inner || !cover) {
    targetX = 0;
    targetY = 0;
    return;
  }

  const rect = inner.getBoundingClientRect();
  const inBounds = e.clientX >= rect.left && e.clientX <= rect.right &&
    e.clientY >= rect.top && e.clientY <= rect.bottom;

  if (inBounds) {
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    targetX = (x - 0.5) * 2 * tiltStrength;
    targetY = (y - 0.5) * 2 * tiltStrength;
  } else {
    targetX = 0;
    targetY = 0;
  }
  if (!rafId) rafId = requestAnimationFrame(updateTilt);
}

function startTiltTracking() {
  document.removeEventListener('mousemove', onGlobalMouseMove);
  document.addEventListener('mousemove', onGlobalMouseMove);
}

// Scroll listeners
track.addEventListener('scroll', () => {
  updateCenter();
});

track.addEventListener('touchmove', () => {
  updateCenter();
}, { passive: true });

// Initial center + after resize
function init() {
  updateCenter();
}

window.addEventListener('load', init);
window.addEventListener('resize', init);
