import { test } from 'node:test';
import assert from 'node:assert/strict';
import { environment, response, session } from './helpers.mjs';
import { saveSession, clearSession } from '../src/api.js';
import { pushLocalHistory } from '../src/history-sync.js';
import { beginRoute, markRouteProgress, activeRoute } from '../src/route-session.js';

test('BUG-A: global legacy history must not be uploaded under account B', async () => {
  environment(); saveSession(session('A'));
  localStorage.setItem('routeflow.deliveryHistory.v1', JSON.stringify([{ id: 'from-A', timestamp: '2026-09-30T12:00:00.000Z', address: 'A address' }]));
  clearSession(); saveSession(session('B'));
  let requests = 0; globalThis.fetch = async () => { requests++; return response({}); };
  await pushLocalHistory(); assert.equal(requests, 0);
});

test('BUG-R: route created offline must acquire a serverId after reconnect', async () => {
  environment(); saveSession(session('A')); globalThis.fetch = async () => { throw Error('offline'); };
  await beginRoute({ stops: 2, deliveries: 2, operational: {} });
  globalThis.fetch = async (url, options) => response({ ...JSON.parse(options.body), id: 'remote' });
  await markRouteProgress(1);
  // Reconnection flush is explicit in the new implementation, absent in the original.
  try { const { flushRouteQueue } = await import('../src/route-sync.js'); await flushRouteQueue({ force: true }); } catch (error) { if (error.code !== 'ERR_MODULE_NOT_FOUND') throw error; }
  assert.equal(activeRoute().serverId, 'remote');
});
