import {api} from './api.js';
import {captureScope,isCurrentScope,assertScope,readData,writeData,scopeKey} from './storage.js';
const running = new Map();
let initializedWindow;
let retryTimer;
const notify = () => window.dispatchEvent(new CustomEvent('routeflow:route-sync-state'));

export function enqueueRoute(route, scope = captureScope()) {
  const queue = readData('routeOutbox', {}, scope);
  const old = queue[route.clientId];
  queue[route.clientId] = {
    route: structuredClone(route), userId: scope.userId, apiBase: scope.apiBase,
    revision: crypto.randomUUID(), attempts: old?.attempts || 0, nextAttemptAt: 0, blocked: false,
  };
  // Persist the outbox before updating display caches or attempting the network.
  writeData('routeOutbox', queue, scope);
  notify();
}

function cacheRoute(route, scope) {
  const active = readData('activeRoute', null, scope);
  if (active?.clientId === route.clientId) writeData('activeRoute', route, scope);
  const history = readData('routeHistory', [], scope);
  const index = history.findIndex(item => item.clientId === route.clientId);
  if (index >= 0) history[index] = route; else history.unshift(route);
  writeData('routeHistory', history.slice(0, 500), scope);
  window.dispatchEvent(new CustomEvent('routeflow:routes-synced'));
}
function createBody(route) {
  const {clientId,sourceFilename,status,startedAt,finishedAt,plannedKm,plannedMinutes,stops,deliveries,completedStops,operational} = route;
  return {clientId,sourceFilename,status,startedAt,finishedAt,plannedKm,plannedMinutes,stops,deliveriesCount:deliveries,completedStops,operational};
}
function patchBody(route) {
  return {status:route.status,finishedAt:route.finishedAt,completedStops:route.completedStops,operational:route.operational};
}
function scheduleRetry(scope) {
  if (!isCurrentScope(scope) || !scope.userId) return;
  clearTimeout(retryTimer);
  const pending = Object.values(readData('routeOutbox', {}, scope)).filter(item => !item.blocked);
  if (!pending.length) return;
  const next = Math.min(...pending.map(item => item.nextAttemptAt || Date.now()));
  retryTimer = setTimeout(() => { if (isCurrentScope(scope)) void flushRouteQueue().catch(notify); }, Math.max(1000, next - Date.now()));
  retryTimer.unref?.();
}
async function processQueue(scope, force, ownsLock = () => true) {
  assertScope(scope);
  for (const clientId of Object.keys(readData('routeOutbox', {}, scope))) {
    if (!isCurrentScope(scope) || !ownsLock()) return;
    const item = readData('routeOutbox', {}, scope)[clientId];
    if (!item || item.blocked || item.userId !== scope.userId || item.apiBase !== scope.apiBase || (!force && item.nextAttemptAt > Date.now())) continue;
    try {
      const route = item.route;
      const remote = await api(route.serverId ? `/v1/routes/${encodeURIComponent(route.serverId)}` : '/v1/routes', {
        method: route.serverId ? 'PATCH' : 'POST', body: route.serverId ? patchBody(route) : createBody(route), scope,
      });
      assertScope(scope); if (!ownsLock()) return;
      if (!remote?.id || remote.clientId !== clientId) throw Error('Resposta da sincronização de rota inválida.');
      const queue = readData('routeOutbox', {}, scope), latest = queue[clientId];
      if (!latest) continue;
      // Preserve edits made while awaiting this response.
      latest.route.serverId = remote.id;
      latest.route.updatedAt = remote.updatedAt;
      if (latest.revision === item.revision && remote.status === latest.route.status && Number(remote.completedStops) >= Number(latest.route.completedStops)) {
        cacheRoute({...latest.route,completedStops:Math.max(latest.route.completedStops,remote.completedStops)}, scope);
        delete queue[clientId];
      } else if (['COMPLETED','CANCELLED'].includes(remote.status) && remote.status !== latest.route.status) {
        latest.blocked = true;
        latest.error = 'A rota possui outro estado final no servidor. Revise a sincronização.';
        // Keep the offline snapshot in the blocked outbox for review, but stop
        // offering a route that the server has definitively ended for resume.
        cacheRoute({...latest.route,status:remote.status,finishedAt:remote.finishedAt,completedStops:remote.completedStops}, scope);
        window.dispatchEvent(new CustomEvent('routeflow:active-route-cleared',{detail:{clientId}}));
      } else {
        latest.nextAttemptAt = 0;
        cacheRoute(latest.route, scope);
      }
      writeData('routeOutbox', queue, scope);
    } catch (error) {
      if (!isCurrentScope(scope) || !ownsLock()) return;
      const queue = readData('routeOutbox', {}, scope), latest = queue[clientId];
      if (!latest) continue;
      // A newer edit is independent of a rejected earlier snapshot.
      if (latest.revision === item.revision) {
        latest.attempts++;
        latest.error = error.message;
        latest.blocked = error.status >= 400 && error.status < 500 && ![408,429].includes(error.status);
        latest.nextAttemptAt = Date.now() + Math.min(60000, 1000 * 2 ** Math.min(latest.attempts, 6));
        writeData('routeOutbox', queue, scope);
      }
    }
  }
  notify(); scheduleRetry(scope);
}

async function withLock(scope, work) {
  const name = scopeKey('routeSyncLock', scope);
  if (navigator.locks) return navigator.locks.request(name, {mode:'exclusive'}, () => {
    if (isCurrentScope(scope)) return work();
  });
  // Fallback lease for browsers without Web Locks. Server uniqueness remains authoritative.
  const owner = crypto.randomUUID();
  const getLease = () => { try { return JSON.parse(localStorage.getItem(name) || 'null'); } catch { return null; } };
  if (getLease()?.expiresAt > Date.now()) return;
  localStorage.setItem(name, JSON.stringify({owner,expiresAt:Date.now()+30000}));
  const ownsLock = () => getLease()?.owner === owner;
  const heartbeat = setInterval(() => { if (ownsLock()) localStorage.setItem(name, JSON.stringify({owner,expiresAt:Date.now()+30000})); }, 10000);
  heartbeat.unref?.();
  try {
    // Let concurrent contenders settle before issuing requests.
    await new Promise(resolve => setTimeout(resolve, 0));
    if (ownsLock() && isCurrentScope(scope)) await work(ownsLock);
  } finally { clearInterval(heartbeat); if (ownsLock()) localStorage.removeItem(name); }
}
export function flushRouteQueue({force=false} = {}) {
  const scope = captureScope();
  if (!scope.userId || !scope.token || !scope.apiBase) return Promise.resolve();
  const key = `${scopeKey('routeOutbox', scope)}:${scope.sessionId}:${scope.generation}`;
  if (running.has(key)) return running.get(key);
  const promise = withLock(scope, ownsLock => processQueue(scope, force, ownsLock)).finally(() => {running.delete(key);scheduleRetry(scope)});
  running.set(key, promise); return promise;
}
export function requestRouteSync() { if (initializedWindow === window) void flushRouteQueue({force:true}).catch(notify); }
export function initRouteSync() {
  if (initializedWindow === window) return;
  initializedWindow = window;
  window.addEventListener('online', requestRouteSync);
  window.addEventListener('routeflow:session-changed', () => { clearTimeout(retryTimer); requestRouteSync(); });
  requestRouteSync();
}
