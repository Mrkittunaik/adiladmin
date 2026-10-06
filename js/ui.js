/* Admin UI helpers: DOM, icons (inline SVG), API, toasts, sheets */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const inr = n => '₹' + Math.round(n || 0).toLocaleString('en-IN');
const num = n => (n || 0).toLocaleString('en-IN');
const debounce = (fn, ms = 350) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function fdate(d, withTime = true) {
  if (!d) return '-'; const x = new Date(d); if (isNaN(x)) return '-';
  let h = x.getHours(), m = String(x.getMinutes()).padStart(2, '0'), ap = h >= 12 ? 'pm' : 'am'; h = h % 12 || 12;
  return `${String(x.getDate()).padStart(2, '0')} ${MON[x.getMonth()]} ${x.getFullYear()}${withTime ? `, ${h}:${m} ${ap}` : ''}`;
}
function ago(d) {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 45) return 'just now'; if (s < 3600) return Math.floor(s / 60) + 'm ago'; if (s < 86400) return Math.floor(s / 3600) + 'h ago';
  return Math.floor(s / 86400) + 'd ago';
}
const ICON = {
  dash: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.8c1.9.7 3.1 2.4 3.5 5.2"/>',
  box: '<path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5Z"/><path d="M3 7.5 12 12l9-4.5M12 12v9"/>',
  bag: '<path d="M5 8h14l-1 12H6Z"/><path d="M9 8a3 3 0 0 1 6 0"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  chart: '<path d="M4 20V4M4 20h16"/><path d="m8 15 3-4 3 2 4-6"/>',
  cart: '<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2.5 3.5h3l2.4 11.2h10.2l2-8H6.4"/>',
  wa: '<path d="M4 20l1.3-4.2A8 8 0 1 1 8.4 19Z"/><path d="M9 9c0 3 3 6 6 6l1-1.6-2-1-1 .8c-.9-.4-1.8-1.3-2.2-2.2l.8-1-1-2Z"/>',
  cog: '<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2-1.2L14 3h-4l-.6 2.6a7 7 0 0 0-2 1.2l-2.3-.9-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-.9c.6.5 1.3.9 2 1.2L10 21h4l.6-2.6c.7-.3 1.4-.7 2-1.2l2.3.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2Z"/>',
  more: '<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',
  out: '<path d="M10 4H5v16h5M15 8l4 4-4 4M9 12h10"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>', plus: '<path d="M12 5v14M5 12h14"/>', x: '<path d="M6 6l12 12M18 6 6 18"/>',
  chev: '<path d="m6 9 6 6 6-6"/>', tag: '<path d="M3 12V4h8l10 10-8 8Z"/><circle cx="7.5" cy="8.5" r="1.2"/>', down: '<path d="M12 4v11m-4-4 4 4 4-4M5 20h14"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>', phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>',
  office: '<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2"/>'
};
const ic = n => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${ICON[n] || ''}</svg>`;
const badge = (t, cls) => `<span class="badge b-${cls || t}">${esc(String(t).replace(/_/g, ' '))}</span>`;

/* API (cookie session; any 401 returns to login) */
const A = { onUnauthorized: null, liveHandlers: new Set() };
const API_BASE = (window.ADMIN_API_BASE || '').replace(/\/$/, '');
const TOKEN_KEY = 'adil_admin_token';          // sessionStorage: cleared when the tab closes; server-side session can be revoked by logout
const getToken = () => { try { return sessionStorage.getItem(TOKEN_KEY) || ''; } catch (e) { return ''; } };
const authHeaders = () => (getToken() ? { Authorization: 'Bearer ' + getToken() } : {});
async function api(path, o = {}) {
  let tries = 0;
  for (;;) {
    let r;
    try {
      r = await fetch(API_BASE + '/api/admin' + path, { method: o.method || 'GET',
        headers: Object.assign({}, authHeaders(), o.body && !o.form ? { 'Content-Type': 'application/json' } : {}), body: o.form ? o.form : o.body ? JSON.stringify(o.body) : undefined });
    } catch (e) { if (tries++ < 4) { await new Promise(r => setTimeout(r, 1500)); continue; } throw new Error('Network error - server unreachable'); }
    if (r.status === 503 && tries++ < 6) { await new Promise(r => setTimeout(r, 2000)); continue; }   // cold start / db connecting
    if (r.status === 401 && path !== '/login') { A.onUnauthorized && A.onUnauthorized(); throw new Error('Session expired'); }
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error(d.error || 'Request failed (' + r.status + ')'), { status: r.status, data: d });
    return d;
  }
}
function toast(msg, bad) {
  const t = document.createElement('div'); t.className = 'toast' + (bad ? ' bad' : ''); t.textContent = msg;
  $('#toasts').appendChild(t); setTimeout(() => t.remove(), bad ? 4500 : 2400);
}
function sheet({ title, body, footer, small, onMount }) {
  const ov = document.createElement('div'); ov.className = 'ov';
  ov.innerHTML = `<div class="sheet${small ? ' small' : ''}" role="dialog" aria-modal="true"><div class="sheet-h"><h3>${esc(title)}</h3><button class="x" data-close aria-label="Close">${ic('x')}</button></div><div class="sheet-b">${body || ''}</div>${footer ? `<div class="sheet-f">${footer}</div>` : ''}</div>`;
  document.body.appendChild(ov);
  const close = () => ov.remove();
  ov.addEventListener('mousedown', e => { if (e.target === ov) close(); });
  ov.addEventListener('click', e => { if (e.target.closest('[data-close]')) close(); });
  onMount && onMount(ov, close);
  return { el: ov, close };
}
function confirmBox(msg, okLabel = 'Confirm', danger) {
  return new Promise(res => {
    const s = sheet({ title: 'Please confirm', small: true, body: `<p style="margin:0">${esc(msg)}</p>`,
      footer: `<button class="btn" data-no>Cancel</button><button class="btn ${danger ? 'dark' : 'pri'}" data-yes>${esc(okLabel)}</button>` });
    s.el.addEventListener('click', e => { if (e.target.closest('[data-yes]')) { s.close(); res(true); } else if (e.target.closest('[data-no],[data-close]')) { s.close(); res(false); } });
  });
}
const skeleton = (n = 4) => Array.from({ length: n }, () => '<div class="skel"></div>').join('');
const empty = msg => `<div class="empty">${esc(msg)}</div>`;
function pager(p, pages, total) {
  return pages > 1 ? `<div class="pager"><button class="btn sm" data-pg="${p - 1}" ${p <= 1 ? 'disabled' : ''}>Previous</button><span>Page ${p} of ${pages} · ${num(total)} total</span><button class="btn sm" data-pg="${p + 1}" ${p >= pages ? 'disabled' : ''}>Next</button></div>` : (total ? `<div class="pager"><span>${num(total)} total</span></div>` : '');
}
const initials = n => (String(n || '?').trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('') || '?').toUpperCase();
