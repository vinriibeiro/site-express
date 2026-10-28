// Jandaia OS · protótipo navegável. Roteamento por hash, perfis de acesso, cobrança com histórico e auditoria persistidos no navegador.
(function(){
  const G = window.GN, $ = s => document.querySelector(s), view = $('#view');
  const brl = v => v.toLocaleString('pt-BR', { style:'currency', currency:'BRL', maximumFractionDigits: v >= 1000 ? 0 : 2 });
  const n = v => v.toLocaleString('pt-BR');
  const dt = s => new Date(s).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit' });
  const dth = s => new Date(s).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' });
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]);
  const pessoa = id => id === 'dir' ? 'Diretoria' : (G.equipe.find(e => e.id === id) || {}).nome || id;
  const primeiro = id => pessoa(id).split(' ')[0];

  // Persistência local (no sistema real: PostgreSQL com histórico imutável)
  const store = {
    get(k, d){ try { const v = localStorage.getItem('jdos:' + k); return v ? JSON.parse(v) : d; } catch(e){ return d; } },
    set(k, v){ try { localStorage.setItem('jdos:' + k, JSON.stringify(v)); } catch(e){} }
  };
  const extras = store.get('tentativas', {});
  Object.entries(extras).forEach(([cid, list]) => {
    const c = G.cobrancas.find(x => x.id === cid); if (!c) return;
    list.forEach(t => { if (!c.tentativas.some(x => x.id === t.id)) c.tentativas.push(t); });
    const ult = c.tentativas[c.tentativas.length - 1]; if (ult) { c.status = ult.resultado; c.proxima = ult.proxima || c.proxima; }
  });
  const auditoria = store.get('auditoria', [
    { quando:'2026-10-26T16:12:00', por:'Renata Cruz', acao:'Corrigiu observação de tentativa', alvo:'C10251', antes:'Cliente vai pagar', depois:'Cliente vai pagar dia 30 via PIX' },
    { quando:'2026-10-26T09:40:00', por:'Sistema', acao:'Escalonou caso sem tratativa há 72h', alvo:'C10230', antes:'', depois:'Supervisora notificada' },
    { quando:'2026-10-25T18:03:00', por:'Daniela Pontes', acao:'Visualizou ficha com dados sensíveis', alvo:'RH · Rodrigo Brito', antes:'', depois:'' },
  ]);
  const audit = (acao, alvo, antes, depois) => { auditoria.unshift({ quando:new Date().toISOString(), por:usuario().nome, acao, alvo, antes:antes||'', depois:depois||'' }); store.set('auditoria', auditoria); };

  // Perfis e o que cada um vê
  const perfis = {
    diretoria:{ nome:'Diretoria', ini:'DI', id:'dir', rotas:'*' },
    cobranca:{ nome:'Patrícia Moura', ini:'PM', id:'u1', rotas:['cobranca','retencao','atend','equipes'] },
    supervisor:{ nome:'Sérgio Vilar', ini:'SV', id:'u10', rotas:['monitor','os','equipes','auto'] },
    rh:{ nome:'Daniela Pontes', ini:'DP', id:'u11', rotas:['rh','equipes','metas'] },
  };
  const embed = /[?&]embed/.test(location.search);
  if (embed) document.documentElement.classList.add('embed');
  let perfil = embed ? 'diretoria' : store.get('perfil', 'diretoria');
  const usuario = () => perfis[perfil];
  const pode = r => usuario().rotas === '*' || usuario().rotas.includes(r);

  const rotas = [
    { g:'Gestão' },
    { id:'visao', t:'Visão Geral', ic:'◧', sub:'O que precisa da sua atenção hoje' },
    { id:'monitor', t:'Central de Monitoramento', ic:'◉', sub:'Rede e incidentes · integrações somente leitura' },
    { g:'Operação' },
    { id:'cobranca', t:'Financeiro e Cobranças', ic:'$', sub:'Tratativa auditável dos clientes em atraso' },
    { id:'retencao', t:'Clientes e Retenção', ic:'↺', sub:'Cancelamentos, motivos e retenção' },
    { id:'atend', t:'Atendimentos', ic:'✉', sub:'Volume, tempo de resposta e pendências' },
    { id:'os', t:'Ordens de Serviço', ic:'⚒', sub:'Abertas, atrasadas e SLA' },
    { g:'Pessoas' },
    { id:'equipes', t:'Equipes e Produtividade', ic:'▦', sub:'Desempenho por função e responsabilidades' },
    { id:'rh', t:'Recursos Humanos', ic:'☺', sub:'Acesso restrito · todo acesso é registrado' },
    { id:'metas', t:'Metas e Bonificações', ic:'★', sub:'Regras transparentes · bônus só com aprovação' },
    { g:'Inteligência' },
    { id:'bi', t:'Relatórios e BI', ic:'▤', sub:'Indicadores e camada de dados para Power BI' },
    { id:'auto', t:'Automações', ic:'⚡', sub:'Regras, alertas e quem recebe cada um' },
    { id:'config', t:'Configurações e Integrações', ic:'⚙', sub:'Conectores, permissões e auditoria' },
  ];

  // ---------- gráficos SVG simples ----------
  function barras(dados, { h = 170, cor = 'var(--marca)', cor2, fmt = v => v, chave2 } = {}){
    const w = 520, pad = 26, max = Math.max(...dados.map(d => Math.max(d.v, d.v2 || 0))) * 1.15, bw = (w - pad * 2) / dados.length;
    let s = `<svg viewBox="0 0 ${w} ${h}" width="100%" role="img">`;
    dados.forEach((d, i) => {
      const x = pad + i * bw, bh = (d.v / max) * (h - 40), b2 = d.v2 != null ? (d.v2 / max) * (h - 40) : 0;
      const ww = d.v2 != null ? bw * .32 : bw * .55;
      s += `<rect x="${x + bw * (d.v2 != null ? .16 : .22)}" y="${h - 22 - bh}" width="${ww}" height="${bh}" rx="3" fill="${cor}"><title>${d.l}: ${fmt(d.v)}</title></rect>`;
      if (d.v2 != null) s += `<rect x="${x + bw * .52}" y="${h - 22 - b2}" width="${ww}" height="${b2}" rx="3" fill="${cor2}"><title>${d.l}: ${fmt(d.v2)}</title></rect>`;
      s += `<text x="${x + bw / 2}" y="${h - 6}" text-anchor="middle">${d.l}</text>`;
      s += `<text x="${x + bw / 2}" y="${h - 27 - Math.max(bh, b2)}" text-anchor="middle" style="fill:var(--tinta2)">${fmt(d.v)}</text>`;
    });
    return s + '</svg>';
  }
  function linha(vals, { h = 140, cor = 'var(--marca)', limite } = {}){
    const w = 520, max = Math.max(...vals, limite || 0) * 1.15, st = w / (vals.length - 1);
    const pts = vals.map((v, i) => `${(i * st).toFixed(1)},${(h - 18 - v / max * (h - 30)).toFixed(1)}`).join(' ');
    let s = `<svg viewBox="0 0 ${w} ${h}" width="100%" role="img" preserveAspectRatio="none">`;
    if (limite) { const y = h - 18 - limite / max * (h - 30); s += `<line x1="0" x2="${w}" y1="${y}" y2="${y}" stroke="var(--cr)" stroke-dasharray="4 4" stroke-width="1"/><text x="${w - 4}" y="${y - 4}" text-anchor="end" style="fill:var(--cr)">limite ${limite} ms</text>`; }
    s += `<polyline points="${pts}" fill="none" stroke="${cor}" stroke-width="2" stroke-linejoin="round"/>`;
    s += `<text x="0" y="${h - 3}">-24h</text><text x="${w}" y="${h - 3}" text-anchor="end">agora</text>`;
    return s + '</svg>';
  }
  function hbarras(dados, { fmt = v => v, cor = 'var(--marca)' } = {}){
    const max = Math.max(...dados.map(d => d.v));
    return dados.map(d => `<div style="margin:7px 0"><div class="row" style="font-size:12.5px"><span>${esc(d.l)}</span><span class="sp"></span><b>${fmt(d.v)}</b></div><div class="meter"><i style="width:${d.v / max * 100}%;background:${d.cor || cor}"></i></div></div>`).join('');
  }
  const tagSt = s => {
    const m = { 'Pagamento confirmado':'t-ok', 'Promessa de pagamento':'t-info', 'Negociação em andamento':'t-info', 'Aguardando retorno':'t-neu', 'Mensagem enviada':'t-neu', 'Não atendeu':'t-at', 'Cliente sem interesse':'t-cr', 'Necessita intervenção':'t-cr', 'Sem tratativa':'t-lar',
      'Revertido':'t-ok', 'Cancelado':'t-cr', 'Pendente':'t-at', 'Concluída':'t-ok', 'Em andamento':'t-info', 'Aberta':'t-neu', 'Atrasada':'t-cr', 'Aguardando validação':'t-at', 'Crítica':'t-cr', 'Alta':'t-at', 'Média':'t-neu', 'Ativo':'t-ok', 'Férias':'t-info', 'Experiência':'t-at' };
    return `<span class="tag ${m[s] || 't-neu'}">${esc(s)}</span>`;
  };
  const kpi = (lb, vl, dt, cls = '') => `<div class="card kpi"><div class="lb">${lb}</div><div class="vl">${vl}</div><div class="dt ${cls}">${dt}</div></div>`;

  // ---------- regras de negócio da cobrança ----------
  const hojeMs = G.hoje.getTime();
  const semTratativa = c => !c.tentativas.length || (hojeMs - new Date(c.tentativas[c.tentativas.length - 1].quando).getTime()) > 72 * 3600000 && !['Pagamento confirmado','Cliente sem interesse'].includes(c.status);
  const promessaVencida = c => c.status === 'Promessa de pagamento' && c.promessa && new Date(c.promessa).getTime() < hojeMs;
  const comprovados = c => c.tentativas.filter(t => t.prova).length;
  function indicadoresCobranca(lista){
    return G.cobradoras.map(u => {
      const meus = lista.filter(c => c.resp === u.id), tent = meus.flatMap(c => c.tentativas);
      const pagos = meus.filter(c => c.status === 'Pagamento confirmado');
      return { u, atrib:meus.length, contatos:tent.length, prov:tent.filter(t => t.prova).length,
        negoc:meus.filter(c => ['Negociação em andamento','Promessa de pagamento','Pagamento confirmado'].includes(c.status)).length,
        recup:pagos.reduce((a, c) => a + c.aberto, 0), taxa: meus.length ? pagos.length / meus.length : 0, sem:meus.filter(semTratativa).length };
    });
  }

  // ---------- telas ----------
  const T = {};

  T.visao = () => {
    const K = G.kpi, sem = G.cobrancas.filter(semTratativa).length, pv = G.cobrancas.filter(promessaVencida).length;
    const osAtr = G.os.filter(o => o.atrasada).length, inc = G.incidentes.filter(i => i.status !== 'Resolvido');
    const churn = (K.cancelMes / K.ativos * 100).toFixed(2).replace('.', ',');
    const emAberto = G.cobrancas.filter(c => c.status !== 'Pagamento confirmado'), atraso = emAberto.reduce((a, c) => a + c.aberto, 0);
    const recuperado = G.cobrancas.filter(c => c.status === 'Pagamento confirmado').reduce((a, c) => a + c.aberto, 0);
    const att = [
      { sev:'cr', t:`OLT-02 (Vila Nova) fora do ar há 47 min`, p:`412 clientes afetados · 23 chamados abertos desde a queda · responsável: ${primeiro('u10')}`, go:'monitor' },
      { sev:'cr', t:`Cancelamentos em out/26 acima da média: ${K.cancelMes} contra 31 da média de 5 meses`, p:`Instabilidade é o 1º motivo; 38% vêm do Vila Nova. Revisar junto com o incidente acima.`, go:'retencao' },
      { sev:'at', t:`${sem} clientes em atraso sem tratativa há mais de 72h`, p:`Somam ${brl(G.cobrancas.filter(semTratativa).reduce((a, c) => a + c.aberto, 0))} em aberto. ${pv} promessas de pagamento já venceram.`, go:'cobranca' },
      { sev:'at', t:`${osAtr} ordens de serviço atrasadas`, p:`Maior concentração: ${primeiro('u8')} (técnico em período de adaptação).`, go:'os' },
      { sev:'info', t:`Exame ocupacional vencido (1) e férias vencidas (1)`, p:`RH já foi alertado em 20/10. Aparece aqui porque passou de 7 dias sem solução.`, go:'rh' },
    ];
    return `
    <div class="grid g4">
      ${kpi('Clientes ativos', n(K.ativos), `<span class="up">+${K.ativos - K.ativosAnt}</span> no mês · ${K.novos} novos`)}
      ${kpi('Faturamento do mês', brl(K.faturamento), `${Math.round(K.faturamento / K.fatMeta * 100)}% da previsão de ${brl(K.fatMeta)}`)}
      ${kpi('Em atraso', brl(atraso), `${emAberto.filter(c => c.situacao === 'Inadimplente').length} inadimplentes · ${emAberto.filter(c => c.situacao === 'Suspenso').length} suspensos`)}
      ${kpi('Recuperado pela cobrança', brl(recuperado), `${Math.round(recuperado / (atraso + recuperado) * 100)}% do que entrou em cobrança`, 'up')}
    </div>
    <div class="grid g4 sec">
      ${kpi('Cancelamentos no mês', K.cancelMes, `churn de ${churn}% · ${K.pedidosCancel} pedidos pendentes`, 'down')}
      ${kpi('Atendimentos em andamento', K.atendAndamento, `1ª resposta média: ${K.tma}`)}
      ${kpi('Ordens de serviço abertas', G.os.filter(o => o.status !== 'Concluída').length, `<span class="down">${osAtr} atrasadas</span>`)}
      ${kpi('Disponibilidade da rede', K.disponibilidade.toLocaleString('pt-BR') + '%', `${inc.length} incidentes ativos`, inc.length ? 'down' : '')}
    </div>
    <div class="grid g21 sec">
      <div class="card">
        <div class="card-h"><h2>Atenção da Diretoria</h2><span class="muted">${att.length} itens · ordenados por gravidade</span></div>
        ${att.map(a => `<div class="att"><span class="bar sev-${a.sev}"></span><div class="tx"><b>${esc(a.t)}</b><p>${esc(a.p)}</p></div><button class="btn btn-s" data-go="${a.go}">Abrir</button></div>`).join('')}
        <div class="note">Só chega aqui o que exige decisão ou está fora do prazo. Pendências operacionais comuns vão para o supervisor de cada setor.</div>
      </div>
      <div class="card">
        <h2>Faturamento · últimos 6 meses</h2>
        ${barras(['mai','jun','jul','ago','set','out'].map((m, i) => ({ l:m, v:K.fatHist[i] })), { fmt: v => v + 'k' })}
        <h2 style="margin-top:14px">Clientes: entradas × cancelamentos</h2>
        ${barras(G.cancelHist.map((c, i) => ({ l:c.m, v:[82,88,79,91,94,96][i], v2:c.c })), { cor:'var(--marca)', cor2:'var(--laranja)' })}
        <div class="legend"><span><i style="background:var(--marca)"></i>Novos clientes</span><span><i style="background:var(--laranja)"></i>Cancelamentos</span></div>
      </div>
    </div>
    <div class="grid g3 sec">
      <div class="card"><h2>Cobrança por atendente</h2>${hbarras(indicadoresCobranca(G.cobrancas).map(r => ({ l:r.u.nome, v:Math.round(r.taxa * 100) })), { fmt: v => v + '% recuperado' })}<p class="muted">Taxa = clientes com pagamento confirmado ÷ clientes atribuídos.</p></div>
      <div class="card"><h2>Cancelamentos por motivo</h2>${hbarras(porMotivo().slice(0, 5), { cor:'var(--laranja)' })}</div>
      <div class="card"><h2>Qualidade</h2>
        <table><tbody>
          <tr><td>NPS (pesquisa WhatsApp)</td><td class="num"><b>${K.nps}</b></td></tr>
          <tr><td>Tempo médio de resolução</td><td class="num">${K.tmr}</td></tr>
          <tr><td>OS reabertas em 30 dias</td><td class="num">${G.os.filter(o => o.reaberta).length}</td></tr>
          <tr><td>Contatos de cobrança comprovados</td><td class="num">${Math.round(G.cobrancas.reduce((a, c) => a + comprovados(c), 0) / Math.max(1, G.cobrancas.reduce((a, c) => a + c.tentativas.length, 0)) * 100)}%</td></tr>
          <tr><td>SLA de OS cumprido</td><td class="num">${slaGeral()}%</td></tr>
        </tbody></table></div>
    </div>`;
  };
  const porMotivo = (lista = G.cancelamentos) => {
    const m = {}; lista.forEach(c => m[c.motivo] = (m[c.motivo] || 0) + 1);
    return Object.entries(m).map(([l, v]) => ({ l, v })).sort((a, b) => b.v - a.v);
  };
  const slaGeral = () => { const c = G.os.filter(o => o.status === 'Concluída'); return Math.round(c.filter(o => o.horas <= 4).length / c.length * 100); };

  // ---- Cobranças ----
  let cobFiltro = 'todos', cobBusca = '';
  T.cobranca = () => {
    const meu = perfil === 'cobranca' ? usuario().id : null;
    let lista = G.cobrancas.filter(c => !meu || c.resp === meu).filter(c => !regiaoSel() || c.regiao === regiaoSel());
    const ind = indicadoresCobranca(lista), tot = ind.reduce((a, r) => ({ c:a.c + r.contatos, p:a.p + r.prov, rec:a.rec + r.recup, sem:a.sem + r.sem }), { c:0, p:0, rec:0, sem:0 });
    const filtros = { todos:'Todos', sem:'Sem tratativa', promessa:'Promessa vencida', hoje:'Retornos para hoje', interv:'Necessita intervenção' };
    let f = lista;
    if (cobFiltro === 'sem') f = lista.filter(semTratativa);
    if (cobFiltro === 'promessa') f = lista.filter(promessaVencida);
    if (cobFiltro === 'hoje') f = lista.filter(c => c.proxima && new Date(c.proxima).toDateString() === G.hoje.toDateString());
    if (cobFiltro === 'interv') f = lista.filter(c => c.status === 'Necessita intervenção');
    if (cobBusca) f = f.filter(c => (c.cliente + c.id).toLowerCase().includes(cobBusca.toLowerCase()));
    f = f.slice().sort((a, b) => (semTratativa(b) - semTratativa(a)) || b.atraso - a.atraso);
    return `
    <div class="grid g4">
      ${kpi(meu ? 'Meus clientes' : 'Clientes em cobrança', lista.length, `${brl(lista.filter(c => c.status !== 'Pagamento confirmado').reduce((a, c) => a + c.aberto, 0))} ainda em aberto`)}
      ${kpi('Contatos registrados', tot.c, `<b>${tot.p}</b> comprovados por integração (${tot.c ? Math.round(tot.p / tot.c * 100) : 0}%)`)}
      ${kpi('Recuperado', brl(tot.rec), `${lista.filter(c => c.status === 'Pagamento confirmado').length} pagamentos confirmados no ERP`, 'up')}
      ${kpi('Sem acompanhamento', tot.sem, 'há mais de 72h · escalonados ao supervisor', tot.sem ? 'down' : '')}
    </div>
    ${meu ? '' : `<div class="card sec"><div class="card-h"><h2>Desempenho por atendente</h2><span class="muted">Contato comprovado = registro confirmado pelo PABX ou pelo WhatsApp, não só marcado pela atendente</span></div>
      <div class="tbl-wrap"><table><thead><tr><th>Atendente</th><th class="num">Atribuídos</th><th class="num">Contatos</th><th class="num">Comprovados</th><th class="num">Negociações</th><th class="num">Recuperado</th><th class="num">Taxa</th><th class="num">Sem tratativa</th></tr></thead><tbody>
      ${ind.map(r => `<tr><td>${r.u.nome}</td><td class="num">${r.atrib}</td><td class="num">${r.contatos}</td><td class="num">${r.prov} <span class="muted">(${r.contatos ? Math.round(r.prov / r.contatos * 100) : 0}%)</span></td><td class="num">${r.negoc}</td><td class="num">${brl(r.recup)}</td><td class="num">${Math.round(r.taxa * 100)}%</td><td class="num">${r.sem ? `<span class="tag t-cr">${r.sem}</span>` : '0'}</td></tr>`).join('')}
      </tbody></table></div></div>`}
    <div class="card sec">
      <div class="card-h"><h2>Fila de cobrança</h2><span class="muted">Importado do ERP · última sincronização 10:15 (simulada)</span></div>
      <div class="row" style="margin-bottom:10px">
        ${Object.entries(filtros).map(([k, v]) => `<button class="btn btn-s ${cobFiltro === k ? 'btn-p' : ''}" data-cobf="${k}">${v}</button>`).join('')}
        <span class="sp"></span><input id="cobBusca" placeholder="Buscar cliente ou código" value="${esc(cobBusca)}" style="min-width:200px">
      </div>
      <div class="tbl-wrap">${f.length ? `<table><thead><tr><th>Cliente</th><th>Região</th><th class="num">Em aberto</th><th class="num">Atraso</th><th>Responsável</th><th>Última tratativa</th><th>Próxima ação</th><th></th></tr></thead><tbody>
      ${f.map(c => { const u = c.tentativas[c.tentativas.length - 1];
        return `<tr class="click" data-cli="${c.id}"><td><b>${esc(c.cliente)}</b><div class="muted">${c.id} · ${c.situacao} · ${c.plano}</div></td><td>${c.regiao}</td><td class="num">${brl(c.aberto)}</td><td class="num">${c.atraso} d</td><td>${primeiro(c.resp)}</td>
        <td>${tagSt(semTratativa(c) && !u ? 'Sem tratativa' : c.status)}${u ? `<div class="muted">${dth(u.quando)} · ${u.canal}${u.prova ? ' · <span class="up">✓ comprovado</span>' : ' · manual'}</div>` : ''}</td>
        <td>${promessaVencida(c) ? '<span class="tag t-cr">Promessa venceu ' + dt(c.promessa) + '</span>' : c.proxima ? dt(c.proxima) : '<span class="muted">—</span>'}</td><td><button class="btn btn-s">Abrir</button></td></tr>`; }).join('')}
      </tbody></table>` : '<div class="empty">Nenhum cliente neste filtro.</div>'}</div>
    </div>`;
  };

  function fichaCobranca(id){
    const c = G.cobrancas.find(x => x.id === id);
    const hist = c.tentativas.slice().reverse();
    const auds = auditoria.filter(a => a.alvo === c.id);
    modal(`
      <div class="row"><h2 style="margin:0">${esc(c.cliente)}</h2>${tagSt(c.status)}<span class="sp"></span><button class="btn btn-s" data-close>Fechar</button></div>
      <p class="muted">${c.id} · ${c.origem} · ${c.regiao} · ${c.plano} (${brl(c.mensal)}/mês) · ${c.situacao} há ${c.atraso} dias · <b>${brl(c.aberto)}</b> em aberto · responsável: ${pessoa(c.resp)}</p>
      <div class="tabs"><button class="on" data-tab="novo">Registrar tentativa</button><button data-tab="hist">Histórico (${c.tentativas.length})</button><button data-tab="aud">Auditoria (${auds.length})</button></div>
      <div data-pane="novo">
        <form id="fTent" novalidate>
          <div class="grid g2">
            <div class="field"><label>Canal</label><select name="canal"><option value="">Selecione</option>${G.canais.map(x => `<option>${x}</option>`).join('')}</select></div>
            <div class="field"><label>Resultado</label><select name="resultado"><option value="">Selecione</option>${G.resultados.map(x => `<option>${x}</option>`).join('')}</select></div>
            <div class="field" id="fPromessa" hidden><label>Data prometida para pagamento</label><input type="date" name="promessa"></div>
            <div class="field"><label>Próxima tentativa</label><input type="date" name="proxima"><span class="muted">Se vazio, o sistema agenda conforme o resultado.</span></div>
          </div>
          <div class="field"><label>Observação</label><textarea name="obs" rows="2" maxlength="500" placeholder="O que foi combinado com o cliente"></textarea></div>
          <div class="err" id="tErr"></div>
          <div class="row"><span class="muted">Registrado como <b>${usuario().nome}</b> em ${new Date().toLocaleString('pt-BR')} · fica marcado como <b>manual</b> até a integração confirmar.</span><span class="sp"></span><button class="btn btn-p" type="submit">Salvar tentativa</button></div>
        </form>
      </div>
      <div data-pane="hist" hidden>${hist.length ? `<ul class="timeline">${hist.map(t => `<li><div class="when">${dth(t.quando)} · ${pessoa(t.por)}</div><b>${esc(t.resultado)}</b> por ${esc(t.canal)} ${t.prova ? `<span class="tag t-ok prova">✓ ${esc(t.prova)}</span>` : '<span class="tag t-neu prova">manual · não comprovado</span>'}${t.obs ? `<div class="muted">${esc(t.obs)}</div>` : ''}</li>`).join('')}</ul>` : '<div class="empty">Nenhuma tentativa ainda. Este cliente entra no alerta de "sem tratativa".</div>'}
        <div class="note">Tentativas não podem ser apagadas. Uma correção cria um novo registro e entra na auditoria com o valor anterior.</div></div>
      <div data-pane="aud" hidden>${auds.length ? `<ul class="timeline">${auds.map(a => `<li class="aud"><div class="when">${dth(a.quando)} · ${esc(a.por)}</div><b>${esc(a.acao)}</b>${a.antes ? `<div class="muted">Antes: ${esc(a.antes)}</div>` : ''}${a.depois ? `<div class="muted">Depois: ${esc(a.depois)}</div>` : ''}</li>`).join('')}</ul>` : '<div class="empty">Nenhuma alteração registrada para este cliente.</div>'}</div>
    `);
    const form = $('#fTent');
    form.resultado.onchange = () => { $('#fPromessa').hidden = form.resultado.value !== 'Promessa de pagamento'; };
    form.onsubmit = e => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(form)), err = $('#tErr');
      if (!d.canal || !d.resultado) return err.textContent = 'Informe o canal e o resultado.';
      if (d.resultado === 'Promessa de pagamento' && !d.promessa) return err.textContent = 'Informe a data prometida para pagamento.';
      if (['Negociação em andamento','Necessita intervenção','Cliente sem interesse'].includes(d.resultado) && d.obs.trim().length < 10) return err.textContent = 'Descreva a situação na observação (mínimo 10 caracteres).';
      // agendamento automático da próxima tentativa
      const dias = { 'Não atendeu':1, 'Mensagem enviada':1, 'Aguardando retorno':2, 'Negociação em andamento':2, 'Necessita intervenção':1 }[d.resultado];
      let prox = d.proxima ? new Date(d.proxima + 'T09:00') : null;
      if (!prox && d.resultado === 'Promessa de pagamento') { prox = new Date(d.promessa + 'T09:00'); prox.setDate(prox.getDate() + 1); }
      if (!prox && dias) { prox = new Date(); prox.setDate(prox.getDate() + dias); }
      const t = { id:'n' + Date.now(), quando:new Date().toISOString(), por:usuario().id, canal:d.canal, resultado:d.resultado, obs:d.obs.trim(), prova:null, proxima: prox ? prox.toISOString() : null };
      c.tentativas.push(t); const antes = c.status; c.status = d.resultado; c.proxima = t.proxima; if (d.promessa) c.promessa = new Date(d.promessa + 'T18:00').toISOString();
      const ex = store.get('tentativas', {}); (ex[c.id] = ex[c.id] || []).push(t); store.set('tentativas', ex);
      audit('Registrou tentativa de contato', c.id, antes, `${d.resultado} · ${d.canal}`);
      fechar(); toast(prox ? `Tentativa salva. Próxima ação agendada para ${dt(prox)}.` : 'Tentativa salva.'); render();
    };
  }

  // ---- Retenção ----
  T.retencao = () => {
    const L = G.cancelamentos.filter(c => !regiaoSel() || c.regiao === regiaoSel());
    const fin = L.filter(c => c.status !== 'Pendente'), rev = L.filter(c => c.status === 'Revertido'), can = L.filter(c => c.status === 'Cancelado');
    const reg = {}; can.forEach(c => reg[c.regiao] = (reg[c.regiao] || 0) + 1);
    const tec = can.filter(c => c.osTecnicas >= 2).length;
    return `
    <div class="grid g4">
      ${kpi('Pedidos de cancelamento', L.length, `${L.filter(c => c.status === 'Pendente').length} aguardando retenção`)}
      ${kpi('Taxa de retenção', (fin.length ? Math.round(rev.length / fin.length * 100) : 0) + '%', `${rev.length} revertidos de ${fin.length} tratados`, 'up')}
      ${kpi('Receita mensal perdida', brl(can.reduce((a, c) => a + c.mensal, 0)), `${can.length} contratos encerrados`, 'down')}
      ${kpi('Receita preservada', brl(rev.reduce((a, c) => a + c.mensal, 0)), 'por mês, com as retenções', 'up')}
    </div>
    <div class="grid g3 sec">
      <div class="card"><h2>Cancelamentos por motivo</h2>${hbarras(porMotivo(can), { cor:'var(--laranja)' })}</div>
      <div class="card"><h2>Por região</h2>${hbarras(Object.entries(reg).map(([l, v]) => ({ l, v })).sort((a, b) => b.v - a.v))}<div class="note">${tec} de ${can.length} cancelados tiveram 2 ou mais OS técnicas antes do pedido.</div></div>
      <div class="card"><h2>Evolução mensal</h2>${barras(G.cancelHist.map(c => ({ l:c.m, v:c.c, v2:c.r })), { cor:'var(--laranja)', cor2:'var(--ok)' })}<div class="legend"><span><i style="background:var(--laranja)"></i>Pedidos</span><span><i style="background:var(--ok)"></i>Revertidos</span></div></div>
    </div>
    <div class="grid g12 sec">
      <div class="card"><div class="card-h"><h2>Clientes em risco</h2><span class="tag t-neu">regras, não previsão</span></div>
        ${G.riscos.slice(0, 6).map(r => `<div class="att"><span class="bar ${r.pontos > 60 ? 'sev-cr' : 'sev-at'}"></span><div class="tx"><b>${esc(r.cliente)}</b> <span class="muted">${r.regiao} · ${r.plano}</span><p>${r.regras.map(esc).join(' · ')}</p></div><span class="muted">${r.pontos} pts</span></div>`).join('')}
        <div class="note">A pontuação soma regras configuráveis (em Automações). É um sinal para a retenção agir antes do pedido, não uma certeza.</div></div>
      <div class="card"><div class="card-h"><h2>Pedidos de cancelamento</h2><span class="muted">ERP + histórico do WhatsApp na mesma linha</span></div>
        <div class="tbl-wrap"><table><thead><tr><th>Cliente</th><th>Data</th><th>Motivo</th><th class="num">OS / recl.</th><th>Oferta</th><th>Resultado</th><th class="num">Mensal</th></tr></thead><tbody>
        ${L.slice().sort((a, b) => new Date(b.data) - new Date(a.data)).map(c => `<tr><td><b>${esc(c.cliente)}</b><div class="muted">${c.regiao} · cliente desde ${c.clienteDesde} · ${primeiro(c.resp)}</div></td><td>${dt(c.data)}</td><td>${esc(c.motivo)}${c.secundario && c.secundario !== c.motivo ? `<div class="muted">+ ${esc(c.secundario)}</div>` : ''}</td><td class="num">${c.osTecnicas} / ${c.reclamacoes}</td><td>${c.oferta ? esc(c.oferta) : '<span class="muted">—</span>'}</td><td>${tagSt(c.status)}</td><td class="num">${brl(c.mensal)}</td></tr>`).join('')}
        </tbody></table></div></div>
    </div>`;
  };

  // ---- Atendimentos ----
  T.atend = () => `
    <div class="grid g4">
      ${kpi('Atendimentos hoje', 184, '37 em andamento · 9 aguardando cliente')}
      ${kpi('1ª resposta (média)', '6 min', 'meta: até 10 min', 'up')}
      ${kpi('Resolvidos no 1º contato', '68%', '+4 p.p. vs. setembro', 'up')}
      ${kpi('Sem resposta há +2h', 5, 'aparecem para a supervisão', 'down')}
    </div>
    <div class="grid g2 sec">
      <div class="card"><h2>Volume por canal (mês)</h2>${hbarras([{ l:'WhatsApp', v:3120 }, { l:'Telefone', v:1240 }, { l:'Instagram', v:310 }, { l:'Loja / presencial', v:205 }, { l:'Portal do assinante', v:150 }], { fmt:n })}</div>
      <div class="card"><h2>Assuntos mais frequentes</h2>${hbarras([{ l:'Sem conexão / lentidão', v:1480 }, { l:'2ª via e pagamento', v:1210 }, { l:'Negociação de débito', v:640 }, { l:'Mudança de plano', v:390 }, { l:'Cancelamento', v:96 }], { fmt:n, cor:'var(--laranja)' })}</div>
    </div>
    <div class="card sec"><h2>Por atendente</h2><div class="tbl-wrap"><table><thead><tr><th>Atendente</th><th class="num">Atendimentos</th><th class="num">1ª resposta</th><th class="num">Resolvidos</th><th class="num">Avaliação</th><th class="num">Registros completos</th></tr></thead><tbody>
      ${[['u4',612,'5 min','71%','4,7','96%'],['u5',548,'7 min','64%','4,5','88%'],['u1',201,'4 min','—','4,6','99%'],['u2',187,'6 min','—','4,4','91%']].map(r => `<tr><td>${pessoa(r[0])}</td><td class="num">${r[1]}</td><td class="num">${r[2]}</td><td class="num">${r[3]}</td><td class="num">${r[4]}</td><td class="num">${r[5]}</td></tr>`).join('')}
    </tbody></table></div><div class="note">Fonte prevista: WhatsApp. Os campos disponíveis via API ainda serão confirmados com o fornecedor.</div></div>`;

  // ---- Ordens de serviço ----
  T.os = () => {
    const L = G.os.filter(o => !regiaoSel() || o.regiao === regiaoSel()), ab = L.filter(o => o.status !== 'Concluída');
    const tecs = G.equipe.filter(e => e.perfil === 'tecnico').map(t => { const m = L.filter(o => o.tec === t.id), c = m.filter(o => o.status === 'Concluída');
      return { t, atr:m.length, conc:c.length, tm: c.length ? (c.reduce((a, o) => a + o.horas, 0) / c.length).toFixed(1) : '—', sla: c.length ? Math.round(c.filter(o => o.horas <= 4).length / c.length * 100) : 0, reab:c.filter(o => o.reaberta).length, atrasadas:m.filter(o => o.atrasada).length }; });
    return `
    <div class="grid g4">
      ${kpi('Abertas', ab.length, `${L.filter(o => o.status === 'Em andamento').length} em execução agora`)}
      ${kpi('Atrasadas', L.filter(o => o.atrasada).length, 'fora do prazo combinado', 'down')}
      ${kpi('SLA cumprido', slaGeral() + '%', 'meta: 85% em até 4h')}
      ${kpi('Reabertas (30 dias)', L.filter(o => o.reaberta).length, 'contam como retrabalho')}
    </div>
    <div class="card sec"><h2>Equipe técnica</h2><div class="tbl-wrap"><table><thead><tr><th>Técnico</th><th class="num">Atribuídas</th><th class="num">Concluídas</th><th class="num">Tempo médio</th><th class="num">SLA</th><th class="num">Reabertas</th><th class="num">Atrasadas</th></tr></thead><tbody>
      ${tecs.map(r => `<tr><td>${r.t.nome}</td><td class="num">${r.atr}</td><td class="num">${r.conc}</td><td class="num">${r.tm} h</td><td class="num">${r.sla}%</td><td class="num">${r.reab}</td><td class="num">${r.atrasadas ? `<span class="tag t-cr">${r.atrasadas}</span>` : 0}</td></tr>`).join('')}
    </tbody></table></div></div>
    <div class="card sec"><div class="card-h"><h2>Ordens em aberto</h2><span class="muted">Fonte: ERP (somente leitura)</span></div><div class="tbl-wrap"><table><thead><tr><th>OS</th><th>Tipo</th><th>Cliente</th><th>Região</th><th>Técnico</th><th>Prazo</th><th>Situação</th></tr></thead><tbody>
      ${ab.sort((a, b) => b.atrasada - a.atrasada).map(o => `<tr><td class="prova">${o.id}</td><td>${o.tipo}</td><td>${esc(o.cliente)}</td><td>${o.regiao}</td><td>${primeiro(o.tec)}</td><td>${dt(o.prazo)}</td><td>${tagSt(o.atrasada ? 'Atrasada' : o.status)}</td></tr>`).join('')}
    </tbody></table></div></div>`;
  };

  // ---- Monitoramento ----
  T.monitor = () => {
    const cor = { ok:'var(--ok)', at:'var(--at)', cr:'var(--cr)' }, lbl = { ok:'Operando', at:'Degradado', cr:'Fora do ar' };
    return `
    <div class="grid g4">
      ${kpi('Disponibilidade (30 dias)', '99,62%', 'meta: 99,5%', 'up')}
      ${kpi('Equipamentos monitorados', G.equipamentos.length, `${G.equipamentos.filter(e => e.st === 'ok').length} operando · ${G.equipamentos.filter(e => e.st === 'at').length} degradados · ${G.equipamentos.filter(e => e.st === 'cr').length} fora`)}
      ${kpi('Incidentes ativos', G.incidentes.filter(i => i.status !== 'Resolvido').length, '412 clientes afetados agora', 'down')}
      ${kpi('Tempo médio de recuperação', '2h31', 'últimos 30 dias')}
    </div>
    <div class="grid g21 sec">
      <div class="card"><div class="card-h"><h2>Equipamentos</h2><span class="tag t-info">Zabbix · SNMPv3 · ICMP · somente leitura</span></div><div class="tbl-wrap"><table><thead><tr><th>Equipamento</th><th>POP</th><th>Status</th><th class="num">CPU</th><th class="num">Latência</th><th class="num">Perda</th></tr></thead><tbody>
        ${G.equipamentos.map(e => `<tr><td><span class="dot" style="background:${cor[e.st]}"></span>${e.nome}</td><td>${e.pop}</td><td><span class="tag t-${e.st === 'ok' ? 'ok' : e.st === 'at' ? 'at' : 'cr'}">${lbl[e.st]}</span></td><td class="num">${e.cpu != null ? e.cpu + '%' : (e.uso + '% uso')}</td><td class="num">${e.lat != null ? e.lat + ' ms' : '—'}</td><td class="num">${e.perda}%</td></tr>`).join('')}
      </tbody></table></div></div>
      <div class="card"><h2>Mapa dos POPs</h2><div class="map">
        ${G.equipamentos.filter((e, i, a) => a.findIndex(x => x.pop === e.pop) === i).map(e => { const piores = G.equipamentos.filter(x => x.pop === e.pop).map(x => x.st); const st = piores.includes('cr') ? 'cr' : piores.includes('at') ? 'at' : 'ok';
          return `<div class="pin" style="left:${e.x}%;top:${e.y}%"><b style="background:${cor[st]}"></b>${e.pop.replace('POP ', '')}</div>`; }).join('')}
      </div><p class="muted">Posições ilustrativas. Na versão real, usa as coordenadas cadastradas de cada POP.</p></div>
    </div>
    <div class="grid g2 sec">
      <div class="card"><h2>Latência · Link IP 2 (24h)</h2>${linha(G.latencia, { limite:15, cor:'var(--marca)' })}</div>
      <div class="card"><h2>Falhas × reclamações</h2>
        <table><thead><tr><th>Incidente</th><th class="num">Afetados</th><th class="num">Chamados</th><th>Situação</th></tr></thead><tbody>
        ${G.incidentes.map(i => `<tr><td><b>${i.id}</b> ${esc(i.titulo)}<div class="muted">${dth(i.inicio)}${i.duracao ? ' · durou ' + i.duracao : ''} · ${i.regiao}</div></td><td class="num">${i.afetados}</td><td class="num">${i.chamados}</td><td><span class="tag t-${i.status === 'Resolvido' ? 'ok' : i.sev === 'cr' ? 'cr' : 'at'}">${i.status}</span></td></tr>`).join('')}
        </tbody></table>
        <div class="note">Chamados = atendimentos no WhatsApp e OS no ERP da mesma região abertos durante o incidente. Ajuda a ver quanto cada queda custa em atendimento e em risco de cancelamento.</div></div>
    </div>`;
  };

  // ---- Equipes e produtividade ----
  T.equipes = () => {
    const linhas = [
      ['u1','Cobrança', 92, 'Contatos comprovados 71% · recuperação 34% · registros completos 99%'],
      ['u2','Cobrança', 78, 'Recuperação 29% · 6 casos sem tratativa > 72h'],
      ['u3','Cobrança', 74, 'Em adaptação (8 meses) · peso de prazo reduzido'],
      ['u4','Atendimento', 88, 'Retenção 47% · 1ª resposta 5 min · avaliação 4,7'],
      ['u6','Técnico', 86, 'SLA 89% · 1 reabertura · OS complexas (fusão/backbone) pesam 2×'],
      ['u7','Técnico', 81, 'SLA 84% · 2 reaberturas'],
      ['u8','Técnico', 63, 'SLA 61% · 4 atrasadas · em período de adaptação'],
      ['u11','Administrativo', 84, 'Checklists 92% no prazo · 1 pendência vencida'],
      ['u12','Administrativo', 70, 'Fechamento de caixa atrasado · em experiência'],
    ].filter(l => perfil !== 'cobranca' || l[0] === usuario().id);
    const minhas = G.tarefas.filter(t => perfil === 'diretoria' || [t.resp, t.valida].includes(usuario().id));
    return `
    <div class="card"><div class="card-h"><h2>${perfil === 'cobranca' ? 'Meu desempenho' : 'Desempenho por pessoa'}</h2><span class="muted">Índice 0–100 por função · cada função tem indicadores e pesos próprios</span></div>
      <div class="tbl-wrap"><table><thead><tr><th>Colaborador</th><th>Função</th><th style="width:30%">Índice</th><th>O que compõe</th></tr></thead><tbody>
      ${linhas.map(l => `<tr><td>${pessoa(l[0])}</td><td>${l[1]}</td><td><div class="row"><div class="meter" style="flex:1"><i style="width:${l[2]}%;background:${l[2] >= 80 ? 'var(--ok)' : l[2] >= 70 ? 'var(--marca)' : 'var(--at)'}"></i></div><b style="width:28px;text-align:right">${l[2]}</b></div></td><td class="muted">${l[3]}</td></tr>`).join('')}
      </tbody></table></div>
      <div class="note">O índice não é quantidade de tarefas. Combina volume, qualidade, prazo e retrabalho, ajustado por complexidade e tempo de casa. Os pesos ficam em Metas e Bonificações.</div></div>
    <div class="card sec"><div class="card-h"><h2>Tarefas e responsabilidades</h2><button class="btn btn-s btn-p" id="novaTarefa">Nova tarefa</button></div>
      <div class="tbl-wrap"><table><thead><tr><th>Tarefa</th><th>Executa</th><th>Valida</th><th>Prazo</th><th>Prioridade</th><th>Situação</th><th>Evidência</th></tr></thead><tbody>
      ${minhas.length ? minhas.map(t => `<tr><td><b>${esc(t.titulo)}</b><div class="muted prova">${t.id}</div></td><td>${primeiro(t.resp)}</td><td>${primeiro(t.valida)}</td><td>${dt(t.prazo)}</td><td>${tagSt(t.prio)}</td><td>${tagSt(t.status)}</td><td>${t.evid ? 'exigida' : '—'}</td></tr>`).join('') : '<tr><td colspan="7" class="empty">Nenhuma tarefa sua.</td></tr>'}
      </tbody></table></div></div>
    <div class="card sec"><h2>Matriz de responsabilidades</h2><div class="tbl-wrap"><table><thead><tr><th>Processo</th><th>Executa</th><th>Confere</th><th>Aprova</th><th>Substituto</th></tr></thead><tbody>
      ${[['Cobrança de suspensos','Atendentes de cobrança','Camila Rêgo','Diretoria (acordos > R$ 500)','Jéssica Lins'],['Retenção de cancelamento','Camila Rêgo','Supervisão de atendimento','Diretoria (descontos > 20%)','Patrícia Moura'],['Abertura e fechamento de OS','Técnicos','Sérgio Vilar','—','Marcos Paiva'],['Admissão e desligamento','Daniela Pontes','Thiago Amorim','Diretoria','Thiago Amorim'],['Fechamento de caixa','Thiago Amorim','Daniela Pontes','Diretoria','Daniela Pontes'],['Pagamento de bônus','Daniela Pontes','Supervisores','Diretoria (sempre)','—']].map(r => `<tr>${r.map((c, i) => `<td>${i ? c : '<b>' + c + '</b>'}</td>`).join('')}</tr>`).join('')}
      </tbody></table></div><p class="muted">Quando alguém sai de férias, as tarefas passam ao substituto e o histórico continua.</p></div>`;
  };

  // ---- RH ----
  T.rh = () => {
    if (!store.get('rhLog' + perfil, false)) { audit('Acessou a central de RH', 'RH', '', ''); store.set('rhLog' + perfil, true); }
    const alerta = s => /vencid|Vencid/.test(s) ? 'cr' : /Vence|vence|Vencem/.test(s) ? 'at' : '';
    return `
    <div class="grid g4">
      ${kpi('Colaboradores', G.rh.length, '1 em férias · 1 em experiência')}
      ${kpi('Exames vencidos', G.rh.filter(r => /Vencido/.test(r.aso)).length, `${G.rh.filter(r => /Vence/.test(r.aso)).length} vencem em 30 dias`, 'down')}
      ${kpi('Férias vencidas', G.rh.filter(r => /Vencidas/.test(r.ferias)).length, 'risco trabalhista', 'down')}
      ${kpi('Pendências administrativas', G.rh.reduce((a, r) => a + r.pend, 0), 'checklists e documentos')}
    </div>
    <div class="card sec"><div class="card-h"><h2>Colaboradores</h2><span class="tag t-at">Dados pessoais ocultos · CPF, endereço e salário só com permissão específica</span></div>
      <div class="tbl-wrap"><table><thead><tr><th>Nome</th><th>Cargo</th><th>Admissão</th><th>Situação</th><th>Férias</th><th>Exame ocupacional</th><th>Treinamentos / NR</th></tr></thead><tbody>
      ${G.rh.map(r => `<tr><td><b>${r.nome}</b><div class="muted">${r.setor}</div></td><td>${r.cargo}</td><td>${new Date(r.adm).toLocaleDateString('pt-BR')}</td><td>${tagSt(r.situacao)}</td>
        <td>${alerta(r.ferias) ? `<span class="tag t-${alerta(r.ferias)}">${r.ferias}</span>` : r.ferias}</td><td>${alerta(r.aso) ? `<span class="tag t-${alerta(r.aso)}">${r.aso}</span>` : r.aso}</td><td>${alerta(r.nr) ? `<span class="tag t-at">${r.nr}</span>` : r.nr}</td></tr>`).join('')}
      </tbody></table></div></div>
    <div class="grid g2 sec">
      ${G.checklists.map(c => { const ok = c.itens.filter(i => i[1]).length; return `<div class="card"><div class="card-h"><h2>${c.titulo}</h2><span class="tag ${c.prazo === 'vencido' ? 't-cr' : 't-neu'}">prazo ${c.prazo}</span></div>
        <div class="meter" style="margin-bottom:10px"><i style="width:${ok / c.itens.length * 100}%"></i></div>
        ${c.itens.map(i => `<div style="padding:4px 0">${i[1] ? '<span class="up">✓</span>' : '<span class="down">○</span>'} ${i[0]}</div>`).join('')}<p class="muted">Responsável: ${pessoa(c.resp)} · ${ok}/${c.itens.length} itens</p></div>`; }).join('')}
    </div>`;
  };

  // ---- Metas e bonificações ----
  const pesosPadrao = { volume:25, qualidade:30, prazo:25, retrabalho:20 };
  T.metas = () => {
    const p = store.get('pesos', pesosPadrao), soma = Object.values(p).reduce((a, b) => a + b, 0);
    const base = [['u1',[88,96,90,94]],['u2',[80,82,71,85]],['u3',[66,80,72,90]],['u6',[84,88,89,92]],['u7',[86,79,84,80]],['u8',[70,72,61,58]]];
    const rk = base.map(([id, v]) => ({ id, score: Math.round((v[0] * p.volume + v[1] * p.qualidade + v[2] * p.prazo + v[3] * p.retrabalho) / Math.max(1, soma)) })).sort((a, b) => b.score - a.score);
    const bonus = s => s >= 85 ? 400 : s >= 75 ? 250 : s >= 65 ? 100 : 0;
    return `
    <div class="grid g12">
      <div class="card"><h2>Pesos dos indicadores</h2>
        ${Object.entries({ volume:'Volume de atividades', qualidade:'Qualidade dos registros / encerramento', prazo:'Cumprimento de prazo e SLA', retrabalho:'Ausência de retrabalho' }).map(([k, l]) => `<div class="field"><label>${l} · <b>${p[k]}%</b></label><input type="range" min="0" max="60" step="5" value="${p[k]}" data-peso="${k}"></div>`).join('')}
        <div class="${soma === 100 ? 'muted' : 'err'}">Soma dos pesos: ${soma}%${soma === 100 ? '' : ' · precisa fechar 100% para publicar'}</div>
        <div class="row" style="margin-top:10px"><button class="btn btn-s" id="pesoReset">Restaurar padrão</button><span class="sp"></span><button class="btn btn-s btn-p" id="pesoPub" ${soma === 100 ? '' : 'disabled'}>Enviar para aprovação</button></div>
        <div class="note">Mudar um peso não altera o mês corrente. A regra nova vale a partir do mês seguinte, depois da aprovação da diretoria, e fica no histórico.</div></div>
      <div class="card"><div class="card-h"><h2>Ranking e simulação de bônus · outubro</h2><span class="tag t-at">Simulação · pagamento depende de aprovação</span></div>
        <div class="tbl-wrap"><table><thead><tr><th>#</th><th>Colaborador</th><th>Função</th><th class="num">Pontuação</th><th class="num">Bônus simulado</th><th>Aprovação</th></tr></thead><tbody>
        ${rk.map((r, i) => `<tr><td>${i + 1}</td><td>${pessoa(r.id)}</td><td>${G.equipe.find(e => e.id === r.id).setor}</td><td class="num"><b>${r.score}</b></td><td class="num">${brl(bonus(r.score))}</td><td><span class="tag t-neu">Aguardando diretoria</span></td></tr>`).join('')}
        </tbody></table></div>
        <p class="muted">Faixas: 85+ → R$ 400 · 75–84 → R$ 250 · 65–74 → R$ 100. Total simulado: <b>${brl(rk.reduce((a, r) => a + bonus(r.score), 0))}</b>. O sistema nunca desconta salário nem aplica decisão trabalhista sozinho.</p></div>
    </div>`;
  };

  // ---- BI ----
  T.bi = () => `
    <div class="grid g2">
      <div class="card"><h2>Inadimplência (% do faturamento em atraso)</h2>${barras(['mai','jun','jul','ago','set','out'].map((m, i) => ({ l:m, v:G.kpi.inadHist[i] })), { cor:'var(--laranja)', fmt: v => v.toLocaleString('pt-BR') + '%' })}</div>
      <div class="card"><h2>Saldo líquido de clientes</h2>${barras(G.cancelHist.map((c, i) => ({ l:c.m, v:[82,88,79,91,94,96][i] - c.c + c.r })), { cor:'var(--ok)', fmt: v => '+' + v })}</div>
    </div>
    <div class="card sec"><h2>Relatórios prontos</h2><div class="tbl-wrap"><table><thead><tr><th>Relatório</th><th>Para quem</th><th>Frequência</th><th></th></tr></thead><tbody>
      ${[['Resumo executivo da semana','Diretoria','Toda segunda, 7h (e-mail/WhatsApp)'],['Cobrança por atendente','Diretoria e supervisão','Diário'],['Motivos de cancelamento','Diretoria e retenção','Mensal'],['SLA e retrabalho técnico','Supervisor técnico','Semanal'],['Vencimentos de RH (30/60/90 dias)','RH','Semanal'],['Fechamento de metas e bônus','Diretoria e RH','Mensal']].map(r => `<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}</td><td><button class="btn btn-s" data-toast="Na versão real gera PDF e planilha. Exportações ficam registradas na auditoria.">Gerar</button></td></tr>`).join('')}
    </tbody></table></div></div>
    <div class="card sec"><h2>Camada de dados para o Power BI</h2><p>Os indicadores são calculados uma única vez no Jandaia OS e publicados em visões somente leitura, sem dados pessoais. O Power BI lê essas visões em vez de refazer as fórmulas, então o número do painel e o do relatório são sempre o mesmo.</p>
      <div class="tbl-wrap"><table><thead><tr><th>Visão</th><th>Conteúdo</th><th>Atualização</th></tr></thead><tbody>
      <tr><td class="prova">bi.fato_cobranca</td><td>Tentativas, resultado, canal, comprovação, valores recuperados</td><td>a cada 15 min</td></tr>
      <tr><td class="prova">bi.fato_cancelamento</td><td>Pedidos, motivos, ofertas, resultado, receita</td><td>a cada 15 min</td></tr>
      <tr><td class="prova">bi.fato_os</td><td>OS, prazos, SLA, reaberturas por técnico e região</td><td>a cada 15 min</td></tr>
      <tr><td class="prova">bi.fato_rede</td><td>Disponibilidade, incidentes e duração por POP</td><td>a cada 5 min</td></tr>
      <tr><td class="prova">bi.dim_colaborador</td><td>Função, equipe e região (sem CPF, salário ou endereço)</td><td>diária</td></tr>
      </tbody></table></div></div>`;

  // ---- Automações ----
  const regrasPadrao = [
    { id:'r1', se:'Cliente suspenso sem tentativa de cobrança em 48h', entao:'Criar pendência para a atendente responsável', sev:'Média', quem:'Atendente → supervisão após 72h', on:true, disparos:7 },
    { id:'r2', se:'Promessa de pagamento venceu sem pagamento no ERP', entao:'Gerar acompanhamento para o dia seguinte', sev:'Média', quem:'Atendente responsável', on:true, disparos:5 },
    { id:'r3', se:'Pedido de cancelamento registrado', entao:'Encaminhar à retenção com histórico do cliente', sev:'Alta', quem:'Retenção (Camila)', on:true, disparos:9 },
    { id:'r4', se:'OS passou do prazo', entao:'Alertar supervisor técnico', sev:'Alta', quem:'Sérgio Vilar', on:true, disparos:6 },
    { id:'r5', se:'Exame ocupacional vence em 30 dias', entao:'Alertar RH e agendar', sev:'Baixa', quem:'Daniela Pontes', on:true, disparos:2 },
    { id:'r6', se:'Equipamento sem resposta por 5 min (Zabbix)', entao:'Abrir incidente e avisar plantão técnico', sev:'Crítica', quem:'Plantão → diretoria se > 200 clientes', on:true, disparos:3 },
    { id:'r7', se:'Cancelamentos da semana 30% acima da média de 8 semanas', entao:'Sinalizar a diretoria', sev:'Crítica', quem:'Diretoria', on:true, disparos:1 },
    { id:'r8', se:'Colaborador com 3+ tarefas críticas atrasadas', entao:'Sinalizar o gestor da área', sev:'Alta', quem:'Gestor da área', on:false, disparos:0 },
  ];
  T.auto = () => {
    const R = store.get('regras', regrasPadrao);
    const sevT = { 'Crítica':'t-cr', 'Alta':'t-at', 'Média':'t-info', 'Baixa':'t-neu' };
    return `
    <div class="grid g4">
      ${kpi('Regras ativas', R.filter(r => r.on).length, `de ${R.length} configuradas`)}
      ${kpi('Disparos em 7 dias', R.reduce((a, r) => a + r.disparos, 0), 'pendências e alertas gerados')}
      ${kpi('Chegaram à diretoria', 4, 'só severidade crítica ou escalonada')}
      ${kpi('Resolvidos no prazo', '81%', 'sem precisar escalonar', 'up')}
    </div>
    <div class="card sec"><div class="card-h"><h2>Regras</h2><span class="muted">Se → então · quem recebe · gravidade</span></div><div class="tbl-wrap"><table><thead><tr><th>Ativa</th><th>Quando</th><th>O sistema faz</th><th>Gravidade</th><th>Quem recebe</th><th class="num">7 dias</th></tr></thead><tbody>
      ${R.map(r => `<tr><td><input type="checkbox" data-regra="${r.id}" ${r.on ? 'checked' : ''} aria-label="Ativar regra"></td><td><b>${r.se}</b></td><td>${r.entao}</td><td><span class="tag ${sevT[r.sev]}">${r.sev}</span></td><td>${r.quem}</td><td class="num">${r.disparos}</td></tr>`).join('')}
    </tbody></table></div>
    <div class="note">Canais por pessoa: painel (sempre), e-mail e WhatsApp. A diretoria recebe no celular só o que é crítico; o resto fica no resumo diário.</div></div>`;
  };

  // ---- Configurações e integrações ----
  T.config = () => `
    <div class="card"><div class="card-h"><h2>Integrações</h2><span class="muted">Cada conector é independente e guarda o identificador de origem</span></div><div class="tbl-wrap"><table><thead><tr><th>Sistema</th><th>Para quê</th><th>Como</th><th>Modo</th><th>Situação</th></tr></thead><tbody>
      ${[['ERP (IXC, SGP, MK-Auth…)','Clientes, contratos, faturas, pagamentos, OS','API do ERP (token) · a validar com o fornecedor','Leitura','A confirmar'],['WhatsApp','Conversas, atendente, canal, tempo de resposta, entrega/leitura','API ou webhook · a validar com o fornecedor','Leitura','A confirmar'],['PABX / telefonia','Comprovar ligações de cobrança (duração, ramal)','Registro de chamadas (CDR) do PABX','Leitura','A confirmar'],['Zabbix','Status, latência, perda, CPU, interfaces','API JSON-RPC do Zabbix','Leitura','A confirmar'],['MikroTik / OLTs','Sessões PPPoE, sinal óptico das ONUs','SNMPv3 (ou via Zabbix)','Leitura','A confirmar'],['Sistema auxiliar (checklists/estoque/RH)','Migrar dados de funcionários e checklists','Importação única de planilha ou API','Importação','Nome a confirmar'],['Power BI','Relatórios gerenciais','Visões bi.* somente leitura','Leitura','Pronto no protótipo']].map(r => `<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}</td><td><span class="tag t-info">${r[3]}</span></td><td><span class="tag ${r[4].startsWith('Pronto') ? 't-ok' : 't-at'}">${r[4]}</span></td></tr>`).join('')}
    </tbody></table></div><div class="note">Nenhuma integração escreve nos sistemas de origem ou nos equipamentos. Alterações em equipamentos de rede não fazem parte do projeto sem autorização formal e controles próprios.</div></div>
    <div class="card sec"><h2>Perfis de acesso</h2><div class="tbl-wrap"><table><thead><tr><th>Área</th><th>Diretoria</th><th>Cobrança</th><th>Supervisor técnico</th><th>RH</th></tr></thead><tbody>
      ${rotas.filter(r => r.id).map(r => `<tr><td>${r.t}</td>${Object.values(perfis).map(p => `<td>${p.rotas === '*' || p.rotas.includes(r.id) ? '<span class="up">✓</span>' : '<span class="muted">—</span>'}</td>`).join('')}</tr>`).join('')}
    </tbody></table></div><p class="muted">Use "Ver como" no menu lateral para conferir o que cada perfil enxerga.</p></div>
    <div class="card sec"><div class="card-h"><h2>Trilha de auditoria</h2><span class="muted">Somente inclusão · ninguém edita ou apaga</span></div><div class="tbl-wrap"><table><thead><tr><th>Quando</th><th>Quem</th><th>Ação</th><th>Onde</th><th>Antes → depois</th></tr></thead><tbody>
      ${auditoria.slice(0, 15).map(a => `<tr><td class="prova">${dth(a.quando)}</td><td>${esc(a.por)}</td><td>${esc(a.acao)}</td><td>${esc(a.alvo)}</td><td class="muted">${a.antes || a.depois ? esc(a.antes || '—') + ' → ' + esc(a.depois || '—') : ''}</td></tr>`).join('')}
    </tbody></table></div><div class="row" style="margin-top:10px"><span class="sp"></span><button class="btn btn-s" id="resetDemo">Limpar dados desta demonstração</button></div></div>`;

  // ---------- infraestrutura da tela ----------
  const regiaoSel = () => $('#fRegiao').value;
  function modal(html){ $('#modalBody').innerHTML = html; $('#modal').hidden = false;
    $('#modalBody').querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { $('#modalBody').querySelectorAll('[data-tab]').forEach(x => x.classList.toggle('on', x === b)); $('#modalBody').querySelectorAll('[data-pane]').forEach(p => p.hidden = p.dataset.pane !== b.dataset.tab); });
    $('#modalBody').querySelectorAll('[data-close]').forEach(b => b.onclick = fechar); }
  function fechar(){ $('#modal').hidden = true; }
  $('#modal').onclick = e => { if (e.target.id === 'modal') fechar(); };
  document.addEventListener('keydown', e => { if (e.key === 'Escape') fechar(); });
  let tt; function toast(m){ const t = $('#toast'); t.textContent = m; t.hidden = false; clearTimeout(tt); tt = setTimeout(() => t.hidden = true, 3200); }

  function nav(){
    const cur = rota();
    $('#nav').innerHTML = rotas.map(r => {
      if (r.g) return `<div class="grp">${r.g}</div>`;
      if (!pode(r.id)) return '';
      const cnt = r.id === 'visao' ? 5 : r.id === 'monitor' ? G.incidentes.filter(i => i.status !== 'Resolvido').length : r.id === 'cobranca' ? G.cobrancas.filter(c => semTratativa(c) && (perfil !== 'cobranca' || c.resp === usuario().id)).length : 0;
      return `<a href="#${r.id}" class="${cur === r.id ? 'on' : ''}"><span class="ic">${r.ic}</span>${r.t}${cnt ? `<span class="cnt">${cnt}</span>` : ''}</a>`;
    }).join('').replace(/<div class="grp">[^<]*<\/div>(?=<div class="grp">|$)/g, '');
    $('#avatar').textContent = usuario().ini;
  }
  const rota = () => { const r = location.hash.slice(1) || 'visao'; return T[r] ? r : 'visao'; };
  function render(){
    let r = rota();
    if (!pode(r)) { r = usuario().rotas[0]; history.replaceState(null, '', '#' + r); }
    const def = rotas.find(x => x.id === r);
    $('#pgTitle').textContent = def.t; $('#pgSub').textContent = def.sub; document.title = def.t + ' · Jandaia OS';
    $('#filters').style.visibility = ['cobranca','retencao','os','visao'].includes(r) ? 'visible' : 'hidden';
    nav();
    try { view.innerHTML = T[r](); } catch (e) { console.error(e); view.innerHTML = `<div class="card empty">Não foi possível carregar esta área. <button class="btn btn-s" onclick="location.reload()">Tentar de novo</button></div>`; }
    bind(); $('#side').classList.remove('open');
  }
  function bind(){
    view.querySelectorAll('[data-go]').forEach(b => b.onclick = () => location.hash = b.dataset.go);
    view.querySelectorAll('[data-cli]').forEach(r => r.onclick = () => fichaCobranca(r.dataset.cli));
    view.querySelectorAll('[data-cobf]').forEach(b => b.onclick = () => { cobFiltro = b.dataset.cobf; render(); });
    view.querySelectorAll('[data-toast]').forEach(b => b.onclick = () => toast(b.dataset.toast));
    const bus = $('#cobBusca'); if (bus) bus.oninput = e => { cobBusca = e.target.value; const pos = e.target.selectionStart; render(); const nb = $('#cobBusca'); nb.focus(); nb.setSelectionRange(pos, pos); };
    view.querySelectorAll('[data-peso]').forEach(i => i.oninput = () => { const p = store.get('pesos', pesosPadrao); p[i.dataset.peso] = +i.value; store.set('pesos', p); render(); });
    const pr = $('#pesoReset'); if (pr) pr.onclick = () => { store.set('pesos', pesosPadrao); render(); };
    const pp = $('#pesoPub'); if (pp) pp.onclick = () => { audit('Enviou nova regra de pesos para aprovação', 'Metas', '', JSON.stringify(store.get('pesos', pesosPadrao))); toast('Enviado para aprovação da diretoria. Registrado na auditoria.'); };
    view.querySelectorAll('[data-regra]').forEach(c => c.onchange = () => { const R = store.get('regras', regrasPadrao), r = R.find(x => x.id === c.dataset.regra); r.on = c.checked; store.set('regras', R); audit(c.checked ? 'Ativou regra de automação' : 'Desativou regra de automação', 'Automações', '', r.se); toast('Regra ' + (c.checked ? 'ativada' : 'desativada') + '. Registrado na auditoria.'); render(); });
    const nt = $('#novaTarefa'); if (nt) nt.onclick = () => toast('No MVP: tarefa com responsável, prazo, prioridade, evidência e validação.');
    const rd = $('#resetDemo'); if (rd) rd.onclick = () => { try { Object.keys(localStorage).filter(k => k.startsWith('jdos:')).forEach(k => localStorage.removeItem(k)); } catch(e){} location.reload(); };
  }

  $('#fRegiao').innerHTML += G.regioes.map(r => `<option>${r}</option>`).join('');
  $('#fRegiao').onchange = render; $('#fPeriodo').onchange = () => toast('No protótipo os números são de outubro. Na versão real o período recalcula tudo.');
  $('#perfil').value = perfil;
  $('#perfil').onchange = e => { perfil = e.target.value; store.set('perfil', perfil); render(); toast('Vendo como ' + usuario().nome); };
  $('#menuBtn').onclick = () => $('#side').classList.toggle('open');
  window.addEventListener('hashchange', render);
  render();
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
})();
