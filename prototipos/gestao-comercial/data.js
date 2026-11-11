// DADOS DE SIMULAÇÃO · Norte Conecta (empresa fictícia). Gerados com semente fixa: a demonstração é sempre igual.
// Na versão real, estes objetos vêm dos conectores (sistema da operadora, planilhas, CRM) e do banco de dados do cliente.
(function () {
  let s = 20261118;
  const rnd = () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
  const pick = a => a[Math.floor(rnd() * a.length)];
  const int = (a, b) => a + Math.floor(rnd() * (b - a + 1));
  const wpick = (items, w) => { let t = 0; w.forEach(x => t += x); let r = rnd() * t; for (let i = 0; i < items.length; i++) { r -= w[i]; if (r < 0) return items[i]; } return items[items.length - 1]; };

  const DIAS = 30, HOJE = 18;            // "hoje" fictício = 18/11/2026 (1º de novembro de 2026 é domingo)
  const peso = [0];                       // peso comercial de cada dia (domingo e feriado vendem menos)
  for (let d = 1; d <= DIAS; d++) { const dow = (d - 1) % 7; let w = dow === 0 ? .15 : dow === 6 ? .7 : 1; if (d === 2) w = .4; peso[d] = w; }

  const cidades = {
    DF: { nome: 'Distrito Federal', c: [['Brasília', 5], ['Taguatinga', 3], ['Ceilândia', 3]] },
    GO: { nome: 'Goiás', c: [['Goiânia', 5], ['Anápolis', 3], ['Aparecida de Goiânia', 3], ['Luziânia', 2]] },
    MG: { nome: 'Minas Gerais', c: [['Uberlândia', 5], ['Uberaba', 3], ['Patos de Minas', 2]] },
    BA: { nome: 'Bahia', c: [['Barreiras', 4], ['Luís Eduardo Magalhães', 3], ['Vitória da Conquista', 3]] },
  };
  const produtos = [
    { id: 'f300', nome: 'Fibra 300 Mega', valor: 89.9, peso: 25 },
    { id: 'f500', nome: 'Fibra 500 Mega', valor: 109.9, peso: 22 },
    { id: 'f1g', nome: 'Fibra 1 Giga', valor: 149.9, peso: 10 },
    { id: 'ctv', nome: 'Combo Fibra + TV', valor: 159.9, peso: 20 },
    { id: 'ctf', nome: 'Combo Fibra + TV + Fone', valor: 189.9, peso: 8 },
    { id: 'mov', nome: 'Plano móvel 30 GB', valor: 69.9, peso: 15 },
  ];
  const origens = ['Indicação', 'Anúncio online', 'WhatsApp', 'Loja', 'Porta a porta'];
  const primeiros = ['Helena', 'Marcos', 'Isabela', 'Rodrigo', 'Camila', 'Vinícius', 'Fernanda', 'Leandro', 'Patrícia', 'Gabriel', 'Aline', 'Eduardo', 'Juliana', 'Ricardo', 'Mariana', 'André', 'Beatriz', 'Sérgio', 'Natália', 'Wagner', 'Débora', 'Cláudio', 'Luiza', 'Ernesto', 'Sabrina', 'Jonas', 'Elisa', 'Moisés'];
  const sobrenomes = ['Albuquerque', 'Barros', 'Coutinho', 'Domingues', 'Fontes', 'Garcia', 'Holanda', 'Ibrahim', 'Jardim', 'Lacerda', 'Matos', 'Novaes', 'Ornelas', 'Pimentel', 'Quintela', 'Ramos', 'Salgado', 'Torres', 'Uchoa', 'Valadares', 'Xavier', 'Zambelli'];
  const cliente = () => pick(primeiros) + ' ' + pick(sobrenomes);

  const equipes = [
    { id: 'aurora', nome: 'Equipe Aurora', lider: 'Marina Tavares', ufs: { DF: .7, GO: .3 }, fator: 1.06, cor: '#1e3a8a' },
    { id: 'horizonte', nome: 'Equipe Horizonte', lider: 'Rogério Esteves', ufs: { GO: .8, DF: .2 }, fator: .96, cor: '#2563eb' },
    { id: 'cerrado', nome: 'Equipe Cerrado', lider: 'Tereza Camargo', ufs: { MG: .85, GO: .15 }, fator: .9, cor: '#5b9cf6' },
    { id: 'delta', nome: 'Equipe Delta', lider: 'Anderson Veloso', ufs: { BA: .9, MG: .1 }, fator: .8, cor: '#9cc3fb' },
  ];
  const elenco = {
    aurora: ['Davi Prado', 'Helena Siqueira', 'Caio Bastos', 'Larissa Neves', 'Otávio Leal', 'Bianca Rangel'],
    horizonte: ['Paula Nogueira', 'Thiago Macedo', 'Renata Pacheco', 'Gustavo Farias', 'Alice Viana'],
    cerrado: ['Felipe Duarte', 'Vanessa Dantas', 'Murilo Azevedo', 'Cíntia Brandão', 'Heitor Sampaio'],
    delta: ['Joana Cordeiro', 'Samuel Peixoto', 'Letícia Andrade', 'Nicolas Guedes', 'Priscila Moraes'],
  };
  const especiais = { 'Davi Prado': { alvo: 1.2 }, 'Bianca Rangel': { status: 'Em treinamento', alvo: .75, adm: '2026-09-14' }, 'Gustavo Farias': { status: 'Em férias', alvo: .5 }, 'Priscila Moraes': { status: 'Em treinamento', alvo: .8, adm: '2026-10-05' }, 'Vanessa Dantas': { alvo: 1.22 }, 'Paula Nogueira': { alvo: 1.0 }, 'Samuel Peixoto': { alvo: .68 } };
  const semAcento = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  const vendedores = [];
  equipes.forEach(e => {
    e.vendedores = [];
    elenco[e.id].forEach(nome => {
      const x = especiais[nome] || {};
      const v = {
        id: 'u' + (vendedores.length + 1), nome, equipe: e.id, cargo: 'Vendedor', status: x.status || 'Ativo',
        login: semAcento(nome).replace(' ', '.'), adm: x.adm || ('202' + int(2, 5) + '-' + String(int(1, 12)).padStart(2, '0') + '-' + String(int(1, 28)).padStart(2, '0')),
        meta: int(25, 34), alvo: x.alvo || (e.fator * (0.9 + rnd() * 0.28)),
      };
      if (x.status === 'Em treinamento') v.meta = 18;
      if (x.status === 'Em férias') v.meta = 22;
      v.k = v.alvo * v.meta / (1 + 9.7 / 14.25) / 0.91 / 14.25 / 1.5 * 1.1;
      vendedores.push(v); e.vendedores.push(v.id);
    });
  });

  // vendas do mês, de 01/11 a 18/11
  const brutas = [];
  vendedores.forEach(v => {
    const e = equipes.find(q => q.id === v.equipe);
    for (let d = 1; d <= HOJE; d++) {
      const lam = v.k * 1.5 * peso[d], p = Math.min(.92, lam / 4);
      let q = 0; for (let t = 0; t < 4; t++) if (rnd() < p) q++;
      for (let i = 0; i < q; i++) {
        const uf = wpick(Object.keys(e.ufs), Object.values(e.ufs));
        const cid = wpick(cidades[uf].c.map(c => c[0]), cidades[uf].c.map(c => c[1]));
        const pr = wpick(produtos, produtos.map(x => x.peso));
        const idade = HOJE - d;
        const status = idade >= 7 ? wpick(['Instalada', 'Cancelada', 'Agendada', 'Pendente'], [82, 9, 6, 3])
          : idade >= 3 ? wpick(['Instalada', 'Agendada', 'Pendente', 'Cancelada'], [45, 35, 12, 8])
            : wpick(['Instalada', 'Agendada', 'Pendente', 'Cancelada'], [8, 40, 45, 7]);
        brutas.push({ d, h: int(8, 19), m: int(0, 59), cliente: cliente(), vend: v.id, eq: v.equipe, produto: pr.nome, valor: pr.valor, uf, cidade: cid, status });
      }
    }
  });
  brutas.sort((a, b) => a.d - b.d || a.h - b.h || a.m - b.m);
  const vendas = brutas.map((x, i) => Object.assign({ id: 'V-' + (41200 + i) }, x));

  // comparativo com o mesmo período do mês anterior e histórico
  const ticketDe = id => { const l = vendas.filter(x => x.vend === id && x.status !== 'Cancelada'); return l.length ? l.reduce((a, b) => a + b.valor, 0) / l.length : 110; };
  vendedores.forEach(v => {
    const liq = vendas.filter(x => x.vend === v.id && x.status !== 'Cancelada').length;
    v.prev = Math.max(2, Math.round(liq * (0.82 + rnd() * 0.36)));
    v.prevValor = Math.round(v.prev * ticketDe(v.id) * (0.95 + rnd() * 0.1) * 100) / 100;
    v.prevCanc = Math.round(v.prev * (0.05 + rnd() * 0.07));
    const base = v.meta * (0.78 + rnd() * 0.28);
    v.hist = [Math.round(base * (0.9 + rnd() * .2)), Math.round(base * (0.9 + rnd() * .2)), Math.round(base * (0.95 + rnd() * .2)), Math.round(v.prev * 1.62)];
    if (v.status === 'Em treinamento') v.hist = [0, 0, Math.round(v.prev * .5), Math.round(v.prev * 1.4)];
  });

  // oportunidades do funil
  const etapas = [
    { id: 'novo', nome: 'Novo', cor: '#93c5fd' }, { id: 'contato', nome: 'Contato', cor: '#5b9cf6' }, { id: 'proposta', nome: 'Proposta', cor: '#2563eb' },
    { id: 'fechado', nome: 'Fechado', cor: '#0f7a4d' }, { id: 'perdido', nome: 'Perdido', cor: '#9aa8bf' },
  ];
  const proximas = { novo: 'Ligar para qualificar', contato: 'Enviar proposta', proposta: 'Cobrar retorno', fechado: 'Agendar instalação', perdido: '' };
  const motivos = ['Preço', 'Contratou outra operadora', 'Sem cobertura no endereço', 'Sem retorno do cliente'];
  const oportunidades = [];
  vendedores.forEach(v => {
    const e = equipes.find(q => q.id === v.equipe);
    const qtd = v.status === 'Em férias' ? 1 : v.status === 'Em treinamento' ? 2 : int(3, 5);
    for (let i = 0; i < qtd; i++) {
      const uf = wpick(Object.keys(e.ufs), Object.values(e.ufs));
      const cid = wpick(cidades[uf].c.map(c => c[0]), cidades[uf].c.map(c => c[1]));
      const pr = wpick(produtos, produtos.map(x => x.peso));
      const et = wpick(etapas.map(x => x.id), [26, 24, 20, 18, 12]);
      oportunidades.push({ id: 'O-' + (2100 + oportunidades.length), cliente: cliente(), vend: v.id, eq: v.equipe, produto: pr.nome, valor: pr.valor, uf, cidade: cid, etapa: et, dias: int(0, 11), origem: pick(origens), motivo: et === 'perdido' ? pick(motivos) : '' });
    }
  });

  // prévia fixa da importação de planilha (demonstração: o arquivo nunca é lido)
  const importacao = [];
  const vlist = vendedores.filter(v => v.status === 'Ativo');
  const avisos = { 4: 'Cidade "Brasilia" sem acento: será padronizada para "Brasília".', 9: 'Valor R$ 0,00: será usado o preço de tabela do produto.', 17: 'Telefone com 8 dígitos: o 9 inicial será acrescentado.', 22: 'Produto "Fibra 500" sem "Mega": associado a "Fibra 500 Mega".', 29: 'Data de venda posterior à data do arquivo: confira antes de confirmar.' };
  const erros = { 13: 'Nome duplicado: "Letícia Andrade" já existe na Equipe Delta (linha 6) com outro login.', 25: 'Login duplicado: "samuel.peixoto" já pertence a outro vendedor.', 32: 'Data inválida: "31/11" não existe no calendário.' };
  for (let i = 1; i <= 36; i++) {
    const v = vlist[(i * 7) % vlist.length], e = equipes.find(q => q.id === v.equipe);
    const uf = wpick(Object.keys(e.ufs), Object.values(e.ufs));
    const cid = wpick(cidades[uf].c.map(c => c[0]), cidades[uf].c.map(c => c[1]));
    const pr = wpick(produtos, produtos.map(x => x.peso));
    const nivel = erros[i] ? 'erro' : avisos[i] ? 'aviso' : 'ok';
    importacao.push({ linha: i + 1, vendedor: v.nome, cliente: cliente(), produto: pr.nome, local: cid + '/' + uf, data: nivel === 'erro' && i === 32 ? '31/11' : String(int(3, 18)).padStart(2, '0') + '/11', valor: nivel === 'aviso' && i === 9 ? 0 : pr.valor, nivel, msg: erros[i] || avisos[i] || '' });
  }

  window.NC = { empresa: 'Norte Conecta', mes: 'Novembro/2026', hoje: HOJE, dias: DIAS, peso, cidades, produtos, equipes, vendedores, vendas, oportunidades, etapas, proximas, motivos, importacao, meses: ['Jul', 'Ago', 'Set', 'Out'] };
})();
