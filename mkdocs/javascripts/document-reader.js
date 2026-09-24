(() => {
  const root = document.querySelector('[data-pdf]');
  if (!root) return;
  const assets = new URL('../vendor/pdfjs/', document.currentScript.src);
  const status = root.querySelector('[role="status"]');
  const pages = root.querySelector('.document-gallery__pages');

  async function start() {
    const pdfjs = await import(new URL('pdf.min.mjs', assets));
    pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdf.worker.min.mjs', assets).href;
    const pdf = await pdfjs.getDocument({
      url: new URL(root.dataset.pdf, location.href).href,
      cMapUrl: new URL('cmaps/', assets).href,
      cMapPacked: true,
      standardFontDataUrl: new URL('standard_fonts/', assets).href,
      wasmUrl: new URL('wasm/', assets).href,
    }).promise;
    const first = await pdf.getPage(1);
    const initial = first.getViewport({ scale: 1 });
    const records = [];
    const queue = [];
    let running = 0;

    function clear(record) {
      if (record.canvas) {
        record.canvas.width = record.canvas.height = 0;
        record.canvas.remove();
        record.canvas = null;
      }
      record.placeholder.hidden = false;
    }

    async function render(record) {
      const page = await pdf.getPage(record.number);
      const base = page.getViewport({ scale: 1 });
      record.paper.style.aspectRatio = `${base.width} / ${base.height}`;
      const width = record.paper.clientWidth;
      const density = Math.min(window.devicePixelRatio || 1, 2);
      const viewport = page.getViewport({ scale: width * density / base.width });
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      canvas.setAttribute('aria-hidden', 'true');
      await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
      if (!record.text.textContent) {
        const content = await page.getTextContent();
        record.text.textContent = content.items.map(item => item.str + (item.hasEOL ? '\n' : ' ')).join('');
      }
      if (record.near) {
        record.paper.append(canvas);
        record.canvas = canvas;
        record.placeholder.hidden = true;
      } else {
        canvas.width = canvas.height = 0;
      }
      page.cleanup();
    }

    function pump() {
      while (running < 2 && queue.length) {
        const record = queue.shift();
        record.queued = false;
        if (!record.near || record.canvas || record.loading) continue;
        record.loading = true;
        running++;
        render(record).catch(error => {
          record.placeholder.textContent = '此页暂未加载，请刷新页面重试';
          console.error('Document page rendering failed', error);
        }).finally(() => {
          record.loading = false;
          running--;
          pump();
        });
      }
    }

    function schedule(record) {
      if (!record.queued && !record.canvas && !record.loading) {
        record.queued = true;
        queue.push(record);
      }
      pump();
    }

    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const record = records[Number(entry.target.dataset.page) - 1];
        record.near = entry.isIntersecting;
        if (record.near) schedule(record);
        else if (!record.loading) clear(record);
      }
    }, { root: pages, rootMargin: '700px 0px' });

    for (let number = 1; number <= pdf.numPages; number++) {
      const figure = document.createElement('figure');
      figure.className = 'document-gallery__page';
      figure.dataset.page = number;
      figure.setAttribute('aria-label', `第 ${number} 页`);
      const paper = document.createElement('div');
      paper.className = 'document-gallery__paper';
      paper.style.aspectRatio = `${initial.width} / ${initial.height}`;
      const placeholder = document.createElement('span');
      placeholder.className = 'document-gallery__placeholder';
      placeholder.textContent = '正在加载…';
      paper.append(placeholder);
      const text = document.createElement('div');
      text.className = 'document-gallery__text';
      figure.append(paper, text);
      pages.append(figure);
      records.push({number, paper, placeholder, text, near: false, canvas: null});
      observer.observe(figure);
    }
    status.hidden = true;
    let resizeTimer;
    let previousWidth = pages.clientWidth;
    new ResizeObserver(() => {
      if (pages.clientWidth === previousWidth) return;
      previousWidth = pages.clientWidth;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        records.filter(record => record.near && !record.loading).forEach(record => {
          clear(record);
          schedule(record);
        });
      }, 200);
    }).observe(pages);
  }
  start().catch(error => {
    status.textContent = '文档暂时无法加载，请刷新页面重试。';
    console.error('Document loading failed', error);
  });
})();
