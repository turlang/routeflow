import {getActiveRoute} from './api.js';
import {captureScope,assertScope,isCurrentScope,readData,writeData,removeData} from './storage.js';
import {saveLocalRoute} from './route-history-ui.js';
import {enqueueRoute,flushRouteQueue,requestRouteSync} from './route-sync.js';
const read=()=>readData('activeRoute',null);
const write=(route,scope=captureScope())=>{writeData('activeRoute',route,scope);window.dispatchEvent(new CustomEvent('routeflow:active-route-synced',{detail:route}))};
const fromRemote=r=>({...r,clientId:r.clientId||`server-${r.id}`,serverId:r.id,deliveries:r.deliveriesCount});
export function activeRoute(){return read()}
export function resumableRoute(){const route=read();return route?.status==='ACTIVE'?route:null}
function persist(route,scope){enqueueRoute(route,scope);write(route,scope);saveLocalRoute(route);requestRouteSync();return route}
export async function syncActiveRoute(){
 const scope=captureScope();if(!scope.userId)return read();
 await flushRouteQueue({force:true});assertScope(scope);
 const queue=readData('routeOutbox',{},scope),local=read();
 if(local&&queue[local.clientId])return local;
 try{const remote=await getActiveRoute();assertScope(scope);if(!remote)return read();const cloud=fromRemote(remote);write(cloud,scope);saveLocalRoute(cloud);return cloud}
 catch(error){if(!isCurrentScope(scope))throw error;return read()}
}
export async function beginRoute({sourceFilename,plannedKm,plannedMinutes,stops,deliveries,operational}){
 const scope=captureScope(),now=new Date().toISOString();
 const history=readData('routeHistory',[],scope),previous=read();
 if(previous?.status==='ACTIVE'&&!history.some(r=>r.clientId===previous.clientId))history.push(previous);
 for(const old of history)if(old.status==='ACTIVE'){const cancelled={...old,status:'CANCELLED',finishedAt:now};enqueueRoute(cancelled,scope);saveLocalRoute(cancelled)}
 const route={clientId:`route-${crypto.randomUUID()}`,userId:scope.userId,sourceFilename,status:'ACTIVE',startedAt:now,plannedKm,plannedMinutes,stops,deliveries,completedStops:0,operational};
 persist(route,scope);await flushRouteQueue();assertScope(scope);return read();
}
export async function markRouteProgress(completedStops,operational){const scope=captureScope(),route=read();if(!route)return null;route.completedStops=Math.max(route.completedStops||0,completedStops);if(operational)route.operational=operational;persist(route,scope);return route}
export async function finishRoute(){const scope=captureScope(),route=read();if(!route)return null;route.status='COMPLETED';route.finishedAt=new Date().toISOString();persist(route,scope);return route}
export function clearActiveRoute(){removeData('activeRoute')}
