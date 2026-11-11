// DADOS DE SIMULAÇÃO · conversas da Norte Conecta (empresa fictícia).
// 1) Chat da venda: backoffice e vendedor resolvem pendências dentro de cada venda.
// 2) Chat Express: central de atendimento (WhatsApp e chat do site) com bot, filas e atendentes.
// Nomes, telefones e e-mails são inventados. Nada é enviado a lugar nenhum.
(function () {
  const D = window.NC, HOJE = D.hoje;
  const vend = id => D.vendedores.find(v => v.id === id);
  const prim = nome => nome.split(' ')[0];
  const hm = (h, m) => String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');

  // ---------------------------------------------------------------
  // 1. Chat da venda (backoffice ↔ vendedor)
  // ---------------------------------------------------------------
  const BO = 'Sofia Lemos';
  const MODELOS = [
    { tema: 'Documento', m: [['bo', 'Oi, {v}! A venda de {c} está sem a foto do documento. Consegue mandar por aqui?'], ['vend', 'Mando agora, estou com o cliente.'], ['vend', 'documento-{id}.jpg', 'anexo'], ['bo', 'Recebi, obrigada! Sigo com o cadastro.']] },
    { tema: 'Endereço', m: [['bo', '{v}, o endereço de {c} está sem número. Pode confirmar?'], ['vend', 'É número 245, bloco B. Desculpa!'], ['bo', 'Atualizei. Agora só falta a viabilidade sair.']] },
    { tema: 'Contato', m: [['bo', '{c} não atendeu a ligação de confirmação de dados. Você tem outro telefone do cliente?']] },
    { tema: 'Instalação', m: [['vend', 'O cliente {c} pediu para antecipar a instalação. Tem janela amanhã?'], ['bo', 'Tenho amanhã às 14h. Confirmo com ele por você?']] },
    { tema: 'CPF', m: [['bo', 'O CPF de {c} está com dígito diferente do documento. Confere pra mim?'], ['vend', 'Corrigi na ficha, era 7 no final.'], ['bo', 'Perfeito, liberado para agendar.']] },
  ];
  const AGENDA = { tema: 'Agendamento', m: [['sis', 'Instalação agendada para {dia} · período da manhã'], ['bo', 'Técnico confirmado. Avise {c}, por favor.'], ['vend', 'Avisado ✅']] };
  const vendaChats = {};
  const monta = (x, mod, dia, lidoForcado) => {
    const v = vend(x.vend); let h = 9 + (Number(x.id.slice(-2)) % 7), m = Number(x.id.slice(-1)) * 5;
    const msgs = mod.m.map(([de, t, tipo]) => {
      m += 7 + (t.length % 9); if (m >= 60) { h++; m -= 60; }
      const txt = t.replace('{v}', prim(v.nome)).replace('{c}', x.cliente).replace('{id}', x.id.toLowerCase()).replace('{dia}', String(Math.min(30, x.d + 3)).padStart(2, '0') + '/11');
      return { de, autor: de === 'bo' ? BO : de === 'vend' ? v.nome : 'Sistema', txt, d: dia, h: hm(h, m), tipo: tipo || '' };
    });
    const ult = msgs[msgs.length - 1], recente = dia >= HOJE - 2;
    const lido = { bo: !(ult.de === 'vend' && recente), vend: !(ult.de === 'bo' && recente) };
    if (lidoForcado) Object.assign(lido, lidoForcado);
    vendaChats[x.id] = { tema: mod.tema, msgs, lido };
  };
  const pend = D.vendas.filter(x => x.status === 'Pendente');
  pend.forEach((x, i) => monta(x, MODELOS[i % MODELOS.length], Math.min(HOJE, x.d + (i % 2))));
  D.vendas.filter(x => x.status === 'Agendada').forEach((x, i) => { if (i % 3 === 0) monta(x, AGENDA, Math.min(HOJE, x.d + 1)); });
  // garante que o vendedor da demonstração (Davi Prado) tenha mensagens novas para ler
  const davi = D.vendedores.find(v => v.nome === 'Davi Prado');
  D.vendas.filter(x => x.vend === davi.id && x.status !== 'Cancelada' && x.status !== 'Instalada').slice(-2)
    .forEach((x, i) => monta(x, MODELOS[i ? 0 : 2], HOJE, i ? { vend: false } : null));
  D.vendaChats = vendaChats;
  D.backoffice = BO;

  // ---------------------------------------------------------------
  // 2. Chat Express (central de atendimento)
  // ---------------------------------------------------------------
  const antes = (t, min) => { const [a, b] = t.split(':').map(Number), x = a * 60 + b - min; return hm(Math.floor(x / 60), x % 60); };
  // clientes com venda já lançada viram contatos "Cliente" no Chat Express
  const clientes = D.vendas.filter(x => x.status === 'Instalada').slice(-40);
  const cli = i => clientes[(i * 7) % clientes.length];
  const P = [
    // nome, canal, departamento, status, última msg, hora, responsável, plano, cidade, UF, etiqueta, não lidas, prioridade, cliente existente
    ['Mariana Couto', 'whatsapp', 'Comercial', 'atendimento', 'Vocês conseguem verificar a disponibilidade no meu endereço?', '09:42', 'Sofia Lemos', 'Fibra 500 Mega', 'Taguatinga', 'DF', 'Novo cliente', 2, false, false],
    ['', 'whatsapp', 'Suporte técnico', 'fila', 'Minha internet está oscilando desde ontem à noite.', '09:40', null, '', '', '', 'Prioridade', 3, true, true],
    ['', 'site', 'Financeiro', 'fila', 'Pode me ajudar com a segunda via da fatura?', '09:38', null, '', '', '', 'Financeiro', 1, false, true],
    ['Pedro Henrique Lins', 'whatsapp', 'Comercial', 'atendimento', 'Perfeito! Pode agendar a instalação.', '09:35', 'Davi Prado', 'Combo Fibra + TV', 'Brasília', 'DF', 'Instalação', 0, false, false],
    ['', 'site', 'Suporte técnico', 'aguardando', 'Vou reiniciar o roteador e já retorno.', '09:32', 'Rafael Couto', '', '', '', 'Suporte', 0, false, true],
    ['Lucas Bittencourt', 'whatsapp', 'Comercial', 'triagem', 'Quais planos vocês têm aqui em Goiânia?', '09:29', null, 'A definir', 'Goiânia', 'GO', 'Novo cliente', 1, false, false],
    ['', 'whatsapp', 'Financeiro', 'atendimento', 'Recebi o código Pix, obrigada!', '09:25', 'Júlia Arantes', '', '', '', 'Financeiro', 0, false, true],
    ['', 'whatsapp', 'Suporte técnico', 'fila', 'Estou sem conexão e trabalho de casa. Urgente!', '09:21', null, '', '', '', 'Prioridade', 2, true, true],
    ['Patrícia Valença', 'site', 'Comercial', 'atendimento', 'Gostaria de mudar para um plano maior.', '09:18', 'Davi Prado', 'Fibra 300 Mega', 'Anápolis', 'GO', 'Upgrade', 0, false, false],
    ['André Figueira', 'site', 'Comercial', 'triagem', 'Vocês atendem no Setor Bueno?', '09:15', null, 'A definir', 'Goiânia', 'GO', 'Viabilidade', 0, false, false],
    ['', 'whatsapp', 'Financeiro', 'fila', 'Quero mudar o dia de vencimento.', '09:10', null, '', '', '', 'Financeiro', 1, false, true],
    ['Thiago Rezende', 'site', 'Suporte técnico', 'atendimento', 'O Wi-Fi não chega no quarto dos fundos.', '09:08', 'Rafael Couto', 'Fibra 500 Mega', 'Uberlândia', 'MG', 'Suporte', 0, false, false],
    ['Letícia Amaral', 'whatsapp', 'Comercial', 'aguardando', 'Vou confirmar o endereço com a minha mãe.', '09:02', 'Sofia Lemos', 'Fibra 1 Giga', 'Ceilândia', 'DF', 'Instalação', 0, false, false],
    ['Gabriel Seixas', 'site', 'Comercial', 'resolvida', 'Tudo certo. Muito obrigado pelo atendimento!', '08:56', 'Davi Prado', 'Combo Fibra + TV', 'Barreiras', 'BA', 'Cliente', 0, false, false],
    ['Renata Diniz', 'whatsapp', 'Suporte técnico', 'fila', 'Preciso trocar a senha do Wi-Fi.', '08:51', null, 'Fibra 300 Mega', 'Uberaba', 'MG', 'Suporte', 0, false, false],
    ['Felipe Camargo', 'whatsapp', 'Comercial', 'atendimento', 'Pode mandar os detalhes do plano empresarial?', '08:45', 'Sofia Lemos', 'Empresarial', 'Brasília', 'DF', 'Empresarial', 0, false, false],
  ];
  const conversas = P.map((p, i) => {
    const c = p[13] ? cli(i) : null;
    const nome = c ? c.cliente : p[0];
    const o = {
      id: 'cx' + (i + 1), nome, canal: p[1], dep: p[2], st: p[3], prev: p[4], h: p[5], resp: p[6],
      plano: c ? c.produto : p[7], cidade: c ? c.cidade : p[8], uf: c ? c.uf : p[9], tag: c ? 'Cliente' : p[10], nl: p[11], prio: p[12],
      venda: c ? c.id : null, tel: '(61) 90000-' + String(1100 + i * 7).padStart(4, '0'), email: 'contato' + (i + 1) + '@exemplo.invalid',
      protocolo: 'NC-1811-' + String(301 + i).padStart(4, '0'), notas: 0,
    };
    o.msgs = [
      { t: 'sis', txt: 'Conversa iniciada pelo ' + (o.canal === 'site' ? 'chat do site' : 'WhatsApp'), h: antes(o.h, 4) },
      { t: 'in', txt: 'Olá! Preciso de uma ajuda, por favor.', h: antes(o.h, 3) },
      { t: 'bot', txt: 'Olá! Aqui é a assistente virtual da Norte Conecta. 😊 Me conta em poucas palavras como posso ajudar.', h: antes(o.h, 3) },
      { t: 'in', txt: o.prev, h: o.h },
    ];
    if (o.st !== 'triagem') o.msgs.splice(3, 0, { t: 'bot', txt: 'Entendi! Vou te encaminhar para o time de ' + o.dep + '.', h: antes(o.h, 2) });
    if (o.resp) {
      o.msgs.splice(4, 0, { t: 'sis', txt: o.resp + ' assumiu o atendimento', h: antes(o.h, 2) }, { t: 'out', autor: o.resp, txt: 'Oi, ' + prim(nome) + '! Aqui é ' + prim(o.resp) + ', da Norte Conecta. Já estou com a sua conversa. 😊', h: antes(o.h, 1) });
    }
    if (o.st === 'resolvida') o.msgs.push({ t: 'sis', txt: 'Atendimento encerrado por ' + o.resp + ' · Dúvida esclarecida', h: antes(o.h, -1) });
    return o;
  });
  // conversa de destaque, mais completa
  const c0 = conversas[0];
  c0.msgs = [
    { t: 'sis', txt: 'Conversa iniciada pelo WhatsApp · anúncio "Fibra 500 Mega"', h: '09:31' },
    { t: 'in', txt: 'Bom dia! Vi o anúncio de vocês e queria saber mais sobre os planos de internet. 😊', h: '09:32' },
    { t: 'bot', txt: 'Bom dia, Mariana! Sou a assistente virtual da Norte Conecta. Vou te passar para o nosso time comercial.', h: '09:33' },
    { t: 'sis', txt: 'Sofia Lemos assumiu o atendimento', h: '09:35' },
    { t: 'out', autor: 'Sofia Lemos', txt: 'Oi, Mariana! Tudo bem? Sou a Sofia, da Norte Conecta. Vai ser um prazer te ajudar! Em qual bairro você mora?', h: '09:36' },
    { t: 'in', txt: 'Moro em Taguatinga Norte. Tenho interesse no plano de 500 Mega.', h: '09:39' },
    { t: 'nota', autor: 'Davi Prado', txt: 'Cliente veio pela campanha de novembro. Conferir viabilidade antes de prometer data de instalação.', h: '09:40' },
    { t: 'in', txt: 'Vocês conseguem verificar a disponibilidade no meu endereço?', h: '09:42' },
  ];
  c0.notas = 1;

  D.cx = {
    conversas,
    atendentes: [
      { nome: 'Sofia Lemos', papel: 'Backoffice', dep: 'Comercial', on: true },
      { nome: 'Davi Prado', papel: 'Vendedor', dep: 'Comercial', on: true },
      { nome: 'Rafael Couto', papel: 'Atendente', dep: 'Suporte técnico', on: true },
      { nome: 'Júlia Arantes', papel: 'Atendente', dep: 'Financeiro', on: true },
      { nome: 'Marina Tavares', papel: 'Líder', dep: 'Comercial', on: false },
    ],
    departamentos: ['Comercial', 'Suporte técnico', 'Financeiro'],
    respostas: [
      { k: 'cep', t: 'Consultar cobertura', txt: 'Claro, {nome}! Me passa o seu CEP e o número do imóvel que eu confiro a cobertura da fibra agora. 😊' },
      { k: 'agenda', t: 'Agendar instalação', txt: '{nome}, para a instalação tenho manhã (8h às 12h) ou tarde (13h às 18h). Qual fica melhor?' },
      { k: 'reiniciar', t: 'Reiniciar roteador', txt: '{nome}, pode desligar o roteador da tomada por 30 segundos e ligar de novo? Me avisa quando as luzes estabilizarem.' },
      { k: 'segundavia', t: 'Segunda via', txt: 'Posso ajudar, {nome}! Vou gerar a segunda via e já te mando o código Pix por aqui.' },
      { k: 'planos', t: 'Tabela de planos', txt: 'Nossos planos: Fibra 300 Mega R$ 89,90 · 500 Mega R$ 109,90 · 1 Giga R$ 149,90 · Combo Fibra + TV R$ 159,90. Qual combina mais com você?' },
      { k: 'obrigado', t: 'Encerramento', txt: 'Obrigado pelo contato, {nome}! Qualquer coisa é só chamar por aqui. Tenha um ótimo dia! 💙' },
    ],
    // novos contatos que "chegam" durante a demonstração
    chegando: [
      ['Simone Arruda', 'whatsapp', 'Comercial', 'Oi! Vocês têm fibra em Luziânia?', 'Luziânia', 'GO'],
      ['Caio Monteiro', 'site', 'Suporte técnico', 'A internet caiu aqui na loja, preciso de ajuda.', 'Brasília', 'DF'],
      ['Elaine Furtado', 'whatsapp', 'Financeiro', 'Paguei a fatura ontem e ainda aparece em aberto.', 'Uberlândia', 'MG'],
      ['Rogério Paiva', 'whatsapp', 'Comercial', 'Quanto fica o combo com TV?', 'Barreiras', 'BA'],
      ['Tânia Brito', 'site', 'Comercial', 'Quero contratar o plano de 1 Giga.', 'Goiânia', 'GO'],
    ],
    relatorio: {
      horas: [['08h', 6], ['09h', 17], ['10h', 21], ['11h', 19], ['12h', 10], ['13h', 12], ['14h', 18], ['15h', 15], ['16h', 14], ['17h', 10], ['18h', 6]],
      deps: [['Comercial', 71, '1m 18s', '9m 40s', 96], ['Suporte técnico', 48, '2m 05s', '12m 10s', 91], ['Financeiro', 29, '1m 52s', '6m 30s', 95]],
      ranking: [['Sofia Lemos', 46, '0m 58s', 97], ['Davi Prado', 31, '1m 12s', 98], ['Rafael Couto', 39, '2m 01s', 92], ['Júlia Arantes', 27, '1m 47s', 95]],
      bot: { resolvidas: 34, encaminhadas: 114, total: 148 },
    },
  };
})();
