// Gestão Comercial · protótipo navegável (Soluções Digitais Express). Tudo roda no navegador; nada é enviado a servidor.
(function () {
  'use strict';
  const D = window.NC;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const view = $('#view');

  // ---------- formatação pt-BR ----------
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const brl = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const brl0 = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  const n = v => Math.round(v).toLocaleString('pt-BR');
  const pc = v => Math.round(v) + '%';
  const dec = v => v.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const dd = d => String(d).padStart(2, '0') + '/11';
  const DS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  const dow = d => DS[(d - 1) % 7];
  const sum = (a, f) => a.reduce((t, x) => t + (f ? f(x) : x), 0);
  const norm = t => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const prim = nome => nome.split(' ')[0];

  // ---------- ícones ----------
  const P = {
    visao: '<rect x="3" y="3" width="7" height="9" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="14" y="12" width="7" height="9" rx="2"/><rect x="3" y="16" width="7" height="5" rx="2"/>',
    funil: '<path d="M3 4h18l-7 8.5V19l-4 2v-8.5z"/>',
    equipes: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17.5" cy="9" r="2.5"/><path d="M17 14.2c2.4.2 4.2 2.2 4.2 4.8"/>',
    vendas: '<path d="M6 3h12l2 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z"/><path d="M4 8h16M9 12a3 3 0 0 0 6 0"/>',
    metas: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
    importar: '<path d="M12 15V4M7.5 8.5L12 4l4.5 4.5"/><path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>',
    busca: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>', baixar: '<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5"/><path d="M4 18v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1"/>',
    esq: '<path d="M15 5l-7 7 7 7"/>', dir: '<path d="M9 5l7 7-7 7"/>',
    alerta: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.5"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', arq: '<path d="M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v5h5M9 14h6M9 17h6"/>',
    cart: '<path d="M3 4h2l2.2 11h10.6L20 7H6.2"/><circle cx="9" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/>',
    tag: '<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z"/><circle cx="8" cy="8" r="1.4"/>', cancel: '<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>',
    lupa: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5M8.5 11h5"/>',
    chat: '<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9a1.5 1.5 0 0 1-1.5 1.5H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
    sino: '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
    clip: '<path d="M20 11.5l-8.2 8.2a5 5 0 0 1-7.1-7.1l8.6-8.6a3.4 3.4 0 0 1 4.8 4.8l-8.4 8.4a1.8 1.8 0 0 1-2.6-2.6l7.6-7.6"/>',
    env: '<path d="M4 12l16-8-5.5 16-3-6.5z"/><path d="M11.5 13.5L20 4"/>',
  };
  const ic = (k, c = '') => `<svg class="ic ${c}" viewBox="0 0 24 24" aria-hidden="true">${P[k]}</svg>`;
  $('#menuBtn').innerHTML = ic('menu');

  // ---------- avatares ----------
  const PAL = ['#1e3a8a', '#1d4ed8', '#2563eb', '#0f4c81', '#3730a3', '#0e5a8a', '#1e40af'];
  const hash = t => [...t].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  const ini = nome => nome.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase();
  const av = (nome, s = 34) => `<span class="av" style="--s:${s}px;background:${PAL[hash(nome) % PAL.length]};font-size:${Math.round(s * .36)}px" aria-hidden="true">${esc(ini(nome))}</span>`;

  // ---------- dados e perfis ----------
  const vend = id => D.vendedores.find(v => v.id === id);
  const equipe = id => D.equipes.find(e => e.id === id);
  const ME = D.vendedores.find(v => v.nome === 'Davi Prado');
  const TODAS = ['visao', 'funil', 'equipes', 'vendas', 'metas', 'importar', 'chat'];
  // lado: em que ponta do chat da venda a pessoa escreve (backoffice ou vendedor)
  const PERFIS = {
    dir: { nome: 'Diretoria Norte', ini: 'DN', rotas: TODAS, aviso: '', lado: 'bo' },
    bo: { nome: 'Sofia Lemos', ini: 'SL', rotas: ['visao', 'vendas', 'importar', 'chat'], aviso: '', lado: 'bo' },
    lider: { nome: 'Marina Tavares', ini: 'MT', eq: 'aurora', rotas: ['visao', 'funil', 'equipes', 'vendas', 'metas', 'importar', 'chat'], aviso: 'Visão do líder: você enxerga apenas a Equipe Aurora.', lado: 'bo' },
    vend: { nome: 'Davi Prado', ini: 'DP', rotas: ['visao', 'funil', 'vendas', 'metas', 'chat'], aviso: 'Visão do vendedor: você enxerga apenas o seu próprio desempenho, sem dados de colegas.', lado: 'vend' },
  };
  const ROTAS = {
    visao: { nome: 'Painel', ic: 'visao' }, funil: { nome: 'Funil', ic: 'funil' }, equipes: { nome: 'Equipes e vendedores', ic: 'equipes' },
    vendas: { nome: 'Vendas', ic: 'vendas' }, metas: { nome: 'Metas e comissões', ic: 'metas' }, importar: { nome: 'Importar planilha', ic: 'importar' },
    chat: { nome: 'Chat Express', ic: 'chat' },
  };
  // menu agrupado por área de trabalho
  const GRUPOS = [['Visão geral', ['visao']], ['Comercial', ['vendas', 'funil', 'importar']], ['Atendimento', ['chat']], ['Gestão', ['equipes', 'metas']]];
  let perfil = 'dir', rota = 'visao';
  const amplo = () => perfil === 'dir' || perfil === 'bo';
  const vsEsc = eq => perfil === 'vend' ? [ME] : perfil === 'lider' ? D.vendedores.filter(v => v.equipe === 'aurora') : (eq ? D.vendedores.filter(v => v.equipe === eq) : D.vendedores);
  const subtitulo = r => {
    const base = perfil === 'bo' ? 'Toda a operação · visão do backoffice (Sofia Lemos)' : amplo() ? 'Toda a operação · Norte Conecta' : perfil === 'lider' ? 'Equipe Aurora · líder Marina Tavares' : 'Seu desempenho · Davi Prado';
    return ({ visao: base, funil: 'Oportunidades em andamento · ' + (amplo() ? 'todas as equipes' : perfil === 'lider' ? 'Equipe Aurora' : 'suas oportunidades'), equipes: 'Quem vende, quanto e em que ritmo', vendas: 'Vendas de novembro (01 a 18/11)', metas: 'Metas do mês e estimativa de comissão', importar: 'Entrada de vendas por planilha (demonstração)', chat: 'Central de atendimento · WhatsApp e chat do site em um só lugar' })[r];
  };

  // ---------- cálculos ----------
  const HOJE = D.hoje, NDIAS = D.dias;
  const PA = sum(D.peso.slice(1, HOJE + 1)), PR = sum(D.peso.slice(HOJE + 1)), RITMO = PA / (PA + PR) * 100;
  const cumPeso = [0]; for (let d = 1; d <= NDIAS; d++) cumPeso[d] = cumPeso[d - 1] + D.peso[d];
  const DUTEIS = (() => { let c = 0; for (let d = HOJE + 1; d <= NDIAS; d++) { const w = (d - 1) % 7; if (w >= 1 && w <= 5) c++; } return c; })();
  function resumo(vs) {
    const ids = new Set(vs.map(v => v.id));
    const todas = D.vendas.filter(x => ids.has(x.vend)), liq = todas.filter(x => x.status !== 'Cancelada');
    const dia = [], val = [], can = [], tkt = [];
    for (let d = 0; d <= HOJE; d++) { dia[d] = 0; val[d] = 0; can[d] = 0; }
    liq.forEach(x => { dia[x.d]++; val[x.d] += x.valor; });
    todas.forEach(x => { if (x.status === 'Cancelada') can[x.d]++; });
    let cv = 0, cn = 0; for (let d = 1; d <= HOJE; d++) { cv += val[d]; cn += dia[d]; tkt[d] = cn ? cv / cn : 0; }
    const vendas = liq.length, valor = sum(liq, x => x.valor), meta = sum(vs, v => v.meta), canc = todas.length - liq.length;
    const prev = { vendas: sum(vs, v => v.prev), valor: sum(vs, v => v.prevValor), canc: sum(vs, v => v.prevCanc) };
    prev.ticket = prev.vendas ? prev.valor / prev.vendas : 0;
    const proj = vendas * (1 + PR / PA);
    return { vs, liq, todas, dia, val, can, tkt, vendas, valor, ticket: vendas ? valor / vendas : 0, canc, cancPct: todas.length ? canc / todas.length * 100 : 0, meta, ating: meta ? vendas / meta * 100 : 0, proj, projPct: meta ? proj / meta * 100 : 0, prev };
  }
  const cacheV = {}; const sv = id => cacheV[id] || (cacheV[id] = resumo([vend(id)]));
  const situacao = r => r.projPct >= 100 ? ['ok', 'No ritmo'] : r.projPct >= 85 ? ['at', 'Atenção'] : ['cr', 'Abaixo do ritmo'];
  const clsBar = p => p >= 100 ? 'ok' : p >= RITMO - 12 ? '' : p >= RITMO - 28 ? 'alerta' : 'cr';

  // comissão fictícia (estimativa)
  const FAIXAS = [{ min: 0, max: 70, tx: .30, nome: 'Abaixo de 70% da meta' }, { min: 70, max: 100, tx: .40, nome: '70% a 99%' }, { min: 100, max: 120, tx: .50, nome: '100% a 119%' }, { min: 120, max: Infinity, tx: .60, nome: '120% ou mais' }];
  const BONUS_META = 300, BONUS_EQ = 150;
  function comissao(s) {
    const at = s.meta > 0 ? s.vendas / s.meta * 100 : 0, fi = FAIXAS.findIndex(f => at >= f.min && at < f.max), f = FAIXAS[fi];
    const bruta = s.vendas * s.ticket * f.tx, estorno = s.canc * s.ticket * f.tx, bm = at >= 100 ? BONUS_META : 0, be = s.eq ? BONUS_EQ : 0;
    return { at, f, fi, bruta, estorno, bm, be, total: Math.max(0, bruta - estorno + bm + be) };
  }

  // ---------- peças de interface ----------
  const delta = (cur, prev, inv) => {
    if (!prev) return '';
    const p = (cur - prev) / prev * 100, up = p >= 0, neu = Math.abs(p) < .5, bom = up !== !!inv;
    return `<span class="delta ${neu ? 'neutro' : bom ? 'bom' : 'ruim'}"><span aria-hidden="true">${up ? '▲' : '▼'}</span><span class="sr">${up ? 'Alta de' : 'Queda de'}</span> ${dec(Math.abs(p))}%</span>`;
  };
  let sid = 0;
  function spark(arr, cor) {
    const a = arr.slice(1), w = 240, h = 44, p = 0, mx = Math.max(...a), mn = Math.min(...a), rg = mx - mn || 1;
    const sm = a.map((_, i) => { const s = a.slice(Math.max(0, i - 2), i + 1); return sum(s) / s.length; });
    const pts = sm.map((v, i) => [p + i * (w - 2 * p) / (sm.length - 1), h - p - (v - Math.min(...sm)) / ((Math.max(...sm) - Math.min(...sm)) || 1) * (h - 2 * p - 4)]);
    const l = pts.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(' '), id = 'sg' + (++sid), ult = pts[pts.length - 1];
    return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${cor}" stop-opacity=".28"/><stop offset="1" stop-color="${cor}" stop-opacity="0"/></linearGradient></defs><path d="${l} L${ult[0]} ${h} L${p} ${h}Z" fill="url(#${id})"/><path d="${l}" fill="none" stroke="${cor}" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }
  const bar = (p, extra = '', tick) => `<div class="bar-wrap ${extra}"><div class="bar ${clsBar(p)}" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.min(100, Math.round(p))}"><i style="--w:${Math.min(100, p)}%"></i></div>${tick != null ? `<span class="tick" style="--t:${tick}%" title="Ritmo esperado para hoje"></span>` : ''}</div>`;
  const stPill = s => `<span class="pill ${({ Instalada: 'ok', Agendada: 'info', Pendente: 'at', Cancelada: 'cr' })[s] || ''}">${esc(s)}</span>`;
  const vazio = (t, p, btn) => `<div class="vazio"><span class="ic-b">${ic('lupa')}</span><h3>${esc(t)}</h3><p>${esc(p)}</p>${btn || ''}</div>`;
  const skeleton = () => `<div class="grid g4">${'<div class="card sk" style="height:150px"></div>'.repeat(4)}</div><div class="grid g-chart"><div class="card sk" style="height:360px"></div><div class="card sk" style="height:360px"></div></div><div class="card sk" style="height:220px"></div>`;
  const avisoPerfil = () => PERFIS[perfil].aviso ? `<div class="aviso info">${ic('info', 'sm')}<span>${esc(PERFIS[perfil].aviso)} Troque em <b>Ver como</b> (no topo) para comparar os perfis.</span></div>` : '';

  // ---------- toast, gaveta e modal ----------
  let tt; const toast = msg => { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(tt); tt = setTimeout(() => t.hidden = true, 3000); };
  let camada = null, ultimoFoco = null;
  const FOC = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';
  function abre(el, html) {
    fecha(true); ultimoFoco = document.activeElement; camada = el;
    $('#' + el.id + 'Body').innerHTML = html; el.hidden = false; document.body.style.overflow = 'hidden';
    const f = $$(FOC, el); (f.find(x => x.classList.contains('x')) || f[0] || el).focus({ preventScroll: true });
  }
  function fecha(silencioso) {
    if (!camada) return; camada.hidden = true; camada = null; document.body.style.overflow = '';
    if (!silencioso && ultimoFoco && document.contains(ultimoFoco)) ultimoFoco.focus({ preventScroll: true });
  }
  [$('#drawer'), $('#modal')].forEach(el => el.addEventListener('click', e => { if (e.target.closest('[data-close]')) fecha(); }));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { if (camada) fecha(); else if ($('#side').classList.contains('open')) menu(false); }
    if (e.key === 'Tab' && camada) {
      const f = $$(FOC, camada).filter(x => x.offsetParent !== null); if (!f.length) return;
      const a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    }
  });

  // ---------- menu e perfil ----------
  function menu(abrir) {
    const s = $('#side'); s.classList.toggle('open', abrir); $('#scrim').hidden = !abrir;
    $('#menuBtn').setAttribute('aria-expanded', abrir); $('#menuBtn').setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
    $('#menuBtn').innerHTML = ic(abrir ? 'x' : 'menu');
    if (abrir) $('.nav-it', s).focus(); else if (document.activeElement && s.contains(document.activeElement)) $('#menuBtn').focus();
  }
  $('#menuBtn').addEventListener('click', () => menu(!$('#side').classList.contains('open')));
  $('#scrim').addEventListener('click', () => menu(false));
  window.addEventListener('resize', () => { setSim(); if (innerWidth >= 1100 && $('#side').classList.contains('open')) menu(false); });
  function setSim() { document.documentElement.style.setProperty('--simh', $('#simBar').offsetHeight + 'px'); }
  const contador = r => r === 'vendas' ? naoLidas().length : r === 'chat' && window.ChatExpress ? ChatExpress.fila(perfil, PERFIS[perfil].nome) : 0;
  function navegacao() {
    const rs = PERFIS[perfil].rotas;
    $('#nav').innerHTML = GRUPOS.map(([g, l]) => {
      const it = l.filter(r => rs.includes(r)); if (!it.length) return '';
      return `<div class="nav-g"><span class="nav-gt">${g}</span>${it.map(r => { const q = contador(r), t = r === 'vendas' ? 'mensagens não lidas' : 'conversas na fila'; return `<a class="nav-it${r === rota ? ' on' : ''}" href="#/${r}"${r === rota ? ' aria-current="page"' : ''}>${ic(ROTAS[r].ic)}<span>${ROTAS[r].nome}</span>${q ? `<span class="nav-n" title="${q} ${t}"><span class="sr">, ${q} ${t}</span><span aria-hidden="true">${q}</span></span>` : ''}</a>`; }).join('')}</div>`;
    }).join('');
  }
  $('#nav').addEventListener('click', () => { if (innerWidth < 1100) menu(false); });
  $('#perfil').addEventListener('change', e => {
    perfil = e.target.value; resetEstados(); fecha(true); avisos(false);
    $('#avatar').textContent = PERFIS[perfil].ini;
    toast('Visão alterada: ' + e.target.selectedOptions[0].textContent);
    if (!PERFIS[perfil].rotas.includes(rota)) location.hash = '#/visao'; else rotear(false);
  });

  // ---------- chat da venda: quem ainda não leu ----------
  const lado = () => PERFIS[perfil].lado;
  const autorEu = () => perfil === 'vend' ? ME.nome : perfil === 'bo' ? D.backoffice : PERFIS[perfil].nome + (perfil === 'lider' ? ' (líder)' : '');
  function naoLidas() {
    const ids = new Set(vsEsc().map(v => v.id));
    return D.vendas.filter(x => ids.has(x.vend) && D.vendaChats[x.id] && !D.vendaChats[x.id].lido[lado()]);
  }

  // ---------- sino de avisos ----------
  $('#sino').innerHTML = ic('sino') + '<span class="sino-n" id="sinoN" hidden></span>';
  function listaAvisos() {
    const l = naoLidas().map(x => { const t = D.vendaChats[x.id], m = t.msgs[t.msgs.length - 1]; return { tipo: 'venda', id: x.id, t: `${m.autor === 'Sistema' ? 'Atualização' : 'Mensagem de ' + prim(m.autor)} na venda ${x.id}`, s: `${x.cliente} · ${m.txt}`, h: `${dd(m.d)} ${m.h}` }; });
    if (PERFIS[perfil].rotas.includes('chat') && window.ChatExpress) { const q = ChatExpress.fila(perfil, PERFIS[perfil].nome); if (q) l.push({ tipo: 'chat', t: `${q} ${q === 1 ? 'conversa aguarda' : 'conversas aguardam'} na fila do Chat Express`, s: perfil === 'vend' ? 'Fila do Comercial' : 'WhatsApp e chat do site', h: 'agora' }); }
    if (perfil !== 'vend' && perfil !== 'bo') D.equipes.filter(e => perfil === 'dir' || e.id === 'aurora').forEach(e => { const r = resumo(D.vendedores.filter(v => v.equipe === e.id)); if (r.projPct < 85) l.push({ tipo: 'meta', t: `${e.nome} abaixo do ritmo da meta`, s: `Projeção de ${pc(r.projPct)} no fechamento do mês`, h: 'hoje' }); });
    return l;
  }
  function atualizaSino() {
    const q = listaAvisos().length, b = $('#sinoN');
    b.hidden = !q; b.textContent = q > 9 ? '9+' : q;
    $('#sino').setAttribute('aria-label', q ? `Avisos: ${q} novos` : 'Avisos: nenhum novo');
    if (!$('#avisosPop').hidden) pintaAvisos();
  }
  function pintaAvisos() {
    const l = listaAvisos(), icA = { venda: 'chat', chat: 'chat', meta: 'alerta' };
    $('#avisosPop').innerHTML = `<div class="av-h"><b>Avisos</b>${naoLidas().length ? '<button type="button" class="btn ghost sm" id="avTodos">Marcar mensagens como lidas</button>' : ''}</div>${l.length ? `<ul>${l.map((a, i) => `<li><button type="button" data-av="${i}"><span class="av-ic ${a.tipo}">${ic(icA[a.tipo], 'sm')}</span><span class="av-t"><b>${esc(a.t)}</b><small>${esc(a.s)}</small></span><time>${esc(a.h)}</time></button></li>`).join('')}</ul>` : '<p class="av-vazio">Tudo em dia. Nenhum aviso novo.</p>'}`;
    $$('[data-av]', $('#avisosPop')).forEach(b => b.addEventListener('click', () => {
      const a = l[b.dataset.av]; avisos(false);
      if (a.tipo === 'venda') abreVenda(a.id); else if (a.tipo === 'chat') location.hash = '#/chat'; else location.hash = '#/equipes';
    }));
    const t = $('#avTodos'); if (t) t.addEventListener('click', () => { naoLidas().forEach(x => D.vendaChats[x.id].lido[lado()] = true); atualizaTudo(); toast('Mensagens marcadas como lidas'); if (rota === 'vendas') pintaVn(); });
  }
  function avisos(abrir) {
    const p = $('#avisosPop'); p.hidden = !abrir; $('#sino').setAttribute('aria-expanded', abrir);
    if (abrir) { pintaAvisos(); const f = $('button', p); if (f) f.focus({ preventScroll: true }); }
  }
  $('#sino').addEventListener('click', e => { e.stopPropagation(); avisos($('#avisosPop').hidden); });
  document.addEventListener('click', e => { if (!$('#avisosPop').hidden && !e.target.closest('#avisosPop')) avisos(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#avisosPop').hidden) { avisos(false); $('#sino').focus(); } });
  function atualizaTudo() { navegacao(); atualizaSino(); }

  // ---------- roteamento ----------
  let token = 0, ro = null, timers = [];
  function limpa() { if (ro) { ro.disconnect(); ro = null; } timers.forEach(clearInterval); timers = []; }
  function rotear(foco) {
    const h = (location.hash.replace(/^#\/?/, '') || 'visao');
    rota = ROTAS[h] ? h : 'visao';
    if (!PERFIS[perfil].rotas.includes(rota)) { rota = 'visao'; if (location.hash !== '#/visao') { history.replaceState(null, '', '#/visao'); } }
    limpa(); atualizaTudo(); view.classList.toggle('larga', rota === 'chat');
    $('#pgTitle').textContent = ROTAS[rota].nome; $('#pgSub').textContent = subtitulo(rota);
    document.title = ROTAS[rota].nome + ' · Gestão Comercial · protótipo';
    const t = ++token; view.setAttribute('aria-busy', 'true'); view.innerHTML = skeleton();
    setTimeout(() => { if (t !== token) return; view.removeAttribute('aria-busy'); view.innerHTML = ''; VIEWS[rota](); }, 280);
    if (foco) { window.scrollTo(0, 0); view.focus({ preventScroll: true }); }
  }
  window.addEventListener('hashchange', () => rotear(true));

  // ---------- estados das telas ----------
  let FV, CH, FN, EQ, VN, MT, SM, IM, OPPS;
  function resetEstados() {
    FV = { eq: '' }; CH = { modo: 'dia', metrica: 'vendas' }; FN = { v: '' };
    EQ = { q: '', eq: '', st: '', ord: 'vendas' }; VN = { q: '', eq: '', uf: '', cid: '', st: '', pr: '', cv: '', k: 'id', dir: -1, pg: 1 };
    MT = { eq: '' }; SM = null; IM = { fase: 0, arq: '', filtro: 'todas', ign: true, pct: 0, etapa: 0 };
  }
  OPPS = D.oportunidades.map(o => ({ ...o }));
  resetEstados();

  const VIEWS = { visao, funil, equipes, vendas, metas, importar, chat };

  // =====================================================================
  // CHAT EXPRESS (módulo em chat-express.js)
  // =====================================================================
  function chat() {
    const rs = PERFIS[perfil].rotas;
    ChatExpress.montar({
      view, perfil, eu: { nome: PERFIS[perfil].nome }, ic, esc, av, toast, abre, fecha, modal: $('#modal'),
      intervalo: (fn, ms) => timers.push(setInterval(fn, ms)), atualiza: atualizaTudo,
      abreVenda: rs.includes('vendas') ? abreVenda : null, temFunil: rs.includes('funil'),
      novaOportunidade: rs.includes('funil') ? novaOportunidade : null,
    });
  }
  function novaOportunidade(o) {
    const v = perfil === 'vend' ? ME : perfil === 'lider' ? vsEsc()[0] : ME, prod = D.produtos.find(p => p.nome === o.produto) || D.produtos[1];
    const id = 'O-' + (2100 + OPPS.length);
    OPPS.unshift({ id, cliente: o.cliente, vend: v.id, eq: v.equipe, produto: prod.nome, valor: prod.valor, uf: o.uf || 'DF', cidade: o.cidade || 'Brasília', etapa: 'novo', dias: 0, origem: 'Chat Express', motivo: '' });
    toast(`Oportunidade ${id} criada no Funil para ${prim(v.nome)}`);
    return id;
  }

  // =====================================================================
  // 1. VISÃO GERAL
  // =====================================================================
  // faixa "o que precisa de você agora": mensagens das vendas e fila do Chat Express
  function faixaAtend() {
    const nl = naoLidas().length, cx = window.ChatExpress ? ChatExpress.resumo() : null, fila = window.ChatExpress ? ChatExpress.fila(perfil, PERFIS[perfil].nome) : 0;
    const itens = [`<a class="fx-it" href="#/vendas"><b class="num">${nl}</b><span>${nl === 1 ? 'mensagem não lida' : 'mensagens não lidas'} nas vendas</span></a>`];
    if (cx) itens.push(`<a class="fx-it" href="#/chat"><b class="num">${fila}</b><span>na fila do Chat Express</span></a>`);
    if (cx && perfil !== 'vend') itens.push(`<a class="fx-it" href="#/chat"><b class="num">${cx.atend}</b><span>em atendimento agora</span></a>`, `<a class="fx-it" href="#/chat"><b class="num">${cx.bot}</b><span>com o bot</span></a>`);
    return `<div class="card fx"><span class="fx-ic">${ic('chat')}</span><div class="fx-t"><b>Atendimento agora</b><span>Conversas que podem precisar de você</span></div><div class="fx-l">${itens.join('')}</div><a class="btn sm pri" href="#/chat">Abrir Chat Express</a></div>`;
  }
  function visao() {
    const dir = amplo(), vs = vsEsc(FV.eq), r = resumo(vs);
    const kpi = (k) => `<article class="card kpi"><div class="k-l"><span class="k-ic">${ic(k.ic, 'sm')}</span>${k.l}</div><div class="k-v">${k.v}</div><div class="k-s">${k.s}</div><div class="row">${k.d || ''}</div>${k.sp || ''}</article>`;
    const kpis = [
      { ic: 'cart', l: 'Vendas do mês', v: n(r.vendas), s: `${brl0(r.valor)} em planos mensais`, d: delta(r.vendas, r.prev.vendas) + '<span class="muted" style="font-size:12px">vs. 01 a 18/10</span>', sp: spark(r.dia, '#2563eb') },
      { ic: 'metas', l: 'Meta e atingimento', v: `${pc(r.ating)} <small>da meta</small>`, s: `${n(r.vendas)} de ${n(r.meta)} vendas` + bar(r.ating, '', RITMO), d: `<span class="pill ${situacao(r)[0]}">Projeção ${n(r.proj)} (${pc(r.projPct)})</span>`, sp: spark(r.dia.map((_, i, ar) => ar.slice(0, i + 1).reduce((x, y) => x + y, 0)), '#1e3a8a') },
      { ic: 'tag', l: 'Ticket médio', v: brl(r.ticket), s: 'Mensalidade média por venda', d: delta(r.ticket, r.prev.ticket) + '<span class="muted" style="font-size:12px">vs. mês anterior</span>', sp: spark([0, ...r.tkt.slice(4)], '#1e3a8a') },
      { ic: 'cancel', l: 'Cancelamentos', v: n(r.canc), s: `${dec(r.cancPct)}% das vendas do mês`, d: delta(r.canc, r.prev.canc, true) + '<span class="muted" style="font-size:12px">vs. mês anterior</span>', sp: spark(r.can, '#f59e0b') },
    ];
    const seleciona = dir ? `<div class="card toolbar"><div class="field"><label for="fEq">Equipe</label><select id="fEq"><option value="">Todas as equipes</option>${D.equipes.map(e => `<option value="${e.id}"${FV.eq === e.id ? ' selected' : ''}>${esc(e.nome)}</option>`).join('')}</select></div><p class="muted" style="margin:0;font-size:12.5px;flex:1;min-width:200px">Indicadores de novembro (01 a 18/11) comparados ao mesmo período de outubro. Dados de demonstração.</p></div>` : avisoPerfil();

    // direita: ranking ou posicionamento
    let direita;
    if (perfil === 'vend') {
      const lista = D.vendedores.map(v => ({ v, q: sv(v.id).vendas })).sort((a, b) => b.q - a.q), pos = lista.findIndex(x => x.v.id === ME.id) + 1, prox = lista[pos - 2];
      direita = `<article class="card"><div class="card-h"><div><h2>Seu posicionamento</h2><p>Entre os ${D.vendedores.length} vendedores da operação</p></div></div>
        <div class="destaque"><span class="big">${pos}º</span><span class="pill ${pos <= 5 ? 'ok' : ''}">de ${D.vendedores.length}</span></div>
        <p style="margin:12px 0 14px;color:var(--tinta2)">${prox ? `Faltam <b>${prox.q - r.vendas + 1}</b> vendas para subir uma posição.` : 'Você lidera o ranking do mês.'}</p>
        <div class="mk"><div><span>Suas vendas</span><b>${n(r.vendas)}</b></div><div><span>Ritmo necessário</span><b>${dec(Math.max(0, r.meta - r.vendas) / DUTEIS)}/dia útil</b></div></div></article>`;
    } else {
      const top = vs.map(v => ({ v, s: sv(v.id) })).sort((a, b) => b.s.vendas - a.s.vendas).slice(0, 7), mx = top[0].s.vendas || 1;
      direita = `<article class="card"><div class="card-h"><div><h2>Ranking de vendedores</h2><p>Vendas válidas no mês · toque para ver o detalhe</p></div></div><ol class="rank">${top.map((x, i) => `<li class="cl" tabindex="0" role="button" data-v="${x.v.id}" aria-label="${esc(x.v.nome)}, ${x.s.vendas} vendas. Abrir detalhe"><span class="pos">${i + 1}</span>${av(x.v.nome)}<span style="min-width:0"><span class="nm" style="display:block">${esc(x.v.nome)}</span><span class="sb">${dir ? esc(equipe(x.v.equipe).nome) : esc(x.v.status)}</span><div class="bar"><i style="--w:${x.s.vendas / mx * 100}%"></i></div></span><span class="vl num">${n(x.s.vendas)}<small>${pc(x.s.ating)} da meta</small></span></li>`).join('')}</ol></article>`;
    }

    // metas por equipe / vendedor / pessoal
    let metas;
    if (perfil === 'vend') {
      metas = `<article class="card"><div class="card-h"><div><h2>Sua meta do mês</h2><p>Ritmo esperado para hoje: ${pc(RITMO)}</p></div><span class="pill ${situacao(r)[0]}">${situacao(r)[1]}</span></div>
        <div class="destaque"><span class="big">${pc(r.ating)}</span><span class="muted">${n(r.vendas)} de ${n(r.meta)} vendas</span></div>${bar(r.ating, 'lg', RITMO)}
        <div class="lp-s"><span>Projeção de fechamento: <b class="num">${n(r.proj)} vendas (${pc(r.projPct)})</b></span><span>${DUTEIS} dias úteis restantes</span></div></article>`;
    } else {
      const porEq = dir && !FV.eq;
      const itens = porEq ? D.equipes.map(e => ({ nome: e.nome, sub: 'Líder ' + e.lider, r: resumo(D.vendedores.filter(v => v.equipe === e.id)) })) : vs.map(v => ({ nome: v.nome, sub: v.status, r: sv(v.id) })).sort((a, b) => b.r.ating - a.r.ating);
      metas = `<article class="card"><div class="card-h"><div><h2>${porEq ? 'Meta por equipe' : 'Meta por vendedor'}</h2><p>A marca laranja indica o ritmo esperado para hoje (${pc(RITMO)})</p></div></div><div class="lista-prog">${itens.map(i => `<div><div class="lp-h"><strong>${esc(i.nome)}</strong><span class="num">${pc(i.r.ating)}</span></div>${bar(i.r.ating, 'lg', RITMO)}<div class="lp-s"><span>${n(i.r.vendas)} de ${n(i.r.meta)} vendas · ${esc(i.sub)}</span><span>Projeção <b class="num">${pc(i.r.projPct)}</b></span></div></div>`).join('')}</div></article>`;
    }
    // mix de produtos
    const mix = D.produtos.map(p => ({ p, q: r.liq.filter(x => x.produto === p.nome).length })).sort((a, b) => b.q - a.q), tot = r.vendas || 1;
    const mixH = `<article class="card"><div class="card-h"><div><h2>Vendas por produto</h2><p>Participação nas vendas válidas do mês</p></div></div><div class="mix">${mix.map(m => `<div class="mix-r"><span>${esc(m.p.nome)}</span><div class="bar"><i style="--w:${m.q / (mix[0].q || 1) * 100}%"></i></div><span class="num">${n(m.q)} <span class="muted" style="font-weight:500">(${pc(m.q / tot * 100)})</span></span></div>`).join('')}</div></article>`;

    view.innerHTML = `${seleciona}${faixaAtend()}<div class="grid g4">${kpis.map(kpi).join('')}</div>
      <div class="grid g-chart"><article class="card"><div class="card-h"><div><h2>Vendas no mês, dia a dia</h2><p id="chSub"></p></div><div style="display:flex;gap:10px;flex-wrap:wrap"><div class="tabs" role="group" aria-label="Tipo de gráfico"><button type="button" data-m="dia" aria-pressed="${CH.modo === 'dia'}">Diário</button><button type="button" data-m="acum" aria-pressed="${CH.modo === 'acum'}">Acumulado</button></div><div class="tabs" role="group" aria-label="Métrica"><button type="button" data-t="vendas" aria-pressed="${CH.metrica === 'vendas'}">Vendas</button><button type="button" data-t="valor" aria-pressed="${CH.metrica === 'valor'}">R$ em planos</button></div></div></div>
      <div class="chart-wrap" style="position:relative"><div class="chart-box" id="chBox" tabindex="0" role="group" aria-label="Gráfico de vendas por dia de novembro. Use as setas esquerda e direita para ler cada dia."></div><div class="tip" id="chTip"></div></div>
      <div class="legend" id="chLeg" style="margin-top:10px"></div></article>${direita}</div>
      <div class="grid g2">${metas}${mixH}</div>`;

    const fEq = $('#fEq'); if (fEq) fEq.addEventListener('change', () => { FV.eq = fEq.value; visao(); });
    $$('[data-m]').forEach(b => b.addEventListener('click', () => { CH.modo = b.dataset.m; $$('[data-m]').forEach(x => x.setAttribute('aria-pressed', x === b)); grafico(r, true); }));
    $$('[data-t]').forEach(b => b.addEventListener('click', () => { CH.metrica = b.dataset.t; $$('[data-t]').forEach(x => x.setAttribute('aria-pressed', x === b)); grafico(r, true); }));
    $$('.rank li.cl').forEach(li => { const f = () => abreVendedor(li.dataset.v); li.addEventListener('click', f); li.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); f(); } }); });
    grafico(r, true);
    let w0 = $('#chBox').clientWidth; ro = new ResizeObserver(() => { const w = $('#chBox').clientWidth; if (Math.abs(w - w0) > 2) { w0 = w; grafico(r, false); } }); ro.observe($('#chBox'));
  }

  // gráfico SVG próprio (barras diárias ou linha acumulada com projeção)
  function niceMax(v) { const s = (v || 1) / 4, p = Math.pow(10, Math.floor(Math.log10(s))); return 4 * ([1, 2, 5, 10].find(k => k * p >= s) || 10) * p; }
  function grafico(r, animar) {
    const box = $('#chBox'), tip = $('#chTip'); if (!box) return;
    const W = Math.max(300, Math.floor(box.clientWidth)), mob = W < 520, H = mob ? 240 : 350, m = { l: mob ? 38 : 48, r: 10, t: 14, b: 28 }, iw = W - m.l - m.r, ih = H - m.t - m.b;
    const valor = CH.metrica === 'valor', arr = valor ? r.val : r.dia, metaT = valor ? r.meta * r.ticket : r.meta, acum = CH.modo === 'acum';
    const cum = [0]; for (let d = 1; d <= HOJE; d++) cum[d] = cum[d - 1] + arr[d];
    const proj = []; for (let d = HOJE; d <= NDIAS; d++) proj[d] = cum[HOJE] + cum[HOJE] / PA * (cumPeso[d] - cumPeso[HOJE]);
    const ritmo = d => metaT * cumPeso[d] / cumPeso[NDIAS], mediaDia = metaT / NDIAS;
    const ymax = niceMax(acum ? Math.max(proj[NDIAS], metaT) * 1.04 : Math.max(...arr.slice(1), mediaDia) * 1.12);
    const x = d => m.l + (d - .5) * iw / NDIAS, y = v => m.t + ih - v / ymax * ih, step = iw / NDIAS;
    const fy = v => valor ? (v >= 1000 ? (v / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mil' : n(v)) : n(v);
    const fv = v => valor ? brl0(v) : n(v) + ' vendas';
    let g = `<defs><linearGradient id="gb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4f8ff7"/><stop offset="1" stop-color="#1e40af"/></linearGradient><linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2563eb" stop-opacity=".30"/><stop offset="1" stop-color="#2563eb" stop-opacity="0"/></linearGradient></defs>`;
    for (let i = 0; i <= 4; i++) { const v = ymax / 4 * i, yy = y(v); g += `<line x1="${m.l}" x2="${W - m.r}" y1="${yy}" y2="${yy}" stroke="${i ? '#e3ebf8' : '#c8d7ef'}" stroke-width="1"/><text x="${m.l - 8}" y="${yy + 4}" text-anchor="end">${fy(v)}</text>`; }
    for (let d = 1; d <= NDIAS; d++) if (!mob || d === 1 || d % 5 === 0) g += `<text x="${x(d)}" y="${H - 8}" text-anchor="middle"${d === HOJE ? ' style="fill:#1e3a8a;font-weight:700"' : ''}>${d}</text>`;
    g += '<rect id="hv" x="0" y="' + m.t + '" width="' + step + '" height="' + ih + '" rx="6" fill="#2563eb" opacity="0" />';
    if (!acum) {
      for (let d = 1; d <= NDIAS; d++) {
        if (d <= HOJE) { const h = Math.max(arr[d] ? 2 : 0, arr[d] / ymax * ih), cor = d === HOJE ? '#1e3a8a' : (d - 1) % 7 === 0 ? '#b9d2fa' : 'url(#gb)'; g += `<rect class="${animar ? 'bar-r' : ''}" style="--i:${d}" x="${x(d) - step * .31}" y="${y(0) - h}" width="${step * .62}" height="${h}" rx="${Math.min(4, step * .2)}" fill="${cor}"/>`; }
        else g += `<rect x="${x(d) - step * .31}" y="${y(0) - 3}" width="${step * .62}" height="3" rx="1.5" fill="#d6e2f6"/>`;
      }
      g += `<line x1="${m.l}" x2="${W - m.r}" y1="${y(mediaDia)}" y2="${y(mediaDia)}" stroke="#f59e0b" stroke-width="2" stroke-dasharray="6 5"/>`;
    } else {
      const pts = []; for (let d = 1; d <= HOJE; d++) pts.push([x(d), y(cum[d])]);
      const L = 'M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L'), proje = []; for (let d = HOJE; d <= NDIAS; d++) proje.push([x(d), y(proj[d])]);
      const rit = []; for (let d = 1; d <= NDIAS; d++) rit.push([x(d), y(ritmo(d))]);
      g += `<path class="${animar ? 'area-in' : ''}" d="${L} L${x(HOJE)} ${y(0)} L${x(1)} ${y(0)}Z" fill="url(#ga)"/>`;
      g += `<path d="M${rit.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L')}" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="6 5"/>`;
      g += `<path d="M${proje.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L')}" fill="none" stroke="#5b9cf6" stroke-width="2.5" stroke-dasharray="2 5" stroke-linecap="round"/>`;
      g += `<path id="ln" class="${animar ? 'ln-draw' : ''}" d="${L}" fill="none" stroke="#1e3a8a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
      g += `<circle cx="${x(HOJE)}" cy="${y(cum[HOJE])}" r="5" fill="#fff" stroke="#1e3a8a" stroke-width="3"/><circle cx="${x(NDIAS)}" cy="${y(proj[NDIAS])}" r="4" fill="#fff" stroke="#5b9cf6" stroke-width="2.5"/>`;
    }
    g += `<rect id="ov" x="${m.l}" y="${m.t}" width="${iw}" height="${ih}" fill="transparent" style="cursor:crosshair"/>`;
    box.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true">${g}</svg>`;
    const ln = $('#ln', box); if (ln && animar) ln.style.setProperty('--len', Math.ceil(ln.getTotalLength()));
    $('#chSub').textContent = acum ? `Acumulado até ${dd(HOJE)}, projeção até 30/11 e ritmo necessário para a meta` : `${valor ? 'Valor mensal dos planos vendidos' : 'Vendas válidas'} por dia útil e fim de semana`;
    $('#chLeg').innerHTML = acum ? `<span><i class="ln" style="background:#1e3a8a"></i>Realizado</span><span><i class="ln" style="background:#5b9cf6"></i>Projeção</span><span><i class="dash"></i>Ritmo da meta (${fv(metaT)})</span>` : `<span><i style="background:#2563eb"></i>Dia útil</span><span><i style="background:#b9d2fa"></i>Domingo</span><span><i style="background:#1e3a8a"></i>Hoje (${dd(HOJE)})</span><span><i class="dash"></i>Média diária da meta (${valor ? brl0(mediaDia) : dec(mediaDia)})</span>`;
    const hv = $('#hv', box);
    const mostra = d => {
      d = Math.max(1, Math.min(NDIAS, d)); box._d = d; hv.setAttribute('x', x(d) - step / 2); hv.setAttribute('opacity', '.09');
      const fut = d > HOJE;
      let h = `<b>${dow(d).charAt(0).toUpperCase() + dow(d).slice(1)}, ${dd(d)}${d === HOJE ? ' · hoje' : ''}</b>`;
      if (!acum) h += fut ? '<em>Dia ainda não vendido</em>' : `<span class="num">${fv(arr[d])}</span><br><em>${valor ? n(r.dia[d]) + ' vendas' : brl0(r.val[d]) + ' em planos'}</em>`;
      else h += (fut ? `<span class="num">Projeção ${fv(proj[d])}</span>` : `<span class="num">${fv(cum[d])} acumulados</span>`) + `<br><em>Ritmo da meta: ${fv(ritmo(d))}</em>`;
      tip.innerHTML = h; tip.classList.add('on');
      const yy = acum ? y(fut ? proj[d] : cum[d]) : fut ? y(0) : y(arr[d]);
      tip.style.left = Math.max(80, Math.min(W - 80, x(d))) + 'px'; tip.style.top = (yy - 10 + 0) + 'px';
    };
    const oculta = () => { hv.setAttribute('opacity', '0'); tip.classList.remove('on'); };
    const ov = $('#ov', box);
    const daX = e => { const b = ov.getBoundingClientRect(); return Math.floor((e.clientX - b.left) / (b.width / NDIAS)) + 1; };
    ov.addEventListener('pointermove', e => mostra(daX(e))); ov.addEventListener('pointerdown', e => mostra(daX(e)));
    ov.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') oculta(); });
    box.onkeydown = e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); tip.setAttribute('aria-live', 'polite'); mostra((box._d || HOJE) + (e.key === 'ArrowRight' ? 1 : -1)); } else if (e.key === 'Escape') oculta(); };
    box.onblur = oculta;
  }

  // =====================================================================
  // Gaveta do vendedor
  // =====================================================================
  function abreVendedor(id) {
    const v = vend(id), r = sv(id), e = equipe(v.equipe);
    const porProd = D.produtos.map(p => ({ p, q: r.liq.filter(x => x.produto === p.nome).length })).sort((a, b) => b.q - a.q), mp = porProd[0].q || 1;
    const hist = [...v.hist, r.vendas], mx = Math.max(...hist, v.meta, Math.round(r.proj)) || 1, rotulos = [...D.meses, 'Nov*'];
    const ult = r.liq.slice(-5).reverse(), sit = situacao(r);
    abre($('#drawer'), `<div class="dw-head"><button class="x" type="button" data-close aria-label="Fechar detalhe">${ic('x')}</button><div class="who">${av(v.nome, 56)}<div><h2 id="drawerTitulo">${esc(v.nome)}</h2><div class="sub">${esc(e.nome)} · ${esc(v.cargo)} · <span class="pill ${v.status === 'Ativo' ? 'ok' : 'at'}" style="padding:1px 8px">${esc(v.status)}</span></div></div></div></div>
    <div class="dw-body"><div class="mk"><div><span>Vendas no mês</span><b class="num">${n(r.vendas)}</b></div><div><span>Atingimento da meta</span><b class="num">${pc(r.ating)}</b></div><div><span>Ticket médio</span><b class="num">${brl(r.ticket)}</b></div><div><span>Cancelamentos</span><b class="num">${n(r.canc)}</b></div></div>
    <section><h3>Meta de novembro: ${n(v.meta)} vendas <span class="pill ${sit[0]}" style="margin-left:6px">${sit[1]}</span></h3>${bar(r.ating, 'lg', RITMO)}<div class="lp-s"><span>Projeção: <b class="num">${n(r.proj)} (${pc(r.projPct)})</b></span><span>Faltam ${n(Math.max(0, v.meta - r.vendas))} vendas</span></div></section>
    <section><h3>Vendas por produto</h3><div class="mix">${porProd.map(x => `<div class="mix-r"><span>${esc(x.p.nome)}</span><div class="bar"><i style="--w:${x.q / mp * 100}%"></i></div><span class="num">${n(x.q)}</span></div>`).join('')}</div></section>
    <section><h3>Histórico mensal de vendas</h3><div class="hist" role="img" aria-label="Vendas por mês: ${rotulos.map((l, i) => l + ' ' + hist[i]).join(', ')}">${hist.map((q, i) => `<div class="${i === 4 ? 'hoje' : ''}"><b>${q}</b><i style="--h:${Math.round(q / mx * 78)}px"></i><span>${rotulos[i]}</span></div>`).join('')}</div><p class="muted" style="margin:8px 0 0;font-size:12px">* Novembro parcial, até 18/11. Meta do mês: ${n(v.meta)} vendas.</p></section>
    <section><h3>Últimas vendas</h3><ul class="ult">${ult.length ? ult.map(x => `<li><span>${esc(x.cliente)}<small>${esc(x.produto)} · ${esc(x.cidade)}/${x.uf}</small></span><span style="text-align:right"><b class="num">${brl(x.valor)}</b><small>${dd(x.d)} · ${esc(x.status)}</small></span></li>`).join('') : '<li>Nenhuma venda no período.</li>'}</ul></section>
    <dl class="dl" style="margin:0"><dt>Login</dt><dd>${esc(v.login)}</dd><dt>Admissão</dt><dd>${v.adm.split('-').reverse().join('/')}</dd></dl></div>`);
  }

  // =====================================================================
  // 2. FUNIL
  // =====================================================================
  function oppsEsc() {
    const ids = new Set(vsEsc().map(v => v.id)); let l = OPPS.filter(o => ids.has(o.vend)); if (FN.v) l = l.filter(o => o.vend === FN.v); return l;
  }
  function funil() {
    const vs = vsEsc();
    view.innerHTML = `${amplo() ? '' : avisoPerfil()}<div class="card toolbar">${perfil === 'vend' ? '' : `<div class="field"><label for="fnV">Vendedor</label><select id="fnV"><option value="">Todos${perfil === 'lider' ? ' da equipe' : ''}</option>${vs.map(v => `<option value="${v.id}"${FN.v === v.id ? ' selected' : ''}>${esc(v.nome)}</option>`).join('')}</select></div>`}<div id="fnTot" class="funil-top" style="flex:1;min-width:240px"></div><p class="muted" style="margin:0;font-size:12.5px;max-width:300px">Arraste os cartões entre as etapas ou use as setas. Movimentos são uma demonstração e não alteram os números das outras telas.</p></div><div class="board" id="board" role="list" aria-label="Quadro de oportunidades por etapa"></div>`;
    const sel = $('#fnV'); if (sel) sel.addEventListener('change', () => { FN.v = sel.value; pinta(); });
    pinta();
  }
  function pinta(focoId) {
    const l = oppsEsc(), por = id => l.filter(o => o.etapa === id);
    const aberto = l.filter(o => ['novo', 'contato', 'proposta'].includes(o.etapa)), fech = por('fechado'), perd = por('perdido');
    $('#fnTot').innerHTML = `<div class="kv"><span>Em aberto</span><b>${aberto.length} · ${brl0(sum(aberto, o => o.valor))}</b></div><div class="kv"><span>Fechado</span><b>${fech.length} · ${brl0(sum(fech, o => o.valor))}</b></div><div class="kv"><span>Conversão</span><b>${fech.length + perd.length ? pc(fech.length / (fech.length + perd.length) * 100) : '—'}</b></div>`;
    $('#board').innerHTML = D.etapas.map((e, i) => {
      const c = por(e.id);
      return `<section class="col" role="listitem" data-e="${e.id}" aria-label="${e.nome}: ${c.length} oportunidades"><div class="col-h"><div class="t"><i style="background:${e.cor}"></i>${e.nome}<span class="q">${c.length}</span></div><div class="s">${brl0(sum(c, o => o.valor))} em mensalidades</div></div><div class="col-list">${c.length ? c.map(o => cardOpp(o, i)).join('') : `<div class="col-vazio">Nenhuma oportunidade.<br>Solte um cartão aqui.</div>`}</div></section>`;
    }).join('');
    if (focoId) { const b = $(`[data-mv="${focoId.id}"][data-dir="${focoId.dir}"]`) || $(`[data-open="${focoId.id}"]`); if (b && !b.disabled) b.focus({ preventScroll: true }); else { const o = $(`[data-open="${focoId.id}"]`); if (o) o.focus({ preventScroll: true }); } }
    $$('.opp').forEach(c => {
      c.addEventListener('dragstart', ev => { ev.dataTransfer.setData('text/plain', c.dataset.id); ev.dataTransfer.effectAllowed = 'move'; setTimeout(() => c.classList.add('dragging'), 0); });
      c.addEventListener('dragend', () => { c.classList.remove('dragging'); $$('.col.over').forEach(x => x.classList.remove('over')); });
    });
    $$('.col').forEach(col => {
      col.addEventListener('dragover', ev => { ev.preventDefault(); ev.dataTransfer.dropEffect = 'move'; col.classList.add('over'); });
      col.addEventListener('dragleave', ev => { if (!col.contains(ev.relatedTarget)) col.classList.remove('over'); });
      col.addEventListener('drop', ev => { ev.preventDefault(); col.classList.remove('over'); mover(ev.dataTransfer.getData('text/plain'), col.dataset.e); });
    });
    $$('[data-mv]').forEach(b => b.addEventListener('click', () => { const o = OPPS.find(x => x.id === b.dataset.mv), i = D.etapas.findIndex(e => e.id === o.etapa); mover(o.id, D.etapas[i + Number(b.dataset.dir)].id, { id: o.id, dir: b.dataset.dir }); }));
    $$('[data-open]').forEach(b => b.addEventListener('click', () => abreOpp(b.dataset.open)));
  }
  function cardOpp(o, i) {
    const v = vend(o.vend), ant = D.etapas[i - 1], prox = D.etapas[i + 1];
    return `<article class="opp" draggable="true" data-id="${o.id}"><button class="opp-main" type="button" data-open="${o.id}" aria-label="${esc(o.cliente)}, ${esc(o.produto)}, ${brl(o.valor)} por mês. Abrir detalhes"><div class="c">${esc(o.cliente)}</div><div class="p">${esc(o.produto)}</div><div class="m"><span class="v num">${brl(o.valor)}<span class="muted" style="font-weight:500">/mês</span></span></div><div class="p dim2">${esc(o.cidade)}/${o.uf} · ${o.dias} ${o.dias === 1 ? 'dia' : 'dias'}</div>${o.etapa === 'perdido' ? `<div class="p" style="margin-top:4px">Motivo: ${esc(o.motivo)}</div>` : ''}</button><div class="opp-f"><span class="who">${av(v.nome, 22)}<span title="${esc(v.nome)}">${esc(prim(v.nome))}</span></span><button class="mv" type="button" data-mv="${o.id}" data-dir="-1" aria-label="Mover ${esc(o.cliente)} para ${ant ? ant.nome : ''}" ${ant ? '' : 'disabled'}>${ic('esq', 'sm')}</button><button class="mv" type="button" data-mv="${o.id}" data-dir="1" aria-label="Mover ${esc(o.cliente)} para ${prox ? prox.nome : ''}" ${prox ? '' : 'disabled'}>${ic('dir', 'sm')}</button></div></article>`;
  }
  function mover(id, etapa, foco) {
    const o = OPPS.find(x => x.id === id); if (!o || o.etapa === etapa) return;
    o.etapa = etapa; o.dias = 0; o.motivo = etapa === 'perdido' ? 'Sem retorno do cliente' : '';
    pinta(foco || { id, dir: 1 }); toast(`${o.cliente} movido para ${D.etapas.find(e => e.id === etapa).nome} (demonstração)`);
  }
  function abreOpp(id) {
    const o = OPPS.find(x => x.id === id), v = vend(o.vend), e = D.etapas.find(x => x.id === o.etapa);
    abre($('#modal'), `<button class="x dk" type="button" data-close aria-label="Fechar">${ic('x')}</button><h2 id="modalTitulo" style="font-size:19px;padding-right:44px">${esc(o.cliente)}</h2><p class="muted" style="margin:2px 0 0">${esc(o.id)} · ${esc(o.produto)}</p>
    <dl class="dl"><dt>Mensalidade</dt><dd class="num">${brl(o.valor)}</dd><dt>Etapa</dt><dd>${esc(e.nome)}${o.motivo ? ' · ' + esc(o.motivo) : ''}</dd><dt>Local</dt><dd>${esc(o.cidade)}/${o.uf}</dd><dt>Origem</dt><dd>${esc(o.origem)}</dd><dt>Vendedor</dt><dd>${esc(v.nome)} · ${esc(equipe(v.equipe).nome)}</dd><dt>Na etapa</dt><dd>${o.dias} ${o.dias === 1 ? 'dia' : 'dias'}</dd><dt>Próxima ação</dt><dd>${esc(D.proximas[o.etapa] || '—')}</dd></dl>
    <h3 style="font-size:14px;margin:20px 0 10px">Mover para (demonstração)</h3><div class="mover">${D.etapas.map(x => `<button class="btn sm" type="button" data-to="${x.id}" aria-pressed="${x.id === o.etapa}">${x.nome}</button>`).join('')}</div>`);
    $$('[data-to]', $('#modal')).forEach(b => b.addEventListener('click', () => { fecha(); mover(id, b.dataset.to, { id, dir: 1 }); }));
  }

  // =====================================================================
  // 3. EQUIPES E VENDEDORES
  // =====================================================================
  function equipes() {
    const dir = amplo(), eqs = dir ? D.equipes : [equipe('aurora')];
    const cards = eqs.map(e => { const r = resumo(D.vendedores.filter(v => v.equipe === e.id)), s = situacao(r); return `<${dir ? 'button type="button" data-eq="' + e.id + '"' : 'div'} class="card kpi" style="text-align:left;font:inherit;cursor:${dir ? 'pointer' : 'default'};min-height:0" ${dir ? `aria-pressed="${EQ.eq === e.id}" aria-label="Filtrar pela ${esc(e.nome)}"` : ''}><div class="k-l">${av(e.lider, 28)}<span>${esc(e.nome)}<br><span class="muted" style="font-weight:500;font-size:12px">Líder ${esc(e.lider)}</span></span></div><div class="k-v">${n(r.vendas)} <small>de ${n(r.meta)}</small></div>${bar(r.ating, '', RITMO)}<div class="row"><span class="pill ${s[0]}">${s[1]}</span><span class="muted" style="font-size:12px">${e.vendedores.length} vendedores · proj. ${pc(r.projPct)}</span></div></${dir ? 'button' : 'div'}>`; }).join('');
    view.innerHTML = `${dir ? '' : avisoPerfil()}<div class="grid ${dir ? 'g4' : 'g3'}">${cards}</div>
    <div class="card flat"><div class="toolbar"><div class="field busca"><label for="eqQ">Buscar vendedor</label><div class="wrap">${ic('busca', 'sm')}<input type="search" id="eqQ" placeholder="Nome ou login" autocomplete="off"></div></div>${dir ? `<div class="field"><label for="eqE">Equipe</label><select id="eqE"><option value="">Todas</option>${D.equipes.map(e => `<option value="${e.id}">${esc(e.nome)}</option>`).join('')}</select></div>` : ''}<div class="field"><label for="eqS">Status</label><select id="eqS"><option value="">Todos</option><option>Ativo</option><option>Em treinamento</option><option>Em férias</option></select></div><div class="field"><label for="eqO">Ordenar por</label><select id="eqO"><option value="vendas">Mais vendas</option><option value="ating">Maior atingimento</option><option value="ticket">Maior ticket</option><option value="nome">Nome (A-Z)</option></select></div></div><div id="eqTab"></div></div>`;
    $('#eqQ').value = EQ.q; $('#eqS').value = EQ.st; $('#eqO').value = EQ.ord; if (dir) $('#eqE').value = EQ.eq;
    $('#eqQ').addEventListener('input', e => { EQ.q = e.target.value; pintaEq(); });
    $('#eqS').addEventListener('change', e => { EQ.st = e.target.value; pintaEq(); }); $('#eqO').addEventListener('change', e => { EQ.ord = e.target.value; pintaEq(); });
    if (dir) { $('#eqE').addEventListener('change', e => { EQ.eq = e.target.value; $$('[data-eq]').forEach(b => b.setAttribute('aria-pressed', b.dataset.eq === EQ.eq)); pintaEq(); }); $$('[data-eq]').forEach(b => b.addEventListener('click', () => { EQ.eq = EQ.eq === b.dataset.eq ? '' : b.dataset.eq; $('#eqE').value = EQ.eq; $$('[data-eq]').forEach(x => x.setAttribute('aria-pressed', x.dataset.eq === EQ.eq)); pintaEq(); })); }
    pintaEq();
  }
  function pintaEq() {
    let l = vsEsc().filter(v => (!EQ.eq || v.equipe === EQ.eq) && (!EQ.st || v.status === EQ.st) && (!EQ.q || norm(v.nome + ' ' + v.login).includes(norm(EQ.q))));
    const f = { vendas: v => -sv(v.id).vendas, ating: v => -sv(v.id).ating, ticket: v => -sv(v.id).ticket, nome: v => v.nome };
    l = l.sort((a, b) => { const x = f[EQ.ord](a), y = f[EQ.ord](b); return typeof x === 'string' ? x.localeCompare(y, 'pt-BR') : x - y; });
    const dir = amplo(), el = $('#eqTab');
    if (!l.length) { el.innerHTML = vazio('Nenhum vendedor encontrado', 'Ajuste a busca ou os filtros para ver a equipe.', '<button class="btn" type="button" id="eqLimpa">Limpar filtros</button>'); $('#eqLimpa').addEventListener('click', () => { EQ.q = EQ.st = EQ.eq = ''; equipes(); }); return; }
    el.innerHTML = `<div class="tbl-wrap"><table class="tbl cards nw"><thead><tr><th>Vendedor</th>${dir ? '<th>Equipe</th>' : ''}<th>Status</th><th class="r">Vendas</th><th>Meta</th><th class="r hm">Ticket médio</th><th class="r">Projeção</th></tr></thead><tbody>${l.map(v => { const r = sv(v.id), s = situacao(r); return `<tr class="cl" tabindex="0" data-v="${v.id}" aria-label="${esc(v.nome)}. Abrir detalhe"><td class="t0"><div class="pessoa">${av(v.nome)}<span>${esc(v.nome)}<small>${esc(v.login)}</small></span></div></td>${dir ? `<td data-l="Equipe">${esc(equipe(v.equipe).nome)}</td>` : ''}<td data-l="Status"><span class="pill ${v.status === 'Ativo' ? 'ok' : 'at'}">${esc(v.status)}</span></td><td class="r num" data-l="Vendas"><b>${n(r.vendas)}</b></td><td data-l="Meta"><div class="mini"><span class="num">${pc(r.ating)} de ${n(v.meta)}</span>${bar(r.ating, '', RITMO)}</div></td><td class="r num hm" data-l="Ticket médio">${brl(r.ticket)}</td><td class="r" data-l="Projeção"><span class="pill ${s[0]}">${pc(r.projPct)}</span></td></tr>`; }).join('')}</tbody></table></div><div class="tbl-foot"><span>${l.length} ${l.length === 1 ? 'vendedor' : 'vendedores'}</span><span class="muted">Clique em uma linha para abrir o detalhe.</span></div>`;
    $$('tr.cl', el).forEach(tr => { const g = () => abreVendedor(tr.dataset.v); tr.addEventListener('click', g); tr.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); g(); } }); });
  }

  // =====================================================================
  // 4. VENDAS
  // =====================================================================
  const ORDS = { 'id-1': 'Mais recentes', 'id1': 'Mais antigas', 'valor-1': 'Maior valor', 'valor1': 'Menor valor', 'cliente1': 'Cliente (A-Z)', 'cidade1': 'Cidade (A-Z)' };
  function vendasEsc() { const ids = new Set(vsEsc().map(v => v.id)); return D.vendas.filter(x => ids.has(x.vend)); }
  function filtradas() {
    const q = norm(VN.q);
    const l = vendasEsc().filter(x => (!VN.eq || x.eq === VN.eq) && (!VN.uf || x.uf === VN.uf) && (!VN.cid || x.cidade === VN.cid) && (!VN.st || x.status === VN.st) && (!VN.pr || x.produto === VN.pr) && (!VN.cv || (VN.cv === 'nl' ? D.vendaChats[x.id] && !D.vendaChats[x.id].lido[lado()] : !!D.vendaChats[x.id])) && (!q || norm(x.cliente + ' ' + x.id + ' ' + vend(x.vend).nome).includes(q)));
    const kf = { id: x => x.d * 10000 + x.h * 100 + x.m, valor: x => x.valor, cliente: x => x.cliente, cidade: x => x.cidade, produto: x => x.produto, status: x => x.status, vendedor: x => vend(x.vend).nome };
    const f = kf[VN.k]; return l.sort((a, b) => { const p = f(a), q2 = f(b); const c = typeof p === 'string' ? p.localeCompare(q2, 'pt-BR') : p - q2; return (c || a.id.localeCompare(b.id)) * VN.dir; });
  }
  function vendas() {
    const dir = amplo(), base = vendasEsc();
    view.innerHTML = `${dir ? '' : avisoPerfil()}<div class="card flat"><div class="toolbar"><div class="field busca"><label for="vnQ">Buscar</label><div class="wrap">${ic('busca', 'sm')}<input type="search" id="vnQ" placeholder="Cliente, código${perfil === 'vend' ? '' : ' ou vendedor'}" autocomplete="off"></div></div>
    ${dir ? `<div class="field"><label for="vnE">Equipe</label><select id="vnE"><option value="">Todas</option>${D.equipes.map(e => `<option value="${e.id}">${esc(e.nome)}</option>`).join('')}</select></div>` : ''}
    <div class="field"><label for="vnU">Estado</label><select id="vnU"><option value="">Todos</option>${Object.keys(D.cidades).filter(u => base.some(x => x.uf === u)).map(u => `<option value="${u}">${u} · ${esc(D.cidades[u].nome)}</option>`).join('')}</select></div>
    <div class="field"><label for="vnC">Cidade</label><select id="vnC" disabled><option value="">Escolha um estado</option></select></div>
    <div class="field"><label for="vnS">Status</label><select id="vnS"><option value="">Todos</option>${['Instalada', 'Agendada', 'Pendente', 'Cancelada'].map(s => `<option>${s}</option>`).join('')}</select></div>
    <div class="field"><label for="vnP">Produto</label><select id="vnP"><option value="">Todos</option>${D.produtos.map(p => `<option>${esc(p.nome)}</option>`).join('')}</select></div>
    <div class="field"><label for="vnM">Conversa</label><select id="vnM"><option value="">Todas</option><option value="com">Com conversa</option><option value="nl">Mensagens não lidas</option></select></div>
    <div class="field"><label for="vnO">Ordenar por</label><select id="vnO">${Object.entries(ORDS).map(([k, t]) => `<option value="${k}">${t}</option>`).join('')}</select></div>
    <div class="push"><button class="btn pri" type="button" id="vnCsv">${ic('baixar', 'sm')}Exportar CSV</button></div></div>
    <div id="vnChips" style="padding:0 18px 14px"></div><div id="vnTab"></div></div>`;
    $('#vnQ').value = VN.q; if (dir) $('#vnE').value = VN.eq; $('#vnU').value = VN.uf; cidades(); $('#vnS').value = VN.st; $('#vnP').value = VN.pr; $('#vnM').value = VN.cv; $('#vnO').value = ordKey();
    $('#vnQ').addEventListener('input', e => { VN.q = e.target.value; VN.pg = 1; pintaVn(); });
    if (dir) $('#vnE').addEventListener('change', e => { VN.eq = e.target.value; VN.pg = 1; pintaVn(); });
    $('#vnU').addEventListener('change', e => { VN.uf = e.target.value; VN.cid = ''; VN.pg = 1; cidades(); pintaVn(); });
    $('#vnC').addEventListener('change', e => { VN.cid = e.target.value; VN.pg = 1; pintaVn(); });
    $('#vnS').addEventListener('change', e => { VN.st = e.target.value; VN.pg = 1; pintaVn(); });
    $('#vnP').addEventListener('change', e => { VN.pr = e.target.value; VN.pg = 1; pintaVn(); });
    $('#vnM').addEventListener('change', e => { VN.cv = e.target.value; VN.pg = 1; pintaVn(); });
    $('#vnO').addEventListener('change', e => { const m = e.target.value.match(/^(\w+?)(-?1)$/); VN.k = m[1]; VN.dir = Number(m[2]); VN.pg = 1; pintaVn(); });
    $('#vnCsv').addEventListener('click', exportaCsv);
    pintaVn();
  }
  const ordKey = () => (VN.k + VN.dir);
  function cidades() {
    const c = $('#vnC'); if (!VN.uf) { c.disabled = true; c.innerHTML = '<option value="">Escolha um estado</option>'; return; }
    c.disabled = false; c.innerHTML = '<option value="">Todas as cidades de ' + VN.uf + '</option>' + D.cidades[VN.uf].c.map(x => `<option>${esc(x[0])}</option>`).join(''); c.value = VN.cid;
  }
  const PG = 10;
  function pintaVn() {
    const l = filtradas(), tot = l.length, pgs = Math.max(1, Math.ceil(tot / PG)); VN.pg = Math.min(VN.pg, pgs);
    const dir = amplo(), ver = perfil !== 'vend', pagina = l.slice((VN.pg - 1) * PG, VN.pg * PG);
    const chips = []; const addChip = (t, k) => chips.push(`<span class="chip">${esc(t)}<button type="button" data-rm="${k}" aria-label="Remover filtro ${esc(t)}">${ic('x', 'sm')}</button></span>`);
    if (VN.q) addChip('Busca: ' + VN.q, 'q'); if (VN.eq) addChip(equipe(VN.eq).nome, 'eq'); if (VN.uf) addChip('Estado: ' + VN.uf, 'uf'); if (VN.cid) addChip('Cidade: ' + VN.cid, 'cid'); if (VN.st) addChip('Status: ' + VN.st, 'st'); if (VN.pr) addChip(VN.pr, 'pr'); if (VN.cv) addChip(VN.cv === 'nl' ? 'Mensagens não lidas' : 'Com conversa', 'cv');
    $('#vnChips').innerHTML = chips.length ? `<div class="chips">${chips.join('')}<button class="btn ghost sm" type="button" id="vnLimpa">Limpar filtros</button></div>` : '';
    $$('[data-rm]').forEach(b => b.addEventListener('click', () => { const k = b.dataset.rm; VN[k] = ''; if (k === 'uf') VN.cid = ''; ({ q: () => $('#vnQ').value = '', eq: () => dir && ($('#vnE').value = ''), uf: () => { $('#vnU').value = ''; cidades(); }, cid: () => $('#vnC').value = '', st: () => $('#vnS').value = '', pr: () => $('#vnP').value = '', cv: () => $('#vnM').value = '' })[k](); VN.pg = 1; pintaVn(); }));
    const lm = $('#vnLimpa'); if (lm) lm.addEventListener('click', limpaVn);
    const el = $('#vnTab');
    if (!tot) { el.innerHTML = vazio('Nenhuma venda encontrada', 'Nenhum registro combina com os filtros escolhidos.', '<button class="btn" type="button" id="vnLimpa2">Limpar filtros</button>'); $('#vnLimpa2').addEventListener('click', limpaVn); return; }
    const th = (k, t, cls = '') => `<th class="${cls}" ${VN.k === k ? `aria-sort="${VN.dir === 1 ? 'ascending' : 'descending'}"` : ''}><button type="button" data-k="${k}">${t}<span class="sa" aria-hidden="true">${VN.k === k ? (VN.dir === 1 ? '▲' : '▼') : '↕'}</span></button></th>`;
    el.innerHTML = `<div class="resumo"><span><b>${n(tot)}</b> ${tot === 1 ? 'venda' : 'vendas'}</span><span>Mensalidades somadas: <b>${brl(sum(l, x => x.valor))}</b></span><span>Canceladas: <b>${n(l.filter(x => x.status === 'Cancelada').length)}</b></span></div><div class="tbl-wrap"><table class="tbl cards"><thead><tr>${th('id', 'Código / data')}${th('cliente', 'Cliente')}${th('produto', 'Produto')}${th('cidade', 'Cidade/UF')}${ver ? th('vendedor', 'Vendedor') : ''}${th('valor', 'Valor mensal', 'r')}${th('status', 'Status')}<th class="c"><span class="sr">Conversa</span><span aria-hidden="true">${ic('chat', 'sm')}</span></th></tr></thead><tbody>${pagina.map(x => `<tr class="cl" tabindex="0" data-venda="${x.id}" aria-label="Venda ${x.id}, ${esc(x.cliente)}. Abrir detalhe e conversa"><td class="t0 num"><span class="id">${x.id}</span><small>${dd(x.d)} às ${String(x.h).padStart(2, '0')}:${String(x.m).padStart(2, '0')}</small></td><td data-l="Cliente">${esc(x.cliente)}</td><td data-l="Produto">${esc(x.produto)}</td><td data-l="Cidade/UF">${esc(x.cidade)}/${x.uf}</td>${ver ? `<td data-l="Vendedor"><span class="pessoa" style="font-weight:500">${av(vend(x.vend).nome, 24)}${esc(vend(x.vend).nome)}</span></td>` : ''}<td class="r num" data-l="Valor mensal"><b>${brl(x.valor)}</b></td><td data-l="Status">${stPill(x.status)}</td><td class="c" data-l="Conversa">${chatIco(x.id)}</td></tr>`).join('')}</tbody></table></div>
    <div class="tbl-foot"><span>Mostrando ${(VN.pg - 1) * PG + 1} a ${Math.min(tot, VN.pg * PG)} de ${n(tot)}</span><nav class="pager" aria-label="Paginação">${pager(pgs)}</nav></div>`;
    $$('[data-k]', el).forEach(b => b.addEventListener('click', () => { const k = b.dataset.k; if (VN.k === k) VN.dir *= -1; else { VN.k = k; VN.dir = (k === 'valor' || k === 'id') ? -1 : 1; } VN.pg = 1; $('#vnO').value = ORDS[ordKey()] ? ordKey() : $('#vnO').value; pintaVn(); const nb = $(`[data-k="${k}"]`); if (nb) nb.focus({ preventScroll: true }); }));
    $$('tr[data-venda]', el).forEach(tr => { const g = () => abreVenda(tr.dataset.venda); tr.addEventListener('click', g); tr.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); g(); } }); });
    $$('[data-p]', el).forEach(b => b.addEventListener('click', () => { VN.pg = Number(b.dataset.p); pintaVn(); const t = $('#vnTab'); const top = t.getBoundingClientRect().top + scrollY - 140; if (top < scrollY) scrollTo({ top, behavior: matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth' }); }));
  }
  function pager(pgs) {
    const nums = new Set([1, pgs, VN.pg - 1, VN.pg, VN.pg + 1].filter(p => p >= 1 && p <= pgs)), o = [...nums].sort((a, b) => a - b); let h = `<button type="button" data-p="${VN.pg - 1}" ${VN.pg === 1 ? 'disabled' : ''} aria-label="Página anterior">${ic('esq', 'sm')}</button>`, ult = 0;
    o.forEach(p => { if (p - ult > 1) h += '<span class="muted" aria-hidden="true">…</span>'; h += `<button type="button" data-p="${p}" ${p === VN.pg ? 'aria-current="page"' : ''} aria-label="Página ${p}">${p}</button>`; ult = p; });
    return h + `<button type="button" data-p="${VN.pg + 1}" ${VN.pg === pgs ? 'disabled' : ''} aria-label="Próxima página">${ic('dir', 'sm')}</button>`;
  }
  function limpaVn() { VN = { ...VN, q: '', eq: '', uf: '', cid: '', st: '', pr: '', cv: '', pg: 1 }; vendas(); }
  function baixa(nome, texto) {
    const blob = new Blob(['﻿' + texto], { type: 'text/csv;charset=utf-8' }), url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = nome; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1500);
  }
  const csvCel = v => { const t = String(v); return /[;"\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t; };
  function exportaCsv() {
    const l = filtradas(), cab = ['Código', 'Data', 'Cliente', 'Vendedor', 'Equipe', 'Produto', 'Valor mensal (R$)', 'Estado', 'Cidade', 'Status'];
    const linhas = l.map(x => [x.id, dd(x.d) + '/2026', x.cliente, vend(x.vend).nome, equipe(x.eq).nome, x.produto, x.valor.toFixed(2).replace('.', ','), x.uf, x.cidade, x.status].map(csvCel).join(';'));
    baixa('vendas-norte-conecta-2026-11.csv', [cab.join(';'), ...linhas].join('\r\n') + '\r\n');
    toast(`CSV gerado com ${n(l.length)} ${l.length === 1 ? 'venda' : 'vendas'} (dados filtrados)`);
  }

  // =====================================================================
  // Detalhe da venda + chat entre backoffice e vendedor
  // =====================================================================
  const chatIco = id => {
    const t = D.vendaChats[id];
    if (!t) return '<span class="muted" aria-hidden="true">—</span><span class="sr">Sem conversa</span>';
    const nl = !t.lido[lado()], txt = nl ? 'Mensagem não lida' : t.msgs.length + (t.msgs.length === 1 ? ' mensagem' : ' mensagens');
    return `<span class="vc-ic${nl ? ' nl' : ''}" title="${txt}">${ic('chat', 'sm')}<span class="sr">${txt}</span>${nl ? '<i aria-hidden="true"></i>' : ''}</span>`;
  };
  let relV = 10 * 60 + 4, digV = null;
  const horaV = () => { relV++; return String(Math.floor(relV / 60)).padStart(2, '0') + ':' + String(relV % 60).padStart(2, '0'); };
  const outroLado = () => lado() === 'bo' ? 'vend' : 'bo';
  function abreVenda(id) {
    const x = D.vendas.find(v => v.id === id); if (!x) return;
    const v = vend(x.vend), e = equipe(x.eq), t = D.vendaChats[id];
    if (t) t.lido[lado()] = true;
    const hora = String(x.h).padStart(2, '0') + ':' + String(x.m).padStart(2, '0');
    const P1 = ['Venda lançada', `${dd(x.d)} às ${hora} por ${v.nome}`];
    const passos = x.status === 'Cancelada' ? [[...P1, 'ok'], ['Venda cancelada', 'Cliente desistiu antes da instalação', 'cr']]
      : x.status === 'Pendente' ? [[...P1, 'ok'], ['Cadastro com pendência', t ? 'Assunto: ' + t.tema.toLowerCase() + ' · veja a conversa abaixo' : 'Aguardando conferência do backoffice', 'on'], ['Instalação', 'Agendada depois que o cadastro for liberado', '']]
        : x.status === 'Agendada' ? [[...P1, 'ok'], ['Cadastro conferido', 'Backoffice · ' + D.backoffice, 'ok'], ['Instalação agendada', 'Até ' + dd(Math.min(30, x.d + 3)) + ' · período da manhã', 'on'], ['Instalada', '', '']]
          : [[...P1, 'ok'], ['Cadastro conferido', 'Backoffice · ' + D.backoffice, 'ok'], ['Instalação agendada', '', 'ok'], ['Instalada', 'Cliente ativo', 'ok']];
    const outro = lado() === 'bo' ? v.nome : D.backoffice;
    const rap = lado() === 'bo' ? ['Pode mandar a foto do documento?', 'Confirma o número do endereço?', 'Cadastro liberado ✅'] : ['Mando agora!', 'Cliente confirmou os dados ✅', 'Dá para agendar amanhã?'];
    abre($('#drawer'), `<div class="dw-head"><button class="x" type="button" data-close aria-label="Fechar detalhe">${ic('x')}</button><div class="who">${av(x.cliente, 56)}<div><h2 id="drawerTitulo">${esc(x.cliente)}</h2><div class="sub">${x.id} · ${esc(x.produto)} · ${stPill(x.status)}</div></div></div></div>
      <div class="dw-body"><div class="mk"><div><span>Mensalidade</span><b class="num">${brl(x.valor)}</b></div><div><span>Cidade</span><b>${esc(x.cidade)}/${x.uf}</b></div><div><span>Vendedor</span><b>${esc(v.nome)}</b></div><div><span>Equipe</span><b>${esc(e.nome)}</b></div></div>
      <section><h3>Andamento</h3><ol class="vt">${passos.map(p => `<li class="${p[2]}"><b>${esc(p[0])}</b>${p[1] ? `<small>${esc(p[1])}</small>` : ''}</li>`).join('')}</ol></section>
      <section class="vc"><div class="vc-h"><h3>Conversa da venda</h3>${t ? `<span class="pill cinza">${esc(t.tema)}</span>` : ''}</div><p class="muted vc-sub">Backoffice e vendedor resolvem pendências aqui. Tudo fica no histórico da venda.</p>
        <div class="vc-log" id="vcLog" data-v="${x.id}" role="log" aria-live="polite" aria-label="Mensagens da venda ${x.id}"></div>
        <div class="vc-rap" aria-label="Respostas rápidas">${rap.map(r => `<button type="button" data-vr="${esc(r)}">${esc(r)}</button>`).join('')}</div>
        <form class="vc-f" id="vcF"><button type="button" class="vc-ib" id="vcAnexo" aria-label="Anexar foto ou documento (simulação)">${ic('clip', 'sm')}</button><label class="sr" for="vcT">Mensagem para ${esc(outro)}</label><textarea id="vcT" rows="1" placeholder="Escreva para ${esc(prim(outro))}…"></textarea><button class="btn pri sm" type="submit" aria-label="Enviar mensagem">${ic('env', 'sm')}</button></form>
        <p class="vc-quem muted">Você está escrevendo como <b>${esc(autorEu())}</b> (${lado() === 'bo' ? 'backoffice' : 'vendedor'}). Troque em <b>Ver como</b> para responder pelo outro lado.</p></section></div>`);
    pintaVc(id);
    const f = $('#vcF'), ta = $('#vcT');
    f.addEventListener('submit', ev => { ev.preventDefault(); enviaVc(id, ta.value); ta.value = ''; ta.focus(); });
    ta.addEventListener('keydown', ev => { if (ev.key === 'Enter' && !ev.shiftKey) { ev.preventDefault(); f.requestSubmit(); } });
    $$('[data-vr]').forEach(b => b.addEventListener('click', () => enviaVc(id, b.dataset.vr)));
    $('#vcAnexo').addEventListener('click', () => enviaVc(id, 'foto-' + id.toLowerCase() + '.jpg', 'anexo'));
    atualizaTudo();
    if (rota === 'vendas' && $('#vnTab')) { pintaVn(); const r = $(`tr[data-venda="${id}"]`); if (r) ultimoFoco = r; }
  }
  function pintaVc(id) {
    const log = $('#vcLog'); if (!log || log.dataset.v !== id) return;
    const t = D.vendaChats[id];
    log.innerHTML = (t && t.msgs.length ? t.msgs.map(m => m.de === 'sis' ? `<div class="vc-sis">${esc(m.txt)} · ${dd(m.d)} ${m.h}</div>`
      : `<div class="vc-m ${m.de === lado() ? 'eu' : ''}"><span class="vc-a">${esc(m.autor)} · ${m.de === 'bo' ? 'backoffice' : 'vendedor'}</span><p>${m.tipo === 'anexo' ? `<span class="vc-anexo">${ic('clip', 'sm')}${esc(m.txt)}</span>` : esc(m.txt)}</p><time>${dd(m.d)} ${m.h}</time></div>`).join('')
      : '<div class="vc-vazio">Nenhuma mensagem ainda. Comece a conversa sobre esta venda.</div>')
      + (digV === id ? `<div class="vc-dig">${esc(prim(outroLado() === 'vend' ? vend(D.vendas.find(x => x.id === id).vend).nome : D.backoffice))} está digitando…</div>` : '');
    log.scrollTop = log.scrollHeight;
  }
  function enviaVc(id, texto, tipo) {
    const txt = String(texto).trim(); if (!txt) return;
    let t = D.vendaChats[id];
    if (!t) t = D.vendaChats[id] = { tema: 'Conversa', msgs: [], lido: { bo: true, vend: true } };
    t.msgs.push({ de: lado(), autor: autorEu(), txt, d: HOJE, h: horaV(), tipo: tipo || '' });
    t.lido[lado()] = true; t.lido[outroLado()] = false;
    pintaVc(id); atualizaTudo();
    const ol = outroLado(), x = D.vendas.find(v => v.id === id), quem = ol === 'vend' ? vend(x.vend).nome : D.backoffice;
    const R = ol === 'vend' ? ['Certo, já resolvo com o cliente!', 'Combinado, te mando em instantes.', 'Pode deixar 👍'] : ['Recebido! Vou conferir e te aviso.', 'Obrigada! Atualizei a venda aqui.', 'Perfeito, sigo com o cadastro.'];
    setTimeout(() => { digV = id; pintaVc(id); }, 800);
    setTimeout(() => {
      if (digV === id) digV = null;
      const meuLado = ol === 'vend' ? 'bo' : 'vend';
      t.msgs.push({ de: ol, autor: quem, txt: R[t.msgs.length % 3], d: HOJE, h: horaV(), tipo: '' });
      t.lido[ol] = true;
      const vendo = $('#vcLog') && $('#vcLog').dataset.v === id && lado() === meuLado;
      t.lido[meuLado] = !!vendo;
      pintaVc(id); atualizaTudo();
      if (!vendo) { if (rota === 'vendas' && $('#vnTab') && !camada) pintaVn(); toast(`${prim(quem)} respondeu na venda ${id}`); }
    }, 2600);
  }

  // =====================================================================
  // 5. METAS E COMISSÕES
  // =====================================================================
  function metas() {
    const dir = amplo(), vs = vsEsc(), r = resumo(vs), faltam = Math.max(0, r.meta - r.vendas), sit = situacao(r);
    const topo = `<div class="grid g4"><article class="card kpi" style="min-height:0"><div class="k-l">Meta do mês</div><div class="k-v">${n(r.meta)} <small>vendas</small></div><div class="k-s">${dir ? 'Soma das metas das 4 equipes' : perfil === 'lider' ? 'Soma da Equipe Aurora' : 'Sua meta individual'}</div></article>
      <article class="card kpi" style="min-height:0"><div class="k-l">Realizado até ${dd(HOJE)}</div><div class="k-v">${n(r.vendas)} <small>(${pc(r.ating)})</small></div>${bar(r.ating, '', RITMO)}</article>
      <article class="card kpi" style="min-height:0"><div class="k-l">Falta para a meta</div><div class="k-v">${n(faltam)} <small>vendas</small></div><div class="k-s">≈ ${dec(faltam / DUTEIS)} por dia útil (${DUTEIS} restantes)</div></article>
      <article class="card kpi" style="min-height:0"><div class="k-l">Projeção de fechamento</div><div class="k-v">${n(r.proj)} <small>(${pc(r.projPct)})</small></div><div class="row"><span class="pill ${sit[0]}">${sit[1]}</span></div></article></div>`;
    const eqCards = dir ? `<div class="grid g4">${D.equipes.map(e => { const q = resumo(D.vendedores.filter(v => v.equipe === e.id)), s = situacao(q); return `<article class="card kpi" style="min-height:0"><div class="k-l">${esc(e.nome)}</div><div class="k-v">${pc(q.ating)} <small>${n(q.vendas)}/${n(q.meta)}</small></div>${bar(q.ating, '', RITMO)}<div class="row"><span class="pill ${s[0]}">${s[1]}</span><span class="muted" style="font-size:12px">Projeção ${pc(q.projPct)}</span></div></article>`; }).join('')}</div>` : '';
    const lista = `<div class="card flat"><div class="toolbar" style="padding-bottom:6px"><div style="flex:1;min-width:220px"><h2 style="font-size:15.5px">${perfil === 'vend' ? 'Sua meta' : 'Metas por vendedor'}</h2><p class="muted" style="margin:2px 0 0;font-size:12.5px">Comissão estimada pelas regras fictícias abaixo, sobre as vendas realizadas até hoje.</p></div>${dir ? `<div class="field"><label for="mtE">Equipe</label><select id="mtE"><option value="">Todas</option>${D.equipes.map(e => `<option value="${e.id}">${esc(e.nome)}</option>`).join('')}</select></div>` : ''}</div><div id="mtTab"></div></div>`;
    view.innerHTML = `${dir ? '' : avisoPerfil()}${topo}${eqCards}${lista}<div id="sim"></div>`;
    if (dir) { $('#mtE').value = MT.eq; $('#mtE').addEventListener('change', e => { MT.eq = e.target.value; pintaMt(); }); }
    pintaMt();
    if (!SM) { const v0 = perfil === 'vend' ? ME : vs.find(v => v.id === ME.id) || vs[0]; SM = presetDe(v0.id); }
    simulador();
  }
  function presetDe(id) { const r = sv(id), v = vend(id); return { quem: id, vendas: r.vendas, meta: v.meta, ticket: Math.round(r.ticket * 100) / 100, canc: r.canc, eq: false }; }
  function pintaMt() {
    const dir = amplo(), l = vsEsc().filter(v => !MT.eq || v.equipe === MT.eq).sort((a, b) => sv(b.id).ating - sv(a.id).ating);
    $('#mtTab').innerHTML = `<div class="tbl-wrap"><table class="tbl cards nw"><thead><tr><th>Vendedor</th>${dir ? '<th>Equipe</th>' : ''}<th class="r hm">Meta</th><th class="r hm">Realizado</th><th>Atingimento</th><th class="r hm">Faltam</th><th>Situação</th><th class="r">Comissão (estimativa)</th><th></th></tr></thead><tbody>${l.map(v => { const r = sv(v.id), s = situacao(r), f = Math.max(0, v.meta - r.vendas), c = comissao({ vendas: r.vendas, meta: v.meta, ticket: r.ticket, canc: r.canc, eq: false }); return `<tr><td class="t0"><div class="pessoa">${av(v.nome)}<span>${esc(v.nome)}<small>${esc(v.status)}</small></span></div></td>${dir ? `<td data-l="Equipe">${esc(equipe(v.equipe).nome)}</td>` : ''}<td class="r num hm" data-l="Meta">${n(v.meta)}</td><td class="r num hm" data-l="Realizado">${n(r.vendas)}</td><td data-l="Atingimento"><div class="mini"><span class="num">${pc(r.ating)} <span class="muted" style="font-weight:500">· ${n(r.vendas)} de ${n(v.meta)}</span></span>${bar(r.ating, '', RITMO)}</div></td><td class="r num hm" data-l="Faltam">${n(f)}<small class="dim">${dec(f / DUTEIS)}/dia útil</small></td><td data-l="Situação"><span class="pill ${s[0]}">${s[1]}</span></td><td class="r num" data-l="Comissão estimada"><b>${brl0(c.total)}</b></td><td class="r"><button class="btn sm" type="button" data-sim="${v.id}">Simular</button></td></tr>`; }).join('')}</tbody></table></div>`;
    $$('[data-sim]').forEach(b => b.addEventListener('click', () => { SM = presetDe(b.dataset.sim); simulador(); $('#sim').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth', block: 'start' }); toast('Simulador preenchido com os dados de ' + vend(b.dataset.sim).nome); }));
  }
  function simulador() {
    const vs = vsEsc();
    $('#sim').innerHTML = `<div class="grid g-meta"><article class="card"><div class="card-h"><div><h2>Simulador de comissão</h2><p>Altere os campos e veja o resultado na hora</p></div><span class="pill at">Estimativa</span></div>
      <div class="sim-in"><div class="field full"><label for="smQ">Preencher com os dados de</label><select id="smQ"><option value="livre">Valores livres</option>${vs.map(v => `<option value="${v.id}">${esc(v.nome)}</option>`).join('')}</select></div>
      <div class="field full"><label for="smV">Vendas válidas no mês</label><input type="number" id="smV" min="0" max="200" step="1" inputmode="numeric"><input type="range" id="smVr" min="0" max="80" step="1" aria-label="Ajustar vendas válidas no mês"></div>
      <div class="field"><label for="smM">Meta do mês (vendas)</label><input type="number" id="smM" min="1" max="200" step="1" inputmode="numeric"></div>
      <div class="field"><label for="smT">Ticket médio (R$)</label><input type="number" id="smT" min="0" max="1000" step="0.01" inputmode="decimal"></div>
      <div class="field"><label for="smC">Cancelamentos (estornos)</label><input type="number" id="smC" min="0" max="100" step="1" inputmode="numeric"></div>
      <div class="field"><span class="lbl">Bônus de equipe</span><label class="sw"><input type="checkbox" id="smE"> Equipe bateu a meta</label></div></div>
      <div class="aviso" style="margin-top:16px">${ic('alerta', 'sm')}<span><b>Estimativa com regras fictícias de demonstração.</b> Nada aqui é compromisso de pagamento. Na versão real, as regras da sua empresa são configuradas no sistema.</span></div></article>
      <article class="card" id="smRes" aria-live="polite"></article></div>`;
    const set = () => { $('#smQ').value = SM.quem; $('#smV').value = SM.vendas; $('#smVr').value = SM.vendas; $('#smVr').max = Math.max(80, Math.ceil(SM.meta * 1.8)); $('#smM').value = SM.meta; $('#smT').value = SM.ticket; $('#smC').value = SM.canc; $('#smE').checked = SM.eq; };
    set(); res();
    const num = (id, k, min, dec) => $(id).addEventListener('input', e => { let v = parseFloat(String(e.target.value).replace(',', '.')); if (!isFinite(v) || v < min) v = min; SM[k] = dec ? v : Math.round(v); SM.quem = 'livre'; $('#smQ').value = 'livre'; if (k === 'vendas') $('#smVr').value = SM.vendas; res(); });
    num('#smV', 'vendas', 0); num('#smM', 'meta', 1); num('#smT', 'ticket', 0, true); num('#smC', 'canc', 0);
    $('#smVr').addEventListener('input', e => { SM.vendas = Number(e.target.value); SM.quem = 'livre'; $('#smQ').value = 'livre'; $('#smV').value = SM.vendas; res(); });
    $('#smE').addEventListener('change', e => { SM.eq = e.target.checked; res(); });
    $('#smQ').addEventListener('change', e => { if (e.target.value === 'livre') { SM.quem = 'livre'; return; } const eq = SM.eq; SM = presetDe(e.target.value); SM.eq = eq; set(); res(); });
  }
  function res() {
    const c = comissao(SM), prox = FAIXAS[c.fi + 1];
    let dica = 'Você já está na maior faixa de comissão.';
    if (prox) { const falta = Math.max(1, Math.ceil(SM.meta * prox.min / 100 - 1e-9) - SM.vendas), c2 = comissao({ ...SM, vendas: SM.vendas + falta }); dica = `Faltam <b>${falta}</b> ${falta === 1 ? 'venda' : 'vendas'} para a faixa de ${Math.round(prox.tx * 100)}%: a estimativa sobe para <b>${brl0(c2.total)}</b> (+${brl0(c2.total - c.total)}).`; }
    $('#smRes').innerHTML = `<div class="res-tot"><span>Comissão estimada do mês</span><span class="big num">${brl(c.total)}</span><p>Atingimento de ${dec(c.at)}% da meta · faixa de ${Math.round(c.f.tx * 100)}% sobre a 1ª mensalidade</p></div>
    <div class="linhas" style="margin:14px 0"><div><span>${n(SM.vendas)} vendas × ${brl(SM.ticket)} × ${Math.round(c.f.tx * 100)}%</span><span class="num">${brl(c.bruta)}</span></div><div class="neg"><span>Estornos (${n(SM.canc)} cancelamentos)</span><span class="num">− ${brl(c.estorno)}</span></div><div><span>Bônus por bater a meta</span><span class="num">${brl(c.bm)}</span></div><div><span>Bônus de equipe</span><span class="num">${brl(c.be)}</span></div><div><span>Total estimado</span><span class="num">${brl(c.total)}</span></div></div>
    <p style="margin:0 0 12px;font-size:13px;color:var(--tinta2)">${dica}</p>
    <table class="faixas"><caption class="sr">Faixas de comissão por atingimento da meta</caption><thead><tr><th>Atingimento da meta</th><th>Taxa</th></tr></thead><tbody>${FAIXAS.map((f, i) => `<tr class="${i === c.fi ? 'on' : ''}"><td>${f.nome}${i === c.fi ? ' (sua faixa)' : ''}</td><td class="num">${Math.round(f.tx * 100)}%</td></tr>`).join('')}</tbody></table>
    <p class="muted" style="font-size:12px;margin:10px 0 0">Bônus fixos fictícios: ${brl0(BONUS_META)} ao atingir 100% da meta e ${brl0(BONUS_EQ)} se a equipe bater a meta.</p>`;
  }

  // =====================================================================
  // 6. IMPORTAR PLANILHA (simulação)
  // =====================================================================
  const imp = () => { const l = D.importacao; return { l, ok: l.filter(x => x.nivel === 'ok').length, av: l.filter(x => x.nivel === 'aviso').length, er: l.filter(x => x.nivel === 'erro').length }; };
  function importar() {
    const f = IM.fase, st = ['Enviar arquivo', 'Prévia e validação', 'Importação', 'Resultado'];
    const steps = `<ol class="steps" aria-label="Etapas da importação">${st.map((t, i) => `<li class="${i < f ? 'ok' : i === f ? 'on' : ''}"${i === f ? ' aria-current="step"' : ''}><span>${t}</span></li>`).join('')}</ol>`;
    const x = imp();
    let corpo = '';
    if (f === 0) {
      corpo = `<div class="aviso info">${ic('info', 'sm')}<span><b>Demonstração:</b> a planilha não é lida de verdade. O arquivo escolhido só aparece pelo nome e a prévia abaixo é um exemplo fixo. No sistema real, a validação roda sobre os seus dados.</span></div>
      <button class="drop" type="button" id="drop"><span class="ic-b">${ic('importar')}</span><strong>Arraste a planilha aqui</strong><span>ou clique para escolher um arquivo (.xlsx, .xls ou .csv)</span></button><input type="file" id="arq" accept=".xlsx,.xls,.csv" hidden>
      <div style="display:flex;justify-content:center;gap:10px;align-items:center;flex-wrap:wrap" class="muted"><span>Sem arquivo à mão?</span><button class="btn sm" type="button" id="exemplo">${ic('arq', 'sm')}Usar planilha de exemplo</button></div>`;
    } else if (f === 1) {
      const l = x.l.filter(r => IM.filtro === 'todas' || (IM.filtro === 'validas' && r.nivel === 'ok') || (IM.filtro === 'avisos' && r.nivel === 'aviso') || (IM.filtro === 'erros' && r.nivel === 'erro')), podeIr = IM.ign || x.er === 0;
      const tb = (k, t, q) => `<button type="button" data-f="${k}" aria-pressed="${IM.filtro === k}">${t} (${q})</button>`;
      corpo = `<div class="card" style="display:flex;align-items:center;gap:14px;padding:14px 18px;flex-wrap:wrap"><span class="k-ic" style="display:inline-flex;width:40px;height:40px;border-radius:12px;background:var(--marca-bg);color:var(--marca);align-items:center;justify-content:center">${ic('arq')}</span><div style="flex:1;min-width:180px"><b>${esc(IM.arq)}</b><div class="muted" style="font-size:12.5px">Lido em modo demonstração · ${x.l.length} linhas</div></div><button class="btn sm" type="button" id="troca">Trocar arquivo</button></div>
      <div class="sum4"><div><span>Linhas lidas</span><b>${x.l.length}</b></div><div class="ok"><span>Válidas</span><b>${x.ok}</b></div><div class="at"><span>Avisos</span><b>${x.av}</b></div><div class="cr"><span>Erros</span><b>${x.er}</b></div></div>
      <div class="card flat"><div class="toolbar" style="padding-bottom:14px"><div class="tabs" role="group" aria-label="Filtrar linhas">${tb('todas', 'Todas', x.l.length)}${tb('validas', 'Válidas', x.ok)}${tb('avisos', 'Avisos', x.av)}${tb('erros', 'Erros', x.er)}</div></div>
      <div class="tbl-wrap imp-tbl"><table class="tbl cards"><thead><tr><th>Linha</th><th>Vendedor</th><th>Cliente</th><th>Produto</th><th>Cidade/UF</th><th>Data</th><th class="r">Valor</th><th>Resultado</th></tr></thead><tbody>${l.map(r => `<tr><td class="t0 num"><b>Linha ${r.linha}</b></td><td data-l="Vendedor">${esc(r.vendedor)}</td><td data-l="Cliente">${esc(r.cliente)}</td><td data-l="Produto">${esc(r.produto)}</td><td data-l="Cidade/UF">${esc(r.local)}</td><td class="num" data-l="Data">${r.data}</td><td class="r num" data-l="Valor">${brl(r.valor)}</td><td data-l="Resultado" style="text-align:right"><span class="nv ${r.nivel}">${{ ok: 'Válida', aviso: 'Aviso', erro: 'Erro' }[r.nivel]}</span>${r.msg ? `<div style="font-size:12px;color:var(--tinta2);margin-top:4px;max-width:340px">${esc(r.msg)}</div>` : ''}</td></tr>`).join('')}</tbody></table></div></div>
      <div class="card" style="display:flex;gap:16px;align-items:center;flex-wrap:wrap;justify-content:space-between"><label class="sw"><input type="checkbox" id="ign" ${IM.ign ? 'checked' : ''}> Ignorar as ${x.er} linhas com erro e importar as demais</label><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">${podeIr ? '' : '<span class="muted" style="font-size:12.5px">Corrija a planilha ou ignore as linhas com erro.</span>'}<button class="btn pri" type="button" id="conf" ${podeIr ? '' : 'disabled'}>Confirmar importação (${x.ok + x.av} linhas)</button></div></div>`;
    } else if (f === 2) {
      const et = ['Lendo o arquivo', 'Validando nomes e logins', 'Gravando vendas', 'Conferindo totais'];
      corpo = `<div class="card"><h2 style="font-size:16px;margin-bottom:12px">Importando <span class="muted" style="font-family:var(--sans);font-weight:500">(simulação)</span></h2><div class="prog" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${IM.pct}"><i id="pbar" style="width:${IM.pct}%"></i></div><p class="num muted" id="ppct" style="margin:8px 0 0">${IM.pct}%</p><ul class="etapas-l" id="etl">${et.map((t, i) => `<li class="${i < IM.etapa ? 'ok' : i === IM.etapa ? 'on' : ''}">${t}</li>`).join('')}</ul></div>`;
    } else {
      corpo = `<div class="card"><div class="ok-big"><span class="ic-b">${ic('check')}</span><div><h2 style="font-size:19px">Importação concluída (simulação)</h2><p class="muted" style="margin:2px 0 0">${esc(IM.arq)} · nenhuma venda foi gravada nesta demonstração.</p></div></div></div>
      <div class="sum4"><div class="ok"><span>Vendas importadas</span><b>${x.ok + x.av}</b></div><div class="at"><span>Com aviso (ajustadas)</span><b>${x.av}</b></div><div class="cr"><span>Linhas ignoradas</span><b>${x.er}</b></div><div><span>Duração</span><b>2,8 s</b></div></div>
      <div class="card"><h3 style="font-size:14px;margin-bottom:10px">O que acontece no sistema real</h3><ul style="margin:0 0 16px;padding-left:18px;color:var(--tinta2);line-height:1.7"><li>Vendas entram no painel e nos rankings na hora.</li><li>Nomes e logins duplicados são barrados antes de gravar.</li><li>Cada importação fica registrada, com quem enviou e quando.</li></ul><div class="acoes"><button class="btn pri" type="button" id="rel">${ic('baixar', 'sm')}Baixar relatório de erros e avisos (CSV)</button><button class="btn" type="button" id="outra">Importar outra planilha</button></div></div>`;
    }
    view.innerHTML = `<div class="card">${steps}</div>${corpo}`;
    if (f === 0) {
      const drop = $('#drop'), inp = $('#arq');
      drop.addEventListener('click', () => inp.click());
      inp.addEventListener('change', () => { if (inp.files[0]) lerArquivo(inp.files[0].name); });
      ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
      ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over'); }));
      drop.addEventListener('drop', e => { const a = e.dataTransfer.files[0]; if (a) lerArquivo(a.name); });
      $('#exemplo').addEventListener('click', () => lerArquivo('vendas-novembro-exemplo.xlsx'));
    } else if (f === 1) {
      $$('[data-f]').forEach(b => b.addEventListener('click', () => { IM.filtro = b.dataset.f; importar(); const nb = $(`[data-f="${IM.filtro}"]`); if (nb) nb.focus({ preventScroll: true }); }));
      $('#ign').addEventListener('change', e => { IM.ign = e.target.checked; importar(); $('#ign').focus({ preventScroll: true }); });
      $('#troca').addEventListener('click', () => { IM = { fase: 0, arq: '', filtro: 'todas', ign: true, pct: 0, etapa: 0 }; importar(); });
      $('#conf').addEventListener('click', roda);
    } else if (f === 3) {
      $('#rel').addEventListener('click', () => {
        const p = x.l.filter(r => r.nivel !== 'ok'); baixa('relatorio-importacao-exemplo.csv', ['Linha;Vendedor;Cliente;Situação;Mensagem', ...p.map(r => [r.linha, r.vendedor, r.cliente, r.nivel === 'erro' ? 'Erro (ignorada)' : 'Aviso (ajustada)', r.msg].map(csvCel).join(';'))].join('\r\n') + '\r\n'); toast(`Relatório com ${p.length} linhas baixado`);
      });
      $('#outra').addEventListener('click', () => { IM = { fase: 0, arq: '', filtro: 'todas', ign: true, pct: 0, etapa: 0 }; importar(); });
    }
  }
  function lerArquivo(nome) {
    IM.arq = nome; view.innerHTML = `<div class="card"><h2 style="font-size:16px">Lendo ${esc(nome)}…</h2><div class="prog" style="margin-top:12px"><i style="width:60%"></i></div></div>`;
    const t = ++token; setTimeout(() => { if (t !== token) return; IM.fase = 1; importar(); window.scrollTo(0, 0); }, 650);
  }
  function roda() {
    IM.fase = 2; IM.pct = 0; IM.etapa = 0; importar();
    const id = setInterval(() => {
      IM.pct = Math.min(100, IM.pct + 4); IM.etapa = Math.min(3, Math.floor(IM.pct / 25));
      const b = $('#pbar'); if (!b) { clearInterval(id); return; }
      b.style.width = IM.pct + '%'; $('#ppct').textContent = IM.pct + '%'; b.parentNode.setAttribute('aria-valuenow', IM.pct);
      $$('#etl li').forEach((li, i) => li.className = i < IM.etapa ? 'ok' : i === IM.etapa ? 'on' : '');
      if (IM.pct >= 100) { clearInterval(id); setTimeout(() => { if (rota === 'importar') { IM.fase = 3; importar(); view.focus({ preventScroll: true }); } }, 350); }
    }, 70);
    timers.push(id);
  }

  // ---------- início ----------
  setSim(); if (document.fonts && document.fonts.ready) document.fonts.ready.then(setSim);
  if (!location.hash) history.replaceState(null, '', '#/visao');
  rotear(false);
})();
