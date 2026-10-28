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
// Darken the first hero as the film slides over it, including its text.
const introHero = document.querySelector('.hero-stack .intro-hero');
const filmHero = document.querySelector('.hero-stack > .hero');
if (introHero && filmHero) {
  let introDimFrame = 0;
  const updateIntroDim = () => {
    introDimFrame = 0;
    const introBounds = introHero.getBoundingClientRect();
    const overlap = introBounds.bottom - filmHero.getBoundingClientRect().top;
    const progress = Math.max(0, Math.min(1, overlap / Math.max(1, introBounds.height)));
    introHero.style.setProperty('--intro-dim', String(progress * .7));
  };
  const scheduleIntroDim = () => {
    if (!introDimFrame) introDimFrame = requestAnimationFrame(updateIntroDim);
  };
  window.addEventListener('scroll', scheduleIntroDim, { passive: true });
  window.addEventListener('resize', scheduleIntroDim);
  updateIntroDim();
}
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
  { category: 'CAPTURE', description: '회의에서 나온 생각부터 아직 정리되지 않은 아이디어까지, 업무의 흐름을 한 권에 담아보세요. 날짜와 핵심 목표를 적고, 이어지는 노트 공간에 논의 내용과 다음 할 일을 함께 기록할 수 있습니다. 프로젝트별 메모를 쌓아두고 다시 살펴보며 생각을 구체적인 실행으로 연결해 보세요.', name: 'PRO SERIES NOTEBOOK', format: 'NOTES & IDEAS', visual: 'notebook', image: '../image/pro-series-notebook-expanded.png', alt: 'Pro Series Notebook' },
  { category: 'PLAN', description: '해야 할 일이 많을수록, 오늘 무엇에 집중할지 정하는 시간이 필요합니다. 하루의 주요 목표와 일정, 메모를 함께 정리하며 업무의 우선순위를 세워보세요. 회의와 개인 일정 사이에 집중할 시간을 확보하고, 하루를 마칠 때 계획과 진행 상황을 돌아보는 데 활용할 수 있습니다.', name: 'PRO SERIES PLANNER', format: 'PLANS & PRIORITIES', visual: 'planner', image: '../image/pro-series-planner-expanded.png', alt: 'Pro Series Planner' },
  { category: 'DESIGN', description: '말과 글만으로 설명하기 어려운 생각을 선과 형태로 정리해 보세요. 그리드를 기준으로 아이디어의 비례와 배치를 가늠하고, 스케치 옆에 치수나 설명을 함께 기록할 수 있습니다. 제품 구상, 공간 구성, 화면 레이아웃처럼 구조를 시각적으로 검토하는 작업에 활용해 보세요.', name: 'PRO SERIES TECHNICAL GRID', format: 'DRAWING & DESIGN', visual: 'grid', image: '../image/pro-series-grid-expanded.png', alt: 'Pro Series Technical Grid' },
  { category: 'ORGANIZE', description: '작업 중 떠오르는 생각과 당장 처리할 일을 책상 위에서 빠르게 정리해 보세요. 회의 전 확인할 내용, 진행 중인 업무의 메모, 다음 단계의 실행 목록을 한곳에 적어둘 수 있습니다. 긴 기록을 남기기보다 지금 필요한 내용을 가까이 두고 확인하며 일하고 싶을 때 활용해 보세요.', name: 'PRO SERIES PAD', format: 'EVERYDAY WORK', visual: 'pad', image: '../image/pro-series-pad-expanded.png', alt: 'Pro Series Pad' }
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
  productImage.dataset.seriesVisual = product.visual;
  productImage.src = product.image;
  productImage.alt = product.alt;
  document.querySelector('[data-series-current]').textContent = String(seriesIndex + 1).padStart(2, '0');
  document.querySelectorAll('[data-series-index]').forEach((button, i) => {
    button.classList.toggle('active', i === seriesIndex);
    button.setAttribute('aria-pressed', String(i === seriesIndex));
  });
};
// Use ordinary page scrolling to move through the four collection products.
const seriesSection = document.querySelector('.pro-series');
const seriesTrack = document.createElement('div');
seriesTrack.className = 'pro-series-scroll';
seriesSection.before(seriesTrack);
seriesTrack.append(seriesSection);
const seriesViewport = window.matchMedia('(min-width: 801px) and (min-height: 700px)');
const seriesScrollEnabled = () => seriesViewport.matches && !reducedMotion.matches;
let seriesScrollFrame = 0;
const updateSeriesScroll = () => {
  seriesScrollFrame = 0;
  if (!seriesScrollEnabled()) return;
  const bounds = seriesTrack.getBoundingClientRect();
  const travel = Math.max(1, seriesTrack.offsetHeight - window.innerHeight);
  const progress = Math.max(0, Math.min(1, -bounds.top / travel));
  const index = Math.round(progress * (seriesProducts.length - 1));
  if (index !== seriesIndex) showSeriesProduct(index);
};
const scheduleSeriesScroll = () => {
  if (!seriesScrollFrame) seriesScrollFrame = requestAnimationFrame(updateSeriesScroll);
};
const syncSeriesScroll = () => {
  seriesTrack.classList.toggle('is-scroll-driven', seriesScrollEnabled());
  scheduleSeriesScroll();
};
const navigateSeries = (index) => {
  if (!seriesScrollEnabled()) {
    if (index >= seriesProducts.length) {
      seriesTrack.nextElementSibling?.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
    } else showSeriesProduct(index);
    return;
  }
  const top = seriesTrack.getBoundingClientRect().top + window.scrollY;
  const travel = seriesTrack.offsetHeight - window.innerHeight;
  const target = index >= seriesProducts.length
    ? top + seriesTrack.offsetHeight
    : top + (index / (seriesProducts.length - 1)) * travel;
  window.scrollTo({ top: target, behavior: 'smooth' });
};
document.querySelectorAll('[data-series-index]').forEach((button) => button.addEventListener('click', () => navigateSeries(Number(button.dataset.seriesIndex))));
document.querySelector('[data-series-next]').addEventListener('click', () => navigateSeries(seriesIndex + 1));
window.addEventListener('scroll', scheduleSeriesScroll, { passive: true });
window.addEventListener('resize', syncSeriesScroll);
seriesViewport.addEventListener('change', syncSeriesScroll);
reducedMotion.addEventListener('change', syncSeriesScroll);
syncSeriesScroll();

// Preserve natural wrapping while revealing the collection heading word by word.
const collectionTitle = document.querySelector('.idea-growth-title');
if (collectionTitle && 'IntersectionObserver' in window && !reducedMotion.matches) {
  const titleText = collectionTitle.firstChild;
  const words = titleText.textContent.trim().split(/\s+/);
  const fragment = document.createDocumentFragment();
  words.forEach((word, index) => {
    if (index) fragment.append(document.createTextNode(' '));
    const span = document.createElement('span');
    span.className = 'idea-growth-word';
    span.textContent = word;
    span.style.setProperty('--word-delay', `${index * 55}ms`);
    fragment.append(span);
  });
  titleText.replaceWith(fragment);
  collectionTitle.setAttribute('data-title-reveal', '');
  const titleObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (reducedMotion.matches || (entry.isIntersecting && entry.intersectionRatio >= .2)) {
        collectionTitle.classList.add('is-visible');
      } else if (!entry.isIntersecting) {
        collectionTitle.classList.remove('is-visible');
      }
    });
  }, { threshold: [0, .2] });
  titleObserver.observe(collectionTitle);
  reducedMotion.addEventListener('change', () => {
    if (!reducedMotion.matches) return;
    collectionTitle.classList.add('is-visible');
  });
}

// Reveal each material row only when scrolling carries it past the trigger line.
const materialBenefits = document.querySelector('.home-fit-benefits');
if (materialBenefits) {
  const rows = [...materialBenefits.children];
  materialBenefits.setAttribute('data-reveal-enabled', '');
  let benefitsFrame = 0;
  const updateMaterialBenefits = () => {
    benefitsFrame = 0;
    const trigger = window.innerHeight * .7;
    rows.forEach((row) => {
      const bounds = row.getBoundingClientRect();
      const revealed = bounds.top + bounds.height * .5 <= trigger && bounds.bottom > 0;
      row.classList.toggle('is-visible', reducedMotion.matches || revealed);
    });
  };
  const scheduleMaterialBenefits = () => {
    if (!benefitsFrame) benefitsFrame = requestAnimationFrame(updateMaterialBenefits);
  };
  window.addEventListener('scroll', scheduleMaterialBenefits, { passive: true });
  window.addEventListener('resize', scheduleMaterialBenefits);
  reducedMotion.addEventListener('change', scheduleMaterialBenefits);
  updateMaterialBenefits();
}

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


// Move each cover and paper detail together as one image composition.
const bestsellerStories = [...document.querySelectorAll('.bestseller-story')];
if (bestsellerStories.length) {
  let bestsellerFrame = 0;
  const updateBestsellers = () => {
    bestsellerFrame = 0;
    const still = reducedMotion.matches || window.innerWidth <= 700;
    const storyBounds = bestsellerStories.map((story) => story.getBoundingClientRect());
    bestsellerStories.forEach((story, index) => {
      const bounds = storyBounds[index];
      const next = storyBounds[index + 1];
      const overlap = !still && next
        ? Math.max(0, Math.min(1, (bounds.bottom - next.top) / Math.max(1, bounds.height)))
        : 0;
      story.style.setProperty('--story-dim', String(overlap * .65));
      const top = bounds.top;
      if (!still && (top > innerHeight || top < -story.offsetHeight)) return;
      const progress = still ? 0 : Math.max(0, Math.min(1, top / innerHeight));
      story.style.setProperty('--cover-shift', `${progress * 28}px`);
      story.style.setProperty('--paper-shift', `${progress * 28}px`);
    });
  };
  const scheduleBestsellers = () => {
    if (!bestsellerFrame) bestsellerFrame = requestAnimationFrame(updateBestsellers);
  };
  window.addEventListener('scroll', scheduleBestsellers, { passive: true });
  window.addEventListener('resize', scheduleBestsellers);
  reducedMotion.addEventListener('change', scheduleBestsellers);
  updateBestsellers();
}

// Keep heading entrances consistent across the page, and replay on return.
if ('IntersectionObserver' in window) {
  const headings = [...document.querySelectorAll('main h1, main h2, main h3, footer h2')]
    .filter((heading) => !heading.classList.contains('idea-growth-title'));
  const headingObserver = new IntersectionObserver((entries) => {
    let stagger = 0;
    entries.forEach((entry) => {
      if (reducedMotion.matches || (entry.isIntersecting && entry.intersectionRatio >= .12)) {
        entry.target.style.setProperty('--heading-delay', `${Math.min(stagger, 2) * 80}ms`);
        entry.target.classList.add('is-heading-visible');
        stagger += 1;
      } else if (!entry.isIntersecting) {
        entry.target.classList.remove('is-heading-visible');
      }
    });
  }, { threshold: [0, .12] });
  headings.forEach((heading) => {
    heading.setAttribute('data-heading-reveal', '');
    headingObserver.observe(heading);
  });
  // Product names change in place while the collection stays pinned.
  const changingTitle = document.querySelector('[data-series-title]');
  if (changingTitle) {
    let titleFrame = 0;
    const productTitleObserver = new MutationObserver(() => {
      if (reducedMotion.matches) return;
      cancelAnimationFrame(titleFrame);
      changingTitle.classList.remove('is-heading-visible');
      titleFrame = requestAnimationFrame(() => {
        titleFrame = requestAnimationFrame(() => {
          const bounds = changingTitle.getBoundingClientRect();
          if (bounds.bottom > 0 && bounds.top < window.innerHeight) {
            changingTitle.style.setProperty('--heading-delay', '0ms');
            changingTitle.classList.add('is-heading-visible');
          }
        });
      });
    });
    productTitleObserver.observe(changingTitle, { childList: true, characterData: true, subtree: true });
  }
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) headings.forEach((heading) => heading.classList.add('is-heading-visible'));
  });
}
