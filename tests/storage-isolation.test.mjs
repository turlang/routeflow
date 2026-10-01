import { test } from 'node:test';
import assert from 'node:assert/strict';
import { environment, response, session } from './helpers.mjs';
import * as api from '../src/api.js';
import { readData, writeData, captureScope, isCurrentScope } from '../src/storage.js';
import { pushLocalHistory, pullDeliveryHistory } from '../src/history-sync.js';

test('A -> logout -> B isolates every data resource and outgoing history', async () => {
  environment(); api.saveSession(session('A'));
  const resources = ['addressRegistry', 'addressSync', 'deliveryHistory', 'routeHistory', 'activeRoute', 'routeOutbox'];
  for (const resource of resources) writeData(resource, { owner: 'A' });
  writeData('deliveryHistory', [{ id: 'A-delivery', timestamp: '2026-09-30T12:00:00.000Z', address: 'A address' }]);
  api.clearSession();
  for (const resource of resources) assert.equal(readData(resource, null), null);
  api.saveSession(session('B'));
  for (const resource of resources) assert.equal(readData(resource, null), null);
  let requests = 0; globalThis.fetch = async () => { requests++; return response({}); };
  await pushLocalHistory(); assert.equal(requests, 0);
  api.clearSession(); api.saveSession(session('A'));
  assert.equal(readData('activeRoute', null).owner, 'A');
  assert.equal(readData('deliveryHistory', [])[0].id, 'A-delivery');
});

test('same user on another API and guest data have separate scopes', () => {
  environment(); writeData('routeHistory', ['guest']);
  api.saveSession(session('A')); writeData('routeHistory', ['A']);
  api.setApiBase('https://other.example/api/'); api.saveSession(session('A'));
  assert.deepEqual(readData('routeHistory', []), []);
  api.clearSession(); assert.deepEqual(readData('routeHistory', []), []);
});

test('late response from A cannot write into B or clear B session', async () => {
  environment(); api.saveSession(session('A'));
  let resolve; globalThis.fetch = () => new Promise(r => { resolve = r; });
  const pending = pullDeliveryHistory();
  api.clearSession(); api.saveSession(session('B'));
  resolve(response([{ id: 'A', deliveredAt: '2026-09-30T12:00:00.000Z' }]));
  await assert.rejects(pending, /sessão|session/i);
  assert.deepEqual(readData('deliveryHistory', []), []);
  globalThis.fetch = () => new Promise(r => { resolve = r; });
  const unauthorized = api.me(); api.clearSession(); api.saveSession(session('C'));
  resolve(response({ error: 'expired' }, 401)); await assert.rejects(unauthorized);
  assert.equal(api.authUser().id, 'C');
});

test('cross-tab session change invalidates captured scope', () => {
  environment(); api.saveSession(session('A')); const scope = captureScope();
  localStorage.setItem('routeflow.session.v2', JSON.stringify({ ...session('B'), apiBase: api.apiBase(), sessionId: 'other-tab' }));
  window.dispatchEvent(new Event('storage'));
  assert.equal(isCurrentScope(scope), false);
  assert.equal(api.authUser().id, 'B');
});
