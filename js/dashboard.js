const Pages = {};
const CARDS = c => [
  ['Total Visitors', num(c.totalVisits), `${num(c.online)} online now`], ['Unique Visitors', num(c.unique), `${num(c.returning)} returning`],
  ["Today's Visitors", num(c.today), `${num(c.todayUnique)} unique`], ['Users / Leads', num(c.leads), 'with phone number'],
  ['Active Carts', num(c.activeCarts), `${num(c.abandonedCarts)} abandoned`], ['Products', num(c.products), `${num(c.lowStock)} low stock`],
  ['Out of Stock', num(c.outOfStock), c.outOfStock ? 'needs attention' : 'all good', c.outOfStock ? 'warn' : ''], ['WhatsApp Clicks', num(c.waClicks), 'all time'],
  ['Bulk Enquiries', num(c.bulk), 'office furniture'], ['Total Enquiries', num(c.enquiries), 'orders + bulk']
];
const statHTML = c => CARDS(c).map(([l, v, s, k]) => `<div class="stat ${k || ''}"><span>${l}</span><b>${v}</b><small>${s}</small></div>`).join('');
const periodHTML = c => `<div class="kv" style="grid-template-columns:repeat(5,1fr);margin:0;text-align:center">${[['Today', c.today], ['Yesterday', c.yesterday], ['7 days', c.last7], ['30 days', c.last30], ['All time', c.totalVisits]].map(([l, v]) => `<div><small>${l}</small><b style="font-size:20px;font-family:var(--serif)">${num(v)}</b></div>`).join('')}</div>`;
const feedHTML = a => a && a.length ? `<ul class="feed" style="padding:0;margin:0">${a.map(e => `<li><time>${ago(e.at)}</time><span><b>${esc(e.who)}</b> · ${esc(e.text)}</span></li>`).join('')}</ul>` : empty('No activity yet - visits and clicks will appear here live.');
const chartSeries = ch => [{ name: 'Visits', color: COLORS.visits, data: ch.visits }, { name: 'WhatsApp', color: COLORS.whatsapp, data: ch.whatsapp }, { name: 'Product views', color: COLORS.productViews, data: ch.productViews }, { name: 'Cart adds', color: COLORS.cartAdds, data: ch.cartAdds }, { name: 'Enquiries', color: COLORS.enquiries, data: ch.enquiries }];
let dashRange = '7d';

Pages.dashboard = async (el) => {
  el.innerHTML = `<div class="page-h"><h2>Dashboard</h2><div class="seg" id="rng">${[['today', 'Today'], ['7d', '7 days'], ['30d', '30 days'], ['all', 'All']].map(([k, l]) => `<button data-r="${k}" class="${dashRange === k ? 'on' : ''}">${l}</button>`).join('')}</div></div>
    <div id="dash">${skeleton(6)}</div>`;
  const draw = async () => {
    const s = await api('/stats?range=' + dashRange);
    const live = A.live || { activity: [] };
    $('#dash').innerHTML = `<div class="grid stats" id="stats">${statHTML(s.counts)}</div>
      <div class="grid two" style="margin-top:12px">
        <div class="grid">
          <div class="card"><div class="sec-h">Visitors</div><div id="periods">${periodHTML(s.counts)}</div></div>
          <div class="card"><div class="sec-h">Activity over time</div>${lineChart(s.chart.labels, chartSeries(s.chart))}</div>
          <div class="grid three"><div class="card"><div class="sec-h">Most viewed</div>${barList(s.top.viewed, p => p.name, p => p.stats.views)}</div>
            <div class="card"><div class="sec-h">Most added to cart</div>${barList(s.top.cart, p => p.name, p => p.stats.cartAdds)}</div>
            <div class="card"><div class="sec-h">Most WhatsApp-clicked</div>${barList(s.top.whatsapp, p => p.name, p => p.stats.waClicks)}</div></div>
        </div>
        <div class="grid" style="align-content:start">
          <div class="card"><div class="sec-h">Live activity <span class="badge b-ok">auto-refresh</span></div><div id="feed">${feedHTML(live.activity)}</div></div>
          <div class="card"><div class="sec-h">Stock alerts</div>
            ${s.outOfStock.length || s.lowStock.length ? `<div class="list">${s.outOfStock.map(p => `<div style="display:flex;justify-content:space-between;gap:8px"><span>${esc(p.name)}</span>${badge('OUT_OF_STOCK')}</div>`).join('')}${s.lowStock.map(p => `<div style="display:flex;justify-content:space-between;gap:8px"><span>${esc(p.name)}</span>${badge('LOW_STOCK')} <b>${p.stock} left</b></div>`).join('')}</div>` : '<p style="color:var(--soft);margin:0">All products are well stocked.</p>'}
            <div class="acts"><button class="btn sm" data-go="products">Manage stock</button></div></div>
        </div>
      </div>`;
  };
  try { await draw(); } catch (e) { $('#dash').innerHTML = empty(e.message); }
  el.onclick = e => { const r = e.target.closest('[data-r]'); if (r) { dashRange = r.dataset.r; Pages.dashboard(el); } const g = e.target.closest('[data-go]'); if (g) location.hash = g.dataset.go; };
  A.liveHandler = (d) => { const st = $('#stats'), f = $('#feed'), p = $('#periods'); if (st) st.innerHTML = statHTML(d.counts); if (p) p.innerHTML = periodHTML(d.counts); if (f) f.innerHTML = feedHTML(d.activity); };
};

Pages.analytics = async (el) => {
  el.innerHTML = `<div class="page-h"><h2>Analytics</h2><div class="seg" id="rng">${[['today', 'Today'], ['7d', '7 days'], ['30d', '30 days'], ['all', 'All time']].map(([k, l]) => `<button data-r="${k}" class="${dashRange === k ? 'on' : ''}">${l}</button>`).join('')}</div></div><div id="an">${skeleton(5)}</div>`;
  try {
    const s = await api('/stats?range=' + dashRange), rc = s.range_counts, g = k => rc[k] || 0;
    const funnel = [['Visits', g('SESSION_START')], ['Product views', g('PRODUCT_VIEW')], ['Cart adds', g('CART_ADD')], ['Checkout starts', g('CHECKOUT_START')], ['WhatsApp clicks', g('WHATSAPP_CLICK')], ['Popup leads', g('POPUP_SUBMIT')], ['Enquiries', g('ENQUIRY_SUBMITTED')], ['Bulk enquiries', g('BULK_ENQUIRY')], ['Cart removals', g('CART_REMOVE')], ['Category views', g('CATEGORY_VIEW')]];
    $('#an').innerHTML = `<div class="grid stats">${funnel.map(([l, v]) => `<div class="stat"><span>${l}</span><b>${num(v)}</b></div>`).join('')}</div>
      <div class="card" style="margin-top:12px"><div class="sec-h">Trends</div>${lineChart(s.chart.labels, chartSeries(s.chart))}</div>
      <div class="grid two" style="margin-top:12px"><div class="grid three" style="grid-template-columns:1fr 1fr">
        <div class="card"><div class="sec-h">Most viewed products</div>${barList(s.top.viewed, p => p.name, p => p.stats.views)}</div>
        <div class="card"><div class="sec-h">Most added to cart</div>${barList(s.top.cart, p => p.name, p => p.stats.cartAdds)}</div>
        <div class="card"><div class="sec-h">Most WhatsApp-clicked</div>${barList(s.top.whatsapp, p => p.name, p => p.stats.waClicks)}</div>
        <div class="card"><div class="sec-h">Most requested (enquiries)</div>${barList(s.top.enquired, p => p.name, p => p.stats.enquiries)}</div></div>
        <div class="card"><div class="sec-h">Popular categories</div>${barList(s.top.categories, c => c.name, c => c.n)}</div></div>`;
  } catch (e) { $('#an').innerHTML = empty(e.message); }
  el.onclick = e => { const r = e.target.closest('[data-r]'); if (r) { dashRange = r.dataset.r; Pages.analytics(el); } };
  A.liveHandler = null;
};
