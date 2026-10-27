// DADOS DE SIMULAÇÃO. Gerados com semente fixa para que a demonstração seja sempre igual.
// Na versão real, estes objetos vêm dos conectores (ERP, WhatsApp, Zabbix) e do banco do Jandaia OS.
(function(){
  let s = 20261027;
  const rnd = () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
  const pick = a => a[Math.floor(rnd() * a.length)];
  const int = (a, b) => a + Math.floor(rnd() * (b - a + 1));

  const regioes = ['Centro', 'Bela Vista', 'São José', 'Planalto', 'Vila Nova', 'Morada do Sol'];
  const nomes = ['Ana','Bruno','Carla','Diego','Elaine','Fábio','Gisele','Hugo','Ingrid','João','Karina','Lucas','Marta','Nilton','Olívia','Paulo','Queila','Rafael','Sandra','Tiago','Úrsula','Vítor','Wellington','Yasmin','Zeca','Adriana','Bernardo','Cíntia','Davi','Érica'];
  const sobren = ['Silva','Souza','Lima','Alves','Barbosa','Ferreira','Gomes','Melo','Cavalcanti','Araújo','Pereira','Nascimento','Rocha','Santos','Oliveira'];
  const pessoa = () => pick(nomes) + ' ' + pick(sobren);

  const equipe = [
    { id:'u1', nome:'Patrícia Moura', cargo:'Atendente de cobrança', setor:'Cobrança', adm:'2022-03-14', perfil:'cobranca' },
    { id:'u2', nome:'Renata Cruz', cargo:'Atendente de cobrança', setor:'Cobrança', adm:'2023-08-01', perfil:'cobranca' },
    { id:'u3', nome:'Larissa Teles', cargo:'Atendente de cobrança', setor:'Cobrança', adm:'2025-02-10', perfil:'cobranca' },
    { id:'u4', nome:'Camila Rêgo', cargo:'Atendente / Retenção', setor:'Atendimento', adm:'2021-11-03', perfil:'cobranca' },
    { id:'u5', nome:'Jéssica Lins', cargo:'Atendente', setor:'Atendimento', adm:'2024-05-20', perfil:'cobranca' },
    { id:'u6', nome:'Marcos Paiva', cargo:'Técnico de campo', setor:'Técnico', adm:'2020-07-06', perfil:'tecnico' },
    { id:'u7', nome:'Anderson Leal', cargo:'Técnico de campo', setor:'Técnico', adm:'2022-01-17', perfil:'tecnico' },
    { id:'u8', nome:'Rodrigo Brito', cargo:'Técnico de campo', setor:'Técnico', adm:'2024-09-02', perfil:'tecnico' },
    { id:'u9', nome:'Felipe Dantas', cargo:'Técnico de campo', setor:'Técnico', adm:'2023-04-11', perfil:'tecnico' },
    { id:'u10', nome:'Sérgio Vilar', cargo:'Supervisor técnico', setor:'Técnico', adm:'2019-02-01', perfil:'supervisor' },
    { id:'u11', nome:'Daniela Pontes', cargo:'Analista de RH / Adm.', setor:'Administrativo', adm:'2021-06-14', perfil:'rh' },
    { id:'u12', nome:'Thiago Amorim', cargo:'Auxiliar administrativo', setor:'Administrativo', adm:'2025-06-02', perfil:'adm' },
  ];
  const cobradoras = equipe.filter(e => ['u1','u2','u3'].includes(e.id));

  const planos = [{n:'300 Mega',v:79.9},{n:'500 Mega',v:99.9},{n:'700 Mega',v:119.9},{n:'1 Giga',v:149.9}];
  const resultados = ['Não atendeu','Mensagem enviada','Aguardando retorno','Promessa de pagamento','Negociação em andamento','Pagamento confirmado','Cliente sem interesse','Necessita intervenção'];
  const canais = ['Ligação','WhatsApp','SMS','E-mail','Presencial'];

  const hoje = new Date('2026-10-27T10:30:00');
  const dia = d => { const x = new Date(hoje); x.setDate(x.getDate() + d); return x; };
  const iso = d => d.toISOString();

  // Cobranças: clientes suspensos/inadimplentes importados do ERP (simulado)
  const cobrancas = [];
  const finais = ['Pagamento confirmado','Pagamento confirmado','Pagamento confirmado','Promessa de pagamento','Promessa de pagamento','Negociação em andamento','Aguardando retorno','Não atendeu','Mensagem enviada','Cliente sem interesse','Necessita intervenção'];
  for (let i = 0; i < 128; i++) {
    const p = pick(planos), atraso = int(3, 75), resp = cobradoras[i % 3];
    const c = { id:'C' + (10230 + i * 7), cliente:pessoa(), regiao:pick(regioes), plano:p.n, mensal:p.v,
      aberto: +(p.v * Math.max(1, Math.round(atraso / 30))).toFixed(2), atraso, situacao: atraso > 15 ? 'Suspenso' : 'Inadimplente',
      resp:resp.id, tentativas:[], status:'Sem tratativa', proxima:null, origem:'ERP · contrato ' + int(4000, 9999) };
    const n = i % 19 === 0 ? 0 : int(1, 4);
    for (let k = 0; k < n; k++) {
      const canal = pick(canais), res = k === n - 1 ? pick(finais) : pick(resultados.slice(0, 3));
      const comprovado = canal === 'WhatsApp' ? rnd() > .15 : canal === 'Ligação' ? rnd() > .7 : false;
      c.tentativas.push({ id:'t' + i + '_' + k, quando: iso(dia(-(n - k) * int(1, 3))), por:resp.id, canal, resultado:res,
        obs: res === 'Promessa de pagamento' ? 'Cliente prometeu pagar até sexta.' : res === 'Não atendeu' ? 'Chamou até cair.' : '',
        prova: comprovado ? (canal === 'Ligação' ? 'PABX · chamada 00:0' + int(1,9) + ':' + int(10,59) : 'WhatsApp · mensagem entregue e lida') : null });
    }
    if (n) {
      const ult = c.tentativas[n - 1];
      c.status = ult.resultado;
      if (ult.resultado === 'Promessa de pagamento') c.promessa = iso(dia(int(-4, 4)));
      c.proxima = iso(dia(int(-3, 3)));
    }
    cobrancas.push(c);
  }

  // Cancelamentos (ERP + WhatsApp cruzados)
  const motivos = ['Instabilidade / quedas','Preço','Mudança de endereço','Atendimento','Concorrente com oferta','Velocidade abaixo do contratado','Dificuldade financeira'];
  const ofertas = ['Upgrade de plano sem custo por 3 meses','Desconto de 20% por 6 meses','Visita técnica prioritária','Troca de equipamento','Nenhuma oferta aceita'];
  const cancelamentos = [];
  for (let i = 0; i < 34; i++) {
    const p = pick(planos), mot = rnd() < .34 ? motivos[0] : pick(motivos);
    const st = i < 9 ? 'Pendente' : rnd() < .42 ? 'Revertido' : 'Cancelado';
    cancelamentos.push({ id:'X' + (500 + i), cliente:pessoa(), regiao: mot === motivos[0] && rnd() < .5 ? 'Vila Nova' : pick(regioes), plano:p.n, mensal:p.v,
      data: iso(dia(-int(0, 26))), motivo:mot, secundario: rnd() < .5 ? pick(motivos) : '', resp: pick(['u4','u5']).toString(),
      osTecnicas: mot === motivos[0] ? int(2, 5) : int(0, 1), reclamacoes: int(0, 4), oferta: st === 'Revertido' ? pick(ofertas.slice(0, 4)) : st === 'Pendente' ? '' : pick(ofertas),
      status:st, clienteDesde: 2019 + int(0, 6) });
  }
  const cancelHist = [ {m:'mai',c:31,r:12},{m:'jun',c:28,r:11},{m:'jul',c:35,r:13},{m:'ago',c:30,r:14},{m:'set',c:33,r:15},{m:'out',c:41,r:16} ];

  // Risco de cancelamento por regras (não é previsão de IA)
  const riscos = [];
  for (let i = 0; i < 12; i++) {
    const reg = [];
    if (rnd() < .7) reg.push(int(2, 4) + ' OS técnicas em 30 dias');
    if (rnd() < .5) reg.push('reclamação no WhatsApp nos últimos 7 dias');
    if (rnd() < .4) reg.push('fatura atrasada ' + int(5, 20) + ' dias');
    if (rnd() < .3) reg.push('região com incidente recente');
    if (!reg.length) reg.push('consultou plano de concorrente (atendimento)');
    riscos.push({ cliente:pessoa(), regiao:pick(regioes), plano:pick(planos).n, regras:reg, pontos: reg.length * int(18, 26) });
  }
  riscos.sort((a, b) => b.pontos - a.pontos);

  // Ordens de serviço
  const tiposOS = ['Instalação','Sem conexão','Lentidão','Troca de equipamento','Mudança de endereço','Retirada'];
  const os = [];
  for (let i = 0; i < 64; i++) {
    const tec = pick(equipe.filter(e => e.perfil === 'tecnico')), tipo = pick(tiposOS);
    const prazo = dia(int(-3, 2)), st = rnd() < .55 ? 'Concluída' : rnd() < .5 ? 'Em andamento' : 'Aberta';
    os.push({ id:'OS-' + (7810 + i), tipo, cliente:pessoa(), regiao:pick(regioes), tec:tec.id, prazo:iso(prazo), status:st,
      atrasada: st !== 'Concluída' && prazo < hoje, reaberta: st === 'Concluída' && rnd() < .09, horas: +(1 + rnd() * 5).toFixed(1) });
  }

  // Rede (NOC) — integrações em modo somente leitura
  const equipamentos = [
    { nome:'BRAS-01 · MikroTik CCR2116', tipo:'Concentrador', pop:'POP Centro', st:'ok', cpu:41, mem:52, lat:2, perda:0, x:46, y:42 },
    { nome:'Borda · Link IP 1 (10G)', tipo:'Link', pop:'POP Centro', st:'ok', uso:63, lat:4, perda:0, x:49, y:37 },
    { nome:'Borda · Link IP 2 (10G)', tipo:'Link', pop:'POP Bela Vista', st:'at', uso:88, lat:19, perda:1.2, x:32, y:58 },
    { nome:'OLT-02 · Vila Nova', tipo:'OLT', pop:'POP Vila Nova', st:'cr', cpu:0, mem:0, lat:null, perda:100, x:63, y:78 },
    { nome:'OLT-01 · Centro', tipo:'OLT', pop:'POP Centro', st:'ok', cpu:28, mem:44, lat:3, perda:0, x:44, y:46 },
    { nome:'OLT-03 · São José', tipo:'OLT', pop:'POP São José', st:'ok', cpu:35, mem:40, lat:5, perda:0, x:25, y:44 },
    { nome:'SW-Core · Jardim SP', tipo:'Switch', pop:'POP Planalto', st:'ok', cpu:18, mem:30, lat:3, perda:0, x:58, y:24 },
    { nome:'SW-Acesso · Morada do Sol', tipo:'Switch', pop:'POP Morada do Sol', st:'at', cpu:76, mem:81, lat:12, perda:.4, x:72, y:52 },
  ];
  const incidentes = [
    { id:'INC-311', titulo:'OLT-02 Vila Nova sem resposta (ICMP/SNMP)', inicio: iso(new Date(hoje.getTime() - 47*60000)), sev:'cr', afetados:412, status:'Aberto', resp:'u10', regiao:'Vila Nova', chamados:23 },
    { id:'INC-310', titulo:'Link IP 2 com perda de pacotes acima de 1%', inicio: iso(new Date(hoje.getTime() - 3.2*3600000)), sev:'at', afetados:0, status:'Em análise', resp:'u10', regiao:'Bela Vista', chamados:4 },
    { id:'INC-307', titulo:'Queda de energia no POP São José', inicio: iso(dia(-2)), sev:'cr', afetados:288, status:'Resolvido', resp:'u10', regiao:'São José', chamados:31, duracao:'1h52' },
    { id:'INC-302', titulo:'Rompimento de fibra · Av. Central', inicio: iso(dia(-6)), sev:'cr', afetados:96, status:'Resolvido', resp:'u10', regiao:'Centro', chamados:14, duracao:'4h10' },
  ];
  const latencia = Array.from({length:48}, (_, i) => +(3 + Math.sin(i/5)*1.5 + rnd()*1.5 + (i > 40 ? 9 + rnd()*6 : 0)).toFixed(1));

  // RH
  const rh = equipe.map((e, i) => ({ ...e,
    situacao: i === 8 ? 'Férias' : i === 11 ? 'Experiência' : 'Ativo',
    ferias: i === 8 ? 'Em férias até 08/11' : ['Vencem em 42 dias','Agendadas para jan/27','Em dia','Vencidas há 12 dias','Em dia'][i % 5],
    aso: ['Em dia (jun/27)','Vence em 9 dias','Em dia (mar/27)','Vencido há 4 dias','Em dia (dez/26)','Vence em 25 dias'][i % 6],
    nr: e.setor === 'Técnico' ? (i % 2 ? 'NR-35 vence em 18 dias' : 'NR-10 e NR-35 em dia') : '—',
    pend: i === 11 ? 3 : i % 4 === 0 ? 1 : 0 }));
  const checklists = [
    { titulo:'Admissão · Thiago Amorim', tipo:'Admissão', itens:[['Contrato assinado',1],['Exame admissional',1],['Cadastro no ERP',1],['Treinamento de LGPD',0],['Entrega de EPI / crachá',1],['Acesso ao WhatsApp da empresa',0]], resp:'u11', prazo:'31/10' },
    { titulo:'Desligamento · ex-técnico (set/26)', tipo:'Desligamento', itens:[['Recolher equipamentos e ferramentas',1],['Revogar acessos ERP/WhatsApp/rede',1],['Exame demissional',1],['Baixa no estoque',0]], resp:'u11', prazo:'vencido' },
  ];

  // Tarefas (módulo de responsabilidades)
  const tarefas = [
    { id:'T-118', titulo:'Conferir fechamento de caixa da semana', resp:'u12', valida:'u11', prazo: iso(dia(-1)), prio:'Alta', status:'Atrasada', evid:true },
    { id:'T-121', titulo:'Renovar alvará de funcionamento do POP Bela Vista', resp:'u11', valida:'dir', prazo: iso(dia(5)), prio:'Crítica', status:'Em andamento', evid:true },
    { id:'T-124', titulo:'Inventário de ONUs em estoque', resp:'u9', valida:'u10', prazo: iso(dia(2)), prio:'Média', status:'Aberta', evid:true },
    { id:'T-125', titulo:'Ligar para 12 promessas vencidas', resp:'u2', valida:'u4', prazo: iso(dia(0)), prio:'Alta', status:'Em andamento', evid:false },
    { id:'T-112', titulo:'Revisar contrato do link IP 2', resp:'dir', valida:'dir', prazo: iso(dia(-4)), prio:'Alta', status:'Aguardando validação', evid:true },
    { id:'T-109', titulo:'Treinamento de LGPD da equipe de atendimento', resp:'u11', valida:'dir', prazo: iso(dia(-8)), prio:'Média', status:'Concluída', evid:true },
  ];

  window.GN = { hoje, equipe, cobradoras, cobrancas, cancelamentos, cancelHist, riscos, os, equipamentos, incidentes, latencia, rh, checklists, tarefas,
    regioes, resultados, canais, motivos,
    kpi: { ativos:6184, ativosAnt:6129, faturamento:618420, fatMeta:640000,
      cancelMes:41, novos:96, pedidosCancel:9, atendAndamento:37, disponibilidade:99.62, tma:'6 min', tmr:'14 min', nps:71,
      fatHist:[571,580,589,597,604,618], inadHist:[5.6,5.3,5.1,5.4,4.9,4.6] } };
})();
