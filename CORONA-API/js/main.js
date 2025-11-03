const API = 'https://api.rootnet.in/covid19-in/stats/history';
let timeline = [];
let selectedIndex = null;

const el = {
  timelineList: document.getElementById('timelineList'),
  timelineCount: document.getElementById('timelineCount'),
  selectedDate: document.getElementById('selectedDate'),
  globalStats: document.getElementById('globalStats'),
  statesContainer: document.getElementById('statesContainer'),
  reload: document.getElementById('reload'),
  filterState: document.getElementById('filterState'),
  sort: document.getElementById('sort'),
  showFavorites: document.getElementById('showFavorites'),
  exportCsv: document.getElementById('exportCsv'),
};

function fmt(n){
  return n === null || n === undefined ? '-' : n.toLocaleString();
}

function safeGet(obj, path, def = null){
  try {
    return path.split('.').reduce((a, k) => a?.[k], obj) ?? def;
  } catch {
    return def;
  }
}

async function loadTimeline(){
  el.timelineList.innerHTML = '<div class="no-data">Loading timeline...</div>';
  el.statesContainer.innerHTML = '<div class="no-data">Select a date from timeline.</div>';
  el.timelineCount.textContent = '--';
  el.selectedDate.textContent = '--';
  el.globalStats.innerHTML = '';

  try {
    const res = await fetch(API);
    if(!res.ok) throw new Error('Network error ' + res.status);
    const data = await res.json();
    timeline = safeGet(data, 'data') || [];
    timeline.sort((a,b) => new Date(a.day) - new Date(b.day));

    el.timelineCount.textContent = timeline.length;

    if(timeline.length === 0) {
      el.timelineList.innerHTML = '<div class="no-data">No timeline data found.</div>';
      return;
    }

    el.timelineList.innerHTML = '';
    timeline.forEach((item, idx) => {
      const day = item.day || 'Unknown';
      const totalConfirmed = safeGet(item, 'summary.total', '-');
      const div = document.createElement('div');
      div.textContent = `${day} - Confirmed: ${fmt(totalConfirmed)}`;
      div.setAttribute('role', 'option');
      div.addEventListener('click', () => selectDate(idx));
      el.timelineList.appendChild(div);
    });

    selectDate(timeline.length - 1);
  } catch(e) {
    el.timelineList.innerHTML = `<div class="no-data">Error loading timeline: ${e.message}</div>`;
  }
}

function selectDate(idx){
  if(idx < 0 || idx >= timeline.length) return;
  selectedIndex = idx;

  [...el.timelineList.children].forEach((div,i) => {
    div.classList.toggle('selected', i === idx);
  });

  const item = timeline[idx];
  const day = item.day || 'Unknown';
  el.selectedDate.textContent = day;

  // Show global stats
  const sum = item.summary || {};
  el.globalStats.innerHTML = `
    <div class="stat">Total Confirmed: <strong>${fmt(sum.total)}</strong></div>
    <div class="stat">Total Recovered: <strong>${fmt(sum.discharged)}</strong></div>
    <div class="stat">Deaths: <strong>${fmt(sum.deaths)}</strong></div>
  `;

  // Show states
  const regions = item.regional || [];
  renderStates(regions);
}

function renderStates(regions){
  if(!regions.length) {
    el.statesContainer.innerHTML = '<div class="no-data">No regional data for this date.</div>';
    return;
  }

  const filter = el.filterState.value.toLowerCase();
  const sortMode = el.sort.value;

  let list = regions.map(r => ({
    state: r.loc,
    confirmed: r.totalConfirmed,
    recovered: r.discharged,
    deaths: r.deaths,
  }));

  if(filter) {
    list = list.filter(s => s.state.toLowerCase().includes(filter));
  }

  if(sortMode === 'confirmed-desc') {
    list.sort((a,b) => b.confirmed - a.confirmed);
  } else if(sortMode === 'confirmed-asc') {
    list.sort((a,b) => a.confirmed - b.confirmed);
  } else {
    list.sort((a,b) => a.state.localeCompare(b.state));
  }

  if(list.length === 0){
    el.statesContainer.innerHTML = '<div class="no-data">No states match your filter.</div>';
    return;
  }

  // Favorites from localStorage
  const favorites = JSON.parse(localStorage.getItem('covid_favs') || '[]');

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  thead.innerHTML = '<tr><th>State</th><th>Confirmed</th><th>Recovered</th><th>Deaths</th><th>Favorite</th></tr>';
  table.appendChild(thead);

  const tbody = document.createElement('tbody');

  list.forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(s.state)}</td>
      <td>${fmt(s.confirmed)}</td>
      <td>${fmt(s.recovered)}</td>
      <td>${fmt(s.deaths)}</td>
      <td></td>
    `;
    const favBtn = document.createElement('button');
    if(favorites.includes(s.state)){
      favBtn.textContent = 'Saved';
      favBtn.className = 'saved';
      favBtn.title = 'Remove from favorites';
    } else {
      favBtn.textContent = 'Save';
      favBtn.className = '';
      favBtn.title = 'Add to favorites';
    }
    favBtn.onclick = (e) => {
      e.stopPropagation();
      toggleFavorite(s.state);
      renderStates(regions);
    };
    tr.children[4].appendChild(favBtn);
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  el.statesContainer.innerHTML = '';
  el.statesContainer.appendChild(table);
}

function toggleFavorite(state){
  const favs = JSON.parse(localStorage.getItem('covid_favs') || '[]');
  const idx = favs.indexOf(state);
  if(idx >= 0){
    favs.splice(idx, 1);
  } else {
    favs.push(state);
  }
  localStorage.setItem('covid_favs', JSON.stringify(favs));
}

function showFavorites(){
  const favs = JSON.parse(localStorage.getItem('covid_favs') || '[]');
  if(favs.length === 0) {
    alert('No favorites saved yet.');
  } else {
    alert('Favorite States:\n' + favs.join('\n'));
  }
}

function escapeHtml(text){
  return text.replace(/[&<>"']/g, function(m) {
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];
  });
}

function exportFavoritesCSV(){
  const favs = JSON.parse(localStorage.getItem('covid_favs') || '[]');
  if(favs.length === 0) {
    alert('No favorites to export.');
    return;
  }
  const header = ['State'];
  const csvRows = [header.join(',')];
  favs.forEach(fav => {
    csvRows.push(`"${fav.replace(/"/g, '""')}"`);
  });
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], {type: 'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'covid-favorites.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

el.reload.addEventListener('click', () => loadTimeline());
el.filterState.addEventListener('input', () => {
  if(selectedIndex !== null){
    renderStates(timeline[selectedIndex].regional || []);
  }
});
el.sort.addEventListener('change', () => {
  if(selectedIndex !== null){
    renderStates(timeline[selectedIndex].regional || []);
  }
});
el.showFavorites.addEventListener('click', showFavorites);
el.exportCsv.addEventListener('click', exportFavoritesCSV);

loadTimeline();