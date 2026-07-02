/* ============================================================
   Clube da Cana FC - charts.js
   Helpers para gráficos Chart.js com tema do clube
   ============================================================ */

const CHART_COLORS = {
  green: '#0B5D2A',
  greenLight: '#1c8f45',
  gold: '#D4AF37',
  white: '#FFFFFF',
  black: '#000000',
  red: '#c0392b',
  gray: '#8a94a6'
};

Chart.defaults.color = '#c8d0dc';
Chart.defaults.borderColor = 'rgba(255,255,255,0.08)';
Chart.defaults.font.family = "'Poppins', 'Segoe UI', sans-serif";

const chartInstances = {};

function destroyChart(id) {
  if (chartInstances[id]) {
    chartInstances[id].destroy();
    delete chartInstances[id];
  }
}

function makeChart(canvasId, config) {
  destroyChart(canvasId);
  const el = document.getElementById(canvasId);
  if (!el) return null;
  const ctx = el.getContext('2d');
  chartInstances[canvasId] = new Chart(ctx, config);
  return chartInstances[canvasId];
}

function chartPerformanceLine(canvasId, games) {
  const realizados = games.filter(g => g.status === 'Realizado').slice(-8);
  const labels = realizados.map(g => g.adversario);
  const data = realizados.map(g => {
    const golsPro = g.local === 'Casa' ? g.placarCasa : g.placarFora;
    const golsContra = g.local === 'Casa' ? g.placarFora : g.placarCasa;
    if (golsPro > golsContra) return 3;
    if (golsPro === golsContra) return 1;
    return 0;
  });
  return makeChart(canvasId, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Pontos por jogo',
        data,
        borderColor: CHART_COLORS.gold,
        backgroundColor: 'rgba(212,175,55,0.15)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: CHART_COLORS.green,
        pointBorderColor: CHART_COLORS.gold,
        pointRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { min: 0, max: 3, ticks: { stepSize: 1, callback: v => ['Derrota', 'Empate', '', 'Vitória'][v] } }
      },
      plugins: { legend: { display: false } }
    }
  });
}

function chartResultsPie(canvasId, stats) {
  return makeChart(canvasId, {
    type: 'doughnut',
    data: {
      labels: ['Vitórias', 'Empates', 'Derrotas'],
      datasets: [{
        data: [stats.vitorias, stats.empates, stats.derrotas],
        backgroundColor: [CHART_COLORS.green, CHART_COLORS.gold, CHART_COLORS.red],
        borderColor: '#12161f',
        borderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } }
    }
  });
}

function chartGoalsBar(canvasId, games) {
  const realizados = games.filter(g => g.status === 'Realizado');
  const labels = realizados.map(g => g.adversario);
  const marcados = realizados.map(g => g.local === 'Casa' ? g.placarCasa : g.placarFora);
  const sofridos = realizados.map(g => g.local === 'Casa' ? g.placarFora : g.placarCasa);
  return makeChart(canvasId, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Marcados', data: marcados, backgroundColor: CHART_COLORS.green, borderRadius: 6 },
        { label: 'Sofridos', data: sofridos, backgroundColor: CHART_COLORS.red, borderRadius: 6 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
    }
  });
}

function chartTopScorers(canvasId, players) {
  const arr = players.map(p => ({ p, s: calcPlayerStats(p.id) })).sort((a, b) => b.s.gols - a.s.gols).slice(0, 6);
  return makeChart(canvasId, {
    type: 'bar',
    data: {
      labels: arr.map(a => a.p.apelido),
      datasets: [{
        label: 'Gols',
        data: arr.map(a => a.s.gols),
        backgroundColor: CHART_COLORS.gold,
        borderRadius: 6
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } }
    }
  });
}

function chartCardsPie(canvasId, players) {
  let amarelos = 0, vermelhos = 0;
  players.forEach(p => {
    const s = calcPlayerStats(p.id);
    amarelos += s.amarelos;
    vermelhos += s.vermelhos;
  });
  return makeChart(canvasId, {
    type: 'pie',
    data: {
      labels: ['Amarelos', 'Vermelhos'],
      datasets: [{
        data: [amarelos, vermelhos],
        backgroundColor: ['#e2b93b', '#c0392b'],
        borderColor: '#12161f',
        borderWidth: 3
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
  });
}

function chartPlayerRadar(canvasId, playerId) {
  const s = calcPlayerStats(playerId);
  const maxGols = Math.max(1, ...DB.data.players.map(p => calcPlayerStats(p.id).gols));
  const maxAssist = Math.max(1, ...DB.data.players.map(p => calcPlayerStats(p.id).assistencias));
  return makeChart(canvasId, {
    type: 'radar',
    data: {
      labels: ['Gols', 'Assistências', 'Jogos', 'Titularidades', 'Média Notas', 'MVPs'],
      datasets: [{
        label: 'Desempenho',
        data: [
          (s.gols / maxGols) * 10,
          (s.assistencias / maxAssist) * 10,
          Math.min(10, s.jogos),
          Math.min(10, s.titular),
          s.mediaNotas,
          Math.min(10, s.mvp * 3)
        ],
        backgroundColor: 'rgba(212,175,55,0.25)',
        borderColor: CHART_COLORS.gold,
        pointBackgroundColor: CHART_COLORS.green
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { r: { beginAtZero: true, max: 10, ticks: { display: false }, grid: { color: 'rgba(255,255,255,0.08)' } } },
      plugins: { legend: { display: false } }
    }
  });
}

function chartFinanceLine(canvasId) {
  const f = DB.data.financeiro;
  const meses = [...new Set(f.mensalidades.map(m => m.mes))].sort();
  const entradas = meses.map(mes => {
    const mens = f.mensalidades.filter(m => m.mes === mes && m.pago).reduce((a, b) => a + b.valor, 0);
    const patr = f.patrocinios.filter(p => p.data.startsWith(mes)).reduce((a, b) => a + b.valor, 0);
    return mens + patr;
  });
  const saidas = meses.map(mes => f.despesas.filter(d => d.data.startsWith(mes)).reduce((a, b) => a + b.valor, 0));
  return makeChart(canvasId, {
    type: 'line',
    data: {
      labels: meses.map(m => m.split('-').reverse().join('/')),
      datasets: [
        { label: 'Entradas', data: entradas, borderColor: CHART_COLORS.green, backgroundColor: 'rgba(11,93,42,0.25)', fill: true, tension: 0.3 },
        { label: 'Saídas', data: saidas, borderColor: CHART_COLORS.red, backgroundColor: 'rgba(192,57,43,0.15)', fill: true, tension: 0.3 }
      ]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
  });
}

function chartFinancePie(canvasId) {
  const f = DB.data.financeiro;
  const totalMens = f.mensalidades.filter(m => m.pago).reduce((a, b) => a + b.valor, 0);
  const totalPatr = f.patrocinios.reduce((a, b) => a + b.valor, 0);
  return makeChart(canvasId, {
    type: 'doughnut',
    data: {
      labels: ['Mensalidades', 'Patrocínios'],
      datasets: [{
        data: [totalMens, totalPatr],
        backgroundColor: [CHART_COLORS.green, CHART_COLORS.gold],
        borderColor: '#12161f',
        borderWidth: 3
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
  });
}

function chartExpensesBar(canvasId) {
  const f = DB.data.financeiro;
  const porCategoria = {};
  f.despesas.forEach(d => { porCategoria[d.categoria] = (porCategoria[d.categoria] || 0) + d.valor; });
  return makeChart(canvasId, {
    type: 'bar',
    data: {
      labels: Object.keys(porCategoria),
      datasets: [{ label: 'Despesas', data: Object.values(porCategoria), backgroundColor: CHART_COLORS.red, borderRadius: 6 }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
  });
}
