// Chat Express · central de atendimento da Norte Conecta (protótipo, empresa fictícia).
// Caixa de entrada com filas, bot de triagem, notas internas, sugestão de resposta e relatórios.
// Tudo roda no navegador: nenhuma mensagem sai daqui. O app principal chama ChatExpress.montar(contexto).
(function () {
  'use strict';
  const D = window.NC, CX = D.cx;
  let C = null; // contexto entregue pelo app (perfil, ícones, toast, modal…)
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const hm = m => String(Math.floor(m / 60) % 24).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
  const min = t => { const [a, b] = t.split(':').map(Number); return a * 60 + b; };
  const prim = nome => String(nome).split(' ')[0];
  const quebra = t => C.esc(t).replace(/\n/g, '<br>');

  // relógio da demonstração: começa logo depois da última mensagem e anda um minuto por ação
  let relogio = min('09:43');
  const agora = () => hm(++relogio);
  CX.conversas.forEach(c => { c.ts = min(c.h); });

  const NOME_ST = { triagem: 'Com o bot', fila: 'Na fila', atendimento: 'Em atendimento', aguardando: 'Aguardando cliente', resolvida: 'Resolvida' };
  const COR_ST = { triagem: 'cinza', fila: 'at', atendimento: 'info', aguardando: 'cinza', resolvida: 'ok' };
  const CANAL = { whatsapp: 'WhatsApp', site: 'Chat do site' };
  const I = {
    wa: '<path d="M4.5 19.5l1.2-3.6A7.8 7.8 0 1 1 8.4 18.4z"/><path d="M9.3 9.2c.2 2.2 2.6 4.6 4.8 4.9l1.1-1.2 1.8.9"/>',
    site: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.4 3 14.6 0 18M12 3c-3 3.4-3 14.6 0 18"/>',
    ia: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
    raio: '<path d="M13 3L5 13.5h6L10 21l8-10.5h-6z"/>', clip: '<path d="M20 11.5l-8.2 8.2a5 5 0 0 1-7.1-7.1l8.6-8.6a3.4 3.4 0 0 1 4.8 4.8l-8.4 8.4a1.8 1.8 0 0 1-2.6-2.6l7.6-7.6"/>',
    env: '<path d="M4 12l16-8-5.5 16-3-6.5z"/><path d="M11.5 13.5L20 4"/>', bot: '<rect x="4" y="8" width="16" height="11" rx="3.5"/><path d="M12 4.5V8M9 13.2v.6M15 13.2v.6"/>',
    transf: '<path d="M4 8h14l-3.5-3.5M20 16H6l3.5 3.5"/>', ok: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.5"/>',
    voltar: '<path d="M15 5l-7 7 7 7"/>', nota: '<path d="M5 4h14v11l-5 5H5z"/><path d="M14 20v-5h5"/>', relog: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    pessoa: '<circle cx="12" cy="8" r="3.6"/><path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7"/>', estrela: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.8z"/>',
    graf: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>', baixar: '<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5"/><path d="M4 18v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1"/>',
  };
  const ic = (k, c = '') => `<svg class="ic ${c}" viewBox="0 0 24 24" aria-hidden="true">${I[k]}</svg>`;

  // estado da tela (sobrevive à troca de tela dentro da demonstração)
  const ST = { sub: 'inbox', aba: 'todas', q: '', sel: 'cx1', modo: 'resp', mob: false, info: false, rasc: {}, chegou: 0, dig: null, rap: false, bot: null, auto: { pix: true, pesquisa: true, fora: true } };

  // ---------- escopo por perfil ----------
  const eu = () => C.eu.nome;
  const escopo = (perfil = C && C.perfil, nome = C && eu()) => perfil === 'vend'
    ? CX.conversas.filter(c => c.resp === nome || (c.st === 'fila' && c.dep === 'Comercial'))
    : CX.conversas;
  const ABAS = [
    ['todas', 'Abertas', c => c.st !== 'resolvida'], ['minhas', 'Minhas', c => c.resp === eu() && c.st !== 'resolvida'],
    ['fila', 'Na fila', c => c.st === 'fila'], ['bot', 'Bot', c => c.st === 'triagem'], ['resolvidas', 'Resolvidas', c => c.st === 'resolvida'],
  ];
  const conv = id => CX.conversas.find(c => c.id === id);
  const norm = t => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  function listaFiltrada() {
    const f = ABAS.find(a => a[0] === ST.aba)[2], q = norm(ST.q);
    return escopo().filter(f).filter(c => !q || norm(c.nome + ' ' + c.prev + ' ' + c.protocolo).includes(q))
      .sort((a, b) => (b.st === 'fila' && b.prio) - (a.st === 'fila' && a.prio) || b.ts - a.ts);
  }

  // ---------- API pública ----------
  window.ChatExpress = {
    montar(ctx) { C = ctx; ST.mob = false; ST.info = false; if (C.perfil === 'vend' && ST.sub === 'rel') ST.sub = 'inbox'; render(); agendaChegadas(); },
    fila: (perfil, nome) => escopo(perfil, nome).filter(c => c.st === 'fila').length,
    resumo: () => ({ fila: CX.conversas.filter(c => c.st === 'fila').length, atend: CX.conversas.filter(c => c.st === 'atendimento').length, bot: CX.conversas.filter(c => c.st === 'triagem').length }),
  };

  // =====================================================================
  // Estrutura
  // =====================================================================
  function render() {
    const subs = [['inbox', 'Caixa de entrada', 'wa'], ['bot', 'Bot e automações', 'bot']].concat(C.perfil === 'vend' ? [] : [['rel', 'Relatórios', 'graf']]);
    C.view.innerHTML = `<div class="cx-top"><div class="tabs cx-subs" role="tablist" aria-label="Áreas do Chat Express">${subs.map(s => `<button type="button" role="tab" data-sub="${s[0]}" aria-selected="${ST.sub === s[0]}">${ic(s[2], 'sm')}${s[1]}</button>`).join('')}</div>
      <div class="cx-top-a"><span class="cx-on"><i></i>${C.esc(eu())} · disponível</span><button class="btn sm" type="button" id="cxSim">${ic('pessoa', 'sm')}Simular cliente chegando</button></div></div><div id="cxCorpo"></div>`;
    $$('[data-sub]').forEach(b => b.addEventListener('click', () => { ST.sub = b.dataset.sub; render(); }));
    $('#cxSim').addEventListener('click', () => chega(true));
    ({ inbox, bot, rel })[ST.sub]();
  }

  // =====================================================================
  // 1. Caixa de entrada
  // =====================================================================
  function inbox() {
    if (!conv(ST.sel) || !escopo().includes(conv(ST.sel))) ST.sel = (listaFiltrada()[0] || escopo()[0] || {}).id;
    $('#cxCorpo').innerHTML = `<div class="cx-kpis" id="cxKpis"></div>
      <div class="card flat cx-box" id="cxBox"><section class="cx-list" aria-label="Lista de conversas">
        <div class="cx-lh"><h2>Conversas</h2><span class="cx-q" id="cxTot"></span></div>
        <div class="cx-busca"><label class="sr" for="cxQ">Buscar conversa</label><input type="search" id="cxQ" placeholder="Buscar por nome, mensagem ou protocolo" autocomplete="off"></div>
        <div class="cx-abas" role="tablist" aria-label="Filtrar conversas" id="cxAbas"></div>
        <ul class="cx-items" id="cxItems"></ul></section>
        <section class="cx-chat" id="cxChat" aria-label="Conversa"></section>
        <aside class="cx-info" id="cxInfo" aria-label="Detalhes do contato"></aside><div class="cx-info-bg" data-a="info"></div></div>`;
    $('#cxQ').value = ST.q;
    $('#cxQ').addEventListener('input', e => { ST.q = e.target.value; pintaLista(); });
    pintaTudo();
  }
  function pintaTudo() { pintaKpis(); pintaLista(); pintaChat(); pintaInfo(); classes(); }
  function classes() { const b = $('#cxBox'); if (!b) return; b.classList.toggle('mob-chat', ST.mob); b.classList.toggle('info-on', ST.info); }

  function pintaKpis() {
    const el = $('#cxKpis'); if (!el) return;
    const l = escopo(), at = l.filter(c => c.st === 'atendimento').length, fi = l.filter(c => c.st === 'fila'), pr = fi.filter(c => c.prio).length;
    const k = [['Em atendimento', at, `${CX.atendentes.filter(a => a.on).length} atendentes disponíveis`, 'wa'], ['Na fila', fi.length, pr ? `${pr} prioritária${pr > 1 ? 's' : ''}` : 'sem prioridade', 'relog'], ['1ª resposta (média)', '1m 42s', '18% mais rápido na semana', 'raio'], ['Satisfação', '94%', 'nota 4,7 de 5 hoje', 'estrela']];
    el.innerHTML = k.map(x => `<article class="card cx-k"><div><span>${x[0]}</span><b class="num">${x[1]}</b><small>${x[2]}</small></div><span class="cx-k-ic">${ic(x[3])}</span></article>`).join('');
  }

  function pintaLista() {
    const ab = $('#cxAbas'); if (!ab) return;
    const base = escopo();
    ab.innerHTML = ABAS.filter(a => !(C.perfil === 'vend' && a[0] === 'bot')).map(a => `<button type="button" role="tab" data-aba="${a[0]}" aria-selected="${ST.aba === a[0]}">${a[1]}<span>${base.filter(a[2]).length}</span></button>`).join('');
    $$('[data-aba]', ab).forEach(b => b.addEventListener('click', () => { ST.aba = b.dataset.aba; pintaLista(); }));
    const l = listaFiltrada();
    $('#cxTot').textContent = l.length;
    $('#cxItems').innerHTML = l.length ? l.map(c => `<li><button type="button" class="cx-it${c.id === ST.sel ? ' on' : ''}${c.prio && c.st === 'fila' ? ' prio' : ''}" data-c="${c.id}" aria-current="${c.id === ST.sel}">${C.av(c.nome, 40)}
      <span class="cx-it-b"><span class="cx-it-h"><b>${C.esc(c.nome)}</b><time>${c.h}</time></span><span class="cx-it-p">${ST.dig === c.id ? '<em>digitando…</em>' : C.esc(c.prev)}</span>
      <span class="cx-it-f"><span class="cx-canal">${ic(c.canal === 'site' ? 'site' : 'wa', 'xs')}${C.esc(c.dep)}</span>${c.st === 'fila' && c.prio ? '<span class="pill cr">Prioridade</span>' : `<span class="pill ${COR_ST[c.st]}">${NOME_ST[c.st]}</span>`}${c.nl ? `<span class="cx-nl" aria-label="${c.nl} não lidas">${c.nl}</span>` : ''}</span></span></button></li>`).join('')
      : `<li class="cx-vazio">${ic('wa')}<b>Nada por aqui</b><span>Nenhuma conversa nesta aba${ST.q ? ' com essa busca' : ''}.</span></li>`;
    $$('[data-c]', $('#cxItems')).forEach(b => b.addEventListener('click', () => abrir(b.dataset.c)));
  }

  function abrir(id) {
    salvaRascunho(); ST.sel = id; ST.mob = true; ST.rap = false;
    const c = conv(id); if (c) c.nl = 0;
    pintaLista(); pintaChat(); pintaInfo(); classes(); C.atualiza();
    const t = $('#cxTxt'); if (t && innerWidth >= 760) t.focus({ preventScroll: true });
  }
  const salvaRascunho = () => { const t = $('#cxTxt'); if (t && ST.sel) ST.rasc[ST.sel] = t.value; };

  // ---------- mensagens ----------
  function msgHtml(m, c) {
    if (m.t === 'sis') return `<div class="cx-sis">${ic('ok', 'xs')}${C.esc(m.txt)} · ${m.h}</div>`;
    if (m.t === 'nota') return `<div class="cx-nota"><span>${ic('nota', 'xs')}Nota interna · ${C.esc(m.autor)}</span><p>${quebra(m.txt)}</p><time>${m.h}</time></div>`;
    const sai = m.t === 'out', bot = m.t === 'bot';
    const corpo = m.anexo ? `<span class="cx-anexo">${ic('clip', 'sm')}<span><b>${C.esc(m.anexo)}</b><small>PDF · 240 KB · demonstração</small></span></span>` : quebra(m.txt);
    return `<div class="cx-m ${sai ? 'sai' : 'ent'}${bot ? ' bot' : ''}">${sai ? '' : bot ? `<span class="cx-bot-av" aria-hidden="true">${ic('bot', 'sm')}</span>` : C.av(c.nome, 28)}<div class="cx-b">${bot ? '<span class="cx-quem">Assistente virtual</span>' : sai && m.autor ? `<span class="cx-quem">${C.esc(m.autor)}</span>` : ''}<p>${corpo}</p><time>${m.h}${sai ? ' ✓✓' : ''}</time></div></div>`;
  }
  function pintaChat() {
    const el = $('#cxChat'); if (!el) return;
    const c = conv(ST.sel);
    if (!c) { el.innerHTML = `<div class="cx-vazio grande">${ic('wa')}<b>Escolha uma conversa</b><span>As mensagens do WhatsApp e do chat do site aparecem aqui.</span></div>`; return; }
    const aberta = c.st !== 'resolvida', livre = c.st === 'fila' || c.st === 'triagem';
    el.innerHTML = `<header class="cx-ch"><button type="button" class="cx-voltar" data-a="voltar" aria-label="Voltar para a lista">${ic('voltar')}</button>${C.av(c.nome, 40)}
      <div class="cx-ch-t"><b>${C.esc(c.nome)}</b><span>${ic(c.canal === 'site' ? 'site' : 'wa', 'xs')}${CANAL[c.canal]}<span class="pill ${COR_ST[c.st]}">${NOME_ST[c.st]}</span></span></div>
      <div class="cx-ch-a">${livre ? `<button class="btn sm pri" type="button" data-a="assumir">${ic('pessoa', 'sm')}Assumir</button>` : ''}${aberta ? `<button class="btn sm" type="button" data-a="transferir">${ic('transf', 'sm')}<span class="cx-tl">Transferir</span></button><button class="btn sm cx-ok" type="button" data-a="resolver">${ic('ok', 'sm')}<span class="cx-tl">Resolver</span></button>` : `<button class="btn sm" type="button" data-a="reabrir">Reabrir</button>`}<button class="btn sm ghost cx-infob" type="button" data-a="info" aria-label="Detalhes do contato">${ic('info', 'sm')}</button></div></header>
      <div class="cx-log" id="cxLog" role="log" aria-live="polite" aria-label="Mensagens com ${C.esc(c.nome)}">${c.msgs.map(m => msgHtml(m, c)).join('')}${ST.dig === c.id ? `<div class="cx-dig"><span><i></i><i></i><i></i></span>${C.esc(prim(c.nome))} está digitando…</div>` : ''}</div>
      ${aberta ? `<div class="cx-ia">${ic('ia', 'sm')}<span>Ajude ${C.esc(prim(c.nome))} a dar o próximo passo</span><button type="button" data-a="ia">Sugerir resposta</button></div>
      <form class="cx-comp${ST.modo === 'nota' ? ' nota' : ''}" id="cxForm"><div class="cx-modos" role="group" aria-label="Tipo de mensagem"><button type="button" data-modo="resp" aria-pressed="${ST.modo === 'resp'}">Responder</button><button type="button" data-modo="nota" aria-pressed="${ST.modo === 'nota'}">${ic('nota', 'xs')}Nota interna${c.notas ? ' · ' + c.notas : ''}</button></div>
        <label class="sr" for="cxTxt">${ST.modo === 'nota' ? 'Nota interna (só a equipe vê)' : 'Mensagem para ' + C.esc(c.nome)}</label><textarea id="cxTxt" rows="2" placeholder="${ST.modo === 'nota' ? 'Escreva uma nota que só a equipe vê…' : 'Escreva sua mensagem…'}"></textarea>
        <div class="cx-rap" id="cxRap"${ST.rap ? '' : ' hidden'}>${CX.respostas.map((r, i) => `<button type="button" data-r="${i}"><b>/${r.k}</b><span>${C.esc(r.t)}</span></button>`).join('')}</div>
        <div class="cx-comp-f"><button type="button" class="cx-ib" data-a="rapidas" aria-expanded="${ST.rap}" aria-controls="cxRap">${ic('raio', 'sm')}<span>Respostas rápidas</span></button><button type="button" class="cx-ib" data-a="anexo" aria-label="Anexar arquivo">${ic('clip', 'sm')}</button><span class="cx-dica">Enter envia · Shift+Enter quebra linha · digite / para atalhos</span><button class="btn pri sm" type="submit">${ST.modo === 'nota' ? 'Salvar nota' : 'Enviar'}${ic('env', 'sm')}</button></div></form>`
      : `<div class="cx-fim">${ic('ok')}<span>Atendimento encerrado. Reabra a conversa para responder.</span></div>`}`;
    const log = $('#cxLog'); log.scrollTop = log.scrollHeight;
    $$('[data-a]', el).forEach(b => b.addEventListener('click', () => acao(b.dataset.a)));
    const f = $('#cxForm'); if (!f) return;
    const t = $('#cxTxt'); t.value = ST.rasc[c.id] || '';
    $$('[data-modo]', f).forEach(b => b.addEventListener('click', () => { salvaRascunho(); ST.modo = b.dataset.modo; pintaChat(); $('#cxTxt').focus(); }));
    $$('[data-r]', f).forEach(b => b.addEventListener('click', () => { const r = CX.respostas[b.dataset.r]; t.value = r.txt.replace('{nome}', prim(c.nome)); ST.rap = false; $('#cxRap').hidden = true; t.focus(); }));
    t.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); f.requestSubmit(); } });
    t.addEventListener('input', () => { const m = t.value.match(/^\/(\w+)$/); if (m) { const r = CX.respostas.find(x => x.k === m[1]); if (r) { t.value = r.txt.replace('{nome}', prim(c.nome)); C.toast('Atalho /' + r.k + ' aplicado'); } } });
    f.addEventListener('submit', e => { e.preventDefault(); envia(c, t.value); });
  }

  function pintaInfo() {
    const el = $('#cxInfo'); if (!el) return;
    const c = conv(ST.sel); if (!c) { el.innerHTML = ''; return; }
    const v = c.venda ? D.vendas.find(x => x.id === c.venda) : null, vd = v ? D.vendedores.find(x => x.id === v.vend) : null;
    const espera = c.st === 'fila' ? Math.max(1, relogio - c.ts) + ' min na fila' : '';
    const ctx = v ? `<div class="cx-ctx-c"><div class="cx-ctx-h"><b>${C.esc(v.id)}</b><span class="pill ${({ Instalada: 'ok', Agendada: 'info', Pendente: 'at', Cancelada: 'cr' })[v.status]}">${C.esc(v.status)}</span></div><dl><dt>Plano</dt><dd>${C.esc(v.produto)}</dd><dt>Mensalidade</dt><dd class="num">${v.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</dd><dt>Vendedor</dt><dd>${C.esc(vd.nome)}</dd><dt>Venda em</dt><dd>${String(v.d).padStart(2, '0')}/11/2026</dd></dl>${C.abreVenda ? `<button class="btn sm" type="button" data-a="venda">Abrir a venda</button>` : ''}</div>`
      : c.oport ? `<div class="cx-ctx-c"><b>Oportunidade ${C.esc(c.oport)} criada</b><p class="muted">Está na etapa "Novo" do Funil, com ${C.esc(c.plano)}.</p>${C.temFunil ? '<a class="btn sm" href="#/funil">Ver no Funil</a>' : ''}</div>`
        : `<div class="cx-ctx-c"><b>Ainda não é cliente</b><p class="muted">Interesse: ${C.esc(c.plano || 'a definir')}${c.cidade ? ' · ' + C.esc(c.cidade) + '/' + c.uf : ''}.</p>${C.novaOportunidade && c.dep === 'Comercial' ? `<button class="btn sm pri" type="button" data-a="oport">Criar oportunidade no Funil</button>` : ''}</div>`;
    el.innerHTML = `<button type="button" class="cx-info-x" data-a="info" aria-label="Fechar detalhes">✕</button><div class="cx-info-h">${C.av(c.nome, 60)}<b>${C.esc(c.nome)}</b><span class="pill ${c.tag === 'Cliente' ? 'ok' : c.tag === 'Prioridade' ? 'cr' : ''}">${C.esc(c.tag)}</span></div>
      <section><h3>${ic('pessoa', 'xs')}Contato</h3><dl><dt>Telefone</dt><dd class="num">${C.esc(c.tel)}</dd><dt>E-mail</dt><dd>${C.esc(c.email)}</dd><dt>Cidade</dt><dd>${c.cidade ? C.esc(c.cidade) + '/' + c.uf : '—'}</dd><dt>Canal</dt><dd>${CANAL[c.canal]}</dd></dl></section>
      <section><h3>${ic('wa', 'xs')}Atendimento</h3><dl><dt>Status</dt><dd><span class="pill ${COR_ST[c.st]}">${NOME_ST[c.st]}</span></dd><dt>Responsável</dt><dd>${c.resp ? C.esc(c.resp) : '<span class="muted">Ninguém ainda</span>'}</dd><dt>Departamento</dt><dd>${C.esc(c.dep)}</dd><dt>Protocolo</dt><dd class="num">${c.protocolo}</dd>${espera ? `<dt>Espera</dt><dd>${espera}</dd>` : ''}</dl></section>
      <section><h3>${ic('graf', 'xs')}Na Norte Conecta</h3>${ctx}</section>`;
    $$('[data-a]', el).forEach(b => b.addEventListener('click', () => acao(b.dataset.a)));
  }

  // ---------- ações ----------
  function sis(c, txt) { c.msgs.push({ t: 'sis', txt, h: agora() }); }
  function toque(c) { c.ts = relogio; c.h = hm(relogio); }
  function assumir(c, silencio) {
    c.resp = eu(); c.st = 'atendimento'; c.nl = 0; sis(c, eu() + ' assumiu o atendimento'); toque(c);
    if (!silencio) C.toast('Você assumiu a conversa com ' + c.nome);
  }
  function atualiza() { pintaKpis(); pintaLista(); pintaChat(); pintaInfo(); classes(); C.atualiza(); }
  function acao(a) {
    const c = conv(ST.sel);
    if (a === 'voltar') { salvaRascunho(); ST.mob = false; classes(); return; }
    if (a === 'info') { ST.info = !ST.info; classes(); return; }
    if (!c) return;
    if (a === 'assumir') { assumir(c); atualiza(); }
    else if (a === 'reabrir') { c.st = 'atendimento'; c.resp = eu(); sis(c, 'Conversa reaberta por ' + eu()); toque(c); atualiza(); }
    else if (a === 'transferir') transferir(c);
    else if (a === 'resolver') resolver(c);
    else if (a === 'rapidas') { ST.rap = !ST.rap; $('#cxRap').hidden = !ST.rap; $('[data-a="rapidas"]').setAttribute('aria-expanded', ST.rap); }
    else if (a === 'anexo') { if (!c.resp) assumir(c, true); c.msgs.push({ t: 'out', autor: eu(), anexo: 'planos-norte-conecta-novembro.pdf', h: agora() }); c.prev = 'Você enviou um arquivo'; toque(c); atualiza(); C.toast('Arquivo enviado (simulação)'); }
    else if (a === 'ia') { const t = $('#cxTxt'); ST.modo = 'resp'; ST.rasc[c.id] = sugestao(c); pintaChat(); $('#cxTxt').focus(); C.toast('Sugestão pronta. Revise antes de enviar.'); void t; }
    else if (a === 'venda') C.abreVenda(c.venda);
    else if (a === 'oport') { c.oport = C.novaOportunidade({ cliente: c.nome, produto: c.plano, cidade: c.cidade, uf: c.uf }); sis(c, 'Oportunidade ' + c.oport + ' criada no Funil por ' + eu()); pintaChat(); pintaInfo(); }
  }

  function envia(c, texto) {
    const t = texto.trim(); if (!t) { C.toast('Escreva uma mensagem antes de enviar'); return; }
    ST.rasc[c.id] = ''; ST.rap = false;
    if (ST.modo === 'nota') { c.msgs.push({ t: 'nota', autor: eu(), txt: t, h: agora() }); c.notas++; atualiza(); C.toast('Nota salva. Só a equipe vê.'); return; }
    if (c.resp !== eu() && (!c.resp || c.st !== 'atendimento')) assumir(c, true);
    c.msgs.push({ t: 'out', autor: eu(), txt: t, h: agora() }); c.prev = 'Você: ' + t; c.st = 'aguardando'; toque(c);
    atualiza(); $('#cxTxt') && $('#cxTxt').focus();
    respondeCliente(c, t);
  }
  // o cliente responde sozinho, para a demonstração ficar viva
  function respondeCliente(c, t) {
    const n = norm(t);
    const r = /cep|endereco|bairro|cobertura/.test(n) ? 'CEP 72' + String(100 + c.tel.length * 13).slice(0, 3) + '-410, número 120.'
      : /manha|tarde|periodo|instala/.test(n) ? 'De manhã fica melhor pra mim. Obrigada!'
        : /reinici|tomada|desliga/.test(n) ? 'Reiniciei aqui e voltou! Valeu pela ajuda. 🙌'
          : /pix|segunda via|fatura|boleto/.test(n) ? 'Recebi aqui, vou pagar hoje mesmo.'
            : /plano|mega|giga|r\$/.test(n) ? 'Gostei do de 500 Mega. Como faço para contratar?'
              : /obrigad|otimo dia/.test(n) ? 'Eu que agradeço! 😊' : 'Certo, combinado! 👍';
    setTimeout(() => { ST.dig = c.id; redesenhaSeVisivel(c); }, 900);
    setTimeout(() => {
      if (ST.dig === c.id) ST.dig = null;
      c.msgs.push({ t: 'in', txt: r, h: agora() }); c.prev = r; c.st = c.st === 'resolvida' ? c.st : 'atendimento'; toque(c);
      const vendo = $('#cxLog') && ST.sel === c.id && (innerWidth >= 760 || ST.mob);
      if (!vendo) c.nl++;
      if ($('#cxBox')) atualiza(); else C.atualiza();
    }, 2600);
  }
  function redesenhaSeVisivel(c) {
    if (!$('#cxBox')) return;
    const t = $('#cxTxt'), txt = t ? t.value : null, foco = document.activeElement === t;
    pintaLista(); if (ST.sel === c.id) { if (t) ST.rasc[c.id] = txt; pintaChat(); if (foco && $('#cxTxt')) $('#cxTxt').focus(); }
  }
  function sugestao(c) {
    const ult = [...c.msgs].reverse().find(m => m.t === 'in'), n = norm(ult ? ult.txt : ''), p = prim(c.nome);
    if (/disponib|bairro|endereco|setor|atendem|tem fibra/.test(n)) return `Claro, ${p}! Me passa o seu CEP e o número do imóvel que eu confiro a cobertura da fibra agora. 😊`;
    if (/oscil|sem conex|caiu|lent|wi-?fi|sinal|senha/.test(n)) return `Sinto muito pelo transtorno, ${p}. Já estou olhando a sua conexão por aqui. Pode desligar o roteador da tomada por 30 segundos e ligar de novo?`;
    if (/segunda via|fatura|vencimento|pix|paguei|boleto/.test(n)) return `Posso ajudar, ${p}! Vou conferir a sua fatura e já te mando o código Pix atualizado por aqui.`;
    if (/plano|maior|upgrade|mega|giga|combo|empresarial/.test(n)) return `Temos a Fibra 500 Mega por R$ 109,90 e a 1 Giga por R$ 149,90, sem fidelidade. Quer que eu simule a troca no seu endereço, ${p}?`;
    if (/instala|agendar/.test(n)) return `Perfeito, ${p}! Para a instalação tenho manhã (8h às 12h) ou tarde (13h às 18h). Qual fica melhor?`;
    return `Oi, ${p}! Obrigado pela mensagem. Já estou verificando e te retorno em instantes.`;
  }

  function transferir(c) {
    const ops = CX.departamentos.map(d => ['dep:' + d, d, 'Vai para a fila do departamento']).concat(CX.atendentes.filter(a => a.nome !== eu()).map(a => ['pes:' + a.nome, a.nome, a.papel + ' · ' + a.dep + (a.on ? '' : ' · ausente'), !a.on]));
    C.abre(C.modal, `<button class="x dk" type="button" data-close aria-label="Fechar">✕</button><h2 id="modalTitulo" style="font-size:19px;padding-right:44px">Transferir conversa</h2><p class="muted" style="margin:4px 0 16px">${C.esc(c.nome)} · ${C.esc(c.protocolo)}</p>
      <fieldset class="cx-ops"><legend class="sr">Para onde transferir</legend>${ops.map((o, i) => `<label class="${o[3] ? 'off' : ''}"><input type="radio" name="tr" value="${C.esc(o[0])}" ${i === 0 ? 'checked' : ''} ${o[3] ? 'disabled' : ''}><span><b>${C.esc(o[1])}</b><small>${C.esc(o[2])}</small></span></label>`).join('')}</fieldset>
      <label class="cx-lb" for="trNota">Nota para quem recebe (opcional)</label><textarea id="trNota" rows="2" class="cx-ta" placeholder="Ex.: cliente quer instalação ainda esta semana"></textarea>
      <div class="cx-mf"><button class="btn" type="button" data-close>Cancelar</button><button class="btn pri" type="button" id="trOk">Transferir</button></div>`);
    $('#trOk').addEventListener('click', () => {
      const v = $('input[name="tr"]:checked').value, [tipo, alvo] = [v.slice(0, 3), v.slice(4)], nota = $('#trNota').value.trim();
      if (tipo === 'dep') { c.dep = alvo; c.resp = null; c.st = 'fila'; } else { const a = CX.atendentes.find(x => x.nome === alvo); c.resp = alvo; c.dep = a.dep; c.st = 'atendimento'; }
      sis(c, `Transferida para ${alvo} por ${eu()}`); if (nota) { c.msgs.push({ t: 'nota', autor: eu(), txt: nota, h: agora() }); c.notas++; }
      toque(c); C.fecha(); atualiza(); C.toast('Conversa transferida para ' + alvo);
    });
  }
  function resolver(c) {
    C.abre(C.modal, `<button class="x dk" type="button" data-close aria-label="Fechar">✕</button><h2 id="modalTitulo" style="font-size:19px;padding-right:44px">Resolver atendimento</h2><p class="muted" style="margin:4px 0 16px">${C.esc(c.nome)} · ${C.esc(c.protocolo)}</p>
      <label class="cx-lb" for="rsM">Como terminou?</label><select id="rsM" class="cx-sel">${['Dúvida esclarecida', 'Venda realizada', 'Problema técnico resolvido', 'Fatura enviada', 'Cliente não respondeu'].map(x => `<option>${x}</option>`).join('')}</select>
      <label class="sw" style="margin-top:14px"><input type="checkbox" id="rsP" ${ST.auto.pesquisa ? 'checked' : ''}> Enviar pesquisa de satisfação ao cliente</label>
      <div class="cx-mf"><button class="btn" type="button" data-close>Cancelar</button><button class="btn pri" type="button" id="rsOk">Resolver</button></div>`);
    $('#rsOk').addEventListener('click', () => {
      const m = $('#rsM').value, p = $('#rsP').checked;
      c.st = 'resolvida'; if (!c.resp) c.resp = eu(); sis(c, `Atendimento encerrado por ${eu()} · ${m}`);
      if (p) { c.msgs.push({ t: 'bot', txt: 'Como você avalia este atendimento? Responda de 1 a 5. ⭐', h: agora() }); setTimeout(() => { c.msgs.push({ t: 'in', txt: '5! Atendimento nota 10. 😊', h: agora() }); c.prev = 'Avaliou com nota 5'; if ($('#cxBox')) atualiza(); }, 2200); }
      c.prev = 'Atendimento resolvido'; toque(c); C.fecha(); atualiza(); C.toast('Atendimento resolvido' + (p ? ' · pesquisa enviada' : ''));
    });
  }

  // ---------- novos clientes chegando ----------
  function chega(manual) {
    const k = CX.chegando[ST.chegou % CX.chegando.length], seq = ST.chegou++;
    const nome = k[0] + (seq >= CX.chegando.length ? ' ' + (Math.floor(seq / CX.chegando.length) + 1) : '');
    const h = agora(), c = { id: 'cxn' + seq, nome, canal: k[1], dep: k[2], st: 'triagem', prev: k[3], h, ts: relogio, resp: null, plano: k[2] === 'Comercial' ? 'A definir' : '', cidade: k[4], uf: k[5], tag: 'Novo contato', nl: 1, prio: /caiu|loja/.test(k[3]), venda: null, tel: '(61) 90000-' + String(2200 + seq * 11).padStart(4, '0'), email: 'novo' + (seq + 1) + '@exemplo.invalid', protocolo: 'NC-1811-' + String(400 + seq).padStart(4, '0'), notas: 0 };
    c.msgs = [{ t: 'sis', txt: 'Conversa iniciada pelo ' + CANAL[c.canal], h }, { t: 'in', txt: k[3], h }, { t: 'bot', txt: `Olá, ${prim(nome)}! Sou a assistente virtual da Norte Conecta. Já vou te direcionar. 😊`, h }];
    CX.conversas.push(c);
    C.toast(`Nova conversa no ${CANAL[c.canal]}: ${nome}`);
    if ($('#cxBox')) atualiza(); else C.atualiza();
    setTimeout(() => {
      c.st = 'fila'; c.msgs.push({ t: 'bot', txt: 'Encaminhei para o time de ' + c.dep + '. Em instantes alguém fala com você.', h: agora() }); sis(c, 'Assistente encaminhou para ' + c.dep + (c.prio ? ' · prioridade' : ''));
      toque(c); if ($('#cxBox')) atualiza(); else C.atualiza();
    }, 3500);
    if (manual && ST.sub !== 'inbox') { ST.sub = 'inbox'; render(); }
  }
  function agendaChegadas() { C.intervalo(() => { if ($('#cxBox') && !document.hidden) chega(false); }, 45000); }

  // =====================================================================
  // 2. Bot e automações
  // =====================================================================
  const MENU = 'Digite o número da opção:\n1. Planos e contratação\n2. Suporte técnico\n3. Fatura e segunda via\n4. Falar com uma pessoa';
  function botResponde(txt) {
    const n = norm(txt);
    if (/^1\b|plano|contrat|mega|giga|combo/.test(n)) return ['Nossos planos de fibra:\n• 300 Mega · R$ 89,90\n• 500 Mega · R$ 109,90\n• 1 Giga · R$ 149,90\n• Combo Fibra + TV · R$ 159,90\nQuer falar com um consultor? Digite 4.'];
    if (/^2\b|lent|caiu|sem internet|suporte|wi-?fi|oscil/.test(n)) return ['Vamos tentar juntos:\n1) Desligue o roteador da tomada por 30 segundos.\n2) Ligue de novo e aguarde 2 minutos.\nSe não resolver, digite 4 que um técnico te atende.'];
    if (/^3\b|boleto|fatura|segunda|pix|financeiro/.test(n)) return ST.auto.pix ? ['Encontrei a sua fatura de novembro (R$ 109,90, vence 20/11).\nCódigo Pix (demonstração): 00020126NORTECONECTA5204000053039865406109.90', 'Precisa de mais alguma coisa? Digite 4 para falar com o financeiro.'] : ['Vou te passar para o financeiro. Digite 4 para confirmar.'];
    if (/^4\b|atendente|humano|pessoa|falar com/.test(n)) return ['#fila'];
    if (/^(oi|ola|bom dia|boa tarde|boa noite|menu)/.test(n)) return ['Olá! Sou a assistente virtual da Norte Conecta. 😊', MENU];
    return ['Não entendi muito bem. 😅', MENU];
  }
  function bot() {
    if (!ST.bot) ST.bot = [{ de: 'bot', txt: 'Olá! Sou a assistente virtual da Norte Conecta. 😊' }, { de: 'bot', txt: MENU }];
    const tg = (k, t, d) => `<label class="cx-tg"><input type="checkbox" data-auto="${k}" ${ST.auto[k] ? 'checked' : ''}><span><b>${t}</b><small>${d}</small></span></label>`;
    const passo = (n, t, d, extra = '') => `<li><span class="cx-pn">${n}</span><div><b>${t}</b><p>${d}</p>${extra}</div></li>`;
    $('#cxCorpo').innerHTML = `<div class="cx-bot-g"><article class="card"><div class="card-h"><div><h2>Fluxo do assistente virtual</h2><p>O que o bot faz antes de passar a conversa para uma pessoa</p></div><span class="pill ok">Publicado</span></div>
      <ol class="cx-fluxo">${passo(1, 'Boas-vindas', 'Cumprimenta pelo nome e se apresenta como assistente da Norte Conecta.')}${passo(2, 'Menu de opções', 'Planos (Comercial) · Suporte técnico · Fatura (Financeiro) · Falar com uma pessoa.', '<div class="cx-chips"><span>1 · Comercial</span><span>2 · Suporte</span><span>3 · Financeiro</span><span>4 · Atendente</span></div>')}${passo(3, 'Resolve sozinho o que é simples', 'Tabela de planos, passo a passo de reinício do roteador e segunda via por Pix.')}${passo(4, 'Encaminha para a fila certa', 'Com o departamento e a prioridade já definidos. Quem atende vê todo o histórico.')}</ol>
      <h3 class="cx-h3">Automações</h3><div class="cx-tgs">${tg('pix', 'Segunda via automática por Pix', 'O bot envia o código da fatura em aberto sem precisar de atendente.')}${tg('pesquisa', 'Pesquisa de satisfação ao encerrar', 'Nota de 1 a 5 enviada quando o atendimento é resolvido.')}${tg('fora', 'Mensagem fora do horário', 'Seg. a sex. das 8h às 18h e sáb. das 8h às 12h. Fora disso, o bot avisa e guarda a conversa.')}</div>
      <div class="cx-bot-n"><div><b class="num">${CX.relatorio.bot.resolvidas}</b><span>resolvidas só pelo bot hoje</span></div><div><b class="num">${Math.round(CX.relatorio.bot.resolvidas / CX.relatorio.bot.total * 100)}%</b><span>dos atendimentos do dia</span></div></div></article>
      <article class="card cx-fone-c"><div class="card-h"><div><h2>Teste o bot</h2><p>Converse como se fosse um cliente no WhatsApp</p></div><button class="btn sm ghost" type="button" id="btR">Recomeçar</button></div>
      <div class="cx-fone"><div class="cx-fone-h">${ic('bot', 'sm')}<span><b>Norte Conecta</b><small>assistente virtual · simulação</small></span></div><div class="cx-fone-l" id="btLog" role="log" aria-live="polite"></div>
      <form class="cx-fone-f" id="btF"><label class="sr" for="btT">Mensagem para o bot</label><input id="btT" autocomplete="off" placeholder="Digite 1, 2, 3, 4 ou uma pergunta"><button class="btn pri sm" type="submit" aria-label="Enviar">${ic('env', 'sm')}</button></form></div>
      <div class="cx-chips cx-sug">${['1', 'Minha internet caiu', 'Quero a segunda via', '4'].map(s => `<button type="button" data-bt="${C.esc(s)}">${C.esc(s)}</button>`).join('')}</div></article></div>`;
    const pinta = () => { const l = $('#btLog'); l.innerHTML = ST.bot.map(m => `<div class="cx-m ${m.de === 'eu' ? 'sai' : 'ent bot'}"><div class="cx-b"><p>${quebra(m.txt)}</p></div></div>`).join(''); l.scrollTop = l.scrollHeight; };
    const manda = txt => {
      txt = txt.trim(); if (!txt) return; ST.bot.push({ de: 'eu', txt }); pinta();
      setTimeout(() => {
        botResponde(txt).forEach(r => { if (r === '#fila') criaDoBot(); else ST.bot.push({ de: 'bot', txt: r }); });
        if ($('#btLog')) pinta();
      }, 600);
    };
    pinta();
    $('#btF').addEventListener('submit', e => { e.preventDefault(); manda($('#btT').value); $('#btT').value = ''; });
    $$('[data-bt]').forEach(b => b.addEventListener('click', () => manda(b.dataset.bt)));
    $('#btR').addEventListener('click', () => { ST.bot = null; bot(); });
    $$('[data-auto]').forEach(i => i.addEventListener('change', () => { ST.auto[i.dataset.auto] = i.checked; C.toast((i.checked ? 'Ativada: ' : 'Desativada: ') + i.closest('label').querySelector('b').textContent); }));
  }
  function criaDoBot() {
    const seq = ST.chegou++, h = agora(), hist = ST.bot.filter(m => m.de === 'eu').map(m => m.txt);
    const ult = hist.filter(t => !/^\d$/.test(t.trim())).pop() || 'Quero falar com uma pessoa.';
    const dep = /fatura|segunda|pix|boleto/.test(norm(hist.join(' '))) ? 'Financeiro' : /caiu|internet|wi|lent/.test(norm(hist.join(' '))) ? 'Suporte técnico' : 'Comercial';
    const c = { id: 'cxb' + seq, nome: 'Cliente de teste ' + (seq + 1), canal: 'whatsapp', dep, st: 'fila', prev: ult, h, ts: relogio, resp: null, plano: 'A definir', cidade: 'Brasília', uf: 'DF', tag: 'Teste do bot', nl: 1, prio: false, venda: null, tel: '(61) 90000-' + String(3300 + seq).padStart(4, '0'), email: 'teste' + (seq + 1) + '@exemplo.invalid', protocolo: 'NC-1811-' + String(500 + seq).padStart(4, '0'), notas: 0 };
    c.msgs = [{ t: 'sis', txt: 'Conversa iniciada pelo WhatsApp (teste do bot)', h }].concat(ST.bot.map(m => ({ t: m.de === 'eu' ? 'in' : 'bot', txt: m.txt, h })), [{ t: 'sis', txt: 'Assistente encaminhou para ' + dep, h }]);
    CX.conversas.push(c); ST.bot.push({ de: 'bot', txt: 'Certo! Já te passei para um atendente. Você é o próximo da fila. 😊' });
    C.atualiza(); C.toast('A conversa de teste entrou na fila de ' + dep + ' na Caixa de entrada');
  }

  // =====================================================================
  // 3. Relatórios
  // =====================================================================
  function rel() {
    const R = CX.relatorio, mx = Math.max(...R.horas.map(h => h[1])), tot = R.bot.total;
    const k = [['Atendimentos hoje', tot, '+12% vs. terça passada'], ['1ª resposta (média)', '1m 42s', 'meta: até 3 min'], ['Tempo médio de atendimento', '9m 50s', 'do primeiro contato ao encerramento'], ['Satisfação', '94%', `${Math.round(tot * .62)} avaliações · nota 4,7`], ['Resolvidos pelo bot', Math.round(R.bot.resolvidas / tot * 100) + '%', `${R.bot.resolvidas} sem precisar de atendente`]];
    $('#cxCorpo').innerHTML = `<div class="cx-rk">${k.map(x => `<article class="card cx-k"><div><span>${x[0]}</span><b class="num">${x[1]}</b><small>${x[2]}</small></div></article>`).join('')}</div>
      <div class="grid g-chart"><article class="card"><div class="card-h"><div><h2>Atendimentos por hora</h2><p>Hoje, 18/11 · WhatsApp e chat do site</p></div><button class="btn sm" type="button" id="rlCsv">${ic('baixar', 'sm')}Exportar CSV</button></div>
        <div class="cx-barras" role="img" aria-label="Atendimentos por hora: ${R.horas.map(h => h[0] + ' ' + h[1]).join(', ')}">${R.horas.map(h => `<div><b class="num">${h[1]}</b><i style="--h:${Math.round(h[1] / mx * 100)}%"></i><span>${h[0]}</span></div>`).join('')}</div></article>
      <article class="card"><div class="card-h"><div><h2>Canais</h2><p>De onde vêm as conversas</p></div></div><div class="cx-canais"><div><span>${ic('wa', 'sm')}WhatsApp</span><div class="bar"><i style="--w:72%"></i></div><b class="num">72%</b></div><div><span>${ic('site', 'sm')}Chat do site</span><div class="bar"><i style="--w:28%"></i></div><b class="num">28%</b></div></div>
        <div class="cx-bot-n" style="margin-top:22px"><div><b class="num">${R.bot.encaminhadas}</b><span>encaminhadas pelo bot para pessoas</span></div><div><b class="num">${R.bot.resolvidas}</b><span>resolvidas pelo bot</span></div></div></article></div>
      <div class="grid g2"><article class="card flat"><div class="card-h" style="padding:20px 22px 0"><div><h2>Por departamento</h2><p>Volume e tempos do dia</p></div></div><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Departamento</th><th class="r">Atendimentos</th><th class="r">1ª resposta</th><th class="r">Duração</th><th class="r">Satisfação</th></tr></thead><tbody>${R.deps.map(d => `<tr><td><b>${d[0]}</b></td><td class="r num">${d[1]}</td><td class="r num">${d[2]}</td><td class="r num">${d[3]}</td><td class="r"><span class="pill ${d[4] >= 95 ? 'ok' : ''}">${d[4]}%</span></td></tr>`).join('')}</tbody></table></div></article>
      <article class="card flat"><div class="card-h" style="padding:20px 22px 0"><div><h2>Atendentes</h2><p>Quem atendeu hoje</p></div></div><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Atendente</th><th class="r">Atendimentos</th><th class="r">1ª resposta</th><th class="r">Satisfação</th></tr></thead><tbody>${R.ranking.map(r => `<tr><td><span class="pessoa" style="font-weight:600">${C.av(r[0], 28)}${C.esc(r[0])}</span></td><td class="r num">${r[1]}</td><td class="r num">${r[2]}</td><td class="r"><span class="pill ${r[3] >= 95 ? 'ok' : ''}">${r[3]}%</span></td></tr>`).join('')}</tbody></table></div></article></div>`;
    $('#rlCsv').addEventListener('click', () => {
      const linhas = ['Hora;Atendimentos', ...R.horas.map(h => h.join(';')), '', 'Departamento;Atendimentos;1a resposta;Duração;Satisfação (%)', ...R.deps.map(d => d.join(';'))];
      const blob = new Blob(['\ufeff' + linhas.join('\r\n') + '\r\n'], { type: 'text/csv;charset=utf-8' }), url = URL.createObjectURL(blob), a = document.createElement('a');
      a.href = url; a.download = 'chat-express-relatorio-2026-11-18.csv'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1500);
      C.toast('Relatório do Chat Express baixado');
    });
  }
})();
