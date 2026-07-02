/* ============================================================
   Clube da Cana FC - data.js
   Camada de dados: modelos, seed inicial e persistência (localStorage)
   ============================================================ */

const STORAGE_KEY = 'cdcfc_data_v1';

const POSICOES = [
  'Goleiro', 'Zagueiro', 'Lateral Direito', 'Lateral Esquerdo',
  'Volante', 'Meio-Campo', 'Meia Atacante', 'Ponta Direita',
  'Ponta Esquerda', 'Atacante'
];

const STATUS_JOGADOR = ['Ativo', 'Lesionado', 'Suspenso', 'Inativo'];

const FORMATIONS = {
  '4-4-2': [
    { code: 'GOL', label: 'GOL', x: 8,  y: 50 },
    { code: 'LE',  label: 'LE',  x: 26, y: 14 },
    { code: 'ZAG', label: 'ZAG', x: 26, y: 37 },
    { code: 'ZAG', label: 'ZAG', x: 26, y: 63 },
    { code: 'LD',  label: 'LD',  x: 26, y: 86 },
    { code: 'ME',  label: 'ME',  x: 55, y: 14 },
    { code: 'VOL', label: 'VOL', x: 52, y: 37 },
    { code: 'VOL', label: 'VOL', x: 52, y: 63 },
    { code: 'MD',  label: 'MD',  x: 55, y: 86 },
    { code: 'ATA', label: 'ATA', x: 82, y: 36 },
    { code: 'ATA', label: 'ATA', x: 82, y: 64 }
  ],
  '4-3-3': [
    { code: 'GOL', label: 'GOL', x: 8,  y: 50 },
    { code: 'LE',  label: 'LE',  x: 26, y: 14 },
    { code: 'ZAG', label: 'ZAG', x: 26, y: 37 },
    { code: 'ZAG', label: 'ZAG', x: 26, y: 63 },
    { code: 'LD',  label: 'LD',  x: 26, y: 86 },
    { code: 'VOL', label: 'VOL', x: 50, y: 30 },
    { code: 'VOL', label: 'VOL', x: 50, y: 50 },
    { code: 'MEI', label: 'MEI', x: 50, y: 70 },
    { code: 'PE',  label: 'PE',  x: 82, y: 15 },
    { code: 'ATA', label: 'ATA', x: 86, y: 50 },
    { code: 'PD',  label: 'PD',  x: 82, y: 85 }
  ],
  '3-5-2': [
    { code: 'GOL', label: 'GOL', x: 8,  y: 50 },
    { code: 'ZAG', label: 'ZAG', x: 26, y: 25 },
    { code: 'ZAG', label: 'ZAG', x: 26, y: 50 },
    { code: 'ZAG', label: 'ZAG', x: 26, y: 75 },
    { code: 'LE',  label: 'LE',  x: 48, y: 10 },
    { code: 'VOL', label: 'VOL', x: 48, y: 37 },
    { code: 'VOL', label: 'VOL', x: 48, y: 63 },
    { code: 'LD',  label: 'LD',  x: 48, y: 90 },
    { code: 'MEI', label: 'MEI', x: 68, y: 50 },
    { code: 'ATA', label: 'ATA', x: 84, y: 32 },
    { code: 'ATA', label: 'ATA', x: 84, y: 68 }
  ],
  '4-2-3-1': [
    { code: 'GOL', label: 'GOL', x: 8,  y: 50 },
    { code: 'LE',  label: 'LE',  x: 24, y: 14 },
    { code: 'ZAG', label: 'ZAG', x: 24, y: 37 },
    { code: 'ZAG', label: 'ZAG', x: 24, y: 63 },
    { code: 'LD',  label: 'LD',  x: 24, y: 86 },
    { code: 'VOL', label: 'VOL', x: 46, y: 37 },
    { code: 'VOL', label: 'VOL', x: 46, y: 63 },
    { code: 'PE',  label: 'PE',  x: 68, y: 15 },
    { code: 'MEIA',label: 'MEIA',x: 68, y: 50 },
    { code: 'PD',  label: 'PD',  x: 68, y: 85 },
    { code: 'ATA', label: 'ATA', x: 88, y: 50 }
  ]
};

function uid(prefix) {
  return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function svgAvatarPlaceholder(nome) {
  const iniciais = (nome || '?').split(' ').filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('');
  const colors = ['#0B5D2A', '#145c34', '#1c6b3d', '#0e4a22'];
  const c = colors[Math.abs(hashCode(nome || '')) % colors.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="${c}"/><text x="50" y="58" font-family="Arial, sans-serif" font-size="38" fill="#D4AF37" text-anchor="middle" font-weight="bold">${iniciais}</text></svg>`;
  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

/* ------------------------------------------------------------
   SEED DATA
   ------------------------------------------------------------ */

function buildSeedPlayers() {
  const list = [
    { nome: 'Gabriel Silva', apelido: 'Gabigol', numero: 9, posicao: 'Atacante', nascimento: '1999-04-12', telefone: '(19) 99123-4501', pe: 'Direito', altura: 178, peso: 76, status: 'Ativo' },
    { nome: 'Lucas Oliveira', apelido: 'Lucão', numero: 1, posicao: 'Goleiro', nascimento: '1997-02-20', telefone: '(19) 99123-4502', pe: 'Direito', altura: 190, peso: 85, status: 'Ativo' },
    { nome: 'Rafael Santos', apelido: 'Rafa', numero: 4, posicao: 'Zagueiro', nascimento: '1996-08-05', telefone: '(19) 99123-4503', pe: 'Direito', altura: 185, peso: 82, status: 'Ativo' },
    { nome: 'Bruno Costa', apelido: 'Brunão', numero: 3, posicao: 'Zagueiro', nascimento: '1998-11-30', telefone: '(19) 99123-4504', pe: 'Esquerdo', altura: 187, peso: 84, status: 'Ativo' },
    { nome: 'Thiago Almeida', apelido: 'Thiaguinho', numero: 6, posicao: 'Lateral Esquerdo', nascimento: '2000-01-15', telefone: '(19) 99123-4505', pe: 'Esquerdo', altura: 172, peso: 68, status: 'Suspenso' },
    { nome: 'Diego Ferreira', apelido: 'Diegão', numero: 2, posicao: 'Lateral Direito', nascimento: '1999-06-22', telefone: '(19) 99123-4506', pe: 'Direito', altura: 175, peso: 70, status: 'Ativo' },
    { nome: 'Matheus Souza', apelido: 'Matheusinho', numero: 5, posicao: 'Volante', nascimento: '1998-03-18', telefone: '(19) 99123-4507', pe: 'Direito', altura: 180, peso: 75, status: 'Ativo' },
    { nome: 'Felipe Rodrigues', apelido: 'Felipão', numero: 8, posicao: 'Meio-Campo', nascimento: '1997-09-09', telefone: '(19) 99123-4508', pe: 'Direito', altura: 176, peso: 72, status: 'Ativo' },
    { nome: 'André Lima', apelido: 'Andrezinho', numero: 10, posicao: 'Meia Atacante', nascimento: '2000-05-27', telefone: '(19) 99123-4509', pe: 'Esquerdo', altura: 170, peso: 65, status: 'Ativo' },
    { nome: 'Carlos Pereira', apelido: 'Carlão', numero: 7, posicao: 'Ponta Direita', nascimento: '1999-12-02', telefone: '(19) 99123-4510', pe: 'Direito', altura: 174, peso: 69, status: 'Ativo' },
    { nome: 'Vinícius Martins', apelido: 'Vini', numero: 11, posicao: 'Ponta Esquerda', nascimento: '2001-07-14', telefone: '(19) 99123-4511', pe: 'Esquerdo', altura: 168, peso: 63, status: 'Ativo' },
    { nome: 'Eduardo Nunes', apelido: 'Duda', numero: 13, posicao: 'Atacante', nascimento: '1998-10-08', telefone: '(19) 99123-4512', pe: 'Direito', altura: 181, peso: 77, status: 'Lesionado' }
  ];
  return list.map(p => ({
    id: uid('jog'),
    nome: p.nome,
    apelido: p.apelido,
    numero: p.numero,
    posicao: p.posicao,
    dataNascimento: p.nascimento,
    telefone: p.telefone,
    peDominante: p.pe,
    altura: p.altura,
    peso: p.peso,
    status: p.status,
    foto: svgAvatarPlaceholder(p.nome)
  }));
}

function buildSeedGames(players) {
  const byApelido = {};
  players.forEach(p => byApelido[p.apelido] = p.id);

  const allIds = players.map(p => p.id);
  const formacaoPadrao = FORMATIONS['4-4-2'];

  function escalacaoPadrao() {
    const ordem = ['Lucão', 'Diegão', 'Rafa', 'Brunão', 'Thiaguinho', 'Carlão', 'Matheusinho', 'Felipão', 'Vini', 'Gabigol', 'Duda'];
    const titulares = ordem.map((apelido, idx) => ({
      jogadorId: byApelido[apelido],
      slot: idx
    }));
    const reservas = allIds.filter(id => !titulares.some(t => t.jogadorId === id));
    return { formacao: '4-4-2', titulares, reservas };
  }

  const games = [
    {
      id: uid('jogo'),
      adversario: 'Furacão FC',
      campeonato: 'Campeonato Municipal',
      tipo: 'Campeonato',
      local: 'Casa',
      campo: 'Campo Municipal da Cana',
      cidade: 'Piracicaba',
      data: '2026-06-01',
      horario: '16:00',
      arbitro: 'José Almeida',
      obs: 'Jogo de abertura do returno.',
      status: 'Realizado',
      placarCasa: 3,
      placarFora: 1,
      gols: [
        { jogadorId: byApelido['Gabigol'], minuto: 12, assistenciaId: byApelido['Andrezinho'] },
        { jogadorId: byApelido['Gabigol'], minuto: 34, assistenciaId: byApelido['Carlão'] },
        { jogadorId: byApelido['Andrezinho'], minuto: 70, assistenciaId: byApelido['Vini'] }
      ],
      cartoes: [{ jogadorId: byApelido['Matheusinho'], tipo: 'Amarelo', minuto: 55 }],
      mvpId: byApelido['Gabigol'],
      notas: { [byApelido['Gabigol']]: 9.2, [byApelido['Andrezinho']]: 8.5, [byApelido['Lucão']]: 7.5 },
      convocados: allIds,
      escalacao: escalacaoPadrao()
    },
    {
      id: uid('jogo'),
      adversario: 'Atlético Canavieiras',
      campeonato: 'Amistoso de Pré-temporada',
      tipo: 'Amistoso',
      local: 'Fora',
      campo: 'Arena Canavieiras',
      cidade: 'Limeira',
      data: '2026-06-08',
      horario: '15:30',
      arbitro: 'Marcos Vieira',
      obs: 'Teste tático com 3-5-2.',
      status: 'Realizado',
      placarCasa: 2,
      placarFora: 2,
      gols: [
        { jogadorId: byApelido['Andrezinho'], minuto: 20, assistenciaId: byApelido['Felipão'] },
        { jogadorId: byApelido['Duda'], minuto: 66, assistenciaId: byApelido['Carlão'] }
      ],
      cartoes: [
        { jogadorId: byApelido['Brunão'], tipo: 'Amarelo', minuto: 40 },
        { jogadorId: byApelido['Diegão'], tipo: 'Amarelo', minuto: 75 }
      ],
      mvpId: byApelido['Andrezinho'],
      notas: { [byApelido['Andrezinho']]: 8.8, [byApelido['Duda']]: 7.8 },
      convocados: allIds,
      escalacao: escalacaoPadrao()
    },
    {
      id: uid('jogo'),
      adversario: 'União Rural',
      campeonato: 'Campeonato Municipal',
      tipo: 'Campeonato',
      local: 'Casa',
      campo: 'Campo Municipal da Cana',
      cidade: 'Piracicaba',
      data: '2026-06-15',
      horario: '16:00',
      arbitro: 'Paulo Ribeiro',
      obs: 'Goleada em casa.',
      status: 'Realizado',
      placarCasa: 4,
      placarFora: 0,
      gols: [
        { jogadorId: byApelido['Gabigol'], minuto: 10, assistenciaId: byApelido['Andrezinho'] },
        { jogadorId: byApelido['Gabigol'], minuto: 28, assistenciaId: byApelido['Andrezinho'] },
        { jogadorId: byApelido['Carlão'], minuto: 51, assistenciaId: byApelido['Vini'] },
        { jogadorId: byApelido['Duda'], minuto: 80, assistenciaId: byApelido['Felipão'] }
      ],
      cartoes: [],
      mvpId: byApelido['Gabigol'],
      notas: { [byApelido['Gabigol']]: 9.5, [byApelido['Lucão']]: 8.0 },
      convocados: allIds,
      escalacao: escalacaoPadrao()
    },
    {
      id: uid('jogo'),
      adversario: 'Estrela do Sul',
      campeonato: 'Campeonato Municipal',
      tipo: 'Campeonato',
      local: 'Fora',
      campo: 'Estádio Estrela',
      cidade: 'Rio Claro',
      data: '2026-06-22',
      horario: '19:00',
      arbitro: 'Cláudio Nogueira',
      obs: 'Expulsão prejudicou o time no 2º tempo.',
      status: 'Realizado',
      placarCasa: 2,
      placarFora: 1,
      gols: [
        { jogadorId: byApelido['Duda'], minuto: 44, assistenciaId: byApelido['Andrezinho'] }
      ],
      cartoes: [
        { jogadorId: byApelido['Rafa'], tipo: 'Amarelo', minuto: 30 },
        { jogadorId: byApelido['Thiaguinho'], tipo: 'Vermelho', minuto: 60 }
      ],
      mvpId: byApelido['Lucão'],
      notas: { [byApelido['Lucão']]: 8.7, [byApelido['Rafa']]: 6.5 },
      convocados: allIds,
      escalacao: escalacaoPadrao()
    },
    {
      id: uid('jogo'),
      adversario: 'Real Agreste',
      campeonato: 'Copa Regional',
      tipo: 'Copa',
      local: 'Casa',
      campo: 'Campo Municipal da Cana',
      cidade: 'Piracicaba',
      data: '2026-06-29',
      horario: '16:00',
      arbitro: 'Renato Dias',
      obs: 'Classificação para a próxima fase.',
      status: 'Realizado',
      placarCasa: 2,
      placarFora: 1,
      gols: [
        { jogadorId: byApelido['Gabigol'], minuto: 15, assistenciaId: byApelido['Carlão'] },
        { jogadorId: byApelido['Vini'], minuto: 77, assistenciaId: byApelido['Andrezinho'] }
      ],
      cartoes: [{ jogadorId: byApelido['Matheusinho'], tipo: 'Amarelo', minuto: 65 }],
      mvpId: byApelido['Vini'],
      notas: { [byApelido['Vini']]: 8.9, [byApelido['Gabigol']]: 8.3 },
      convocados: allIds,
      escalacao: escalacaoPadrao()
    },
    {
      id: uid('jogo'),
      adversario: 'Leões do Vale',
      campeonato: 'Campeonato Municipal',
      tipo: 'Campeonato',
      local: 'Casa',
      campo: 'Campo Municipal da Cana',
      cidade: 'Piracicaba',
      data: '2026-07-10',
      horario: '16:00',
      arbitro: 'A definir',
      obs: 'Jogo decisivo pela liderança do grupo.',
      status: 'Agendado',
      placarCasa: null,
      placarFora: null,
      gols: [],
      cartoes: [],
      mvpId: null,
      notas: {},
      convocados: allIds,
      escalacao: escalacaoPadrao()
    }
  ];
  return games;
}

function buildSeedFinanceiro(players) {
  const meses = ['2026-04', '2026-05', '2026-06'];
  const mensalidades = [];
  players.forEach(p => {
    meses.forEach(mes => {
      mensalidades.push({
        id: uid('mens'),
        jogadorId: p.id,
        mes,
        valor: 60,
        pago: Math.random() > 0.2
      });
    });
  });
  const patrocinios = [
    { id: uid('patr'), nome: 'Usina São José', valor: 3000, data: '2026-04-05', obs: 'Patrocínio máster - uniformes' },
    { id: uid('patr'), nome: 'Mercado Bom Preço', valor: 800, data: '2026-05-10', obs: 'Apoio mensal' },
    { id: uid('patr'), nome: 'Auto Peças Cana', valor: 500, data: '2026-06-02', obs: 'Apoio material esportivo' }
  ];
  const despesas = [
    { id: uid('desp'), descricao: 'Aluguel do campo', categoria: 'Estrutura', valor: 600, data: '2026-06-01' },
    { id: uid('desp'), descricao: 'Uniformes novos', categoria: 'Material', valor: 1200, data: '2026-04-20' },
    { id: uid('desp'), descricao: 'Arbitragem', categoria: 'Jogos', valor: 350, data: '2026-06-15' },
    { id: uid('desp'), descricao: 'Transporte - jogo fora', categoria: 'Transporte', valor: 280, data: '2026-06-22' },
    { id: uid('desp'), descricao: 'Bolas de treino', categoria: 'Material', valor: 220, data: '2026-05-05' }
  ];
  return { mensalidades, patrocinios, despesas };
}

function buildSeedData() {
  const players = buildSeedPlayers();
  const games = buildSeedGames(players);
  const financeiro = buildSeedFinanceiro(players);
  return {
    players,
    games,
    financeiro,
    config: {
      senhaAdmin: 'admin123',
      senhaJogador: 'clube2026',
      corPrimaria: '#0B5D2A',
      corDourada: '#D4AF37',
      nomeClube: 'Clube da Cana FC',
      patrocinadores: [
        { id: uid('sp'), nome: 'Usina São José' },
        { id: uid('sp'), nome: 'Mercado Bom Preço' },
        { id: uid('sp'), nome: 'Auto Peças Cana' }
      ]
    },
    notifications: [
      { id: uid('not'), texto: 'Bem-vindo ao sistema do Clube da Cana FC!', data: new Date().toISOString(), lida: false },
      { id: uid('not'), texto: 'Próximo jogo contra Leões do Vale em 10/07.', data: new Date().toISOString(), lida: false }
    ]
  };
}

/* ------------------------------------------------------------
   PERSISTÊNCIA
   ------------------------------------------------------------ */

const DB = {
  data: null,

  load() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        this.data = JSON.parse(raw);
        return this.data;
      } catch (e) {
        console.warn('Erro ao carregar dados, recriando seed.', e);
      }
    }
    this.data = buildSeedData();
    this.save();
    return this.data;
  },

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  },

  reset() {
    localStorage.removeItem(STORAGE_KEY);
    this.load();
  }
};

/* ------------------------------------------------------------
   HELPERS DE DOMÍNIO
   ------------------------------------------------------------ */

function getPlayer(id) {
  return DB.data.players.find(p => p.id === id);
}

function getGame(id) {
  return DB.data.games.find(g => g.id === id);
}

function calcAge(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function formatMoney(v) {
  return (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function calcPlayerStats(playerId) {
  const games = DB.data.games.filter(g => g.status === 'Realizado');
  let jogos = 0, titular = 0, reserva = 0, gols = 0, assistencias = 0,
      amarelos = 0, vermelhos = 0, minutos = 0, mvp = 0;
  const notas = [];

  games.forEach(g => {
    const isTitular = g.escalacao && g.escalacao.titulares.some(t => t.jogadorId === playerId);
    const participouComoReserva = !isTitular && g.convocados.includes(playerId) &&
      (g.gols.some(gg => gg.jogadorId === playerId || gg.assistenciaId === playerId) ||
       g.cartoes.some(c => c.jogadorId === playerId) ||
       g.mvpId === playerId);

    if (isTitular) {
      jogos++; titular++; minutos += 90;
    } else if (participouComoReserva) {
      jogos++; reserva++; minutos += 25;
    }

    gols += g.gols.filter(gg => gg.jogadorId === playerId).length;
    assistencias += g.gols.filter(gg => gg.assistenciaId === playerId).length;
    amarelos += g.cartoes.filter(c => c.jogadorId === playerId && c.tipo === 'Amarelo').length;
    vermelhos += g.cartoes.filter(c => c.jogadorId === playerId && c.tipo === 'Vermelho').length;
    if (g.mvpId === playerId) mvp++;
    if (g.notas && g.notas[playerId] !== undefined) notas.push(g.notas[playerId]);
  });

  const mediaNotas = notas.length ? (notas.reduce((a, b) => a + b, 0) / notas.length) : 0;

  return { jogos, titular, reserva, gols, assistencias, amarelos, vermelhos, minutos, mvp, mediaNotas };
}

function calcTeamStats() {
  const realizados = DB.data.games.filter(g => g.status === 'Realizado');
  let vitorias = 0, empates = 0, derrotas = 0, golsMarcados = 0, golsSofridos = 0;
  realizados.forEach(g => {
    const golsPro = g.local === 'Casa' ? g.placarCasa : g.placarFora;
    const golsContra = g.local === 'Casa' ? g.placarFora : g.placarCasa;
    golsMarcados += golsPro || 0;
    golsSofridos += golsContra || 0;
    if (golsPro > golsContra) vitorias++;
    else if (golsPro === golsContra) empates++;
    else derrotas++;
  });
  const jogos = realizados.length;
  const pontos = vitorias * 3 + empates;
  const aproveitamento = jogos ? Math.round((pontos / (jogos * 3)) * 100) : 0;

  // Artilheiro e melhor assistente
  const golsPorJogador = {};
  const assistPorJogador = {};
  realizados.forEach(g => {
    g.gols.forEach(gg => {
      golsPorJogador[gg.jogadorId] = (golsPorJogador[gg.jogadorId] || 0) + 1;
      if (gg.assistenciaId) assistPorJogador[gg.assistenciaId] = (assistPorJogador[gg.assistenciaId] || 0) + 1;
    });
  });
  const artilheiroId = Object.keys(golsPorJogador).sort((a, b) => golsPorJogador[b] - golsPorJogador[a])[0];
  const assistenteId = Object.keys(assistPorJogador).sort((a, b) => assistPorJogador[b] - assistPorJogador[a])[0];

  return {
    jogos, vitorias, empates, derrotas, golsMarcados, golsSofridos, aproveitamento,
    artilheiro: artilheiroId ? { jogador: getPlayer(artilheiroId), gols: golsPorJogador[artilheiroId] } : null,
    assistente: assistenteId ? { jogador: getPlayer(assistenteId), assist: assistPorJogador[assistenteId] } : null
  };
}

function calcFinanceiro() {
  const f = DB.data.financeiro;
  const totalMensalidades = f.mensalidades.filter(m => m.pago).reduce((a, b) => a + b.valor, 0);
  const totalPendente = f.mensalidades.filter(m => !m.pago).reduce((a, b) => a + b.valor, 0);
  const totalPatrocinios = f.patrocinios.reduce((a, b) => a + b.valor, 0);
  const totalDespesas = f.despesas.reduce((a, b) => a + b.valor, 0);
  const caixa = totalMensalidades + totalPatrocinios - totalDespesas;
  return { totalMensalidades, totalPendente, totalPatrocinios, totalDespesas, caixa };
}

function proximoJogo() {
  const hoje = new Date();
  const agendados = DB.data.games
    .filter(g => g.status === 'Agendado')
    .sort((a, b) => new Date(a.data + 'T' + (a.horario || '00:00')) - new Date(b.data + 'T' + (b.horario || '00:00')));
  return agendados[0] || null;
}

function addNotification(texto) {
  DB.data.notifications.unshift({ id: uid('not'), texto, data: new Date().toISOString(), lida: false });
  DB.save();
}
