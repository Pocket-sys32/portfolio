// Music page — adammaj.com style: spines expand to full cover, transform-based scroll
const SPINE_WIDTH = 42;
const COVER_WIDTH = 168;
const ACTIVE_WIDTH = SPINE_WIDTH + COVER_WIDTH;
const GAP = 11;

const shelfTrack = document.getElementById('shelfTrack');
const shelfView = document.querySelector('.shelf-view');
const albumBooks = document.querySelectorAll('.album-book');
const albumReviews = document.querySelectorAll('.album-review');
const scrollLeftBtn = document.querySelector('.shelf-scroll-left');
const scrollRightBtn = document.querySelector('.shelf-scroll-right');

let scrollX = 0;
let selectedIndex = 0;
let isScrolling = false;
let scrollInterval = null;

function getItemWidth(index, activeIndex) {
  return index === activeIndex ? ACTIVE_WIDTH : SPINE_WIDTH;
}

function getTotalWidth(activeIdx) {
  let w = 0;
  albumBooks.forEach((_, i) => {
    w += getItemWidth(i, activeIdx) + GAP;
  });
  return w - GAP;
}

function getViewportWidth() {
  return shelfView?.offsetWidth || 400;
}

function getMaxScroll(activeIdx) {
  const total = getTotalWidth(activeIdx);
  const viewport = getViewportWidth();
  return Math.max(0, total - viewport);
}

function getItemOffset(index, activeIdx) {
  let offset = 0;
  for (let i = 0; i < index; i++) {
    offset += getItemWidth(i, activeIdx) + GAP;
  }
  return offset;
}

function applyScroll() {
  const max = getMaxScroll(selectedIndex);
  scrollX = Math.max(0, Math.min(max, scrollX));
  if (shelfTrack) {
    shelfTrack.style.transform = `translateX(-${scrollX}px)`;
  }
}

function centerSelected() {
  const itemOffset = getItemOffset(selectedIndex, selectedIndex);
  const itemWidth = getItemWidth(selectedIndex, selectedIndex);
  const viewport = getViewportWidth();
  scrollX = Math.max(0, itemOffset - viewport / 2 + itemWidth / 2);
  applyScroll();
}

function showAlbum(albumId) {
  const idx = [...albumBooks].findIndex((b) => b.dataset.album === albumId);
  if (idx >= 0) selectedIndex = idx;

  albumBooks.forEach((b) => b.classList.toggle('active', b.dataset.album === albumId));
  albumReviews.forEach((r) => r.classList.toggle('active', r.dataset.album === albumId));

  centerSelected();
  history.replaceState(null, '', `#music-${albumId}`);
}

albumBooks.forEach((book) => {
  book.addEventListener('click', (e) => {
    e.preventDefault();
    const albumId = book.dataset.album;
    const idx = parseInt(book.dataset.index, 10);
    if (selectedIndex === idx) return;
    showAlbum(albumId);
  });
});

function startScroll(direction) {
  if (scrollInterval) return;
  isScrolling = true;
  shelfTrack?.classList.add('scrolling');
  scrollInterval = setInterval(() => {
    scrollX += direction * 4;
    applyScroll();
  }, 16);
}

function stopScroll() {
  clearInterval(scrollInterval);
  scrollInterval = null;
  isScrolling = false;
  shelfTrack?.classList.remove('scrolling');
}

scrollLeftBtn?.addEventListener('mouseenter', () => startScroll(-1));
scrollLeftBtn?.addEventListener('mouseleave', stopScroll);
scrollRightBtn?.addEventListener('mouseenter', () => startScroll(1));
scrollRightBtn?.addEventListener('mouseleave', stopScroll);

scrollLeftBtn?.addEventListener('touchstart', (e) => {
  e.preventDefault();
  startScroll(-1);
});
scrollLeftBtn?.addEventListener('touchend', stopScroll);
scrollRightBtn?.addEventListener('touchstart', (e) => {
  e.preventDefault();
  startScroll(1);
});
scrollRightBtn?.addEventListener('touchend', stopScroll);

// Init
const hash = window.location.hash?.slice(1);
if (hash?.startsWith('music-')) {
  showAlbum(hash.replace('music-', ''));
} else {
  showAlbum(albumBooks[0]?.dataset.album || '');
}
