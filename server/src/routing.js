const drivingBase=(process.env.ROUTING_BASE_URL||'https://router.project-osrm.org').replace(/\/$/,'');
const walkingBase=(process.env.ROUTING_WALKING_BASE_URL||'').replace(/\/$/,'');
const timeoutMs=Math.max(1000,Number(process.env.ROUTING_TIMEOUT_MS||12000));
export const routingConfigured=()=>Boolean(process.env.ROUTING_BASE_URL)&&!drivingBase.includes('router.project-osrm.org');
export const walkingRoutingConfigured=()=>Boolean(walkingBase);
async function fetchFrom(base,path){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);try{const r=await fetch(`${base}${path}`,{signal:controller.signal,headers:{accept:'application/json','user-agent':'RouteFlow/1.0'}});if(!r.ok)throw new Error(`Routing HTTP ${r.status}`);const data=await r.json();if(data.code&&data.code!=='Ok')throw new Error(`Routing ${data.code}`);return data}finally{clearTimeout(timer)}}
export const routingFetch=path=>fetchFrom(drivingBase,path);
export async function walkingRoutingFetch(path){if(!walkingBase)throw new Error('Roteamento pedestre não configurado');return fetchFrom(walkingBase,path)}
