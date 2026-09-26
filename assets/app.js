(() => {
  const CONFIG_FILE = 'site-config.txt';

  function parseConfig(text) {
    const data = {
      settings: {},
      links: {},
      cities: [],
      leaderboard: [],
      faq: [],
      rules: [],
      conduct: [],
      sponsors: []
    };

    let section = null;
    let current = null;

    text.split(/\r?\n/).forEach(raw => {
      const line = raw.trim();
      if (!line || line.startsWith('#')) return;

      const sectionMatch = line.match(/^\[([^\]]+)\]$/);
      if (sectionMatch) {
        const label = sectionMatch[1].trim();
        const type = label.split(/\s+/)[0].toLowerCase();
        section = type;
        current = null;

        if (['city', 'team', 'faq', 'rule', 'conduct', 'sponsor'].includes(type)) {
          current = {};
          if (type === 'city') data.cities.push(current);
          if (type === 'team') data.leaderboard.push(current);
          if (type === 'faq') data.faq.push(current);
          if (type === 'rule') data.rules.push(current);
          if (type === 'conduct') data.conduct.push(current);
          if (type === 'sponsor') data.sponsors.push(current);
        }
        return;
      }

      const separator = line.indexOf('=');
      if (separator === -1 || !section) return;
      const key = line.slice(0, separator).trim();
      const value = line.slice(separator + 1).trim();

      if (section === 'settings') data.settings[key] = value;
      else if (section === 'links') data.links[key] = value;
      else if (current) current[key] = value;
    });

    data.cities = data.cities.filter(city => (city.city || '').trim());

    data.leaderboard = data.leaderboard
      .filter(team => (team.name || '').trim())
      .map((team, index) => ({
        rank: Number(team.rank || index + 1),
        team: team.name,
        members: (team.members || '').split('|').map(v => v.trim()).filter(Boolean),
        points: Number(String(team.points || '0').replace(/,/g, '')) || 0,
        cash: team.cash || '—',
        logo: team.logo || (index < 5 ? `content/team-logos/${String(index + 1).padStart(2, '0')}-team-logo.png` : 'content/team-logos/default-team.svg')
      }));

    data.faq = data.faq
      .filter(item => (item.question || '').trim())
      .map(item => ({ q: item.question || '', a: item.answer || '', anchor: /^[a-z0-9-]+$/.test(item.anchor || '') ? item.anchor : '' }));

    data.rules = data.rules
      .filter(item => (item.title || '').trim())
      .map(item => [item.title || '', item.text || '']);

    data.conduct = data.conduct
      .filter(item => (item.title || '').trim())
      .map(item => [item.title || '', item.text || '']);

    data.sponsors = data.sponsors
      .filter(item => (item.name || '').trim() && (item.image || '').trim())
      .map(item => ({
        name: item.name,
        image: item.image,
        url: item.url || '',
        theme: (item.theme || 'dark').toLowerCase() === 'light' ? 'light' : 'dark'
      }));

    return data;
  }

  function versioned(path, version) {
    if (!path) return path;
    const joiner = path.includes('?') ? '&' : '?';
    return `${path}${joiner}v=${encodeURIComponent(version || '1')}`;
  }

  async function loadData() {
    const response = await fetch(`${CONFIG_FILE}?t=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Unable to load ${CONFIG_FILE}`);
    return parseConfig(await response.text());
  }

  function setupNavigation() {
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.main-nav');
    toggle?.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle?.setAttribute('aria-expanded', 'false');
    }));
  }

  function setupModals() {
    document.querySelectorAll('[data-modal]').forEach(btn => {
      btn.addEventListener('click', () => document.getElementById(btn.dataset.modal)?.showModal());
    });
    document.querySelectorAll('.modal').forEach(modal => {
      modal.querySelector('.modal-close')?.addEventListener('click', () => modal.close());
      modal.addEventListener('click', e => { if (e.target === modal) modal.close(); });
    });
  }

  function setLink(el, url) {
    if (!el) return;
    if (url) {
      el.href = url;
      el.classList.remove('disabled-link');
      el.removeAttribute('aria-disabled');
      return;
    }
    el.href = '#';
    el.classList.add('disabled-link');
    el.setAttribute('aria-disabled', 'true');
    el.addEventListener('click', e => e.preventDefault());
  }

  function render(data) {
    const assetVersion = data.settings.asset_version || '1';

    document.querySelectorAll('[data-link]').forEach(el => {
      const key = el.dataset.link;
      setLink(el, data.links[key]);
    });



    window.HackerRivalsUI.renderLeaderboard(data.leaderboard, assetVersion);

    const note = document.getElementById('leaderboard-note');
    if (note) note.textContent = data.settings.leaderboard_note || '';

    const statusLabel = { compete: 'Compete', host: 'Host', celebrate: 'Celebrate' };
    const cityGrid = document.getElementById('city-grid');
    const cityCards = data.cities.map(city => {
      const status = ['compete', 'host', 'celebrate'].includes((city.status || '').toLowerCase()) ? city.status.toLowerCase() : 'host';
      const cityUrl = city.url || data.links.host || '';
      const linkClass = cityUrl ? '' : ' disabled-link';
      return `
        <article class="city-card">
          <img src="${versioned(city.image, assetVersion)}" alt="${city.city} skyline">
          <div class="city-overlay"></div>
          <div class="city-info"><h3>${city.city}</h3><p>${city.country}</p><a class="city-action ${status}${linkClass}" href="${cityUrl || '#'}" ${cityUrl ? '' : 'aria-disabled="true"'}>${statusLabel[status]} →</a></div>
        </article>`;
    }).join('');
    const hostUrl = data.links.host || '';
    cityGrid.innerHTML = cityCards + `
      <article class="city-card other-city">
        <div class="globe">◎</div><h3>Your city next?</h3><p>Bring HackerRivals to another city.</p><a class="city-action host${hostUrl ? '' : ' disabled-link'}" href="${hostUrl || '#'}" ${hostUrl ? '' : 'aria-disabled="true"'}>Host →</a>
      </article>`;
    cityGrid.querySelectorAll('.disabled-link').forEach(el => el.addEventListener('click', e => e.preventDefault()));

    const sponsorRow = document.getElementById('sponsor-row');
    if (sponsorRow) {
      sponsorRow.innerHTML = data.sponsors.length
        ? data.sponsors.map(sponsor => `<a class="sponsor logo-${sponsor.theme}" href="${sponsor.url || '#'}" aria-label="Visit ${sponsor.name}"><img src="${versioned(sponsor.image, assetVersion)}" alt="${sponsor.name}"></a>`).join('')
        : '<p class="empty-state">Add SPONSOR sections to site-config.txt to show past sponsors.</p>';
    }

    const faqList = document.getElementById('faq-list');
    faqList.innerHTML = data.faq.length
      ? data.faq.map((item, i) => `
          <details class="faq-item" id="faq-${item.anchor || (i + 1)}" ${i === 0 ? 'open' : ''}>
            <summary>${item.q}</summary>
            <p>${item.a}</p>
          </details>`).join('')
      : '<p class="empty-state">Add FAQ sections to site-config.txt to show questions here.</p>';

    function revealLinkedFaq(focus = false) {
      const target = document.getElementById(location.hash.slice(1));
      if (!target || !target.matches('details.faq-item')) return;
      target.open = true;
      if (focus) target.querySelector('summary').focus({ preventScroll: true });
      target.scrollIntoView({ block: 'start' });
    }
    document.querySelectorAll('[data-faq-link]').forEach(link => {
      link.addEventListener('click', event => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        if (location.hash !== link.hash) history.pushState(null, '', link.hash);
        revealLinkedFaq(true);
      });
    });
    window.addEventListener('hashchange', () => revealLinkedFaq());
    revealLinkedFaq();
    window.HackerRivalsUI.updateLinks();

    const renderSections = (items, emptyMessage) => items.length
      ? items.map(([title, copy]) => `<section class="modal-rule"><h3>${title}</h3><p>${copy}</p></section>`).join('')
      : `<p class="empty-state">${emptyMessage}</p>`;

    document.getElementById('rules-content').innerHTML = renderSections(data.rules, 'Add RULE sections to site-config.txt.');
    document.getElementById('conduct-content').innerHTML = renderSections(data.conduct, 'Add CONDUCT sections to site-config.txt.');
  }

  setupNavigation();
  setupModals();

  loadData()
    .then(render)
    .catch(error => {
      console.error(error);
      const banner = document.createElement('div');
      banner.className = 'config-error';
      banner.textContent = 'Website content could not be loaded. Make sure site-config.txt is present and the site is being viewed through GitHub Pages or another web server.';
      document.body.prepend(banner);
    });
})();
