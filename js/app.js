/* ============================================================
   Clube da Cana FC - app.js
   Bootstrap, roteamento e controle da UI principal
   ============================================================ */

const MENU_ADMIN = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'proximoJogo', label: 'Próximo Jogo', icon: 'ball' },
  { id: 'historico', label: 'Histórico', icon: 'history' },
  { id: 'jogadores', label: 'Jogadores', icon: 'players' },
  { id: 'estatisticas', label: 'Estatísticas', icon: 'stats' },
  { id: 'relacionados', label: 'Relacionados', icon: 'called' },
  { id: 'escalacao', label: 'Escalação', icon: 'lineup' },
  { id: 'estatisticasTime', label: 'Estatísticas do Time', icon: 'trophy' },
  { id: 'financeiro', label: 'Financeiro', icon: 'finance' },
  { id: 'configuracoes', label: 'Configurações', icon: 'settings' }
];

const MENU_JOGADOR = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'proximoJogo', label: 'Próximo Jogo', icon: 'ball' },
  { id: 'historico', label: 'Histórico', icon: 'history' },
  { id: 'perfilJogador', label: 'Elenco', icon: 'players' },
  { id: 'estatisticas', label: 'Estatísticas', icon: 'stats' },
  { id: 'estatisticasTime', label: 'Estatísticas do Time', icon: 'trophy' },
  { id: 'financeiro', label: 'Financeiro', icon: 'finance' }
];

const VIEW_TITLES = {
  dashboard: 'Dashboard',
  proximoJogo: 'Próximo Jogo',
  historico: 'Histórico de Jogos',
  jogadores: 'Jogadores',
  estatisticas: 'Estatísticas Individuais',
  relacionados: 'Relacionados / Convocação',
  escalacao: 'Escalação',
  estatisticasTime: 'Estatísticas do Time',
  financeiro: 'Financeiro',
  configuracoes: 'Configurações',
  perfilJogador: 'Elenco do Clube'
};

const Router = {
  currentView: 'dashboard',
  state: {},

  navigate(view, params) {
    this.currentView = view;
    this.state[view] = { ...(this.state[view] || {}), ...(params || {}) };
    this.render();
    this.syncActiveMenu();
    closeSidebarMobile();
  },

  updateState(view, partial) {
    this.state[view] = { ...(this.state[view] || {}), ...partial };
    this.render();
  },

  render() {
    const view = this.currentView;
    const fn = Views[view];
    const content = document.getElementById('view-content');
    if (!fn) { content.innerHTML = `<div class="card empty-state">View não encontrada.</div>`; return; }
    content.innerHTML = fn(this.state[view]);
    document.getElementById('page-title').textContent = VIEW_TITLES[view] || view;

    const afterFn = Views[view + 'AfterRender'];
    if (afterFn) setTimeout(() => afterFn(this.state[view]), 0);
  },

  syncActiveMenu() {
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.view === this.currentView);
    });
  }
};

/* ------------------------------------------------------------
   SIDEBAR / MENU
   ------------------------------------------------------------ */

function buildSidebarMenu() {
  const menu = Auth.isAdmin() ? MENU_ADMIN : MENU_JOGADOR;
  const nav = document.getElementById('sidebar-nav');
  nav.innerHTML = menu.map(item => `
    <a href="#" class="nav-item" data-view="${item.id}" onclick="event.preventDefault(); Router.navigate('${item.id}')">
      ${icon(item.icon)}
      <span>${item.label}</span>
    </a>
  `).join('');
}

function openSidebarMobile() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebar-overlay').classList.add('show');
}
function closeSidebarMobile() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('show');
}

/* ------------------------------------------------------------
   NOTIFICACOES
   ------------------------------------------------------------ */

function updateNotifBadge() {
  const naoLidas = DB.data.notifications.filter(n => !n.lida).length;
  const badge = document.getElementById('notif-badge');
  if (naoLidas > 0) {
    badge.textContent = naoLidas;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

function renderNotifDropdown() {
  const dropdown = document.getElementById('notif-dropdown');
  const list = DB.data.notifications.slice(0, 15);
  if (!list.length) {
    dropdown.innerHTML = `<div class="notif-empty">Nenhuma notificação.</div>`;
    return;
  }
  dropdown.innerHTML = list.map(n => `
    <div class="notif-item">
      ${n.texto}
      <span class="notif-time">${new Date(n.data).toLocaleString('pt-BR')}</span>
    </div>
  `).join('');
}

function toggleNotifDropdown() {
  const dropdown = document.getElementById('notif-dropdown');
  const willShow = dropdown.classList.contains('hidden');
  dropdown.classList.toggle('hidden');
  if (willShow) {
    renderNotifDropdown();
    DB.data.notifications.forEach(n => n.lida = true);
    DB.save();
    updateNotifBadge();
  }
}

/* ------------------------------------------------------------
   LOGIN FLOW
   ------------------------------------------------------------ */

let loginTipoAtual = null;

function showLoginForm(tipo) {
  loginTipoAtual = tipo;
  document.getElementById('login-select').classList.add('hidden');
  document.getElementById('login-form').classList.remove('hidden');
  document.getElementById('login-form-title').textContent = tipo === 'admin' ? 'Login do Administrador' : 'Login do Jogador';
  document.getElementById('login-user').value = tipo === 'admin' ? 'admin' : 'jogador';
  document.getElementById('login-pass').value = '';
  document.getElementById('login-error').classList.add('hidden');
  document.getElementById('login-pass').focus();
}

function backToLoginSelect() {
  document.getElementById('login-select').classList.remove('hidden');
  document.getElementById('login-form').classList.add('hidden');
}

function handleLoginSubmit(e) {
  e.preventDefault();
  const usuario = document.getElementById('login-user').value.trim();
  const senha = document.getElementById('login-pass').value;
  const ok = Auth.login(loginTipoAtual, usuario, senha);
  if (ok) {
    enterApp();
  } else {
    document.getElementById('login-error').classList.remove('hidden');
  }
}

function enterApp() {
  document.getElementById('screen-login').classList.remove('active');
  document.getElementById('screen-app').classList.add('active');

  buildSidebarMenu();
  document.getElementById('topbar-username').textContent = Auth.isAdmin() ? 'Administrador' : 'Jogador';
  document.getElementById('topbar-role').textContent = Auth.isAdmin() ? 'Administrador' : 'Somente Leitura';

  Router.navigate('dashboard');
  updateNotifBadge();
}

function doLogout() {
  Auth.logout();
  document.getElementById('screen-app').classList.remove('active');
  document.getElementById('screen-login').classList.add('active');
  document.getElementById('login-select').classList.remove('hidden');
  document.getElementById('login-form').classList.add('hidden');
}

/* ------------------------------------------------------------
   INIT
   ------------------------------------------------------------ */

function setupStaticIcons() {
  document.getElementById('btn-close-sidebar').innerHTML = icon('close');
  document.getElementById('btn-menu').innerHTML = icon('menu');
  document.getElementById('btn-notif').innerHTML = icon('bell');
  document.getElementById('btn-logout').innerHTML = icon('logout') + ' Sair';
  document.getElementById('btn-goto-admin').innerHTML = icon('shield') + ' Entrar como Administrador';
}

document.addEventListener('DOMContentLoaded', () => {
  DB.load();
  applyThemeColors();

  setupStaticIcons();

  document.getElementById('btn-goto-admin').addEventListener('click', () => showLoginForm('admin'));
  document.getElementById('btn-goto-player').addEventListener('click', () => showLoginForm('jogador'));
  document.getElementById('btn-login-back').addEventListener('click', backToLoginSelect);
  document.getElementById('login-form').addEventListener('submit', handleLoginSubmit);

  document.getElementById('btn-menu').addEventListener('click', openSidebarMobile);
  document.getElementById('btn-close-sidebar').addEventListener('click', closeSidebarMobile);
  document.getElementById('sidebar-overlay').addEventListener('click', closeSidebarMobile);

  document.getElementById('btn-logout').addEventListener('click', doLogout);
  document.getElementById('btn-notif').addEventListener('click', toggleNotifDropdown);

  document.addEventListener('click', (e) => {
    const notifWrap = document.querySelector('.notif-wrap');
    if (notifWrap && !notifWrap.contains(e.target)) {
      document.getElementById('notif-dropdown').classList.add('hidden');
    }
  });

  // Auto-login se já houver sessão ativa (recarregar página)
  const session = Auth.load();
  if (session) {
    enterApp();
  }
});
