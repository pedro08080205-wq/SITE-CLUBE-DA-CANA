/* ============================================================
   Clube da Cana FC - views.js
   Renderização das telas do painel (views)
   ============================================================ */

const Views = {};

/* ================= DASHBOARD ================= */
Views.dashboard = function () {
  const stats = calcTeamStats();
  const players = DB.data.players;
  const fin = calcFinanceiro();

  const cards = [
    { icon: 'players', label: 'Total de Jogadores', value: players.length },
    { icon: 'ball', label: 'Jogos Disputados', value: stats.jogos },
    { icon: 'trophy', label: 'Vitórias', value: stats.vitorias },
    { icon: 'shield', label: 'Empates', value: stats.empates },
    { icon: 'close', label: 'Derrotas', value: stats.derrotas },
    { icon: 'target', label: 'Aproveitamento', value: stats.aproveitamento + '%' },
    { icon: 'stats', label: 'Gols Marcados', value: stats.golsMarcados },
    { icon: 'shield', label: 'Gols Sofridos', value: stats.golsSofridos },
    { icon: 'star', label: 'Artilheiro', value: stats.artilheiro ? `${stats.artilheiro.jogador.apelido} (${stats.artilheiro.gols})` : '-' },
    { icon: 'target', label: 'Melhor Assistente', value: stats.assistente ? `${stats.assistente.jogador.apelido} (${stats.assistente.assist})` : '-' }
  ];

  const proximo = proximoJogo();

  return `
    ${proximo ? renderNextGameHero(proximo) : ''}
    <div class="grid grid-cols-4" style="margin-bottom:22px;">
      ${cards.map(c => `
        <div class="card stat-card">
          <div class="stat-icon">${icon(c.icon)}</div>
          <div class="stat-info">
            <span class="stat-value">${c.value}</span>
            <span class="stat-label">${c.label}</span>
          </div>
        </div>
      `).join('')}
    </div>
    <div class="grid grid-cols-2">
      <div class="card chart-card">
        <h3 class="section-title">${icon('stats')} Desempenho Recente</h3>
        <div class="chart-wrap"><canvas id="chart-dashboard-performance"></canvas></div>
      </div>
      <div class="card chart-card">
        <h3 class="section-title">${icon('trophy')} Resultados</h3>
        <div class="chart-wrap"><canvas id="chart-dashboard-results"></canvas></div>
      </div>
    </div>
    <div class="card" style="margin-top:18px;">
      <h3 class="section-title">${icon('finance')} Resumo Financeiro</h3>
      <div class="grid grid-cols-4">
        <div class="stat-card card" style="background:var(--bg-3);"><div class="stat-info"><span class="stat-value">${formatMoney(fin.totalMensalidades)}</span><span class="stat-label">Mensalidades Pagas</span></div></div>
        <div class="stat-card card" style="background:var(--bg-3);"><div class="stat-info"><span class="stat-value">${formatMoney(fin.totalPatrocinios)}</span><span class="stat-label">Patrocínios</span></div></div>
        <div class="stat-card card" style="background:var(--bg-3);"><div class="stat-info"><span class="stat-value">${formatMoney(fin.totalDespesas)}</span><span class="stat-label">Despesas</span></div></div>
        <div class="stat-card card" style="background:var(--bg-3);"><div class="stat-info"><span class="stat-value" style="color:${fin.caixa >= 0 ? '#6fd396' : '#ff8b7d'}">${formatMoney(fin.caixa)}</span><span class="stat-label">Caixa Atual</span></div></div>
      </div>
    </div>
  `;
};

Views.dashboardAfterRender = function () {
  chartPerformanceLine('chart-dashboard-performance', DB.data.games);
  chartResultsPie('chart-dashboard-results', calcTeamStats());
};

function renderNextGameHero(g) {
  const dataJogo = new Date(g.data + 'T' + (g.horario || '00:00:00'));
  return `
    <div class="next-game-hero">
      <div class="ngh-top">
        <div><span class="badge badge-gold">${g.tipo}</span></div>
        <div class="game-meta-item">${icon('location')} ${g.local === 'Casa' ? 'Jogo em Casa' : 'Jogo Fora'}</div>
      </div>
      <div class="vs-row">
        <div class="vs-team"><img src="logo.png" alt="Clube"><span>Clube da Cana</span></div>
        <div class="vs-divider">VS</div>
        <div class="vs-team"><img src="logo.png" alt="Adversário" style="opacity:0.4"><span>${g.adversario}</span></div>
      </div>
      <div class="countdown" id="countdown-box" data-datetime="${g.data}T${g.horario || '00:00'}:00"></div>
      <div class="game-meta">
        <span class="game-meta-item">${icon('clock')} ${formatDate(g.data)} às ${g.horario}</span>
        <span class="game-meta-item">${icon('location')} ${g.campo}, ${g.cidade}</span>
        <span class="game-meta-item">${icon('ball')} ${g.campeonato}</span>
      </div>
    </div>
  `;
}

function startCountdown() {
  const box = document.getElementById('countdown-box');
  if (!box) return;
  const target = new Date(box.dataset.datetime).getTime();

  function tick() {
    const el = document.getElementById('countdown-box');
    if (!el) return;
    const now = Date.now();
    let diff = target - now;
    if (diff < 0) diff = 0;
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    el.innerHTML = `
      <div class="countdown-box"><span class="cd-num">${d}</span><span class="cd-label">Dias</span></div>
      <div class="countdown-box"><span class="cd-num">${String(h).padStart(2, '0')}</span><span class="cd-label">Horas</span></div>
      <div class="countdown-box"><span class="cd-num">${String(m).padStart(2, '0')}</span><span class="cd-label">Min</span></div>
      <div class="countdown-box"><span class="cd-num">${String(s).padStart(2, '0')}</span><span class="cd-label">Seg</span></div>
    `;
  }
  tick();
  if (window._countdownInterval) clearInterval(window._countdownInterval);
  window._countdownInterval = setInterval(tick, 1000);
}

/* ================= PROXIMO JOGO ================= */
Views.proximoJogo = function () {
  const g = proximoJogo();
  if (!g) {
    return `<div class="card empty-state">${icon('ball')}<p>Nenhum jogo agendado no momento.</p></div>`;
  }
  return `
    ${renderNextGameHero(g)}
    <div class="card">
      <h3 class="section-title">${icon('history')} Detalhes da Partida</h3>
      <div class="grid grid-cols-3">
        <div><strong>Adversário:</strong> ${g.adversario}</div>
        <div><strong>Campeonato:</strong> ${g.campeonato}</div>
        <div><strong>Tipo:</strong> ${g.tipo}</div>
        <div><strong>Local:</strong> ${g.local}</div>
        <div><strong>Campo:</strong> ${g.campo}</div>
        <div><strong>Cidade:</strong> ${g.cidade}</div>
        <div><strong>Data:</strong> ${formatDate(g.data)}</div>
        <div><strong>Horário:</strong> ${g.horario}</div>
        <div><strong>Árbitro:</strong> ${g.arbitro || '-'}</div>
      </div>
      ${g.obs ? `<p style="margin-top:14px;color:var(--text-dim);"><strong>Obs:</strong> ${g.obs}</p>` : ''}
      ${Auth.isAdmin() ? `<div style="margin-top:18px;display:flex;gap:10px;flex-wrap:wrap;">
        <button class="btn btn-primary" onclick="openGamePostMatchModal('${g.id}')">${icon('trophy')} Lançar Resultado</button>
        <button class="btn btn-ghost" onclick="Router.navigate('escalacao')">${icon('lineup')} Definir Escalação</button>
      </div>` : ''}
    </div>
  `;
};

Views.proximoJogoAfterRender = function () { startCountdown(); };

/* ================= HISTORICO ================= */
Views.historico = function (state) {
  state = state || {};
  const filtroTipo = state.tipo || '';
  const filtroResultado = state.resultado || '';
  let games = [...DB.data.games].filter(g => g.status === 'Realizado');

  if (filtroTipo) games = games.filter(g => g.tipo === filtroTipo);
  if (filtroResultado) {
    games = games.filter(g => {
      const golsPro = g.local === 'Casa' ? g.placarCasa : g.placarFora;
      const golsContra = g.local === 'Casa' ? g.placarFora : g.placarCasa;
      const res = golsPro > golsContra ? 'V' : golsPro === golsContra ? 'E' : 'D';
      return res === filtroResultado;
    });
  }
  games.sort((a, b) => new Date(b.data) - new Date(a.data));

  return `
    <div class="toolbar">
      <div class="toolbar-filters">
        <select id="filtro-tipo" onchange="Router.updateState('historico', {tipo:this.value})">
          <option value="">Todos os tipos</option>
          <option value="Campeonato" ${filtroTipo === 'Campeonato' ? 'selected' : ''}>Campeonato</option>
          <option value="Amistoso" ${filtroTipo === 'Amistoso' ? 'selected' : ''}>Amistoso</option>
          <option value="Copa" ${filtroTipo === 'Copa' ? 'selected' : ''}>Copa</option>
        </select>
        <select id="filtro-resultado" onchange="Router.updateState('historico', {resultado:this.value})">
          <option value="">Todos os resultados</option>
          <option value="V" ${filtroResultado === 'V' ? 'selected' : ''}>Vitórias</option>
          <option value="E" ${filtroResultado === 'E' ? 'selected' : ''}>Empates</option>
          <option value="D" ${filtroResultado === 'D' ? 'selected' : ''}>Derrotas</option>
        </select>
      </div>
      ${Auth.isAdmin() ? `<button class="btn btn-primary" onclick="openGameFormModal()">${icon('plus')} Novo Jogo</button>` : ''}
    </div>
    <div id="historico-list">
      ${games.length ? games.map(renderGameRow).join('') : `<div class="card empty-state">${icon('history')}<p>Nenhum jogo encontrado.</p></div>`}
    </div>
  `;
};

function renderGameRow(g) {
  const golsPro = g.local === 'Casa' ? g.placarCasa : g.placarFora;
  const golsContra = g.local === 'Casa' ? g.placarFora : g.placarCasa;
  const res = golsPro > golsContra ? 'V' : golsPro === golsContra ? 'E' : 'D';
  const resColor = res === 'V' ? 'badge-green' : res === 'E' ? 'badge-gold' : 'badge-red';
  const [y, m, d] = g.data.split('-');
  const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  return `
    <div class="game-row">
      <div class="gr-date"><span class="day">${d}</span><span class="month">${meses[parseInt(m) - 1]}</span></div>
      <div class="gr-info">
        <div class="gr-adv">${g.local === 'Casa' ? 'Clube da Cana FC' : g.adversario} <span style="color:var(--text-dim);font-weight:400;">x</span> ${g.local === 'Casa' ? g.adversario : 'Clube da Cana FC'}</div>
        <small>${g.campeonato} · ${g.campo}, ${g.cidade}</small>
      </div>
      <div class="gr-score">${g.placarCasa ?? '-'} : ${g.placarFora ?? '-'}</div>
      <span class="badge ${resColor}">${res === 'V' ? 'Vitória' : res === 'E' ? 'Empate' : 'Derrota'}</span>
      <div class="table-actions">
        <button class="icon-btn" title="Ver detalhes" onclick="openGameDetailModal('${g.id}')">${icon('eye')}</button>
        ${Auth.isAdmin() ? `<button class="icon-btn" title="Editar" onclick="openGameFormModal('${g.id}')">${icon('edit')}</button>
        <button class="icon-btn" title="Excluir" onclick="deleteGame('${g.id}')">${icon('trash')}</button>` : ''}
      </div>
    </div>
  `;
}

/* ================= JOGADORES ================= */
Views.jogadores = function (state) {
  state = state || {};
  const busca = (state.busca || '').toLowerCase();
  const posicaoF = state.posicao || '';
  const statusF = state.status || '';

  let players = [...DB.data.players];
  if (busca) players = players.filter(p => p.nome.toLowerCase().includes(busca) || p.apelido.toLowerCase().includes(busca));
  if (posicaoF) players = players.filter(p => p.posicao === posicaoF);
  if (statusF) players = players.filter(p => p.status === statusF);

  return `
    <div class="toolbar">
      <div class="toolbar-filters">
        <input type="text" placeholder="Buscar jogador..." value="${state.busca || ''}" oninput="Router.updateState('jogadores', {busca:this.value})">
        <select onchange="Router.updateState('jogadores', {posicao:this.value})">
          <option value="">Todas posições</option>
          ${POSICOES.map(p => `<option value="${p}" ${posicaoF === p ? 'selected' : ''}>${p}</option>`).join('')}
        </select>
        <select onchange="Router.updateState('jogadores', {status:this.value})">
          <option value="">Todos status</option>
          ${STATUS_JOGADOR.map(s => `<option value="${s}" ${statusF === s ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </div>
      ${Auth.isAdmin() ? `<button class="btn btn-primary" onclick="openPlayerFormModal()">${icon('plus')} Novo Jogador</button>` : ''}
    </div>
    <div class="grid grid-cols-4">
      ${players.length ? players.map(renderPlayerCard).join('') : `<div class="card empty-state" style="grid-column:1/-1;">${icon('players')}<p>Nenhum jogador encontrado.</p></div>`}
    </div>
  `;
};

function statusBadgeClass(status) {
  return { Ativo: 'badge-green', Lesionado: 'badge-red', Suspenso: 'badge-gold', Inativo: 'badge-gray' }[status] || 'badge-gray';
}

function renderPlayerCard(p) {
  return `
    <div class="card player-card">
      <span class="p-number">#${p.numero}</span>
      <img src="${p.foto}" class="avatar-lg" alt="${p.nome}">
      <div class="p-name">${p.nome}</div>
      <div class="p-nick">"${p.apelido}"</div>
      <div class="p-pos">${p.posicao}</div>
      <span class="badge ${statusBadgeClass(p.status)}">${p.status}</span>
      <div class="p-actions">
        <button class="icon-btn" title="Ver estatísticas" onclick="Router.navigate('estatisticas', {jogadorId:'${p.id}'})">${icon('stats')}</button>
        ${Auth.isAdmin() ? `
        <button class="icon-btn" title="Editar" onclick="openPlayerFormModal('${p.id}')">${icon('edit')}</button>
        <button class="icon-btn" title="Excluir" onclick="deletePlayer('${p.id}')">${icon('trash')}</button>
        ` : ''}
      </div>
    </div>
  `;
}

/* ================= ESTATISTICAS INDIVIDUAIS ================= */
Views.estatisticas = function (state) {
  state = state || {};
  const players = DB.data.players;
  const selectedId = state.jogadorId || players[0]?.id;
  const p = getPlayer(selectedId);

  if (!p) return `<div class="card empty-state">Nenhum jogador cadastrado.</div>`;

  const s = calcPlayerStats(p.id);

  return `
    <div class="toolbar">
      <div class="toolbar-filters">
        <select onchange="Router.updateState('estatisticas', {jogadorId:this.value})">
          ${players.map(pl => `<option value="${pl.id}" ${pl.id === selectedId ? 'selected' : ''}>${pl.nome} (${pl.apelido})</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="profile-header">
      <img src="${p.foto}" alt="${p.nome}">
      <div>
        <h2>${p.nome} <span style="color:var(--gold)">#${p.numero}</span></h2>
        <div class="p-nick">"${p.apelido}" · ${p.posicao}</div>
        <span class="badge ${statusBadgeClass(p.status)}">${p.status}</span>
      </div>
    </div>
    <div class="grid grid-cols-4" style="margin-bottom:20px;">
      ${statBlock('ball', 'Jogos', s.jogos)}
      ${statBlock('user', 'Titular', s.titular)}
      ${statBlock('players', 'Reserva', s.reserva)}
      ${statBlock('target', 'Gols', s.gols)}
      ${statBlock('star', 'Assistências', s.assistencias)}
      ${statBlock('card', 'Cartões Amarelos', s.amarelos)}
      ${statBlock('card', 'Cartões Vermelhos', s.vermelhos)}
      ${statBlock('clock', 'Minutos Jogados', s.minutos)}
      ${statBlock('trophy', 'Média de Notas', s.mediaNotas.toFixed(1))}
      ${statBlock('star', 'MVPs', s.mvp)}
    </div>
    <div class="grid grid-cols-2">
      <div class="card chart-card">
        <h3 class="section-title">${icon('stats')} Radar de Desempenho</h3>
        <div class="chart-wrap"><canvas id="chart-player-radar"></canvas></div>
      </div>
      <div class="card">
        <h3 class="section-title">${icon('players')} Informações Pessoais</h3>
        <div class="profile-info-item">${icon('cake')} <strong>Nascimento:</strong>&nbsp;${formatDate(p.dataNascimento)} (${calcAge(p.dataNascimento)} anos)</div>
        <div class="profile-info-item" style="margin-top:10px;">${icon('phone')} <strong>Telefone:</strong>&nbsp;${p.telefone || '-'}</div>
        <div class="profile-info-item" style="margin-top:10px;">${icon('shield')} <strong>Pé Dominante:</strong>&nbsp;${p.peDominante}</div>
        <div class="profile-info-item" style="margin-top:10px;">${icon('ruler')} <strong>Altura:</strong>&nbsp;${p.altura} cm</div>
        <div class="profile-info-item" style="margin-top:10px;">${icon('weight')} <strong>Peso:</strong>&nbsp;${p.peso} kg</div>
      </div>
    </div>
  `;
};

function statBlock(iconName, label, value) {
  return `<div class="card stat-card"><div class="stat-icon">${icon(iconName)}</div><div class="stat-info"><span class="stat-value">${value}</span><span class="stat-label">${label}</span></div></div>`;
}

Views.estatisticasAfterRender = function (state) {
  const players = DB.data.players;
  const selectedId = (state && state.jogadorId) || players[0]?.id;
  if (selectedId) chartPlayerRadar('chart-player-radar', selectedId);
};

/* ================= RELACIONADOS ================= */
Views.relacionados = function (state) {
  state = state || {};
  const games = DB.data.games.filter(g => g.status === 'Agendado');
  const gameId = state.jogoId || games[0]?.id;
  const game = gameId ? getGame(gameId) : null;
  const players = DB.data.players.filter(p => p.status !== 'Inativo');

  if (!game) {
    return `<div class="card empty-state">${icon('called')}<p>Nenhum jogo agendado para convocar jogadores.</p></div>`;
  }

  const convocados = game.convocados || [];

  return `
    <div class="toolbar">
      <div class="toolbar-filters">
        <select onchange="Router.updateState('relacionados', {jogoId:this.value})">
          ${games.map(g => `<option value="${g.id}" ${g.id === gameId ? 'selected' : ''}>${g.adversario} - ${formatDate(g.data)}</option>`).join('')}
        </select>
      </div>
      ${Auth.isAdmin() ? `<button class="btn btn-gold" onclick="generateConvocationCard('${game.id}')">${icon('shield')} Gerar Card de Convocação</button>` : ''}
    </div>
    <div class="grid grid-cols-2">
      <div class="card">
        <h3 class="section-title">${icon('players')} Elenco Disponível</h3>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Convocar</th><th>Jogador</th><th>Posição</th></tr></thead>
            <tbody>
              ${players.map(p => `
                <tr>
                  <td><input type="checkbox" ${convocados.includes(p.id) ? 'checked' : ''} ${Auth.isAdmin() ? '' : 'disabled'} onchange="toggleConvocado('${game.id}','${p.id}',this.checked)"></td>
                  <td class="player-cell"><img src="${p.foto}" class="avatar-sm">${p.nome} (${p.apelido})</td>
                  <td>${p.posicao}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
      <div id="convocation-card-area" class="card">
        <h3 class="section-title">${icon('shield')} Prévia do Card</h3>
        ${renderConvocationCard(game)}
      </div>
    </div>
  `;
};

function renderConvocationCard(game) {
  const convocados = (game.convocados || []).map(id => getPlayer(id)).filter(Boolean);
  return `
    <div class="convoc-card" id="convoc-card-print">
      <img src="logo.png" class="cc-logo" alt="logo">
      <h3>CONVOCAÇÃO OFICIAL</h3>
      <div class="cc-sub">vs ${game.adversario} · ${formatDate(game.data)} às ${game.horario}<br>${game.campo}, ${game.cidade}</div>
      <div class="convoc-list">
        ${convocados.map(p => `<div><span class="cnum">#${p.numero}</span> ${p.nome}</div>`).join('')}
      </div>
    </div>
  `;
}

/* ================= ESCALACAO ================= */
Views.escalacao = function (state) {
  state = state || {};
  const games = DB.data.games;
  const gameId = state.jogoId || games[0]?.id;
  const game = getGame(gameId);
  if (!game) return `<div class="card empty-state">Nenhum jogo cadastrado.</div>`;

  const formacao = state.formacao || game.escalacao?.formacao || '4-4-2';
  const slots = FORMATIONS[formacao];
  const titulares = game.escalacao?.titulares || [];
  const convocadosIds = game.convocados || DB.data.players.map(p => p.id);
  const escaladosIds = titulares.map(t => t.jogadorId);
  const banco = convocadosIds.filter(id => !escaladosIds.includes(id));

  return `
    <div class="toolbar">
      <div class="toolbar-filters">
        <select onchange="Router.updateState('escalacao', {jogoId:this.value})">
          ${games.map(g => `<option value="${g.id}" ${g.id === gameId ? 'selected' : ''}>${g.adversario} - ${formatDate(g.data)}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="formation-select">
      ${Object.keys(FORMATIONS).map(f => `<button class="formation-btn ${f === formacao ? 'active' : ''}" onclick="setFormation('${game.id}','${f}')">${f}</button>`).join('')}
    </div>
    <div class="field-wrap">
      <div class="field-container" id="field-container">
        ${renderFieldSVGLines()}
        ${slots.map((slot, idx) => renderFieldSlot(slot, idx, titulares)).join('')}
      </div>
      <div class="bench-panel">
        <h3 class="section-title">${icon('players')} Banco / Convocados</h3>
        <div id="bench-list">
          ${banco.length ? banco.map(id => renderBenchPlayer(getPlayer(id))).join('') : `<p style="color:var(--text-dim);font-size:0.85rem;">Todos os convocados estão escalados.</p>`}
        </div>
      </div>
    </div>
  `;
};

function renderFieldSVGLines() {
  return `
    <svg class="field-lines" viewBox="0 0 100 66" preserveAspectRatio="none">
      <rect x="1" y="1" width="98" height="64" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="0.4"/>
      <line x1="50" y1="1" x2="50" y2="65" stroke="rgba(255,255,255,0.4)" stroke-width="0.4"/>
      <circle cx="50" cy="33" r="9" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="0.4"/>
      <rect x="1" y="18" width="14" height="30" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="0.4"/>
      <rect x="85" y="18" width="14" height="30" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="0.4"/>
      <rect x="1" y="24" width="6" height="18" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="0.4"/>
      <rect x="93" y="24" width="6" height="18" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="0.4"/>
    </svg>
  `;
}

function renderFieldSlot(slot, idx, titulares) {
  const t = titulares.find(t => t.slot === idx);
  const p = t ? getPlayer(t.jogadorId) : null;
  return `
    <div class="field-slot ${p ? 'filled' : ''}" data-slot="${idx}"
         style="left:${slot.x}%;top:${slot.y}%;"
         ondragover="event.preventDefault(); this.classList.add('drag-over')"
         ondragleave="this.classList.remove('drag-over')"
         ondrop="onSlotDrop(event, ${idx})">
      <div class="slot-circle">${p ? `<img src="${p.foto}" alt="${p.nome}">` : slot.label}</div>
      <div class="slot-label">${p ? p.apelido : slot.label}</div>
    </div>
  `;
}

function renderBenchPlayer(p) {
  if (!p) return '';
  return `
    <div class="bench-player" draggable="${Auth.isAdmin()}" ondragstart="onBenchDragStart(event,'${p.id}')" data-player="${p.id}">
      <img src="${p.foto}" alt="${p.nome}">
      <div class="bp-info"><span>${p.apelido} #${p.numero}</span><small>${p.posicao}</small></div>
    </div>
  `;
}

/* ================= ESTATISTICAS DO TIME ================= */
Views.estatisticasTime = function () {
  const stats = calcTeamStats();
  return `
    <div class="grid grid-cols-2">
      <div class="card chart-card">
        <h3 class="section-title">${icon('trophy')} Resultados (Vitórias/Empates/Derrotas)</h3>
        <div class="chart-wrap"><canvas id="chart-team-pie"></canvas></div>
      </div>
      <div class="card chart-card">
        <h3 class="section-title">${icon('target')} Gols Marcados x Sofridos</h3>
        <div class="chart-wrap"><canvas id="chart-team-goals"></canvas></div>
      </div>
      <div class="card chart-card">
        <h3 class="section-title">${icon('star')} Top Artilheiros</h3>
        <div class="chart-wrap"><canvas id="chart-team-scorers"></canvas></div>
      </div>
      <div class="card chart-card">
        <h3 class="section-title">${icon('card')} Cartões</h3>
        <div class="chart-wrap"><canvas id="chart-team-cards"></canvas></div>
      </div>
    </div>
  `;
};

Views.estatisticasTimeAfterRender = function () {
  const stats = calcTeamStats();
  chartResultsPie('chart-team-pie', stats);
  chartGoalsBar('chart-team-goals', DB.data.games);
  chartTopScorers('chart-team-scorers', DB.data.players);
  chartCardsPie('chart-team-cards', DB.data.players);
};

/* ================= FINANCEIRO ================= */
Views.financeiro = function (state) {
  state = state || {};
  const tab = state.tab || 'resumo';
  const fin = calcFinanceiro();

  const tabs = [
    { id: 'resumo', label: 'Resumo' },
    { id: 'mensalidades', label: 'Mensalidades' },
    { id: 'patrocinios', label: 'Patrocínios' },
    { id: 'despesas', label: 'Despesas' }
  ];

  let content = '';
  if (tab === 'resumo') {
    content = `
      <div class="grid grid-cols-4" style="margin-bottom:20px;">
        ${statBlock('money', 'Mensalidades Pagas', formatMoney(fin.totalMensalidades))}
        ${statBlock('clock', 'Pendente', formatMoney(fin.totalPendente))}
        ${statBlock('trophy', 'Patrocínios', formatMoney(fin.totalPatrocinios))}
        ${statBlock('card', 'Despesas', formatMoney(fin.totalDespesas))}
      </div>
      <div class="card" style="margin-bottom:18px;background:linear-gradient(135deg,var(--green-dark),var(--green));">
        <h3 class="section-title" style="color:var(--white)">${icon('money')} Caixa Atual</h3>
        <div class="stat-value" style="font-size:2.2rem;color:${fin.caixa >= 0 ? 'var(--gold)' : '#ff8b7d'}">${formatMoney(fin.caixa)}</div>
      </div>
      <div class="grid grid-cols-2">
        <div class="card chart-card"><h3 class="section-title">${icon('stats')} Entradas x Saídas</h3><div class="chart-wrap"><canvas id="chart-finance-line"></canvas></div></div>
        <div class="card chart-card"><h3 class="section-title">${icon('money')} Origem das Receitas</h3><div class="chart-wrap"><canvas id="chart-finance-pie"></canvas></div></div>
      </div>
      <div class="card chart-card" style="margin-top:18px;"><h3 class="section-title">${icon('card')} Despesas por Categoria</h3><div class="chart-wrap"><canvas id="chart-finance-expenses"></canvas></div></div>
    `;
  } else if (tab === 'mensalidades') {
    const mens = DB.data.financeiro.mensalidades;
    content = `
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Jogador</th><th>Mês</th><th>Valor</th><th>Status</th>${Auth.isAdmin() ? '<th>Ações</th>' : ''}</tr></thead>
          <tbody>
            ${mens.map(m => {
              const p = getPlayer(m.jogadorId);
              return `<tr>
                <td class="player-cell">${p ? `<img src="${p.foto}" class="avatar-sm">${p.nome}` : '-'}</td>
                <td>${m.mes.split('-').reverse().join('/')}</td>
                <td>${formatMoney(m.valor)}</td>
                <td><span class="badge ${m.pago ? 'badge-green' : 'badge-red'}">${m.pago ? 'Pago' : 'Pendente'}</span></td>
                ${Auth.isAdmin() ? `<td><button class="btn btn-sm btn-ghost" onclick="toggleMensalidade('${m.id}')">${m.pago ? 'Marcar Pendente' : 'Marcar Pago'}</button></td>` : ''}
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  } else if (tab === 'patrocinios') {
    const patr = DB.data.financeiro.patrocinios;
    content = `
      ${Auth.isAdmin() ? `<div class="toolbar"><div></div><button class="btn btn-primary" onclick="openSponsorFinanceModal()">${icon('plus')} Novo Patrocínio</button></div>` : ''}
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Nome</th><th>Valor</th><th>Data</th><th>Obs</th>${Auth.isAdmin() ? '<th>Ações</th>' : ''}</tr></thead>
          <tbody>
            ${patr.map(p => `<tr>
              <td>${p.nome}</td><td>${formatMoney(p.valor)}</td><td>${formatDate(p.data)}</td><td>${p.obs || '-'}</td>
              ${Auth.isAdmin() ? `<td><button class="icon-btn" onclick="deleteFinanceItem('patrocinios','${p.id}')">${icon('trash')}</button></td>` : ''}
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    `;
  } else if (tab === 'despesas') {
    const desp = DB.data.financeiro.despesas;
    content = `
      ${Auth.isAdmin() ? `<div class="toolbar"><div></div><button class="btn btn-primary" onclick="openExpenseModal()">${icon('plus')} Nova Despesa</button></div>` : ''}
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Descrição</th><th>Categoria</th><th>Valor</th><th>Data</th>${Auth.isAdmin() ? '<th>Ações</th>' : ''}</tr></thead>
          <tbody>
            ${desp.map(d => `<tr>
              <td>${d.descricao}</td><td>${d.categoria}</td><td>${formatMoney(d.valor)}</td><td>${formatDate(d.data)}</td>
              ${Auth.isAdmin() ? `<td><button class="icon-btn" onclick="deleteFinanceItem('despesas','${d.id}')">${icon('trash')}</button></td>` : ''}
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  return `
    <div class="finance-tabs">
      ${tabs.map(t => `<button class="finance-tab ${tab === t.id ? 'active' : ''}" onclick="Router.updateState('financeiro',{tab:'${t.id}'})">${t.label}</button>`).join('')}
    </div>
    ${content}
  `;
};

Views.financeiroAfterRender = function (state) {
  const tab = (state && state.tab) || 'resumo';
  if (tab === 'resumo') {
    chartFinanceLine('chart-finance-line');
    chartFinancePie('chart-finance-pie');
    chartExpensesBar('chart-finance-expenses');
  }
};

/* ================= CONFIGURACOES ================= */
Views.configuracoes = function () {
  const cfg = DB.data.config;
  return `
    <div class="settings-section card">
      <h3 class="section-title">${icon('lock')} Alterar Senhas</h3>
      <div class="field-row">
        <div class="field"><label>Nova senha do Administrador</label><input type="password" id="cfg-senha-admin" placeholder="••••••••"></div>
        <div class="field"><label>Nova senha do Jogador</label><input type="password" id="cfg-senha-jogador" placeholder="••••••••"></div>
      </div>
      <button class="btn btn-primary" onclick="saveConfigPasswords()">${icon('save')} Salvar Senhas</button>
    </div>

    <div class="settings-section card">
      <h3 class="section-title">${icon('settings')} Cores do Clube</h3>
      <div class="color-swatch-row">
        <div class="color-swatch"><input type="color" id="cfg-cor-primaria" value="${cfg.corPrimaria}"><span>Verde Primário</span></div>
        <div class="color-swatch"><input type="color" id="cfg-cor-dourada" value="${cfg.corDourada}"><span>Dourado</span></div>
      </div>
      <button class="btn btn-primary" style="margin-top:14px;" onclick="saveConfigColors()">${icon('save')} Aplicar Cores</button>
    </div>

    <div class="settings-section card">
      <h3 class="section-title">${icon('trophy')} Patrocinadores</h3>
      <div id="sponsor-list">
        ${cfg.patrocinadores.map(s => `
          <div class="sponsor-row">
            <span>${s.nome}</span>
            <button class="icon-btn" onclick="removeSponsor('${s.id}')">${icon('trash')}</button>
          </div>
        `).join('')}
      </div>
      <div class="field-row" style="margin-top:14px;">
        <input type="text" id="new-sponsor-name" placeholder="Nome do patrocinador" style="flex:1;padding:11px 14px;border-radius:8px;border:1px solid var(--border);background:var(--bg-3);color:var(--text-main);">
        <button class="btn btn-primary" onclick="addSponsor()">${icon('plus')} Adicionar</button>
      </div>
    </div>

    <div class="settings-section card">
      <h3 class="section-title">${icon('trash')} Dados</h3>
      <p style="color:var(--text-dim);font-size:0.85rem;">Restaurar todos os dados para o estado inicial de exemplo. Esta ação não pode ser desfeita.</p>
      <button class="btn btn-danger" onclick="resetAllData()">${icon('trash')} Restaurar Dados de Exemplo</button>
    </div>
  `;
};

/* ================= PERFIL JOGADOR (somente leitura) ================= */
Views.perfilJogador = function () {
  const players = DB.data.players;
  return `
    <div class="readonly-note">${icon('eye')} Modo somente leitura — Acesso de Jogador</div>
    <div class="grid grid-cols-4">
      ${players.map(renderPlayerCard).join('')}
    </div>
  `;
};
