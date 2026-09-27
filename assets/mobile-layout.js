(() => {
  const mobile = matchMedia('(max-width: 600px)');
  const panels = [];
  function fold(nodes, label) {
    const panel = document.createElement('details');
    panel.className = 'mobile-fold';
    const summary = document.createElement('summary');
    summary.textContent = label;
    nodes[0].before(panel);
    panel.append(summary, ...nodes);
    panel.open = !mobile.matches;
    panels.push(panel);
  }
  window.HackerRivalsMobile = {
    setup() {
      fold([...document.querySelectorAll('.event-format-grid, .qualification-note')], 'How it works & qualifying');
      document.querySelectorAll('.involve-card').forEach(card => {
        fold([...card.querySelectorAll('h3, p, a')], card.querySelector('h3').textContent);
      });
      fold([document.querySelector('.timeline')], 'Explore the 8 event stages');
      fold([document.getElementById('faq-list')], 'Browse all questions');
      if (mobile.matches) document.querySelectorAll('.faq-item').forEach(item => item.open = false);
      function reveal() {
        const target = document.getElementById(location.hash.slice(1));
        const panel = target?.closest('.mobile-fold') || target?.querySelector('.mobile-fold');
        if (panel) {
          panel.open = true;
          target.scrollIntoView({ block: 'start' });
        }
      }
      window.addEventListener('hashchange', reveal);
      document.addEventListener('click', event => {
        if (event.target.closest('[data-faq-link]')) reveal();
      });
      reveal();
      mobile.addEventListener('change', () => panels.forEach(panel => panel.open = !mobile.matches));
    }
  };
})();

