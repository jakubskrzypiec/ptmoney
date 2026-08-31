/* ===========================================================
   Kalkulator refinansowania kredytu hipotecznego
   Cała logika po stronie przeglądarki — brak zależności.
   =========================================================== */

const $ = (id) => document.getElementById(id);

/* ---------- formatowanie ---------- */
const nf0 = new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 });
const nf2 = new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pf = new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const zl0 = (v) => nf0.format(Math.round(v || 0));
const zl2 = (v) => nf2.format(v || 0);
const pct = (v) => pf.format(v || 0) + '%';
const signed = (v, f = zl0) => (v > 0 ? '+' : v < 0 ? '−' : '') + f(Math.abs(v));

function termText(m) {
  m = Math.max(0, Math.round(m));
  const y = Math.floor(m / 12), r = m % 12;
  const yTxt = y === 1 ? '1 rok' : (y % 10 >= 2 && y % 10 <= 4 && !(y % 100 >= 12 && y % 100 <= 14)) ? y + ' lata' : y + ' lat';
  const mTxt = r + ' mies.';
  if (y && r) return yTxt + ' ' + mTxt;
  if (y) return yTxt;
  return mTxt;
}

/* ---------- model: harmonogram ---------- */
function buildSchedule(principal, annualRatePct, n, type) {
  const i = (annualRatePct / 100) / 12;
  const rows = [];
  const balance = [principal];   // saldo po k-tej racie (index 0 = start)
  const cumInt = [0];            // odsetki narastająco
  const cumPay = [0];            // wpłaty narastająco
  let bal = principal, ti = 0, tp = 0;

  if (!(principal > 0) || !(n > 0)) {
    return { rows, balance, cumInt, cumPay, totalInterest: 0, totalPaid: 0, first: 0, last: 0, n: 0, principal: principal || 0 };
  }

  const annuity = i === 0 ? principal / n : principal * i / (1 - Math.pow(1 + i, -n));
  const capFlat = principal / n;

  for (let k = 1; k <= n; k++) {
    const int = bal * i;
    let cap = type === 'annuity' ? annuity - int : capFlat;
    if (k === n || cap > bal) cap = bal;            // domknięcie salda na ostatniej racie
    const pay = cap + int;
    bal = Math.max(0, bal - cap);
    ti += int; tp += pay;
    rows.push({ k, pay, cap, int, bal });
    balance.push(bal); cumInt.push(ti); cumPay.push(tp);
  }

  return {
    rows, balance, cumInt, cumPay,
    totalInterest: ti, totalPaid: tp,
    first: rows[0].pay, last: rows[rows.length - 1].pay,
    n, principal
  };
}

/* ---------- odczyt stanu z formularza ---------- */
const num = (id) => {
  const el = $(id);
  const v = parseFloat(String(el.value).replace(',', '.'));
  return Number.isFinite(v) ? v : 0;
};
const segVal = (id) => $(id).querySelector('.seg__btn.is-on').dataset.v;

function readState() {
  const cN = Math.round(num('cYears') * 12 + num('cMonths'));
  const nN = Math.round(num('nYears') * 12 + num('nMonths'));
  const bal = num('cAmount');
  const fee = bal * num('nFeePct') / 100;
  const early = bal * num('cEarlyPct') / 100;
  const other = num('nOther');
  const credited = $('nCredited').checked;

  return {
    cName: $('cName').value.trim() || 'Obecny kredyt',
    nName: $('nName').value.trim() || 'Twoja oferta',
    bal, cRate: num('cRate'), cN, cType: segVal('cType'),
    nRate: num('nRate'), nN, nType: segVal('nType'),
    fee, early, other, credited,
    newPrincipal: bal + (credited ? fee : 0),
    upfront: early + other + (credited ? 0 : fee),
    costTotal: fee + early + other
  };
}

/* ---------- główne przeliczenie ---------- */
let LAST = null;

function calc() {
  const s = readState();
  const A = buildSchedule(s.bal, s.cRate, s.cN, s.cType);
  const B = buildSchedule(s.newPrincipal, s.nRate, s.nN, s.nType);

  const intSave = A.totalInterest - B.totalInterest;
  const totalA = A.totalPaid;
  const totalB = B.totalPaid + s.upfront;
  const netSave = totalA - totalB;
  const payDiff = A.first - B.first;

  // moment zwrotu kosztów: pierwszy miesiąc, w którym skumulowane wpłaty w nowym
  // wariancie (razem z kosztami płaconymi z góry) są niższe niż w obecnym
  let be = null;
  const maxN = Math.max(A.n, B.n);
  for (let k = 1; k <= maxN; k++) {
    const a = A.cumPay[Math.min(k, A.n)] ?? 0;
    const b = (B.cumPay[Math.min(k, B.n)] ?? 0) + s.upfront;
    if (a - b >= 0) { be = k; break; }
  }

  LAST = { s, A, B, intSave, totalA, totalB, netSave, payDiff, be };
  render();
}

/* ---------- render ---------- */
function render() {
  const { s, A, B, intSave, totalA, totalB, netSave, payDiff, be } = LAST;

  /* raty w kartach wejściowych */
  $('cPayment').textContent = A.n ? zl2(A.first) : '—';
  $('nPayment').textContent = B.n ? zl2(B.first) : '—';
  $('cRateVal').textContent = pct(s.cRate);
  $('nRateVal').textContent = pct(s.nRate);
  $('cTermVal').textContent = termText(s.cN);
  $('nTermVal').textContent = termText(s.nN);

  /* nagłówek wyniku */
  const good = intSave >= 0;
  $('hSavings').textContent = (A.n && B.n) ? signed(intSave) : '—';
  $('hSavings').style.color = good ? '#5ee7b0' : '#ff9b6a';
  $('hSub').textContent = !A.n || !B.n
    ? 'Uzupełnij dane obu wariantów, aby zobaczyć wynik.'
    : good
      ? `Tyle mniej odsetek zapłaci klient przez cały okres kredytowania — z ${zl0(A.totalInterest)} do ${zl0(B.totalInterest)}.`
      : `Nowa oferta jest droższa w odsetkach o ${zl0(-intSave)}. Sprawdź oprocentowanie i okres kredytowania.`;

  const mx = Math.max(A.totalInterest, B.totalInterest, 1);
  $('hIntA').textContent = zl0(A.totalInterest);
  $('hIntB').textContent = zl0(B.totalInterest);
  $('hFillA').style.width = (A.totalInterest / mx * 100) + '%';
  $('hFillB').style.width = (B.totalInterest / mx * 100) + '%';

  /* KPI */
  $('kPay').textContent = B.n ? zl2(B.first) : '—';
  const noteEl = $('kPayNote');
  if (!A.n || !B.n) { noteEl.textContent = '—'; noteEl.className = 'kpi__note'; }
  else if (Math.abs(payDiff) < 0.5) { noteEl.textContent = 'rata praktycznie bez zmian'; noteEl.className = 'kpi__note'; }
  else {
    noteEl.textContent = `${payDiff > 0 ? 'o ' + zl0(payDiff) + ' mniej' : 'o ' + zl0(-payDiff) + ' więcej'} niż dziś (${zl2(A.first)})`;
    noteEl.className = 'kpi__note ' + (payDiff > 0 ? 'pos' : 'neg');
  }

  $('kNet').textContent = (A.n && B.n) ? signed(netSave) : '—';
  $('kNet').className = 'kpi__val ' + (netSave >= 0 ? 'pos' : 'neg');
  $('kNetNote').textContent = `całkowity koszt: ${zl0(totalA)} → ${zl0(totalB)}`;

  $('kCost').textContent = zl0(s.costTotal);
  $('kCostNote').textContent = s.credited
    ? `prowizja ${zl0(s.fee)} doliczona do kredytu, z góry ${zl0(s.upfront)}`
    : `prowizja ${zl0(s.fee)} • wcześniejsza spłata ${zl0(s.early)} • inne ${zl0(s.other)}`;

  if (s.costTotal <= 0) {
    $('kBE').textContent = 'od razu';
    $('kBENote').textContent = 'brak kosztów przeniesienia';
  } else if (be) {
    $('kBE').textContent = termText(be);
    $('kBENote').textContent = `${be}. rata — od tego momentu klient jest na plusie`;
  } else {
    $('kBE').textContent = '—';
    $('kBENote').textContent = netSave >= 0
      ? 'zysk pojawia się dopiero na końcu okresu (krótszy kredyt)'
      : 'koszty nie zwracają się w tym wariancie';
  }

  /* wariant „zostaw obecną ratę” */
  const bonus = $('bonus');
  if (A.n && B.n && payDiff > 1 && s.nType === 'annuity' && s.cType === 'annuity') {
    const i = (s.nRate / 100) / 12;
    const target = A.first;
    let n2 = null;
    if (i === 0) n2 = Math.ceil(s.newPrincipal / target);
    else if (target > s.newPrincipal * i) n2 = Math.ceil(-Math.log(1 - s.newPrincipal * i / target) / Math.log(1 + i));
    if (n2 && n2 > 0) {
      const C = buildSchedule(s.newPrincipal, s.nRate, n2, 'annuity');
      const extra = B.totalInterest - C.totalInterest;
      $('bonusTxt').innerHTML =
        `Jeśli klient utrzyma dotychczasową ratę <strong>${zl2(A.first)}</strong>, spłaci nowy kredyt w <strong>${termText(n2)}</strong> ` +
        `zamiast ${termText(B.n)} — czyli o <strong>${termText(Math.max(0, B.n - n2))}</strong> szybciej. ` +
        `Odsetki spadają wtedy do <strong>${zl0(C.totalInterest)}</strong>, a łączna oszczędność względem obecnego kredytu rośnie do ` +
        `<strong>${zl0(A.totalInterest - C.totalInterest)}</strong>${extra > 0 ? ` (o ${zl0(extra)} więcej niż przy niższej racie)` : ''}.`;
      bonus.hidden = false;
    } else bonus.hidden = true;
  } else bonus.hidden = true;

  /* legenda i nagłówki tabel */
  $('legA').textContent = s.cName; $('legB').textContent = s.nName;
  $('thA').textContent = s.cName; $('thB').textContent = s.nName;

  /* tabela porównawcza */
  const rataA = s.cType === 'decreasing' ? `${zl2(A.first)} → ${zl2(A.last)}` : zl2(A.first);
  const rataB = s.nType === 'decreasing' ? `${zl2(B.first)} → ${zl2(B.last)}` : zl2(B.first);
  const dRate = s.nRate - s.cRate;
  const dN = s.nN - s.cN;
  const rows = [
    ['Kwota kredytu', zl0(s.bal), zl0(s.newPrincipal), signed(s.newPrincipal - s.bal), s.newPrincipal - s.bal <= 0],
    ['Oprocentowanie', pct(s.cRate), pct(s.nRate), (dRate > 0 ? '+' : dRate < 0 ? '−' : '') + pf.format(Math.abs(dRate)) + ' p.p.', dRate <= 0],
    ['Okres spłaty', termText(s.cN), termText(s.nN), dN === 0 ? '—' : (dN > 0 ? '+' : '−') + termText(Math.abs(dN)), dN <= 0],
    ['Rodzaj rat', s.cType === 'annuity' ? 'równe' : 'malejące', s.nType === 'annuity' ? 'równe' : 'malejące', '—', true],
    ['Rata miesięczna', rataA, rataB, signed(-payDiff, zl2), payDiff >= 0],
    ['Suma odsetek', zl0(A.totalInterest), zl0(B.totalInterest), signed(-intSave), intSave >= 0],
    ['Koszty przeniesienia', zl0(0), zl0(s.costTotal), signed(s.costTotal), false],
    ['Całkowity koszt', zl0(totalA), zl0(totalB), signed(-netSave), netSave >= 0, true]
  ];
  $('cmpBody').innerHTML = rows.map(([lab, a, b, d, ok, total]) =>
    `<tr class="${total ? 'is-total' : ''}"><td>${lab}</td><td>${a}</td><td>${b}</td>` +
    `<td class="${d === '—' ? '' : ok ? 'pos' : 'neg'}">${d}</td></tr>`
  ).join('');

  drawChart();
  renderSchedule();
}

/* ---------- harmonogram ---------- */
let schedShown = 60;
function renderSchedule() {
  const which = segVal('schedMode');
  const S = which === 'A' ? LAST.A : LAST.B;
  const list = S.rows.slice(0, schedShown);
  $('schedBody').innerHTML = list.map(r =>
    `<tr><td>${r.k}</td><td>${zl2(r.pay)}</td><td>${zl2(r.cap)}</td><td>${zl2(r.int)}</td><td>${zl2(r.bal)}</td></tr>`
  ).join('') || '<tr><td colspan="5">Uzupełnij dane kredytu.</td></tr>';
  $('moreInfo').textContent = S.rows.length ? `pokazano ${list.length} z ${S.rows.length} rat` : '';
  $('moreBtn').hidden = list.length >= S.rows.length;
}

/* ---------- wykres ---------- */
const SVG_NS = 'http://www.w3.org/2000/svg';
const mk = (t, at) => { const e = document.createElementNS(SVG_NS, t); for (const k in at) e.setAttribute(k, at[k]); return e; };
let CHART = null;

function drawChart() {
  const svg = $('chart');
  const box = svg.parentElement;
  const w = Math.max(240, box.clientWidth || 900), h = 340;
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.removeAttribute('preserveAspectRatio');
  svg.innerHTML = '';

  const { A, B, s } = LAST;
  const mode = segVal('chartMode');
  const maxN = Math.max(A.n, B.n);
  if (!maxN) { CHART = null; return; }

  const seriesOf = (S) => {
    const src = mode === 'balance' ? S.balance : S.cumInt;
    const out = new Array(maxN + 1);
    for (let k = 0; k <= maxN; k++) out[k] = k <= S.n ? src[k] : (mode === 'balance' ? 0 : S.totalInterest);
    return out;
  };
  const sa = seriesOf(A), sb = seriesOf(B);

  const pad = { l: 64, r: 14, t: 16, b: 30 };
  const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
  const maxY = Math.max(...sa, ...sb, 1);
  const base = Math.pow(10, Math.floor(Math.log10(maxY / 4)));
  const mult = [1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find(m => base * m * 4 >= maxY) || 10;
  const step = base * mult, top = step * 4;
  const X = (k) => pad.l + (k / maxN) * iw;
  const Y = (v) => pad.t + ih - (v / top) * ih;

  const kZl = (v) => v >= 1e6 ? (v / 1e6).toFixed(v % 1e6 ? 1 : 0).replace('.', ',') + ' mln' : Math.round(v / 1000) + ' tys.';

  /* siatka */
  const g = mk('g', {});
  for (let i = 0; i <= 4; i++) {
    const v = top * i / 4, y = Y(v);
    g.appendChild(mk('line', { x1: pad.l, x2: w - pad.r, y1: y, y2: y, stroke: 'var(--line)', 'stroke-width': 1 }));
    const t = mk('text', { x: pad.l - 10, y: y + 4, 'text-anchor': 'end', fill: 'var(--ink-3)', 'font-size': 11 });
    t.textContent = v === 0 ? '0' : kZl(v);
    g.appendChild(t);
  }
  const years = Math.ceil(maxN / 12);
  const stepY = years <= 10 ? 2 : years <= 20 ? 5 : 10;
  for (let y = 0; y <= years; y += stepY) {
    const x = X(Math.min(y * 12, maxN));
    const t = mk('text', { x, y: h - 8, 'text-anchor': 'middle', fill: 'var(--ink-3)', 'font-size': 11 });
    t.textContent = y === 0 ? 'start' : termText(y * 12);
    g.appendChild(t);
  }
  svg.appendChild(g);

  const path = (arr) => arr.map((v, k) => `${k ? 'L' : 'M'}${X(k).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');

  /* obszar między krzywymi = wizualizacja oszczędności */
  let back = '';
  for (let k = maxN; k >= 0; k--) back += `L${X(k).toFixed(1)},${Y(sb[k]).toFixed(1)}`;
  svg.appendChild(mk('path', { d: path(sa) + back + ' Z', fill: 'var(--b)', opacity: .1 }));

  svg.appendChild(mk('path', { d: path(sa), fill: 'none', stroke: 'var(--a)', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }));
  svg.appendChild(mk('path', { d: path(sb), fill: 'none', stroke: 'var(--b)', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }));

  /* elementy interaktywne */
  const gl = mk('line', { y1: pad.t, y2: pad.t + ih, stroke: 'var(--line-strong)', 'stroke-width': 1, 'stroke-dasharray': '3 3', opacity: 0 });
  const da = mk('circle', { r: 4.5, fill: 'var(--a)', stroke: 'var(--surface)', 'stroke-width': 2, opacity: 0 });
  const db = mk('circle', { r: 4.5, fill: 'var(--b)', stroke: 'var(--surface)', 'stroke-width': 2, opacity: 0 });
  svg.appendChild(gl); svg.appendChild(da); svg.appendChild(db);

  CHART = { svg, sa, sb, X, Y, maxN, pad, iw, gl, da, db, mode, names: [s.cName, s.nName] };
}

function chartHover(ev) {
  if (!CHART) return;
  const { svg, sa, sb, X, Y, maxN, pad, iw, gl, da, db, mode, names } = CHART;
  const r = svg.getBoundingClientRect();
  const px = (ev.clientX - r.left) * (svg.viewBox.baseVal.width / r.width);
  let k = Math.round((px - pad.l) / iw * maxN);
  k = Math.max(0, Math.min(maxN, k));
  const x = X(k);
  gl.setAttribute('x1', x); gl.setAttribute('x2', x); gl.setAttribute('opacity', 1);
  da.setAttribute('cx', x); da.setAttribute('cy', Y(sa[k])); da.setAttribute('opacity', 1);
  db.setAttribute('cx', x); db.setAttribute('cy', Y(sb[k])); db.setAttribute('opacity', 1);

  const tip = $('tip');
  const lab = mode === 'balance' ? 'Pozostało do spłaty' : 'Odsetki zapłacone';
  const diff = sa[k] - sb[k];
  tip.innerHTML =
    `<div style="opacity:.7;margin-bottom:4px">${k === 0 ? 'Start' : termText(k)} — ${lab}</div>` +
    `<div class="tip__row"><i class="tip__dot" style="background:var(--a)"></i>${names[0]}: <b>${zl0(sa[k])}</b></div>` +
    `<div class="tip__row"><i class="tip__dot" style="background:var(--b)"></i>${names[1]}: <b>${zl0(sb[k])}</b></div>` +
    `<div style="opacity:.7;margin-top:4px">Różnica: <b>${zl0(Math.abs(diff))}</b></div>`;
  tip.hidden = false;
  const scale = r.width / svg.viewBox.baseVal.width;
  tip.style.left = Math.min(r.width - 20, Math.max(20, x * scale)) + 'px';
  tip.style.top = (Math.min(Y(sa[k]), Y(sb[k])) * scale) + 'px';
}
function chartLeave() {
  $('tip').hidden = true;
  if (CHART) { CHART.gl.setAttribute('opacity', 0); CHART.da.setAttribute('opacity', 0); CHART.db.setAttribute('opacity', 0); }
}

/* ---------- obsługa formularza ---------- */
const INPUTS = ['cName', 'cAmount', 'cRate', 'cYears', 'cMonths', 'nName', 'nRate', 'nYears', 'nMonths', 'nFeePct', 'cEarlyPct', 'nOther', 'nCredited', 'advName', 'advContact'];
const PAIRS = [['cRate', 'cRateS'], ['nRate', 'nRateS'], ['cYears', 'cYearsS'], ['nYears', 'nYearsS']];

PAIRS.forEach(([a, b]) => {
  $(a).addEventListener('input', () => { $(b).value = $(a).value; });
  $(b).addEventListener('input', () => { $(a).value = $(b).value; onChange(); });
});

INPUTS.forEach(id => $(id).addEventListener('input', onChange));

document.querySelectorAll('.seg').forEach(seg => {
  seg.addEventListener('click', (e) => {
    const btn = e.target.closest('.seg__btn');
    if (!btn) return;
    seg.querySelectorAll('.seg__btn').forEach(b => b.classList.toggle('is-on', b === btn));
    if (seg.id === 'schedMode') { schedShown = 60; renderSchedule(); }
    else if (seg.id === 'chartMode') drawChart();
    else onChange();
  });
});

$('moreBtn').addEventListener('click', () => { schedShown += 60; renderSchedule(); });
$('printBtn').addEventListener('click', () => window.print());
$('chart').addEventListener('mousemove', chartHover);
$('chart').addEventListener('mouseleave', chartLeave);
window.addEventListener('resize', () => { if (LAST) drawChart(); });

function onChange() { save(); calc(); }

/* ---------- zapis stanu ---------- */
const KEY = 'refi-hipoteka-v1';
function save() {
  const d = {};
  INPUTS.forEach(id => d[id] = $(id).type === 'checkbox' ? $(id).checked : $(id).value);
  d.cType = segVal('cType'); d.nType = segVal('nType');
  try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { /* prywatny tryb */ }
}
function load() {
  let d; try { d = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { d = null; }
  if (!d) return;
  INPUTS.forEach(id => {
    if (d[id] === undefined) return;
    if ($(id).type === 'checkbox') $(id).checked = d[id]; else $(id).value = d[id];
  });
  ['cType', 'nType'].forEach(seg => {
    if (!d[seg]) return;
    $(seg).querySelectorAll('.seg__btn').forEach(b => b.classList.toggle('is-on', b.dataset.v === d[seg]));
  });
  PAIRS.forEach(([a, b]) => $(b).value = $(a).value);
}
$('resetBtn').addEventListener('click', () => {
  try { localStorage.removeItem(KEY); } catch (e) {}
  location.reload();
});

/* ---------- motyw ---------- */
const SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
const MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>';
function setTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  $('themeIco').innerHTML = t === 'dark' ? SUN : MOON;
  try { localStorage.setItem(KEY + '-theme', t); } catch (e) {}
  if (LAST) drawChart();
}
$('themeBtn').addEventListener('click', () => {
  setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});

/* ---------- start ---------- */
(function init() {
  let t = null;
  try { t = localStorage.getItem(KEY + '-theme'); } catch (e) {}
  setTheme(t || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  load();
  calc();
})();
