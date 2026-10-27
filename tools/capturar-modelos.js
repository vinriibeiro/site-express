// Captura os modelos demonstrativos do catálogo público (empresas fictícias) para a seção "Modelos".
// Uso: node tools/capturar-modelos.js <caminho do playwright>
const { chromium } = require(process.argv[2]);
const path = require('path');
const out = path.join(__dirname, 'src');
const base = 'https://vinriibeiro.github.io/modelos/modelos/';
const modelos = ['colecao-black-diamond-detail', 'colecao-prime-car-estetica', 'colecao-autoclean-express'];
(async () => {
  const b = await chromium.launch();
  for (const m of modelos) {
    const mob = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await mob.goto(base + m + '/', { waitUntil: 'networkidle' });
    await mob.waitForTimeout(1500);
    await mob.screenshot({ path: path.join(out, m + '-mobile.png') });
    await mob.close();
    const desk = await b.newPage({ viewport: { width: 1440, height: 900 } });
    await desk.goto(base + m + '/', { waitUntil: 'networkidle' });
    await desk.waitForTimeout(1500);
    await desk.screenshot({ path: path.join(out, m + '-desktop.png') });
    await desk.close();
  }
  await b.close();
})();
