(() => {
  const imageDialog = document.querySelector('.image-dialog');
  if (imageDialog) {
    const preview = imageDialog.querySelector('img');
    document.querySelectorAll('[data-lightbox]').forEach(link => {
      link.addEventListener('click', event => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        const source = link.querySelector('img');
        preview.src = link.href;
        preview.alt = source.alt;
        imageDialog.classList.toggle('design-preview', link.closest('figure').classList.contains('design-figure'));
        imageDialog.querySelector('p').textContent = link.closest('figure').querySelector('figcaption').textContent;
        imageDialog.showModal();
        document.body.classList.add('viewing-image');
      });
    });
    imageDialog.querySelector('button').addEventListener('click', () => imageDialog.close());
    imageDialog.addEventListener('click', event => { if (event.target === imageDialog) imageDialog.close(); });
    imageDialog.addEventListener('close', () => document.body.classList.remove('viewing-image'));
  }
  const carousel = document.querySelector('.project-carousel');
  if (carousel) {
    const viewport = carousel.querySelector('.project-viewport');
    const track = carousel.querySelector('.project-track');
    const cards = [...carousel.querySelectorAll('.project-card')];
    const previous = carousel.querySelector('.carousel-prev');
    const next = carousel.querySelector('.carousel-next');
    const dots = carousel.querySelector('.carousel-dots');
    let page = 0, visible = 3, step = 344, pages = 2;
    function update() {
      track.style.transform = `translateX(${-page * step}px)`;
      previous.disabled = page === 0;
      next.disabled = page === pages - 1;
      [...dots.children].forEach((button, i) => button.setAttribute('aria-current', String(i === page)));
      cards.forEach((card, i) => {
        const hidden = i < page || i >= page + visible;
        card.inert = hidden;
        card.setAttribute('aria-hidden', String(hidden));
      });
    }
    function goTo(index) { page = Math.max(0, Math.min(pages - 1, index)); update(); }
    function resize() {
      visible = innerWidth < 640 ? 1 : innerWidth < 1024 ? 2 : 3;
      const width = (viewport.clientWidth - 24 * (visible - 1)) / visible;
      step = width + 24;
      pages = cards.length - visible + 1;
      carousel.style.setProperty('--card-width', `${width}px`);
      carousel.style.setProperty('--card-height', `${width / 320 * 390.769}px`);
      carousel.style.setProperty('--card-scale', width / 320);
      const focused = document.activeElement;
      const focusIndex = [...dots.children].indexOf(focused);
      dots.replaceChildren(...Array.from({length: pages}, (_, i) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.setAttribute('aria-label', `第 ${i + 1} 组项目`);
        button.setAttribute('aria-controls', 'project-track');
        button.addEventListener('click', () => goTo(i));
        return button;
      }));
      page = Math.min(page, pages - 1);
      update();
      if (focusIndex >= 0) dots.children[Math.min(focusIndex, pages - 1)].focus();
      carousel.classList.add('is-ready');
    }
    previous.addEventListener('click', () => goTo(page - 1));
    next.addEventListener('click', () => goTo(page + 1));
    carousel.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault(); goTo(page + (event.key === 'ArrowRight' ? 1 : -1));
      }
    });
    let touchStart;
    viewport.addEventListener('touchstart', event => { touchStart = [event.touches[0].clientX, event.touches[0].clientY]; }, {passive: true});
    viewport.addEventListener('touchend', event => {
      if (!touchStart) return;
      const dx = event.changedTouches[0].clientX - touchStart[0], dy = event.changedTouches[0].clientY - touchStart[1];
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) goTo(page + (dx < 0 ? 1 : -1));
      touchStart = null;
    }, {passive:true});
    new ResizeObserver(resize).observe(viewport);
    resize();
  }
  // Preserve bookmarks to projects in the former single-page portfolio.
  const oldProjects = {
    '#sleep-pod': '/projects/sleep-pod/', '#pod-flow': '/projects/sleep-pod/#pod-flow',
    '#pod-ui': '/projects/sleep-pod/#pod-ui', '#pod-delivery': '/projects/sleep-pod/#pod-delivery',
    '#landing-page': '/projects/landing-page/', '#landing-design': '/projects/landing-page/#landing-design',
    '#landing-results': '/projects/landing-page/#results'
  };
  if (document.body.classList.contains('home-page') && oldProjects[location.hash]) {
    location.replace(oldProjects[location.hash]);
    return;
  }
  // Keep the previous portfolio's bookmarked section links useful after migration.
  const aliases = {'#background':'#experience', '#work':'#projects', '#landing-results':'#results'};
  if (aliases[location.hash]) {
    history.replaceState(null, '', aliases[location.hash]);
    document.querySelector(aliases[location.hash])?.scrollIntoView();
  }
})();
