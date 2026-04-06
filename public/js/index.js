// ── State ─────────────────────────────────────────────────────
let staffList = [];
let onDutyIds = [];
let selectedTags = new Set();
let currentDate = todayStr();

function getShop() { return document.getElementById('shop-select').value; }

// ── Init ──────────────────────────────────────────────────────
async function init() {
  await loadStores();
  await loadStaff();
  updateDateDisplay();
  await loadAttendance();
}

// ── Data loading ──────────────────────────────────────────────
async function loadStores() {
  const { data, error } = await db.from('stores').select('*').order('id');
  if (error) { console.error(error); return; }
  const sel = document.getElementById('shop-select');
  sel.innerHTML = data.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
}

async function loadStaff() {
  const { data, error } = await db.from('staff').select('*').order('id');
  if (error) { console.error(error); return; }
  staffList = data;
}

async function loadAttendance() {
  const storeId = getShop();
  if (!storeId) return;
  const { data, error } = await db.from('attendance')
    .select('staff_id')
    .eq('store_id', storeId)
    .eq('date', currentDate);
  if (error) { console.error(error); return; }
  onDutyIds = (data || []).map(r => r.staff_id);
  render();
}

// ── Tag filter ────────────────────────────────────────────────
function renderTagFilter(dutyStaff) {
  const allTags = [...new Set(dutyStaff.flatMap(s => s.tags || []))].sort();
  const bar = document.getElementById('tag-filter');
  bar.innerHTML = allTags.map(t =>
    `<button class="filter-tag ${selectedTags.has(t) ? 'active' : ''}" onclick="toggleTagFilter('${t}')">${t}</button>`
  ).join('');
}
function toggleTagFilter(tag) {
  if (selectedTags.has(tag)) selectedTags.delete(tag); else selectedTags.add(tag);
  render();
}

// ── Render ────────────────────────────────────────────────────
function render() {
  const storeId = parseInt(getShop());
  const dutyStaff = onDutyIds.map(id => staffList.find(x => x.id === id))
    .filter(s => s && s.store_id === storeId);
  renderTagFilter(dutyStaff);
  const grid = document.getElementById('guest-grid');

  if (!dutyStaff.length) {
    grid.innerHTML = '<div class="col-12"><p class="no-staff">出勤スタッフなし</p></div>';
    return;
  }

  const filtered = selectedTags.size
    ? dutyStaff.filter(s => [...selectedTags].every(t => (s.tags || []).includes(t)))
    : dutyStaff;
  if (!filtered.length) {
    grid.innerHTML = '<div class="col-12"><p class="no-staff">該当スタッフなし</p></div>';
    return;
  }

  grid.innerHTML = filtered.map(s => `
    <div class="col-6 col-md-4 col-lg-3">
      <div class="staff-card">
        <div class="img-wrap ${s.profile_url ? 'has-url' : ''}"
             ${s.profile_url ? `onclick="window.open('${s.profile_url}','_blank')"` : ''}>
          <img src="${s.img_url || ''}" alt="${s.name}" onerror="this.removeAttribute('src')">
        </div>
        <div class="s-name">${s.name}</div>
        <div class="s-stats">
          ${s.age ? `<span>${s.age}歳</span>` : ''}
          <span>${s.height}cm</span>
          <span>B${s.bust} / W${s.waist} / H${s.hip}</span>
        </div>
        <div class="s-tags">${tagsHtml(s)}</div>
      </div>
    </div>`).join('');
}

// ── Date ──────────────────────────────────────────────────────
function updateDateDisplay() {
  document.getElementById('date-display').textContent = fmtDate(currentDate);
  document.getElementById('date-select').value = currentDate;
}
function shiftDate(delta) {
  currentDate = offsetDate(currentDate, delta);
  selectedTags = new Set();
  updateDateDisplay();
  loadAttendance();
}
function openDatePicker() {
  const el = document.getElementById('date-select');
  el.style.pointerEvents = 'auto';
  el.showPicker ? el.showPicker() : el.click();
  el.style.pointerEvents = 'none';
}
function onDatePicked() {
  currentDate = document.getElementById('date-select').value;
  selectedTags = new Set();
  updateDateDisplay();
  loadAttendance();
}

init();
