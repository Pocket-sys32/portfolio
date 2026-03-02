// Listening page — inline shelf: click spine, it expands and lays flat in the row

const trackEl = document.getElementById("shelfTrack");
const items = document.querySelectorAll(".shelf-item");
const nextBtn = document.getElementById("shelfNext");

let openIndex = null;
let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
let rafId = null;
const tiltStrength = 10;
const smoothness = 0.1;

function openAlbum(index) {
  if (openIndex === index) {
    closeAlbum();
    return;
  }

  if (openIndex !== null) {
    items[openIndex].classList.remove("is-open");
    const prevCover = items[openIndex].querySelector(".open-cover");
    if (prevCover) prevCover.style.animation = "none";
  }

  openIndex = index;
  const item = items[index];
  const cover = item?.querySelector(".open-cover");
  if (cover) cover.style.animation = "";

  item.classList.add("is-open");
  startTiltTracking(item);
}

function closeAlbum() {
  if (openIndex === null) return;
  const item = items[openIndex];
  const cover = item?.querySelector(".open-cover");
  if (cover) cover.style.animation = "none";
  item.classList.remove("is-open");
  targetX = 0; targetY = 0; currentX = 0; currentY = 0;
  openIndex = null;
}

// Spine click
items.forEach((item, i) => {
  const spine = item.querySelector(".spine-btn");
  spine?.addEventListener("click", () => openAlbum(i));
});

// Click opened cover to close
items.forEach((item, i) => {
  const cover = item.querySelector(".open-cover");
  cover?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (openIndex === i) closeAlbum();
  });
});

// Next arrow
nextBtn?.addEventListener("click", () => {
  if (trackEl) trackEl.scrollBy({ left: 150, behavior: "smooth" });
});

// 3D tilt on opened cover
function lerp(a, b, t) { return a + (b - a) * t; }

function updateTilt(cover) {
  if (!cover || openIndex === null) return;
  currentX = lerp(currentX, targetX, smoothness);
  currentY = lerp(currentY, targetY, smoothness);
  cover.style.transform = `rotateX(${-currentY}deg) rotateY(${currentX}deg)`;
  if (Math.abs(currentX - targetX) > 0.01 || Math.abs(currentY - targetY) > 0.01)
    rafId = requestAnimationFrame(() => updateTilt(cover));
  else rafId = null;
}

function onMouseMove(e) {
  const item = openIndex !== null ? items[openIndex] : null;
  const cover = item?.querySelector(".open-cover");
  if (!item || !cover) {
    targetX = 0; targetY = 0;
    return;
  }
  const rect = cover.getBoundingClientRect();
  const inBounds = e.clientX >= rect.left && e.clientX <= rect.right &&
    e.clientY >= rect.top && e.clientY <= rect.bottom;
  if (inBounds) {
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    targetX = (x - 0.5) * 2 * tiltStrength;
    targetY = (y - 0.5) * 2 * tiltStrength;
  } else {
    targetX = 0; targetY = 0;
  }
  if (!rafId) rafId = requestAnimationFrame(() => updateTilt(cover));
}

function startTiltTracking(item) {
  targetX = 0; targetY = 0;
  document.removeEventListener("mousemove", onMouseMove);
  document.addEventListener("mousemove", onMouseMove);
}
