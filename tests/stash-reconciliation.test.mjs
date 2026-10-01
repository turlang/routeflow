import {test} from 'node:test';
import assert from 'node:assert/strict';
import {environment,response,session} from './helpers.mjs';
import {saveSession,clearSession,apiBase} from '../src/api.js';
import {readData,writeData} from '../src/storage.js';
import {syncHistoryEntry,flushDeliveryOutbox,pullDeliveryHistory} from '../src/history-sync.js';

const proof={id:'proof-A',timestamp:'2026-10-01T12:00:00.000Z',address:'Synthetic A address',package:'N° Pacote: 42',status:'FAILED',failureReason:'Absent',recipientName:'Synthetic recipient',proofPhotoUrl:'test-photo',latitude:-23.55,longitude:-46.63};

test('offline proof keeps current main fields in the account-scoped delivery queue',async()=>{
  environment();saveSession(session('A'));navigator.onLine=false;
  await syncHistoryEntry(proof);
  clearSession();saveSession(session('B'));
  assert.deepEqual(readData('deliveryOutbox',[]),[]);
  saveSession(session('A'));navigator.onLine=true;
  let sent;
  globalThis.fetch=async(url,options)=>{sent=JSON.parse(options.body).deliveries[0];return response({created:1});};
  await flushDeliveryOutbox();
  for(const key of ['status','failureReason','recipientName','proofPhotoUrl','latitude','longitude'])assert.equal(sent[key],proof[key]);
  assert.equal(sent.packageNo,'42');assert.deepEqual(readData('deliveryOutbox',[]),[]);
});

test('late failed proof response cannot enqueue A proof in B account',async()=>{
  environment();saveSession(session('A'));navigator.onLine=true;
  let release;globalThis.fetch=()=>new Promise(resolve=>{release=resolve;});
  const pending=syncHistoryEntry(proof);
  clearSession();saveSession(session('B'));release(response({error:'unavailable'},503));
  await assert.rejects(pending,/sessão|session/i);
  assert.deepEqual(readData('deliveryOutbox',[]),[]);
});

test('delivery flush preserves entries queued while the request is in flight',async()=>{
  environment();saveSession(session('A'));navigator.onLine=true;
  writeData('deliveryOutbox',[proof]);
  let release;globalThis.fetch=()=>new Promise(resolve=>{release=resolve;});
  const pending=flushDeliveryOutbox();
  writeData('deliveryOutbox',[{...proof,id:'new-proof'},proof]);release(response({created:1}));
  await pending;assert.deepEqual(readData('deliveryOutbox',[]).map(x=>x.id),['new-proof']);
});

test('cloud history retains failed delivery proof and production API default',async()=>{
  environment();window.location.hostname='turlang.github.io';
  assert.equal(apiBase(),'https://routeflow-api-tz5q.onrender.com');
  saveSession(session('A'));
  globalThis.fetch=async()=>response([{...proof,id:'remote',clientId:proof.id,deliveredAt:proof.timestamp,address:{address:proof.address}}]);
  await pullDeliveryHistory();
  const [stored]=readData('deliveryHistory',[]);
  for(const key of ['status','failureReason','recipientName','proofPhotoUrl'])assert.equal(stored[key],proof[key]);
});
