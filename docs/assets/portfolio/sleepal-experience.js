(() => {
  const root = document.querySelector('.experience-layout');
  if (!root) return;
  const stages = JSON.parse(document.querySelector('#experience-data').textContent);
  const mediaRoot = '/assets/portfolio/projects/sleep-pod/experience/';
  const field = document.querySelector('#field-video'), screen = document.querySelector('#screen-video');
  const videos = [field, screen], playButton = document.querySelector('#play-experience');
  const buttons = [...document.querySelectorAll('[data-stage]')];
  const ruler = document.querySelector('.experience-stages'), track = document.querySelector('.stage-track');
  const playhead = document.querySelector('.timeline-playhead'), status = document.querySelector('#playback-status');
  const starts = []; let total = 0;
  stages.forEach(stage => { starts.push(total); total += stage.screenDuration; });
  const pixelsPerSecond = 24;
  const clamp = time => Math.max(0, Math.min(total, time));
  const locate = time => Math.max(0, starts.findLastIndex(start => start <= time));
  const setText = (id, value) => { document.getElementById(id).textContent = value; };
  let current = Number(root.dataset.initialStage), playing = false, pending = false, finished = false;
  let generation = 0, selection = 0, animation, ready = Promise.resolve(false), controller;
  let desiredTime = 0, scrubbing = false, drag = null, wheelTimer, resumeScrub = false, suppressClick = false;
  const assets = new Map();
  const lamp = document.querySelector('.product-light');
  const lightFrames = [...lamp.querySelectorAll('[data-light-level]')];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let lightValue = null, lightTarget = 0, lightAnimation, lastLightFrame = 0;
  // All six renders share their canvas and alpha. Additive compositing of the
  // weighted frames avoids dark/doubled translucent edges at the crossfade.
  function paintLight(value) {
    const position = Math.max(0, Math.min(5, value / 20));
    const lower = Math.floor(position), mix = position - lower;
    lightFrames.forEach((image, i) => {
      image.style.opacity = i === lower ? 1 - mix : i === lower + 1 ? mix : 0;
    });
    lamp.dataset.brightness = value.toFixed(2);
    lamp.style.setProperty('--light-glow', String(position / 5));
  }
  function animateLight(now) {
    const dt = Math.min(64, lastLightFrame ? now - lastLightFrame : 16);
    lastLightFrame = now;
    lightValue += (lightTarget - lightValue) * (1 - Math.exp(-dt / 65));
    if (Math.abs(lightTarget - lightValue) < .03) lightValue = lightTarget;
    paintLight(lightValue);
    if (lightValue !== lightTarget) lightAnimation = requestAnimationFrame(animateLight);
    else { lightAnimation = null; lastLightFrame = 0; }
  }
  function updateLight(time) {
    const index = locate(time), local = time - starts[index];
    const keys = stages[index].lightKeyframes;
    let value = keys.at(-1)[1];
    for (let i = 1; i < keys.length; i++) {
      if (local > keys[i][0]) continue;
      const [t0, v0] = keys[i - 1], [t1, v1] = keys[i];
      const t = Math.max(0, Math.min(1, (local - t0) / (t1 - t0)));
      value = v0 + (v1 - v0) * t * t * (3 - 2 * t);
      break;
    }
    lightTarget = value; lamp.dataset.targetBrightness = value.toFixed(2);
    if (lightValue === null || reducedMotion.matches) {
      cancelAnimationFrame(lightAnimation); lightAnimation = null; lastLightFrame = 0;
      lightValue = value; paintLight(value);
    } else if (!lightAnimation && lightValue !== lightTarget) lightAnimation = requestAnimationFrame(animateLight);
  }
  const lightReady = Promise.all(lightFrames.map(image => image.decode())).then(() => updateLight(scrubbing ? ruler.scrollLeft / pixelsPerSecond : globalTime()));
  lightReady.catch(() => { status.textContent = '产品图片加载失败，请刷新重试。'; });
  // Blob URLs support precise seeking even on preview servers without HTTP Range.
  function mediaURL(url) {
    if (!assets.has(url)) assets.set(url, fetch(url).then(response => {
      if (!response.ok) throw new Error(`Media ${response.status}`);
      return response.blob();
    }).then(blob => URL.createObjectURL(blob)).catch(error => { assets.delete(url); throw error; }));
    return assets.get(url);
  }
  function waitFor(video, event, signal) {
    return new Promise(resolve => {
      const finish = value => { video.removeEventListener(event, success); video.removeEventListener('error', failure); signal.removeEventListener('abort', failure); resolve(value); };
      const success = () => finish(true), failure = () => finish(false);
      if (signal.aborted) return resolve(false);
      video.addEventListener(event, success, {once:true});
      video.addEventListener('error', failure, {once:true});
      signal.addEventListener('abort', failure, {once:true});
    });
  }
  function highlight(index) {
    buttons.forEach((button, i) => {
      button.setAttribute('aria-current', i === index ? 'step' : 'false');
      button.classList.toggle('completed', i < index);
    });
  }
  function showTime(time) {
    playhead.setAttribute('aria-valuenow', time.toFixed(1));
    playhead.setAttribute('aria-valuetext', `${stages[locate(time)].label}，${Math.floor(time)} 秒`);
    updateLight(time);
  }
  function globalTime() { return starts[current] + (desiredTime ?? Math.min(screen.currentTime, stages[current].screenDuration)); }
  function renderTimeline() {
    if (scrubbing) return;
    const time = clamp(globalTime()); ruler.scrollLeft = time * pixelsPerSecond; showTime(time);
  }
  function measureTimeline() {
    const anchor = playhead.offsetLeft;
    track.style.paddingLeft = `${anchor}px`;
    track.style.paddingRight = `${ruler.clientWidth - anchor}px`;
    buttons.forEach((button, i) => {
      button.style.flexBasis = `${stages[i].screenDuration * pixelsPerSecond}px`;
      button.style.setProperty('--tick-offset', `${-starts[i] * pixelsPerSecond}px`);
    });
    renderTimeline();
  }
  function setPlayState(state) {
    const label = {play:'播放体验', pause:'暂停体验', replay:'重新播放'}[state];
    playButton.dataset.state = state; playButton.setAttribute('aria-label',label); playButton.title = label;
  }
  function pause() {
    generation++; playing = false; pending = false; videos.forEach(video => video.pause());
    root.classList.remove('playing'); playButton.disabled = false;
    setPlayState(finished ? 'replay' : 'play'); cancelAnimationFrame(animation);
    status.textContent = finished ? '体验结束 · 可选择阶段重看' : '从当前时刻开始';
  }
  function tick() { if (playing) { renderTimeline(); animation = requestAnimationFrame(tick); } }
  async function play() {
    if (pending) return;
    if (finished) selectStage(0);
    const token = ++generation;
    pending = true; playButton.disabled = true; status.textContent = '正在载入片段…';
    try {
      const [loaded] = await Promise.all([ready, lightReady]);
      if (token !== generation) return;
      if (!loaded) { pause(); status.textContent = '素材加载失败，请重试。'; return; }
      screen.muted = false;
      await Promise.all(videos.map(video => video.play()));
      if (token !== generation) return;
      pending = false; playing = true; playButton.disabled = false;
      root.classList.add('playing'); setPlayState('pause');
      status.textContent = '本段结束后进入下一阶段'; tick();
    } catch (error) {
      if (token === generation) { pause(); status.textContent = '视频未能播放，请重试。'; }
    }
  }
  function selectStage(index, resume = false, offset = 0) {
    clearTimeout(wheelTimer); scrubbing = false; drag = null; ruler.classList.remove('scrubbing');
    pause(); controller?.abort(); controller = new AbortController();
    const signal = controller.signal, token = ++selection;
    current = index; finished = false;
    const stage = stages[index]; desiredTime = Math.max(0, Math.min(offset, stage.screenDuration - .001));
    highlight(index); setText('stage-title',stage.title); setText('stage-description',stage.description);
    const localTime = desiredTime;
    ready = (async () => {
      try {
        const urls = await Promise.all(['field','screen'].map(kind => mediaURL(`${mediaRoot}${kind}-${stage.id}.mp4?v=${stage.mediaRevision || (kind === 'field' ? 'person-2' : 'audio-1')}`)));
        if (signal.aborted) return false;
        const loads = videos.map((video, i) => {
          const kind = i === 0 ? 'field' : 'screen';
          video.poster = `${mediaRoot}${kind}-${stage.id}.jpg?v=${stage.mediaRevision || 'person-2'}`;
          video.setAttribute('aria-label',`${i === 0 ? '现场' : '屏幕'}：${stage.label}`);
          const loaded = waitFor(video,'loadedmetadata',signal);
          video.src = urls[i]; video.load(); return loaded;
        });
        if (!(await Promise.all(loads)).every(Boolean) || token !== selection) return false;
        if (localTime > 0) {
          const seeks = videos.map(video => {
            const sought = waitFor(video,'seeked',signal);
            video.currentTime = Math.min(localTime, video.duration - .001); return sought;
          });
          if (!(await Promise.all(seeks)).every(Boolean) || token !== selection) return false;
        }
        desiredTime = null; renderTimeline(); return true;
      } catch (error) {
        if (!signal.aborted) { pause(); status.textContent = '素材加载失败，请刷新重试。'; }
        return false;
      }
    })();
    measureTimeline(); if (resume) void play();
  }
  function seekGlobal(time, resume) {
    time = Math.min(clamp(time), total - .001);
    const index = locate(time); selectStage(index,resume,time-starts[index]);
  }
  function beginScrub() {
    if (scrubbing) return;
    resumeScrub = playing || pending; pause(); scrubbing = true; ruler.classList.add('scrubbing');
  }
  function previewScrub(left) {
    ruler.scrollLeft = Math.max(0, Math.min(total*pixelsPerSecond,left));
    const time = clamp(ruler.scrollLeft/pixelsPerSecond); highlight(locate(time)); showTime(time);
  }
  function endScrub() {
    if (!scrubbing) return;
    clearTimeout(wheelTimer); const time = ruler.scrollLeft/pixelsPerSecond;
    scrubbing = false; ruler.classList.remove('scrubbing'); seekGlobal(time,resumeScrub);
  }
  ruler.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    clearTimeout(wheelTimer);
    drag = {id:event.pointerId,x:event.clientX,y:event.clientY,left:ruler.scrollLeft,moved:false};
  });
  ruler.addEventListener('pointermove', event => {
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX-drag.x, dy = event.clientY-drag.y;
    if (!drag.moved && (Math.abs(dx)<4 || Math.abs(dx)<Math.abs(dy))) return;
    if (!drag.moved) { drag.moved = true; beginScrub(); ruler.setPointerCapture(event.pointerId); }
    event.preventDefault(); previewScrub(drag.left-dx);
  });
  function finishDrag(event) {
    if (!drag || drag.id !== event.pointerId) return;
    const moved = drag.moved; drag = null;
    if (moved) {
      suppressClick = true; setTimeout(() => { suppressClick = false; },0); endScrub();
      if (ruler.hasPointerCapture(event.pointerId)) ruler.releasePointerCapture(event.pointerId);
    } else if (scrubbing) endScrub();
  }
  ['pointerup','pointercancel','lostpointercapture'].forEach(event => ruler.addEventListener(event,finishDrag));
  window.addEventListener('pointerup',finishDrag);
  ruler.addEventListener('wheel', event => {
    if (event.ctrlKey) return;
    event.preventDefault(); beginScrub();
    const delta = Math.abs(event.deltaX)>Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    const factor = event.deltaMode===1 ? 16 : event.deltaMode===2 ? ruler.clientWidth : 1;
    previewScrub(ruler.scrollLeft+delta*factor);
    clearTimeout(wheelTimer); wheelTimer = setTimeout(endScrub,160);
  },{passive:false});
  buttons.forEach((button,i) => {
    button.addEventListener('click', event => {
      if (suppressClick) return;
      const resume = playing || pending || (scrubbing && resumeScrub);
      if (scrubbing) { clearTimeout(wheelTimer); scrubbing = false; ruler.classList.remove('scrubbing'); }
      const rect = button.getBoundingClientRect();
      const offset = event.detail && event.clientY>rect.bottom-24 ? Math.max(0,event.clientX-rect.left)/pixelsPerSecond : 0;
      selectStage(i,resume,offset);
    });
    button.addEventListener('keydown', event => {
      const index = {ArrowLeft:Math.max(0,i-1),ArrowRight:Math.min(stages.length-1,i+1),Home:0,End:stages.length-1}[event.key];
      if (index===undefined) return;
      event.preventDefault(); selectStage(index,playing || pending); buttons[index].focus({preventScroll:true});
    });
  });
  playhead.setAttribute('role','slider'); playhead.tabIndex = 0; playhead.removeAttribute('aria-hidden');
  playhead.setAttribute('aria-label','体验播放位置'); playhead.setAttribute('aria-valuemin','0'); playhead.setAttribute('aria-valuemax',String(total));
  playhead.addEventListener('keydown', event => {
    const delta = event.shiftKey ? 5 : 1;
    const time = {ArrowLeft:globalTime()-delta,ArrowRight:globalTime()+delta,Home:0,End:total}[event.key];
    if (time===undefined) return;
    event.preventDefault(); seekGlobal(time,playing || pending);
  });
  ['timeupdate','seeked'].forEach(event => screen.addEventListener(event,renderTimeline));
  new ResizeObserver(measureTimeline).observe(ruler);
  playButton.addEventListener('click', () => playing || pending ? pause() : void play());
  document.querySelector('#next-stage').addEventListener('click', () => selectStage((current+1)%stages.length,playing || pending));
  screen.addEventListener('ended', () => {
    if (!playing || scrubbing) return;
    if (current<stages.length-1) selectStage(current+1,true);
    else { finished = true; pause(); renderTimeline(); }
  });
  const viewer = document.querySelector('.experience-viewer'), expanded = viewer.querySelector('video');
  viewer.querySelector('button').addEventListener('click', () => viewer.close());
  viewer.addEventListener('close', () => expanded.pause());
  document.querySelectorAll('[data-expand]').forEach(button => button.addEventListener('click', () => {
    const video = document.getElementById(button.dataset.expand); pause();
    expanded.src = video.currentSrc; expanded.poster = video.poster; expanded.currentTime = video.currentTime;
    setText('viewer-title',video.getAttribute('aria-label')); viewer.showModal();
  }));
  document.addEventListener('visibilitychange', () => { if (document.hidden) { resumeScrub = false; pause(); } });
  selectStage(current);
})();
