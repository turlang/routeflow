import { test } from 'node:test';
import assert from 'node:assert/strict';
import { environment, response, session } from './helpers.mjs';
import * as api from '../src/api.js';
import { readData } from '../src/storage.js';
import { beginRoute, markRouteProgress, finishRoute, activeRoute, clearActiveRoute } from '../src/route-session.js';
import { flushRouteQueue } from '../src/route-sync.js';
const input = { sourceFilename: 'offline.xlsx', plannedKm: 1, plannedMinutes: 3, stops: 2, deliveries: 2, operational: {} };
function setup() { environment(); api.saveSession(session('A')); globalThis.fetch = async () => { throw Error('offline'); }; }

test('offline route survives clearing active route and syncs final state after reconnect', async () => {
  setup(); const route = await beginRoute(input); await markRouteProgress(2); await finishRoute(); clearActiveRoute();
  const calls = []; globalThis.fetch = async (url, options) => { const body = JSON.parse(options.body); calls.push(body); return response({ ...body, id: 'remote' }); };
  await flushRouteQueue({ force: true });
  assert.equal(calls[0].clientId, route.clientId); assert.equal(calls[0].status, 'COMPLETED');
  assert.equal(calls[0].completedStops, 2); assert.ok(calls[0].finishedAt);
  assert.deepEqual(readData('routeOutbox', {}), {});
});

test('lost create response retries same clientId without duplication', async () => {
  setup(); const route = await beginRoute(input); const remote = new Map(); let lose = true;
  globalThis.fetch = async (url, options) => { const body = JSON.parse(options.body); remote.set(body.clientId, { ...body, id: 'remote' }); if (lose) { lose = false; throw Error('lost response'); } return response(remote.get(body.clientId)); };
  await flushRouteQueue({ force: true }); await flushRouteQueue({ force: true });
  assert.equal(remote.size, 1); assert.equal(activeRoute().serverId, 'remote'); assert.equal(remote.has(route.clientId), true);
});

test('A pending route never uses B token', async () => {
  setup(); await beginRoute(input); api.clearSession(); api.saveSession(session('B'));
  let count = 0; globalThis.fetch = async () => { count++; return response({}); };
  await flushRouteQueue({ force: true }); assert.equal(count, 0);
  api.clearSession(); api.saveSession(session('A')); assert.equal(Object.keys(readData('routeOutbox', {})).length, 1);
});

test('new progress during an inflight request remains queued and concurrent flushes serialize', async () => {
  setup(); const route = await beginRoute(input); let resolve, calls = 0, started;
  const sent = new Promise(r => { started = r; });
  globalThis.fetch = (url, options) => { calls++; const body = JSON.parse(options.body); if (calls === 1) return new Promise(r => { resolve = () => r(response({ ...body, id: 'remote' })); started(); }); return Promise.resolve(response({ ...body, clientId: route.clientId, id: 'remote' })); };
  const pending = flushRouteQueue({ force: true });
  await sent; await markRouteProgress(1);
  const another = flushRouteQueue({ force: true }); resolve(); await Promise.all([pending, another]);
  await flushRouteQueue({ force: true });
  assert.equal(activeRoute().completedStops, 1); assert.equal(activeRoute().serverId, 'remote');
  assert.deepEqual(readData('routeOutbox', {}), {}); assert.ok(calls >= 2);
});

test('validation error remains visible and is not retried forever', async () => {
  setup(); await beginRoute(input); let count = 0;
  globalThis.fetch = async () => { count++; return response({ error: 'invalid' }, 400); };
  await flushRouteQueue({ force: true }); await flushRouteQueue({ force: true });
  assert.equal(count, 1); assert.equal(Object.values(readData('routeOutbox', {}))[0].blocked, true);
});

test('pending queue survives module reload and server errors', async () => {
  setup();const route=await beginRoute(input);
  globalThis.fetch=async()=>response({error:'unavailable'},500);
  await flushRouteQueue({force:true});assert.equal(Object.values(readData('routeOutbox',{}))[0].blocked,false);
  const reloaded=await import(`../src/route-sync.js?reload=${Date.now()}`);
  globalThis.fetch=async(url,options)=>response({...JSON.parse(options.body),id:'remote'});
  await reloaded.flushRouteQueue({force:true});assert.equal(activeRoute().clientId,route.clientId);assert.equal(activeRoute().serverId,'remote');
});

test('401 leaves pending data in A scope and resumes only after A signs in', async () => {
  setup();await beginRoute(input);globalThis.fetch=async()=>response({error:'expired'},401);
  await flushRouteQueue({force:true});assert.equal(api.hasSession(),false);
  api.saveSession(session('A'));assert.equal(Object.keys(readData('routeOutbox',{})).length,1);
  globalThis.fetch=async(url,options)=>response({...JSON.parse(options.body),id:'remote'});
  await flushRouteQueue({force:true});assert.deepEqual(readData('routeOutbox',{}),{});
});

test('cloud pull cannot overwrite a local pending route', async () => {
  setup();await beginRoute(input);await markRouteProgress(1);
  let getRequests=0;globalThis.fetch=async(url,options)=>{if(options.method==='GET')getRequests++;throw Error('offline')};
  const {syncActiveRoute}=await import('../src/route-session.js');const route=await syncActiveRoute();
  assert.equal(route.completedStops,1);assert.equal(getRequests,0);
});

test('online event automatically flushes pending route after reconnection', async () => {
  setup();const route=await beginRoute(input);
  const {initRouteSync}=await import('../src/route-sync.js');initRouteSync();await flushRouteQueue();
  globalThis.fetch=async(url,options)=>response({...JSON.parse(options.body),id:'remote'});
  window.dispatchEvent(new Event('online'));await flushRouteQueue({force:true});
  assert.equal(activeRoute().clientId,route.clientId);assert.equal(activeRoute().serverId,'remote');
});

test('lost ACTIVE creation followed by offline completion replays POST then PATCH with same identity', async () => {
  setup();const route=await beginRoute(input);let saved,lose=true,posts=0,patches=0;
  globalThis.fetch=async(url,options)=>{
    const body=JSON.parse(options.body);
    if(options.method==='POST'){posts++;saved??={...body,id:'remote'};if(lose){lose=false;throw Error('response lost')}}
    else{patches++;saved={...saved,...body}}
    return response(saved);
  };
  await flushRouteQueue({force:true});await markRouteProgress(2);await finishRoute();
  await flushRouteQueue({force:true});assert.equal(Object.keys(readData('routeOutbox',{})).length,1);
  assert.equal(activeRoute().status,'COMPLETED');
  await flushRouteQueue({force:true});assert.equal(saved.clientId,route.clientId);assert.equal(saved.status,'COMPLETED');
  assert.equal(saved.completedStops,2);assert.equal(posts,2);assert.equal(patches,1);assert.deepEqual(readData('routeOutbox',{}),{});
});
