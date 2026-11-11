/* Pedidos e Atendimento · Casa Prática (empresa fictícia). Tudo roda no navegador; nada é enviado a lugar nenhum. */
(function () {
  'use strict';
  var D = window.DADOS;
  var HOJE = D.HOJE;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var ico = function (n, c) { return '<svg class="i ' + (c || '') + '" aria-hidden="true" focusable="false"><use href="#i-' + n + '"/></svg>'; };
  var pad = function (n) { return String(n).padStart(2, '0'); };

  var S = {
    perfil: 'atendente', rota: 'quadro', q: '', fResp: '', soAtr: false,
    drawerId: null, tab: 'tempo', convSel: 'v2', convView: 'lista', convFiltro: 'todas', convQ: '', assistRec: null,
    avisos: [], seq: 1050, min: 11 * 60 + 42, dragId: null, pulse: null, cliSeq: 24, anexoSeq: 0
  };
  var ultimoFoco = null, timerToast = null, timerGaveta = null;

  /* ---------- utilidades ---------- */
  function fmtData(iso) { return iso ? iso.slice(8, 10) + '/' + iso.slice(5, 7) : ''; }
  function fmtDT(q) { return fmtData(q.slice(0, 10)) + ' · ' + q.slice(11); }
  function dias(a, b) { return Math.round((Date.UTC(+b.slice(0, 4), +b.slice(5, 7) - 1, +b.slice(8, 10)) - Date.UTC(+a.slice(0, 4), +a.slice(5, 7) - 1, +a.slice(8, 10))) / 864e5); }
  var fmtBRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  function brl(n) { return fmtBRL.format(n || 0); }
  function n2(n) { return (n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function n1(n) { return (n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }); }
  function parseValor(s) {
    s = String(s || '').replace(/[R$\s]/g, '');
    if (!s) return 0;
    if (s.indexOf(',') > -1) s = s.replace(/\./g, '').replace(',', '.');
    else if (!/^\d+\.\d{1,2}$/.test(s)) s = s.replace(/\./g, '');
    var v = parseFloat(s);
    return isFinite(v) && v > 0 ? Math.round(v * 100) / 100 : 0;
  }
  function iniciais(n) { var p = n.trim().split(/\s+/); return (p[0][0] + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase(); }
  function primeiro(n) { return n.trim().split(/\s+/)[0]; }
  function digitos(s) { return String(s || '').replace(/\D/g, ''); }
  function fmtTel(d) {
    d = digitos(d).slice(0, 11);
    if (d.length <= 2) return d ? '(' + d : '';
    if (d.length <= 6) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
    if (d.length <= 10) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
    return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
  }
  function agora() { S.min++; return pad(Math.floor(S.min / 60)) + ':' + pad(S.min % 60); }
  function etapa(id) { return D.ETAPAS.filter(function (e) { return e.id === id; })[0]; }
  function etIdx(id) { return D.ETAPAS.map(function (e) { return e.id; }).indexOf(id); }
  function resp(id) { return D.EQUIPE.filter(function (e) { return e.id === id; })[0]; }
  function cli(id) { return D.CLIENTES.filter(function (c) { return c.id === id; })[0]; }
  function ped(id) { return D.PEDIDOS.filter(function (p) { return p.id === id; })[0]; }
  function conv(id) { return D.CONVERSAS.filter(function (c) { return c.id === id; })[0]; }
  function usuario() { return resp(D.PERFIS[S.perfil].usuario); }
  function total(p) { return p.itens.reduce(function (s, i) { return s + (i.q || 0) * (i.v || 0); }, 0); }
  function aberto(p) { return p.et !== 'entregue'; }
  function ehAtrasado(p) { return p.prazo < HOJE && p.et !== 'pronto' && p.et !== 'entregue'; }
  function diasParado(p) { return (p.et === 'pronto' || p.et === 'entregue') ? 0 : dias(p.ult, HOJE); }
  function visiveis() { return D.PEDIDOS.filter(function (p) { return S.perfil !== 'tecnico' || p.resp === usuario().id; }); }
  function av(r, g) { return '<span class="avatar ' + (g || '') + '" style="background:' + r.cor + '" aria-hidden="true">' + iniciais(r.nome) + '</span>'; }
  function avCli(c, g) { return '<span class="avatar ' + (g || '') + '" style="background:#4a5f86" aria-hidden="true">' + iniciais(c.nome) + '</span>'; }
  function orgIco(o) { return o === 'WhatsApp' ? 'whatsapp' : o === 'Balcão' ? 'store' : 'phone'; }

  /* ---------- avisos ---------- */
  function announce(msg) { var l = $('#live'); l.textContent = ''; setTimeout(function () { l.textContent = msg; }, 30); }
  function toast(msg, o) {
    o = o || {};
    var t = $('#toast');
    t.className = 'toast' + (o.erro ? ' erro' : '');
    t.innerHTML = ico(o.erro ? 'alert' : 'check') + '<span>' + esc(msg) + '</span>' + (o.acao ? '<button type="button">' + esc(o.acao.r) + '</button>' : '');
    t.hidden = false;
    if (o.acao) $('button', t).onclick = function () { t.hidden = true; o.acao.fn(); };
    clearTimeout(timerToast);
    timerToast = setTimeout(function () { t.hidden = true; }, o.acao ? 8000 : 5200);
  }
  function addEv(p, tipo, txt) { p.ev.push({ q: HOJE + 'T' + agora(), tipo: tipo, txt: txt }); }

  /* ---------- permissões ---------- */
  function motivoBloqueio(p, dest) {
    if (S.perfil === 'tecnico') {
      if (dest === 'entregue') return 'A entrega ao cliente é registrada pelo atendimento. Como técnico, você marca o pedido como Pronto.';
      if (dest === 'novo') return 'Voltar um pedido para "Novo" é com o atendimento.';
    }
    return '';
  }
  function podeCriar() { return S.perfil !== 'tecnico'; }
  function podeAprovar() { return S.perfil !== 'tecnico'; }
  function rotaPermitida(r) { return D.PERFIS[S.perfil].menu.indexOf(r) > -1; }

  /* ---------- mover etapa ---------- */
  function mover(id, dest) {
    var p = ped(id);
    if (!p || p.et === dest) return false;
    var why = motivoBloqueio(p, dest);
    if (why) { toast(why, { erro: true }); announce(why); return false; }
    var de = etapa(p.et);
    p.et = dest; p.ult = HOJE;
    if (dest === 'pronto' || dest === 'entregue') { if (de.id !== 'pronto' && de.id !== 'entregue') p.conc = true; } else p.conc = false;
    addEv(p, 'etapa', 'Etapa alterada de "' + de.nome + '" para "' + etapa(dest).nome + '" por ' + usuario().nome + '.');
    S.pulse = id;
    refresh();
    var msg = p.id + ' movido para "' + etapa(dest).nome + '".';
    announce(msg);
    toast(msg, dest === 'pronto' ? { acao: { r: 'Avisar cliente', fn: function () { abrirZap(id); } } } : {});
    return true;
  }
  function avancar(id) {
    var p = ped(id), i = etIdx(p.et);
    if (i < D.ETAPAS.length - 1) mover(id, D.ETAPAS[i + 1].id);
  }
  function refresh() {
    if (S.rota === 'quadro') renderBoard();
    if (S.rota === 'indicadores') drawCharts();
    if (S.drawerId) renderGaveta(true);
    renderNav();
    renderTopo();
  }

  /* ---------- chrome: menu, topo ---------- */
  var NAV = {
    quadro: { ic: 'board', nome: function () { return S.perfil === 'tecnico' ? 'Meus pedidos' : 'Quadro de pedidos'; } },
    conversas: { ic: 'chat', nome: function () { return 'Conversas'; } },
    indicadores: { ic: 'chart', nome: function () { return 'Indicadores'; } },
    automacoes: { ic: 'bolt', nome: function () { return 'Automações'; } }
  };
  function naoLidas() { return D.CONVERSAS.reduce(function (s, c) { return s + c.nl; }, 0); }
  function renderNav() {
    $('#nav').innerHTML = D.PERFIS[S.perfil].menu.map(function (r) {
      var cnt = r === 'conversas' && naoLidas() ? '<span class="cnt" aria-label="' + naoLidas() + ' não lidas">' + naoLidas() + '</span>' : '';
      return '<a href="#/' + r + '"' + (S.rota === r ? ' aria-current="page"' : '') + '>' + ico(NAV[r].ic) + '<span>' + NAV[r].nome() + '</span>' + cnt + '</a>';
    }).join('');
  }
  function renderTopo() {
    var u = usuario(), pf = D.PERFIS[S.perfil];
    $('#pgTitle').textContent = NAV[S.rota].nome();
    var vis = visiveis().filter(aberto).length;
    var sub = {
      quadro: 'Segunda-feira, 09/11 · ' + vis + ' pedidos em aberto' + (S.perfil === 'tecnico' ? ' com você' : ''),
      conversas: D.CONVERSAS.length + ' conversas · ' + naoLidas() + ' não lidas',
      indicadores: 'Visão da gestão · últimos 30 dias',
      automacoes: 'Regras que trabalham por você · somente leitura'
    };
    $('#pgSub').textContent = sub[S.rota];
    $('#topUser').innerHTML = av(u, 'g') + '<div><div class="u-nome">' + esc(u.nome) + '</div><div class="u-papel">' + pf.nome + '</div></div>';
    $('#perfilDesc').textContent = pf.desc;
    $('#perfil').value = S.perfil;
    $('#btnNovo').hidden = !(podeCriar() && (S.rota === 'quadro' || S.rota === 'conversas'));
    document.title = NAV[S.rota].nome() + ' · Pedidos e Atendimento (protótipo)';
  }

  /* ---------- rotas ---------- */
  function rotaAtual() {
    var h = (location.hash || '').replace('#/', '');
    return NAV[h] ? h : 'quadro';
  }
  function irParaRota() {
    var r = rotaAtual(), redir = false;
    if (!rotaPermitida(r)) {
      redir = true;
      var nome = NAV[r].nome();
      r = 'quadro';
      if (location.hash !== '#/quadro') history.replaceState(null, '', '#/quadro');
      toast('"' + nome + '" não está disponível para o perfil ' + D.PERFIS[S.perfil].nome + '.', { erro: true });
    }
    S.rota = r; S.redir = redir;
    var v = $('#view');
    v.className = 'view';
    v.scrollTop = 0;
    if (r === 'quadro') renderQuadro();
    else if (r === 'conversas') renderConversas();
    else if (r === 'indicadores') renderIndicadores();
    else renderAutomacoes();
    renderNav(); renderTopo();
    fecharMenu();
  }

  /* ======================= QUADRO ======================= */
  function filtrados() {
    var q = S.q.trim().toLowerCase();
    return visiveis().filter(function (p) {
      if (S.fResp && p.resp !== S.fResp) return false;
      if (S.soAtr && !ehAtrasado(p)) return false;
      if (q) {
        var c = cli(p.cli);
        var alvo = (p.id + ' ' + c.nome + ' ' + p.ap + ' ' + c.tel + ' ' + p.def).toLowerCase();
        if (alvo.indexOf(q) < 0) return false;
      }
      return true;
    });
  }
  function renderQuadro() {
    var v = $('#view');
    v.className = 'view fixo';
    var tec = S.perfil === 'tecnico';
    if (tec) S.fResp = '';
    v.innerHTML =
      '<div class="resumo" id="resumo" role="list" aria-label="Resumo"></div>' +
      '<div class="barra" role="search">' +
      '<div class="busca">' + ico('search') + '<input id="busca" type="search" placeholder="Buscar por cliente, aparelho ou número" aria-label="Buscar pedidos" value="' + esc(S.q) + '"></div>' +
      (tec ? '<span class="somente">' + ico('user', 'sm') + 'Somente os seus pedidos</span>' :
        '<select class="campo-sel" id="fResp" aria-label="Filtrar por responsável"><option value="">Todos os responsáveis</option>' +
        D.EQUIPE.filter(function (e) { return e.id !== 'helena'; }).map(function (e) { return '<option value="' + e.id + '"' + (S.fResp === e.id ? ' selected' : '') + '>' + esc(e.nome) + '</option>'; }).join('') + '</select>') +
      '<button class="tog" id="tgAtr" data-act="toggle-atr" aria-pressed="' + S.soAtr + '">' + ico('alert', 'sm') + 'Só atrasados</button>' +
      '<span class="esp"></span><span class="dica">' + ico('grip', 'sm') + 'Arraste os cartões ou use o botão Avançar</span></div>' +
      '<div class="board" id="board" tabindex="-1"></div>';
    renderBoard();
  }
  function renderResumo() {
    var vs = visiveis(), ab = vs.filter(aberto);
    var k = [
      ['board', '', ab.length, 'Em aberto'],
      ['alert', 'cr', vs.filter(ehAtrasado).length, 'Atrasados'],
      ['money', 'at', vs.filter(function (p) { return p.orcSt === 'pendente' && aberto(p); }).length, 'Orçamentos pendentes'],
      ['check', 'ok', vs.filter(function (p) { return p.et === 'pronto'; }).length, 'Prontos p/ retirada']
    ];
    $('#resumo').innerHTML = k.map(function (x) {
      return '<div class="kp" role="listitem"><span class="kp-i ' + x[1] + '">' + ico(x[0]) + '</span><div><b>' + x[2] + '</b><span>' + x[3] + '</span></div></div>';
    }).join('');
  }
  function prazoChip(p) {
    if (p.et === 'entregue') return '<span class="chip ok">' + ico('check') + 'Entregue ' + fmtData(p.ult) + '</span>';
    if (p.et === 'pronto') return '<span class="chip ok">' + ico('check') + 'Pronto desde ' + fmtData(p.ult) + '</span>';
    var d = dias(HOJE, p.prazo);
    if (d < 0) return '<span class="chip cr" title="Prazo prometido: ' + fmtData(p.prazo) + '">' + ico('alert') + 'Atrasado · ' + (-d) + (-d === 1 ? ' dia' : ' dias') + '</span>';
    if (d === 0) return '<span class="chip at">' + ico('clock') + 'Vence hoje</span>';
    return '<span class="chip neu">' + ico('calendar') + 'Prazo ' + fmtData(p.prazo) + '</span>';
  }
  function cartao(p) {
    var c = cli(p.cli), r = resp(p.resp), i = etIdx(p.et), prox = D.ETAPAS[i + 1];
    var par = diasParado(p);
    var chip2 = par >= 3 ? '<span class="chip at">' + ico('clock') + 'Parado há ' + par + ' d</span>' :
      (p.orcSt === 'pendente' && aberto(p) ? '<span class="chip at">' + ico('money') + 'Orçamento pendente</span>' : '');
    var foot;
    if (prox) {
      var bloq = motivoBloqueio(p, prox.id);
      foot = '<button type="button" class="pc-av" data-act="avancar" data-id="' + p.id + '"' + (bloq ? ' disabled title="' + esc(bloq) + '"' : '') +
        (bloq ? '' : ' title="Avançar etapa: ' + esc(prox.nome) + '"') + ' aria-label="Avançar etapa do pedido ' + p.id + ' para ' + esc(prox.nome) + '"><span class="lbl">Avançar</span>' + ico('arrow') + '</button>';
    } else foot = '<span class="pc-fim" title="Concluído">' + ico('check', 'sm') + '<span class="sr-only">Concluído</span></span>';
    return '<article class="pcard' + (ehAtrasado(p) ? ' atrasado' : '') + (S.pulse === p.id ? ' pulse' : '') + '" draggable="true" data-id="' + p.id + '" aria-label="Pedido ' + p.id + ', ' + esc(c.nome) + '">' +
      '<div class="pc-top"><span class="pc-num">' + p.id + '</span><span class="pc-org" title="Origem: ' + p.org + '">' + ico(orgIco(p.org)) + '<span>' + p.org + '</span></span></div>' +
      '<button type="button" class="pc-nome" data-act="abrir" data-id="' + p.id + '" aria-label="Abrir pedido ' + p.id + ' de ' + esc(c.nome) + '">' + esc(c.nome) + '</button>' +
      '<div class="pc-ap">' + esc(p.ap) + '</div>' +
      '<div class="pc-chips">' + prazoChip(p) + chip2 + '</div>' +
      '<div class="pc-foot"><span class="pc-resp" title="Responsável: ' + esc(r.nome) + '">' + av(r) + '<span>' + esc(primeiro(r.nome)) + '</span></span>' + foot + '</div></article>';
  }
  function renderBoard() {
    renderResumo();
    var lista = filtrados();
    var b = $('#board');
    if (!b) return;
    var filtrando = S.q.trim() || S.fResp || S.soAtr;
    if (filtrando && !lista.length) {
      b.innerHTML = '<div class="nada" style="width:100%">' + ico('search') + '<h3>Nenhum pedido encontrado</h3><p>Ajuste a busca ou limpe os filtros para ver o quadro completo.</p><button class="btn" data-act="limpar-filtros">Limpar filtros</button></div>';
      return;
    }
    b.innerHTML = D.ETAPAS.map(function (e) {
      var ps = lista.filter(function (p) { return p.et === e.id; });
      ps.sort(function (a, c) {
        if (e.id === 'entregue' || e.id === 'pronto') return a.ult < c.ult ? 1 : a.ult > c.ult ? -1 : 0;
        var aa = ehAtrasado(a) ? 0 : 1, cc = ehAtrasado(c) ? 0 : 1;
        return aa - cc || (a.prazo < c.prazo ? -1 : a.prazo > c.prazo ? 1 : 0);
      });
      return '<section class="col" data-et="' + e.id + '" style="--cc:' + e.cor + '" aria-labelledby="h-' + e.id + '">' +
        '<header class="col-h"><h2 id="h-' + e.id + '">' + e.nome + '</h2><span class="n" aria-label="' + ps.length + ' pedidos">' + ps.length + '</span></header>' +
        '<div class="col-b">' + (ps.length ? ps.map(cartao).join('') :
          '<div class="vazio-col">' + ico('inbox') + (filtrando ? 'Nenhum pedido com este filtro' : 'Nenhum pedido nesta etapa') + '</div>') + '</div></section>';
    }).join('');
    if (S.pulse) { var id = S.pulse; S.pulse = null; var el = $('.pcard[data-id="' + id + '"]', b); if (el) { try { el.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (x) { } } }
  }

  /* ---------- arrastar e soltar ---------- */
  document.addEventListener('dragstart', function (e) {
    var c = e.target.closest && e.target.closest('.pcard');
    if (!c) return;
    S.dragId = c.dataset.id;
    c.classList.add('arrastando');
    try { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', S.dragId); } catch (x) { }
    var p = ped(S.dragId);
    $$('.col').forEach(function (col) { if (col.dataset.et !== p.et && motivoBloqueio(p, col.dataset.et)) col.classList.add('bloq'); });
  });
  document.addEventListener('dragend', function () {
    S.dragId = null;
    $$('.pcard.arrastando').forEach(function (c) { c.classList.remove('arrastando'); });
    $$('.col').forEach(function (c) { c.classList.remove('over', 'bloq'); });
  });
  document.addEventListener('dragover', function (e) {
    var col = e.target.closest && e.target.closest('.col');
    if (!col || !S.dragId) return;
    e.preventDefault();
    try { e.dataTransfer.dropEffect = 'move'; } catch (x) { }
    var p = ped(S.dragId);
    $$('.col.over').forEach(function (c) { if (c !== col) c.classList.remove('over'); });
    if (col.dataset.et !== p.et) col.classList.add('over');
  });
  document.addEventListener('dragleave', function (e) {
    var col = e.target.closest && e.target.closest('.col');
    if (col && !col.contains(e.relatedTarget)) col.classList.remove('over');
  });
  document.addEventListener('drop', function (e) {
    var col = e.target.closest && e.target.closest('.col');
    if (!col || !S.dragId) return;
    e.preventDefault();
    var id = S.dragId;
    col.classList.remove('over');
    mover(id, col.dataset.et);
  });

  /* ======================= GAVETA ======================= */
  var ICONE_EV = { criado: 'plus', etapa: 'arrow', orcamento: 'money', whatsapp: 'whatsapp', nota: 'note', anexo: 'clip', checklist: 'list' };
  function abrirGaveta(id, tab) {
    var p = ped(id);
    if (!p) return;
    if (S.perfil === 'tecnico' && p.resp !== usuario().id) return;
    ultimoFoco = document.activeElement;
    S.drawerId = id; S.tab = tab || 'tempo';
    var d = $('#drawer');
    clearTimeout(timerGaveta);
    d.hidden = false; $('#scrimDrawer').hidden = false;
    renderGaveta();
    requestAnimationFrame(function () { d.classList.add('aberta'); });
    setTimeout(function () { var x = $('.dr-x', d); if (x) x.focus(); }, 60);
  }
  function fecharGaveta() {
    if (!S.drawerId) return;
    S.drawerId = null;
    var d = $('#drawer');
    d.classList.remove('aberta');
    $('#scrimDrawer').hidden = true;
    timerGaveta = setTimeout(function () { d.hidden = true; d.innerHTML = ''; }, 280);
    if (ultimoFoco && document.contains(ultimoFoco)) { try { ultimoFoco.focus(); } catch (x) { } }
  }
  function renderGaveta(manter) {
    var p = ped(S.drawerId);
    if (!p) return;
    var c = cli(p.cli), e = etapa(p.et), prox = D.ETAPAS[etIdx(p.et) + 1];
    var corpoScroll = manter ? ($('.dr-b', $('#drawer')) || {}).scrollTop : 0;
    var nCheck = p.check.filter(function (x) { return x.ok; }).length;
    var tec = S.perfil === 'tecnico';
    var chipsAtr = ehAtrasado(p) ? '<span class="chip cr">' + ico('alert') + 'Atrasado · ' + dias(p.prazo, HOJE) + ' d</span>' : '';
    var bloq = prox ? motivoBloqueio(p, prox.id) : '';
    $('#drawer').innerHTML =
      '<div class="dr-h">' +
      '<div class="dr-l1"><div style="min-width:0"><div class="dr-num"><span>' + p.id + '</span><span class="chip" style="background:' + e.cor + ';color:#fff">' + e.nome + '</span>' + chipsAtr + '</div>' +
      '<h2 id="drawerTitulo">' + esc(c.nome) + '</h2><div class="muted">' + esc(p.ap) + '</div></div>' +
      '<button class="dr-x" data-act="fechar-gaveta" aria-label="Fechar detalhes do pedido">' + ico('close') + '</button></div>' +
      '<div class="dr-meta">' +
      '<div class="m full"><small>Problema relatado</small>' + esc(p.def) + '</div>' +
      '<div class="m"><small>Telefone</small>' + esc(c.tel) + '</div>' +
      '<div class="m"><small>Origem · prazo</small>' + p.org + ' · prazo ' + fmtData(p.prazo) + '</div>' +
      '<div class="m"><small><label for="selEtapa">Etapa</label></small><select id="selEtapa" data-act-change="etapa">' +
      D.ETAPAS.map(function (x) { return '<option value="' + x.id + '"' + (x.id === p.et ? ' selected' : '') + '>' + x.nome + '</option>'; }).join('') + '</select></div>' +
      '<div class="m"><small><label for="selResp">Responsável</label></small><select id="selResp" data-act-change="resp"' + (tec ? ' disabled title="Somente atendimento e gestão trocam o responsável"' : '') + '>' +
      D.EQUIPE.filter(function (x) { return x.id !== 'helena'; }).map(function (x) { return '<option value="' + x.id + '"' + (x.id === p.resp ? ' selected' : '') + '>' + esc(x.nome) + '</option>'; }).join('') + '</select></div>' +
      '</div>' +
      '<div class="dr-acoes"><button class="btn zap" data-act="zap" data-id="' + p.id + '">' + ico('whatsapp') + 'Enviar atualização ao cliente</button>' +
      (prox ? '<button class="btn" data-act="avancar" data-id="' + p.id + '"' + (bloq ? ' disabled title="' + esc(bloq) + '"' : '') + '>Avançar etapa ' + ico('chev-r') + '</button>' : '') + '</div>' +
      '<div class="tabs" role="tablist" aria-label="Seções do pedido">' +
      tabBtn('tempo', 'Linha do tempo', p.ev.length) + tabBtn('check', 'Checklist', nCheck + '/' + p.check.length) + tabBtn('orc', 'Orçamento', '') + tabBtn('anex', 'Anexos', p.anexos.length) + '</div></div>' +
      '<div class="dr-b" id="drCorpo" role="tabpanel" aria-labelledby="tab-' + S.tab + '"></div>';
    renderCorpo();
    if (manter) $('#drCorpo').scrollTop = corpoScroll || 0;
  }
  function tabBtn(id, nome, n) {
    return '<button class="tab" role="tab" id="tab-' + id + '" data-act="tab" data-tab="' + id + '" aria-selected="' + (S.tab === id) + '" tabindex="' + (S.tab === id ? 0 : -1) + '">' + nome + (n !== '' ? ' <span class="tn">' + n + '</span>' : '') + '</button>';
  }
  function renderCorpo() {
    var p = ped(S.drawerId), b = $('#drCorpo');
    if (!p || !b) return;
    b.setAttribute('aria-labelledby', 'tab-' + S.tab);
    if (S.tab === 'tempo') b.innerHTML = htmlTempo(p);
    else if (S.tab === 'check') b.innerHTML = htmlCheck(p);
    else if (S.tab === 'orc') b.innerHTML = htmlOrc(p);
    else b.innerHTML = htmlAnexos(p);
  }
  function htmlTempo(p) {
    var evs = p.ev.map(function (x, i) { return { x: x, i: i }; }).sort(function (a, b) { return a.x.q < b.x.q ? 1 : a.x.q > b.x.q ? -1 : b.i - a.i; });
    return '<form class="nota-form" data-form="nota"><input name="n" aria-label="Registrar observação no pedido" placeholder="Registrar uma observação interna…" maxlength="240" autocomplete="off"><button class="btn pri peq" type="submit">Registrar</button></form>' +
      '<ol class="linha-t">' + evs.map(function (o) {
        var x = o.x, k = x.tipo === 'whatsapp' ? 'zap' : x.tipo === 'orcamento' ? 'orc' : x.tipo === 'nota' ? 'nota' : '';
        return '<li><span class="lt-ic ' + k + '">' + ico(ICONE_EV[x.tipo] || 'note') + '</span><div class="lt-q">' + fmtDT(x.q) + '</div><div class="lt-t">' + esc(x.txt) + '</div></li>';
      }).join('') + '</ol>';
  }
  function htmlCheck(p) {
    var n = p.check.filter(function (x) { return x.ok; }).length, pct = p.check.length ? Math.round(n / p.check.length * 100) : 0;
    return '<div class="sec-t">' + n + ' de ' + p.check.length + ' etapas concluídas</div><div class="prog" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100" aria-label="Progresso do checklist"><i style="width:' + pct + '%"></i></div>' +
      p.check.map(function (x, i) {
        return '<label class="ck"><input type="checkbox" data-i="' + i + '"' + (x.ok ? ' checked' : '') + '><span class="box">' + ico('check') + '</span><span class="tx">' + esc(x.t) + '</span></label>';
      }).join('') +
      '<form class="add-linha" data-form="check"><input name="t" aria-label="Novo item do checklist" placeholder="Adicionar item ao checklist…" maxlength="80" autocomplete="off"><button class="btn peq" type="submit">' + ico('plus', 'sm') + 'Adicionar</button></form>';
  }
  function htmlOrc(p) {
    var aprova = podeAprovar(), t = total(p), tem = p.itens.length > 0 && t > 0;
    var rows = p.itens.map(function (it, i) {
      return '<div class="orc-linha" data-i="' + i + '"><input class="d" aria-label="Descrição do item ' + (i + 1) + '" value="' + esc(it.d) + '" placeholder="Peça ou serviço" maxlength="80">' +
        '<input class="q" inputmode="numeric" aria-label="Quantidade do item ' + (i + 1) + '" value="' + it.q + '">' +
        '<input class="v" inputmode="decimal" aria-label="Valor unitário do item ' + (i + 1) + ' em reais" value="' + (it.v ? n2(it.v) : '') + '" placeholder="0,00">' +
        '<button type="button" class="orc-rm" data-act="orc-rm" data-i="' + i + '" aria-label="Remover item ' + (i + 1) + '">' + ico('trash') + '</button></div>';
    }).join('');
    var st = p.orcSt;
    var stTxt = st === 'aprovado' ? 'Aprovado pelo cliente' : st === 'pendente' ? 'Aguardando aprovação do cliente' : 'Ainda sem orçamento';
    return '<div class="aviso">' + ico('info') + '<div>Os valores são digitados por você. O sistema <b>não sugere preços</b>: cada item e cada valor vêm do que foi combinado com o cliente.</div></div>' +
      (p.itens.length ? '<div class="orc-linha cab" aria-hidden="true"><span>Item</span><span style="text-align:right">Qtd.</span><span style="text-align:right">Valor un. (R$)</span><span></span></div>' + rows :
        '<p class="p-vazio">Nenhum item ainda. Adicione peças e mão de obra com os valores que você combinou com o cliente.</p>') +
      '<button type="button" class="btn peq" data-act="orc-add">' + ico('plus', 'sm') + 'Adicionar item</button>' +
      '<div class="orc-total" aria-live="polite"><div><small>Total do orçamento</small><b id="orcTotal">' + brl(t) + '</b></div><span class="chip ' + (st === 'aprovado' ? 'ok' : st === 'pendente' ? 'at' : 'neu') + '">' + stTxt + '</span></div>' +
      '<div class="orc-st"><div role="group" aria-label="Situação do orçamento" class="seg">' +
      '<button type="button" class="pe" data-act="orc-st" data-v="pendente" aria-pressed="' + (st === 'pendente') + '"' + (!tem ? ' disabled' : '') + '>Pendente</button>' +
      '<button type="button" class="ap" data-act="orc-st" data-v="aprovado" aria-pressed="' + (st === 'aprovado') + '"' + (!tem || !aprova ? ' disabled' : '') + '>Aprovado</button></div>' +
      '<button type="button" class="btn pri peq" data-act="orc-salvar"' + (!tem ? ' disabled' : '') + '>Registrar orçamento</button></div>' +
      (!aprova ? '<p class="muted" style="margin-top:10px">A aprovação do cliente é registrada pelo atendimento. Como técnico, você lança as peças e os valores.</p>' : '') +
      (!tem ? '<p class="muted" style="margin-top:10px">Informe ao menos um item com valor para registrar o orçamento.</p>' : '');
  }
  function iconeAnexo(n) { return /\.(jpg|jpeg|png)$/i.test(n) ? 'image' : /\.(mp4|mov)$/i.test(n) ? 'video' : 'file'; }
  function htmlAnexos(p) {
    return '<p class="muted" style="margin:0 0 12px">Anexos simulados: nenhum arquivo é enviado ou guardado.</p>' +
      (p.anexos.length ? p.anexos.map(function (a, i) {
        return '<div class="anexo"><span class="ai">' + ico(iconeAnexo(a)) + '</span><div class="an">' + esc(a) + '<small>' + (/\.pdf$/i.test(a) ? 'Documento PDF' : /\.mp4$/i.test(a) ? 'Vídeo' : 'Foto') + ' · exemplo</small></div>' +
          '<button class="orc-rm" data-act="anexo-rm" data-i="' + i + '" aria-label="Remover anexo ' + esc(a) + '">' + ico('trash') + '</button></div>';
      }).join('') : '<div class="vazio-col" style="margin-bottom:12px">' + ico('clip') + 'Nenhum anexo neste pedido</div>') +
      '<button class="btn peq" data-act="anexo-add">' + ico('plus', 'sm') + 'Adicionar anexo (simulado)</button>';
  }

  /* ---------- mensagem de WhatsApp ---------- */
  function modeloZap(p) {
    var c = cli(p.cli), t = total(p);
    var motivo = (p.orcSt === 'pendente' && t > 0) ? 'O orçamento de ' + brl(t) + ' aguarda a sua aprovação.' : 'Estamos aguardando a chegada da peça necessária.';
    return D.MODELOS[p.et]
      .replace('{nome}', primeiro(c.nome)).replace('{num}', p.id).replace('{ap}', p.ap)
      .replace('{prazo}', fmtData(p.prazo)).replace('{motivo}', motivo);
  }
  function abrirZap(id) {
    var p = ped(id), c = cli(p.cli);
    var mod = modeloZap(p);
    abrirModal(
      '<div class="mod-h"><div><h2 id="modalTitulo">Atualização para o cliente</h2><p>Modelo da etapa "' + etapa(p.et).nome + '". Edite se quiser antes de enviar.</p></div>' +
      '<button class="dr-x" data-act="fechar-modal" aria-label="Fechar">' + ico('close') + '</button></div>' +
      '<div class="mod-b"><div class="pre-info">' + ico('info') + 'Simulação: nada é enviado de verdade. A mensagem só é registrada na linha do tempo.</div>' +
      '<div class="zap-tela"><div class="zap-cab">' + avCli(c) + '<div>' + esc(c.nome) + '<small>WhatsApp · ' + esc(c.tel) + '</small></div></div>' +
      '<div class="zap-bal" id="zapPrev">' + esc(mod) + '<span class="h">' + agoraSemAvancar() + ' ' + ico('check2', 'sm') + '</span></div></div>' +
      '<div class="fld"><label for="zapTxt">Texto da mensagem</label><textarea id="zapTxt" rows="4" maxlength="600">' + esc(mod) + '</textarea><div class="err" id="zapErr" hidden></div></div></div>' +
      '<div class="mod-f"><button class="btn fant" data-act="zap-restaurar" data-id="' + id + '">' + ico('history', 'sm') + 'Restaurar modelo</button><span style="flex:1"></span>' +
      '<button class="btn" data-act="fechar-modal">Cancelar</button><button class="btn zap" data-act="zap-enviar" data-id="' + id + '">' + ico('send') + 'Enviar (simulado)</button></div>',
      '#zapTxt');
  }
  function agoraSemAvancar() { var m = S.min + 1; return pad(Math.floor(m / 60)) + ':' + pad(m % 60); }
  function enviarZap(id) {
    var t = $('#zapTxt').value.trim(), er = $('#zapErr');
    if (t.length < 5) { er.hidden = false; er.innerHTML = ico('alert', 'sm') + 'Escreva a mensagem antes de enviar.'; $('#zapTxt').setAttribute('aria-invalid', 'true'); $('#zapTxt').focus(); return; }
    var p = ped(id), c = cli(p.cli);
    addEv(p, 'whatsapp', 'Atualização enviada ao cliente por WhatsApp (simulado): "' + (t.length > 160 ? t.slice(0, 157) + '…' : t) + '"');
    var cv = D.CONVERSAS.filter(function (x) { return x.cli === p.cli; })[0];
    if (cv) { cv.msgs.push({ d: '09/11', de: 'e', h: agora(), t: t, st: 'lido' }); if (!cv.pedido) cv.pedido = p.id; }
    fecharModal();
    refresh();
    toast('Mensagem registrada na linha do tempo de ' + p.id + '. Simulação: nada foi enviado.');
    announce('Atualização para ' + c.nome + ' registrada.');
  }

  /* ---------- modal genérico ---------- */
  function abrirModal(html, focoSel) {
    var m = $('#modal');
    if (m.hidden) ultimoFocoModal = document.activeElement;
    $('#modalBox').innerHTML = html;
    m.hidden = false;
    setTimeout(function () { var f = focoSel ? $(focoSel, m) : $('button, input', m); if (f) f.focus(); }, 40);
  }
  var ultimoFocoModal = null;
  function fecharModal() {
    var m = $('#modal');
    if (m.hidden) return;
    m.hidden = true; $('#modalBox').innerHTML = '';
    if (ultimoFocoModal && document.contains(ultimoFocoModal)) { try { ultimoFocoModal.focus(); } catch (x) { } }
  }

  /* ---------- novo pedido ---------- */
  function abrirNovo(pref) {
    pref = pref || {};
    var form = {
      nome: pref.nome || '', tel: pref.tel || '', ap: pref.ap || '', def: pref.def || '', org: pref.org || 'WhatsApp',
      prazo: D.dia(5), resp: 'camila'
    };
    abrirModal(htmlNovo(form, {}, pref), '#fNome');
  }
  function htmlNovo(f, er, pref) {
    function campo(id, rot, ctl, msg, ajuda) {
      return '<div class="fld' + (id === 'def' || id === 'nome' ? ' full' : '') + '"><label for="' + id + '">' + rot + ' <i aria-hidden="true">*</i></label>' + ctl +
        (msg ? '<div class="err" id="err-' + id + '">' + ico('alert', 'sm') + msg + '</div>' : (ajuda ? '<div class="help">' + ajuda + '</div>' : '')) + '</div>';
    }
    function inv(k) { return er[k] ? ' aria-invalid="true" aria-describedby="err-' + k + '"' : ''; }
    return '<div class="mod-h"><div><h2 id="modalTitulo">Novo pedido</h2><p>Registre um aparelho que chegou pelo balcão, telefone ou WhatsApp.</p></div>' +
      '<button class="dr-x" data-act="fechar-modal" aria-label="Fechar">' + ico('close') + '</button></div>' +
      '<form id="formNovo" novalidate><div class="mod-b">' +
      (pref.conv ? '<div class="pre-info">' + ico('chat', 'sm') + 'Preenchido a partir da conversa com ' + esc(cli(conv(pref.conv).cli).nome) + '. Confira antes de salvar.</div>' : '') +
      '<div class="form-g">' +
      campo('fNome', 'Nome do cliente', '<input id="fNome" name="nome" autocomplete="off" maxlength="80" value="' + esc(f.nome) + '"' + inv('fNome') + '>', er.fNome) +
      campo('fTel', 'Telefone / WhatsApp', '<input id="fTel" name="tel" inputmode="tel" autocomplete="off" placeholder="(61) 90000-0000" value="' + esc(f.tel) + '"' + inv('fTel') + '>', er.fTel) +
      campo('fOrg', 'Origem', '<select id="fOrg" name="org">' + ['WhatsApp', 'Balcão', 'Telefone'].map(function (o) { return '<option' + (f.org === o ? ' selected' : '') + '>' + o + '</option>'; }).join('') + '</select>', '') +
      campo('fAp', 'Aparelho', '<input id="fAp" name="ap" maxlength="70" placeholder="Ex.: Lavadora 11 kg" value="' + esc(f.ap) + '"' + inv('fAp') + '>', er.fAp) +
      campo('fPrazo', 'Prazo prometido', '<input id="fPrazo" name="prazo" type="date" min="' + HOJE + '" max="' + D.dia(90) + '" value="' + esc(f.prazo) + '"' + inv('fPrazo') + '>', er.fPrazo) +
      campo('def', 'Problema relatado', '<textarea id="def" name="def" maxlength="300" placeholder="O que o cliente descreveu?"' + inv('def') + '>' + esc(f.def) + '</textarea>', er.def) +
      '<div class="fld full"><label for="fResp2">Responsável</label><select id="fResp2" name="resp">' +
      D.EQUIPE.filter(function (e) { return e.id !== 'helena'; }).map(function (e) { return '<option value="' + e.id + '"' + (f.resp === e.id ? ' selected' : '') + '>' + esc(e.nome) + ' · ' + e.papel + '</option>'; }).join('') + '</select></div>' +
      '</div></div><div class="mod-f"><button type="button" class="btn" data-act="fechar-modal">Cancelar</button><button type="submit" class="btn pri">Criar pedido</button></div>' +
      '<input type="hidden" id="fConv" value="' + esc(pref.conv || '') + '"></form>';
  }
  function criarPedido(ev) {
    ev.preventDefault();
    var fm = ev.target, g = function (n) { return fm.elements[n].value.trim(); };
    var f = { nome: g('nome'), tel: g('tel'), org: g('org'), ap: g('ap'), prazo: g('prazo'), def: g('def'), resp: g('resp') };
    var er = {};
    if (f.nome.length < 3 || !/[A-Za-zÀ-ÿ]/.test(f.nome)) er.fNome = 'Informe o nome do cliente (mínimo 3 letras).';
    var dg = digitos(f.tel);
    if (dg.length < 10 || dg.length > 11) er.fTel = 'Informe o telefone com DDD, por exemplo (61) 90000-0000.';
    if (f.ap.length < 3) er.fAp = 'Informe o aparelho, por exemplo "Lavadora 11 kg".';
    if (f.def.length < 10) er.def = 'Descreva o problema com ao menos 10 caracteres.';
    if (!f.prazo) er.fPrazo = 'Escolha o prazo prometido ao cliente.';
    else if (f.prazo < HOJE) er.fPrazo = 'O prazo não pode ser anterior a hoje (09/11).';
    else if (f.prazo > D.dia(90)) er.fPrazo = 'O prazo deve ser de até 90 dias.';
    var convId = $('#fConv').value;
    if (Object.keys(er).length) {
      $('#modalBox').innerHTML = htmlNovo(f, er, { conv: convId });
      var primeiroErro = $('[aria-invalid="true"]', $('#modalBox'));
      if (primeiroErro) primeiroErro.focus();
      announce('Corrija os campos destacados: ' + Object.keys(er).length + ' erro(s).');
      return;
    }
    var c = D.CLIENTES.filter(function (x) { return digitos(x.tel) === dg; })[0];
    if (!c) { c = { id: 'c' + (++S.cliSeq), nome: f.nome, tel: fmtTel(dg), desde: HOJE }; D.CLIENTES.push(c); }
    else if (!c.desde) c.desde = HOJE;
    var id = 'PA-' + (S.seq++);
    var p = {
      id: id, cli: c.id, ap: f.ap, def: f.def, org: f.org, resp: f.resp, et: 'novo', cri: HOJE, prazo: f.prazo, ult: HOJE,
      itens: [], orcSt: 'sem', anexos: [], check: D.CHECK_PADRAO.map(function (t) { return { t: t, ok: false }; }), ev: []
    };
    addEv(p, 'criado', 'Pedido criado por ' + f.org + ' (registrado por ' + usuario().nome + ').');
    D.PEDIDOS.push(p);
    if (convId) {
      var cv = conv(convId);
      cv.pedido = id;
      cv.msgs.push({ d: '09/11', de: 's', h: agora(), t: 'Pedido ' + id + ' criado a partir desta conversa.', st: '' });
    }
    fecharModal();
    S.pulse = id;
    if (S.rota !== 'quadro' && !convId) location.hash = '#/quadro';
    refresh();
    if (S.rota === 'conversas') { renderConvChat(); renderConvPainel(); renderConvLista(); }
    toast('Pedido ' + id + ' criado na etapa "Novo".', { acao: { r: 'Abrir pedido', fn: function () { abrirGaveta(id); } } });
    announce('Pedido ' + id + ' criado.');
  }

  /* ======================= CONVERSAS ======================= */
  function ultima(c) { return c.msgs[c.msgs.length - 1]; }
  function chaveOrdem(c) { var m = ultima(c); return m.d.slice(3, 5) + m.d.slice(0, 2) + m.h; }
  function renderConversas() {
    var v = $('#view');
    v.className = 'view fixo conversas';
    if (S.assistRec === null) S.assistRec = window.innerWidth < 860 || window.innerHeight < 830;
    v.innerHTML = htmlAssistente() +
      '<div class="conv-grid" id="convGrid" data-v="' + S.convView + '">' +
      '<section class="cl" aria-label="Lista de conversas"><div class="cl-h"><h2>Conversas</h2>' +
      '<div class="busca">' + ico('search') + '<input id="convBusca" type="search" placeholder="Buscar conversa" aria-label="Buscar conversa" value="' + esc(S.convQ) + '"></div>' +
      '<div class="filt" role="group" aria-label="Filtrar conversas">' +
      [['todas', 'Todas'], ['nao', 'Não lidas'], ['sem', 'Sem pedido']].map(function (f) { return '<button type="button" data-act="conv-filtro" data-f="' + f[0] + '" aria-pressed="' + (S.convFiltro === f[0]) + '">' + f[1] + '</button>'; }).join('') + '</div></div>' +
      '<ul class="cl-lista" id="clLista"></ul></section>' +
      '<section class="ch" id="ch" aria-label="Conversa"></section>' +
      '<aside class="painel" id="cp" aria-label="Painel do cliente"></aside></div>';
    renderConvLista(); renderConvChat(); renderConvPainel();
  }
  function htmlAssistente() {
    var rec = S.assistRec;
    return '<section class="assist' + (rec ? ' recolhido' : '') + '" aria-label="Assistente virtual, em breve">' +
      '<div><div class="assist-bar"><span class="assist-tag">' + ico('bot', 'sm') + 'Assistente virtual · em breve</span></div>' +
      '<h2>Triagem inicial no WhatsApp</h2>' +
      '<p>Imagine o assistente da Casa Prática fazendo as primeiras perguntas e entregando o pedido já organizado no quadro.</p>' +
      '<span class="exemplo">Exemplo ilustrativo · não é uma IA em funcionamento</span></div>' +
      '<div class="mini-chat" aria-label="Exemplo de perguntas iniciais">' +
      '<div class="b"><em>Assistente</em>Qual aparelho precisa de reparo?</div><div class="c">Lavadora de 11 kg</div>' +
      '<div class="b"><em>Assistente</em>O que está acontecendo com ele?</div><div class="c">Não centrifuga a roupa</div>' +
      '<div class="b"><em>Assistente</em>Prefere visita ou levar até a loja?</div><div class="c">Visita, de manhã</div></div>' +
      '<div class="pedido-ex" aria-label="Exemplo de pedido organizado"><h4>Vira um pedido organizado <span class="chip">Novo</span></h4><dl>' +
      '<dt>Cliente</dt><dd>Cliente de exemplo</dd><dt>Aparelho</dt><dd>Lavadora 11 kg</dd><dt>Problema</dt><dd>Não centrifuga a roupa</dd><dt>Atendimento</dt><dd>Visita, pela manhã</dd><dt>Origem</dt><dd>WhatsApp</dd></dl></div>' +
      '<button class="assist-x" data-act="assist-toggle" aria-expanded="' + !rec + '" aria-label="' + (rec ? 'Expandir exemplo do assistente virtual' : 'Recolher exemplo do assistente virtual') + '">' + ico(rec ? 'chev-d' : 'close') + '</button></section>';
  }
  function renderConvLista() {
    var q = S.convQ.trim().toLowerCase();
    var lista = D.CONVERSAS.filter(function (c) {
      if (S.convFiltro === 'nao' && !c.nl) return false;
      if (S.convFiltro === 'sem' && c.pedido) return false;
      if (q && (cli(c.cli).nome + ' ' + ultima(c).t).toLowerCase().indexOf(q) < 0) return false;
      return true;
    }).sort(function (a, b) { return chaveOrdem(a) < chaveOrdem(b) ? 1 : -1; });
    $$('[data-act="conv-filtro"]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.f === S.convFiltro); });
    var ul = $('#clLista');
    if (!lista.length) { ul.innerHTML = '<li><div class="nada">' + ico('chat') + '<h3>Nenhuma conversa</h3><p>Nada corresponde ao filtro ou à busca.</p></div></li>'; return; }
    ul.innerHTML = lista.map(function (c) {
      var cl = cli(c.cli), m = ultima(c);
      var hr = m.d === '09/11' ? m.h : m.d === '08/11' ? 'Ontem' : m.d;
      return '<li><button type="button" class="cl-it" data-act="conv-sel" data-id="' + c.id + '"' + (S.convSel === c.id ? ' aria-current="true"' : '') + '>' + avCli(cl, 'g') +
        '<span class="tx"><span class="l1"><span class="nm">' + esc(cl.nome) + '</span><span class="hr">' + hr + '</span></span>' +
        '<span class="l2"><span class="pv">' + (m.de === 'e' ? 'Você: ' : '') + esc(m.t) + '</span>' + (c.nl ? '<span class="nl" aria-label="' + c.nl + ' não lidas">' + c.nl + '</span>' : '') + '</span>' +
        '<span class="sp">' + (c.pedido ? '<span class="chip">' + c.pedido + '</span>' : '<span class="chip at">Sem pedido</span>') + '</span></span></button></li>';
    }).join('');
  }
  function statusMsg(m) {
    if (m.de !== 'e') return '';
    if (m.st === 'lido') return '<span class="lido" title="Lido">' + ico('check2') + '</span> Lido';
    if (m.st === 'entregue') return ico('check2') + ' Entregue';
    return ico('check') + ' Enviado';
  }
  function htmlMsgs(c) {
    var out = '', dia = '';
    c.msgs.forEach(function (m) {
      if (m.d !== dia) { dia = m.d; out += '<div class="dia-sep">' + (m.d === '09/11' ? 'Hoje · 09/11' : m.d === '08/11' ? 'Ontem · 08/11' : m.d) + '</div>'; }
      if (m.de === 's') out += '<div class="bal s">' + esc(m.t) + '</div>';
      else out += '<div class="bal ' + m.de + '"><div>' + esc(m.t) + '</div><div class="m">' + m.h + ' ' + statusMsg(m) + '</div></div>';
    });
    return out;
  }
  function renderConvChat() {
    var c = conv(S.convSel), ch = $('#ch');
    if (!c) { ch.innerHTML = '<div class="nada">' + ico('chat') + '<h3>Selecione uma conversa</h3></div>'; return; }
    var cl = cli(c.cli);
    ch.innerHTML =
      '<div class="ch-h"><button class="ch-back" data-act="conv-voltar" aria-label="Voltar para a lista de conversas">' + ico('chev-l') + '</button>' + avCli(cl, 'g') +
      '<div class="tx"><div class="nm">' + esc(cl.nome) + '</div><div class="sub">' + ico('whatsapp', 'sm') + esc(cl.tel) + (c.pedido ? ' <span class="chip">' + c.pedido + '</span>' : ' <span class="chip at">Sem pedido</span>') + '</div></div>' +
      '<button class="btn pri peq" data-act="conv-criar" aria-label="Criar pedido a partir da conversa" title="Criar pedido a partir da conversa">' + ico('plus', 'sm') + '<span>Criar pedido<span class="long"> a partir da conversa</span></span></button>' +
      '<button class="ch-info" data-act="conv-info" aria-label="Ver dados do cliente">' + ico('user') + '</button></div>' +
      '<div class="ch-msgs" id="chMsgs" tabindex="0" role="log" aria-label="Mensagens com ' + esc(cl.nome) + '">' + htmlMsgs(c) + '</div>' +
      '<div class="respostas" role="group" aria-label="Respostas rápidas">' + D.RESPOSTAS.map(function (r, i) { return '<button type="button" data-act="resp-rapida" data-i="' + i + '">' + esc(r.r) + '</button>'; }).join('') + '</div>' +
      '<form class="comp" data-form="msg"><textarea id="msgTxt" rows="1" maxlength="500" aria-label="Escrever mensagem" placeholder="Escreva uma mensagem (simulada)"></textarea>' +
      '<button class="btn pri" type="submit" aria-label="Enviar mensagem">' + ico('send') + '</button></form>';
    var box = $('#chMsgs'); box.scrollTop = box.scrollHeight;
  }
  function renderConvPainel() {
    var c = conv(S.convSel), p = $('#cp');
    if (!c) { p.innerHTML = ''; return; }
    var cl = cli(c.cli);
    var peds = D.PEDIDOS.filter(function (x) { return x.cli === cl.id; });
    p.innerHTML =
      '<button class="ch-back" data-act="conv-voltar" style="margin-bottom:12px" aria-label="Voltar para a conversa">' + ico('chev-l') + '</button>' +
      '<div class="p-cli">' + avCli(cl, 'xg') + '<h3>' + esc(cl.nome) + '</h3><p>' + esc(cl.tel) + '</p></div>' +
      '<dl class="p-fatos"><dt>Cliente desde</dt><dd>' + (cl.desde ? cl.desde.slice(8, 10) + '/' + cl.desde.slice(5, 7) + '/' + cl.desde.slice(0, 4) : 'Novo contato') + '</dd><dt>Pedidos</dt><dd>' + peds.length + '</dd><dt>Canal</dt><dd>WhatsApp</dd></dl>' +
      '<div class="p-sec"><h4>Pedidos deste cliente</h4>' +
      (peds.length ? peds.map(function (x) {
        var e = etapa(x.et);
        return '<button class="p-ped" data-act="abrir" data-id="' + x.id + '"' + (S.perfil === 'tecnico' && x.resp !== usuario().id ? ' disabled' : '') + '><span class="l1"><span>' + x.id + '</span><span class="chip" style="background:' + e.cor + ';color:#fff">' + e.nome + '</span></span><span class="l2" style="display:block">' + esc(x.ap) + '</span></button>';
      }).join('') : '<p class="p-vazio">Este contato ainda não tem pedidos. Use o botão abaixo para registrar o atendimento.</p>') + '</div>' +
      '<div class="criar-box"><button class="btn pri" data-act="conv-criar">' + ico('plus', 'sm') + 'Criar pedido desta conversa</button></div>';
  }
  function selecionarConv(id) {
    S.convSel = id; S.convView = 'chat';
    var c = conv(id); c.nl = 0;
    var g = $('#convGrid'); if (g) g.dataset.v = 'chat';
    renderConvLista(); renderConvChat(); renderConvPainel(); renderNav(); renderTopo();
  }
  function enviarMsg(texto) {
    var c = conv(S.convSel);
    var m = { d: '09/11', de: 'e', h: agora(), t: texto, st: 'enviado' };
    c.msgs.push(m);
    var box = $('#chMsgs'); box.innerHTML = htmlMsgs(c); box.scrollTop = box.scrollHeight;
    renderConvLista();
    function mudar(st) { m.st = st; if (S.convSel === c.id && S.rota === 'conversas') { var b = $('#chMsgs'); if (b) { var top = b.scrollTop; b.innerHTML = htmlMsgs(c); b.scrollTop = top; } } }
    setTimeout(function () { mudar('entregue'); }, 900);
    setTimeout(function () { mudar('lido'); }, 2200);
  }
  function criarDeConversa() {
    var c = conv(S.convSel), cl = cli(c.cli);
    var def = c.triagem ? c.triagem.def : (c.msgs.filter(function (m) { return m.de === 'c'; })[0] || { t: '' }).t.slice(0, 200);
    abrirNovo({ conv: c.id, nome: cl.nome, tel: cl.tel, ap: c.triagem ? c.triagem.ap : '', def: def, org: 'WhatsApp' });
  }

  /* ======================= INDICADORES ======================= */
  function renderIndicadores() {
    var v = $('#view');
    v.className = 'view';
    var vs = D.PEDIDOS, ab = vs.filter(aberto), atr = vs.filter(ehAtrasado);
    var tm = D.HISTORICO.tempoMedio.reduce(function (s, x) { return s + x.d; }, 0);
    var conc = 0; Object.keys(D.HISTORICO.concluidosMes).forEach(function (k) { conc += D.HISTORICO.concluidosMes[k]; });
    var extra = vs.filter(function (p) { return p.conc; }).length;
    function kpi(l, val, d, cl) { return '<div class="card kpi"><span class="l">' + l + '</span><span class="v">' + val + '</span><span class="d ' + (cl || '') + '">' + d + '</span></div>'; }
    var tecs = D.EQUIPE.filter(function (e) { return e.papel === 'Técnico'; });
    v.innerHTML = '<div class="indic"><div class="kpis">' +
      kpi('Pedidos em aberto', ab.length, 'de ' + vs.length + ' no quadro') +
      kpi('Atrasados', atr.length, atr.length ? 'Prazo vencido e ainda não pronto' : 'Nenhum atraso', atr.length ? 'cr' : 'ok') +
      kpi('Tempo médio de ponta a ponta', n1(tm) + ' dias', 'Meta: até 8,0 dias', tm <= 8 ? 'ok' : 'cr') +
      kpi('Concluídos em 30 dias', conc + extra, 'Pedidos prontos ou entregues', 'ok') + '</div>' +
      '<div class="graficos">' +
      '<div class="card gcard c6"><h2>Pedidos por etapa</h2><p class="sub">Situação atual do quadro</p><div class="chart" id="gEtapa" data-label="Pedidos por etapa"></div></div>' +
      '<div class="card gcard c6"><h2>Tempo médio por etapa</h2><p class="sub">Em dias · barras em âmbar passam da meta de 2,0 dias</p><div class="chart" id="gTempo" data-label="Tempo médio por etapa em dias"></div></div>' +
      '<div class="card gcard c8"><h2>Pedidos recebidos e entregues</h2><p class="sub">Por dia, de 26/10 a 08/11</p><div class="chart" id="gLinha" data-label="Pedidos recebidos e entregues por dia"></div>' +
      '<div class="legenda"><span><i class="dot" style="background:#1e3a8a"></i>Recebidos</span><span><i class="dot" style="background:#0f7a4d"></i>Entregues</span></div></div>' +
      '<div class="card gcard c4"><h2>Origem dos pedidos</h2><p class="sub">Pedidos no quadro</p><div class="chart" id="gOrigem" data-label="Pedidos por origem"></div></div>' +
      '<div class="card gcard c6"><h2>Produtividade por responsável</h2><p class="sub">Concluídos em 30 dias e pedidos em aberto agora</p><div class="chart" id="gProd" data-label="Produtividade por responsável"></div>' +
      '<div class="legenda"><span><i class="dot" style="background:#1e3a8a"></i>Concluídos em 30 dias</span><span><i class="dot" style="background:#93c5fd"></i>Em aberto agora</span></div>' +
      '<div class="scroll-x" style="margin-top:10px"><table class="tabela"><thead><tr><th>Responsável</th><th class="num">Em aberto</th><th class="num">Atrasados</th><th class="num">Tempo de execução</th></tr></thead><tbody>' +
      tecs.map(function (t) {
        var meus = vs.filter(function (p) { return p.resp === t.id; });
        return '<tr><td><span class="pessoa">' + av(t) + esc(t.nome) + '</span></td><td class="num">' + meus.filter(aberto).length + '</td><td class="num">' + meus.filter(ehAtrasado).length + '</td><td class="num">' + n1(D.HISTORICO.tempoExec[t.id]) + ' d</td></tr>';
      }).join('') + '</tbody></table></div></div>' +
      '<div class="card gcard c6"><h2>Pedidos atrasados</h2><p class="sub">Prazo prometido vencido e ainda sem ficar pronto</p>' +
      (atr.length ? '<div class="scroll-x"><table class="tabela"><thead><tr><th>Pedido</th><th>Cliente</th><th>Etapa</th><th class="num">Atraso</th></tr></thead><tbody>' +
        atr.sort(function (a, b) { return a.prazo < b.prazo ? -1 : 1; }).map(function (p) {
          return '<tr><td><button class="lk" data-act="abrir" data-id="' + p.id + '">' + p.id + '</button></td><td>' + esc(cli(p.cli).nome) + '<div class="muted">' + esc(p.ap) + ' · ' + esc(primeiro(resp(p.resp).nome)) + '</div></td><td>' + etapa(p.et).curto + '</td><td class="num"><span class="chip cr">' + dias(p.prazo, HOJE) + ' d</span></td></tr>';
        }).join('') + '</tbody></table></div>' : '<div class="nada">' + ico('check') + '<h3>Nenhum pedido atrasado</h3></div>') + '</div>' +
      '</div></div>';
    drawCharts();
  }
  function svgBase(W, H, label) { return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" role="group" aria-label="' + esc(label) + '">'; }
  function drawCharts() {
    if (S.rota !== 'indicadores') return;
    var vs = D.PEDIDOS;
    // 1. pedidos por etapa
    var el = $('#gEtapa');
    if (el) {
      var W = el.clientWidth || 320, lw = W < 440 ? 100 : 156, rh = 38, bw = Math.max(W - lw - 48, 60);
      var its = D.ETAPAS.map(function (e) { return { label: e.nome, v: vs.filter(function (p) { return p.et === e.id; }).length, cor: e.cor }; });
      var mx = Math.max.apply(null, its.map(function (i) { return i.v; }).concat(1));
      var s = svgBase(W, its.length * rh + 4, el.dataset.label);
      its.forEach(function (it, k) {
        var y = k * rh + 4, w = it.v ? Math.max(it.v / mx * bw, 6) : 0;
        s += '<g class="barra-g" data-t="' + esc(it.label) + '" data-v="' + it.v + (it.v === 1 ? ' pedido' : ' pedidos') + '" tabindex="0" role="img" aria-label="' + esc(it.label) + ': ' + it.v + ' pedidos">' +
          '<text x="0" y="' + (y + rh / 2) + '" dominant-baseline="middle">' + esc(it.label.length > 16 && W < 440 ? it.label.replace('Aguardando peça/cliente', 'Aguardando') : it.label) + '</text>' +
          '<rect x="' + lw + '" y="' + (y + 7) + '" width="' + bw + '" height="' + (rh - 14) + '" rx="8" fill="#eaf0fb"/>' +
          (w ? '<rect x="' + lw + '" y="' + (y + 7) + '" width="' + w + '" height="' + (rh - 14) + '" rx="8" fill="' + it.cor + '"/>' : '') +
          '<text x="' + (lw + w + 9) + '" y="' + (y + rh / 2) + '" dominant-baseline="middle" style="font-weight:700;fill:#0f2347">' + it.v + '</text></g>';
      });
      el.innerHTML = s + '</svg>';
    }
    // 2. tempo médio por etapa (colunas)
    el = $('#gTempo');
    if (el) {
      var Wc = el.clientWidth || 320, Hc = 236, L = 34, B = 30, T = 18, meta = D.HISTORICO.metaDias;
      var dados = D.HISTORICO.tempoMedio, yMax = 4;
      var ph = Hc - B - T, slot = (Wc - L - 6) / dados.length, bwd = Math.min(46, slot * .58);
      var yy = function (v) { return T + ph - v / yMax * ph; };
      var sc = svgBase(Wc, Hc, el.dataset.label);
      for (var g = 0; g <= yMax; g++) sc += '<line class="eixo" x1="' + L + '" x2="' + Wc + '" y1="' + yy(g) + '" y2="' + yy(g) + '"/><text x="' + (L - 8) + '" y="' + (yy(g) + 4) + '" text-anchor="end">' + g + '</text>';
      dados.forEach(function (d, k) {
        var x = L + slot * k + (slot - bwd) / 2, top = yy(d.d), cor = d.d > meta ? '#b76e00' : '#3b82f6', e = etapa(d.et);
        sc += '<g class="barra-g" data-t="' + e.nome + '" data-v="' + n1(d.d) + ' dias em média' + (d.d > meta ? ' · acima da meta' : '') + '" tabindex="0" role="img" aria-label="' + e.nome + ': ' + n1(d.d) + ' dias"><rect x="' + x + '" y="' + top + '" width="' + bwd + '" height="' + (yy(0) - top) + '" rx="6" fill="' + cor + '"/>' +
          '<text x="' + (x + bwd / 2) + '" y="' + (top - 6) + '" text-anchor="middle" style="font-weight:700;fill:#0f2347">' + n1(d.d) + '</text>' +
          '<text x="' + (x + bwd / 2) + '" y="' + (Hc - 8) + '" text-anchor="middle">' + e.curto + '</text></g>';
      });
      sc += '<line x1="' + L + '" x2="' + Wc + '" y1="' + yy(meta) + '" y2="' + yy(meta) + '" stroke="#b42318" stroke-width="1.5" stroke-dasharray="5 4"/><text x="' + Wc + '" y="' + (yy(meta) - 5) + '" text-anchor="end" style="fill:#b42318;font-weight:700">Meta ' + n1(meta) + ' d</text>';
      el.innerHTML = sc + '</svg>';
    }
    // 3. linha: recebidos x entregues
    el = $('#gLinha');
    if (el) {
      var Wl = el.clientWidth || 320, Hl = 244, l = 30, r = 12, t = 14, b = 30, n = 14;
      var A = D.HISTORICO.serie.recebidos, Bs = D.HISTORICO.serie.entregues, ym = 8;
      var xs = function (i) { return l + i * (Wl - l - r) / (n - 1); }, ys = function (v) { return t + (Hl - t - b) * (1 - v / ym); };
      var sl = svgBase(Wl, Hl, el.dataset.label);
      for (var gy = 0; gy <= ym; gy += 2) sl += '<line class="eixo" x1="' + l + '" x2="' + (Wl - r) + '" y1="' + ys(gy) + '" y2="' + ys(gy) + '"/><text x="' + (l - 8) + '" y="' + (ys(gy) + 4) + '" text-anchor="end">' + gy + '</text>';
      var rotulos = []; for (var i = 0; i < n; i++) rotulos.push(fmtData(D.dia(-14 + i)));
      var pontos = function (S2) { return S2.map(function (v, i) { return xs(i) + ',' + ys(v); }).join(' '); };
      sl += '<polygon points="' + xs(0) + ',' + ys(0) + ' ' + pontos(A) + ' ' + xs(n - 1) + ',' + ys(0) + '" fill="rgba(30,58,138,.08)"/>' +
        '<polyline points="' + pontos(A) + '" fill="none" stroke="#1e3a8a" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>' +
        '<polyline points="' + pontos(Bs) + '" fill="none" stroke="#0f7a4d" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round" stroke-dasharray="1 0"/>';
      var step = Wl < 480 ? 3 : 2;
      for (i = 0; i < n; i++) {
        var w = (Wl - l - r) / (n - 1);
        sl += '<g class="dia" data-t="' + rotulos[i] + '" data-v="Recebidos: ' + A[i] + ' · Entregues: ' + Bs[i] + '" tabindex="0" role="img" aria-label="' + rotulos[i] + ': ' + A[i] + ' recebidos, ' + Bs[i] + ' entregues">' +
          '<rect x="' + (xs(i) - w / 2) + '" y="' + t + '" width="' + w + '" height="' + (Hl - t - b) + '" fill="transparent"/>' +
          '<line class="guia" x1="' + xs(i) + '" x2="' + xs(i) + '" y1="' + t + '" y2="' + (Hl - b) + '" stroke="#6a7e9c" stroke-dasharray="3 3"/>' +
          '<circle cx="' + xs(i) + '" cy="' + ys(A[i]) + '" r="4" fill="#fff" stroke="#1e3a8a" stroke-width="2.4"/>' +
          '<rect x="' + (xs(i) - 3.6) + '" y="' + (ys(Bs[i]) - 3.6) + '" width="7.2" height="7.2" rx="1.5" fill="#fff" stroke="#0f7a4d" stroke-width="2.4"/>' +
          (i % step === 0 || i === n - 1 ? '<text x="' + xs(i) + '" y="' + (Hl - 8) + '" text-anchor="middle">' + rotulos[i] + '</text>' : '') + '</g>';
      }
      el.innerHTML = sl + '</svg>';
    }
    // 4. rosca por origem
    el = $('#gOrigem');
    if (el) {
      var orgs = [['WhatsApp', '#1e3a8a'], ['Balcão', '#3b82f6'], ['Telefone', '#93c5fd']].map(function (o) { return { label: o[0], cor: o[1], v: vs.filter(function (p) { return p.org === o[0]; }).length }; });
      var tot = orgs.reduce(function (s2, o) { return s2 + o.v; }, 0), size = 168, rr = 62, sw = 28, c0 = size / 2, circ = 2 * Math.PI * rr, acc = 0;
      var sr = svgBase(size, size, el.dataset.label);
      sr += '<circle cx="' + c0 + '" cy="' + c0 + '" r="' + rr + '" fill="none" stroke="#eaf0fb" stroke-width="' + sw + '"/>';
      orgs.forEach(function (o) {
        var len = o.v / tot * circ;
        sr += '<circle data-t="' + o.label + '" data-v="' + o.v + ' pedidos · ' + Math.round(o.v / tot * 100) + '%" tabindex="0" role="img" aria-label="' + o.label + ': ' + o.v + ' pedidos" cx="' + c0 + '" cy="' + c0 + '" r="' + rr + '" fill="none" stroke="' + o.cor + '" stroke-width="' + sw + '" stroke-dasharray="' + Math.max(len - 3, 0) + ' ' + (circ - Math.max(len - 3, 0)) + '" stroke-dashoffset="' + (-acc) + '" transform="rotate(-90 ' + c0 + ' ' + c0 + ')"/>';
        acc += len;
      });
      sr += '<text x="' + c0 + '" y="' + (c0 + 2) + '" text-anchor="middle" style="font-family:Sora,sans-serif;font-size:28px;font-weight:700;fill:#0f2347">' + tot + '</text><text x="' + c0 + '" y="' + (c0 + 20) + '" text-anchor="middle">pedidos</text></svg>';
      el.innerHTML = '<div class="rosca-w">' + sr + '<div class="legenda" style="flex-direction:column;margin:0">' + orgs.map(function (o) { return '<span><i class="dot" style="background:' + o.cor + '"></i>' + o.label + ' · ' + o.v + ' (' + Math.round(o.v / tot * 100) + '%)</span>'; }).join('') + '</div></div>';
    }
    // 5. produtividade (barras empilhadas)
    el = $('#gProd');
    if (el) {
      var tecs = D.EQUIPE.filter(function (e) { return e.papel === 'Técnico'; });
      var Wp = el.clientWidth || 320, lwp = Wp < 440 ? 96 : 118, rhp = 44, bwp = Wp - lwp - 6;
      var dd = tecs.map(function (t2) {
        return { n: t2.nome, c: D.HISTORICO.concluidosMes[t2.id] + vs.filter(function (p) { return p.resp === t2.id && p.conc; }).length, a: vs.filter(function (p) { return p.resp === t2.id && aberto(p); }).length };
      });
      var mp = Math.max.apply(null, dd.map(function (x) { return x.c + x.a; }));
      var sp = svgBase(Wp, dd.length * rhp + 4, el.dataset.label);
      dd.forEach(function (x, k) {
        var y = k * rhp + 4, wc = x.c / mp * bwp, wa = x.a / mp * bwp;
        sp += '<text x="0" y="' + (y + rhp / 2) + '" dominant-baseline="middle">' + esc(primeiro(x.n)) + '</text>' +
          '<g class="barra-g" data-t="' + esc(x.n) + ' · concluídos" data-v="' + x.c + ' em 30 dias" tabindex="0" role="img" aria-label="' + esc(x.n) + ': ' + x.c + ' concluídos em 30 dias"><rect x="' + lwp + '" y="' + (y + 8) + '" width="' + wc + '" height="' + (rhp - 16) + '" rx="6" fill="#1e3a8a"/><text x="' + (lwp + wc / 2) + '" y="' + (y + rhp / 2) + '" dominant-baseline="middle" text-anchor="middle" style="fill:#fff;font-weight:700">' + x.c + '</text></g>' +
          '<g class="barra-g" data-t="' + esc(x.n) + ' · em aberto" data-v="' + x.a + ' pedidos agora" tabindex="0" role="img" aria-label="' + esc(x.n) + ': ' + x.a + ' em aberto"><rect x="' + (lwp + wc + 2) + '" y="' + (y + 8) + '" width="' + Math.max(wa - 2, 8) + '" height="' + (rhp - 16) + '" rx="6" fill="#93c5fd"/><text x="' + (lwp + wc + 2 + Math.max(wa - 2, 8) / 2) + '" y="' + (y + rhp / 2) + '" dominant-baseline="middle" text-anchor="middle" style="fill:#0f2347;font-weight:700">' + x.a + '</text></g>';
      });
      el.innerHTML = sp + '</svg>';
    }
  }
  /* tooltip dos gráficos */
  var tip = null;
  function mostrarTip(el, x, y) {
    tip = tip || $('#tip');
    tip.innerHTML = '<b></b><span></span>';
    $('b', tip).textContent = el.getAttribute('data-t');
    $('span', tip).textContent = el.getAttribute('data-v');
    tip.hidden = false;
    var w = tip.offsetWidth, h = tip.offsetHeight;
    tip.style.left = Math.max(8, Math.min(x + 14, window.innerWidth - w - 8)) + 'px';
    tip.style.top = Math.max(8, Math.min(y - h - 12, window.innerHeight - h - 8)) + 'px';
    if (y - h - 12 < 8) tip.style.top = (y + 18) + 'px';
  }
  document.addEventListener('mousemove', function (e) {
    var el = e.target.closest && e.target.closest('.chart [data-t]');
    if (el) mostrarTip(el, e.clientX, e.clientY); else if (tip) tip.hidden = true;
  });
  document.addEventListener('focusin', function (e) {
    var el = e.target.closest && e.target.closest('.chart [data-t]');
    if (el) { var r = el.getBoundingClientRect(); mostrarTip(el, r.left + r.width / 2, r.top); }
  });
  document.addEventListener('focusout', function () { if (tip) tip.hidden = true; });

  /* ======================= AUTOMAÇÕES ======================= */
  function renderAutomacoes() {
    var v = $('#view');
    v.className = 'view';
    v.innerHTML = '<div class="auto"><div class="auto-banner">' + ico('info') + '<div><b>Tela ilustrativa, somente leitura.</b> Você pode ligar e desligar as regras para ver como ficaria, mas nada é executado de verdade. Em um projeto real, cada regra é combinada com a sua equipe e conectada ao WhatsApp e ao quadro.</div></div>' +
      '<div id="regras"></div>' +
      '<div class="card log"><h2>Registro de avisos</h2><ul id="avisos"></ul></div></div>';
    renderRegras();
  }
  function renderRegras() {
    var el = $('#regras');
    if (!el) return;
    el.innerHTML = D.AUTOMACOES.map(function (a) {
      return '<div class="card regra' + (a.on ? '' : ' off') + '"><span class="r-ic">' + ico(a.icone, 'lg') + '</span><div class="r-c">' +
        '<div class="r-t"><span>' + esc(a.quando) + '</span>' + ico('arrow') + '<span>' + esc(a.entao) + '</span></div>' +
        '<div class="r-d">' + esc(a.det) + '</div>' +
        '<div class="r-n">' + (a.on ? 'Disparou ' + a.n + ' vezes em outubro (exemplo)' : 'Desligada · não dispara') + '</div></div>' +
        '<div class="sw-l"><button type="button" class="sw" role="switch" data-act="auto-toggle" data-id="' + a.id + '" aria-checked="' + a.on + '" aria-label="Regra: ' + esc(a.quando + ' → ' + a.entao) + '"></button>' + (a.on ? 'Ligada' : 'Desligada') + '</div></div>';
    }).join('');
    var lg = $('#avisos');
    lg.innerHTML = S.avisos.length ? S.avisos.map(function (x) { return '<li><span class="q">' + x.q + '</span><span>' + esc(x.t) + '</span></li>'; }).join('') :
      '<li class="muted">Nenhum aviso ainda. Ligue ou desligue uma regra para ver o registro.</li>';
  }

  /* ======================= MENU MOBILE ======================= */
  function abrirMenu() { $('#side').classList.add('aberto'); $('#scrimMenu').hidden = false; $('#menuBtn').setAttribute('aria-expanded', 'true'); setTimeout(function () { var a = $('#nav a'); if (a) a.focus(); }, 60); }
  function fecharMenu() { $('#side').classList.remove('aberto'); $('#scrimMenu').hidden = true; $('#menuBtn').setAttribute('aria-expanded', 'false'); }

  /* ======================= EVENTOS ======================= */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-act]');
    if (!t) {
      var card = e.target.closest('.pcard');
      if (card && !e.target.closest('button')) abrirGaveta(card.dataset.id);
      if (e.target.id === 'modal') fecharModal();
      return;
    }
    var a = t.dataset.act, id = t.dataset.id, p;
    switch (a) {
      case 'novo': abrirNovo(); break;
      case 'abrir': abrirGaveta(id); break;
      case 'avancar': avancar(id); break;
      case 'fechar-gaveta': fecharGaveta(); break;
      case 'fechar-modal': fecharModal(); break;
      case 'toggle-atr': S.soAtr = !S.soAtr; t.setAttribute('aria-pressed', S.soAtr); renderBoard(); break;
      case 'limpar-filtros': S.q = ''; S.fResp = ''; S.soAtr = false; renderQuadro(); break;
      case 'tab': S.tab = t.dataset.tab; $$('.tab').forEach(function (x) { x.setAttribute('aria-selected', x.dataset.tab === S.tab); x.tabIndex = x.dataset.tab === S.tab ? 0 : -1; }); renderCorpo(); break;
      case 'zap': abrirZap(id); break;
      case 'zap-restaurar': var pz = ped(id); $('#zapTxt').value = modeloZap(pz); atualizarPrevia(); break;
      case 'zap-enviar': enviarZap(id); break;
      case 'orc-add': p = ped(S.drawerId); p.itens.push({ d: '', q: 1, v: 0 }); renderCorpo(); renderCabTabs(); var ins = $$('.orc-linha .d'); if (ins.length) ins[ins.length - 1].focus(); break;
      case 'orc-rm': p = ped(S.drawerId); p.itens.splice(+t.dataset.i, 1); if (!p.itens.length) p.orcSt = 'sem'; renderCorpo(); break;
      case 'orc-st':
        p = ped(S.drawerId);
        if (t.dataset.v === 'aprovado' && !podeAprovar()) return;
        if (p.orcSt === t.dataset.v) return;
        p.orcSt = t.dataset.v;
        addEv(p, 'orcamento', p.orcSt === 'aprovado' ? 'Orçamento de ' + brl(total(p)) + ' marcado como aprovado por ' + usuario().nome + '.' : 'Orçamento de ' + brl(total(p)) + ' voltou para pendente.');
        toast(p.orcSt === 'aprovado' ? 'Orçamento aprovado e registrado.' : 'Orçamento marcado como pendente.');
        renderGaveta(true); refresh(); break;
      case 'orc-salvar':
        p = ped(S.drawerId);
        $$('.orc-linha .d').forEach(function (inp, i) { if (!inp.value.trim()) p.itens[i].d = 'Item ' + (i + 1); });
        if (p.orcSt === 'sem') p.orcSt = 'pendente';
        addEv(p, 'orcamento', 'Orçamento registrado por ' + usuario().nome + ': ' + brl(total(p)) + ' em ' + p.itens.length + (p.itens.length === 1 ? ' item' : ' itens') + '. ' + (p.orcSt === 'aprovado' ? 'Já aprovado.' : 'Aguardando aprovação do cliente.'));
        toast('Orçamento de ' + brl(total(p)) + ' registrado na linha do tempo.');
        renderGaveta(true); refresh(); break;
      case 'anexo-add':
        p = ped(S.drawerId);
        var nome = D.ANEXOS_EXEMPLO[S.anexoSeq++ % D.ANEXOS_EXEMPLO.length];
        if (p.anexos.indexOf(nome) > -1) nome = nome.replace(/(\.\w+)$/, '-' + (S.anexoSeq) + '$1');
        p.anexos.push(nome); addEv(p, 'anexo', 'Anexo simulado adicionado: ' + nome + '.');
        renderGaveta(true); toast('Anexo simulado adicionado. Nenhum arquivo foi enviado.'); break;
      case 'anexo-rm': p = ped(S.drawerId); var rem = p.anexos.splice(+t.dataset.i, 1)[0]; addEv(p, 'anexo', 'Anexo removido: ' + rem + '.'); renderGaveta(true); break;
      case 'conv-sel': selecionarConv(id); break;
      case 'conv-voltar': S.convView = $('#convGrid').dataset.v === 'painel' ? 'chat' : 'lista'; $('#convGrid').dataset.v = S.convView; break;
      case 'conv-info': S.convView = 'painel'; $('#convGrid').dataset.v = 'painel'; break;
      case 'conv-criar': criarDeConversa(); break;
      case 'conv-filtro': S.convFiltro = t.dataset.f; renderConvLista(); break;
      case 'resp-rapida': var tx = $('#msgTxt'), cl2 = cli(conv(S.convSel).cli), r = D.RESPOSTAS[+t.dataset.i].t;
        tx.value = (tx.value ? tx.value.trim() + ' ' : '') + r; tx.focus(); break;
      case 'assist-toggle': S.assistRec = !S.assistRec; var tmp = document.createElement('div'); tmp.innerHTML = htmlAssistente(); $('.assist').replaceWith(tmp.firstChild); $('.assist-x').focus(); break;
      case 'auto-toggle':
        var au = D.AUTOMACOES.filter(function (x) { return x.id === id; })[0];
        au.on = !au.on;
        if (au.on && !au.n) au.n = 0;
        S.avisos.unshift({ q: agora(), t: 'Demonstração: a regra "' + au.quando + ' → ' + au.entao + '" foi ' + (au.on ? 'ligada' : 'desligada') + ' apenas nesta tela. Nada foi alterado de verdade.' });
        renderRegras();
        var novo = $('[data-act="auto-toggle"][data-id="' + id + '"]'); if (novo) novo.focus();
        toast('Demonstração: regra ' + (au.on ? 'ligada' : 'desligada') + ' somente na tela.');
        break;
    }
  });
  function renderCabTabs() { /* contadores das abas */
    var p = ped(S.drawerId); if (!p) return;
    var n = p.check.filter(function (x) { return x.ok; }).length;
    var tc = $('#tab-check .tn'); if (tc) tc.textContent = n + '/' + p.check.length;
    var ta = $('#tab-anex .tn'); if (ta) ta.textContent = p.anexos.length;
    var tt = $('#tab-tempo .tn'); if (tt) tt.textContent = p.ev.length;
  }
  function atualizarPrevia() {
    var pv = $('#zapPrev'), tx = $('#zapTxt');
    if (!pv) return;
    pv.innerHTML = esc(tx.value) + '<span class="h">' + agoraSemAvancar() + ' ' + ico('check2', 'sm') + '</span>';
    tx.removeAttribute('aria-invalid'); $('#zapErr').hidden = true;
  }

  document.addEventListener('input', function (e) {
    var t = e.target;
    if (t.id === 'busca') { S.q = t.value; renderBoard(); }
    else if (t.id === 'convBusca') { S.convQ = t.value; renderConvLista(); }
    else if (t.id === 'zapTxt') atualizarPrevia();
    else if (t.id === 'fTel') t.value = fmtTel(t.value);
    else if (t.id === 'msgTxt') { t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 110) + 'px'; }
    else if (t.closest && t.closest('.orc-linha')) {
      var row = t.closest('.orc-linha'), p = ped(S.drawerId), it = p.itens[+row.dataset.i];
      if (t.classList.contains('d')) it.d = t.value;
      else if (t.classList.contains('q')) it.q = parseInt(digitos(t.value), 10) || 0;
      else if (t.classList.contains('v')) it.v = parseValor(t.value);
      var tt = $('#orcTotal'); if (tt) tt.textContent = brl(total(p));
    }
  });
  document.addEventListener('focusout', function (e) {
    var t = e.target;
    if (t.closest && t.closest('.orc-linha')) {
      var row = t.closest('.orc-linha'), p = ped(S.drawerId); if (!p) return;
      var it = p.itens[+row.dataset.i]; if (!it) return;
      if (t.classList.contains('v')) t.value = it.v ? n2(it.v) : '';
      if (t.classList.contains('q')) { if (it.q < 1) it.q = 1; t.value = it.q; var tt = $('#orcTotal'); if (tt) tt.textContent = brl(total(p)); }
    }
  });
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (t.id === 'fResp') { S.fResp = t.value; renderBoard(); }
    else if (t.id === 'perfil') trocarPerfil(t.value);
    else if (t.id === 'selEtapa') { if (!mover(S.drawerId, t.value)) renderGaveta(true); }
    else if (t.id === 'selResp') {
      var p = ped(S.drawerId), antigo = resp(p.resp);
      p.resp = t.value; addEv(p, 'etapa', 'Responsável alterado de ' + antigo.nome + ' para ' + resp(p.resp).nome + ' por ' + usuario().nome + '.');
      refresh(); toast('Responsável atualizado para ' + resp(p.resp).nome + '.');
    } else if (t.type === 'checkbox' && t.closest('.ck')) {
      var pp = ped(S.drawerId), i = +t.dataset.i; pp.check[i].ok = t.checked;
      if (t.checked && pp.check.every(function (x) { return x.ok; })) addEv(pp, 'checklist', 'Checklist concluído por ' + usuario().nome + '.');
      renderCorpo(); renderCabTabs(); var cb = $$('.ck input')[i]; if (cb) cb.focus();
    }
  });
  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (f.id === 'formNovo') return criarPedido(e);
    e.preventDefault();
    var p = ped(S.drawerId);
    if (f.dataset.form === 'nota') {
      var v = f.elements.n.value.trim(); if (!v) { f.elements.n.focus(); return; }
      addEv(p, 'nota', usuario().nome + ': ' + v); renderGaveta(true); var ni = $('.nota-form input'); if (ni) ni.focus();
    } else if (f.dataset.form === 'check') {
      var tx = f.elements.t.value.trim(); if (!tx) { f.elements.t.focus(); return; }
      p.check.push({ t: tx, ok: false }); renderCorpo(); renderCabTabs(); var ci = $('.add-linha input'); if (ci) ci.focus();
    } else if (f.dataset.form === 'msg') {
      var ta = $('#msgTxt'), m = ta.value.trim(); if (!m) { ta.focus(); return; }
      ta.value = ''; ta.style.height = 'auto'; enviarMsg(m); ta.focus();
    }
  });
  document.addEventListener('keydown', function (e) {
    var modal = $('#modal'), dr = $('#drawer');
    if (e.key === 'Escape') {
      if (!modal.hidden) fecharModal();
      else if (S.drawerId) fecharGaveta();
      else if ($('#side').classList.contains('aberto')) fecharMenu();
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey && e.target.id === 'msgTxt') { e.preventDefault(); $('form[data-form="msg"]').requestSubmit(); return; }
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      var tab = e.target.closest && e.target.closest('.tab');
      if (tab) {
        var tabs = $$('.tab'), i = tabs.indexOf(tab), n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
        n.click(); n.focus(); e.preventDefault();
      }
    }
    if (e.key === 'Tab') {
      var root = !modal.hidden ? $('#modalBox') : (S.drawerId ? dr : null);
      if (!root) return;
      var fs = $$('a[href],button:not([disabled]),input:not([disabled]):not([type=hidden]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])', root).filter(function (x) { return x.getClientRects().length; });
      if (!fs.length) return;
      var first = fs[0], last = fs[fs.length - 1];
      if (!root.contains(document.activeElement)) { first.focus(); e.preventDefault(); }
      else if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
      else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
    }
  });

  function trocarPerfil(p) {
    S.perfil = p;
    if (p === 'tecnico') S.fResp = '';
    if (S.drawerId) { var x = ped(S.drawerId); if (p === 'tecnico' && x.resp !== usuario().id) { fecharGaveta(); } }
    fecharModal();
    irParaRota();
    if (S.drawerId) renderGaveta(true);
    var msg = 'Agora você vê como ' + D.PERFIS[p].nome + ' (' + usuario().nome + ').';
    announce(msg);
    if (!S.redir) toast(msg);
  }

  $('#menuBtn').addEventListener('click', abrirMenu);
  $('#menuFechar').addEventListener('click', fecharMenu);
  $('#scrimMenu').addEventListener('click', fecharMenu);
  $('#scrimDrawer').addEventListener('click', fecharGaveta);
  window.addEventListener('hashchange', irParaRota);
  var tr; window.addEventListener('resize', function () { clearTimeout(tr); tr = setTimeout(function () { if (S.rota === 'indicadores') drawCharts(); }, 120); });

  // inicialização
  (function () {
    var m = /[?&]perfil=(atendente|tecnico|gestor)/.exec(location.search);
    if (m) S.perfil = m[1];
    irParaRota();
  })();
})();
