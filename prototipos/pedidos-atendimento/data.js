/* Casa Prática Assistência · empresa FICTÍCIA. Dados 100% inventados, semente fixa (sempre iguais).
   Hoje, na simulação, é sempre 09/11/2026. Telefones no padrão (61) 90000-0XXX são fictícios. */
(function () {
  'use strict';
  var HOJE = '2026-11-09';
  function dia(off) {
    var d = new Date(2026, 10, 9 + off);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  var ETAPAS = [
    { id: 'novo', nome: 'Novo', curto: 'Novo', cor: '#3b82f6' },
    { id: 'analise', nome: 'Em análise', curto: 'Análise', cor: '#1d4ed8' },
    { id: 'aguardando', nome: 'Aguardando peça/cliente', curto: 'Aguardando', cor: '#b76e00' },
    { id: 'execucao', nome: 'Em execução', curto: 'Execução', cor: '#0e7490' },
    { id: 'pronto', nome: 'Pronto', curto: 'Pronto', cor: '#0f7a4d' },
    { id: 'entregue', nome: 'Entregue', curto: 'Entregue', cor: '#5a6f8f' }
  ];

  var EQUIPE = [
    { id: 'camila', nome: 'Camila Duarte', papel: 'Atendimento', cor: '#1e3a8a' },
    { id: 'everton', nome: 'Everton Lima', papel: 'Técnico', cor: '#0f6b6b' },
    { id: 'paulo', nome: 'Paulo Siqueira', papel: 'Técnico', cor: '#4338ca' },
    { id: 'marcos', nome: 'Marcos Tavares', papel: 'Técnico', cor: '#8a4b08' },
    { id: 'helena', nome: 'Helena Barros', papel: 'Gestão', cor: '#7f1d4e' }
  ];

  var PERFIS = {
    atendente: { nome: 'Atendente', usuario: 'camila', menu: ['quadro', 'conversas'],
      desc: 'Vê todos os pedidos, cria pedidos, conversa com clientes e registra aprovações.' },
    tecnico: { nome: 'Técnico', usuario: 'everton', menu: ['quadro'],
      desc: 'Vê somente os seus pedidos, atualiza checklist e peças, não entrega nem aprova orçamento.' },
    gestor: { nome: 'Gestor', usuario: 'helena', menu: ['quadro', 'conversas', 'indicadores', 'automacoes'],
      desc: 'Vê tudo, inclusive Indicadores e Automações.' }
  };

  var CLIENTES = [
    ['c1', 'Marlene Albuquerque', '(61) 90000-0147', '2025-03-12'],
    ['c2', 'Sérgio Nogueira', '(61) 90000-0138', '2024-08-02'],
    ['c3', 'Iraci Matos', '(61) 90000-0121', '2026-11-03'],
    ['c4', 'Tatiane Furtado', '(61) 90000-0152', '2026-02-19'],
    ['c5', 'Osvaldo Brandão', '(61) 90000-0109', '2025-10-27'],
    ['c6', 'Luciana Pimentel', '(61) 90000-0166', '2025-06-08'],
    ['c7', 'Gilberto Cavalcante', '(61) 90000-0173', '2024-12-15'],
    ['c8', 'Renata Quintela', '(61) 90000-0184', '2026-05-30'],
    ['c9', 'Haroldo Vasques', '(61) 90000-0195', '2025-01-21'],
    ['c10', 'Cláudia Ferraz', '(61) 90000-0116', '2026-07-09'],
    ['c11', 'Edson Moraes', '(61) 90000-0127', '2026-09-14'],
    ['c12', 'Beatriz Lacerda', '(61) 90000-0133', '2025-11-04'],
    ['c13', 'Wagner Teixeira', '(61) 90000-0141', '2024-05-18'],
    ['c14', 'Joana Medeiros', '(61) 90000-0158', '2026-03-23'],
    ['c15', 'Fábio Camargo', '(61) 90000-0162', '2025-09-01'],
    ['c16', 'Vera Lúcia Prado', '(61) 90000-0179', '2024-10-11'],
    ['c17', 'Alan Pacheco', '(61) 90000-0188', '2026-08-26'],
    ['c18', 'Dalva Rezende', '(61) 90000-0192', '2025-04-17'],
    ['c19', 'Nelson Bittencourt', '(61) 90000-0104', '2026-10-30'],
    ['c20', 'Cíntia Barcellos', '(61) 90000-0111', '2026-01-08'],
    ['c21', 'Moacir Andrade', '(61) 90000-0123', '2025-07-25'],
    ['c22', 'Dionísio Reis', '(61) 90000-0131', ''],
    ['c23', 'Simone Arantes', '(61) 90000-0142', ''],
    ['c24', 'Rogério Falcão', '(61) 90000-0155', '']
  ].map(function (c) { return { id: c[0], nome: c[1], tel: c[2], desde: c[3] }; });

  var CHECK_PADRAO = ['Conferir o defeito relatado', 'Testar o equipamento na entrada', 'Registrar fotos e número de série',
    'Enviar orçamento ao cliente', 'Executar o reparo', 'Teste final de funcionamento', 'Limpeza e embalagem'];
  var CHECK_FEITOS = { novo: 0, analise: 2, aguardando: 3, execucao: 4, pronto: 7, entregue: 7 };

  function orc(txt) { return txt.map(function (x) { return { d: x[0], q: x[1], v: x[2] }; }); }

  // [num, cliente, aparelho, defeito, origem, resp, etapa, criadoHaDias, prazo(+dias), ultimaMovHaDias, orcamento, statusOrc, anexos, extra]
  var BRUTO = [
    [1049, 'c1', 'Lavadora 11 kg', 'Não centrifuga e faz barulho forte na hora de torcer a roupa.', 'WhatsApp', 'camila', 'novo', 0, 5, 0, [], 'sem', ['foto-lavadora-frente.jpg']],
    [1048, 'c2', 'Micro-ondas 30 L', 'Gira o prato, mas não esquenta a comida.', 'Balcão', 'camila', 'novo', 0, 4, 0, [], 'sem', []],
    [1047, 'c3', 'Geladeira frost free', 'A parte de baixo não gela e acumula gelo no fundo.', 'Telefone', 'camila', 'novo', 1, 3, 1, [], 'sem', []],
    [1046, 'c4', 'Ar-condicionado split 12.000 BTU', 'Pinga água dentro de casa quando está ligado.', 'WhatsApp', 'everton', 'analise', 2, 2, 1,
      [['Visita técnica e diagnóstico', 1, 90]], 'pendente', ['foto-etiqueta-split.jpg', 'video-pingando.mp4']],
    [1045, 'c5', 'Fogão 5 bocas', 'O acendedor automático falha em duas bocas.', 'Balcão', 'paulo', 'analise', 3, 1, 1, [], 'sem', []],
    [1044, 'c6', 'Lava-louças 12 serviços', 'Não escoa a água no final do ciclo.', 'WhatsApp', 'marcos', 'analise', 4, -1, 2,
      [['Visita técnica e diagnóstico', 1, 90]], 'pendente', ['foto-mangueira.jpg']],
    [1043, 'c19', 'Ventilador de coluna', 'O motor trava e esquenta em poucos minutos.', 'WhatsApp', 'everton', 'analise', 2, 3, 1, [], 'sem', []],
    [1042, 'c7', 'Secadora 10 kg', 'Roda, mas não aquece a roupa.', 'WhatsApp', 'everton', 'aguardando', 7, -2, 4,
      [['Resistência da secadora', 1, 240], ['Mão de obra', 1, 150]], 'aprovado', ['laudo-secadora.pdf'],
      { nota: 'Peça solicitada ao fornecedor: resistência. Previsão de chegada em 11/11.' }],
    [1041, 'c8', 'Geladeira duplex', 'O compressor não parte; só se ouve um estalo.', 'Telefone', 'paulo', 'aguardando', 5, 2, 2,
      [['Relé e protetor térmico', 1, 185], ['Mão de obra', 1, 220]], 'pendente', ['foto-compressor.jpg'],
      { nota: 'Orçamento enviado. Aguardando o cliente decidir.' }],
    [1040, 'c9', 'Forno elétrico de embutir', 'Resistência superior queimada.', 'Balcão', 'marcos', 'aguardando', 8, -3, 5,
      [['Resistência superior', 1, 190], ['Mão de obra', 1, 120]], 'pendente', [],
      { nota: 'Cliente pediu para pensar. Sem retorno há 5 dias.' }],
    [1039, 'c10', 'Lavadora 9 kg', 'Vaza água pela porta durante a lavagem.', 'WhatsApp', 'everton', 'execucao', 6, 1, 1,
      [['Borracha da porta', 1, 95], ['Mão de obra', 1, 130]], 'aprovado', ['foto-borracha-rasgada.jpg']],
    [1038, 'c11', 'Cooktop 4 bocas', 'A mesa elétrica não acende.', 'WhatsApp', 'paulo', 'execucao', 5, 0, 1,
      [['Módulo de acendimento', 1, 210], ['Mão de obra', 1, 110]], 'aprovado', ['foto-modulo.jpg']],
    [1037, 'c12', 'Ar-condicionado split 9.000 BTU', 'Limpeza completa e verificação do gás.', 'Telefone', 'marcos', 'execucao', 4, 2, 1,
      [['Limpeza completa', 1, 180], ['Verificação de pressão do gás', 1, 70]], 'aprovado', []],
    [1036, 'c13', 'Purificador de água', 'Não gela e pinga embaixo.', 'Balcão', 'everton', 'execucao', 9, -1, 3,
      [['Placa eletrônica', 1, 260], ['Mão de obra', 1, 100]], 'aprovado', ['foto-placa.jpg']],
    [1035, 'c14', 'Lavadora 12 kg', 'Rolamento do cesto fazendo ruído alto.', 'WhatsApp', 'paulo', 'pronto', 9, 1, 1,
      [['Rolamento (par)', 1, 220], ['Retentor', 1, 45], ['Mão de obra', 1, 200]], 'aprovado', ['foto-rolamento.jpg']],
    [1034, 'c15', 'Micro-ondas 25 L', 'O painel não responde ao toque.', 'Balcão', 'marcos', 'pronto', 8, 0, 1,
      [['Placa de comando', 1, 230], ['Mão de obra', 1, 90]], 'aprovado', []],
    [1033, 'c16', 'Geladeira 1 porta', 'Borracha da porta ressecada, não veda.', 'WhatsApp', 'everton', 'pronto', 7, 2, 0,
      [['Borracha da porta', 1, 120], ['Mão de obra', 1, 80]], 'aprovado', []],
    [1032, 'c17', 'Fogão 4 bocas', 'O forno não mantém a temperatura.', 'Balcão', 'paulo', 'entregue', 10, -3, 2,
      [['Termostato do forno', 1, 150], ['Mão de obra', 1, 120]], 'aprovado', []],
    [1031, 'c18', 'Lava-louças 8 serviços', 'Não completa o ciclo e apaga no meio.', 'Telefone', 'marcos', 'entregue', 11, -4, 3,
      [['Placa de potência', 1, 310], ['Mão de obra', 1, 140]], 'aprovado', []],
    [1030, 'c20', 'Geladeira frost free', 'Faz barulho e congela a gaveta de legumes.', 'WhatsApp', 'everton', 'entregue', 12, -4, 3,
      [['Sensor de degelo', 1, 85], ['Mão de obra', 1, 160]], 'aprovado', []],
    [1029, 'c21', 'Secadora 8 kg', 'Não liga.', 'Balcão', 'paulo', 'entregue', 13, -5, 4,
      [['Botão seletor', 1, 70], ['Mão de obra', 1, 110]], 'aprovado', []],
    [1028, 'c2', 'Aspirador de pó vertical', 'Perde sucção após poucos minutos.', 'Balcão', 'marcos', 'entregue', 14, -6, 5,
      [['Filtro e escovas', 1, 60], ['Mão de obra', 1, 80]], 'aprovado', []],
    [1026, 'c1', 'Ferro de passar a vapor', 'Não gera vapor.', 'Telefone', 'everton', 'entregue', 21, -13, 15,
      [['Válvula de vapor', 1, 55], ['Mão de obra', 1, 70]], 'aprovado', []]
  ];

  function hm(i) { return ['08:35', '09:20', '10:05', '11:40', '13:15', '14:30', '15:45', '16:20'][i % 8]; }
  function ts(offDias, i) { return dia(offDias) + 'T' + hm(i); }
  function nomeEq(id) { for (var i = 0; i < EQUIPE.length; i++) if (EQUIPE[i].id === id) return EQUIPE[i].nome; return id; }

  function montarEventos(b, p) {
    var idx = 0;
    for (var i = 0; i < ETAPAS.length; i++) if (ETAPAS[i].id === p.et) idx = i;
    var ev = [{ q: ts(-b[7], b[0]), tipo: 'criado', txt: 'Pedido criado por ' + b[4] + ' (registrado por Camila Duarte).' }];
    for (var s = 1; s <= idx; s++) {
      var off = -b[7] + Math.round(s * (b[7] - b[9]) / idx);
      var autor = (s === 1 || s === 5) ? 'Camila Duarte' : nomeEq(p.resp);
      ev.push({ q: ts(off, b[0] + s), tipo: 'etapa', txt: 'Etapa alterada para "' + ETAPAS[s].nome + '" por ' + autor + '.' });
      if (s === 2 && p.orcSt === 'pendente') ev.push({ q: ts(off, b[0] + s + 2), tipo: 'orcamento', txt: 'Orçamento enviado ao cliente. Aguardando aprovação.' });
      if (s === 3 && p.orcSt === 'aprovado') ev.push({ q: ts(off, b[0] + s + 2), tipo: 'orcamento', txt: 'Orçamento aprovado pelo cliente pelo WhatsApp.' });
    }
    if (p.orcSt === 'pendente' && idx === 1) ev.push({ q: ts(-b[9], b[0] + 3), tipo: 'orcamento', txt: 'Orçamento de visita técnica enviado ao cliente.' });
    if (p.et === 'pronto' || p.et === 'entregue') ev.push({ q: ts(-b[9], b[0] + 6), tipo: 'whatsapp', txt: 'Atualização enviada ao cliente por WhatsApp (simulado).' });
    if (b[13] && b[13].nota) ev.push({ q: ts(-b[9], b[0] + 7), tipo: 'nota', txt: b[13].nota });
    ev.sort(function (a, c) { return a.q < c.q ? -1 : a.q > c.q ? 1 : 0; });
    return ev;
  }

  var PEDIDOS = BRUTO.map(function (b) {
    var p = {
      id: 'PA-' + b[0], cli: b[1], ap: b[2], def: b[3], org: b[4], resp: b[5], et: b[6],
      cri: dia(-b[7]), prazo: dia(b[8]), ult: dia(-b[9]),
      itens: orc(b[10]), orcSt: b[11], anexos: b[12].slice()
    };
    var feitos = CHECK_FEITOS[p.et];
    p.check = CHECK_PADRAO.map(function (t, i) { return { t: t, ok: i < feitos }; });
    p.ev = montarEventos(b, p);
    return p;
  });

  // Conversas: [id, cliente, naoLidas, pedidoVinculado, triagem{ap,def}, mensagens]
  // mensagem: [dia, de(c=cliente, e=empresa, s=sistema), hora, texto, status]
  var CONVERSAS_BRUTO = [
    ['v1', 'c3', 0, 'PA-1047', null, [
      ['09/11', 'c', '08:12', 'Bom dia! Liguei ontem sobre a geladeira. Podem me passar por aqui o número do pedido?', ''],
      ['09/11', 'e', '08:20', 'Bom dia, Iraci! Seu pedido é o PA-1047. A análise está prevista para esta semana.', 'lido']]],
    ['v2', 'c1', 1, 'PA-1049', { ap: 'Lavadora 11 kg', def: 'Não centrifuga e faz barulho forte na hora de torcer a roupa.' }, [
      ['09/11', 'c', '08:42', 'Bom dia! Minha lavadora parou de centrifugar e está fazendo um barulho forte.', ''],
      ['09/11', 'e', '08:44', 'Bom dia, Marlene! Aqui é a Camila, da Casa Prática. Pode me dizer a capacidade da lavadora e se ela chega a encher de água?', 'lido'],
      ['09/11', 'c', '08:47', 'É de 11 kg. Enche e lava normal, só não torce a roupa.', ''],
      ['09/11', 'e', '08:50', 'Perfeito, já registrei seu pedido PA-1049. Podemos agendar a análise ainda esta semana?', 'lido'],
      ['09/11', 'c', '09:15', 'Pode ser na quinta de manhã?', '']]],
    ['v3', 'c6', 1, 'PA-1044', null, [
      ['08/11', 'e', '10:05', 'Luciana, o técnico Marcos passou aqui e vai nos enviar o diagnóstico da lava-louças ainda hoje.', 'lido'],
      ['08/11', 'c', '10:31', 'Obrigada! Fico no aguardo.', ''],
      ['09/11', 'c', '09:48', 'Bom dia. Já passou do prazo que vocês me deram. Conseguem me dar uma previsão?', '']]],
    ['v4', 'c22', 2, null, { ap: 'Geladeira', def: 'Congela os alimentos da parte de cima e a água fica com gelo.' }, [
      ['09/11', 'c', '10:58', 'Boa tarde, minha geladeira está congelando tudo da parte de cima, até a água.', ''],
      ['09/11', 'c', '10:59', 'Vocês fazem visita no Guará?', '']]],
    ['v5', 'c4', 0, 'PA-1046', null, [
      ['08/11', 'c', '14:10', 'Segue a foto da etiqueta do ar-condicionado.', ''],
      ['08/11', 'e', '14:18', 'Recebido, Tatiane! O Everton faz a visita amanhã de manhã.', 'lido'],
      ['09/11', 'e', '09:05', 'O diagnóstico ficou pronto. Enviei o orçamento da visita pelo e-mail. Qualquer dúvida, é só chamar.', 'lido'],
      ['09/11', 'c', '09:30', 'Vi, obrigada. Vou conversar com meu marido e te respondo.', '']]],
    ['v6', 'c7', 0, 'PA-1042', null, [
      ['07/11', 'e', '16:00', 'Gilberto, a resistência da sua secadora já foi pedida ao fornecedor. Previsão de chegada: 11/11.', 'lido'],
      ['07/11', 'c', '16:22', 'Certo. E o prazo final continua o mesmo?', ''],
      ['07/11', 'e', '16:30', 'Vamos precisar de mais 2 dias por causa da peça. Peço desculpas pelo atraso.', 'lido'],
      ['09/11', 'c', '08:05', 'Ok, sem problema. Me avisem quando chegar.', '']]],
    ['v7', 'c10', 0, 'PA-1039', null, [
      ['08/11', 'c', '11:20', 'Aprovado o orçamento da borracha da lavadora.', ''],
      ['08/11', 'e', '11:26', 'Obrigada, Cláudia! O Everton já começou o reparo. Previsão de conclusão: 10/11.', 'lido']]],
    ['v8', 'c14', 0, 'PA-1035', null, [
      ['08/11', 'e', '17:02', 'Joana, a sua lavadora de 12 kg está pronta para retirada. Atendemos até as 18h.', 'lido'],
      ['09/11', 'c', '07:55', 'Bom dia! Passo aí amanhã às 10h, tudo bem?', ''],
      ['09/11', 'e', '08:10', 'Combinado! Vamos deixar separada no balcão.', 'lido']]],
    ['v9', 'c23', 1, null, { ap: 'Ar-condicionado split', def: 'Não liga; a luz do painel fica piscando.' }, [
      ['09/11', 'c', '11:05', 'O ar-condicionado do quarto não liga, só fica piscando uma luz verde.', '']]],
    ['v10', 'c24', 0, null, { ap: 'Fogão', def: 'Pedido de visita técnica para orçamento.' }, [
      ['08/11', 'c', '18:40', 'Boa noite. Vocês fazem visita técnica para fogão? Como funciona?', ''],
      ['09/11', 'e', '08:00', 'Bom dia, Rogério! Fazemos sim. O técnico avalia no local e o valor da visita é informado antes de agendar.', 'lido']]]
  ];

  var CONVERSAS = CONVERSAS_BRUTO.map(function (c) {
    return { id: c[0], cli: c[1], nl: c[2], pedido: c[3], triagem: c[4],
      msgs: c[5].map(function (m) { return { d: m[0], de: m[1], h: m[2], t: m[3], st: m[4] }; }) };
  });

  var RESPOSTAS = [
    { r: 'Pedir foto da etiqueta', t: 'Olá! Aqui é da Casa Prática. Pode enviar uma foto da etiqueta do aparelho, com o modelo e o número de série?' },
    { r: 'Confirmar visita', t: 'Podemos confirmar a visita técnica para amanhã, entre 9h e 12h?' },
    { r: 'Orçamento pronto', t: 'O orçamento está pronto. Posso enviar os detalhes por aqui para você aprovar?' },
    { r: 'Equipamento pronto', t: 'Seu equipamento está pronto para retirada. Atendemos de segunda a sábado, das 8h às 18h.' },
    { r: 'Pedir desculpas pelo atraso', t: 'Pedimos desculpas pela demora. Já estamos priorizando o seu pedido e retornamos com uma previsão ainda hoje.' }
  ];

  var MODELOS = {
    novo: 'Olá, {nome}! Recebemos o seu pedido {num} ({ap}) na Casa Prática. Em breve nossa equipe faz a análise e retornamos por aqui.',
    analise: 'Olá, {nome}! Estamos analisando o seu equipamento ({ap}), pedido {num}. Assim que o diagnóstico ficar pronto, enviamos o orçamento.',
    aguardando: 'Olá, {nome}! O pedido {num} ({ap}) está aguardando. {motivo} Qualquer dúvida, é só responder esta mensagem.',
    execucao: 'Olá, {nome}! O reparo do pedido {num} ({ap}) já começou. Previsão de conclusão: {prazo}.',
    pronto: 'Boa notícia, {nome}! O seu equipamento ({ap}) está pronto para retirada, pedido {num}. Atendemos de segunda a sábado, das 8h às 18h.',
    entregue: 'Obrigada por confiar na Casa Prática, {nome}! O pedido {num} foi entregue. O serviço tem 90 dias de garantia. Se precisar, é só chamar por aqui.'
  };

  var AUTOMACOES = [
    { id: 'a1', quando: 'Ao entrar em "Pronto"', entao: 'Avisar o cliente no WhatsApp', det: 'Envia o modelo de mensagem da etapa e registra na linha do tempo do pedido.', on: true, n: 41, icone: 'whatsapp' },
    { id: 'a2', quando: 'Pedido parado há 3 dias', entao: 'Alertar o responsável', det: 'O técnico recebe um aviso e o cartão ganha o selo de parado no quadro.', on: true, n: 17, icone: 'clock' },
    { id: 'a3', quando: 'Novo pedido pelo WhatsApp', entao: 'Distribuir ao atendente com menos pedidos', det: 'Equilibra a fila de triagem sem ninguém precisar escolher.', on: true, n: 58, icone: 'users' },
    { id: 'a4', quando: 'Prazo vence amanhã', entao: 'Lembrar o responsável', det: 'Aviso às 8h com a lista dos pedidos que vencem no dia seguinte.', on: true, n: 33, icone: 'calendar' },
    { id: 'a5', quando: 'Orçamento aprovado', entao: 'Mover para "Em execução"', det: 'Quando o atendente marca o orçamento como aprovado, o pedido avança sozinho.', on: false, n: 0, icone: 'arrow' },
    { id: 'a6', quando: 'Pedido entregue', entao: 'Pedir avaliação ao cliente depois de 2 dias', det: 'Mensagem curta com uma nota de 1 a 5 e um espaço para comentário.', on: false, n: 0, icone: 'star' },
    { id: 'a7', quando: 'Pedido atrasado', entao: 'Avisar o gestor', det: 'Resumo diário com os atrasos e o motivo informado por cada responsável.', on: true, n: 12, icone: 'alert' }
  ];

  // Indicadores (histórico fixo dos últimos 30 dias, para os gráficos que não dependem do quadro)
  var HISTORICO = {
    tempoMedio: [ // dias em cada etapa
      { et: 'novo', d: 0.5 }, { et: 'analise', d: 1.4 }, { et: 'aguardando', d: 2.9 }, { et: 'execucao', d: 2.1 }, { et: 'pronto', d: 1.2 }
    ],
    metaDias: 2,
    serie: { // últimos 14 dias, de 26/10 a 08/11 (+ hoje parcial não incluído)
      recebidos: [6, 5, 4, 7, 6, 3, 1, 5, 6, 4, 7, 5, 3, 2],
      entregues: [4, 6, 5, 5, 6, 2, 1, 4, 5, 6, 5, 6, 3, 1]
    },
    concluidosMes: { everton: 27, paulo: 24, marcos: 21 },
    tempoExec: { everton: 1.9, paulo: 2.3, marcos: 2.6 }
  };

  var ANEXOS_EXEMPLO = ['foto-aparelho-' + '01.jpg', 'foto-etiqueta-02.jpg', 'video-defeito-03.mp4', 'nota-de-compra.pdf', 'foto-peca-04.jpg'];

  window.DADOS = {
    HOJE: HOJE, dia: dia, ETAPAS: ETAPAS, EQUIPE: EQUIPE, PERFIS: PERFIS, CLIENTES: CLIENTES, PEDIDOS: PEDIDOS,
    CONVERSAS: CONVERSAS, RESPOSTAS: RESPOSTAS, MODELOS: MODELOS, AUTOMACOES: AUTOMACOES, HISTORICO: HISTORICO,
    ANEXOS_EXEMPLO: ANEXOS_EXEMPLO, CHECK_PADRAO: CHECK_PADRAO
  };
})();
