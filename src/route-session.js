import{apiBase,hasSession,createRoute,updateRoute}from'./api.js';
const KEY='routeflow.activeRoute.v1';
const enabled=()=>Boolean(apiBase()&&hasSession());
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}};
const write=v=>localStorage.setItem(KEY,JSON.stringify(v));
export function activeRoute(){return read()}
export async function beginRoute({sourceFilename,plannedKm,plannedMinutes,stops,deliveries}){const startedAt=new Date().toISOString(),local={clientId:`route-${Date.now()}-${Math.random().toString(36).slice(2)}`,sourceFilename,status:'ACTIVE',startedAt,plannedKm,plannedMinutes,stops,deliveries,completedStops:0};write(local);if(enabled()){try{const remote=await createRoute({sourceFilename,startedAt,plannedKm,plannedMinutes});local.serverId=remote.id;write(local)}catch{}}return local}
export async function markRouteProgress(completedStops){const route=read();if(!route)return null;route.completedStops=completedStops;write(route);return route}
export async function finishRoute(){const route=read();if(!route)return null;route.status='COMPLETED';route.finishedAt=new Date().toISOString();write(route);if(enabled()&&route.serverId){try{await updateRoute(route.serverId,{status:'COMPLETED',finishedAt:route.finishedAt})}catch{}}return route}
export function clearActiveRoute(){localStorage.removeItem(KEY)}
