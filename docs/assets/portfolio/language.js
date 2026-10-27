(() => {
  const language = document.documentElement.lang.startsWith('zh') ? 'zh' : 'en';
  window.portfolioText = (chinese, english) => language === 'zh' ? chinese : english;
  // Separate static pages also work without JavaScript. Remember explicit choices.
  try {
    if (language === 'en' && localStorage.getItem('portfolio-language') === 'zh') {
      location.replace('/cn' + location.pathname + location.search + location.hash);
    }
  } catch (_) { /* Storage can be unavailable in private browsing. */ }
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-language]').forEach(link => {
      link.href += location.hash;
      link.addEventListener('click', () => {
        link.hash = location.hash;
        try { localStorage.setItem('portfolio-language', link.dataset.language); } catch (_) {}
      });
    });
  });
})();
