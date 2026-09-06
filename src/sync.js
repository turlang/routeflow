import{apiBase,hasSession,listAddresses,importAddresses,updateAddress}from'./api.js';

const REGISTRY_KEY='routeflow.addressRegistry.v1';
const SYNC_KEY='routeflow.addressSync.v1';
const key=s=>String(s||'').trim().toLocaleLowerCase('pt-BR').replace(/\s+/g,' ');
const read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f))}catch{return f}};
const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const localRegistry=()=>read(REGISTRY_KEY,{});
const setRegistry=v=>write(REGISTRY_KEY,v);
const enabled=()=>Boolean(apiBase()&&hasSession());
const serverShape=a=>({address:a.address,type:a.type||'Casa',hours:a.hours||'',access:a.access||'',parking:a.parking||'',notes:a.notes||'',createdAt:a.createdAt,updatedAt:a.updatedAt,lastImportedAt:a.lastImportedAt,importCount:a.importCount||1,serverId:a.id,latitude:a.latitude,longitude:a.longitude});

export function localAddress(address){return localRegistry()[key(address)]||null}
export function saveLocalAddress(address,patch){const db=localRegistry(),k=key(address),now=new Date().toISOString();db[k]={...(db[k]||{address,type:'Casa',createdAt:now,importCount:1}),...patch,address,updatedAt:now};setRegistry(db);return db[k]}

export async function pullAddresses(){if(!enabled())return{mode:'local',count:0};const remote=await listAddresses(),db=localRegistry();for(const a of remote){const k=key(a.address),local=db[k],server=serverShape(a);if(!local||!local.updatedAt||new Date(server.updatedAt)>=new Date(local.updatedAt))db[k]={...local,...server};else db[k]={...server,...local,serverId:a.id}}setRegistry(db);write(SYNC_KEY,{lastPullAt:new Date().toISOString()});window.dispatchEvent(new CustomEvent('routeflow:registry-synced'));return{mode:'cloud',count:remote.length}}

export async function syncImportedStops(stops=[]){if(!stops.length)return{mode:'local',created:0,updated:0,total:0};const db=localRegistry(),now=new Date().toISOString();for(const s of stops){const k=key(s.address);if(!k)continue;if(!db[k])db[k]={address:s.address,type:'Casa',hours:'',size:'',access:'',parking:'',notes:'',createdAt:now,updatedAt:now,lastImportedAt:now,importCount:1};else{db[k].address=s.address;db[k].lastImportedAt=now;if(!db[k].type)db[k].type='Casa'}if(Number.isFinite(s.lat))db[k].latitude=s.lat;if(Number.isFinite(s.lon))db[k].longitude=s.lon}setRegistry(db);window.dispatchEvent(new CustomEvent('routeflow:registry-synced'));if(!enabled())return{mode:'local',created:0,updated:0,total:stops.length};const result=await importAddresses(stops.map(s=>({address:s.address,latitude:Number.isFinite(s.lat)?s.lat:null,longitude:Number.isFinite(s.lon)?s.lon:null})));await pullAddresses();return{mode:'cloud',...result}}

export async function syncAddressEdit(address,patch){const saved=saveLocalAddress(address,patch);window.dispatchEvent(new CustomEvent('routeflow:registry-synced'));if(!enabled())return{mode:'local',address:saved};let serverId=saved.serverId;if(!serverId){await importAddresses([{address,latitude:saved.latitude??null,longitude:saved.longitude??null}]);await pullAddresses();serverId=localAddress(address)?.serverId}if(!serverId)throw new Error('Endereço ainda não possui vínculo com o servidor.');const body={type:saved.type||'Casa',hours:saved.hours||null,access:saved.access||null,parking:saved.parking||null,notes:saved.notes||null};await updateAddress(serverId,body);await pullAddresses();return{mode:'cloud',address:localAddress(address)}}
