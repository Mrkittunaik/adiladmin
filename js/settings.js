/* Admin > Categories and Settings */
Pages.categories = async (el) => {
  el.innerHTML = `<div class="page-h"><h2>Categories</h2><button class="btn pri" id="addC">${ic('plus')} Add category</button></div><p style="color:var(--soft);margin-top:-6px">Top-level categories show in the shop menu; sub-categories group products inside them. New or hidden categories update on the website automatically.</p><div id="cl" class="list">${skeleton(4)}</div>`;
  const draw = async () => {
    try {
      const cats = (await api('/categories')).items, groups = cats.filter(c => !c.parent), kids = g => cats.filter(c => String(c.parent) === String(g._id));
      const row = (c, sub) => `<div class="item" data-id="${c._id}" style="${sub ? 'margin-left:18px' : ''}"><div class="item-h" style="cursor:default"><div class="t"><b>${esc(c.name)}</b><small>${c.productCount} product(s)${sub ? '' : ' · top-level'}</small></div>${c.isActive ? badge('VISIBLE', 'ok') : badge('HIDDEN')}</div>
        <div class="item-b" style="display:block;padding-top:8px"><div class="acts" style="margin-top:0">${!sub ? `<button class="btn sm" data-a="up">↑</button><button class="btn sm" data-a="down">↓</button>` : ''}<button class="btn sm" data-a="rename">Rename</button><button class="btn sm" data-a="toggle">${c.isActive ? 'Hide' : 'Show'}</button>${!sub ? '<button class="btn sm" data-a="sub">+ Sub-category</button>' : ''}<button class="btn sm bad" data-a="del">Delete</button></div></div></div>`;
      $('#cl').innerHTML = groups.length ? groups.map(g => row(g, false) + kids(g).map(k => row(k, true)).join('')).join('') : empty('No categories yet');
      el.onclick = async e => {
        const b = e.target.closest('[data-a]'); if (!b) return; const id = b.closest('.item').dataset.id, c = cats.find(x => x._id === id), a = b.dataset.a;
        try {
          if (a === 'toggle') { await api('/categories/' + id, { method: 'PUT', body: { isActive: !c.isActive } }); }
          else if (a === 'rename') { const n = prompt('New name', c.name); if (!n) return; await api('/categories/' + id, { method: 'PUT', body: { name: n } }); }
          else if (a === 'sub') { const n = prompt('Sub-category name'); if (!n) return; await api('/categories', { method: 'POST', body: { name: n, parent: id } }); }
          else if (a === 'up' || a === 'down') { const ids = groups.map(g => g._id), i = ids.indexOf(id), j = a === 'up' ? i - 1 : i + 1; if (j < 0 || j >= ids.length) return; [ids[i], ids[j]] = [ids[j], ids[i]]; await api('/categories/reorder', { method: 'PUT', body: { ids } }); }
          else if (a === 'del') {
            try { if (!await confirmBox(`Delete "${c.name}"?`, 'Delete', true)) return; await api('/categories/' + id, { method: 'DELETE' }); }
            catch (x) { if (x.status !== 409) throw x; const others = cats.filter(o => o._id !== id && String(o.parent) !== id);
              const s = sheet({ title: 'Move products first', small: true, body: `<p>${esc(x.message)}</p><div class="f"><div class="full"><select id="mv">${others.map(o => `<option value="${o._id}">${esc(o.name)}</option>`).join('')}</select></div></div>`, footer: '<button class="btn" data-close>Cancel</button><button class="btn pri" id="mvgo">Move &amp; delete</button>' });
              $('#mvgo', s.el).onclick = async () => { try { await api(`/categories/${id}?reassignTo=${$('#mv', s.el).value}`, { method: 'DELETE' }); s.close(); toast('Category deleted'); draw(); } catch (y) { toast(y.message, 1); } }; return; }
          }
          toast('Saved - live on the website'); draw();
        } catch (x) { toast(x.message, 1); }
      };
    } catch (e) { $('#cl').innerHTML = empty(e.message); }
  };
  await draw();
  $('#addC').onclick = async () => { const n = prompt('Category name (e.g. Gaming, Dining)'); if (!n) return; try { await api('/categories', { method: 'POST', body: { name: n } }); toast('Category added - live on the website'); draw(); } catch (x) { toast(x.message, 1); } };
  A.liveHandler = null;
};

Pages.settings = async (el) => {
  el.innerHTML = `<div class="page-h"><h2>Settings</h2></div><div id="sb">${skeleton(4)}</div>`;
  let s; try { s = await api('/settings'); } catch (e) { $('#sb').innerHTML = empty(e.message); return; }
  const t = (path, label, type = 'text', extra = '') => { const v = path.split('.').reduce((o, k) => (o || {})[k], s); return `<div><label>${label}</label><input data-k="${path}" type="${type}" value="${esc(Array.isArray(v) ? v.join(', ') : v ?? '')}" ${extra}></div>`; };
  const chk = (path, label) => { const v = path.split('.').reduce((o, k) => (o || {})[k], s); return `<label><input type="checkbox" data-k="${path}" ${v ? 'checked' : ''}>${label}</label>`; };
  $('#sb').innerHTML = `<div class="grid two" style="align-items:start"><div class="grid">
    <div class="card"><div class="sec-h">Business</div><div class="f">${t('siteName', 'Site name')}${t('whatsappNumber', 'WhatsApp number (with country code)', 'tel')}${t('businessPhone', 'Business phone', 'tel')}${t('businessEmail', 'Business email', 'email')}<div class="full">${t('businessAddress', 'Business address')}</div>${t('currency', 'Currency')}</div></div>
    <div class="card"><div class="sec-h">Pricing &amp; stock</div><div class="f">${t('freeShipThreshold', 'Free delivery above (₹)', 'number')}${t('deliveryCharge', 'Delivery charge (₹)', 'number')}${t('installationCharge', 'Installation charge (₹)', 'number')}${t('lowStockThreshold', 'Default low-stock threshold', 'number')}</div></div>
    <div class="card"><div class="sec-h">Bulk enquiry</div><div class="f"><div class="full checks">${chk('bulk.enabled', 'Bulk enquiry enabled')}</div>${t('bulk.minQty', 'Minimum bulk quantity', 'number')}${t('bulk.discountPercent', 'Optional discount % (0 = don\'t mention)', 'number')}<div class="full">${t('bulk.message', 'Bulk enquiry message')}</div><div class="full">${t('bulk.customMessage', 'Custom message when bulk quantity is selected (optional)')}</div></div></div></div>
    <div class="grid">
    <div class="card"><div class="sec-h">Lead popup</div><div class="f"><div class="full checks">${chk('popup.enabled', 'Popup enabled')}${chk('popup.showInterest', 'Ask “Interested in”')}</div>${t('popup.delaySeconds', 'Delay (seconds)', 'number')}${t('popup.frequencyHours', 'Show again after (hours)', 'number')}<div class="full">${t('popup.title', 'Title')}</div><div class="full">${t('popup.description', 'Description')}</div>${t('popup.cta', 'Button text')}<div class="full">${t('popup.interests', 'Interest options (comma separated)')}</div></div></div>
    <div class="card"><div class="sec-h">Homepage, social &amp; footer</div><div class="f"><div class="full">${t('home.heroTitle', 'Homepage hero heading')}</div>${t('social.instagram', 'Instagram URL')}${t('social.facebook', 'Facebook URL')}${t('social.youtube', 'YouTube URL')}<div class="full">${t('footerText', 'Footer text')}</div></div></div>
    <div class="card"><div class="sec-h">Demo data</div><p style="color:var(--soft);margin:0 0 10px;font-size:14px">The original catalogue can be (re)imported as demo products at any time. Real products are never touched.</p><button class="btn" id="imp">Import demo catalogue</button></div></div></div>
    <div class="acts" style="margin-top:14px"><button class="btn pri" id="saveS">Save settings</button></div>`;
  $('#imp').onclick = async () => { try { const r = await api('/products/demo', { method: 'POST', body: { action: 'import' } }); toast(`${r.affected} demo product(s) imported`); } catch (x) { toast(x.message, 1); } };
  $('#saveS').onclick = async () => {
    const body = {};
    $$('[data-k]').forEach(i => { const ks = i.dataset.k.split('.'); let o = body; ks.slice(0, -1).forEach(k => o = o[k] = o[k] || {}); o[ks.at(-1)] = i.type === 'checkbox' ? i.checked : i.type === 'number' ? +i.value : i.value; });
    try { await api('/settings', { method: 'PUT', body }); toast('Settings saved - website updated'); } catch (x) { toast(x.message, 1); }
  };
  A.liveHandler = null;
};
