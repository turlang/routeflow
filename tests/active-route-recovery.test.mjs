import {test} from 'node:test';
import assert from 'node:assert/strict';
import {environment,response,session} from './helpers.mjs';
import {saveSession} from '../src/api.js';
import {readData,writeData} from '../src/storage.js';
import {activeRoute,syncActiveRoute,resumableRoute,markRouteProgress,beginRoute} from '../src/route-session.js';
import {enqueueRoute} from '../src/route-sync.js';

const saved={clientId:'old-route',serverId:'server-route',status:'ACTIVE',stops:3,completedStops:1,operational:{stops:[{address:'Synthetic'}],order:[0]}};
function setup(){environment();saveSession(session('A'));writeData('activeRoute',saved);writeData('routeHistory',[saved]);}

test('confirmed null clears obsolete active route without deleting history or other pending routes',async()=>{
  setup();enqueueRoute({...saved,clientId:'other-pending'});
  let cleared;window.addEventListener('routeflow:active-route-cleared',event=>{cleared=event.detail.clientId;});
  globalThis.fetch=async(url,options)=>options.method==='GET'?response(null):response({error:'unavailable'},503);
  assert.equal(await syncActiveRoute(),null);assert.equal(activeRoute(),null);assert.equal(resumableRoute(),null);
  assert.equal(cleared,saved.clientId);assert.deepEqual(readData('routeHistory',[]),[saved]);
  assert.ok(readData('routeOutbox',{})['other-pending']);
});

for(const [name,fetcher] of [
  ['network failure',async()=>{throw Error('offline');}],
  ['HTTP failure',async()=>response({error:'unavailable'},503)],
  ['invalid JSON',async()=>({ok:true,status:200,json:async()=>{throw SyntaxError('invalid');}})],
  ['invalid route response',async()=>response({})],
])test(`${name} preserves cached route instead of confirming absence`,async()=>{
  setup();globalThis.fetch=fetcher;assert.deepEqual(await syncActiveRoute(),saved);assert.deepEqual(activeRoute(),saved);
});

test('failed flush preserves active offline edits and does not query cloud absence',async()=>{
  setup();await markRouteProgress(2,{offline:'snapshot'});
  let gets=0;globalThis.fetch=async(url,options)=>{if(options.method==='GET'){gets++;return response(null);}throw Error('offline');};
  assert.equal((await syncActiveRoute()).completedStops,2);assert.equal(gets,0);
  assert.deepEqual(readData('routeOutbox',{})[saved.clientId].route.operational,{offline:'snapshot'});
});

test('offline edits made during GET survive a confirmed empty response',async()=>{
  setup();let release,started;const sent=new Promise(resolve=>{started=resolve;});
  globalThis.fetch=()=>new Promise(resolve=>{release=resolve;started();});
  const pending=syncActiveRoute();await sent;
  await markRouteProgress(2,{offline:'new snapshot'});release(response(null));
  assert.equal((await pending).completedStops,2);assert.equal(activeRoute().status,'ACTIVE');
  assert.deepEqual(readData('routeOutbox',{})[saved.clientId].route.operational,{offline:'new snapshot'});
});

test('a new local route created during GET cannot be erased by its old response',async()=>{
  setup();let release,started;const sent=new Promise(resolve=>{started=resolve;});
  globalThis.fetch=(url,options)=>options.method==='GET'?new Promise(resolve=>{release=resolve;started();}):Promise.reject(Error('offline'));
  const pending=syncActiveRoute();await sent;
  const newer=await beginRoute({stops:2,operational:{new:'route'}});release(response(null));
  assert.equal((await pending).clientId,newer.clientId);assert.equal(activeRoute().clientId,newer.clientId);
  assert.ok(readData('routeOutbox',{})[newer.clientId]);
});

test('late absence from A cannot clear B route',async()=>{
  setup();let release,started;const sent=new Promise(resolve=>{started=resolve;});
  globalThis.fetch=()=>new Promise(resolve=>{release=resolve;started();});
  const pending=syncActiveRoute();await sent;
  saveSession(session('B'));const b={...saved,clientId:'B-route'};writeData('activeRoute',b);
  release(response(null));await assert.rejects(pending,/sessão|session/i);assert.deepEqual(activeRoute(),b);
});

for(const status of ['COMPLETED','CANCELLED'])test(`confirmed ${status} stops resume but preserves conflicting offline snapshot`,async()=>{
  setup();await markRouteProgress(2,{offline:'pending snapshot'});
  globalThis.fetch=async()=>response({id:saved.serverId,clientId:saved.clientId,status,completedStops:3,finishedAt:'2026-10-01T16:00:00Z'});
  assert.equal((await syncActiveRoute()).status,status);assert.equal(resumableRoute(),null);
  const pending=readData('routeOutbox',{})[saved.clientId];assert.equal(pending.blocked,true);
  assert.equal(pending.route.status,'ACTIVE');assert.equal(pending.route.completedStops,2);
  assert.deepEqual(pending.route.operational,{offline:'pending snapshot'});
});
