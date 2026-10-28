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

  // ---- Origem da visita na mensagem do WhatsApp ----
  // Links de anúncio/bio levam ?ref=codigo (ou utm_source + utm_content). O código vai
  // visível no fim da mensagem pronta, para saber de onde veio a conversa.
  // Sem cookie: fica só nesta aba (sessionStorage) e só com letras, números e hífen.
  var CHAVE_ORIGEM = 'siteExpress.origem';
  function limparCodigo(v) { return String(v || '').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 24); }
  var origem = '';
  try {
    var q = new URLSearchParams(location.search);
    origem = limparCodigo(q.get('ref') || [q.get('utm_source'), q.get('utm_content')].filter(Boolean).join('-'));
    if (origem) window.sessionStorage.setItem(CHAVE_ORIGEM, origem);
    else origem = limparCodigo(window.sessionStorage.getItem(CHAVE_ORIGEM));
  } catch (e) { /* sem URLSearchParams ou armazenamento: segue sem código */ }

  function marcarOrigem(link) {
    if (!origem || link.getAttribute('data-ref-ok')) return;
    try {
      var url = new URL(link.href);
      url.searchParams.set('text', (url.searchParams.get('text') || '') + '\n\n(ref: ' + origem + ')');
      link.href = url.toString();
      link.setAttribute('data-ref-ok', '1');
    } catch (e) { /* mantém o link original */ }
  }

  // ---- Meta Pixel (só com ID configurado e depois do consentimento) ----
  var pixelId = String(config.metaPixelId || '').trim();
  var pixelConfigurado = /^\d{10,20}$/.test(pixelId);
  var pixelCarregado = false;
  var contatoEnviado = false;
  var CHAVE_CONSENTIMENTO = 'siteExpress.consentimentoPixel';
  var consentimentoSessao = null; // usado se o armazenamento estiver bloqueado

  function lerConsentimento() {
    try {
      var dados = JSON.parse(window.localStorage.getItem(CHAVE_CONSENTIMENTO));
      if (dados && (dados.escolha === 'aceito' || dados.escolha === 'recusado')) return dados.escolha;
    } catch (e) { /* armazenamento indisponível ou dado inválido */ }
    return consentimentoSessao;
  }

  function salvarConsentimento(escolha) {
    consentimentoSessao = escolha;
    try {
      window.localStorage.setItem(CHAVE_CONSENTIMENTO, JSON.stringify({ escolha: escolha, data: new Date().toISOString().slice(0, 10) }));
    } catch (e) { /* vale só para esta visita */ }
  }

  function carregarPixel() {
    if (!pixelConfigurado || pixelCarregado) return;
    pixelCarregado = true;
    /* Código-base oficial do Meta Pixel. */
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('consent', 'grant');
    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');
  }

  function desligarPixel() {
    if (typeof window.fbq === 'function') window.fbq('consent', 'revoke');
    // Apaga os cookies que o Pixel cria neste domínio.
    ['_fbp', '_fbc'].forEach(function (nome) {
      document.cookie = nome + '=; Max-Age=0; path=/';
      document.cookie = nome + '=; Max-Age=0; path=/; domain=' + location.hostname;
      document.cookie = nome + '=; Max-Age=0; path=/; domain=.' + location.hostname;
    });
  }

  // Contact = intenção de contato (clique no WhatsApp), não conversa nem venda.
  // No máximo um por carregamento de página, qualquer que seja o botão.
  function eventoPixel(botao) {
    if (contatoEnviado || !pixelCarregado || lerConsentimento() !== 'aceito' || typeof window.fbq !== 'function') return;
    contatoEnviado = true;
    window.fbq('track', 'Contact', { content_name: 'whatsapp_' + botao });
  }

  document.addEventListener('click', function (ev) {
    var alvo = ev.target.closest ? ev.target.closest('a[data-wa]') : null;
    if (!alvo) return;
    var botao = alvo.getAttribute('data-wa') || 'desconhecido';
    marcarOrigem(alvo);
    registrarClique(botao);
    eventoPixel(botao);
  });

  // ---- Aviso de privacidade (consentimento do Meta Pixel) ----
  var aviso = document.getElementById('aviso-privacidade');

  function mostrarAviso() {
    if (!aviso) return;
    aviso.hidden = false;
    document.body.classList.add('com-aviso');
  }

  function fecharAviso() {
    if (!aviso) return;
    aviso.hidden = true;
    document.body.classList.remove('com-aviso');
  }

  if (pixelConfigurado && aviso) {
    aviso.addEventListener('click', function (ev) {
      var botao = ev.target.closest ? ev.target.closest('[data-consentimento]') : null;
      if (!botao) return;
      var escolha = botao.getAttribute('data-consentimento');
      salvarConsentimento(escolha);
      fecharAviso();
      if (escolha === 'aceito') carregarPixel(); else desligarPixel();
    });

    document.querySelectorAll('[data-preferencias]').forEach(function (link) {
      link.hidden = false;
      link.addEventListener('click', function (ev) { ev.preventDefault(); mostrarAviso(); });
    });

    var escolhaAtual = lerConsentimento();
    if (escolhaAtual === 'aceito') carregarPixel();
    if (!escolhaAtual || location.hash === '#preferencias') mostrarAviso();
    window.addEventListener('hashchange', function () { if (location.hash === '#preferencias') mostrarAviso(); });
  }

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
