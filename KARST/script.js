const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('#menu');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const setMenu = (open) => {
  document.body.classList.toggle('menu-open', open);
  menu.classList.toggle('open', open);
  menu.setAttribute('aria-hidden', String(!open));
  menuButton.setAttribute('aria-expanded', String(open));
  menu.inert = !open;
  document.querySelector('main').inert = open;
  document.querySelector('footer').inert = open;
  if (open) requestAnimationFrame(() => {
    if (document.body.classList.contains('menu-open')) menu.querySelector('a').focus({ preventScroll: true });
  });
  else menuButton.focus({ preventScroll: true });
};
menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (event) => {
  if (!document.body.classList.contains('menu-open')) return;
  if (event.key === 'Escape') setMenu(false);
  if (event.key === 'Tab') {
    const controls = [menuButton, ...menu.querySelectorAll('a')];
    const current = controls.indexOf(document.activeElement);
    event.preventDefault();
    controls[(current + (event.shiftKey ? -1 : 1) + controls.length) % controls.length].focus();
  }
});
const heroVideo = document.querySelector('.hero-video');
const updateVideoMotion = () => {
  if (reducedMotion.matches) heroVideo.pause();
  else heroVideo.play().catch(() => {}); // Autoplay may be blocked by the browser.
};
reducedMotion.addEventListener('change', updateVideoMotion);
updateVideoMotion();
const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > window.innerHeight * .72);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

// Reveal navigation near the top edge, then hide it below the header.
document.addEventListener('mousemove', (event) => {
  if (event.clientY <= 24) {
    header.classList.add('is-visible');
  } else if (event.clientY > header.offsetHeight + 12) {
    header.classList.remove('is-visible');
  }
}, { passive: true });
document.addEventListener('mouseleave', () => header.classList.remove('is-visible'));
const counter = document.querySelector('[data-benefit-current]');
const cards = document.querySelectorAll('[data-benefit]');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => { if (entry.isIntersecting) counter.textContent = String([...cards].indexOf(entry.target) + 1).padStart(2, '0'); });
  }, { rootMargin: '-35% 0px -50%', threshold: 0 });
  cards.forEach((card) => observer.observe(card));
}
document.querySelector('[data-year]').textContent = new Date().getFullYear();

const seriesProducts = [
  { category: 'CAPTURE', description: '회의 기록, 아이디어 정리, 업무 노트', name: 'PRO SERIES NOTEBOOK', format: 'NOTES & IDEAS', image: '../image/karst-notebooks.jpg', alt: 'Pro Series Notebook' },
  { category: 'PLAN', description: '일정 관리, 시간 계획, 업무 우선순위', name: 'PRO SERIES PLANNER', format: 'PLANS & PRIORITIES', image: '../image/pro-series-planner.jpg', alt: 'Pro Series Planner' },
  { category: 'DESIGN', description: '도면, 구조 설계, 아이디어 스케치', name: 'PRO SERIES TECHNICAL GRID', format: 'DRAWING & DESIGN', image: '../image/pro-series-grid.jpg', alt: 'Pro Series Technical Grid' },
  { category: 'ORGANIZE', description: '빠른 메모, 업무 정리, 실행 계획', name: 'PRO SERIES PAD', format: 'EVERYDAY WORK', image: '../image/pro-series-pad.jpg', alt: 'Pro Series Pad' }
];
let seriesIndex = 0;
const showSeriesProduct = (index) => {
  seriesIndex = (index + seriesProducts.length) % seriesProducts.length;
  const product = seriesProducts[seriesIndex];
  document.querySelector('[data-series-name]').textContent = product.name;
  document.querySelector('[data-series-category]').textContent = `${String(seriesIndex + 1).padStart(2, '0')} — ${product.category}`;
  document.querySelector('[data-series-title]').textContent = product.alt;
  document.querySelector('[data-series-description]').textContent = product.description;
  document.querySelector('[data-series-format]').textContent = product.format;
  const productImage = document.querySelector('[data-series-image]');
  productImage.src = product.image;
  productImage.alt = product.alt;
  document.querySelector('[data-series-current]').textContent = String(seriesIndex + 1).padStart(2, '0');
  document.querySelectorAll('[data-series-index]').forEach((button, i) => {
    button.classList.toggle('active', i === seriesIndex);
    button.setAttribute('aria-pressed', String(i === seriesIndex));
  });
};
document.querySelectorAll('[data-series-index]').forEach((button) => button.addEventListener('click', () => showSeriesProduct(Number(button.dataset.seriesIndex))));
document.querySelector('[data-series-next]').addEventListener('click', () => showSeriesProduct(seriesIndex + 1));

// The paragraph and vertically staggered badges share one scroll timeline.
const materialBanner = document.querySelector('.material-banner');
if (materialBanner) {
  const stage = document.createElement('div');
  stage.className = 'material-banner-stage';
  stage.append(...materialBanner.childNodes);
  materialBanner.appendChild(stage);
  const description = stage.querySelector('.material-banner-description');
  const originalText = description.textContent.trim();
  description.setAttribute('aria-label', originalText);
  description.replaceChildren();
  const words = originalText.split(/\s+/).map((word, index) => {
    const span = document.createElement('span');
    span.className = 'material-banner-word';
    span.setAttribute('aria-hidden', 'true');
    span.textContent = word;
    if (index) description.append(' ');
    description.appendChild(span);
    return span;
  });
  const rails = ['left', 'right'].map((side) => {
    const rail = document.createElement('div');
    rail.className = `material-banner-rail material-banner-rail-${side}`;
    stage.appendChild(rail);
    return rail;
  });
  const badges = [];
  // Horizontal lanes from Figma; each icon gets a separate scroll interval.
  const badgePositions = [
    [14, 10], [14, 10], [86, 90],
    [14, 10], [86, 90], [86, 90]
  ];
  const badgeOrder = [0, 4, 1, 2, 3, 5];
  const badgeIcons = [
    ['waterproof', 150, 155, 179.14, 173.58, -39.57, -38.86],
    ['tear-resistant', 159, 123, 155.58, 201.28, -27.67, -51.2],
    ['recycled-stone', 150, 127, 182.8, 215.83, -43.44, -61.79],
    ['friction-free-writing', 119, 146, 211.82, 172.02, -65.03, -39.64],
    ['no-bleaches-acids', 117, 167, 203.57, 142.82, -52.6, -20.05],
    ['bright-smooth', 106, 132, 224.73, 179.4, -63.26, -43.78]
  ];
  const badgeLabels = ['WATERPROOF', 'TEAR-RESISTANT', 'RECYCLED STONE', 'FRICTION-FREE WRITING', 'NO BLEACHES OR ACIDS', 'BRIGHT & SMOOTH'];
  badgeIcons.forEach((_, index) => {
    const figure = document.createElement('figure');
    figure.className = 'material-banner-badge';
    const [name, width, height, cropWidth, cropHeight, left, top] = badgeIcons[index];
    const icon = document.createElement('div');
    icon.className = 'material-banner-icon';
    icon.style.width = `${width / 225 * 100}%`;
    icon.style.aspectRatio = `${width} / ${height}`;
    const image = document.createElement('img');
    image.src = `../image/stone-paper-icons/${name}.png`;
    image.alt = '';
    image.style.cssText = `width:${cropWidth}%;height:${cropHeight}%;left:${left}%;top:${top}%`;
    icon.appendChild(image);
    icon.setAttribute('aria-hidden', 'true');
    const caption = document.createElement('figcaption');
    caption.textContent = badgeLabels[index];
    figure.append(icon, caption);
    const side = [0, 1, 3].includes(index) ? 0 : 1;
    rails[side].appendChild(figure);
    const [x, mobileX] = badgePositions[index];
    figure.style.setProperty('--badge-x', `${x}%`);
    figure.style.setProperty('--badge-mobile-x', `${mobileX}%`);
    badges.push({ element: figure, order: badgeOrder.indexOf(index) });
  });
  const clampProgress = (value) => Math.max(0, Math.min(1, value));
  const updateMaterialBanner = () => {
    materialBanner.classList.toggle('is-reduced-motion', reducedMotion.matches);
    if (reducedMotion.matches) {
      materialBanner.classList.remove('is-scroll-story');
      words.forEach((word) => { word.style.opacity = '1'; });
      badges.forEach(({ element }) => {
        element.style.visibility = 'visible';
        element.style.transform = 'none';
      });
      return;
    }
    materialBanner.classList.add('is-scroll-story');
    const scrollDistance = materialBanner.offsetHeight - stage.offsetHeight;
    const progress = clampProgress(-materialBanner.getBoundingClientRect().top / Math.max(1, scrollDistance));
    words.forEach((word, index) => {
      const reveal = clampProgress(progress * words.length - index);
      word.style.opacity = String(.12 + reveal * .88);
    });
    badges.forEach(({ element, order }) => {
      const localProgress = progress * badges.length - order;
      const active = localProgress >= 0 && localProgress < 1;
      const reveal = clampProgress(localProgress);
      // Finish one icon's ascent before the next icon enters, alternating sides.
      const y = stage.clientHeight - reveal * (stage.clientHeight + element.offsetHeight + 2);
      const envelope = Math.sin(reveal * Math.PI);
      // Curve the travel path gently while keeping the artwork upright.
      const wave = reveal * Math.PI * 2 + order * .7;
      const drift = Math.sin(wave) * Math.min(42, stage.clientWidth * .025) * envelope;
      element.style.visibility = active ? 'visible' : 'hidden';
      element.style.opacity = '1';
      element.style.transform = `translate3d(calc(-50% + ${drift}px), ${y}px, 0)`;
    });
  };
  let materialFrame = 0;
  const scheduleMaterialBanner = () => {
    if (materialFrame) return;
    materialFrame = requestAnimationFrame(() => {
      materialFrame = 0;
      updateMaterialBanner();
    });
  };
  window.addEventListener('scroll', scheduleMaterialBanner, { passive: true });
  window.addEventListener('resize', scheduleMaterialBanner);
  reducedMotion.addEventListener('change', scheduleMaterialBanner);
  updateMaterialBanner();
}

