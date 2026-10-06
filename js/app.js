/* Admin shell: login, navigation (sidebar on desktop, bottom bar on mobile), live polling */
const NAV = [['dashboard', 'Dashboard', 'dash'], ['leads', 'Leads', 'users'], ['products', 'Products', 'box'], ['orders', 'Orders', 'bag'], ['bulk', 'Bulk', 'office'], ['analytics', 'Analytics', 'chart'], ['carts', 'Carts', 'cart'], ['whatsapp', 'WhatsApp', 'wa'], ['categories', 'Categories', 'tag'], ['settings', 'Settings', 'cog']];
const BOTTOM = ['dashboard', 'leads', 'products', 'orders', 'bulk'];
const root = $('#root');

function loginView() {
  root.innerHTML = `<div class="login"><form class="login-card" id="lf"><h1>Admin login</h1><p>Adil Furnitures dashboard</p><input id="code" type="password" inputmode="numeric" autocomplete="current-password" placeholder="Enter admin code" required autofocus><button class="btn pri" style="width:100%" id="lb">Sign in</button><p id="le" style="color:var(--bad);margin:12px 0 0;font-size:14px"></p></form></div>`;
  $('#lf').onsubmit = async e => { e.preventDefault(); const b = $('#lb'); b.disabled = true; b.textContent = 'Signing in…'; $('#le').textContent = '';
    try { const r = await api('/login', { method: 'POST', body: { code: $('#code').value } }); sessionStorage.setItem(TOKEN_KEY, r.token); location.reload(); } catch (x) { $('#le').textContent = x.message; b.disabled = false; b.textContent = 'Sign in'; $('#code').select(); } };
}
A.onUnauthorized = () => { stopLive(); try { sessionStorage.removeItem(TOKEN_KEY); } catch (e) { } loginView(); };

function shell() {
  root.innerHTML = `<div class="shell"><aside class="side"><div class="brand"><img src="favicon-180.png" alt="">Adil Admin</div>
    ${NAV.map(([k, l, i]) => `<button class="nav-i" data-nav="${k}">${ic(i)}${l}</button>`).join('')}<div class="grow"></div><a class="nav-i" href="/" target="_blank">${ic('grid')}View website</a><button class="nav-i" data-logout>${ic('out')}Logout</button></aside>
    <header class="top"><h1 id="ttl">Dashboard</h1><span class="topc" id="topc"></span><span class="live" id="live"><i></i>Offline</span><button class="x menu-btn hide" aria-hidden="true"></button></header>
    <main class="main" id="page"></main>
    <nav class="bot">${BOTTOM.map(k => { const n = NAV.find(x => x[0] === k); return `<button data-nav="${k}">${ic(n[2])}${n[1]}</button>`; }).join('')}<button data-more>${ic('more')}More</button></nav></div>`;
  root.onclick = e => {
    const n = e.target.closest('[data-nav]'); if (n) { location.hash = n.dataset.nav; return; }
    if (e.target.closest('[data-logout]')) return logout();
    if (e.target.closest('[data-more]')) {
      const s = sheet({ title: 'More', small: true, body: `<div class="list">${NAV.filter(x => !BOTTOM.includes(x[0])).map(([k, l, i]) => `<button class="btn" style="justify-content:flex-start" data-m="${k}">${ic(i)}${l}</button>`).join('')}<a class="btn" href="/" target="_blank" style="justify-content:flex-start">${ic('grid')}View website</a><button class="btn bad" style="justify-content:flex-start" data-lo>${ic('out')}Logout</button></div>` });
      s.el.onclick = ev => { const m = ev.target.closest('[data-m]'); if (m) { s.close(); location.hash = m.dataset.m; } if (ev.target.closest('[data-lo]')) { s.close(); logout(); } if (ev.target.closest('[data-close]')) s.close(); };
    }
  };
}
async function logout() { try { await api('/logout', { method: 'POST' }); } catch (e) { } try { sessionStorage.removeItem(TOKEN_KEY); } catch (e) { } location.reload(); }

function route() {
  const k = (location.hash.slice(1) || 'dashboard').split('?')[0], key = Pages[k] ? k : 'dashboard';
  $$('[data-nav]').forEach(b => b.classList.toggle('on', b.dataset.nav === key));
  $('#ttl').textContent = (NAV.find(n => n[0] === key) || [])[1] || 'Dashboard';
  const page = $('#page'); page.onclick = null; page.onchange = null; A.liveHandler = null; window.scrollTo(0, 0);
  Pages[key](page);
}
let liveTimer = null, liveFails = 0;
function stopLive() { clearTimeout(liveTimer); liveTimer = null; }
async function pollLive() {
  if (!document.hidden) {
    try {
      const d = await api('/live'); A.live = d; liveFails = 0;
      const c = d.counts, l = $('#live'); if (l) { l.className = 'live on'; l.lastChild.textContent = 'Live'; }
      const tc = $('#topc'); if (tc) tc.innerHTML = `<span>Visitors ${c.today}</span><span>Leads ${c.leads}</span><span>WhatsApp ${c.waClicks}</span><span>Enquiries ${c.enquiries}</span><span>Out of stock ${c.outOfStock}</span>`;
      A.liveHandler && A.liveHandler(d);
    } catch (e) { liveFails++; const l = $('#live'); if (l) { l.className = 'live'; l.lastChild.textContent = 'Offline'; } }
  }
  liveTimer = setTimeout(pollLive, liveFails > 2 ? 20000 : 8000);
}
document.addEventListener('visibilitychange', () => { if (!document.hidden && liveTimer) { clearTimeout(liveTimer); pollLive(); } });

/* CSV export needs the auth header, so download via fetch + blob */
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-export]'); if (!b) return;
  try { const r = await fetch(API_BASE + '/api/admin/export/' + b.dataset.export, { headers: authHeaders() }); if (!r.ok) throw new Error('Export failed'); const u = URL.createObjectURL(await r.blob()); const a = document.createElement('a'); a.href = u; a.download = b.dataset.export + '.csv'; a.click(); URL.revokeObjectURL(u); } catch (x) { toast(x.message, 1); }
});

(async function boot() {
  try { await api('/me'); }
  catch (e) {
    if (e.message === 'Session expired') return;      // 401 -> login view already shown
    loginView();                                      // network/server problem: still show login + reason
    const le = document.getElementById('le');
    if (le) le.textContent = 'Cannot reach server (' + e.message + '). Check config.js / backend / CORS.';
    return;
  }
  shell(); route(); window.addEventListener('hashchange', route); pollLive();
})();
