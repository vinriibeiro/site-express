// Captura os modelos de outros segmentos (empresas fictícias) para a landing.
// Uso: node tools/capturar-demos.js <caminho do playwright> [endereço base do catálogo]
// O endereço base padrão é o catálogo publicado; para testar antes de publicar, sirva a pasta
// do catálogo localmente e passe, por exemplo, http://localhost:8790/modelos/
const { chromium } = require(process.argv[2]);
const path = require('path');
const out = path.join(__dirname, 'src');
const base = process.argv[3] || 'https://vinriibeiro.github.io/modelos/modelos/';
const modelos = ['navalha-co-barbearia', 'patas-felizes-banho-tosa', 'doce-atelie-confeitaria'];
(async () => {
  const b = await chromium.launch();
  for (const m of modelos) {
    const mob = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await mob.goto(base + m + '/', { waitUntil: 'networkidle' });
    await mob.waitForTimeout(1500);
    await mob.screenshot({ path: path.join(out, 'demo-' + m + '-mobile.png') });
    await mob.close();
    const desk = await b.newPage({ viewport: { width: 1440, height: 900 } });
    await desk.goto(base + m + '/', { waitUntil: 'networkidle' });
    await desk.waitForTimeout(1500);
    await desk.screenshot({ path: path.join(out, 'demo-' + m + '-desktop.png') });
    await desk.close();
  }
  await b.close();
})();
