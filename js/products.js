/* Admin > Products: list, add/edit (Cloudinary media), stock, archive */
const PS = { q: '', status: 'active', category: '', page: 1 };
let CATS = [];
const loadCats = async () => { CATS = (await api('/categories')).items; return CATS; };
const catOptions = (sel) => { const groups = CATS.filter(c => !c.parent), kids = id => CATS.filter(c => String(c.parent) === String(id));
  return groups.map(g => `<optgroup label="${esc(g.name)}${g.isActive ? '' : ' (hidden)'}"><option value="${g._id}" ${sel === g._id ? 'selected' : ''}>${esc(g.name)} (general)</option>${kids(g._id).map(k => `<option value="${k._id}" ${sel === k._id ? 'selected' : ''}>${esc(k.name)}</option>`).join('')}</optgroup>`).join(''); };

function productCard(p) {
  const out = p.stockStatus === 'OUT_OF_STOCK', arch = !p.isActive || p.deletedAt;
  const img = p.thumb ? `<img class="pimg" src="${esc(p.thumb)}" alt="" loading="lazy">` : `<div class="pimg"></div>`;
  return `<div class="item" data-pid="${p.pid}"><button class="item-h" data-toggle>${img}<div class="t"><b>${esc(p.name)}</b><small>${esc(p.sku || '-')} · ${esc(p.categoryName || '-')}</small>
    <small><b>${inr(p.price)}</b>${p.discount ? ` · -${p.discount}%` : ''} · Stock ${p.stock}</small></div>
    <div style="display:grid;gap:4px;justify-items:end">${arch ? badge('ARCHIVED', 'CLOSED') : badge(p.stockStatus)}${p.isDemo ? badge('DEMO', 'WARM') : ''}</div><span class="chev">${ic('chev')}</span></button>
    <div class="item-b"><div class="kv"><div><small>Views</small><span>${p.stats.views || 0}</span></div><div><small>Cart adds</small><span>${p.stats.cartAdds || 0}</span></div><div><small>Enquiries</small><span>${p.stats.enquiries || 0}</span></div><div><small>WhatsApp</small><span>${p.stats.waClicks || 0}</span></div></div>
    ${out ? '<p style="color:var(--bad);font-weight:800;margin:0 0 8px">OUT OF STOCK</p>' : ''}
    <div class="acts">${arch ? `<button class="btn sm" data-act="restore">Restore</button><button class="btn sm bad" data-act="hard">Delete forever</button>` :
      `<button class="btn sm" data-act="edit">Edit</button><button class="btn sm" data-act="stock">Stock</button><button class="btn sm" data-act="hide">${p.stockStatus === 'HIDDEN' ? 'Show' : 'Hide'}</button><button class="btn sm" data-act="dup">Duplicate</button><a class="btn sm" target="_blank" href="/#/product/${p.pid}">View</a><button class="btn sm bad" data-act="del">Archive</button>`}</div></div></div>`;
}

Pages.products = async (el) => {
  el.innerHTML = `<div class="page-h"><h2>Products</h2><button class="btn pri" id="addP">${ic('plus')} Add product</button></div>
    <div id="demoBar"></div>
    <div class="chips" id="stChips">${[['active', 'Active'], ['out', 'Out of stock'], ['low', 'Low stock'], ['hidden', 'Hidden'], ['archived', 'Archived'], ['demo', 'Demo']].map(([k, l]) => `<button class="chip ${PS.status === k ? 'on' : ''}" data-st="${k}">${l}</button>`).join('')}</div>
    <div class="tools"><div class="search"><input id="pq" type="search" placeholder="Search name, SKU, tag…" value="${esc(PS.q)}"></div><select id="pcat"><option value="">All categories</option></select></div>
    <div id="plist" class="list cols">${skeleton(5)}</div><div id="ppg"></div>`;
  try { await loadCats(); } catch (e) { toast(e.message, 1); }
  $('#pcat').innerHTML = '<option value="">All categories</option>' + catOptions(PS.category);
  const draw = async () => {
    try {
      const d = await api(`/products?status=${PS.status}&page=${PS.page}&q=${encodeURIComponent(PS.q)}&category=${PS.category}&limit=20`);
      $('#demoBar').innerHTML = d.demoCount ? `<div class="banner"><span><b>${d.demoCount} demo product(s)</b> from the original catalogue are in the database. Replace them with your real products, or clear them in one go.</span><button class="btn sm" data-demo="archive">Archive all demo</button><button class="btn sm bad" data-demo="delete">Delete archived demo</button></div>` : '';
      $('#plist').innerHTML = d.items.length ? d.items.map(productCard).join('') : empty('No products found');
      $('#ppg').innerHTML = pager(d.page, d.pages, d.total);
    } catch (e) { $('#plist').innerHTML = empty(e.message); }
  };
  await draw();
  const reload = () => draw();
  $('#addP').onclick = () => productForm(null, reload);
  $('#pq').oninput = debounce(e => { PS.q = e.target.value.trim(); PS.page = 1; draw(); });
  $('#pcat').onchange = e => { PS.category = e.target.value; PS.page = 1; draw(); };
  el.onclick = async e => {
    const st = e.target.closest('[data-st]'); if (st) { PS.status = st.dataset.st; PS.page = 1; $$('#stChips .chip').forEach(c => c.classList.toggle('on', c === st)); return draw(); }
    const pg = e.target.closest('[data-pg]'); if (pg && !pg.disabled) { PS.page = +pg.dataset.pg; return draw(); }
    const tg = e.target.closest('[data-toggle]'); if (tg) return tg.closest('.item').classList.toggle('open');
    const dm = e.target.closest('[data-demo]');
    if (dm) { const del = dm.dataset.demo === 'delete'; if (!await confirmBox(del ? 'Permanently delete all ARCHIVED demo products? Your own products are never touched.' : 'Archive every demo product? They disappear from the shop (you can restore them).', del ? 'Delete' : 'Archive', del)) return;
      try { const r = await api('/products/demo', { method: 'POST', body: { action: dm.dataset.demo } }); toast(`${r.affected} product(s) ${del ? 'deleted' : 'archived'}`); draw(); } catch (x) { toast(x.message, 1); } return; }
    const b = e.target.closest('[data-act]'); if (!b) return;
    const pid = b.closest('.item').dataset.pid, act = b.dataset.act;
    try {
      if (act === 'edit') productForm(await api('/products/' + pid), reload);
      else if (act === 'stock') stockSheet(await api('/products/' + pid), reload);
      else if (act === 'hide') { const p = await api('/products/' + pid); await api(`/products/${pid}/stock`, { method: 'PATCH', body: { stockStatus: p.stockStatus === 'HIDDEN' ? 'IN_STOCK' : 'HIDDEN', unhide: true } }); toast('Updated'); draw(); }
      else if (act === 'dup') { await api(`/products/${pid}/duplicate`, { method: 'POST' }); toast('Duplicated (saved as archived copy - restore it to publish)'); draw(); }
      else if (act === 'del') { if (await confirmBox('Archive this product? It disappears from the shop but old enquiries keep its name.', 'Archive', true)) { await api('/products/' + pid, { method: 'DELETE' }); toast('Archived'); draw(); } }
      else if (act === 'restore') { await api(`/products/${pid}/restore`, { method: 'POST' }); toast('Restored'); draw(); }
      else if (act === 'hard') { if (await confirmBox('Delete forever, including its Cloudinary images? This cannot be undone.', 'Delete forever', true)) { await api('/products/' + pid + '?hard=1', { method: 'DELETE' }); toast('Deleted'); draw(); } }
    } catch (x) { toast(x.message, 1); }
  };
  A.liveHandler = null;
};

function stockSheet(p, done) {
  const s = sheet({ title: 'Stock · ' + p.name, small: true, body: `<div class="f"><div class="full"><label>Stock quantity</label><input id="sq" type="number" min="0" value="${p.stock}"></div><div class="full"><label>Low-stock threshold</label><input id="sl" type="number" min="0" value="${p.lowStockThreshold}"></div></div>
    <p style="color:var(--soft);font-size:13px">0 = Out of stock automatically (add-to-cart is disabled on the shop). Any number above the threshold = In stock.</p>`,
    footer: `<button class="btn bad" data-zero>Mark out of stock</button><button class="btn pri" data-save>Save</button>` });
  s.el.addEventListener('click', async e => {
    const zero = e.target.closest('[data-zero]'), sv = e.target.closest('[data-save]'); if (!zero && !sv) return;
    try { await api(`/products/${p.pid}/stock`, { method: 'PATCH', body: zero ? { stockStatus: 'OUT_OF_STOCK' } : { stock: +$('#sq', s.el).value, lowStockThreshold: +$('#sl', s.el).value, unhide: true } }); toast('Stock updated'); s.close(); done(); } catch (x) { toast(x.message, 1); }
  });
}

function productForm(p, done) {
  const isNew = !p; p = p || { name: '', price: '', stock: 10, lowStockThreshold: 5, isActive: true, images: [], videos: [], specifications: {}, tags: [] };
  let images = [...(p.images || [])], videos = [...(p.videos || [])], pending = [], pendingVideo = [];
  const specText = Object.entries(p.specifications || {}).map(([k, v]) => `${k}: ${v}`).join('\n');
  const s = sheet({ title: isNew ? 'Add product' : 'Edit product', body: `<form id="pf" class="f" novalidate>
    <div class="full"><label>Name *</label><input name="name" value="${esc(p.name)}" required></div>
    <div><label>Category *</label><select name="category"><option value="">Select…</option>${catOptions(String(p.category || ''))}</select></div>
    <div><label>SKU</label><input name="sku" value="${esc(p.sku || '')}" placeholder="auto if empty"></div>
    <div><label>Price (₹) *</label><input name="price" type="number" min="0" value="${p.price}" required></div>
    <div><label>Compare-at price (₹)</label><input name="compareAtPrice" type="number" min="0" value="${p.compareAtPrice || ''}"></div>
    <div><label>Discount %</label><input name="discount" type="number" min="0" max="95" value="${p.discount || ''}" placeholder="auto from compare-at"></div>
    <div><label>Stock</label><input name="stock" type="number" min="0" value="${p.stock}"></div>
    <div><label>Material</label><input name="material" value="${esc(p.material || '')}"></div><div><label>Colour</label><input name="color" value="${esc(p.color || '')}"></div>
    <div class="full"><label>Short description</label><input name="shortDescription" maxlength="300" value="${esc(p.shortDescription || '')}"></div>
    <div class="full"><label>Description</label><textarea name="description">${esc(p.description || '')}</textarea></div>
    <div class="full"><label>Tags (comma separated)</label><input name="tags" value="${esc((p.tags || []).join(', '))}"></div>
    <div class="full"><label>Specifications (one per line, "Name: value")</label><textarea name="specs" placeholder="Dimensions: 120 x 60 cm&#10;Warranty: 5 years">${esc(specText)}</textarea></div>
    <div class="full checks">${[['isActive', 'Published'], ['isFeatured', 'Featured'], ['isPopular', 'Popular'], ['isNewArrival', 'New arrival']].map(([k, l]) => `<label><input type="checkbox" name="${k}" ${p[k] ? 'checked' : ''}>${l}</label>`).join('')}</div>
    <div class="full"><label>Images (first = main image) &amp; video · stored on Cloudinary</label><div class="media-grid" id="mg"></div>
      <div class="drop" id="drop">Tap to add images (JPG/PNG/WEBP, max 8 MB each)<input id="fi" type="file" accept="image/*" multiple hidden></div>
      <div class="drop" id="dropv" style="margin-top:8px">Add a product video (MP4/WEBM, max 40 MB)<input id="fv" type="file" accept="video/mp4,video/webm,video/quicktime" hidden></div></div></form>`,
    footer: `<button class="btn" data-close>Cancel</button><button class="btn pri" id="pub">${isNew ? 'PUBLISH PRODUCT' : 'Save changes'}</button>`,
    onMount: (ov) => {
      const mg = $('#mg', ov);
      const drawMedia = () => { mg.innerHTML = images.map((m, i) => `<div class="mtile ${i === 0 ? 'main' : ''}">${i === 0 ? '<span class="tag">MAIN</span>' : ''}<img src="${esc(m.thumb || m.url)}" alt=""><div class="mbar">${i ? `<button type="button" data-main="${i}">Main</button>` : ''}<button type="button" data-rm="${m.publicId}">Del</button></div></div>`).join('') +
        videos.map(m => `<div class="mtile"><div class="vid">Video</div><div class="mbar"><button type="button" data-rm="${m.publicId}">Del</button></div></div>`).join('') +
        pending.map((f, i) => `<div class="mtile"><img src="${URL.createObjectURL(f)}" alt=""><div class="mbar"><button type="button" data-prm="${i}">Remove</button></div></div>`).join('') + pendingVideo.map((f, i) => `<div class="mtile"><div class="vid">${esc(f.name.slice(0, 12))}</div><div class="mbar"><button type="button" data-pvrm="${i}">Remove</button></div></div>`).join(''); };
      drawMedia();
      $('#drop', ov).onclick = () => $('#fi', ov).click(); $('#dropv', ov).onclick = () => $('#fv', ov).click();
      $('#fi', ov).onchange = e => { pending.push(...e.target.files); e.target.value = ''; drawMedia(); };
      $('#fv', ov).onchange = e => { pendingVideo.push(...e.target.files); e.target.value = ''; drawMedia(); };
      mg.onclick = async e => {
        const rm = e.target.closest('[data-rm]'), mn = e.target.closest('[data-main]'), pr = e.target.closest('[data-prm]'), pv = e.target.closest('[data-pvrm]');
        if (pr) { pending.splice(+pr.dataset.prm, 1); drawMedia(); } if (pv) { pendingVideo.splice(+pv.dataset.pvrm, 1); drawMedia(); }
        try {
          if (rm && await confirmBox('Delete this file from Cloudinary?', 'Delete', true)) { const r = await api(`/products/${p.pid}/media?publicId=${encodeURIComponent(rm.dataset.rm)}`, { method: 'DELETE' }); images = r.images; videos = r.videos; drawMedia(); }
          if (mn) { const i = +mn.dataset.main, o = [images[i], ...images.filter((_, k) => k !== i)]; const r = await api(`/products/${p.pid}/media/order`, { method: 'PUT', body: { order: o.map(m => m.publicId) } }); images = r.images; drawMedia(); }
        } catch (x) { toast(x.message, 1); }
      };
      $('#pub', ov).onclick = async () => {
        const f = $('#pf', ov), v = n => f.elements[n].value.trim(), c = n => f.elements[n].checked;
        if (!v('name') || v('price') === '' || !v('category')) return toast('Name, price and category are required', 1);
        const specs = {}; v('specs').split('\n').forEach(l => { const i = l.indexOf(':'); if (i > 0) specs[l.slice(0, i).trim()] = l.slice(i + 1).trim(); });
        const body = { name: v('name'), category: v('category'), sku: v('sku'), price: +v('price'), compareAtPrice: +v('compareAtPrice') || 0, discount: +v('discount') || 0, stock: +v('stock') || 0,
          material: v('material'), color: v('color'), shortDescription: v('shortDescription'), description: f.elements.description.value, tags: v('tags'), specifications: specs, isActive: c('isActive'), isFeatured: c('isFeatured'), isPopular: c('isPopular'), isNewArrival: c('isNewArrival') };
        const btn = $('#pub', ov); btn.disabled = true; btn.textContent = 'Saving…';
        try {
          const saved = isNew ? await api('/products', { method: 'POST', body }) : await api('/products/' + p.pid, { method: 'PUT', body });
          const files = [...pending, ...pendingVideo];
          if (files.length) { btn.textContent = 'Uploading media…'; for (let i = 0; i < files.length; i += 3) { const fd = new FormData(); files.slice(i, i + 3).forEach(x => fd.append('files', x)); await api(`/products/${saved.pid}/media`, { method: 'POST', form: fd }); } }
          toast(isNew ? 'Product published - live on the website' : 'Saved'); ov.remove(); done();
        } catch (x) { toast(x.message, 1); btn.disabled = false; btn.textContent = isNew ? 'PUBLISH PRODUCT' : 'Save changes'; if (isNew && x.status == null) { /* product may exist without media */ } }
      };
    } });
  return s;
}
