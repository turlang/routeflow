import {readData,writeData,removeData,captureScope,assertScope} from './storage.js';
import{apiBase,hasSession,listRoutes}from'./api.js';
const KEY='routeHistory';
const $=id=>document.getElementById(id);
const read=()=>{return readData(KEY,[])};
const write=v=>writeData(KEY,v.slice(0,500));
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtDate=v=>v?new Date(v).toLocaleDateString('pt-BR'):'-';
const fmtTime=v=>v?new Date(v).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}):'-';
const duration=r=>{if(!r.startedAt||!r.finishedAt)return'-';const m=Math.max(0,Math.round((new Date(r.finishedAt)-new Date(r.startedAt))/60000)),h=Math.floor(m/60);return h?`${h}h ${String(m%60).padStart(2,'0')}min`:`${m} min`};
export function saveLocalRoute(route){if(!route?.clientId)return;const all=read(),i=all.findIndex(x=>x.clientId===route.clientId),item={...route,updatedAt:new Date().toISOString()};if(i>=0)all[i]=item;else all.unshift(item);write(all);window.dispatchEvent(new CustomEvent('routeflow:routes-synced'))}
export function cancelOtherActiveRoutes(exceptClientId=''){const all=read(),now=new Date().toISOString();let changed=false;for(const r of all)if(r.status==='ACTIVE'&&r.clientId!==exceptClientId){r.status='CANCELLED';r.finishedAt=r.finishedAt||now;changed=true}if(changed){write(all);window.dispatchEvent(new CustomEvent('routeflow:routes-synced'))}return changed}
function remoteShape(r){return{clientId:r.clientId||`server-${r.id}`,serverId:r.id,sourceFilename:r.sourceFilename||'Rota',status:r.status,startedAt:r.startedAt,finishedAt:r.finishedAt,plannedKm:r.plannedKm,plannedMinutes:r.plannedMinutes,stops:r.stops,deliveries:r.deliveriesCount??r._count?.deliveries??0,completedStops:r.completedStops??0,operational:r.operational}}
export async function pullRouteHistory(){
 const scope=captureScope();if(!(apiBase()&&hasSession()))return{mode:'local',count:read().length};
 const remote=await listRoutes();assertScope(scope);const all=read(),queue=readData('routeOutbox',{},scope);
 for(const r of remote){
  const index=all.findIndex(item=>item.serverId===r.id||item.clientId===r.clientId),local=index>=0?all[index]:null;
  if(queue[r.clientId])continue;
  const item={...local,...remoteShape(r)};
  if(index>=0)all[index]=item;else all.push(item);
 }
 all.sort((a,b)=>String(b.startedAt||'').localeCompare(String(a.startedAt||'')));write(all);renderRouteHistory();return{mode:'cloud',count:remote.length};
}
export function renderRouteHistory(){const host=$('routeHistoryList');if(!host)return;const all=read();host.innerHTML=all.length?all.map(r=>`<article class="route-history-item"><div><strong>${safe(r.sourceFilename||'Rota')}</strong><span>${fmtDate(r.startedAt)} · ${fmtTime(r.startedAt)} → ${fmtTime(r.finishedAt)}</span></div><div class="route-history-stats"><span><b>${Number(r.plannedKm||0).toFixed(1)}</b> km</span><span><b>${r.completedStops||0}/${r.stops||r.completedStops||0}</b> paradas</span><span><b>${duration(r)}</b> duração</span><span class="route-status ${String(r.status||'').toLowerCase()}">${r.status==='COMPLETED'?'Concluída':r.status==='ACTIVE'?'Em andamento':r.status==='CANCELLED'?'Cancelada':'Planejada'}</span></div></article>`).join(''):'<div class="history-empty">Nenhuma rota registrada ainda.</div>'}
export function initRouteHistoryUI(){renderRouteHistory();window.addEventListener('routeflow:routes-synced',renderRouteHistory);window.addEventListener('routeflow:session-changed',renderRouteHistory);if(apiBase()&&hasSession())pullRouteHistory().catch(()=>{})}
