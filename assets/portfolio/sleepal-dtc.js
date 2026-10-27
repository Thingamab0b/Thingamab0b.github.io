(() => {
  const track = document.querySelector('.dtc-phases');
  if (!track) return;
  const stage = track.querySelector('.dtc-phase-stage');
  const viewport = track.querySelector('.dtc-phase-viewport');
  const tablist = track.querySelector('.dtc-stage-tabs');
  const tabs = [...tablist.querySelectorAll('[role="tab"]')];
  const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  let segments = [];
  let active = -1;
  let travel = 0;
  let transition = 0;
  let top = 24;
  let frame = 0;
  let measureFrame = 0;

  track.classList.add('is-interactive');
  panels.forEach(panel => { panel.hidden = false; });

  function activate(index) {
    if (index === active) return;
    const movingFocus = panels.some((panel, i) => i !== index && panel.contains(document.activeElement));
    active = index;
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      panels[i].setAttribute('aria-hidden', String(i !== index));
      panels[i].inert = i !== index;
    });
    if (movingFocus) tabs[index].focus({preventScroll: true});
  }

  // One native document scroll drives both reading and stage transitions.
  // No nested scroll area, wheel interception, thresholds or cooldown timers.
  function render() {
    frame = 0;
    if (!segments.length) return;
    const progress = clamp(top - track.getBoundingClientRect().top, 0, travel);
    let index = segments.findLastIndex(segment => progress >= segment.start);
    if (index < 0) index = 0;
    const segment = segments[index];
    const local = progress - segment.start;
    const mix = index < panels.length - 1
      ? clamp((local - segment.length) / transition, 0, 1) : 0;
    const selected = mix >= 0.5 ? index + 1 : index;
    activate(selected);

    panels.forEach((panel, i) => {
      let opacity = 0;
      let offset = 0;
      if (i === index) {
        opacity = 1 - mix;
        offset = -Math.min(local, segment.reading) - mix * 24;
      } else if (i === index + 1 && mix > 0) {
        opacity = mix;
        offset = (1 - mix) * 24;
      }
      if (reducedMotion.matches) {
        opacity = i === selected ? 1 : 0;
        offset = i === index ? -Math.min(local, segment.reading) : 0;
      }
      panel.classList.toggle('is-visible', opacity > 0);
      panel.style.opacity = opacity;
      panel.style.transform = `translateY(${offset}px)`;
    });
    const selectedSegment = segments[selected];
    const fraction = clamp((progress - selectedSegment.start) / selectedSegment.length, 0, 1);
    tabs[selected].style.setProperty('--stage-progress', fraction);
  }

  function requestRender() {
    if (!frame) frame = requestAnimationFrame(render);
  }

  function measure() {
    measureFrame = 0;
    top = parseFloat(getComputedStyle(stage).top) || 0;
    const height = viewport.clientHeight;
    transition = clamp(height * 0.32, 160, 260);
    let start = 0;
    segments = panels.map(panel => {
      const reading = Math.max(0, panel.offsetHeight - height);
      const length = Math.max(reading, height * 0.55);
      const segment = {start, reading, length};
      start += length + transition;
      return segment;
    });
    travel = start - transition;
    track.style.height = `${stage.offsetHeight + travel}px`;
    render();
  }

  function requestMeasure() {
    if (!measureFrame) measureFrame = requestAnimationFrame(measure);
  }

  function goTo(index, updateUrl = true) {
    const start = scrollY + track.getBoundingClientRect().top - top;
    // Jump along the scroll track while the sticky frame stays in place.
    // Instant positioning avoids flashing through intermediate tabs.
    window.scrollTo({top: start + segments[index].start, behavior: 'instant'});
    render();
    if (updateUrl) history.replaceState(null, '', `#${panels[index].id}`);
  }

  tabs.forEach((tab, index) => tab.addEventListener('click', () => goTo(index)));
  tablist.addEventListener('keydown', event => {
    const index = tabs.indexOf(document.activeElement);
    if (index < 0) return;
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    goTo(next);
    tabs[next].focus({preventScroll: true});
  });

  // Keyboard users can reach links and the expandable case within a tall panel.
  viewport.addEventListener('focusin', event => {
    const panel = panels[active];
    if (!panel || event.target === panel || !panel.contains(event.target)) return;
    const bounds = viewport.getBoundingClientRect();
    const target = event.target.getBoundingClientRect();
    if (target.top >= bounds.top && target.bottom <= bounds.bottom) return;
    const offset = target.top - panel.getBoundingClientRect().top;
    const start = scrollY + track.getBoundingClientRect().top - top;
    window.scrollTo({
      top: start + segments[active].start + clamp(offset - 16, 0, segments[active].reading),
      behavior: 'instant'
    });
    render();
  });

  function restoreFromUrl() {
    const index = panels.findIndex(panel => `#${panel.id}` === location.hash);
    if (index >= 0) goTo(index, false);
  }

  window.addEventListener('scroll', requestRender, {passive: true});
  window.addEventListener('resize', requestMeasure, {passive: true});
  window.addEventListener('hashchange', restoreFromUrl);
  window.addEventListener('pageshow', event => {
    measure();
    if (!event.persisted) restoreFromUrl();
  });
  reducedMotion.addEventListener('change', requestRender);
  const observer = new ResizeObserver(requestMeasure);
  panels.forEach(panel => observer.observe(panel));
  observer.observe(tablist);
  observer.observe(viewport);
  document.fonts.ready.then(requestMeasure);
  measure();
  restoreFromUrl();
})();
