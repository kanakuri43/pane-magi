// ── State ─────────────────────────────────────────────────────
let staffList = [];
let storeList = [];
let tagList   = [];
let onDutyIds = new Set();
let currentDate = todayStr();
let editingStaffId = null;   // null = new, number = editing
let editingStoreId = null;   // null = new, number = editing
let editingTagId   = null;   // null = new, number = editing

function getShop() { return document.getElementById('shop-select').value; }

// ── Init ──────────────────────────────────────────────────────
async function init() {
  const { data: { session } } = await db.auth.getSession();
  if (!session) {
    const overlay = document.getElementById('login-overlay');
    overlay.style.display = 'flex';
    return;
  }
  await Promise.all([loadStores(), loadStaff(), loadTags()]);
  updateDateDisplay();
  await loadAttendance();
}

// ── Login ─────────────────────────────────────────────────────
async function doLogin() {
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  document.getElementById('login-error').textContent = '';

  const { error } = await db.auth.signInWithPassword({ email, password });
  if (error) {
    document.getElementById('login-error').textContent = 'メールアドレスまたはパスワードが違います';
    return;
  }
  document.getElementById('login-overlay').style.display = 'none';
  await Promise.all([loadStores(), loadStaff(), loadTags()]);
  updateDateDisplay();
  await loadAttendance();
}

// ── Tab ───────────────────────────────────────────────────────
function showTab(tab) {
  ['attendance', 'staff', 'store', 'tag'].forEach(t => {
    document.getElementById(`tab-${t}`).style.display = t === tab ? '' : 'none';
    document.getElementById(`tab-btn-${t}`).classList.toggle('active', t === tab);
  });
  if (tab === 'staff') renderStaffMgmt();
  if (tab === 'store') renderStoreMgmt();
  if (tab === 'tag')   renderTagMgmt();
}

// ── Data loading ──────────────────────────────────────────────
async function loadStores() {
  const { data, error } = await db.from('stores').select('*').order('id');
  if (error) { console.error(error); return; }
  storeList = data;
  const sel = document.getElementById('shop-select');
  sel.innerHTML = data.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
}

async function loadStaff() {
  const { data, error } = await db.from('staff').select('*').order('id');
  if (error) { console.error(error); return; }
  staffList = data;
}

async function loadTags() {
  const { data, error } = await db.from('tags').select('*').order('name');
  if (error) { console.error(error); return; }
  tagList = data;
}

async function loadAttendance() {
  const storeId = getShop();
  if (!storeId) return;
  const { data, error } = await db.from('attendance')
    .select('staff_id')
    .eq('store_id', storeId)
    .eq('date', currentDate);
  if (error) { console.error(error); return; }
  onDutyIds = new Set((data || []).map(r => r.staff_id));
  render();
}

// ── Attendance render ──────────────────────────────────────────
function render() {
  const storeId = parseInt(getShop());
  const list = document.getElementById('admin-list');
  list.innerHTML = staffList.filter(s => s.store_id === storeId).map(s => {
    const sel = onDutyIds.has(s.id);
    return `
    <div class="col-12 col-md-6">
      <div class="staff-row ${sel ? 'selected' : ''}" onclick="toggleStaff(${s.id})">
        <img src="${s.img_url || ''}" alt="${s.name}" onerror="this.removeAttribute('src')">
        <div class="r-info">
          <div class="r-name">${s.name}</div>
          <div class="r-tags">${tagsHtml(s)}</div>
        </div>
        <div class="check">${sel ? '✓' : ''}</div>
      </div>
    </div>`;
  }).join('');
}

function toggleStaff(id) {
  if (onDutyIds.has(id)) onDutyIds.delete(id); else onDutyIds.add(id);
  render();
}

// ── Save attendance ────────────────────────────────────────────
async function saveSchedule() {
  const storeId = parseInt(getShop());
  const { error: delErr } = await db.from('attendance').delete()
    .eq('store_id', storeId)
    .eq('date', currentDate);
  if (delErr) { showToast('エラーが発生しました'); console.error(delErr); return; }

  if (onDutyIds.size > 0) {
    const rows = [...onDutyIds].map(id => ({ store_id: storeId, staff_id: id, date: currentDate }));
    const { error: insErr } = await db.from('attendance').insert(rows);
    if (insErr) { showToast('エラーが発生しました'); console.error(insErr); return; }
  }
  showToast('更新しました');
}

// ── Date ──────────────────────────────────────────────────────
function updateDateDisplay() {
  document.getElementById('date-display').textContent = fmtDate(currentDate);
  document.getElementById('date-select').value = currentDate;
}
function shiftDate(delta) {
  currentDate = offsetDate(currentDate, delta);
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
  updateDateDisplay();
  loadAttendance();
}

// ── Staff management render ────────────────────────────────────
function renderStaffMgmt() {
  const list = document.getElementById('staff-mgmt-list');
  if (staffList.length === 0) {
    list.innerHTML = '<p style="color:var(--muted); font-size:0.88rem;">スタッフが登録されていません</p>';
    return;
  }
  list.innerHTML = staffList.map(s => {
    const spec = [s.age && `${s.age}歳`, s.height && `${s.height}cm`, s.bust && `B${s.bust}`, s.waist && `W${s.waist}`, s.hip && `H${s.hip}`]
      .filter(Boolean).join(' / ');
    const storeName = s.store_id ? (storeList.find(x => x.id === s.store_id)?.name || '') : '';
    return `
    <div class="mgmt-row">
      <img src="${s.img_url || ''}" alt="${s.name}" onerror="this.removeAttribute('src')">
      <div class="r-info">
        <div class="r-name">${s.name}</div>
        ${storeName ? `<div class="r-spec">${storeName}</div>` : ''}
        ${spec ? `<div class="r-spec">${spec}</div>` : ''}
        <div class="r-tags">${tagsHtml(s)}</div>
      </div>
      <div class="mgmt-actions">
        <button class="btn-edit" onclick="openStaffModal(${s.id})">編集</button>
        <button class="btn-del" onclick="deleteStaff(${s.id}, '${s.name.replace(/'/g, "\\'")}')">削除</button>
      </div>
    </div>`;
  }).join('');
}

// ── Staff modal ────────────────────────────────────────────────
function openStaffModal(staffId) {
  editingStaffId = staffId || null;
  document.getElementById('modal-title').textContent = staffId ? 'スタッフ編集' : 'スタッフ登録';
  document.getElementById('modal-save-error').textContent = '';

  const s = staffId ? staffList.find(x => x.id === staffId) : null;
  document.getElementById('m-name').value        = s?.name        || '';
  document.getElementById('m-profile-url').value = s?.profile_url || '';
  document.getElementById('m-age').value         = s?.age         ?? '';
  document.getElementById('m-height').value      = s?.height      ?? 160;
  document.getElementById('m-bust').value        = s?.bust        ?? 80;
  document.getElementById('m-waist').value       = s?.waist       ?? 50;
  document.getElementById('m-hip').value         = s?.hip         ?? 80;
  renderTagCheckboxes(s?.tags || []);
  document.getElementById('m-tag-menu').style.display = 'none';
  document.getElementById('m-tag-dropdown').classList.remove('open');
  document.getElementById('m-photo').value       = '';
  document.getElementById('m-photo-name').textContent = '';
  const preview = document.getElementById('m-photo-preview');
  preview.src = s?.img_url || '';
  if (!s?.img_url) preview.removeAttribute('src');

  // 店舗セレクト
  const storeSelect = document.getElementById('m-store-id');
  storeSelect.innerHTML = '<option value="">（未所属）</option>' +
    storeList.map(st => `<option value="${st.id}" ${s?.store_id === st.id ? 'selected' : ''}>${st.name}</option>`).join('');

  document.getElementById('staff-modal').classList.add('open');
}

function closeStaffModal() {
  document.getElementById('staff-modal').classList.remove('open');
}

function previewPhoto(input) {
  const file = input.files[0];
  if (!file) return;
  document.getElementById('m-photo-name').textContent = file.name;
  const reader = new FileReader();
  reader.onload = e => { document.getElementById('m-photo-preview').src = e.target.result; };
  reader.readAsDataURL(file);
}

async function saveStaff() {
  const name = document.getElementById('m-name').value.trim();
  if (!name) {
    document.getElementById('modal-save-error').textContent = '名前は必須です';
    return;
  }
  document.getElementById('modal-save-error').textContent = '';

  const storeIdVal = document.getElementById('m-store-id').value;
  const payload = {
    name,
    profile_url: document.getElementById('m-profile-url').value.trim() || null,
    age:    parseInt(document.getElementById('m-age').value)    || null,
    height: parseInt(document.getElementById('m-height').value) || null,
    bust:   parseInt(document.getElementById('m-bust').value)   || null,
    waist:  parseInt(document.getElementById('m-waist').value)  || null,
    hip:    parseInt(document.getElementById('m-hip').value)    || null,
    tags:   [...document.querySelectorAll('#m-tag-menu input[type=checkbox]:checked')].map(cb => cb.value),
    store_id: storeIdVal ? parseInt(storeIdVal) : null,
  };

  // Photo upload
  const photoFile = document.getElementById('m-photo').files[0];
  if (photoFile) {
    const ext = photoFile.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await db.storage.from('panels').upload(fileName, photoFile, { upsert: true });
    if (upErr) {
      document.getElementById('modal-save-error').textContent = '写真のアップロードに失敗しました';
      console.error(upErr);
      return;
    }
    const { data: urlData } = db.storage.from('panels').getPublicUrl(fileName);
    payload.img_url = urlData.publicUrl;
  }

  if (editingStaffId) {
    const { error } = await db.from('staff').update(payload).eq('id', editingStaffId);
    if (error) { document.getElementById('modal-save-error').textContent = '保存に失敗しました'; console.error(error); return; }
  } else {
    const { error } = await db.from('staff').insert(payload);
    if (error) { document.getElementById('modal-save-error').textContent = '保存に失敗しました'; console.error(error); return; }
  }

  await loadStaff();
  renderStaffMgmt();
  render(); // refresh attendance list too
  closeStaffModal();
  showToast(editingStaffId ? '更新しました' : '登録しました');
}

async function deleteStaff(id, name) {
  if (!confirm(`「${name}」を削除しますか？\n関連する出勤データも削除されます。`)) return;
  const { error } = await db.from('staff').delete().eq('id', id);
  if (error) { showToast('削除に失敗しました'); console.error(error); return; }
  await loadStaff();
  renderStaffMgmt();
  render();
  showToast('削除しました');
}

// ── Tag dropdown ──────────────────────────────────────────────
function toggleTagDropdown() {
  const menu = document.getElementById('m-tag-menu');
  const dropdown = document.getElementById('m-tag-dropdown');
  const isOpen = menu.style.display !== 'none';
  menu.style.display = isOpen ? 'none' : '';
  dropdown.classList.toggle('open', !isOpen);
}

function updateTagPreview() {
  const checked = [...document.querySelectorAll('#m-tag-menu input[type=checkbox]:checked')].map(cb => cb.value);
  const preview = document.getElementById('m-tag-preview');
  preview.innerHTML = checked.length === 0
    ? '<span class="tag-placeholder">タグを選択...</span>'
    : checked.map(t => `<span class="tag">${t}</span>`).join('');
}

function renderTagCheckboxes(selectedTags) {
  const menu = document.getElementById('m-tag-menu');
  if (tagList.length === 0) {
    menu.innerHTML = '<div class="tag-dropdown-item" style="color:var(--muted);">タグが登録されていません</div>';
    updateTagPreview();
    return;
  }
  menu.innerHTML = tagList.map(t => `
    <label class="tag-dropdown-item">
      <input type="checkbox" value="${t.name}" ${selectedTags.includes(t.name) ? 'checked' : ''} onchange="updateTagPreview()">
      ${t.name}
    </label>`).join('');
  updateTagPreview();
}

// ── Tag management render ──────────────────────────────────────
function renderTagMgmt() {
  const list = document.getElementById('tag-mgmt-list');
  if (tagList.length === 0) {
    list.innerHTML = '<p style="color:var(--muted); font-size:0.88rem;">タグが登録されていません</p>';
    return;
  }
  list.innerHTML = tagList.map(t => `
    <div class="tag-mgmt-row">
      <span class="tag">${t.name}</span>
      <div class="mgmt-actions flex-shrink-0">
        <button class="btn-edit" onclick="openTagModal(${t.id})">編集</button>
        <button class="btn-del" onclick="deleteTag(${t.id}, '${t.name.replace(/'/g, "\\'")}')">削除</button>
      </div>
    </div>`).join('');
}

function openTagModal(tagId) {
  editingTagId = tagId || null;
  document.getElementById('tag-modal-title').textContent = tagId ? 'タグ編集' : 'タグ登録';
  document.getElementById('tag-modal-error').textContent = '';
  const t = tagId ? tagList.find(x => x.id === tagId) : null;
  document.getElementById('tm-name').value = t?.name || '';
  document.getElementById('tag-modal').classList.add('open');
}

function closeTagModal() {
  document.getElementById('tag-modal').classList.remove('open');
}

async function saveTag() {
  const name = document.getElementById('tm-name').value.trim();
  if (!name) {
    document.getElementById('tag-modal-error').textContent = 'タグ名は必須です';
    return;
  }
  document.getElementById('tag-modal-error').textContent = '';

  if (editingTagId) {
    const { error } = await db.from('tags').update({ name }).eq('id', editingTagId);
    if (error) { document.getElementById('tag-modal-error').textContent = '保存に失敗しました'; console.error(error); return; }
  } else {
    const { error } = await db.from('tags').insert({ name });
    if (error) { document.getElementById('tag-modal-error').textContent = '保存に失敗しました'; console.error(error); return; }
  }

  await loadTags();
  renderTagMgmt();
  closeTagModal();
  showToast(editingTagId ? '更新しました' : '登録しました');
}

async function deleteTag(id, name) {
  if (!confirm(`「${name}」を削除しますか？`)) return;
  const { error } = await db.from('tags').delete().eq('id', id);
  if (error) { showToast('削除に失敗しました'); console.error(error); return; }
  await loadTags();
  renderTagMgmt();
  showToast('削除しました');
}

// ── Store management ──────────────────────────────────────────
function renderStoreMgmt() {
  const list = document.getElementById('store-mgmt-list');
  if (storeList.length === 0) {
    list.innerHTML = '<p style="color:var(--muted); font-size:0.88rem;">店舗が登録されていません</p>';
    return;
  }
  list.innerHTML = storeList.map(st => `
    <div class="store-mgmt-row d-flex align-items-center justify-content-between gap-3">
      <div>
        <div class="s-name">${st.name}</div>
        ${st.address ? `<div class="s-detail">${st.address}</div>` : ''}
        ${st.tel     ? `<div class="s-detail">${st.tel}</div>`     : ''}
      </div>
      <div class="mgmt-actions flex-shrink-0">
        <button class="btn-edit" onclick="openStoreModal(${st.id})">編集</button>
        <button class="btn-del" onclick="deleteStore(${st.id}, '${st.name.replace(/'/g, "\\'")}')">削除</button>
      </div>
    </div>`).join('');
}

function openStoreModal(storeId) {
  editingStoreId = storeId || null;
  document.getElementById('store-modal-title').textContent = storeId ? '店舗編集' : '店舗登録';
  document.getElementById('store-modal-error').textContent = '';

  const st = storeId ? storeList.find(x => x.id === storeId) : null;
  document.getElementById('sm-name').value    = st?.name    || '';
  document.getElementById('sm-address').value = st?.address || '';
  document.getElementById('sm-tel').value     = st?.tel     || '';

  document.getElementById('store-modal').classList.add('open');
}

function closeStoreModal() {
  document.getElementById('store-modal').classList.remove('open');
}

async function saveStore() {
  const name = document.getElementById('sm-name').value.trim();
  if (!name) {
    document.getElementById('store-modal-error').textContent = '店舗名は必須です';
    return;
  }
  document.getElementById('store-modal-error').textContent = '';

  const payload = {
    name,
    address: document.getElementById('sm-address').value.trim() || null,
    tel:     document.getElementById('sm-tel').value.trim()     || null,
  };

  if (editingStoreId) {
    const { error } = await db.from('stores').update(payload).eq('id', editingStoreId);
    if (error) { document.getElementById('store-modal-error').textContent = '保存に失敗しました'; console.error(error); return; }
  } else {
    const { error } = await db.from('stores').insert(payload);
    if (error) { document.getElementById('store-modal-error').textContent = '保存に失敗しました'; console.error(error); return; }
  }

  await loadStores();
  renderStoreMgmt();
  closeStoreModal();
  showToast(editingStoreId ? '更新しました' : '登録しました');
}

async function deleteStore(id, name) {
  if (!confirm(`「${name}」を削除しますか？`)) return;
  const { error } = await db.from('stores').delete().eq('id', id);
  if (error) { showToast('削除に失敗しました'); console.error(error); return; }
  await loadStores();
  renderStoreMgmt();
  showToast('削除しました');
}

document.addEventListener('click', function(e) {
  const dropdown = document.getElementById('m-tag-dropdown');
  if (dropdown && !dropdown.contains(e.target)) {
    document.getElementById('m-tag-menu').style.display = 'none';
    dropdown.classList.remove('open');
  }
});

init();
