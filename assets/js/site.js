// Site Express — comportamento da página.
// Os links de WhatsApp são <a href> comuns: tudo aqui é melhoria e a página funciona sem JS.
(function () {
  'use strict';

  var doc = document.documentElement;
  doc.classList.add('js');

  var config = window.SITE_EXPRESS_CONFIG || {};
  var CHAVE = 'siteExpress.cliquesWhatsApp';

  // ---- Rastreamento local dos cliques no WhatsApp ----
  // Guarda só contadores por botão e a data do último clique, neste navegador.
  // Nada é enviado a servidor. Se o armazenamento estiver bloqueado, não faz nada.
  function lerCliques() {
    try {
      var bruto = window.localStorage.getItem(CHAVE);
      var dados = bruto ? JSON.parse(bruto) : null;
      if (dados && typeof dados === 'object' && dados.porBotao) return dados;
    } catch (e) { /* armazenamento indisponível ou dado inválido */ }
    return { total: 0, porBotao: {}, ultimoClique: null };
  }

  function registrarClique(botao) {
    try {
      var dados = lerCliques();
      dados.total += 1;
      dados.porBotao[botao] = (dados.porBotao[botao] || 0) + 1;
      dados.ultimoClique = new Date().toISOString().slice(0, 10);
      window.localStorage.setItem(CHAVE, JSON.stringify(dados));
    } catch (e) { /* armazenamento bloqueado: segue sem registrar */ }
  }

  // Para consultar no console do navegador: siteExpressCliques()
  window.siteExpressCliques = lerCliques;

  // ---- Meta Pixel (desativado enquanto não houver ID real) ----
  var pixelId = String(config.metaPixelId || '').trim();
  var pixelAtivo = /^\d{10,20}$/.test(pixelId);

  if (pixelAtivo) {
    /* Código-base oficial do Meta Pixel, carregado só com ID configurado. */
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');
  }

  function eventoPixel(botao) {
    if (pixelAtivo && typeof window.fbq === 'function') {
      window.fbq('track', 'Contact', { content_name: 'whatsapp_' + botao });
    }
  }

  document.addEventListener('click', function (ev) {
    var alvo = ev.target.closest ? ev.target.closest('a[data-wa]') : null;
    if (!alvo) return;
    var botao = alvo.getAttribute('data-wa') || 'desconhecido';
    registrarClique(botao);
    eventoPixel(botao);
  });

  // ---- Animação discreta de entrada ----
  var reduzir = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var itens = document.querySelectorAll('.revelar');
  if (reduzir || !('IntersectionObserver' in window)) {
    itens.forEach(function (el) { el.classList.add('is-visivel'); });
  } else {
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visivel'); obs.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    itens.forEach(function (el) { obs.observe(el); });
  }

  // ---- Botão flutuante: some enquanto outro botão de WhatsApp está à vista ----
  var flutuante = document.querySelector('.flutuante');
  var ctas = document.querySelectorAll('.hero .acoes, .oferta .btn--primario, .final .btn--primario');
  if (flutuante && ctas.length && 'IntersectionObserver' in window) {
    var visiveis = new Set();
    var obsCta = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (en.isIntersecting) visiveis.add(en.target); else visiveis.delete(en.target);
      });
      flutuante.classList.toggle('is-oculto', visiveis.size > 0);
    });
    ctas.forEach(function (el) { obsCta.observe(el); });
  }
})();
