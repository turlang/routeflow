import {apiBase,hasSession,listAddresses,importAddresses,updateAddress} from './api.js';
import {readData,writeData,captureScope,assertScope} from './storage.js';
const key=s=>String(s||'').trim().toLocaleLowerCase('pt-BR').replace(/\s+/g,' ');
const enabled=()=>Boolean(apiBase()&&hasSession());
const serverShape=a=>({address:a.address,type:a.type||'Casa',hours:a.hours||'',access:a.access||'',parking:a.parking||'',notes:a.notes||'',createdAt:a.createdAt,updatedAt:a.updatedAt,lastImportedAt:a.lastImportedAt,importCount:a.importCount||1,serverId:a.id,latitude:a.latitude,longitude:a.longitude});
const notify=()=>window.dispatchEvent(new CustomEvent('routeflow:registry-synced'));
export function localAddress(address){return readData('addressRegistry',{})[key(address)]||null}
export function saveLocalAddress(address,patch){const db=readData('addressRegistry',{}),k=key(address),now=new Date().toISOString();db[k]={...(db[k]||{address,type:'Casa',createdAt:now,importCount:1}),...patch,address,updatedAt:now};writeData('addressRegistry',db);return db[k]}
export async function pullAddresses(scope=captureScope()){
 assertScope(scope);if(!enabled())return{mode:'local',count:0};
 const remote=await listAddresses();assertScope(scope);const db=readData('addressRegistry',{},scope);
 for(const a of remote){const k=key(a.address),local=db[k],server=serverShape(a);if(!local||!local.updatedAt||new Date(server.updatedAt)>=new Date(local.updatedAt))db[k]={...local,...server};else db[k]={...server,...local,serverId:a.id}}
 writeData('addressRegistry',db,scope);writeData('addressSync',{lastPullAt:new Date().toISOString()},scope);notify();return{mode:'cloud',count:remote.length};
}
export async function syncImportedStops(stops=[]){
 const scope=captureScope();if(!stops.length)return{mode:'local',total:0};const db=readData('addressRegistry',{},scope),now=new Date().toISOString();
 for(const s of stops){const k=key(s.address);if(!k)continue;db[k]??={address:s.address,type:'Casa',hours:'',size:'',access:'',parking:'',notes:'',createdAt:now,updatedAt:now,importCount:1};db[k].address=s.address;db[k].lastImportedAt=now;if(Number.isFinite(s.lat))db[k].latitude=s.lat;if(Number.isFinite(s.lon))db[k].longitude=s.lon}
 writeData('addressRegistry',db,scope);notify();if(!enabled())return{mode:'local',total:stops.length};
 const result=await importAddresses(stops.map(s=>({address:s.address,latitude:Number.isFinite(s.lat)?s.lat:null,longitude:Number.isFinite(s.lon)?s.lon:null})));assertScope(scope);await pullAddresses(scope);assertScope(scope);return{mode:'cloud',...result};
}
export async function syncAddressEdit(address,patch){
 const scope=captureScope(),saved=saveLocalAddress(address,patch);notify();if(!enabled())return{mode:'local',address:saved};let serverId=saved.serverId;
 if(!serverId){await importAddresses([{address,latitude:saved.latitude??null,longitude:saved.longitude??null}]);assertScope(scope);await pullAddresses(scope);assertScope(scope);serverId=localAddress(address)?.serverId}
 if(!serverId)throw Error('Endereço ainda não possui vínculo com o servidor.');
 await updateAddress(serverId,{type:saved.type||'Casa',hours:saved.hours||null,access:saved.access||null,parking:saved.parking||null,notes:saved.notes||null});assertScope(scope);await pullAddresses(scope);assertScope(scope);return{mode:'cloud',address:localAddress(address)};
}
