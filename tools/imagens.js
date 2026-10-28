// Gera as imagens otimizadas (AVIF + WebP) em assets/img a partir de tools/src.
// Uso: node tools/imagens.js <caminho do sharp>          (tudo)
//      node tools/imagens.js <caminho do sharp> demos    (só os modelos de outros segmentos)
const sharp = require(process.argv[2]);
const path = require('path');
const src = (f) => path.join(__dirname, 'src', f);
const out = (f) => path.join(__dirname, '..', 'assets', 'img', f);

async function variants(pipeline, name, widths, q = { avif: 50, webp: 74 }) {
  for (const w of widths) {
    const base = pipeline().resize({ width: w });
    await base.clone().avif({ quality: q.avif, effort: 6 }).toFile(out(`${name}-${w}.avif`));
    await base.clone().webp({ quality: q.webp, effort: 6 }).toFile(out(`${name}-${w}.webp`));
  }
}

const DEMOS = ['navalha-co-barbearia', 'patas-felizes-banho-tosa', 'doce-atelie-confeitaria'];

async function demos() {
  // Capturas dos modelos de outros segmentos (tools/capturar-demos.js), salvas como demo-<modelo>-*.
  for (const m of DEMOS) {
    await variants(() => sharp(src(`demo-${m}-mobile.png`)).extract({ left: 0, top: 0, width: 780, height: 1600 }), `demo-${m}-mobile`, [300, 600]);
    await variants(() => sharp(src(`demo-${m}-desktop.png`)), `demo-${m}-desktop`, [720, 1200]);
  }
}

(async () => {
  if (process.argv[3] === 'demos') return demos();
  // Foto do hero: Harrycapta, CC BY-SA 4.0 — recorte vertical centrado na politriz.
  await variants(() => sharp(src('polimento.jpg')).rotate().extract({ left: 0, top: 900, width: 3376, height: 4220 }),
    'polimento', [560, 840, 1200]);
  // Fechamento: Kotivalo, CC BY-SA 4.0 — recorte nas gotas, em preto e branco com mais contraste.
  await variants(() => sharp(src('gotas.jpg')).rotate().extract({ left: 0, top: 420, width: 2061, height: 1108 })
      .grayscale().linear(1.9, -150),
    'gotas', [900, 1600, 2000], { avif: 45, webp: 70 });
  const modelos = ['colecao-black-diamond-detail', 'colecao-prime-car-estetica', 'colecao-autoclean-express'];
  for (const m of modelos) {
    await variants(() => sharp(src(`${m}-mobile.png`)).extract({ left: 0, top: 0, width: 780, height: 1600 }),
      `${m}-mobile`, [300, 600]);
    await variants(() => sharp(src(`${m}-desktop.png`)), `${m}-desktop`, [720, 1200]);
  }
  await demos();
})();
