/* ─── Custom Cursor ─── */
const cursor = document.getElementById('cursor');
const cursorRing = document.getElementById('cursorRing');
document.addEventListener('mousemove', (e) => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';
  setTimeout(() => {
    cursorRing.style.left = e.clientX + 'px';
    cursorRing.style.top  = e.clientY + 'px';
  }, 50);
});

/* ─── Fade-Up Scroll Animation ─── */
const fadeEls = document.querySelectorAll('.fade-up');
const obs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
fadeEls.forEach(el => obs.observe(el));

/* ─── Card Slider Logic ─── */
const sliderStates = { 'slider1': 0, 'slider2': 0 };

function updateSlider(sliderId, dotsId, thumbsId) {
  const track  = document.getElementById(sliderId);
  const dots   = document.getElementById(dotsId).children;
  const thumbs = document.getElementById(thumbsId).children;
  const idx    = sliderStates[sliderId];
  track.style.transform = `translateX(-${idx * 100}%)`;
  Array.from(dots).forEach((d, i)   => d.classList.toggle('active', i === idx));
  Array.from(thumbs).forEach((t, i) => {
    t.classList.toggle('active', i === idx);
    if (i === idx) t.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  });
}
function slide(sliderId, dotsId, thumbsId, dir) {
  const total = document.getElementById(sliderId).children.length;
  sliderStates[sliderId] = (sliderStates[sliderId] + dir + total) % total;
  updateSlider(sliderId, dotsId, thumbsId);
}
function goToSlide(sliderId, dotsId, thumbsId, index) {
  sliderStates[sliderId] = index;
  updateSlider(sliderId, dotsId, thumbsId);
}

/* ─── Fullscreen Lightbox ─── */
const lightbox  = document.getElementById('lightbox');
const lbImg     = document.getElementById('lb-img');
const lbCur     = document.getElementById('lb-cur');
const lbTotal   = document.getElementById('lb-total');
const lbName    = document.getElementById('lb-project-name');
const lbThumbsC = document.getElementById('lb-thumbs');

let lb = { images: [], alts: [], index: 0, project: '' };

function openLightbox(sliderWrap) {
  const images  = JSON.parse(sliderWrap.dataset.images);
  const alts    = JSON.parse(sliderWrap.dataset.alts);
  const project = sliderWrap.dataset.project;
  // Find active slide from card slider state
  const trackId = sliderWrap.querySelector('.slider-track').id;
  const startIdx = sliderStates[trackId] || 0;

  lb = { images, alts, index: startIdx, project };
  lbTotal.textContent = images.length;

  // Build thumbnails
  lbThumbsC.innerHTML = '';
  images.forEach((src, i) => {
    const t = document.createElement('div');
    t.className = 'lb-thumb' + (i === startIdx ? ' active' : '');
    t.innerHTML = `<img src="${src}" alt="${alts[i] || ''}" /><span class="lb-thumb-num">${i + 1}</span>`;
    t.addEventListener('click', () => lbGoTo(i));
    lbThumbsC.appendChild(t);
  });

  // Set project name (split on space for color effect)
  const parts = project.split(' ');
  lbName.innerHTML = parts.length > 1
    ? parts.slice(0,-1).join(' ') + ' <span>' + parts[parts.length-1] + '</span>'
    : '<span>' + project + '</span>';

  lbSetImage(startIdx);
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

function lbSetImage(idx) {
  lbImg.classList.add('switching');
  setTimeout(() => {
    lbImg.src = lb.images[idx];
    lbImg.alt = lb.alts[idx] || '';
    lbImg.classList.remove('switching');
  }, 180);
  lbCur.textContent = idx + 1;
  lb.index = idx;
  // Update thumb states
  Array.from(lbThumbsC.children).forEach((t, i) => {
    t.classList.toggle('active', i === idx);
    if (i === idx) t.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  });
}

function lbNav(dir) {
  const next = (lb.index + dir + lb.images.length) % lb.images.length;
  lbSetImage(next);
}
function lbGoTo(i) { lbSetImage(i); }

document.getElementById('lb-close').addEventListener('click', closeLightbox);
document.getElementById('lb-prev').addEventListener('click', () => lbNav(-1));
document.getElementById('lb-next').addEventListener('click', () => lbNav(1));

// Click backdrop to close
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowLeft')   lbNav(-1);
  if (e.key === 'ArrowRight')  lbNav(1);
});

// Touch / swipe support for lightbox
(function () {
  let startX = 0;
  lightbox.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) lbNav(diff > 0 ? 1 : -1);
  });
})();
