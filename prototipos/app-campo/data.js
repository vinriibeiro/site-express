/* Aplicativo de Campo · dados 100% fictícios (empresa "Brisa Instalações").
   Ao personalizar para um cliente, troque este arquivo pelos conectores reais. */
window.BRISA = {
  empresa: 'Brisa Instalações',
  agente: { nome: 'Marcos Teixeira', curto: 'Marcos', cargo: 'Instalador de campo', equipe: 'Equipe Norte', iniciais: 'MT' },
  dia: { extenso: 'quinta-feira, 12 de novembro', curto: '12/11', inicioMin: 10 * 60 + 42 },
  metaDia: { visitas: 8, vendas: 2 },
  metaSemana: { visitas: 40, vendas: 8 },

  tipos: {
    instalacao: { nome: 'Instalação', icone: 'wrench' },
    venda: { nome: 'Venda', icone: 'tag' },
    suporte: { nome: 'Suporte', icone: 'headset' },
    cobranca: { nome: 'Cobrança', icone: 'receipt' }
  },

  checklists: {
    instalacao: ['Conferir equipamentos do pedido', 'Passar e fixar o cabo', 'Instalar e configurar o roteador', 'Testar velocidade no Wi-Fi', 'Coletar o aceite do cliente'],
    venda: ['Apresentar os planos disponíveis', 'Confirmar endereço e cobertura', 'Conferir documento do cliente', 'Explicar prazo de instalação'],
    suporte: ['Verificar luzes do equipamento', 'Testar velocidade na tomada', 'Trocar cabo ou reiniciar equipamento', 'Confirmar que o problema foi resolvido'],
    cobranca: ['Confirmar a fatura em aberto', 'Oferecer a segunda via', 'Registrar a promessa de pagamento']
  },

  planos: [
    { id: 'p300', nome: 'Brisa 300', vel: '300 Mega', preco: 79.9, desc: 'Wi-Fi 6 para 1 a 3 pessoas' },
    { id: 'p500', nome: 'Brisa 500', vel: '500 Mega', preco: 99.9, desc: 'Streaming e home office' },
    { id: 'p700tv', nome: 'Brisa 700 + TV', vel: '700 Mega', preco: 139.9, desc: 'Internet e 90 canais de TV' },
    { id: 'p1g', nome: 'Brisa 1 Giga + TV Max', vel: '1 Giga', preco: 179.9, desc: 'Casa conectada, 130 canais' }
  ],

  bairros: ['Jardim das Acácias', 'Vila Aurora', 'Parque Ipê', 'Residencial Bosque Azul', 'Centro Novo', 'Setor Lagoa Verde'],
  ocorrencias: ['Rede danificada ou cabo caído', 'Rua sem cobertura', 'Cliente pediu retorno', 'Concorrente ativo na área', 'Poste ou caixa com problema'],
  reagendar: ['Amanhã, 09:00', 'Amanhã, 14:00', 'Sexta, 09:00'],

  /* Rota do dia (ordem de visita). "feito" traz o resumo das visitas já concluídas. */
  visitas: [
    { id: 'v1', hora: '08:30', tipo: 'instalacao', cliente: 'Helena Prado', tel: '(61) 90000-1101', end: 'Qd 14, Lt 7', bairro: 'Jardim das Acácias', ref: 'Casa de esquina, portão verde', nota: 'Plano Brisa 500 contratado há 3 dias. Cliente pede instalação no quarto dos fundos.', status: 'concluida',
      feito: { checkin: '08:34', dist: 12, resultado: 'concluida', checks: [0, 1, 2, 3, 4], obs: 'Roteador no quarto dos fundos. Cliente testou o Wi-Fi e aprovou.', fotos: ['roteador', 'cabo'] } },
    { id: 'v2', hora: '09:20', tipo: 'suporte', cliente: 'Osvaldo Rezende', tel: '(61) 90000-1102', end: 'Rua 3, Casa 22', bairro: 'Vila Aurora', ref: 'Em frente à padaria', nota: 'Reclama de queda de sinal à noite.', status: 'concluida',
      feito: { checkin: '09:22', dist: 21, resultado: 'concluida', checks: [0, 1, 2, 3], obs: 'Cabo com emenda trocado. Sinal estável.', fotos: ['teste'] } },
    { id: 'v3', hora: '10:10', tipo: 'venda', cliente: 'Renata Quintão', tel: '(61) 90000-1103', end: 'Qd 8, Cj C, Lt 12', bairro: 'Parque Ipê', ref: 'Sobrado azul', nota: 'Indicação de cliente. Quer internet e TV.', status: 'venda',
      feito: { checkin: '10:12', dist: 9, resultado: 'venda', plano: 'p500', checks: [0, 1, 2, 3], obs: 'Fechou o Brisa 500. Instalação combinada para segunda.', fotos: [] } },
    { id: 'v4', hora: '11:00', tipo: 'instalacao', cliente: 'Cláudio Barreto', tel: '(61) 90000-1104', end: 'Qd 22, Lt 3', bairro: 'Residencial Bosque Azul', ref: 'Portão preto, ao lado da quadra', nota: 'Plano Brisa 700 + TV. Levar 2 decodificadores.', status: 'pendente' },
    { id: 'v5', hora: '13:30', tipo: 'cobranca', cliente: 'Mercadinho Dois Irmãos', tel: '(61) 90000-1105', end: 'Av. Central 410, Sl 2', bairro: 'Centro Novo', ref: 'Térreo, ao lado da farmácia', nota: 'Fatura de outubro em aberto. Dono prefere pagar no PIX.', status: 'pendente' },
    { id: 'v6', hora: '14:20', tipo: 'venda', cliente: 'Família Ventura', tel: '(61) 90000-1106', end: 'Qd 5, Casa 18', bairro: 'Jardim das Acácias', ref: 'Rua do campinho', nota: 'Pediram proposta para 4 pessoas em home office.', status: 'pendente' },
    { id: 'v7', hora: '15:10', tipo: 'suporte', cliente: 'Priscila Nogueira', tel: '(61) 90000-1107', end: 'Rua das Gaivotas 87', bairro: 'Vila Aurora', ref: 'Casa 2 no fundo do lote', nota: 'Roteador reiniciando sozinho.', status: 'pendente' },
    { id: 'v8', hora: '16:00', tipo: 'instalacao', cliente: 'Edson Camargo', tel: '(61) 90000-1108', end: 'Qd 3, Lt 14', bairro: 'Setor Lagoa Verde', ref: 'Casa branca, número no muro', nota: 'Plano Brisa 300. Cliente só estará em casa após as 15:30.', status: 'pendente' }
  ],

  semana: [
    { dia: 'Seg', data: '09/11', visitas: 8, vendas: 2 },
    { dia: 'Ter', data: '10/11', visitas: 7, vendas: 1 },
    { dia: 'Qua', data: '11/11', visitas: 9, vendas: 3 }
  ],

  /* O que o gestor já vê de toda a equipe, sem a parte do Marcos (somada ao vivo). */
  gestor: {
    equipe: 14, emCampo: 11, visitas: 49, vendas: 8, ocorrencias: 4, metaVisitas: 112,
    feed: [
      { quem: 'Letícia R.', txt: 'Venda fechada · Brisa 700 + TV', t: 'há 3 min' },
      { quem: 'Paulo S.', txt: 'Instalação concluída · Vila Aurora', t: 'há 9 min' },
      { quem: 'Iara M.', txt: 'Ocorrência · Rua sem cobertura', t: 'há 14 min' }
    ]
  },

  /* Fotos simuladas (ilustrações; nenhuma câmera é acessada). */
  fotos: [
    { id: 'roteador', nome: 'Roteador instalado', svg: '<rect width="120" height="90" fill="#dbeafe"/><rect y="64" width="120" height="26" fill="#bfd4f6"/><rect x="14" y="62" width="92" height="5" rx="2" fill="#8aa6d6"/><rect x="38" y="30" width="3" height="22" rx="1.5" fill="#1e3a8a"/><rect x="79" y="30" width="3" height="22" rx="1.5" fill="#1e3a8a"/><rect x="28" y="48" width="64" height="16" rx="5" fill="#1e3a8a"/><circle cx="40" cy="56" r="2.2" fill="#93c5fd"/><circle cx="49" cy="56" r="2.2" fill="#93c5fd"/><circle cx="58" cy="56" r="2.2" fill="#3b82f6"/><path d="M48 24a16 16 0 0 1 24 0M53 29a9 9 0 0 1 14 0" stroke="#3b82f6" stroke-width="3" stroke-linecap="round" fill="none"/>' },
    { id: 'fachada', nome: 'Fachada do imóvel', svg: '<rect width="120" height="90" fill="#e6f0ff"/><rect y="68" width="120" height="22" fill="#c5d9f7"/><rect x="26" y="40" width="68" height="34" fill="#f8fbff"/><path d="M20 42 60 18l40 24z" fill="#1e3a8a"/><rect x="52" y="52" width="16" height="22" rx="2" fill="#3b82f6"/><rect x="33" y="50" width="12" height="11" rx="1.5" fill="#bfdbfe"/><rect x="75" y="50" width="12" height="11" rx="1.5" fill="#bfdbfe"/><circle cx="102" cy="22" r="7" fill="#fde68a"/>' },
    { id: 'caixa', nome: 'Caixa de emenda', svg: '<rect width="120" height="90" fill="#dce8fb"/><rect x="55" y="6" width="10" height="84" fill="#7a8fb3"/><rect x="36" y="26" width="48" height="34" rx="4" fill="#1e3a8a"/><rect x="42" y="32" width="36" height="22" rx="2" fill="#16306f"/><circle cx="50" cy="43" r="3" fill="#93c5fd"/><circle cx="60" cy="43" r="3" fill="#3b82f6"/><circle cx="70" cy="43" r="3" fill="#93c5fd"/><path d="M0 18C30 28 40 22 55 26M65 26C85 22 100 32 120 20" stroke="#42597d" stroke-width="2" fill="none"/>' },
    { id: 'cabo', nome: 'Cabeamento', svg: '<rect width="120" height="90" fill="#e8eefb"/><path d="M0 60h120" stroke="#cfdcf3" stroke-width="2"/><path d="M8 72C30 72 34 30 58 30s28 40 54 40" stroke="#1e3a8a" stroke-width="4" stroke-linecap="round" fill="none"/><circle cx="30" cy="62" r="3.5" fill="#fff" stroke="#3b82f6" stroke-width="2"/><circle cx="58" cy="30" r="3.5" fill="#fff" stroke="#3b82f6" stroke-width="2"/><circle cx="86" cy="62" r="3.5" fill="#fff" stroke="#3b82f6" stroke-width="2"/>' },
    { id: 'teste', nome: 'Teste de velocidade', svg: '<rect width="120" height="90" fill="#0f2548"/><path d="M26 66a34 34 0 0 1 68 0" stroke="#27407a" stroke-width="9" stroke-linecap="round" fill="none"/><path d="M26 66a34 34 0 0 1 52-29" stroke="#60a5fa" stroke-width="9" stroke-linecap="round" fill="none"/><path d="M60 66 76 42" stroke="#fff" stroke-width="3" stroke-linecap="round"/><circle cx="60" cy="66" r="4.5" fill="#fff"/><text x="60" y="84" text-anchor="middle" font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="#bfdbfe">312 Mb/s</text>' },
    { id: 'tv', nome: 'TV configurada', svg: '<rect width="120" height="90" fill="#e3ecfc"/><rect x="18" y="16" width="84" height="50" rx="5" fill="#0f2548"/><rect x="22" y="20" width="76" height="42" rx="3" fill="#2f5fc4"/><path d="M54 30l18 11-18 11z" fill="#fff"/><rect x="52" y="66" width="16" height="7" fill="#42597d"/><rect x="40" y="72" width="40" height="5" rx="2.5" fill="#42597d"/>' }
  ]
};
