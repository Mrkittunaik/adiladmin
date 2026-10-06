/* Square crop & adjust before upload. cropImages(files) -> Promise<File[]>
   Drag to move, slider to zoom (zoom all the way out = whole image with white padding). Output: 1200x1200 JPEG. */
const CROP_OUT = 1200;
function cropImages(files) {
  return files.reduce((chain, f) => chain.then(async acc => { const r = await cropOne(f); if (r) acc.push(r); return acc; }), Promise.resolve([]));
}
function cropOne(file) {
  return new Promise(resolve => {
    const url = URL.createObjectURL(file), img = new Image();
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };       // unreadable preview: upload as is
    img.onload = () => {
      const ov = document.createElement('div'); ov.className = 'crop-ov';
      ov.innerHTML = `<div class="crop-box"><h3>Adjust image</h3><small>Drag to move · slide to zoom. Shop shows this as a square.</small>
        <canvas class="crop-stage" width="480" height="480"></canvas>
        <input type="range" min="0" max="100" value="0" aria-label="Zoom">
        <div class="crop-row"><button type="button" class="btn" data-fit>Fit whole</button><button type="button" class="btn" data-fill>Fill square</button></div>
        <div class="crop-row"><button type="button" class="btn" data-skip>Use original</button><button type="button" class="btn pri" data-ok>Apply</button></div></div>`;
      document.body.appendChild(ov);
      const cv = ov.querySelector('canvas'), ctx = cv.getContext('2d'), sl = ov.querySelector('input'), F = cv.width;
      const iw = img.naturalWidth, ih = img.naturalHeight;
      const sFit = F / Math.max(iw, ih), sFill = F / Math.min(iw, ih), sMax = sFill * 3;
      let s = sFill, ox = (F - iw * s) / 2, oy = (F - ih * s) / 2;
      const clamp = () => {
        const w = iw * s, h = ih * s;
        ox = w >= F ? Math.min(0, Math.max(F - w, ox)) : (F - w) / 2;
        oy = h >= F ? Math.min(0, Math.max(F - h, oy)) : (F - h) / 2;
      };
      const draw = (c, k) => { c.fillStyle = '#fff'; c.fillRect(0, 0, F * k, F * k); c.drawImage(img, ox * k, oy * k, iw * s * k, ih * s * k); };
      const render = () => { clamp(); draw(ctx, 1); sl.value = Math.round((s - sFit) / (sMax - sFit) * 100); };
      const setScale = ns => { const cx = (F / 2 - ox) / s, cy = (F / 2 - oy) / s; s = Math.min(sMax, Math.max(sFit, ns)); ox = F / 2 - cx * s; oy = F / 2 - cy * s; render(); };
      sl.oninput = () => setScale(sFit + (sMax - sFit) * sl.value / 100);
      ov.querySelector('[data-fit]').onclick = () => setScale(sFit);
      ov.querySelector('[data-fill]').onclick = () => { s = sFill; ox = (F - iw * s) / 2; oy = (F - ih * s) / 2; render(); };
      let drag = null;
      cv.onpointerdown = e => { drag = { x: e.clientX, y: e.clientY, ox, oy }; cv.setPointerCapture(e.pointerId); };
      cv.onpointermove = e => { if (!drag) return; const k = F / cv.getBoundingClientRect().width; ox = drag.ox + (e.clientX - drag.x) * k; oy = drag.oy + (e.clientY - drag.y) * k; render(); };
      cv.onpointerup = cv.onpointercancel = () => { drag = null; };
      const done = r => { ov.remove(); URL.revokeObjectURL(url); resolve(r); };
      ov.querySelector('[data-skip]').onclick = () => done(file);
      ov.querySelector('[data-ok]').onclick = () => {
        const out = document.createElement('canvas'); out.width = out.height = CROP_OUT;
        draw(out.getContext('2d'), CROP_OUT / F);
        out.toBlob(b => done(b ? new File([b], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' }) : file), 'image/jpeg', 0.88);
      };
      render();
    };
    img.src = url;
  });
}
