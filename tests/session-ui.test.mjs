import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {environment,response,session} from './helpers.mjs';
import {saveSession,authUser} from '../src/api.js';
import {writeData,readData} from '../src/storage.js';

test('real UI session handlers clear A workspace, maps and GPS on logout before B', async () => {
  environment();window.scrollTo=()=>{};
  const nodes=new Map();
  class Element extends EventTarget {
    constructor(){super();this.hidden=false;this.disabled=false;this.value='';this.textContent='';this.style={};this.dataset={};this.children=[];this.classList={toggle(){},add(){},remove(){}};this._html=''}
    set innerHTML(value){this._html=value;for(const match of value.matchAll(/id="([^"]+)"/g))if(!nodes.has(match[1]))nodes.set(match[1],new Element())}
    get innerHTML(){return this._html}
    appendChild(node){this.children.push(node);return node}
    insertBefore(node){return this.appendChild(node)}
    replaceChildren(){this.children=[];this._html='';this.textContent=''}
    querySelectorAll(){return []}
    querySelector(selector){return selector.startsWith('#')?nodes.get(selector.slice(1))||null:null}
  }
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  const root=new Element();root.innerHTML=html;
  for(const id of ['navigator','workspace','accountPanel']){if(nodes.has(id))nodes.get(id).hidden=true}
  globalThis.document={getElementById:id=>nodes.get(id)||null,createElement:()=>new Element(),querySelector:()=>root,querySelectorAll:()=>[],body:new Element(),head:new Element(),addEventListener(){}};
  globalThis.MutationObserver=class{observe(){}};
  const layers=[];
  const layer=()=>{const value={removed:false,remove(){this.removed=true},setView(){return this},addTo(){return this},bindTooltip(){return this},fitBounds(){return this},invalidateSize(){},getBounds(){return{pad(){return this}}}};layers.push(value);return value};
  globalThis.L={map:layer,tileLayer:layer,marker:layer,circleMarker:layer,geoJSON:layer,divIcon:value=>value,latLngBounds:()=>({pad(){return this}})};
  globalThis.speechSynthesis={cancel(){},speak(){}};
  const cleared=[];let watched;
  const watching=new Promise(resolve=>{watched=resolve});
  navigator.geolocation={getCurrentPosition:callback=>callback({coords:{latitude:1,longitude:1,accuracy:5}}),watchPosition:()=>{watched();return 0},clearWatch:id=>cleared.push(id)};
  globalThis.fetch=async(url)=>response(url.endsWith('/v1/me')?{id:'A'}:url.endsWith('/active')?null:[]);
  window.fetch=globalThis.fetch;globalThis.location=window.location;
  saveSession(session('A'));
  const stop={lat:1,lon:1,address:'Private A address',rows:[{'Destination Address':'Private A address'}]};
  writeData('activeRoute',{clientId:'A-route',status:'ACTIVE',completedStops:0,stops:1,operational:{stops:[stop],order:[0],rows:stop.rows,headers:['Destination Address'],routeStats:{distance:1000,duration:60,total:4}}});
  writeData('addressRegistry',{'private a address':{address:'Private A address'}});
  writeData('deliveryHistory',[{address:'Private A address',timestamp:'2026-09-30T12:00:00.000Z'}]);
  await import('../src/main.js');
  assert.match(nodes.get('manualList').innerHTML,/Private A address/);
  nodes.get('startRoute').dispatchEvent(new Event('click'));await watching;
  nodes.get('completeStop').dispatchEvent(new Event('click'));
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(nodes.get('proofModal').hidden,false);
  nodes.get('proofFailed').dispatchEvent(new Event('click'));
  nodes.get('proofFailure').value='Synthetic absence';
  nodes.get('proofRecipient').value='Synthetic recipient';
  nodes.get('saveProof').dispatchEvent(new Event('click'));
  await new Promise(resolve=>setImmediate(resolve));
  const completed=readData('activeRoute',null);
  assert.equal(completed.status,'COMPLETED');assert.equal(completed.completedStops,1);
  assert.equal(completed.operational.navigationIndex,1);
  const proof=readData('deliveryHistory',[]).find(item=>item.id);
  assert.equal(proof.status,'FAILED');assert.equal(proof.failureReason,'Synthetic absence');
  assert.equal(proof.recipientName,'Synthetic recipient');assert.equal(proof.latitude,1);
  nodes.get('logoutAccount').dispatchEvent(new Event('click'));
  assert.deepEqual(cleared,[0]);assert.equal(nodes.get('navigator').hidden,true);assert.equal(nodes.get('workspace').hidden,true);
  assert.equal(nodes.get('manualList').innerHTML,'');assert.equal(nodes.get('tbody').innerHTML,'');assert.equal(window.routeflowLastPosition,null);
  assert.doesNotMatch(nodes.get('historyList').innerHTML,/Private A address/);
  assert.doesNotMatch(nodes.get('registryList').innerHTML,/Private A address/);
  assert.ok(layers.some(value=>value.removed));
  saveSession(session('B'));assert.equal(authUser().id,'B');assert.equal(readData('activeRoute',null),null);
  assert.equal(nodes.get('workspace').hidden,true);assert.doesNotMatch(nodes.get('historyList').innerHTML,/Private A address/);
});
