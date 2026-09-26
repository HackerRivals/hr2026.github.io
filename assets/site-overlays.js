(() => {
  const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const formDialog = document.getElementById('form-modal');
  document.querySelectorAll('[data-embed-form]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const url = new URL(link.href, location.href);
      const match = url.pathname.match(/^\/r\/([A-Za-z0-9]+)$/);
      if (url.hostname !== 'tally.so' || !match) return;
      event.preventDefault();
      const title = link.closest('article').querySelector('h3').textContent;
      document.getElementById('form-title').textContent = title;
      const frame = document.getElementById('tally-frame');
      frame.title = title + ' form';
      frame.src = `https://tally.so/embed/${match[1]}?alignLeft=1&hideTitle=1`;
      document.getElementById('form-external-link').href = url.href;
      formDialog.showModal();
    });
  });
  formDialog.addEventListener('close', () => document.getElementById('tally-frame').src = 'about:blank');

  window.HackerRivalsUI = {
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
