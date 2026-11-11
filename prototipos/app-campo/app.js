/* Aplicativo de Campo · protótipo da Soluções Digitais Express.
   Tudo roda no navegador, em memória. Nada é enviado a lugar algum. */
(function () {
  'use strict';
  var D = window.BRISA;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var fmtN = function (n) { return Math.round(n).toLocaleString('pt-BR'); };
  var brl = function (n) { return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); };
  var reduz = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var espera = function (ms) { return new Promise(function (r) { setTimeout(r, reduz ? Math.min(ms, 150) : ms); }); };
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var hhmm = function (m) { return pad(Math.floor(m / 60) % 24) + ':' + pad(m % 60); };
  var minDe = function (h) { var p = h.split(':'); return +p[0] * 60 + +p[1]; };

  if (/[?&]solo\b/.test(location.search)) document.documentElement.classList.add('solo');

  /* ---------- Ícones (SVG inline, traço) ---------- */
  var P = {
    home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
    clip: '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="m9 14 2 2 4-4"/>',
    plus: '<circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/>',
    plusSm: '<path d="M12 5v14M5 12h14"/>',
    cloud: '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>',
    cloudOff: '<path d="M22.6 17A5 5 0 0 0 18 10h-1.3a8 8 0 0 0-7-6M5 5a8 8 0 0 0 4 15h9a5 5 0 0 0 1.7-.3M1 1l22 22"/>',
    wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z"/><path d="M7 7h.01"/>',
    headset: '<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>',
    receipt: '<path d="M4 2v20l2-1.5L8 22l2-1.5L12 22l2-1.5L16 22l2-1.5L20 22V2l-2 1.5L16 2l-2 1.5L12 2l-2 1.5L8 2 6 3.5z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    chevR: '<path d="m9 18 6-6-6-6"/>',
    chevL: '<path d="m15 18-6-6 6-6"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    pin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    camera: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
    wifiOff: '<path d="M1 1l22 22M16.7 11.1A11 11 0 0 1 19 12.6M5 12.6a11 11 0 0 1 5.2-2.4M10.7 5.1A16 16 0 0 1 22.6 9M1.4 9a16 16 0 0 1 4.7-2.9M8.5 16.1a6 6 0 0 1 7 0M12 20h.01"/>',
    wifi: '<path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/>',
    refresh: '<path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.5 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.5 15"/>',
    send: '<path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/>',
    nav: '<path d="m3 11 19-9-9 19-2-8z"/>',
    cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    userx: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m17 8 5 5M22 8l-5 5"/>',
    alert: '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/>',
    more: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
    chart: '<path d="M12 20V10M18 20V4M6 20v-4"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    flag: '<path d="M4 22V4M4 4h13l-2 4 2 4H4"/>',
    box: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>'
  };
  var ic = function (n, cls) { return '<svg class="ic' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + P[n] + '</svg>'; };

  /* ---------- Ilustrações dos estados vazios ---------- */
  var ILU = {
    visita: '<svg class="ilu" viewBox="0 0 160 120" aria-hidden="true"><ellipse cx="80" cy="109" rx="52" ry="6" fill="#dde7f6"/><circle cx="80" cy="56" r="46" fill="#e6edfc"/><rect x="52" y="22" width="56" height="72" rx="9" fill="#fff" stroke="#c8d7ef" stroke-width="2"/><rect x="68" y="16" width="24" height="12" rx="5" fill="#1e3a8a"/><path d="M62 48h36M62 60h36M62 72h22" stroke="#c8d7ef" stroke-width="4" stroke-linecap="round"/><path d="M122 68c0 13-15 26-15 26s-15-13-15-26a15 15 0 0 1 30 0z" fill="#3b82f6"/><circle cx="107" cy="68" r="5.5" fill="#fff"/></svg>',
    rotaOk: '<svg class="ilu" viewBox="0 0 160 120" aria-hidden="true"><ellipse cx="80" cy="109" rx="52" ry="6" fill="#dde7f6"/><circle cx="80" cy="56" r="46" fill="#e4f5ec"/><rect x="58" y="24" width="4" height="70" rx="2" fill="#42597d"/><path d="M62 28h42l-8 14 8 14H62z" fill="#0f7a4d"/><path d="m72 42 6 6 11-12" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="116" cy="34" r="3" fill="#93c5fd"/><circle cx="40" cy="70" r="4" fill="#93c5fd"/></svg>',
    nuvem: '<svg class="ilu" viewBox="0 0 160 120" aria-hidden="true"><ellipse cx="80" cy="109" rx="52" ry="6" fill="#dde7f6"/><circle cx="80" cy="56" r="46" fill="#e6edfc"/><path d="M110 70a18 18 0 0 0-4-35 26 26 0 0 0-50 6 15 15 0 0 0 2 29z" fill="#fff" stroke="#c8d7ef" stroke-width="2"/><circle cx="104" cy="74" r="16" fill="#0f7a4d"/><path d="m96 74 6 6 10-12" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>',
    enviado: '<svg class="ilu" viewBox="0 0 160 120" aria-hidden="true"><ellipse cx="80" cy="109" rx="52" ry="6" fill="#dde7f6"/><circle cx="80" cy="56" r="46" fill="#e4f5ec"/><circle cx="80" cy="56" r="26" fill="#0f7a4d"/><path d="m67 56 9 9 18-19" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="125" cy="30" r="4" fill="#93c5fd"/><circle cx="34" cy="78" r="5" fill="#93c5fd"/><circle cx="124" cy="86" r="3" fill="#3b82f6"/></svg>',
    guardado: '<svg class="ilu" viewBox="0 0 160 120" aria-hidden="true"><ellipse cx="80" cy="109" rx="52" ry="6" fill="#dde7f6"/><circle cx="80" cy="56" r="46" fill="#fdf1de"/><rect x="56" y="26" width="48" height="60" rx="9" fill="#fff" stroke="#e8c98f" stroke-width="2"/><rect x="72" y="31" width="16" height="4" rx="2" fill="#e8c98f"/><circle cx="80" cy="60" r="14" fill="#a85d00"/><path d="M80 52v8l5 3" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>'
  };

  /* ---------- Estado (em memória) ---------- */
  var T0 = Date.now();
  var agoraMin = function () { return D.dia.inicioMin + Math.floor((Date.now() - T0) / 60000); };
  var STATUS = {
    pendente: { t: 'Pendente', c: 'mut' },
    andamento: { t: 'Em atendimento', c: 'info' },
    concluida: { t: 'Concluída', c: 'ok' },
    venda: { t: 'Venda fechada', c: 'ok' },
    ausente: { t: 'Cliente ausente', c: 'at' },
    reagendada: { t: 'Reagendada', c: 'at' }
  };
  var RESULT = [
    { id: 'concluida', t: 'Concluída', i: 'check' },
    { id: 'ausente', t: 'Cliente ausente', i: 'userx' },
    { id: 'reagendada', t: 'Reagendar', i: 'cal' },
    { id: 'venda', t: 'Venda fechada', i: 'tag' }
  ];
  var novoF = function () { return { checkin: null, dist: 0, buscando: false, checks: [], obs: '', fotos: [], resultado: '', plano: '', slot: D.reagendar[0], erro: '' }; };
  var novoForm = function () { return { etapa: 1, tipo: 'venda', nome: '', tel: '', bairro: '', plano: '', ocorr: '', obs: '', erros: {}, sucesso: null }; };
  var planoDe = function (id) { return D.planos.filter(function (p) { return p.id === id; })[0]; };
  var fotoDe = function (id) { return D.fotos.filter(function (p) { return p.id === id; })[0]; };

  var E = {
    aba: 'hoje', filtro: 'todas', verFeitas: false, ativa: null, offline: false,
    sinc: { rodando: false, feitos: 0, total: 0 },
    visitas: D.visitas.map(function (v) {
      var f = novoF(); if (v.feito) { for (var k in v.feito) f[k] = Array.isArray(v.feito[k]) ? v.feito[k].slice() : v.feito[k]; }
      return { id: v.id, hora: v.hora, tipo: v.tipo, cliente: v.cliente, tel: v.tel, end: v.end, bairro: v.bairro, ref: v.ref, nota: v.nota, st: v.status, f: f };
    }),
    registros: [], feed: D.gestor.feed.slice(), form: novoForm(), seq: 0
  };
  E.visitas.forEach(function (v) {
    if (v.st !== 'pendente') E.registros.unshift({ id: 'r' + (++E.seq), origem: 'visita', visitaId: v.id, titulo: v.cliente, detalhe: v.st === 'venda' ? 'Venda fechada · ' + planoDe(v.f.plano).nome : D.tipos[v.tipo].nome + ' · ' + STATUS[v.st].t, hora: v.f.checkin, sync: 'enviado', venda: v.st === 'venda' });
  });

  var resolvida = function (v) { return v.st !== 'pendente' && v.st !== 'andamento'; };
  var feitas = function () { return E.visitas.filter(resolvida).length; };
  var proxima = function () { return E.visitas.filter(function (v) { return !resolvida(v); })[0]; };
  var pendentes = function () { return E.registros.filter(function (r) { return r.sync !== 'enviado'; }); };
  var vendasHoje = function () { return E.registros.filter(function (r) { return r.venda; }).length; };
  var ativa = function () { return E.visitas.filter(function (v) { return v.id === E.ativa; })[0]; };
  var gestorNums = function () {
    var env = E.registros.filter(function (r) { return r.sync === 'enviado'; });
    return {
      visitas: D.gestor.visitas + env.filter(function (r) { return r.origem === 'visita'; }).length,
      vendas: D.gestor.vendas + env.filter(function (r) { return r.venda; }).length,
      ocorr: D.gestor.ocorrencias + env.filter(function (r) { return r.origem === 'ocorrencia'; }).length
    };
  };

  /* ---------- Animações de números, barras e anel ---------- */
  var cur = {}, shown = {}, tween = {};
  var C_ANEL = 2 * Math.PI * 38;
  function animar(raiz) {
    $$('[data-anim]', raiz).forEach(function (el) {
      var k = el.dataset.k, v = parseFloat(el.dataset.v), tipo = el.dataset.anim;
      var antes = (k in cur) ? cur[k] : 0;
      cur[k] = v;
      if (tipo === 'num') {
        var de = (k in shown) ? shown[k] : 0;
        if (v > antes && antes > 0) { var cx = el.closest('.cont-b'); if (cx) { cx.classList.add('sobe'); setTimeout(function () { cx.classList.remove('sobe'); }, 1500); } }
        tweenNum(el, k, de, v);
      } else if (tipo === 'barra') {
        var prop = el.dataset.prop || 'width', un = el.dataset.un || '%';
        el.style[prop] = antes + un; void el.offsetWidth;
        requestAnimationFrame(function () { el.style[prop] = v + un; });
      } else if (tipo === 'anel') {
        el.style.strokeDasharray = C_ANEL; el.style.strokeDashoffset = C_ANEL * (1 - antes); void el.getBoundingClientRect();
        requestAnimationFrame(function () { el.style.strokeDashoffset = C_ANEL * (1 - v); });
      }
    });
  }
  function tweenNum(el, k, de, para) {
    tween[k] = (tween[k] || 0) + 1; var id = tween[k];
    if (reduz || de === para) { shown[k] = para; el.textContent = fmtN(para); return; }
    var t0 = performance.now(), dur = 700;
    el.textContent = fmtN(de);
    (function passo(t) {
      if (tween[k] !== id) return;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      shown[k] = de + (para - de) * e; el.textContent = fmtN(shown[k]);
      if (p < 1) requestAnimationFrame(passo); else shown[k] = para;
    })(t0);
  }
  var animNum = function (k, v, cls) { return '<b class="num" data-anim="num" data-k="' + k + '" data-v="' + v + '">' + fmtN(v) + '</b>'; };

  /* ---------- Componentes ---------- */
  function mapa(ok) {
    return '<svg class="mapa" viewBox="0 0 320 124" role="img" aria-label="Mapa ilustrativo do endereço da visita"><rect width="320" height="124" fill="#e8effc"/>' +
      '<rect x="12" y="10" width="78" height="34" rx="7" fill="#d6e3f8"/><rect x="118" y="10" width="86" height="34" rx="7" fill="#d6e3f8"/><rect x="232" y="10" width="76" height="34" rx="7" fill="#cdeedd"/>' +
      '<rect x="12" y="72" width="78" height="40" rx="7" fill="#d6e3f8"/><rect x="118" y="72" width="86" height="40" rx="7" fill="#d6e3f8"/><rect x="232" y="72" width="76" height="40" rx="7" fill="#d6e3f8"/>' +
      '<path d="M0 58H320" stroke="#fff" stroke-width="14"/><path d="M104 0V124M218 0V124" stroke="#fff" stroke-width="12"/><path d="M0 58H320" stroke="#c9d8f2" stroke-width="1.5" stroke-dasharray="7 7"/>' +
      (ok ? '<circle cx="176" cy="58" r="30" fill="rgba(59,130,246,.18)" stroke="rgba(59,130,246,.45)"/><circle cx="168" cy="62" r="7" fill="#1e3a8a" stroke="#fff" stroke-width="3"/>' : '') +
      '<path d="M190 52c0 10-11 19-11 19s-11-9-11-19a11 11 0 0 1 22 0z" transform="translate(' + (ok ? 6 : -4) + ' -8)" fill="' + (ok ? '#0f7a4d' : '#b42318') + '"/><circle cx="' + (ok ? 185 : 175) + '" cy="35" r="4" fill="#fff"/></svg>';
  }
  function badge(c, txt, icone) { return '<span class="bd ' + c + '">' + (icone ? ic(icone) : '') + esc(txt) + '</span>'; }
  function infoLin(i, t, s) { return '<div class="info-lin">' + ic(i) + '<div>' + t + (s ? '<small>' + s + '</small>' : '') + '</div></div>'; }

  /* ---------- TELA: Hoje ---------- */
  function itemVisita(v, prox) {
    var t = D.tipos[v.tipo], s = STATUS[v.st], res = resolvida(v);
    var cls = res ? (v.st === 'ausente' || v.st === 'reagendada' ? 'aus' : 'feita') : (v.st === 'andamento' ? 'and' : (prox && prox.id === v.id ? 'prox' : ''));
    var no = cls === 'feita' ? ic('check') : (cls === 'aus' ? ic('alert') : (E.visitas.indexOf(v) + 1));
    var reg = E.registros.filter(function (r) { return r.visitaId === v.id; })[0];
    var pend = reg && reg.sync !== 'enviado';
    var cta = res ? '<button type="button" class="btn-ini suave" data-acao="abrir" data-id="' + v.id + '" aria-label="Ver resumo da visita de ' + esc(v.cliente) + '">Ver resumo</button>' :
      '<button type="button" class="btn-ini" data-acao="abrir" data-id="' + v.id + '" aria-label="' + (v.st === 'andamento' ? 'Continuar' : 'Iniciar') + ' visita de ' + esc(v.cliente) + '">' + (v.st === 'andamento' ? 'Continuar' : 'Iniciar') + ic('chevR') + '</button>';
    return '<li class="vi ' + cls + '" data-acao="abrir" data-id="' + v.id + '"><span class="no" aria-hidden="true">' + no + '</span><div class="vi-cartao">' +
      '<div class="vi-topo"><span class="vi-hora"><span class="ic-tipo">' + ic(t.icone) + '</span>' + v.hora + '</span><span>' + (pend ? badge('at', 'Pendente de envio', 'cloudOff') : badge(s.c, s.t)) + '</span></div>' +
      '<h4>' + esc(v.cliente) + '</h4><p class="vi-end">' + ic('pin') + '<span>' + esc(v.end) + ' · ' + esc(v.bairro) + '</span></p>' +
      '<div class="vi-rod"><span class="vi-tipo">' + t.nome + '</span>' + cta + '</div></div></li>';
  }
  function rHoje() {
    var n = feitas(), meta = D.metaDia.visitas, pct = Math.min(1, n / meta), min = agoraMin();
    var saud = min < 720 ? 'Bom dia' : (min < 1080 ? 'Boa tarde' : 'Boa noite');
    var px = proxima(), faltam = px ? minDe(px.hora) - min : 0;
    var em = faltam >= 90 ? Math.floor(faltam / 60) + ' h ' + pad(faltam % 60) : faltam + ' min';
    var prox = px ? (faltam > 0 ? 'Próxima ' + px.hora + ' · em ' + em : 'Próxima ' + px.hora + ' · agora') : 'Rota concluída';
    var lista = E.visitas.filter(function (v) { return E.filtro === 'todas' || (E.filtro === 'pendentes' ? !resolvida(v) : resolvida(v)); });
    var nPend = E.visitas.filter(function (v) { return !resolvida(v); }).length;
    var html = '<div class="hero baixo"><span class="eyebrow">' + esc(D.dia.extenso) + '</span><h2 tabindex="-1" class="tit-foco" data-foco>' + saud + ', ' + esc(D.agente.curto) + '</h2><p class="sub">Você tem ' + nPend + (nPend === 1 ? ' visita' : ' visitas') + ' na rota de hoje.</p>' +
      '<div class="painel-dia"><div class="anel" role="img" aria-label="' + n + ' de ' + meta + ' visitas feitas, ' + Math.round(pct * 100) + '% da meta do dia"><svg viewBox="0 0 92 92"><defs><linearGradient id="gradAnel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#bfdbfe"/><stop offset="1" stop-color="#60a5fa"/></linearGradient></defs><circle class="trilho" cx="46" cy="46" r="38"/><circle class="prog" cx="46" cy="46" r="38" data-anim="anel" data-k="hoje:anel" data-v="' + pct + '"/></svg><div class="anel-txt"><b>' + n + '/' + meta + '</b><span>visitas</span></div></div>' +
      '<div class="meta"><h3>Meta do dia</h3><p>' + Math.round(pct * 100) + '% concluída</p><div class="mini-chips"><span>' + ic('tag') + 'Vendas ' + vendasHoje() + '/' + D.metaDia.vendas + '</span><span>' + ic('clock') + esc(prox) + '</span></div></div></div></div>';
    html += '<div class="corpo solto">';
    if (E.offline) html += '<div class="faixa-off">' + ic('wifiOff') + '<div><b>Sem sinal.</b> Você pode seguir a rota normalmente: os registros ficam guardados e serão enviados quando o sinal voltar.</div></div>';
    html += '<div class="filtros" role="group" aria-label="Filtrar visitas">' + [['todas', 'Todas (' + E.visitas.length + ')'], ['pendentes', 'A fazer (' + nPend + ')'], ['feitas', 'Feitas (' + n + ')']].map(function (f) {
      return '<button type="button" class="filtro" data-acao="filtro" data-f="' + f[0] + '" aria-pressed="' + (E.filtro === f[0]) + '">' + f[1] + '</button>'; }).join('') + '</div>';
    html += '<div class="sec-tit"><h3>Rota de hoje</h3><span>' + lista.length + (lista.length === 1 ? ' parada' : ' paradas') + '</span></div>';
    var lead = 0; if (E.filtro === 'todas') while (lead < lista.length && resolvida(lista[lead])) lead++;
    if (lista.length) {
      var itens = lista.map(function (v) { return itemVisita(v, px); });
      if (lead > 0) {
        var resumo = '<li class="vi feita resumo-li"><span class="no" aria-hidden="true">' + ic('check') + '</span><button type="button" class="vi-resumo" data-acao="feitas-toggle" aria-expanded="' + E.verFeitas + '"><span><b>' + lead + (lead === 1 ? ' visita concluída' : ' visitas concluídas') + '</b><small>' + (E.verFeitas ? 'Toque para ocultar' : 'Toque para ver os detalhes') + '</small></span>' + ic(E.verFeitas ? 'x' : 'chevR') + '</button></li>';
        itens = [resumo].concat(E.verFeitas ? itens.slice(0, lead) : [], itens.slice(lead));
      }
      html += '<ol class="rota" aria-label="Visitas do dia em ordem de rota">' + itens.join('') + '</ol>';
    }
    else html += '<div class="cartao vazio">' + (E.filtro === 'pendentes' ? ILU.rotaOk + '<h3>Rota concluída</h3><p>Todas as visitas de hoje foram registradas. Bom trabalho!</p>' : ILU.visita + '<h3>Nenhuma visita feita ainda</h3><p>Toque em Iniciar na primeira parada da rota.</p>') + '<button type="button" class="bt pequeno" data-acao="filtro" data-f="todas">Ver toda a rota</button></div>';
    return html + '</div>';
  }

  /* ---------- TELA: Visita ---------- */
  function rVisita() {
    var v = ativa();
    if (!v) {
      return '<div class="hero"><span class="eyebrow">Visita</span><h2 tabindex="-1" class="tit-foco" data-foco>Nenhuma visita aberta</h2><p class="sub">Escolha uma parada da rota para atender.</p></div>' +
        '<div class="corpo"><div class="cartao vazio">' + ILU.visita + '<h3>Comece pela rota</h3><p>Toque em Iniciar numa visita para fazer o check-in, preencher o checklist e registrar o resultado.</p><button type="button" class="bt pri" data-acao="aba" data-aba="hoje">Ver rota de hoje</button></div></div>';
    }
    var t = D.tipos[v.tipo], f = v.f, ro = resolvida(v), s = STATUS[v.st];
    var reg = E.registros.filter(function (r) { return r.visitaId === v.id; })[0];
    var h = '<div class="hero"><div class="cab-visita"><button type="button" class="ib" data-acao="aba" data-aba="hoje" aria-label="Voltar para a rota de hoje">' + ic('chevL') + '</button><span class="tipo">' + t.nome + '</span><button type="button" class="ib" data-acao="mais" aria-label="Mais ações da visita">' + ic('more') + '</button></div>' +
      '<h2 class="nome tit-foco" tabindex="-1" data-foco>' + esc(v.cliente) + '</h2><div class="quando"><span class="bd">' + ic('clock') + 'Agendada ' + v.hora + '</span>' + badge(s.c, s.t) + (reg && reg.sync !== 'enviado' ? badge('at', 'Pendente de envio', 'cloudOff') : '') + '</div></div><div class="corpo">';

    if (!ro) {
      h += '<section class="cartao checkin" aria-labelledby="h-ci">';
      if (f.checkin) {
        h += mapa(true) + '<div class="ok-card"><span class="ok-sel">' + ic('check') + '</span><div><h3 id="h-ci">Check-in feito às ' + f.checkin + '</h3><p>Localização confirmada a ' + f.dist + ' m do endereço.</p></div></div>';
      } else if (f.buscando) {
        h += mapa(false) + '<div class="buscando" role="status"><span class="radar"><i></i><i></i><b></b></span><div><h3 id="h-ci">Obtendo localização…</h3><p class="muted" style="margin:2px 0 0;font-size:13px">Simulação: nenhum dado de GPS é lido.</p></div></div>';
      } else {
        h += '<h3 class="so-leitor-i" id="h-ci">Check-in</h3>' + mapa(false) + '<button type="button" class="bt-checkin" data-acao="checkin">' + ic('pin') + 'Fazer check-in</button><p class="ajuda">Confirme que chegou ao endereço. Funciona mesmo sem sinal.</p>';
      }
      h += '</section>';
    }

    h += '<section class="cartao" aria-label="Dados do cliente">' + infoLin('pin', esc(v.end) + ' · ' + esc(v.bairro), 'Ref.: ' + esc(v.ref)) + infoLin('phone', esc(v.tel), 'Cliente') + infoLin('info', esc(v.nota)) +
      '<div class="acoes-rap"><button type="button" class="bt pequeno" data-acao="ligar">' + ic('phone') + 'Ligar</button><button type="button" class="bt pequeno" data-acao="rota">' + ic('nav') + 'Abrir rota</button></div></section>';

    var lista = D.checklists[v.tipo], feitosN = f.checks.length;
    h += '<section class="cartao" aria-labelledby="h-ck"><div class="cartao-cab"><h3 id="h-ck">Checklist</h3><span class="pequeno num">' + feitosN + ' de ' + lista.length + '</span></div><div class="prog-lin" aria-hidden="true"><i data-anim="barra" data-k="visita:ck" data-v="' + Math.round(feitosN / lista.length * 100) + '"></i></div><div style="margin-top:8px">' +
      lista.map(function (it, i) {
        var on = f.checks.indexOf(i) > -1;
        return '<label class="ck' + (ro ? ' ro' : '') + '"><input type="checkbox" id="ck' + i + '" data-campo="check" data-i="' + i + '"' + (on ? ' checked' : '') + (ro ? ' disabled' : '') + '><span class="cx">' + ic('check') + '</span><span class="ck-t">' + esc(it) + '</span></label>'; }).join('') + '</div></section>';

    h += '<section class="cartao" aria-labelledby="h-ft"><div class="cartao-cab"><h3 id="h-ft">Fotos</h3><span class="pequeno num">' + f.fotos.length + ' de 4</span></div><div class="fotos">' +
      f.fotos.map(function (id, i) { var ft = fotoDe(id);
        return '<div class="foto"><svg viewBox="0 0 120 90" role="img" aria-label="Foto: ' + esc(ft.nome) + '">' + ft.svg + '</svg>' + (ro ? '' : '<button type="button" data-acao="foto-rm" data-i="' + i + '" aria-label="Remover foto ' + esc(ft.nome) + '"><span>' + ic('x') + '</span></button>') + '</div>'; }).join('') +
      (!ro && f.fotos.length < 4 ? '<button type="button" class="add-foto" data-acao="foto-add" aria-label="Adicionar foto"><span>' + ic('camera') + 'Adicionar</span></button>' : '') +
      (ro && !f.fotos.length ? '<p class="muted" style="margin:0;font-size:13.5px">Nenhuma foto nesta visita.</p>' : '') + '</div>' +
      (!ro ? '<p class="muted" style="margin:10px 0 0;font-size:12.5px">Simulação: escolha uma ilustração. A câmera não é acessada.</p>' : '') + '</section>';

    h += '<section class="cartao" aria-labelledby="h-ob"><div class="cartao-cab"><h3 id="h-ob">Observações</h3></div>' +
      (ro ? '<p style="margin:0;font-size:14.5px">' + (f.obs ? esc(f.obs) : '<span class="muted">Sem observações.</span>') + '</p>' :
        '<label class="so-leitor-i" for="obs">Observações da visita</label><textarea id="obs" data-campo="obs" maxlength="300" placeholder="Ex.: cliente pediu retorno após as 17h; portão com cadeado.">' + esc(f.obs) + '</textarea>') + '</section>';

    if (!ro) {
      h += '<section class="cartao" id="resultado" aria-labelledby="h-rs"><div class="cartao-cab"><h3 id="h-rs">Resultado da visita</h3></div><div class="res-grade" role="radiogroup" aria-labelledby="h-rs">' +
        RESULT.map(function (r) { return '<div class="res"><input type="radio" name="resultado" id="res-' + r.id + '" value="' + r.id + '" data-campo="resultado"' + (f.resultado === r.id ? ' checked' : '') + '><label for="res-' + r.id + '">' + ic(r.i) + r.t + '</label></div>'; }).join('') + '</div>';
      if (f.resultado === 'venda') {
        h += '<div class="planos" role="radiogroup" aria-label="Plano vendido">' + D.planos.map(function (p) {
          return '<div class="plano"><input type="radio" name="plano" id="pl-' + p.id + '" value="' + p.id + '" data-campo="plano"' + (f.plano === p.id ? ' checked' : '') + '><label for="pl-' + p.id + '"><span class="pl-r"></span><span class="pl-n"><b>' + p.nome + '</b><span>' + p.desc + '</span></span><span class="pl-p">' + brl(p.preco) + '<small>por mês</small></span></label></div>'; }).join('') + '</div>';
      }
      if (f.resultado === 'reagendada') {
        h += '<div class="campo planos"><label for="slot">Novo horário</label><select id="slot" data-campo="slot">' + D.reagendar.map(function (x) { return '<option' + (f.slot === x ? ' selected' : '') + '>' + x + '</option>'; }).join('') + '</select></div>';
      }
      if (f.erro) h += '<p class="erro" role="alert">' + ic('alert') + esc(f.erro) + '</p>';
      h += '</section>';
      h += (f.checkin ? '' : '<p class="dica-fin">Faça o check-in para poder finalizar a visita.</p>') + '<button type="button" class="bt pri cheio" style="min-height:56px;font-size:16px" data-acao="finalizar" aria-disabled="' + (!f.checkin) + '">' + ic('check') + 'Finalizar visita</button>';
    } else {
      h += '<section class="cartao resumo-ro" aria-label="Resultado"><dl><div><dt>Resultado</dt><dd>' + badge(s.c, s.t) + '</dd></div>' +
        (f.plano ? '<div><dt>Plano vendido</dt><dd>' + esc(planoDe(f.plano).nome) + ' · ' + brl(planoDe(f.plano).preco) + '/mês</dd></div>' : '') +
        '<div><dt>Check-in</dt><dd>' + (f.checkin ? 'às ' + f.checkin + ' · ' + f.dist + ' m do endereço' : '—') + '</dd></div>' +
        '<div><dt>Envio ao gestor</dt><dd>' + (reg && reg.sync !== 'enviado' ? badge('at', 'Pendente de envio', 'cloudOff') : badge('ok', 'Enviado', 'check')) + '</dd></div></dl></section>' +
        '<button type="button" class="bt cheio" data-acao="aba" data-aba="hoje">' + ic('chevL') + 'Voltar para a rota</button>';
    }
    return h + '</div>';
  }

  /* ---------- TELA: Registrar ---------- */
  function campoErro(F, c) { return F.erros[c] ? '<p class="erro" id="e-' + c + '" role="alert">' + ic('alert') + esc(F.erros[c]) + '</p>' : ''; }
  function rRegistrar() {
    var F = E.form, venda = F.tipo === 'venda';
    var titulos = ['Cliente', venda ? 'Local e plano' : 'Local e tipo', 'Revisão'];
    var h = '<div class="hero"><span class="eyebrow">Registro rápido</span><h2 tabindex="-1" class="tit-foco" data-foco>' + (venda ? 'Nova venda' : 'Nova ocorrência') + '</h2><p class="sub">Em três etapas curtas, direto da rua.</p>' +
      (F.sucesso ? '' : '<div class="passos" aria-hidden="true">' + [1, 2, 3].map(function (n) { return '<i class="' + (F.etapa >= n ? 'ok' : '') + '"></i>'; }).join('') + '</div><p class="passo-tit">Etapa ' + F.etapa + ' de 3 · ' + titulos[F.etapa - 1] + '</p>') + '</div><div class="corpo">';
    if (F.sucesso) {
      var s = F.sucesso, off = s.sync !== 'enviado';
      return h + '<div class="cartao sucesso" role="status">' + (off ? ILU.guardado : ILU.enviado) + '<h3>' + (off ? 'Guardado no aparelho' : 'Registro enviado ao gestor') + '</h3><p>' +
        (off ? 'Sem sinal: o registro de <b>' + esc(s.titulo) + '</b> entrou na fila e será enviado assim que o sinal voltar.' : 'O registro de <b>' + esc(s.titulo) + '</b> já aparece no painel do gestor.') + '</p><div class="acoes-form"><button type="button" class="bt pri" data-acao="f-novo">' + ic('plusSm') + 'Novo registro</button><button type="button" class="bt" data-acao="aba" data-aba="sync">' + ic('cloud') + 'Ver fila de envio</button></div></div></div>';
    }
    h += '<form class="cartao form" id="frm" novalidate data-acao-form="1">';
    if (F.etapa === 1) {
      h += '<div class="seg" role="group" aria-label="Tipo de registro"><button type="button" data-acao="tipo" data-t="venda" aria-pressed="' + venda + '">' + ic('tag') + 'Venda</button><button type="button" data-acao="tipo" data-t="ocorrencia" aria-pressed="' + !venda + '">' + ic('alert') + 'Ocorrência</button></div>' +
        '<div class="campo"><label for="f-nome">' + (venda ? 'Nome do cliente' : 'Nome do contato') + '</label><input id="f-nome" data-campo="nome" autocomplete="off" placeholder="Ex.: Ana Souza"' + (F.erros.nome ? ' aria-invalid="true" aria-describedby="e-nome"' : '') + ' value="' + esc(F.nome) + '">' + campoErro(F, 'nome') + '</div>' +
        '<div class="campo"><label for="f-tel">Telefone com DDD</label><input id="f-tel" data-campo="tel" type="tel" inputmode="tel" autocomplete="off" placeholder="(61) 90000-0000" maxlength="15"' + (F.erros.tel ? ' aria-invalid="true" aria-describedby="e-tel"' : '') + ' value="' + esc(F.tel) + '">' + campoErro(F, 'tel') + '</div>';
    } else if (F.etapa === 2) {
      h += '<div class="campo"><label for="f-bairro">Bairro</label><select id="f-bairro" data-campo="bairro"' + (F.erros.bairro ? ' aria-invalid="true" aria-describedby="e-bairro"' : '') + '><option value="">Selecione o bairro</option>' + D.bairros.map(function (b) { return '<option' + (F.bairro === b ? ' selected' : '') + '>' + b + '</option>'; }).join('') + '</select>' + campoErro(F, 'bairro') + '</div>';
      if (venda) {
        h += '<div><div class="rot" id="h-pl" style="margin-bottom:8px">Plano de interesse</div><div class="planos" style="margin-top:0" role="radiogroup" aria-labelledby="h-pl">' + D.planos.map(function (p) {
          return '<div class="plano"><input type="radio" name="fplano" id="fp-' + p.id + '" value="' + p.id + '" data-campo="fplano"' + (F.plano === p.id ? ' checked' : '') + '><label for="fp-' + p.id + '"><span class="pl-r"></span><span class="pl-n"><b>' + p.nome + '</b><span>' + p.vel + '</span></span><span class="pl-p">' + brl(p.preco) + '<small>por mês</small></span></label></div>'; }).join('') + '</div>' + campoErro(F, 'plano') + '</div>';
      } else {
        h += '<div class="campo"><label for="f-ocorr">Tipo de ocorrência</label><select id="f-ocorr" data-campo="ocorr"' + (F.erros.ocorr ? ' aria-invalid="true" aria-describedby="e-ocorr"' : '') + '><option value="">Selecione o tipo</option>' + D.ocorrencias.map(function (b) { return '<option' + (F.ocorr === b ? ' selected' : '') + '>' + b + '</option>'; }).join('') + '</select>' + campoErro(F, 'ocorr') + '</div>';
      }
    } else {
      var pl = planoDe(F.plano);
      h += '<div class="campo"><label for="f-obs">Observação (opcional)</label><textarea id="f-obs" data-campo="fobs" maxlength="200" placeholder="Algo que a equipe precisa saber?">' + esc(F.obs) + '</textarea><div class="cont" id="f-cont">' + F.obs.length + '/200</div></div>' +
        '<div class="previa" aria-label="Prévia do registro"><div class="rotulo" style="margin-bottom:8px">Prévia do registro</div><dl>' +
        '<div class="lin"><dt>Tipo</dt><dd>' + (venda ? 'Venda' : 'Ocorrência') + '</dd></div><div class="lin"><dt>Cliente</dt><dd>' + esc(F.nome) + '</dd></div><div class="lin"><dt>Telefone</dt><dd class="num">' + esc(F.tel) + '</dd></div><div class="lin"><dt>Bairro</dt><dd>' + esc(F.bairro) + '</dd></div>' +
        (venda ? '<div class="lin"><dt>Plano</dt><dd>' + esc(pl.nome) + ' · ' + brl(pl.preco) + '</dd></div>' : '<div class="lin"><dt>Ocorrência</dt><dd>' + esc(F.ocorr) + '</dd></div>') + '</dl></div>' +
        (E.offline ? '<div class="nota-off" style="margin:0">' + ic('wifiOff') + '<div>Sem sinal: este registro será guardado no aparelho e enviado depois.</div></div>' : '');
    }
    h += '<div class="acoes-form">' + (F.etapa > 1 ? '<button type="button" class="bt" data-acao="f-volt">' + ic('chevL') + 'Voltar</button>' : '') +
      '<button type="submit" class="bt pri">' + (F.etapa < 3 ? 'Continuar' + ic('chevR') : (E.offline ? ic('cloudOff') + 'Guardar no aparelho' : ic('send') + 'Enviar registro')) + '</button></div></form></div>';
    return h;
  }
  function validar(F, etapa) {
    var e = {};
    if (etapa === 1) {
      var n = F.nome.trim().split(/\s+/);
      if (!F.nome.trim()) e.nome = 'Informe o nome.'; else if (n.length < 2 || n[0].length < 2 || n[1].length < 2) e.nome = 'Informe nome e sobrenome.';
      var d = F.tel.replace(/\D/g, '');
      if (!d) e.tel = 'Informe o telefone.'; else if (d.length < 10 || (d.length === 11 && d[2] !== '9')) e.tel = 'Telefone inválido. Use DDD + número.';
    } else if (etapa === 2) {
      if (!F.bairro) e.bairro = 'Selecione o bairro.';
      if (F.tipo === 'venda' && !F.plano) e.plano = 'Escolha um plano.';
      if (F.tipo !== 'venda' && !F.ocorr) e.ocorr = 'Selecione o tipo de ocorrência.';
    }
    return e;
  }
  var mascara = function (v) {
    var d = v.replace(/\D/g, '').slice(0, 11);
    if (!d) return ''; if (d.length < 3) return '(' + d;
    if (d.length <= 6) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
    if (d.length <= 10) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
    return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
  };

  /* ---------- TELA: Sinal / sincronização / perfil ---------- */
  function rSync() {
    var pend = pendentes(), n = pend.length, S = E.sinc, g = gestorNums();
    var h = '<div class="hero"><span class="eyebrow">Sinal e perfil</span><h2 tabindex="-1" class="tit-foco" data-foco>Sincronização</h2><p class="sub">Seus registros chegam ao gestor com ou sem internet.</p>' +
      '<div class="perfil-lin"><span class="avatar" aria-hidden="true">' + D.agente.iniciais + '</span><div><b>' + esc(D.agente.nome) + '</b><span>' + esc(D.agente.cargo) + ' · ' + esc(D.agente.equipe) + '</span></div></div></div><div class="corpo">';
    h += '<button type="button" class="chave" role="switch" aria-checked="' + E.offline + '" data-acao="sinal"><span class="ic-g">' + ic(E.offline ? 'wifiOff' : 'wifi') + '</span><span class="t"><b>Modo sem sinal</b><span>' +
      (E.offline ? 'Ligado: os registros ficam guardados neste aparelho.' : 'Desligado: você está conectado. Ligue para simular a rua sem sinal.') + '</span></span><span class="trilho-sw"></span></button>';

    var ordem = pend.slice().concat(E.registros.filter(function (r) { return r.sync === 'enviado'; })).slice(0, 6);
    h += '<section class="cartao" aria-labelledby="h-fila"><div class="cartao-cab"><h3 id="h-fila">Fila de envio</h3>' + (n ? badge('at', n + (n === 1 ? ' pendente' : ' pendentes'), 'cloudOff') : badge('ok', 'Tudo enviado', 'check')) + '</div>';
    if (S.rodando) h += '<div class="sinc-prog" role="status"><div class="linha">' + ic('refresh', 'spin') + 'Sincronizando ' + Math.min(S.feitos + 1, S.total) + ' de ' + S.total + '…</div><div class="prog-lin"><i data-anim="barra" data-k="sync:bar" data-v="' + Math.round(S.feitos / S.total * 100) + '"></i></div></div>';
    else if (E.offline && n) h += '<div class="faixa-off" style="margin-bottom:12px">' + ic('wifiOff') + '<div>Aguardando sinal. Assim que você desligar o modo sem sinal, a fila é enviada automaticamente.</div></div>';
    if (!ordem.length) h += '<div class="vazio-mini">' + ILU.nuvem + 'Nada na fila.</div>';
    else h += '<ul class="fila-lista" aria-label="Registros recentes">' + ordem.map(function (r) {
      var bd = r.sync === 'enviado' ? badge('ok', 'Enviado', 'check') : (r.sync === 'enviando' ? '<span class="bd info">' + ic('refresh', 'spin') + 'Enviando</span>' : badge('at', 'Pendente', 'cloudOff'));
      var icn = r.origem === 'visita' ? 'clip' : (r.origem === 'venda' ? 'tag' : 'alert');
      var novo = r.novo; r.novo = false;
      return '<li' + (novo ? ' class="novo"' : '') + '><span class="fila-ic">' + ic(icn) + '</span><span class="fila-t"><b>' + esc(r.titulo) + '</b><span>' + esc(r.detalhe) + ' · ' + r.hora + '</span></span>' + bd + '</li>'; }).join('') + '</ul>';
    h += '</section>';

    h += '<section class="gestor" aria-labelledby="h-g"><div class="cartao-cab" style="margin-bottom:2px"><h3 id="h-g">Visão do gestor</h3><span class="ao-vivo"><i></i>Ao vivo</span></div><p class="sub">Painel da gestão · ' + D.gestor.equipe + ' agentes, ' + D.gestor.emCampo + ' em campo agora</p>' +
      '<div class="contadores"><div class="cont-b">' + animNum('g:v', g.visitas) + '<span>Visitas</span></div><div class="cont-b">' + animNum('g:s', g.vendas) + '<span>Vendas</span></div><div class="cont-b">' + animNum('g:o', g.ocorr) + '<span>Ocorrências</span></div></div>' +
      '<div class="g-meta"><div class="linha"><span>Meta da equipe</span><span class="num">' + g.visitas + ' de ' + D.gestor.metaVisitas + ' visitas</span></div><div class="prog-lin"><i data-anim="barra" data-k="g:meta" data-v="' + Math.round(g.visitas / D.gestor.metaVisitas * 100) + '"></i></div></div>' +
      (n ? '<div class="g-pend">' + ic('cloudOff') + 'O gestor ainda não vê ' + n + (n === 1 ? ' registro seu' : ' registros seus') + ': aguardando sinal.</div>' : '') +
      '<ul class="g-feed" aria-label="Últimas atividades da equipe">' + E.feed.slice(0, 4).map(function (x) { var novo = x.novo; x.novo = false;
        return '<li' + (novo ? ' class="novo"' : '') + '><span><b>' + esc(x.quem) + '</b> · ' + esc(x.txt) + '</span><small>' + esc(x.t) + '</small></li>'; }).join('') + '</ul></section>';

    var vSem = D.semana.reduce(function (a, d) { return a + d.visitas; }, 0) + feitas(), sSem = D.semana.reduce(function (a, d) { return a + d.vendas; }, 0) + vendasHoje();
    var dias = D.semana.concat([{ dia: 'Qui', data: D.dia.curto, visitas: feitas(), vendas: vendasHoje(), hoje: true }, { dia: 'Sex', data: '13/11', visitas: 0, vendas: 0, fut: true }]);
    var max = 10;
    h += '<section class="cartao" aria-labelledby="h-sem"><div class="cartao-cab"><h3 id="h-sem">Meta semanal</h3><span class="pequeno num">' + vSem + ' de ' + D.metaSemana.visitas + ' visitas</span></div>' +
      '<div class="prog-lin" role="img" aria-label="' + Math.round(vSem / D.metaSemana.visitas * 100) + '% da meta semanal de visitas"><i data-anim="barra" data-k="sem:meta" data-v="' + Math.min(100, Math.round(vSem / D.metaSemana.visitas * 100)) + '"></i></div>' +
      '<p class="muted" style="margin:8px 0 0;font-size:13px">Vendas: <b class="num">' + sSem + '</b> de ' + D.metaSemana.vendas + ' na semana</p>' +
      '<div class="semana-g" role="img" aria-label="Visitas por dia: ' + dias.filter(function (d) { return !d.fut; }).map(function (d) { return d.dia + ' ' + d.visitas; }).join(', ') + '">' + dias.map(function (d) {
        return '<div class="sem-col"><span class="v">' + (d.fut ? '' : d.visitas) + '</span><div class="barra' + (d.hoje ? ' hoje' : '') + (d.fut ? ' fut' : '') + '" data-anim="barra" data-prop="height" data-un="px" data-k="sem:' + d.dia + '" data-v="' + (d.fut ? 30 : Math.round(Math.min(d.visitas, max) / max * 64)) + '"></div><span>' + d.dia + '</span></div>'; }).join('') + '</div>' +
      '<ul class="hist" aria-label="Histórico da semana">' + D.semana.slice().reverse().map(function (d) {
        return '<li><div><b>' + d.dia + ', ' + d.data + '</b><small>' + d.visitas + ' visitas · ' + d.vendas + (d.vendas === 1 ? ' venda' : ' vendas') + '</small></div>' + badge(d.visitas >= 8 ? 'ok' : 'at', d.visitas >= 8 ? 'Meta batida' : 'Abaixo da meta') + '</li>'; }).join('') + '</ul></section>';

    h += '<a class="sobre-link" href="https://wa.me/5561996113299?text=Ol%C3%A1!%20Vi%20o%20prot%C3%B3tipo%20do%20Aplicativo%20de%20Campo%20e%20quero%20conversar." target="_blank" rel="noopener">Protótipo da Soluções Digitais Express.<br>Quer um aplicativo assim para a sua equipe? <u>Conversar</u></a>';
    return h + '</div>';
  }

  /* ---------- Renderização, abas e cromo do app ---------- */
  var ABAS = [['hoje', 'Hoje', 'home'], ['visita', 'Visita', 'clip'], ['registrar', 'Registrar', 'plus'], ['sync', 'Sinal', 'cloud']];
  var R = { hoje: rHoje, visita: rVisita, registrar: rRegistrar, sync: rSync };

  function render(aba) {
    var el = $('#t-' + aba), st = el.scrollTop, act = document.activeElement, foco = null;
    if (el.contains(act) && act.id) foco = { id: act.id, s: act.selectionStart, e: act.selectionEnd };
    el.innerHTML = R[aba]();
    el.scrollTop = st;
    if (foco) { var n = document.getElementById(foco.id); if (n) { n.focus({ preventScroll: true }); try { n.setSelectionRange(foco.s, foco.e); } catch (x) { /* campo sem seleção */ } } }
    animar(el);
  }
  function chrome() {
    var n = pendentes().length, S = E.sinc;
    var chip = $('#chipSync');
    chip.className = 'chip-sync' + (S.rodando ? ' sinc' : (E.offline ? ' off' : ''));
    chip.innerHTML = '<span class="chip-in">' + (S.rodando ? ic('refresh', 'spin') + 'Sincronizando…' : (E.offline ? ic('wifiOff') + 'Sem sinal' + (n ? ' · ' + n + ' pendente' + (n > 1 ? 's' : '') : '') : '<i class="pt"></i>Online' + (n ? ' · ' + n : ''))) + '</span>';
    chip.setAttribute('aria-label', S.rodando ? 'Sincronizando a fila de envio. Abrir tela de sinal' : (E.offline ? 'Sem sinal, ' + n + ' registros pendentes. Abrir tela de sinal' : 'Online, tudo sincronizado. Abrir tela de sinal'));
    var v = ativa();
    $('#abas').innerHTML = ABAS.map(function (a) {
      var ponto = '', sr = '';
      if (a[0] === 'visita' && v && v.f.checkin && !resolvida(v)) { ponto = '<span class="ponto az"></span>'; sr = ', visita em andamento'; }
      if (a[0] === 'sync' && n) { ponto = '<span class="ponto am">' + n + '</span>'; sr = ', ' + n + ' pendentes'; }
      return '<button type="button" class="aba" data-acao="aba" data-aba="' + a[0] + '"' + (E.aba === a[0] ? ' aria-current="page"' : '') + '><span class="ic-wrap">' + ic(a[2]) + ponto + '</span>' + a[1] + (sr ? '<span class="so-leitor-i">' + sr + '</span>' : '') + '</button>'; }).join('');
    $('#sbHora').textContent = hhmm(agoraMin());
    $('#sbIc').innerHTML = '<svg viewBox="0 0 18 12" class="' + (E.offline ? 'off' : '') + '"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>' +
      '<svg viewBox="0 0 17 12" class="' + (E.offline ? 'off' : '') + '"><path d="M8.5 2.2a8.6 8.6 0 0 1 6 2.4l1.2-1.3A10.4 10.4 0 0 0 8.5.4 10.4 10.4 0 0 0 1.3 3.3l1.2 1.3a8.6 8.6 0 0 1 6-2.4zm0 3.5a5.1 5.1 0 0 1 3.5 1.4l1.2-1.3a6.9 6.9 0 0 0-9.4 0l1.2 1.3a5.1 5.1 0 0 1 3.5-1.4zm0 3.4c.7 0 1.3.3 1.8.7L8.5 12 6.7 9.8c.5-.4 1.1-.7 1.8-.7z"/></svg>' +
      '<svg viewBox="0 0 27 12" style="height:12px"><rect x=".5" y=".5" width="22" height="11" rx="3.5" fill="none" stroke="#fff" opacity=".5"/><rect x="2" y="2" width="19" height="8" rx="2"/><rect x="24" y="4" width="2" height="4" rx="1" opacity=".5"/></svg>';
  }
  function renderTudo() { ABAS.forEach(function (a) { render(a[0]); }); chrome(); }
  function ir(aba, foco) {
    E.aba = aba;
    Object.keys(cur).forEach(function (k) { if (k.indexOf(aba + ':') === 0 || (aba === 'sync' && /^(g|sync|sem):/.test(k))) { delete cur[k]; delete shown[k]; } });
    render(aba);
    var idx = ABAS.map(function (a) { return a[0]; }).indexOf(aba);
    $$('.tela').forEach(function (t, i) {
      t.classList.toggle('on', i === idx); t.classList.toggle('esq', i < idx);
      t.toggleAttribute('inert', i !== idx); t.setAttribute('aria-hidden', i !== idx ? 'true' : 'false');
    });
    chrome();
    if (foco !== false) { var h = $('#t-' + aba + ' [data-foco]'); if (h) h.focus({ preventScroll: true }); }
  }

  /* ---------- Toast e folha (bottom sheet) ---------- */
  var toastT;
  function toast(msg, tipo) {
    var t = $('#toast');
    t.className = 'toast' + (tipo === 'aviso' ? ' aviso' : '');
    t.innerHTML = ic(tipo === 'aviso' ? 'alert' : 'check') + '<span>' + esc(msg) + '</span>';
    void t.offsetWidth; t.classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('on'); }, 3200);
  }
  var abertaDe = null, restaurarFoco = true;
  function abrirFolha(html) {
    var f = $('#folha'), b = $('#folhaFundo');
    abertaDe = document.activeElement; restaurarFoco = true;
    $('#toast').classList.remove('on');
    f.innerHTML = '<div class="alca" aria-hidden="true"></div>' + html;
    f.hidden = false; b.hidden = false; void f.offsetWidth;
    f.classList.add('on'); b.classList.add('on');
    ['.topo', '.telas', '.abas'].forEach(function (s) { $(s).setAttribute('inert', ''); });
    var alvo = $('[data-foco-folha]', f) || $('button', f); if (alvo) alvo.focus({ preventScroll: true });
  }
  function fecharFolha() {
    var f = $('#folha'), b = $('#folhaFundo');
    if (f.hidden) return;
    f.classList.remove('on'); b.classList.remove('on');
    ['.topo', '.telas', '.abas'].forEach(function (s) { $(s).removeAttribute('inert'); });
    setTimeout(function () { f.hidden = true; b.hidden = true; }, reduz ? 0 : 380);
    if (restaurarFoco && abertaDe && document.contains(abertaDe)) abertaDe.focus({ preventScroll: true });
  }
  var folhaCab = function (tit) { return '<div class="folha-cab"><h3 id="folhaTit">' + tit + '</h3><button type="button" class="fechar" data-acao="fechar-folha" aria-label="Fechar">' + ic('x') + '</button></div>'; };

  /* ---------- Ações ---------- */
  function registrarItem(r) {
    r.id = 'r' + (++E.seq); r.hora = hhmm(agoraMin()); r.novo = true; r.sync = E.offline ? 'pendente' : 'enviado';
    E.registros.unshift(r);
    if (r.sync === 'enviado') addFeed(r);
    return r;
  }
  function addFeed(r) { E.feed.unshift({ quem: 'Marcos T. (você)', txt: r.feed || r.titulo, t: 'agora', novo: true }); if (E.feed.length > 6) E.feed.pop(); }

  function fazerCheckin() {
    var v = ativa(); if (!v || v.f.checkin || v.f.buscando) return;
    v.f.buscando = true; render('visita');
    setTimeout(function () {
      v.f.buscando = false; v.f.checkin = hhmm(agoraMin()); v.f.dist = 14; v.st = 'andamento';
      renderTudo(); toast('Check-in registrado às ' + v.f.checkin + '.');
    }, reduz ? 200 : 1600);
  }
  function pedirFinalizar() {
    var v = ativa(), f = v.f;
    if (!f.checkin) { toast('Faça o check-in antes de finalizar a visita.', 'aviso'); var c = $('#t-visita .checkin'); if (c) c.scrollIntoView({ block: 'center', behavior: reduz ? 'auto' : 'smooth' }); return; }
    f.erro = '';
    if (!f.resultado) f.erro = 'Escolha o resultado da visita.';
    else if (f.resultado === 'venda' && !f.plano) f.erro = 'Escolha o plano vendido.';
    if (f.erro) { render('visita'); var r = $('#resultado'); if (r) r.scrollIntoView({ block: 'center', behavior: reduz ? 'auto' : 'smooth' }); return; }
    var res = STATUS[f.resultado].t + (f.resultado === 'venda' ? ' · ' + planoDe(f.plano).nome : (f.resultado === 'reagendada' ? ' · ' + f.slot : ''));
    abrirFolha(folhaCab('Finalizar visita?') + '<p class="lede">Confira o resumo antes de registrar.</p><dl class="sum"><div class="lin"><dt>Cliente</dt><dd>' + esc(v.cliente) + '</dd></div><div class="lin"><dt>Resultado</dt><dd>' + esc(res) + '</dd></div><div class="lin"><dt>Checklist</dt><dd>' + f.checks.length + ' de ' + D.checklists[v.tipo].length + '</dd></div><div class="lin"><dt>Fotos</dt><dd>' + f.fotos.length + '</dd></div></dl>' +
      (E.offline ? '<div class="nota-off">' + ic('wifiOff') + '<div>Sem sinal: a visita será guardada no aparelho e enviada ao gestor quando o sinal voltar.</div></div>' : '') +
      '<div class="dupla"><button type="button" class="bt pri cheio" style="min-height:54px" data-acao="confirmar-fin" data-foco-folha>' + ic('check') + 'Confirmar e finalizar</button><button type="button" class="bt cheio" data-acao="fechar-folha">Voltar e revisar</button></div>');
  }
  function confirmarFinalizar() {
    var v = ativa(), f = v.f; v.st = f.resultado;
    var det = v.st === 'venda' ? 'Venda fechada · ' + planoDe(f.plano).nome : D.tipos[v.tipo].nome + ' · ' + STATUS[v.st].t;
    var feed = { concluida: 'Visita concluída · ' + v.bairro, ausente: 'Cliente ausente · ' + v.bairro, reagendada: 'Visita reagendada · ' + v.bairro, venda: 'Venda fechada · ' + (f.plano ? planoDe(f.plano).nome : '') }[v.st];
    var r = registrarItem({ origem: 'visita', visitaId: v.id, titulo: v.cliente, detalhe: det, venda: v.st === 'venda', feed: feed });
    restaurarFoco = false; fecharFolha();
    E.ativa = null; E.filtro = 'todas';
    ir('hoje');
    toast(r.sync === 'enviado' ? 'Visita finalizada e enviada ao gestor.' : 'Visita finalizada. Guardada no aparelho, aguardando sinal.', r.sync === 'enviado' ? '' : 'aviso');
    $('#t-hoje').scrollTop = 0;
  }
  function enviarRegistro() {
    var F = E.form, venda = F.tipo === 'venda', pl = planoDe(F.plano);
    var r = registrarItem({ origem: venda ? 'venda' : 'ocorrencia', titulo: F.nome.trim(), detalhe: venda ? 'Venda · ' + pl.nome : 'Ocorrência · ' + F.ocorr, venda: venda, feed: venda ? 'Venda registrada · ' + pl.nome : 'Ocorrência · ' + F.ocorr });
    F.sucesso = { sync: r.sync, titulo: F.nome.trim() };
    renderTudo(); $('#t-registrar').scrollTop = 0;
    toast(r.sync === 'enviado' ? 'Registro enviado ao gestor.' : 'Registro guardado no aparelho.', r.sync === 'enviado' ? '' : 'aviso');
  }
  function proximaEtapa() {
    var F = E.form;
    if (F.etapa < 3) {
      F.erros = validar(F, F.etapa);
      if (Object.keys(F.erros).length) {
        render('registrar');
        var primeiro = $('#t-registrar [aria-invalid="true"]') || $('#t-registrar .erro'); if (primeiro && primeiro.focus && primeiro.tagName !== 'P') primeiro.focus();
        return;
      }
      F.etapa++; render('registrar'); $('#t-registrar').scrollTop = 0; var h = $('#t-registrar [data-foco]'); if (h) h.focus({ preventScroll: true });
    } else enviarRegistro();
  }

  async function sincronizar() {
    if (E.sinc.rodando) return;
    var fila = E.registros.filter(function (r) { return r.sync === 'pendente'; }).reverse();
    if (!fila.length) return;
    E.sinc = { rodando: true, feitos: 0, total: fila.length }; renderTudo(); await espera(800);
    for (var i = 0; i < fila.length; i++) {
      var r = fila[i];
      if (E.offline) break;
      r.sync = 'enviando'; renderTudo(); await espera(1000);
      if (E.offline) { r.sync = 'pendente'; break; }
      r.sync = 'enviado'; r.novo = true; E.sinc.feitos++; addFeed(r); renderTudo(); await espera(450);
    }
    var ok = E.sinc.feitos; E.sinc.rodando = false; renderTudo();
    if (ok) toast(ok + (ok === 1 ? ' registro enviado' : ' registros enviados') + ' ao gestor. Tudo sincronizado.');
  }
  function alternarSinal() {
    E.offline = !E.offline; renderTudo();
    if (E.offline) toast('Modo sem sinal ligado. Os registros ficam guardados no aparelho.', 'aviso');
    else {
      var n = E.registros.filter(function (r) { return r.sync === 'pendente'; }).length;
      toast(n ? 'Sinal de volta. Enviando ' + n + (n === 1 ? ' registro…' : ' registros…') : 'Sinal de volta. Tudo sincronizado.');
      sincronizar();
    }
  }
  function abrirVisita(id) {
    E.ativa = id; var v = ativa(); if (v) v.f.erro = '';
    ir('visita', false); $('#t-visita').scrollTop = 0;
    var h = $('#t-visita [data-foco]'); if (h) h.focus({ preventScroll: true });
  }

  /* ---------- Eventos ---------- */
  var app = $('#app');
  app.addEventListener('click', function (e) {
    var a = e.target.closest('[data-acao]'); if (!a) return;
    var acao = a.dataset.acao, d = a.dataset;
    if (a.getAttribute('aria-disabled') === 'true' && acao === 'finalizar') { pedirFinalizar(); return; }
    switch (acao) {
      case 'aba': ir(d.aba); break;
      case 'filtro': E.filtro = d.f; render('hoje'); var fb = $('#t-hoje [data-f="' + d.f + '"]'); if (fb) fb.focus({ preventScroll: true }); break;
      case 'abrir': abrirVisita(d.id); break;
      case 'feitas-toggle': E.verFeitas = !E.verFeitas; render('hoje'); var tg = $('#t-hoje [data-acao="feitas-toggle"]'); if (tg) tg.focus({ preventScroll: true }); break;
      case 'checkin': fazerCheckin(); break;
      case 'ligar': toast('Ligação simulada. Nenhum número é discado.'); break;
      case 'rota': toast('Rota simulada. Nenhum mapa é aberto.'); break;
      case 'mais':
        abrirFolha(folhaCab('Ações da visita') + '<ul class="lista-acoes"><li><button type="button" data-acao="acao-folha" data-m="Ligação simulada. Nenhum número é discado." data-foco-folha>' + ic('phone') + 'Ligar para o cliente</button></li><li><button type="button" data-acao="acao-folha" data-m="Rota simulada. Nenhum mapa é aberto.">' + ic('nav') + 'Abrir rota no mapa</button></li><li><button type="button" data-acao="acao-folha" data-m="Problema no endereço sinalizado ao gestor (simulado).">' + ic('flag') + 'Sinalizar problema no endereço</button></li></ul>');
        break;
      case 'acao-folha': fecharFolha(); toast(d.m); break;
      case 'foto-add':
        abrirFolha(folhaCab('Adicionar foto') + '<p class="lede">Simulação: escolha uma das imagens de exemplo. A câmera do aparelho não é acessada.</p><div class="fotos-grade">' + D.fotos.map(function (f, i) {
          return '<button type="button" class="opt-foto" data-acao="foto-pick" data-id="' + f.id + '"' + (i === 0 ? ' data-foco-folha' : '') + '><svg viewBox="0 0 120 90" aria-hidden="true">' + f.svg + '</svg>' + esc(f.nome) + '</button>'; }).join('') + '</div>');
        break;
      case 'foto-pick': var vv = ativa(); if (vv && vv.f.fotos.length < 4) vv.f.fotos.push(d.id); fecharFolha(); render('visita'); toast('Foto adicionada à visita.'); break;
      case 'foto-rm': var v2 = ativa(); v2.f.fotos.splice(+d.i, 1); render('visita'); break;
      case 'finalizar': pedirFinalizar(); break;
      case 'confirmar-fin': confirmarFinalizar(); break;
      case 'fechar-folha': fecharFolha(); break;
      case 'tipo': E.form.tipo = d.t; E.form.erros = {}; E.form.plano = ''; E.form.ocorr = ''; render('registrar'); var tb = $('#t-registrar [data-t="' + d.t + '"]'); if (tb) tb.focus({ preventScroll: true }); break;
      case 'f-volt': E.form.etapa--; E.form.erros = {}; render('registrar'); break;
      case 'f-novo': E.form = novoForm(); render('registrar'); var hh = $('#t-registrar [data-foco]'); if (hh) hh.focus({ preventScroll: true }); break;
      case 'sinal': alternarSinal(); var sw = $('#t-sync .chave'); if (sw) sw.focus({ preventScroll: true }); break;
    }
  });
  app.addEventListener('submit', function (e) { e.preventDefault(); if (e.target.id === 'frm') proximaEtapa(); });
  function limparErro(c, el) {
    if (E.form.erros[c]) { delete E.form.erros[c]; el.removeAttribute('aria-invalid'); el.removeAttribute('aria-describedby'); var m = document.getElementById('e-' + c); if (m) m.remove(); }
  }
  app.addEventListener('input', function (e) {
    var el = e.target, c = el.dataset.campo; if (!c) return;
    var v = ativa();
    if (c === 'obs' && v) v.f.obs = el.value;
    else if (c === 'nome') { E.form.nome = el.value; limparErro('nome', el); }
    else if (c === 'tel') { el.value = mascara(el.value); E.form.tel = el.value; limparErro('tel', el); }
    else if (c === 'fobs') { E.form.obs = el.value; var ct = $('#f-cont'); if (ct) ct.textContent = el.value.length + '/200'; }
  });
  app.addEventListener('change', function (e) {
    var el = e.target, c = el.dataset.campo; if (!c) return;
    var v = ativa(), F = E.form;
    if (c === 'check' && v) { var i = +el.dataset.i, p = v.f.checks.indexOf(i); if (el.checked && p < 0) v.f.checks.push(i); else if (!el.checked && p > -1) v.f.checks.splice(p, 1); render('visita'); }
    else if (c === 'resultado' && v) { v.f.resultado = el.value; v.f.erro = ''; render('visita'); }
    else if (c === 'plano' && v) { v.f.plano = el.value; v.f.erro = ''; render('visita'); }
    else if (c === 'slot' && v) v.f.slot = el.value;
    else if (c === 'bairro') { F.bairro = el.value; limparErro('bairro', el); }
    else if (c === 'ocorr') { F.ocorr = el.value; limparErro('ocorr', el); }
    else if (c === 'fplano') { F.plano = el.value; delete F.erros.plano; var m = document.getElementById('e-plano'); if (m) m.remove(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !$('#folha').hidden) { e.preventDefault(); fecharFolha(); }
  });
  /* Item da rota inteiro é tocável com o mouse/dedo; o botão interno atende o teclado. */

  /* ---------- Início ---------- */
  var minAnt = agoraMin();
  setInterval(function () { var m = agoraMin(); if (m !== minAnt) { minAnt = m; chrome(); render('hoje'); } }, 20000);
  renderTudo();
  ir('hoje', false);
})();
