/* Admin > Leads / Visitors, Enquiries (orders + bulk), Carts, WhatsApp */
const VS = { q: '', filter: 'all', page: 1, tab: 'visitors' };
const FILTERS = [['all', 'All'], ['new', 'New'], ['returning', 'Returning'], ['cart_active', 'Cart active'], ['cart_abandoned', 'Cart abandoned'], ['whatsapp', 'WhatsApp'], ['enquiry', 'Enquiry'], ['bulk', 'Bulk'], ['hot', 'Hot'], ['warm', 'Warm'], ['cold', 'Cold']];
const NOTES = (arr) => (arr || []).map(n => `<div class="note">${esc(n.note)}<small>${esc(n.admin)} · ${fdate(n.at)}</small></div>`).join('') || '<p style="color:var(--soft);margin:0 0 8px">No notes yet.</p>';
const exportBtn = (t, l) => `<button class="btn sm" data-export="${t}">${ic('down')} ${l}</button>`;

function visitorCard(v) {
  const name = v.name || 'Anonymous visitor';
  return `<div class="item" data-vid="${v.visitorId}"><button class="item-h" data-toggle><div class="avatar">${esc(initials(v.name || 'V'))}</div>
    <div class="t"><b>${esc(name)}</b><small>${esc(v.code)} · ${esc(v.phone || 'no phone')}</small><small>Last active ${ago(v.lastActivityAt)}</small></div>
    <div style="display:grid;gap:4px;justify-items:end">${badge(v.level)}${v.cartValue ? `<b style="font-size:13px">${inr(v.cartValue)}</b>` : ''}</div><span class="chev">${ic('chev')}</span></button>
    <div class="item-b"><div class="kv"><div><small>Visits</small><span>${v.visitCount}</span></div><div><small>Pages viewed</small><span>${v.pagesViewed}</span></div><div><small>Products viewed</small><span>${v.productsViewedCount}</span></div><div><small>WhatsApp clicks</small><span>${v.waClicks}</span></div>
    <div><small>Cart items</small><span>${v.cartItems}</span></div><div><small>Cart value</small><span>${inr(v.cartValue)} ${v.cartState !== 'NONE' ? badge(v.cartState) : ''}</span></div><div><small>Bulk enquiry</small><span>${v.bulkEnquiries ? 'Yes' : 'No'}</span></div><div><small>Score</small><span>${v.score}</span></div></div>
    <div class="acts"><button class="btn sm dark" data-act="open">Open profile</button>${v.phone ? `<a class="btn sm" href="tel:${esc(v.phone)}">${ic('phone')} Call</a>` : ''}</div></div></div>`;
}

async function visitorSheet(id) {
  let d; try { d = await api('/visitors/' + id); } catch (e) { return toast(e.message, 1); }
  const v = d.visitor, c = d.cart;
  const s = sheet({ title: `Customer #${v.code}`, body: `<div style="display:flex;gap:12px;align-items:center;margin-bottom:6px"><div class="avatar">${esc(initials(v.name || 'V'))}</div><div><b style="font-size:17px">${esc(v.name || 'Anonymous visitor')}</b><div>${badge(v.level)} <small style="color:var(--soft)">engagement score ${v.score}</small></div></div></div>
    <div class="kv"><div><small>Phone</small><span>${esc(v.phone || '-')}</span></div><div><small>Email</small><span>${esc(v.email || '-')}</span></div><div><small>First visit</small><span>${fdate(v.firstVisitAt, false)}</span></div><div><small>Last active</small><span>${fdate(v.lastActivityAt)}</span></div>
    <div><small>Visits</small><span>${v.visitCount}</span></div><div><small>Pages viewed</small><span>${v.pagesViewed}</span></div><div><small>Products viewed</small><span>${(v.productsViewed || []).length}</span></div><div><small>WhatsApp clicks</small><span>${v.waClicks}</span></div>
    <div><small>Source</small><span>${esc(v.source || '-')}</span></div><div><small>Device</small><span>${esc([v.device, v.browser, v.os].filter(Boolean).join(' · '))}</span></div><div class="full" style="grid-column:1/-1"><small>Address</small><span>${esc(v.address || '-')}</span></div></div>
    <div class="sec-h" style="margin-top:14px">Cart ${c ? badge(c.state) : ''} ${c ? `<b>${inr(c.total)}</b>` : ''}</div>
    ${c && c.items.length ? `<div class="list">${c.items.map(i => `<div style="display:flex;gap:10px;align-items:center">${i.image ? `<img class="pimg" style="width:48px;height:48px" src="${esc(i.image)}" alt="">` : ''}<div style="flex:1;min-width:0"><b>${esc(i.name)}</b><small style="display:block;color:var(--soft)">${inr(i.price)} × ${i.qty} · added ${fdate(i.addedAt)}</small></div><b>${inr(i.price * i.qty)}</b></div>`).join('')}</div>` : '<p style="color:var(--soft);margin:0">Cart is empty.</p>'}
    ${d.enquiries.length ? `<div class="sec-h" style="margin-top:14px">Enquiries</div>${d.enquiries.map(e => `<div class="note"><b>${esc(e.enquiryId)}</b> ${badge(e.status)}<small>${e.type} · ${fdate(e.createdAt)}${e.total ? ' · ' + inr(e.total) : ''}</small></div>`).join('')}` : ''}
    <div class="sec-h" style="margin-top:14px">Activity timeline</div>
    ${d.timeline.length ? `<ul class="tl">${d.timeline.map(t => `<li><time>${fdate(t.at)}</time>${esc(t.text)}</li>`).join('')}</ul>` : '<p style="color:var(--soft)">No activity.</p>'}
    <div class="sec-h" style="margin-top:14px">Notes</div><div id="vn">${NOTES(v.adminNotes)}</div>
    <div class="tools"><input id="nn" placeholder="Add a note, e.g. Called - wants 40 chairs"><button class="btn dark" id="na">Add</button></div>` });
  $('#na', s.el).onclick = async () => { const t = $('#nn', s.el).value.trim(); if (!t) return; try { const r = await api(`/visitors/${id}/notes`, { method: 'POST', body: { note: t } }); $('#vn', s.el).innerHTML = NOTES(r.notes); $('#nn', s.el).value = ''; } catch (e) { toast(e.message, 1); } };
}

Pages.leads = async (el) => {
  el.innerHTML = `<div class="page-h"><h2>Leads &amp; visitors</h2>${exportBtn('customers', 'Customers CSV')}${exportBtn('leads', 'Leads CSV')}</div>
    <div class="seg" style="margin-bottom:12px"><button data-tab="visitors" class="${VS.tab === 'visitors' ? 'on' : ''}">Visitors</button><button data-tab="popup" class="${VS.tab === 'popup' ? 'on' : ''}">Popup leads</button></div>
    <div id="vb"></div>`;
  const body = $('#vb', el);
  const drawVisitors = async () => {
    body.innerHTML = `<div class="chips" id="vf">${FILTERS.map(([k, l]) => `<button class="chip ${VS.filter === k ? 'on' : ''}" data-f="${k}">${l}</button>`).join('')}</div>
      <div class="tools"><div class="search"><input id="vq" type="search" placeholder="Search name, phone, email, visitor ID, product, SKU…" value="${esc(VS.q)}"></div></div><div id="vl" class="list cols">${skeleton(5)}</div><div id="vp"></div>`;
    $('#vq').oninput = debounce(e => { VS.q = e.target.value.trim(); VS.page = 1; load(); });
    await load();
  };
  const load = async () => {
    try { const d = await api(`/visitors?filter=${VS.filter}&page=${VS.page}&q=${encodeURIComponent(VS.q)}`);
      $('#vl').innerHTML = d.items.length ? d.items.map(visitorCard).join('') : empty('No visitors yet'); $('#vp').innerHTML = pager(d.page, d.pages, d.total); } catch (e) { $('#vl').innerHTML = empty(e.message); }
  };
  const drawPopup = async () => {
    body.innerHTML = `<div id="pl" class="list cols">${skeleton(4)}</div><div id="pp"></div>`;
    const loadP = async () => { try { const d = await api(`/leads?page=${VS.page}`);
      $('#pl').innerHTML = d.items.length ? d.items.map(l => `<div class="item" data-lid="${l._id}"><div class="item-h" style="cursor:default"><div class="avatar">${esc(initials(l.name))}</div><div class="t"><b>${esc(l.name)}</b><small>${esc(l.phone)}${l.interest ? ' · ' + esc(l.interest) : ''}</small><small>${fdate(l.createdAt)}</small></div>${badge(l.status)}</div>
        <div class="item-b" style="display:block;padding-top:10px"><div class="acts"><select data-lstatus>${['NEW', 'CONTACTED', 'QUOTED', 'CONVERTED', 'CLOSED'].map(s => `<option ${s === l.status ? 'selected' : ''}>${s}</option>`).join('')}</select><a class="btn sm" href="tel:${esc(l.phone)}">${ic('phone')} Call</a><a class="btn sm" target="_blank" rel="noopener" href="https://wa.me/${esc(String(l.phone).replace(/\D/g, ''))}">${ic('wa')} WhatsApp</a></div></div></div>`).join('') : empty('No popup leads yet');
      $('#pp').innerHTML = pager(d.page, d.pages, d.total); } catch (e) { $('#pl').innerHTML = empty(e.message); } };
    await loadP(); body.onchange = async e => { const s = e.target.closest('[data-lstatus]'); if (s) { try { await api(`/leads/${s.closest('.item').dataset.lid}/status`, { method: 'PATCH', body: { status: s.value } }); toast('Status updated'); loadP(); } catch (x) { toast(x.message, 1); } } };
  };
  VS.tab === 'visitors' ? drawVisitors() : drawPopup();
  el.onclick = e => {
    const t = e.target.closest('[data-tab]'); if (t) { VS.tab = t.dataset.tab; VS.page = 1; return Pages.leads(el); }
    const f = e.target.closest('[data-f]'); if (f) { VS.filter = f.dataset.f; VS.page = 1; $$('#vf .chip').forEach(c => c.classList.toggle('on', c === f)); return load(); }
    const pg = e.target.closest('[data-pg]'); if (pg && !pg.disabled) { VS.page = +pg.dataset.pg; return VS.tab === 'visitors' ? load() : Pages.leads(el); }
    const tg = e.target.closest('[data-toggle]'); if (tg) return tg.closest('.item').classList.toggle('open');
    const o = e.target.closest('[data-act="open"]'); if (o) visitorSheet(o.closest('.item').dataset.vid);
  };
  A.liveHandler = null;
};

/* ---------- enquiries: ORDER (checkout) and BULK ---------- */
const ES = { ORDER: { q: '', status: '', page: 1 }, BULK: { q: '', status: '', page: 1 } };
const STATUSES = ['NEW', 'CONTACTED', 'QUOTED', 'NEGOTIATING', 'CONVERTED', 'CLOSED'];
function enquiryCard(e) {
  const bulk = e.type === 'BULK';
  const items = bulk ? e.bulkItems.map(b => `<div class="note"><b>${esc(b.kind)}</b> × ${b.qty}${b.product ? ' · ' + esc(b.product) : ''}<small>Budget ${b.budgetMin || b.budgetMax ? inr(b.budgetMin) + ' - ' + inr(b.budgetMax) + ' each' : 'open'}</small></div>`).join('')
    : e.items.map(i => `<div class="note" style="display:flex;gap:10px;align-items:center">${i.image ? `<img class="pimg" style="width:44px;height:44px" src="${esc(i.image)}" alt="">` : ''}<div style="flex:1"><b>${esc(i.name)}</b><small>${inr(i.price)} × ${i.qty}</small></div><b>${inr(i.price * i.qty)}</b></div>`).join('');
  return `<div class="item" data-eid="${e.enquiryId}"><button class="item-h" data-toggle><div class="avatar">${bulk ? ic('office') : esc(initials(e.customer.name))}</div><div class="t"><b>${esc(bulk && e.company ? e.company : e.customer.name)}</b><small>${esc(e.enquiryId)} · ${esc(e.customer.phone)}</small><small>${fdate(e.createdAt)}${bulk ? ` · ${e.totalQty} pcs` : ` · ${inr(e.total)}`}</small></div>${badge(e.status)}<span class="chev">${ic('chev')}</span></button>
    <div class="item-b"><div class="kv"><div><small>Contact</small><span>${esc(e.customer.name)}</span></div><div><small>Phone</small><span>${esc(e.customer.phone)}</span></div><div><small>Email</small><span>${esc(e.customer.email || '-')}</span></div><div><small>${bulk ? 'Delivery city' : 'Address'}</small><span>${esc(bulk ? e.city || '-' : e.customer.address)}</span></div></div>
    ${items}${e.customer.notes ? `<p><small style="color:var(--soft)">CUSTOMER NOTES</small><br>${esc(e.customer.notes)}</p>` : ''}
    <div class="acts"><select data-estatus>${STATUSES.map(s => `<option ${s === e.status ? 'selected' : ''}>${s}</option>`).join('')}</select><a class="btn sm" href="tel:${esc(e.customer.phone)}">${ic('phone')} Call</a><a class="btn sm" target="_blank" rel="noopener" href="https://wa.me/${esc(String(e.customer.phone).replace(/\D/g, ''))}">${ic('wa')} WhatsApp</a></div>
    <div class="sec-h" style="margin-top:12px">Notes</div><div data-notes>${NOTES(e.notes)}</div><div class="tools"><input data-ninput placeholder="Add a note…"><button class="btn sm dark" data-nadd>Add</button></div></div></div>`;
}
function enquiryPage(type, title) {
  return async (el) => {
    const S = ES[type];
    el.innerHTML = `<div class="page-h"><h2>${title}</h2>${exportBtn(type === 'BULK' ? 'bulk' : 'orders', 'CSV')}</div>
      <div class="chips" id="ef"><button class="chip ${!S.status ? 'on' : ''}" data-s="">All</button>${STATUSES.map(s => `<button class="chip ${S.status === s ? 'on' : ''}" data-s="${s}">${s[0] + s.slice(1).toLowerCase()}</button>`).join('')}</div>
      <div class="tools"><div class="search"><input id="eq" type="search" placeholder="Search ID, name, phone, company, city, product…" value="${esc(S.q)}"></div></div><div id="el" class="list cols">${skeleton(4)}</div><div id="ep"></div>`;
    const load = async () => { try { const d = await api(`/enquiries?type=${type}&status=${S.status}&page=${S.page}&q=${encodeURIComponent(S.q)}`);
      $('#el').innerHTML = d.items.length ? d.items.map(enquiryCard).join('') : empty(type === 'BULK' ? 'No bulk enquiries yet' : 'No enquiries yet'); $('#ep').innerHTML = pager(d.page, d.pages, d.total); } catch (e) { $('#el').innerHTML = empty(e.message); } };
    await load();
    $('#eq').oninput = debounce(e => { S.q = e.target.value.trim(); S.page = 1; load(); });
    el.onchange = async e => { const s = e.target.closest('[data-estatus]'); if (!s) return; try { await api(`/enquiries/${s.closest('.item').dataset.eid}/status`, { method: 'PATCH', body: { status: s.value } }); toast('Status updated'); } catch (x) { toast(x.message, 1); } };
    el.onclick = async e => {
      const f = e.target.closest('[data-s]'); if (f) { S.status = f.dataset.s; S.page = 1; $$('#ef .chip').forEach(c => c.classList.toggle('on', c === f)); return load(); }
      const pg = e.target.closest('[data-pg]'); if (pg && !pg.disabled) { S.page = +pg.dataset.pg; return load(); }
      const tg = e.target.closest('[data-toggle]'); if (tg) return tg.closest('.item').classList.toggle('open');
      const na = e.target.closest('[data-nadd]'); if (na) { const it = na.closest('.item'), inp = $('[data-ninput]', it), t = inp.value.trim(); if (!t) return;
        try { const r = await api(`/enquiries/${it.dataset.eid}/notes`, { method: 'POST', body: { note: t } }); $('[data-notes]', it).innerHTML = NOTES(r.notes); inp.value = ''; } catch (x) { toast(x.message, 1); } }
    };
    A.liveHandler = null;
  };
}
Pages.orders = enquiryPage('ORDER', 'Orders &amp; enquiries');
Pages.bulk = enquiryPage('BULK', 'Bulk enquiries');

/* ---------- carts ---------- */
let cartTab = 'active';
Pages.carts = async (el) => {
  el.innerHTML = `<div class="page-h"><h2>Carts</h2></div><div class="seg" style="margin-bottom:12px"><button data-t="active" class="${cartTab === 'active' ? 'on' : ''}">Active</button><button data-t="abandoned" class="${cartTab === 'abandoned' ? 'on' : ''}">Abandoned</button></div><div id="cl" class="list cols">${skeleton(4)}</div><div id="cp"></div>`;
  let page = 1;
  const load = async () => { try { const d = await api(`/carts?state=${cartTab}&page=${page}`);
    $('#cl').innerHTML = d.items.length ? d.items.map(c => `<div class="item" data-vid="${c.visitorId}"><button class="item-h" data-toggle><div class="avatar">${esc(initials(c.visitor.name || 'V'))}</div><div class="t"><b>${esc(c.visitor.name || c.visitor.code || 'Visitor')}</b><small>${esc(c.visitor.phone || 'no phone')} · ${c.items.reduce((a, i) => a + i.qty, 0)} items</small><small>Last activity ${ago(c.lastActivityAt)}</small></div><b>${inr(c.total)}</b><span class="chev">${ic('chev')}</span></button>
      <div class="item-b"><div class="list" style="margin-top:10px">${c.items.map(i => `<div style="display:flex;gap:10px;align-items:center">${i.image ? `<img class="pimg" style="width:44px;height:44px" src="${esc(i.image)}" alt="">` : ''}<div style="flex:1"><b>${esc(i.name)}</b><small style="display:block;color:var(--soft)">${inr(i.price)} × ${i.qty}</small></div><b>${inr(i.price * i.qty)}</b></div>`).join('')}</div><div class="acts"><button class="btn sm dark" data-act="open">Open profile</button></div></div></div>`).join('') : empty(cartTab === 'active' ? 'No active carts right now' : 'No abandoned carts');
    $('#cp').innerHTML = pager(d.page, d.pages, d.total); } catch (e) { $('#cl').innerHTML = empty(e.message); } };
  await load();
  el.onclick = e => { const t = e.target.closest('[data-t]'); if (t) { cartTab = t.dataset.t; return Pages.carts(el); } const pg = e.target.closest('[data-pg]'); if (pg && !pg.disabled) { page = +pg.dataset.pg; return load(); }
    const tg = e.target.closest('[data-toggle]'); if (tg) return tg.closest('.item').classList.toggle('open'); const o = e.target.closest('[data-act="open"]'); if (o) visitorSheet(o.closest('.item').dataset.vid); };
  A.liveHandler = null;
};

/* ---------- WhatsApp clicks ---------- */
Pages.whatsapp = async (el) => {
  el.innerHTML = `<div class="page-h"><h2>WhatsApp clicks</h2></div><div id="wl" class="list cols">${skeleton(4)}</div><div id="wp"></div>`;
  let page = 1;
  const load = async () => { try { const d = await api('/whatsapp?page=' + page);
    $('#wl').innerHTML = d.items.length ? d.items.map(w => `<div class="item"><div class="item-h" style="cursor:default"><div class="avatar">${ic('wa')}</div><div class="t"><b>${esc(w.customer)}</b><small>${esc(w.phone || 'no phone')} · ${esc(w.kind)}${w.productName ? ' · ' + esc(w.productName) : ''}</small><small>${fdate(w.createdAt)} · ${esc(w.page || '')}</small></div>${w.cartTotal ? `<b>${inr(w.cartTotal)}</b>` : ''}</div>${w.cart && w.cart.length ? `<div class="item-b" style="display:block;padding-top:8px"><small style="color:var(--soft)">CART AT CLICK</small>${w.cart.map(c => `<div>${esc(c.name)} × ${c.qty}</div>`).join('')}</div>` : ''}</div>`).join('') : empty('No WhatsApp clicks yet');
    $('#wp').innerHTML = pager(d.page, d.pages, d.total); } catch (e) { $('#wl').innerHTML = empty(e.message); } };
  await load(); el.onclick = e => { const pg = e.target.closest('[data-pg]'); if (pg && !pg.disabled) { page = +pg.dataset.pg; load(); } };
  A.liveHandler = null;
};
