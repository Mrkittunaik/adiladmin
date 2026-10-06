/* Tiny dependency-free SVG charts (no CDN, works under the strict CSP) */
const COLORS = { visits: '#141414', whatsapp: '#128C4A', productViews: '#2b6cb0', cartAdds: '#DC0000', enquiries: '#b7791f' };
function lineChart(labels, series) {
  const W = 640, H = 220, L = 34, R = 10, T = 10, B = 26, n = labels.length;
  const max = Math.max(4, ...series.flatMap(s => s.data));
  const nice = Math.ceil(max / 4) * 4;
  const x = i => L + (n <= 1 ? (W - L - R) / 2 : i * (W - L - R) / (n - 1)), y = v => T + (H - T - B) * (1 - v / nice);
  let g = '';
  for (let k = 0; k <= 4; k++) { const v = nice * k / 4; g += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="#ebe8df"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end" font-size="11" fill="#8a8d92">${Math.round(v)}</text>`; }
  const step = Math.ceil(n / 7);
  labels.forEach((l, i) => { if (i % step === 0 || i === n - 1) g += `<text x="${x(i)}" y="${H - 7}" text-anchor="middle" font-size="11" fill="#8a8d92">${esc(l.length > 5 ? l.slice(5) : l)}</text>`; });
  const lines = series.map(s => {
    const pts = s.data.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
    return `<polyline fill="none" stroke="${s.color}" stroke-width="2.2" stroke-linejoin="round" points="${pts}"/>` + (n <= 14 ? s.data.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="2.6" fill="${s.color}"><title>${esc(labels[i])}: ${v} ${esc(s.name)}</title></circle>`).join('') : '');
  }).join('');
  return `<div class="legend">${series.map(s => `<span><i style="background:${s.color}"></i>${esc(s.name)} (${s.data.reduce((a, b) => a + b, 0)})</span>`).join('')}</div><svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Chart">${g}${lines}</svg>`;
}
function barList(items, labelKey, valKey, emptyMsg = 'No data yet') {
  if (!items || !items.length) return `<p style="color:var(--soft);margin:0">${emptyMsg}</p>`;
  const max = Math.max(...items.map(i => valKey(i)), 1);
  return `<div class="bars">${items.map(i => `<div><div class="row"><span>${esc(labelKey(i))}</span><b>${num(valKey(i))}</b></div><div class="bar"><i style="width:${Math.round(valKey(i) / max * 100)}%"></i></div></div>`).join('')}</div>`;
}
