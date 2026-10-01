import { migrateLegacy } from './legacy-migration.js';
export const SESSION_KEY = 'routeflow.session.v2';
const CONFIG_KEY = 'routeflow.apiBaseUrl.v1';
let generation = 0;
let listeningWindow;

export function normalizeApi(value) {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw Error('URL da API inválida.');
  return url.href.replace(/\/+$/, '');
}
export function configuredApi() {
  const saved = localStorage.getItem(CONFIG_KEY);
  return saved ? normalizeApi(saved) : ['localhost', '127.0.0.1'].includes(window.location.hostname) ? 'http://localhost:3001' : 'https://routeflow-api-tz5q.onrender.com';
}
export function currentSession() {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    return session?.user?.id && session.token && session.sessionId && session.apiBase === configuredApi() ? session : null;
  } catch { return null; }
}
function changed() {
  generation++;
  window.dispatchEvent(new CustomEvent('routeflow:session-changed'));
}
export function initStorage() {
  if (listeningWindow !== window) {
    listeningWindow = window;
    window.addEventListener('storage', event => {
      if (!event.key || [SESSION_KEY, CONFIG_KEY].includes(event.key)) changed();
    });
  }
  return migrateLegacy();
}
export function setSession({ token, user }) {
  initStorage();
  if (!token || !user?.id) throw Error('Sessão inválida.');
  const old = currentSession(), apiBase = configuredApi();
  const same = old?.user.id === user.id && old.apiBase === apiBase && old.token === token;
  localStorage.setItem(SESSION_KEY, JSON.stringify({ token, user, apiBase, sessionId: same ? old.sessionId : crypto.randomUUID() }));
  if (!same) changed();
}
export function endSession() { initStorage(); localStorage.removeItem(SESSION_KEY); changed(); }
export function configureApi(value) {
  const normalized = normalizeApi(value);
  if (normalized === configuredApi()) return;
  localStorage.removeItem(SESSION_KEY);
  localStorage.setItem(CONFIG_KEY, normalized);
  initStorage(); changed();
}
export function captureScope() {
  const session = currentSession(), apiBase = configuredApi();
  return { apiBase, userId: session?.user.id ?? null, token: session?.token ?? '', sessionId: session?.sessionId ?? 'guest', generation };
}
export function isCurrentScope(scope) {
  const current = captureScope();
  return ['apiBase', 'userId', 'token', 'sessionId', 'generation'].every(key => current[key] === scope[key]);
}
export function assertScope(scope) { if (!isCurrentScope(scope)) throw Error('A sess\u00e3o mudou; opera\u00e7\u00e3o descartada.'); }
export function scopeKey(resource, scope = captureScope()) {
  return `routeflow.v2:${encodeURIComponent(scope.apiBase)}:${scope.userId ? `user:${encodeURIComponent(scope.userId)}` : 'guest'}:${resource}`;
}
export function readData(resource, fallback, scope = captureScope()) {
  assertScope(scope);
  try { return JSON.parse(localStorage.getItem(scopeKey(resource, scope)) ?? JSON.stringify(fallback)); } catch { return fallback; }
}
export function writeData(resource, value, scope = captureScope()) {
  assertScope(scope); localStorage.setItem(scopeKey(resource, scope), JSON.stringify(value));
}
export function removeData(resource, scope = captureScope()) { assertScope(scope); localStorage.removeItem(scopeKey(resource, scope)); }
