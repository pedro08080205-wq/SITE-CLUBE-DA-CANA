/* ============================================================
   Clube da Cana FC - auth.js
   Autenticação simples via localStorage (sessão)
   ============================================================ */

const SESSION_KEY = 'cdcfc_session_v1';

const Auth = {
  current: null,

  load() {
    const raw = sessionStorage.getItem(SESSION_KEY);
    this.current = raw ? JSON.parse(raw) : null;
    return this.current;
  },

  login(tipo, usuario, senha) {
    const cfg = DB.data.config;
    if (tipo === 'admin') {
      if (usuario === 'admin' && senha === cfg.senhaAdmin) {
        this.current = { tipo: 'admin', usuario: 'admin' };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(this.current));
        return true;
      }
    } else if (tipo === 'jogador') {
      if (usuario === 'jogador' && senha === cfg.senhaJogador) {
        this.current = { tipo: 'jogador', usuario: 'jogador' };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(this.current));
        return true;
      }
    }
    return false;
  },

  logout() {
    this.current = null;
    sessionStorage.removeItem(SESSION_KEY);
  },

  isAdmin() {
    return this.current && this.current.tipo === 'admin';
  },

  isPlayer() {
    return this.current && this.current.tipo === 'jogador';
  },

  isLoggedIn() {
    return !!this.current;
  }
};
