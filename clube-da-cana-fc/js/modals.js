/* ============================================================
   Clube da Cana FC - modals.js
   Modais de CRUD e ações administrativas
   ============================================================ */

function openModal(html, wide) {
  const overlay = document.getElementById('modal-overlay');
  const box = document.getElementById('modal-box');
  box.className = 'modal-box' + (wide ? ' modal-wide' : '');
  box.innerHTML = html;
  overlay.classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  document.getElementById('modal-box').innerHTML = '';
}

document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('modal-overlay');
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
});

function showToast(msg, type) {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = 'toast' + (type ? ' toast-' + type : '');
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity 0.3s'; setTimeout(() => el.remove(), 300); }, 3000);
}

/* ================= JOGADOR - FORM MODAL ================= */

let tempPhotoData = null;

function openPlayerFormModal(id) {
  const p = id ? getPlayer(id) : null;
  tempPhotoData = p ? p.foto : null;

  openModal(`
    <div class="modal-header">
      <h3>${p ? 'Editar Jogador' : 'Novo Jogador'}</h3>
      <button class="icon-btn" onclick="closeModal()">${icon('close')}</button>
    </div>
    <div class="modal-body">
      <div class="photo-upload-box" onclick="document.getElementById('player-photo-input').click()">
        <img id="player-photo-preview" src="${p ? p.foto : svgAvatarPlaceholder('?')}" alt="preview">
        <span style="color:var(--text-dim);font-size:0.82rem;">${icon('upload')} Clique para enviar uma foto</span>
        <input type="file" id="player-photo-input" accept="image/*" class="hidden" onchange="handlePlayerPhotoUpload(event)">
      </div>
      <div class="field-row">
        <div class="field"><label>Nome Completo</label><input type="text" id="pf-nome" value="${p ? p.nome : ''}" required></div>
        <div class="field"><label>Apelido</label><input type="text" id="pf-apelido" value="${p ? p.apelido : ''}" required></div>
      </div>
      <div class="field-row-3">
        <div class="field"><label>Número</label><input type="number" id="pf-numero" min="1" max="99" value="${p ? p.numero : ''}" required></div>
        <div class="field"><label>Posição</label>
          <select id="pf-posicao">${POSICOES.map(pos => `<option ${p && p.posicao === pos ? 'selected' : ''}>${pos}</option>`).join('')}</select>
        </div>
        <div class="field"><label>Status</label>
          <select id="pf-status">${STATUS_JOGADOR.map(s => `<option ${p && p.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select>
        </div>
      </div>
      <div class="field-row">
        <div class="field"><label>Data de Nascimento</label><input type="date" id="pf-nascimento" value="${p ? p.dataNascimento : ''}"></div>
        <div class="field"><label>Telefone</label><input type="text" id="pf-telefone" value="${p ? p.telefone : ''}" placeholder="(00) 00000-0000"></div>
      </div>
      <div class="field-row-3">
        <div class="field"><label>Pé Dominante</label>
          <select id="pf-pe"><option ${p && p.peDominante === 'Direito' ? 'selected' : ''}>Direito</option><option ${p && p.peDominante === 'Esquerdo' ? 'selected' : ''}>Esquerdo</option><option ${p && p.peDominante === 'Ambidestro' ? 'selected' : ''}>Ambidestro</option></select>
        </div>
        <div class="field"><label>Altura (cm)</label><input type="number" id="pf-altura" value="${p ? p.altura : ''}"></div>
        <div class="field"><label>Peso (kg)</label><input type="number" id="pf-peso" value="${p ? p.peso : ''}"></div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="savePlayer(${p ? `'${p.id}'` : 'null'})">${icon('save')} Salvar</button>
    </div>
  `);
}

function handlePlayerPhotoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    tempPhotoData = reader.result;
    document.getElementById('player-photo-preview').src = reader.result;
  };
  reader.readAsDataURL(file);
}

function savePlayer(id) {
  const nome = document.getElementById('pf-nome').value.trim();
  const apelido = document.getElementById('pf-apelido').value.trim();
  const numero = parseInt(document.getElementById('pf-numero').value);
  if (!nome || !apelido || !numero) { showToast('Preencha os campos obrigatórios.', 'error'); return; }

  const data = {
    nome, apelido, numero,
    posicao: document.getElementById('pf-posicao').value,
    status: document.getElementById('pf-status').value,
    dataNascimento: document.getElementById('pf-nascimento').value,
    telefone: document.getElementById('pf-telefone').value,
    peDominante: document.getElementById('pf-pe').value,
    altura: parseInt(document.getElementById('pf-altura').value) || null,
    peso: parseInt(document.getElementById('pf-peso').value) || null,
    foto: tempPhotoData || svgAvatarPlaceholder(nome)
  };

  if (id) {
    const p = getPlayer(id);
    Object.assign(p, data);
    showToast('Jogador atualizado com sucesso!');
  } else {
    data.id = uid('jog');
    DB.data.players.push(data);
    showToast('Jogador cadastrado com sucesso!');
  }
  DB.save();
  closeModal();
  Router.render();
}

function deletePlayer(id) {
  const p = getPlayer(id);
  if (!confirm(`Excluir o jogador "${p.nome}"? Essa ação não pode ser desfeita.`)) return;
  DB.data.players = DB.data.players.filter(pl => pl.id !== id);
  DB.save();
  showToast('Jogador removido.');
  Router.render();
}

/* ================= JOGO - FORM MODAL (Cadastro) ================= */

function openGameFormModal(id) {
  const g = id ? getGame(id) : null;

  openModal(`
    <div class="modal-header">
      <h3>${g ? 'Editar Jogo' : 'Novo Jogo'}</h3>
      <button class="icon-btn" onclick="closeModal()">${icon('close')}</button>
    </div>
    <div class="modal-body">
      <div class="field-row">
        <div class="field"><label>Adversário</label><input type="text" id="gf-adversario" value="${g ? g.adversario : ''}" required></div>
        <div class="field"><label>Campeonato</label><input type="text" id="gf-campeonato" value="${g ? g.campeonato : ''}"></div>
      </div>
      <div class="field-row-3">
        <div class="field"><label>Tipo</label>
          <select id="gf-tipo">
            <option ${g && g.tipo === 'Campeonato' ? 'selected' : ''}>Campeonato</option>
            <option ${g && g.tipo === 'Amistoso' ? 'selected' : ''}>Amistoso</option>
            <option ${g && g.tipo === 'Copa' ? 'selected' : ''}>Copa</option>
          </select>
        </div>
        <div class="field"><label>Local</label>
          <select id="gf-local"><option ${g && g.local === 'Casa' ? 'selected' : ''}>Casa</option><option ${g && g.local === 'Fora' ? 'selected' : ''}>Fora</option></select>
        </div>
        <div class="field"><label>Status</label>
          <select id="gf-status"><option ${g && g.status === 'Agendado' ? 'selected' : ''}>Agendado</option><option ${g && g.status === 'Realizado' ? 'selected' : ''}>Realizado</option></select>
        </div>
      </div>
      <div class="field-row">
        <div class="field"><label>Campo</label><input type="text" id="gf-campo" value="${g ? g.campo : ''}"></div>
        <div class="field"><label>Cidade</label><input type="text" id="gf-cidade" value="${g ? g.cidade : ''}"></div>
      </div>
      <div class="field-row-3">
        <div class="field"><label>Data</label><input type="date" id="gf-data" value="${g ? g.data : ''}" required></div>
        <div class="field"><label>Horário</label><input type="time" id="gf-horario" value="${g ? g.horario : ''}"></div>
        <div class="field"><label>Árbitro</label><input type="text" id="gf-arbitro" value="${g ? g.arbitro : ''}"></div>
      </div>
      <div class="field"><label>Observações</label><textarea id="gf-obs">${g ? g.obs || '' : ''}</textarea></div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="saveGame(${g ? `'${g.id}'` : 'null'})">${icon('save')} Salvar</button>
    </div>
  `);
}

function saveGame(id) {
  const adversario = document.getElementById('gf-adversario').value.trim();
  const data = document.getElementById('gf-data').value;
  if (!adversario || !data) { showToast('Preencha adversário e data.', 'error'); return; }

  const payload = {
    adversario,
    campeonato: document.getElementById('gf-campeonato').value,
    tipo: document.getElementById('gf-tipo').value,
    local: document.getElementById('gf-local').value,
    status: document.getElementById('gf-status').value,
    campo: document.getElementById('gf-campo').value,
    cidade: document.getElementById('gf-cidade').value,
    data,
    horario: document.getElementById('gf-horario').value,
    arbitro: document.getElementById('gf-arbitro').value,
    obs: document.getElementById('gf-obs').value
  };

  if (id) {
    Object.assign(getGame(id), payload);
    showToast('Jogo atualizado com sucesso!');
  } else {
    const novo = {
      id: uid('jogo'),
      ...payload,
      placarCasa: null, placarFora: null,
      gols: [], cartoes: [], mvpId: null, notas: {},
      convocados: DB.data.players.map(p => p.id),
      escalacao: { formacao: '4-4-2', titulares: [], reservas: DB.data.players.map(p => p.id) }
    };
    DB.data.games.push(novo);
    addNotification(`Novo jogo cadastrado: vs ${adversario} em ${formatDate(data)}.`);
    showToast('Jogo cadastrado com sucesso!');
  }
  DB.save();
  closeModal();
  Router.render();
  updateNotifBadge();
}

function deleteGame(id) {
  const g = getGame(id);
  if (!confirm(`Excluir o jogo contra "${g.adversario}"?`)) return;
  DB.data.games = DB.data.games.filter(gm => gm.id !== id);
  DB.save();
  showToast('Jogo removido.');
  Router.render();
}

/* ================= JOGO - POS JOGO (Resultado) ================= */

function openGamePostMatchModal(id) {
  const g = getGame(id);
  const convocados = (g.convocados || []).map(pid => getPlayer(pid)).filter(Boolean);

  openModal(`
    <div class="modal-header">
      <h3>Resultado: vs ${g.adversario}</h3>
      <button class="icon-btn" onclick="closeModal()">${icon('close')}</button>
    </div>
    <div class="modal-body">
      <div class="field-row">
        <div class="field"><label>Placar Clube da Cana</label><input type="number" id="pm-casa" min="0" value="${g.local === 'Casa' ? (g.placarCasa ?? '') : (g.placarFora ?? '')}"></div>
        <div class="field"><label>Placar ${g.adversario}</label><input type="number" id="pm-fora" min="0" value="${g.local === 'Casa' ? (g.placarFora ?? '') : (g.placarCasa ?? '')}"></div>
      </div>
      <div class="field"><label>MVP da Partida</label>
        <select id="pm-mvp"><option value="">-</option>${convocados.map(p => `<option value="${p.id}" ${g.mvpId === p.id ? 'selected' : ''}>${p.nome}</option>`).join('')}</select>
      </div>
      <h4 style="color:var(--gold);margin:18px 0 8px;">Gols e Assistências</h4>
      <div id="pm-gols-list">
        ${(g.gols || []).map((gol, i) => renderGolRow(gol, i, convocados)).join('')}
      </div>
      <button type="button" class="btn btn-sm btn-ghost" onclick="addGolRow('${g.id}')">${icon('plus')} Adicionar Gol</button>

      <h4 style="color:var(--gold);margin:18px 0 8px;">Cartões</h4>
      <div id="pm-cartoes-list">
        ${(g.cartoes || []).map((c, i) => renderCartaoRow(c, i, convocados)).join('')}
      </div>
      <button type="button" class="btn btn-sm btn-ghost" onclick="addCartaoRow('${g.id}')">${icon('plus')} Adicionar Cartão</button>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="savePostMatch('${g.id}')">${icon('save')} Salvar Resultado</button>
    </div>
  `, true);
}

function renderGolRow(gol, i, convocados) {
  return `
    <div class="field-row-3 pm-gol-row" data-idx="${i}" style="align-items:end;">
      <div class="field"><label>Autor do Gol</label>
        <select class="pm-gol-jogador">${convocados.map(p => `<option value="${p.id}" ${gol.jogadorId === p.id ? 'selected' : ''}>${p.nome}</option>`).join('')}</select>
      </div>
      <div class="field"><label>Assistência</label>
        <select class="pm-gol-assist"><option value="">-</option>${convocados.map(p => `<option value="${p.id}" ${gol.assistenciaId === p.id ? 'selected' : ''}>${p.nome}</option>`).join('')}</select>
      </div>
      <div class="field"><label>Minuto</label><input type="number" class="pm-gol-minuto" value="${gol.minuto || ''}" min="0" max="120"></div>
    </div>
  `;
}

function addGolRow(gameId) {
  const g = getGame(gameId);
  const convocados = (g.convocados || []).map(pid => getPlayer(pid)).filter(Boolean);
  const container = document.getElementById('pm-gols-list');
  const div = document.createElement('div');
  div.innerHTML = renderGolRow({}, container.children.length, convocados);
  container.appendChild(div.firstElementChild);
}

function renderCartaoRow(c, i, convocados) {
  return `
    <div class="field-row-3 pm-cartao-row" data-idx="${i}" style="align-items:end;">
      <div class="field"><label>Jogador</label>
        <select class="pm-cartao-jogador">${convocados.map(p => `<option value="${p.id}" ${c.jogadorId === p.id ? 'selected' : ''}>${p.nome}</option>`).join('')}</select>
      </div>
      <div class="field"><label>Tipo</label>
        <select class="pm-cartao-tipo"><option ${c.tipo === 'Amarelo' ? 'selected' : ''}>Amarelo</option><option ${c.tipo === 'Vermelho' ? 'selected' : ''}>Vermelho</option></select>
      </div>
      <div class="field"><label>Minuto</label><input type="number" class="pm-cartao-minuto" value="${c.minuto || ''}" min="0" max="120"></div>
    </div>
  `;
}

function addCartaoRow(gameId) {
  const g = getGame(gameId);
  const convocados = (g.convocados || []).map(pid => getPlayer(pid)).filter(Boolean);
  const container = document.getElementById('pm-cartoes-list');
  const div = document.createElement('div');
  div.innerHTML = renderCartaoRow({}, container.children.length, convocados);
  container.appendChild(div.firstElementChild);
}

function savePostMatch(id) {
  const g = getGame(id);
  const placarPropria = parseInt(document.getElementById('pm-casa').value) || 0;
  const placarAdv = parseInt(document.getElementById('pm-fora').value) || 0;

  g.placarCasa = g.local === 'Casa' ? placarPropria : placarAdv;
  g.placarFora = g.local === 'Casa' ? placarAdv : placarPropria;
  g.mvpId = document.getElementById('pm-mvp').value || null;
  g.status = 'Realizado';

  g.gols = Array.from(document.querySelectorAll('#pm-gols-list .pm-gol-row')).map(row => ({
    jogadorId: row.querySelector('.pm-gol-jogador').value,
    assistenciaId: row.querySelector('.pm-gol-assist').value || null,
    minuto: parseInt(row.querySelector('.pm-gol-minuto').value) || 0
  }));

  g.cartoes = Array.from(document.querySelectorAll('#pm-cartoes-list .pm-cartao-row')).map(row => ({
    jogadorId: row.querySelector('.pm-cartao-jogador').value,
    tipo: row.querySelector('.pm-cartao-tipo').value,
    minuto: parseInt(row.querySelector('.pm-cartao-minuto').value) || 0
  }));

  DB.save();
  addNotification(`Resultado lançado: ${g.adversario} - placar ${g.placarCasa} x ${g.placarFora}.`);
  showToast('Resultado salvo com sucesso!');
  closeModal();
  Router.render();
  updateNotifBadge();
}

/* ================= JOGO - DETALHE (visualização) ================= */

function openGameDetailModal(id) {
  const g = getGame(id);
  const golsHtml = (g.gols || []).map(gl => {
    const autor = getPlayer(gl.jogadorId);
    const assist = gl.assistenciaId ? getPlayer(gl.assistenciaId) : null;
    return `<li>${icon('target')} ${autor ? autor.nome : '-'} (${gl.minuto}') ${assist ? `— assist. ${assist.nome}` : ''}</li>`;
  }).join('') || '<li style="color:var(--text-dim)">Nenhum gol registrado.</li>';

  const cartoesHtml = (g.cartoes || []).map(c => {
    const j = getPlayer(c.jogadorId);
    return `<li>${icon('card')} ${j ? j.nome : '-'} — Cartão ${c.tipo} (${c.minuto}')</li>`;
  }).join('') || '<li style="color:var(--text-dim)">Nenhum cartão registrado.</li>';

  const mvp = g.mvpId ? getPlayer(g.mvpId) : null;

  openModal(`
    <div class="modal-header">
      <h3>${g.adversario} — ${formatDate(g.data)}</h3>
      <button class="icon-btn" onclick="closeModal()">${icon('close')}</button>
    </div>
    <div class="modal-body">
      <div style="text-align:center;font-family:var(--font-display);font-size:2rem;color:var(--gold);margin-bottom:16px;">
        ${g.placarCasa ?? '-'} : ${g.placarFora ?? '-'}
      </div>
      <div class="grid grid-cols-2" style="margin-bottom:16px;">
        <div><strong>Campeonato:</strong> ${g.campeonato}</div>
        <div><strong>Tipo:</strong> ${g.tipo}</div>
        <div><strong>Local:</strong> ${g.local} (${g.campo}, ${g.cidade})</div>
        <div><strong>Árbitro:</strong> ${g.arbitro || '-'}</div>
      </div>
      ${mvp ? `<p><strong>${icon('star')} MVP:</strong> ${mvp.nome}</p>` : ''}
      <h4 style="color:var(--gold);margin-top:16px;">Gols</h4>
      <ul style="padding-left:18px;">${golsHtml}</ul>
      <h4 style="color:var(--gold);margin-top:16px;">Cartões</h4>
      <ul style="padding-left:18px;">${cartoesHtml}</ul>
      ${g.obs ? `<p style="margin-top:14px;color:var(--text-dim);"><strong>Obs:</strong> ${g.obs}</p>` : ''}
    </div>
    <div class="modal-footer"><button class="btn btn-ghost" onclick="closeModal()">Fechar</button></div>
  `, true);
}

/* ================= RELACIONADOS ================= */

function toggleConvocado(gameId, playerId, checked) {
  const g = getGame(gameId);
  g.convocados = g.convocados || [];
  if (checked && !g.convocados.includes(playerId)) g.convocados.push(playerId);
  if (!checked) g.convocados = g.convocados.filter(id => id !== playerId);
  DB.save();
  const area = document.getElementById('convocation-card-area');
  if (area) area.innerHTML = `<h3 class="section-title">${icon('shield')} Prévia do Card</h3>` + renderConvocationCard(g);
}

function generateConvocationCard(gameId) {
  showToast('Card de convocação gerado! Veja a prévia ao lado.', 'info');
  const g = getGame(gameId);
  const area = document.getElementById('convocation-card-area');
  if (area) area.innerHTML = `<h3 class="section-title">${icon('shield')} Prévia do Card</h3>` + renderConvocationCard(g);
}

/* ================= ESCALACAO - Drag & Drop ================= */

let draggedPlayerId = null;

function onBenchDragStart(e, playerId) {
  draggedPlayerId = playerId;
  e.dataTransfer.effectAllowed = 'move';
  e.target.classList.add('dragging');
}

function onSlotDrop(e, slotIdx) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  if (!draggedPlayerId || !Auth.isAdmin()) return;

  const state = Router.state.escalacao || {};
  const gameId = state.jogoId || DB.data.games[0]?.id;
  const g = getGame(gameId);
  if (!g.escalacao) g.escalacao = { formacao: '4-4-2', titulares: [], reservas: [] };

  g.escalacao.titulares = g.escalacao.titulares.filter(t => t.slot !== slotIdx && t.jogadorId !== draggedPlayerId);
  g.escalacao.titulares.push({ jogadorId: draggedPlayerId, slot: slotIdx });

  DB.save();
  draggedPlayerId = null;
  Router.render();
}

function setFormation(gameId, formacao) {
  const g = getGame(gameId);
  if (!g.escalacao) g.escalacao = { formacao, titulares: [], reservas: [] };
  else g.escalacao.formacao = formacao;
  g.escalacao.titulares = [];
  DB.save();
  Router.updateState('escalacao', { formacao, jogoId: gameId });
}

/* ================= FINANCEIRO ================= */

function toggleMensalidade(id) {
  const m = DB.data.financeiro.mensalidades.find(m => m.id === id);
  m.pago = !m.pago;
  DB.save();
  Router.render();
}

function openSponsorFinanceModal() {
  openModal(`
    <div class="modal-header"><h3>Novo Patrocínio</h3><button class="icon-btn" onclick="closeModal()">${icon('close')}</button></div>
    <div class="modal-body">
      <div class="field"><label>Nome do Patrocinador</label><input type="text" id="sf-nome"></div>
      <div class="field-row">
        <div class="field"><label>Valor (R$)</label><input type="number" id="sf-valor" min="0" step="0.01"></div>
        <div class="field"><label>Data</label><input type="date" id="sf-data" value="${new Date().toISOString().slice(0,10)}"></div>
      </div>
      <div class="field"><label>Observação</label><input type="text" id="sf-obs"></div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="saveSponsorFinance()">${icon('save')} Salvar</button>
    </div>
  `);
}

function saveSponsorFinance() {
  const nome = document.getElementById('sf-nome').value.trim();
  const valor = parseFloat(document.getElementById('sf-valor').value) || 0;
  if (!nome || !valor) { showToast('Preencha nome e valor.', 'error'); return; }
  DB.data.financeiro.patrocinios.push({
    id: uid('patr'), nome, valor,
    data: document.getElementById('sf-data').value,
    obs: document.getElementById('sf-obs').value
  });
  DB.save();
  showToast('Patrocínio adicionado!');
  closeModal();
  Router.render();
}

function openExpenseModal() {
  openModal(`
    <div class="modal-header"><h3>Nova Despesa</h3><button class="icon-btn" onclick="closeModal()">${icon('close')}</button></div>
    <div class="modal-body">
      <div class="field"><label>Descrição</label><input type="text" id="ex-desc"></div>
      <div class="field-row">
        <div class="field"><label>Categoria</label><input type="text" id="ex-cat" placeholder="Ex: Material, Transporte..."></div>
        <div class="field"><label>Valor (R$)</label><input type="number" id="ex-valor" min="0" step="0.01"></div>
      </div>
      <div class="field"><label>Data</label><input type="date" id="ex-data" value="${new Date().toISOString().slice(0,10)}"></div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="saveExpense()">${icon('save')} Salvar</button>
    </div>
  `);
}

function saveExpense() {
  const descricao = document.getElementById('ex-desc').value.trim();
  const valor = parseFloat(document.getElementById('ex-valor').value) || 0;
  if (!descricao || !valor) { showToast('Preencha descrição e valor.', 'error'); return; }
  DB.data.financeiro.despesas.push({
    id: uid('desp'), descricao,
    categoria: document.getElementById('ex-cat').value || 'Outros',
    valor,
    data: document.getElementById('ex-data').value
  });
  DB.save();
  showToast('Despesa adicionada!');
  closeModal();
  Router.render();
}

function deleteFinanceItem(tipo, id) {
  if (!confirm('Excluir este registro?')) return;
  DB.data.financeiro[tipo] = DB.data.financeiro[tipo].filter(item => item.id !== id);
  DB.save();
  showToast('Registro removido.');
  Router.render();
}

/* ================= CONFIGURACOES ================= */

function saveConfigPasswords() {
  const admin = document.getElementById('cfg-senha-admin').value;
  const jogador = document.getElementById('cfg-senha-jogador').value;
  if (admin) DB.data.config.senhaAdmin = admin;
  if (jogador) DB.data.config.senhaJogador = jogador;
  DB.save();
  showToast('Senhas atualizadas com sucesso!');
  document.getElementById('cfg-senha-admin').value = '';
  document.getElementById('cfg-senha-jogador').value = '';
}

function saveConfigColors() {
  const primaria = document.getElementById('cfg-cor-primaria').value;
  const dourada = document.getElementById('cfg-cor-dourada').value;
  DB.data.config.corPrimaria = primaria;
  DB.data.config.corDourada = dourada;
  DB.save();
  applyThemeColors();
  showToast('Cores aplicadas com sucesso!');
}

function applyThemeColors() {
  const cfg = DB.data.config;
  document.documentElement.style.setProperty('--green', cfg.corPrimaria);
  document.documentElement.style.setProperty('--gold', cfg.corDourada);
}

function addSponsor() {
  const input = document.getElementById('new-sponsor-name');
  const nome = input.value.trim();
  if (!nome) return;
  DB.data.config.patrocinadores.push({ id: uid('sp'), nome });
  DB.save();
  showToast('Patrocinador adicionado!');
  Router.render();
}

function removeSponsor(id) {
  DB.data.config.patrocinadores = DB.data.config.patrocinadores.filter(s => s.id !== id);
  DB.save();
  Router.render();
}

function resetAllData() {
  if (!confirm('Tem certeza? Todos os dados atuais serão substituídos pelos dados de exemplo.')) return;
  DB.reset();
  showToast('Dados restaurados com sucesso!');
  Router.render();
}
