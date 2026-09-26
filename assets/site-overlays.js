(() => {
  const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const formDialog = document.getElementById('form-modal');
  function tallyForm(url) {
    return /^(www\.)?tally\.so$/.test(url.hostname) && url.pathname.match(/^\/(?:r|embed)\/([A-Za-z0-9]+)\/?$/);
  }
  function updateLinks() {
    document.querySelectorAll('a[href]').forEach(link => {
      const url = new URL(link.href, location.href);
      if (tallyForm(url)) {
        link.removeAttribute('target');
        link.setAttribute('aria-haspopup', 'dialog');
      } else if (/^https?:$/.test(url.protocol) && url.origin !== location.origin) {
        link.target = '_blank';
        link.relList.add('noopener', 'noreferrer');
      }
    });
  }
  updateLinks();
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link) return;
    const url = new URL(link.href, location.href);
    const match = tallyForm(url);
    if (!match) return;
    event.preventDefault();
    const title = link.textContent.trim().replace(/[→↗]/g, '').trim() || 'HackerRivals form';
    document.getElementById('form-title').textContent = title;
    const frame = document.getElementById('tally-frame');
    frame.title = title + ' form';
    const embed = new URL(url);
    embed.pathname = '/embed/' + match[1];
    embed.searchParams.set('alignLeft', '1');
    embed.searchParams.set('hideTitle', '1');
    frame.src = embed.href;
    formDialog.showModal();
  });
  document.getElementById('form-reload').addEventListener('click', () => {
    const frame = document.getElementById('tally-frame');
    frame.src = frame.src;
  });
  formDialog.addEventListener('close', () => document.getElementById('tally-frame').src = 'about:blank');

  window.HackerRivalsUI = {
    updateLinks,
    renderLeaderboard(teams, version) {
      const search = document.getElementById('team-search');
      const previous = document.getElementById('teams-previous');
      const next = document.getElementById('teams-next');
      const status = document.getElementById('teams-page-status');
      let page = 0;
      const ordered = [...teams].sort((a,b) => a.rank - b.rank);
      const row = team => `<tr><td class="rank">${team.rank}</td><td><div class="team-cell"><img class="team-logo" src="${escapeHtml(team.logo)}?v=${encodeURIComponent(version)}" alt=""><strong>${escapeHtml(team.team)}</strong></div></td><td>${escapeHtml(team.members.join(' · '))}</td><td class="points">${team.points.toLocaleString()}</td><td class="cash">${escapeHtml(team.cash)}</td></tr>`;
      document.getElementById('leaderboard-rows').innerHTML = ordered.length ? ordered.slice(0,5).map(row).join('') : '<tr><td colspan="5">No teams yet.</td></tr>';
      function update() {
        const query = search.value.trim().toLocaleLowerCase();
        const filtered = ordered.filter(team => team.team.toLocaleLowerCase().includes(query));
        const pages = Math.max(1, Math.ceil(filtered.length / 10));
        page = Math.max(0, Math.min(page, pages - 1));
        const start = page * 10;
        document.getElementById('complete-leaderboard-rows').innerHTML = filtered.length ? filtered.slice(start,start+10).map(row).join('') : '<tr><td colspan="5" class="empty-state">No teams found. Try another team name.</td></tr>';
        status.textContent = filtered.length ? `${start+1}–${Math.min(start+10,filtered.length)} of ${filtered.length} teams · Page ${page+1} of ${pages}` : '0 teams';
        previous.disabled = page === 0;
        next.disabled = page >= pages - 1;
      }
      search.addEventListener('input', () => { page=0; update(); });
      previous.addEventListener('click', () => { page--; update(); });
      next.addEventListener('click', () => { page++; update(); });
      update();
    }
  };
})();
