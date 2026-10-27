// Gera assets/img/og.jpg a partir de tools/og.html (servidor local precisa estar rodando).
// Uso: node tools/og.js <caminho do playwright> [porta]
const { chromium } = require(process.argv[2]);
const path = require('path');
const porta = process.argv[3] || 8787;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  await p.goto(`http://localhost:${porta}/site-express/tools/og.html`, { waitUntil: 'networkidle' });
  await p.screenshot({ path: path.join(__dirname, '..', 'assets', 'img', 'og.jpg'), type: 'jpeg', quality: 85 });
  await b.close();
})();
