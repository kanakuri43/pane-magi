// ── Staff data ────────────────────────────────────────────────
const staff = [
  { id:1, name:'田中花子',  img:'panels/田中花子.png',  tags:['読書','カフェ巡り','映画','キャンプ','ショッピング'], height:158, bust:85, waist:58, hip:86, url:'https://www.pokepara.jp/_hokkaido/m801/a1801/shop4072/gal/409983/' },
  { id:2, name:'佐藤あかり',img:'panels/佐藤あかり.png',tags:['ヨガ','ネイル','ドライブ','映画','ショッピング'],  height:163, bust:82, waist:55, hip:83, url:'https://www.jfa.jp/national_team/staff/MORIYASU_Hajime.html' },
  { id:3, name:'渡辺咲良',  img:'panels/渡辺咲良.png',  tags:['料理','K-POP','ショッピング','旅行'],height:155, bust:88, waist:60, hip:88, url:'https://www.jfa.jp/national_team/staff/MORIYASU_Hajime.html' },
  { id:4, name:'板倉芽衣',  img:'panels/板倉芽衣.png',  tags:['筋トレ','アニメ','キャンプ','旅行','ショッピング'], height:167, bust:80, waist:56, hip:82, url:'https://www.japan-baseball.jp/jp/profile/201901003.html' },
  { id:5, name:'小林由奈',  img:'panels/小林由奈.png',  tags:['旅行','写真','カラオケ','読書'],      height:160, bust:84, waist:57, hip:85, url:'https://www.pokepara.jp/_hokkaido/m801/a1801/shop4072/gal/409983/' },
];

// ── Schedule data (3/10 ~ 3/31) ───────────────────────────────
const schedule = { 1:{}, 2:{}, 3:{} };

(function seedSchedule() {
  const patterns = {
    1: [[1,3,5],[2,4],[1,2,3],[3,4,5],[1,4],[2,3,5],[1,2],[4,5],[1,3],[2,3,4],[1,5],[2,4,5],[1,2,3,5],[3,4],[2,5],[1,4,5],[2,3],[1,3,4],[],[1,2,4,5],[3,5],[1,2]],
    2: [[2,5],[1,3],[4,5],[2,3],[1,4,5],[3,5],[1,2,4],[],[2,3,5],[1,4],[3,4,5],[1,2,3],[5],[2,4],[1,3,5],[2,3,4],[1],[4,5],[1,2,5],[3,4],[],[1,3,4]],
    3: [[3,4],[1,2,5],[],[3,5],[2,4],[1,3,4],[2,5],[1,4],[3,4,5],[1,2],[4],[2,3,5],[1,4,5],[3],[1,2,3],[5],[2,4,5],[1,3],[],[2,3,4],[1,5],[3,4,5]],
  };
  for (let day = 10; day <= 31; day++) {
    const dateStr = `2026-03-${String(day).padStart(2,'0')}`;
    const idx = day - 10;
    schedule[1][dateStr] = patterns[1][idx] || [];
    schedule[2][dateStr] = patterns[2][idx] || [];
    schedule[3][dateStr] = patterns[3][idx] || [];
  }
})();

// ── Date helpers ──────────────────────────────────────────────
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function offsetDate(base, days) {
  const d = new Date(base + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function fmtDate(str) {
  const d = new Date(str + 'T00:00:00');
  return `${d.getMonth()+1}月${d.getDate()}日（${'日月火水木金土'[d.getDay()]}）`;
}

// ── Tag helper ────────────────────────────────────────────────
function tagsHtml(s) {
  return s.tags.map(t => `<span class="tag">${t}</span>`).join('');
}

// ── Toast ─────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}
