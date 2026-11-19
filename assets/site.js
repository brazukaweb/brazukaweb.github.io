(function () {
  var ZAP = '5521996658904';

  // Painel da Brazuka: conta visitas, cliques e pedidos de orçamento.
  // Não usa cookies e não guarda IP nem nada que identifique quem só visitou.
  var PAINEL = 'https://script.google.com/macros/s/AKfycbxdlAuBtzuCv0gpWlvYNloR23rr-718bj-obcPDkAfJBi-4J-8PKAYv97gXhYuex7Y/exec';
  var celular = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  var naoRastrear = navigator.doNotTrack === '1' || window.doNotTrack === '1';
  function registrar(tipo, dados) {
    if (!PAINEL || !navigator.sendBeacon) return;
    if (naoRastrear && tipo !== 'lead') return;
    var d = dados || {};
    d.tipo = tipo;
    d.pagina = location.pathname;
    d.dispositivo = celular ? 'celular' : 'computador';
    try { navigator.sendBeacon(PAINEL, new Blob([JSON.stringify(d)], { type: 'text/plain' })); } catch (e) {}
  }
  function origemDaVisita() {
    var p = new URLSearchParams(location.search);
    var utm = p.get('utm_source') || p.get('origem');
    if (utm) return utm.charAt(0).toUpperCase() + utm.slice(1);
    var ref = '';
    try { ref = document.referrer ? new URL(document.referrer).hostname : ''; } catch (e) {}
    if (!ref || ref === location.hostname) return 'Direto';
    if (/instagram/.test(ref)) return 'Instagram';
    if (/google\./.test(ref)) return 'Google';
    if (/facebook|fb\.com/.test(ref)) return 'Facebook';
    if (/whatsapp|wa\.me/.test(ref)) return 'WhatsApp';
    if (/bing\./.test(ref)) return 'Bing';
    return ref.replace(/^www\./, '');
  }
  (function () {
    var nova = true;
    try { nova = !sessionStorage.getItem('bzk_visita'); sessionStorage.setItem('bzk_visita', '1'); } catch (e) {}
    registrar('visita', { nova: nova, origem: nova ? origemDaVisita() : '' });
  })();
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest && ev.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    var canal = /wa\.me|whatsapp/.test(href) ? 'whatsapp' : /instagram\.com/.test(href) ? 'instagram' : /^mailto:/.test(href) ? 'email' : '';
    if (!canal) return;
    var secao = a.closest('section[id]');
    registrar('clique', { detalhe: canal + ' ' + (a.id || (secao ? secao.id : 'topo')) });
  });

  // Menu mobile
  var botao = document.querySelector('.abrir-menu');
  var menu = document.getElementById('menu');
  if (botao && menu) {
    botao.addEventListener('click', function () {
      var aberto = menu.classList.toggle('aberto');
      botao.setAttribute('aria-expanded', aberto ? 'true' : 'false');
      botao.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        menu.classList.remove('aberto');
        botao.setAttribute('aria-expanded', 'false');
      }
    });
  }

  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mouseFino = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // "Monte seu site ao vivo": o visitante escolhe nome, tipo e cor e a prévia se monta
  var palco = document.getElementById('palco');
  var montador = document.getElementById('montador');
  if (palco && montador) {
    var elSite = document.getElementById('m-site');
    var elCodigo = document.getElementById('m-codigo');
    var elEndereco = document.getElementById('m-endereco');
    var elPedir = document.getElementById('m-pedir');
    var elAviso = document.getElementById('m-aviso');
    var campoNome = document.getElementById('m-nome');

    var temas = {
      mel:   { nome: 'mel',       hex: '#F1C46A', fundo: '#fffaf0', grad: 'linear-gradient(160deg,#f6e3b8,#f1c46a)', tinta: '#3b2a10', texto: '#6b5734', suave: '#f4ead3', botao: '#3b2a10', botaoTxt: '#fff' },
      mata:  { nome: 'verde',     hex: '#5FB386', fundo: '#f5fbf7', grad: 'linear-gradient(160deg,#d3eedd,#7cc39b)', tinta: '#0f3d2a', texto: '#3f6252', suave: '#e3f2e9', botao: '#0f3d2a', botaoTxt: '#fff' },
      mar:   { nome: 'azul',      hex: '#6F9BEA', fundo: '#f6f9ff', grad: 'linear-gradient(160deg,#dbe7fc,#86aef0)', tinta: '#13306b', texto: '#45598a', suave: '#e6eefc', botao: '#1d44a0', botaoTxt: '#fff' },
      barro: { nome: 'terracota', hex: '#E58A6E', fundo: '#fff8f5', grad: 'linear-gradient(160deg,#fbe2d8,#ee9f86)', tinta: '#5e2010', texto: '#80493a', suave: '#fbe9e2', botao: '#5e2010', botaoTxt: '#fff' },
      noite: { nome: 'noite',     hex: '#2A2F45', fundo: '#12141f', grad: 'linear-gradient(160deg,#3a3560,#1d2036)', tinta: '#f4efff', texto: '#b9b4d6', suave: '#212437', botao: '#FFC93C', botaoTxt: '#1a1405' }
    };

    function proximosDias() {
      var nomes = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'], d = new Date(), lista = [];
      while (lista.length < 5) {
        d.setDate(d.getDate() + 1);
        if (d.getDay() !== 0) lista.push({ dia: nomes[d.getDay()], num: d.getDate() });
      }
      return lista;
    }
    var check = '<svg aria-hidden="true" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" d="m5 12.5 4.5 4.5L19 7.5"/></svg>';

    var tipos = {
      loja: {
        nome: 'loja virtual', classe: 'produtos',
        links: ['Novidades', 'Sobre'], kicker: 'Coleção nova', titulo: 'Feito com carinho, entregue na sua casa', botao: 'Ver produtos',
        corpo: function () {
          var h = '<div class="s-grade">';
          for (var i = 0; i < 3; i++) h += '<div class="s-prod"><div class="foto"></div><i></i><i></i><em class="s-btn" data-comprar>Comprar</em></div>';
          return h + '</div>';
        }
      },
      servico: {
        nome: 'landing page de serviço', classe: 'beneficios',
        links: ['Serviços', 'Contato'], kicker: 'Atendimento com hora marcada', titulo: 'A gente resolve isso pra você', botao: 'Chamar no WhatsApp',
        corpo: function () {
          return '<div class="s-lista">' + ['Resposta rápida pelo WhatsApp', 'Orçamento sem compromisso', 'Atendimento no seu horário'].map(function (t) {
            return '<div>' + check + t + '</div>';
          }).join('') + '</div>';
        }
      },
      agenda: {
        nome: 'sistema de agendamento', classe: 'agenda',
        links: ['Horários', 'Entrar'], kicker: 'Agendamento online', titulo: 'Marque seu horário em poucos cliques', botao: 'Confirmar 14:00',
        corpo: function () {
          var h = '<div><div class="s-dias">';
          proximosDias().forEach(function (d, i) { h += '<span data-dia class="' + (i === 1 ? 'sel' : '') + '">' + d.dia + '<b>' + d.num + '</b></span>'; });
          h += '</div><div class="s-horas">';
          ['09:00', '10:30', '14:00', '15:30', '17:00', '18:30'].forEach(function (t) { h += '<span data-hora class="' + (t === '14:00' ? 'sel' : '') + '">' + t + '</span>'; });
          return h + '</div></div>';
        }
      },
      empresa: {
        nome: 'site institucional', classe: 'secoes',
        links: ['Sobre', 'Serviços', 'Contato'], kicker: 'Bem-vindo', titulo: 'Soluções feitas para quem confia na gente', botao: 'Conheça a empresa',
        corpo: function () {
          return '<div class="s-grade">' + ['Serviços', 'Sobre nós', 'Contato'].map(function (t) {
            return '<div class="s-card"><span class="bola"></span><b>' + t + '</b><i></i><i></i></div>';
          }).join('') + '</div>';
        }
      }
    };

    function esc(s) { return s.replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
    function slug(s) {
      var t = s.normalize ? s.normalize('NFD').replace(/[̀-ͯ]/g, '') : s;
      t = t.toLowerCase().replace(/[^a-z0-9]+/g, '');
      return (t || 'seunegocio') + '.com.br';
    }
    function estado() {
      return {
        nome: campoNome.value.trim() || 'Seu Negócio',
        tipo: montador.querySelector('input[name="tipo"]:checked').value,
        cor: montador.querySelector('input[name="cor"]:checked').value
      };
    }

    function desenharCodigo(e) {
      var t = tipos[e.tipo], c = temas[e.cor], n = esc(e.nome);
      var k = function (s) { return '<span class="k">' + s + '</span>'; };
      var s = function (x) { return '<span class="s">"' + x + '"</span>'; };
      elCodigo.innerHTML =
        '<span class="c">&lt;!-- ' + n + ' · ' + t.nome + ' --&gt;</span>\n' +
        k('&lt;style&gt;') + ' :root { --cor: <span class="s">' + c.hex + '</span>; } ' + k('&lt;/style&gt;') + '\n\n' +
        k('&lt;header&gt;') + '\n  &lt;b&gt;<span class="n">' + n + '</span>&lt;/b&gt;\n  &lt;nav&gt;' + t.links.join(' · ') + '&lt;/nav&gt;\n' + k('&lt;/header&gt;') + '\n' +
        k('&lt;section') + ' class=' + s('vitrine') + k('&gt;') + '\n  &lt;h1&gt;' + t.titulo + '&lt;/h1&gt;\n  &lt;a href=' + s('#') + '&gt;' + t.botao + '&lt;/a&gt;\n' + k('&lt;/section&gt;') + '\n' +
        k('&lt;section') + ' class=' + s(t.classe) + k('&gt;') + '\n  &lt;article&gt;…&lt;/article&gt;\n  &lt;article&gt;…&lt;/article&gt;\n  &lt;article&gt;…&lt;/article&gt;\n' + k('&lt;/section&gt;');
    }

    var sacola = 0;
    function desenharSite(e) {
      var t = tipos[e.tipo];
      var links = t.links.map(function (l) { return '<span>' + l + '</span>'; }).join('');
      if (e.tipo === 'loja') links += '<span class="s-sacola">Sacola <em>' + sacola + '</em></span>';
      elSite.innerHTML =
        '<div class="s-nav"><b data-nome>' + esc(e.nome) + '</b><nav>' + links + '</nav></div>' +
        '<div class="s-vitrine"><small>' + t.kicker + '</small><strong>' + t.titulo + '</strong><em class="s-btn">' + t.botao + '</em></div>' +
        t.corpo();
    }

    function aplicarCor(e) {
      var c = temas[e.cor];
      var mapa = { fundo: c.fundo, grad: c.grad, tinta: c.tinta, texto: c.texto, suave: c.suave, botao: c.botao, 'botao-txt': c.botaoTxt };
      for (var k in mapa) elSite.style.setProperty('--s-' + k, mapa[k]);
    }

    function atualizarLinks(e) {
      elEndereco.textContent = slug(e.nome);
      var msg = 'Olá, Brazuka Web! Montei uma prévia no site: ' + tipos[e.tipo].nome + ' para "' + e.nome + '", na cor ' + temas[e.cor].nome + '. Quero um orçamento.';
      elPedir.href = 'https://wa.me/' + ZAP + '?text=' + encodeURIComponent(msg);
    }

    // Efeito "código virando site"
    var tempos = [];
    function revelar(rapido) {
      tempos.forEach(clearTimeout); tempos = [];
      palco.classList.remove('revelado', 'no-ar');
      palco.classList.toggle('rapido', rapido);
      void elSite.offsetWidth; // reinicia a transição
      tempos.push(setTimeout(function () { palco.classList.add('revelado'); }, rapido ? 260 : 1200));
      tempos.push(setTimeout(function () { palco.classList.add('no-ar'); }, rapido ? 1200 : 3000));
      tempos.push(setTimeout(function () { palco.classList.remove('no-ar'); }, rapido ? 3600 : 5600));
    }

    function tudo(reconstruir) {
      var e = estado();
      desenharCodigo(e); desenharSite(e); aplicarCor(e); atualizarLinks(e);
      if (reconstruir) {
        revelar(true);
        elAviso.textContent = 'Prévia atualizada: ' + tipos[e.tipo].nome + ' de ' + e.nome + '.';
      }
    }

    montador.addEventListener('submit', function (ev) { ev.preventDefault(); });
    montador.addEventListener('change', function (ev) {
      if (ev.target.name === 'tipo') tudo(true);
      if (ev.target.name === 'cor') { var e = estado(); aplicarCor(e); desenharCodigo(e); atualizarLinks(e); }
    });
    campoNome.addEventListener('input', function () {
      var e = estado();
      var b = elSite.querySelector('[data-nome]');
      if (b) b.textContent = e.nome;
      desenharCodigo(e); atualizarLinks(e);
    });

    // Pequenas interações dentro da prévia (só com mouse ou toque, é decorativo)
    elSite.addEventListener('click', function (ev) {
      var alvo = ev.target.closest('[data-comprar], [data-dia], [data-hora]');
      if (!alvo) return;
      if (alvo.hasAttribute('data-comprar')) {
        sacola++;
        var em = elSite.querySelector('.s-sacola em');
        if (em) { em.textContent = sacola; em.classList.remove('pulou'); void em.offsetWidth; em.classList.add('pulou'); }
      } else {
        var grupo = alvo.parentNode.querySelectorAll('span');
        for (var i = 0; i < grupo.length; i++) grupo[i].classList.remove('sel');
        alvo.classList.add('sel');
        if (alvo.hasAttribute('data-hora')) {
          var btn = elSite.querySelector('.s-vitrine .s-btn');
          if (btn) btn.textContent = 'Confirmar ' + alvo.textContent;
        }
      }
    });

    tudo(false);
    if (reduz) palco.classList.add('revelado', 'no-ar'); else revelar(false);
  }

  // Quiz "Qual site eu preciso?"
  var caixa = document.getElementById('quiz');
  if (caixa) {
    var perguntas = [
      {
        texto: 'Qual é o principal objetivo agora?',
        opcoes: [
          { t: 'Vender produtos pela internet', icone: 'i-carrinho', p: { loja: 3 } },
          { t: 'Conseguir mais clientes para um serviço', icone: 'i-alvo', p: { landing: 2, site: 1 } },
          { t: 'Ser encontrado e passar confiança', icone: 'i-google', p: { site: 3 } },
          { t: 'Organizar agenda, pedidos ou cadastros', icone: 'i-calendario', p: { sistema: 3 } }
        ]
      },
      {
        texto: 'Como seus clientes chegam até você hoje?',
        opcoes: [
          { t: 'Pelo Instagram e pelo WhatsApp', icone: 'i-insta', p: { landing: 1, loja: 1 } },
          { t: 'Por indicação de outros clientes', icone: 'i-pessoa', p: { site: 2 } },
          { t: 'Por anúncios pagos', icone: 'i-raio', p: { landing: 2 } },
          { t: 'Marcam horário ou fazem pedido por mensagem', icone: 'i-zap', p: { sistema: 2 } }
        ]
      },
      {
        texto: 'O que mais toma seu tempo?',
        opcoes: [
          { t: 'Responder as mesmas perguntas sobre preços e produtos', icone: 'i-carrinho', p: { loja: 2 } },
          { t: 'Explicar o que eu faço e por que sou confiável', icone: 'i-tela', p: { site: 2 } },
          { t: 'Divulgar uma oferta ou serviço específico', icone: 'i-alvo', p: { landing: 2 } },
          { t: 'Controlar horários, pedidos e planilhas', icone: 'i-calendario', p: { sistema: 2 } }
        ]
      }
    ];
    var resultados = {
      landing: {
        nome: 'Landing page',
        por: 'Você quer transformar quem chega pelo Instagram ou por anúncios em clientes. Uma página única, direta e com botão para o WhatsApp faz isso muito bem.',
        itens: ['Página focada em um serviço ou oferta', 'Texto feito para convencer', 'Botão direto para o WhatsApp']
      },
      site: {
        nome: 'Site institucional',
        por: 'Você precisa ser encontrado no Google e passar confiança para quem ainda não te conhece. Um site com seus serviços, sua história e seus contatos resolve isso.',
        itens: ['Páginas de serviços, sobre e contato', 'Preparado para aparecer no Google', 'Fácil de atualizar depois']
      },
      loja: {
        nome: 'Loja virtual',
        por: 'Você vende produtos e gasta tempo respondendo preço por mensagem. Uma loja virtual mostra tudo e recebe pedidos e pagamentos sozinha, 24 horas por dia.',
        itens: ['Catálogo com fotos e preços', 'Pagamento por Pix e cartão', 'Painel para gerenciar pedidos']
      },
      sistema: {
        nome: 'Sistema sob medida',
        por: 'Seu problema é organização: agenda, pedidos ou cadastros espalhados entre mensagens e planilhas. Um sistema feito para o seu jeito de trabalhar devolve o seu tempo.',
        itens: ['Agendamento ou pedidos online', 'Tudo num só lugar, no celular ou no computador', 'Avisos automáticos para você e para o cliente']
      }
    };
    var passo = 0, pontos = {};

    function icone(id) { return '<svg aria-hidden="true"><use href="#' + id + '"/></svg>'; }
    function barra() {
      var h = '<div class="progresso" aria-hidden="true">';
      for (var i = 0; i < perguntas.length; i++) h += '<i class="' + (i <= passo ? 'on' : '') + '"></i>';
      return h + '</div>';
    }
    function mostrarPergunta() {
      var q = perguntas[passo];
      var h = barra() + '<fieldset class="pergunta"><legend>' + q.texto + '</legend><div class="opcoes">';
      q.opcoes.forEach(function (o, i) {
        h += '<button type="button" class="opcao" data-i="' + i + '">' + icone(o.icone) + '<span>' + o.t + '</span></button>';
      });
      h += '</div></fieldset><p style="margin-top:20px;color:#C9D8D0;font-size:15px">Pergunta ' + (passo + 1) + ' de ' + perguntas.length + '</p>';
      caixa.innerHTML = h;
      caixa.querySelectorAll('.opcao').forEach(function (b) {
        b.addEventListener('click', function () {
          var p = q.opcoes[+b.getAttribute('data-i')].p;
          for (var k in p) pontos[k] = (pontos[k] || 0) + p[k];
          passo++;
          if (passo < perguntas.length) mostrarPergunta(); else mostrarResultado();
          var primeiro = caixa.querySelector('button, a');
          if (primeiro) primeiro.focus();
        });
      });
    }
    function mostrarResultado() {
      var melhor = 'site', max = -1;
      ['landing', 'site', 'loja', 'sistema'].forEach(function (k) { if ((pontos[k] || 0) > max) { max = pontos[k] || 0; melhor = k; } });
      var r = resultados[melhor];
      registrar('quiz', { detalhe: melhor });
      var msg =encodeURIComponent('Olá, Brazuka Web! Fiz o teste no site e o resultado foi: ' + r.nome + '. Quero um orçamento.');
      var h = '<div class="resultado"><p class="rotulo">O mais indicado para você agora</p><h3>' + r.nome + '</h3><p>' + r.por + '</p><ul>';
      r.itens.forEach(function (it) { h += '<li>' + icone('i-check') + '<span>' + it + '</span></li>'; });
      h += '</ul></div><div class="acoes-res"><a class="btn btn-amarelo" href="https://wa.me/' + ZAP + '?text=' + msg + '" target="_blank" rel="noopener">' + icone('i-zap') + 'Enviar resultado no WhatsApp</a><button type="button" class="refazer">Refazer o teste</button></div>';
      caixa.innerHTML = h;
      caixa.querySelector('.refazer').addEventListener('click', function () { passo = 0; pontos = {}; mostrarPergunta(); caixa.querySelector('.opcao').focus(); });
    }
    mostrarPergunta();
  }

  // Formulário de orçamento → WhatsApp
  var form = document.getElementById('form-orcamento');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nome = form.nome.value.trim();
      var negocio = form.negocio.value.trim();
      var erro = document.getElementById('f-erro');
      if (!nome || !negocio) {
        erro.textContent = 'Preencha seu nome e o seu negócio para continuar.';
        (nome ? form.negocio : form.nome).focus();
        return;
      }
      erro.textContent = '';
      var texto = 'Olá, Brazuka Web! Meu nome é ' + nome + ', tenho um negócio de ' + negocio + ' e preciso de: ' + form.tipo.value + '.';
      if (form.mensagem.value.trim()) texto += ' ' + form.mensagem.value.trim();
      registrar('lead', { nome: nome, assunto: form.tipo.value + ' · ' + negocio, mensagem: form.mensagem.value.trim() });
      window.location.href = 'https://wa.me/' + ZAP + '?text=' + encodeURIComponent(texto);
    });
  }

  // Topo: barra de leitura, sombra ao rolar e item do menu da seção atual
  var topo = document.querySelector('.topo');
  var barraLeitura = document.getElementById('barra-leitura');
  var etapasLista = document.querySelector('.etapas');
  var etapas = etapasLista ? etapasLista.querySelectorAll('.etapa') : [];
  var animaRolagem = !reduz && 'IntersectionObserver' in window;

  function limita(x) { return Math.max(0, Math.min(1, x)); }
  function aoRolar() {
    var y = window.scrollY, total = document.documentElement.scrollHeight - window.innerHeight;
    if (barraLeitura) barraLeitura.style.transform = 'scaleX(' + (total > 0 ? y / total : 0) + ')';
    if (topo) topo.classList.toggle('rolou', y > 8);

    // "Como funciona": a linha vai se preenchendo conforme a pessoa desce
    if (animaRolagem && etapas.length) {
      var vh = window.innerHeight;
      var mesmaLinha = etapas.length > 1 && etapas[0].offsetTop === etapas[1].offsetTop;
      var r = etapasLista.getBoundingClientRect();
      var p = limita((vh * 0.8 - r.top) / (r.height + vh * 0.3));
      for (var i = 0; i < etapas.length; i++) {
        var f;
        if (mesmaLinha) f = limita(p * etapas.length - i);
        else f = limita((vh * 0.8 - etapas[i].getBoundingClientRect().top) / (vh * 0.3));
        etapas[i].style.setProperty('--f', f.toFixed(3));
        etapas[i].classList.toggle('ativa', f > 0.02);
      }
    }
  }
  var agendado = false;
  function pedirQuadro() {
    if (agendado) return;
    agendado = true;
    requestAnimationFrame(function () { agendado = false; aoRolar(); });
  }
  window.addEventListener('scroll', pedirQuadro, { passive: true });
  window.addEventListener('resize', pedirQuadro);

  if ('IntersectionObserver' in window) {
    var linksMenu = document.querySelectorAll('.menu a[href^="#"]');
    var porId = {};
    linksMenu.forEach(function (a) { porId[a.getAttribute('href').slice(1)] = a; });
    var espiao = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (!en.isIntersecting) return;
        linksMenu.forEach(function (a) { a.classList.remove('ativo'); a.removeAttribute('aria-current'); });
        var link = porId[en.target.id];
        if (link) { link.classList.add('ativo'); link.setAttribute('aria-current', 'true'); }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (s) { espiao.observe(s); });
  }

  // Elementos que surgem suavemente ao entrar na tela
  if (animaRolagem) {
    document.documentElement.classList.add('anima-rolagem');
    var grupos = ['.cabeca', '.servico', '.quiz-caixa', '.etapa', '.projeto', '.aviso-modelo', '.dif', '.faq details', '.canal', '.form', '.final h2', '.final .btn'];
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('visivel'); observador.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    grupos.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el, i) {
        el.classList.add('surge');
        el.style.setProperty('--atraso', ((i % 4) * 90) + 'ms');
        observador.observe(el);
      });
    });
  }

  // Botões "magnéticos" e cartões de projeto que inclinam com o mouse
  if (!reduz && mouseFino) {
    document.querySelectorAll('.btn-amarelo, .btn-verde').forEach(function (b) {
      b.addEventListener('mousemove', function (ev) {
        var r = b.getBoundingClientRect();
        var x = (ev.clientX - r.left - r.width / 2) * 0.18, y = (ev.clientY - r.top - r.height / 2) * 0.3;
        b.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
    document.querySelectorAll('.projeto').forEach(function (p) {
      var capa = p.querySelector('.capa');
      if (!capa) return;
      p.addEventListener('mousemove', function (ev) {
        var r = capa.getBoundingClientRect();
        var x = (ev.clientX - r.left) / r.width - 0.5, y = (ev.clientY - r.top) / r.height - 0.5;
        capa.style.transform = 'perspective(800px) translateY(-6px) rotateX(' + (-y * 8).toFixed(2) + 'deg) rotateY(' + (x * 10).toFixed(2) + 'deg)';
        capa.style.setProperty('--bx', ((x + 0.5) * 100).toFixed(1) + '%');
        capa.style.setProperty('--by', ((y + 0.5) * 100).toFixed(1) + '%');
      });
      p.addEventListener('mouseleave', function () { capa.style.transform = ''; });
    });
    document.querySelectorAll('.servico').forEach(function (s) {
      s.addEventListener('mousemove', function (ev) {
        var r = s.getBoundingClientRect();
        s.style.setProperty('--mx', (ev.clientX - r.left) + 'px');
        s.style.setProperty('--my', (ev.clientY - r.top) + 'px');
      });
    });
  }

  aoRolar();
})();
