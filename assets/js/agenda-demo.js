// Agenda Express — demonstração do pedido de horário (Navalha & Co., barbearia fictícia).
// Tudo acontece no navegador: nenhuma mensagem é enviada. A barbearia confirma o horário
// manualmente no WhatsApp; a demo só mostra o pedido pendente.
(function () {
  'use strict';

  var demo = document.getElementById('demo');
  if (!demo) return;

  var BARBEARIA = 'Navalha & Co.';
  var SERVICOS = [
    { id: 'corte', nome: 'Corte masculino', preco: 45, dur: '40 min' },
    { id: 'barba', nome: 'Barba completa', preco: 35, dur: '30 min' },
    { id: 'combo', nome: 'Corte + barba', preco: 75, dur: '1h10' },
    { id: 'pezinho', nome: 'Pezinho e acabamento', preco: 20, dur: '15 min' },
    { id: 'infantil', nome: 'Corte infantil', preco: 40, dur: '40 min' },
    { id: 'sobrancelha', nome: 'Sobrancelha na navalha', preco: 15, dur: '10 min' }
  ];
  // Horário da Navalha & Co.: terça a sexta 9h–20h, sábado 8h–18h; domingo e segunda fechado.
  var FAIXAS = {
    semana: [
      { id: 'manha', nome: 'Manhã', faixa: '9h às 12h' },
      { id: 'tarde', nome: 'Tarde', faixa: '12h às 17h' },
      { id: 'noite', nome: 'Fim de tarde', faixa: '17h às 20h' }
    ],
    sabado: [
      { id: 'manha', nome: 'Manhã', faixa: '8h às 12h' },
      { id: 'tarde', nome: 'Tarde', faixa: '12h às 15h' },
      { id: 'noite', nome: 'Fim de tarde', faixa: '15h às 18h' }
    ]
  };
  var DIAS_SEMANA = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  var DIAS_CURTO = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

  // Próximos 6 dias de funcionamento (pula domingo e segunda).
  function proximosDias() {
    var lista = [], d = new Date(); d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() + 1);
    while (lista.length < 6) {
      var dow = d.getDay();
      if (dow !== 0 && dow !== 1) lista.push(new Date(d.getTime()));
      d.setDate(d.getDate() + 1);
    }
    return lista;
  }
  function dd(n) { return (n < 10 ? '0' : '') + n; }
  function dataCurta(d) { return dd(d.getDate()) + '/' + dd(d.getMonth() + 1); }
  function moeda(v) { return 'R$ ' + v; }
  function horaAgora() { var n = new Date(); return dd(n.getHours()) + ':' + dd(n.getMinutes()); }

  var estado = { servico: SERVICOS[2], dia: null, faixa: 'manha', nome: '' };
  var dias = proximosDias();
  estado.dia = dias[0];

  var elServicos = demo.querySelector('[data-servicos]');
  var elDias = demo.querySelector('[data-dias]');
  var elFaixas = demo.querySelector('[data-faixas]');
  var elNome = demo.querySelector('[data-nome]');
  var elMsg = demo.querySelector('[data-mensagem]');
  var elHora = demo.querySelector('[data-hora]');
  var elEnvio = demo.querySelector('[data-envio]');
  var elEstado = demo.querySelector('[data-estado-texto]');
  var elCopiado = demo.querySelector('[data-copiado]');
  var btnSimular = demo.querySelector('[data-simular]');
  var btnCopiar = demo.querySelector('[data-copiar]');
  var btnRefazer = demo.querySelector('[data-refazer]');

  function ficha(html, ativo, atributos) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'ficha';
    b.setAttribute('aria-pressed', ativo ? 'true' : 'false');
    Object.keys(atributos).forEach(function (k) { b.setAttribute(k, atributos[k]); });
    b.innerHTML = html;
    return b;
  }

  function faixasDoDia() { return estado.dia && estado.dia.getDay() === 6 ? FAIXAS.sabado : FAIXAS.semana; }

  function desenharServicos() {
    elServicos.innerHTML = '';
    SERVICOS.forEach(function (s) {
      elServicos.appendChild(ficha('<b>' + s.nome + '</b><small>a partir de ' + moeda(s.preco) + ' · ' + s.dur + '</small>', estado.servico.id === s.id, { 'data-servico': s.id, 'aria-label': s.nome + ', a partir de ' + moeda(s.preco) + ', ' + s.dur }));
    });
  }
  function desenharDias() {
    elDias.innerHTML = '';
    dias.forEach(function (d, i) {
      var ativo = estado.dia && d.getTime() === estado.dia.getTime();
      elDias.appendChild(ficha('<b>' + DIAS_CURTO[d.getDay()] + '</b><small>' + dataCurta(d) + '</small>', ativo, { 'data-dia': String(i), 'aria-label': DIAS_SEMANA[d.getDay()] + ', ' + dataCurta(d) }));
    });
  }
  function desenharFaixas() {
    elFaixas.innerHTML = '';
    faixasDoDia().forEach(function (f) {
      elFaixas.appendChild(ficha('<b>' + f.nome + '</b><small>' + f.faixa + '</small>', estado.faixa === f.id, { 'data-faixa': f.id, 'aria-label': f.nome + ', ' + f.faixa }));
    });
  }

  function mensagem() {
    var s = estado.servico, d = estado.dia;
    var faixa = faixasDoDia().filter(function (f) { return f.id === estado.faixa; })[0] || faixasDoDia()[0];
    var nome = (estado.nome || '').trim();
    var linhas = [
      'Olá, ' + BARBEARIA + '! Quero marcar um horário.',
      '',
      'Serviço: ' + s.nome + ' (a partir de ' + moeda(s.preco) + ', ' + s.dur + ')',
      'Dia: ' + DIAS_SEMANA[d.getDay()] + ', ' + dataCurta(d),
      'Faixa de horário: ' + faixa.nome.toLowerCase() + ' (' + faixa.faixa + ')',
      'Nome: ' + (nome || '—'),
      '',
      'Pedido feito pelo site. Fico no aguardo da confirmação do horário.'
    ];
    return linhas.join('\n');
  }

  function atualizar() {
    elMsg.textContent = mensagem();
    if (elHora) elHora.textContent = horaAgora();
    if (elCopiado) elCopiado.textContent = '';
    // Qualquer mudança desfaz a simulação de envio: o pedido volta a ser um rascunho.
    if (elEnvio) elEnvio.hidden = true;
    if (elEstado) elEstado.textContent = 'Rascunho do pedido. Pendente até a barbearia confirmar.';
    demo.classList.remove('is-enviada');
  }

  demo.addEventListener('click', function (ev) {
    var alvo = ev.target.closest ? ev.target.closest('button.ficha') : null;
    if (!alvo) return;
    if (alvo.hasAttribute('data-servico')) {
      estado.servico = SERVICOS.filter(function (s) { return s.id === alvo.getAttribute('data-servico'); })[0] || estado.servico;
      desenharServicos();
    } else if (alvo.hasAttribute('data-dia')) {
      estado.dia = dias[Number(alvo.getAttribute('data-dia'))] || estado.dia;
      desenharDias(); desenharFaixas();
    } else if (alvo.hasAttribute('data-faixa')) {
      estado.faixa = alvo.getAttribute('data-faixa');
      desenharFaixas();
    }
    atualizar();
  });

  if (elNome) elNome.addEventListener('input', function () { estado.nome = elNome.value.slice(0, 40); atualizar(); });

  if (btnSimular) btnSimular.addEventListener('click', function () {
    if (elEnvio) elEnvio.hidden = false;
    if (elEstado) elEstado.textContent = 'Pedido enviado (simulação). A barbearia responde e confirma o horário no WhatsApp.';
    demo.classList.add('is-enviada');
    if (elHora) elHora.textContent = horaAgora();
  });

  if (btnCopiar) btnCopiar.addEventListener('click', function () {
    var texto = mensagem();
    function ok() { if (elCopiado) elCopiado.textContent = 'Mensagem copiada.'; }
    function falhou() { if (elCopiado) elCopiado.textContent = 'Não foi possível copiar. Selecione o texto da mensagem e copie.'; }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(texto).then(ok, falhou);
    else falhou();
  });

  if (btnRefazer) btnRefazer.addEventListener('click', function () {
    estado = { servico: SERVICOS[2], dia: dias[0], faixa: 'manha', nome: '' };
    if (elNome) elNome.value = '';
    desenharServicos(); desenharDias(); desenharFaixas(); atualizar();
  });

  // Botão "Testar um pedido de horário": leva até a demo e põe o foco no primeiro passo.
  document.querySelectorAll('[data-demo-iniciar]').forEach(function (b) {
    b.addEventListener('click', function (ev) {
      ev.preventDefault();
      demo.classList.add('is-ativa');
      demo.scrollIntoView({ behavior: 'smooth', block: 'start' });
      var primeira = elServicos.querySelector('button');
      if (primeira) setTimeout(function () { primeira.focus({ preventScroll: true }); }, 500);
      setTimeout(function () { demo.classList.remove('is-ativa'); }, 2500);
    });
  });

  desenharServicos(); desenharDias(); desenharFaixas(); atualizar();

  // ---- CTA comercial: mensagem editável com origem identificável ----
  var quero = document.getElementById('quero');
  if (quero) {
    var campo = quero.querySelector('textarea');
    var link = quero.querySelector('a[data-wa]');
    var origemEl = quero.querySelector('[data-origem]');
    var ORIGEM = 'agenda-barbearia';
    var ref = '';
    try {
      var q = new URLSearchParams(location.search);
      ref = String(q.get('ref') || window.sessionStorage.getItem('siteExpress.origem') || '').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 24);
    } catch (e) { /* sem código de origem */ }
    var assinatura = '(origem: ' + ORIGEM + (ref && ref !== ORIGEM ? ' · ref: ' + ref : '') + ')';
    if (origemEl) origemEl.textContent = assinatura;

    function montarLink() {
      if (!campo || !link) return;
      var texto = campo.value.trim().slice(0, 900) + '\n\n' + assinatura;
      try {
        var url = new URL(link.href);
        url.searchParams.set('text', texto);
        link.href = url.toString();
        link.setAttribute('data-ref-ok', '1'); // site.js não acrescenta o ref de novo
      } catch (e) { /* mantém o link padrão */ }
    }
    if (campo) campo.addEventListener('input', montarLink);
    montarLink();
  }
})();
