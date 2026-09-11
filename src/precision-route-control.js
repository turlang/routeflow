const STATE={origin:null,stops:[],run:0,repairing:false,useOrigin:false,originPromise:null};
const $=id=>document.getElementById(id);
const normalize=s=>String(s||'').trim().replace(/\s+/g,' ').toLocaleLowerCase('pt-BR');
const apiBase=()=>{const stored=localStorage.getItem('routeflow.apiBaseUrl.v1');if(stored)return stored.replace(/\/$/,'');return['localhost','127.0.0.1'].includes(location.hostname)?'http://localhost:3001':'https://routeflow-api-tz5q.onrender.com'};
const rawFetch=window.fetch.bind(window);
function parseStops(rows){const map=new Map();for(const row of rows){const lat=Number(row.Latitude),lon=Number(row.Longitude),address=String(row['Destination Address']||'').trim();if(!Number.isFinite(lat)||!Number.isFinite(lon)||!address)continue;const key=`${lat.toFixed(5)}|${lon.toFixed(5)}`;if(!map.has(key))map.set(key,{key,lat,lon,address});}return[...map.values()]}
async function readExcel(file){try{const wb=XLSX.read(await file.arrayBuffer(),{type:'array'}),ws=wb.Sheets[wb.SheetNames[0]],rows=XLSX.utils.sheet_to_json(ws,{defval:''});STATE.stops=parseStops(rows)}catch{STATE.stops=[]}}
function requestOrigin(){
  if(STATE.origin)return Promise.resolve(STATE.origin);
  if(STATE.originPromise)return STATE.originPromise;
  if(!navigator.geolocation)return Promise.resolve(null);
  STATE.originPromise=new Promise(resolve=>navigator.geolocation.getCurrentPosition(p=>{
    STATE.origin={lat:p.coords.latitude,lon:p.coords.longitude,accuracy:p.coords.accuracy,at:Date.now()};
    window.__routeflowRoadOrigin=STATE.origin;
    resolve(STATE.origin);
  },()=>resolve(null),{enableHighAccuracy:true,timeout:12000,maximumAge:3000})).finally(()=>{STATE.originPromise=null});
  return STATE.originPromise;
}
function rememberOrigin(){STATE.useOrigin=true;return requestOrigin()}
function greedyCost(start,matrix){const left=new Set(matrix.map((_,i)=>i));left.delete(start);let cur=start,cost=0;while(left.size){let next=-1,best=Infinity;for(const i of left){const d=Number(matrix[cur]?.[i]);if(Number.isFinite(d)&&d<best){best=d;next=i}}if(next<0)return Infinity;cost+=best;cur=next;left.delete(next)}return cost}
function geoDistance(a,b){const rad=x=>x*Math.PI/180,R=6371000,dLat=rad(b.lat-a.lat),dLon=rad(b.lon-a.lon),q=Math.sin(dLat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLon/2)**2;return 2*R*Math.asin(Math.sqrt(q))}
function bestRoadStart(full){
  const distances=Array.isArray(full?.distances)?full.distances:null;
  const durations=Array.isArray(full?.durations)?full.durations:null;
  const reachable=durations?.length===STATE.stops.length+1?durations[0]?.slice(1):distances?.[0]?.slice(1);
  if(!STATE.origin||!Array.isArray(reachable)||reachable.length!==STATE.stops.length)return null;
  let bestIndex=-1,bestGeo=Infinity,bestRoad=Infinity;
  for(let i=0;i<STATE.stops.length;i++){
    const road=Number(reachable[i]);
    if(!Number.isFinite(road))continue;
    const geo=geoDistance(STATE.origin,STATE.stops[i]);
    if(geo<bestGeo-0.5||(Math.abs(geo-bestGeo)<=0.5&&road<bestRoad)){
      bestIndex=i;
      bestGeo=geo;
      bestRoad=road;
    }
  }
  return bestIndex>=0?{i:bestIndex,total:bestRoad,origin:bestRoad,geo:bestGeo,metric:'nearest'}:null;
}
function stripOriginMatrix(data){const out={...data};if(Array.isArray(data.distances))out.distances=data.distances.slice(1).map(row=>row.slice(1));if(Array.isArray(data.durations))out.durations=data.durations.slice(1).map(row=>row.slice(1));if(Array.isArray(data.sources))out.sources=data.sources.slice(1);if(Array.isArray(data.destinations))out.destinations=data.destinations.slice(1);return out}
function installRoadOrigin(){if(window.__routeflowPrecisionFetch)return;window.__routeflowPrecisionFetch=true;window.fetch=async(input,init={})=>{const url=typeof input==='string'?input:input?.url||'';if(!url.includes('/v1/routing/table')||String(init.method||'GET').toUpperCase()!=='POST')return rawFetch(input,init);if(STATE.useOrigin&&!STATE.origin)await requestOrigin();if(!STATE.useOrigin||!STATE.origin)return rawFetch(input,init);let payload;try{payload=JSON.parse(init.body||'{}')}catch{return rawFetch(input,init)}const coords=payload?.coordinates;if(!Array.isArray(coords)||coords.length!==STATE.stops.length||!coords.length)return rawFetch(input,init);const augmented={...payload,coordinates:[{lat:STATE.origin.lat,lon:STATE.origin.lon},...coords]};const response=await rawFetch(input,{...init,body:JSON.stringify(augmented)});if(!response.ok)return response;const data=await response.clone().json();const choice=bestRoadStart(data);if(choice&&$('start')){$('start').value=String(choice.i);window.__routeflowRoadStartChoice=choice;window.__routeflowRoadStartAddress=STATE.stops[choice.i]?.address||'';}const body=JSON.stringify(stripOriginMatrix(data));return new Response(body,{status:response.status,statusText:response.statusText,headers:{'Content-Type':'application/json'}})} }
function byAddress(){return new Map(STATE.stops.map(s=>[normalize(s.address),s]))}
function manualStops(){const map=byAddress();return[...document.querySelectorAll('#manualList .manual-stop')].map(el=>map.get(normalize(el.querySelector('strong')?.textContent))).filter(Boolean)}
async function routePoints(points){const r=await rawFetch(`${apiBase()}/v1/routing/route`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({coordinates:points.map(p=>({lat:p.lat,lon:p.lon})),steps:true})});if(!r.ok)throw new Error(`Routing HTTP ${r.status}`);return r.json()}
const coordKey=p=>`${Number(p[0]).toFixed(5)},${Number(p[1]).toFixed(5)}`;
function segmentKey(a,b){const x=coordKey(a),y=coordKey(b);return x<y?`${x}|${y}`:`${y}|${x}`}
function legSegments(leg){const set=new Set();for(const step of leg?.steps||[]){const coords=step?.geometry?.coordinates||[];for(let i=1;i<coords.length;i++)set.add(segmentKey(coords[i-1],coords[i]))}return set}
function overlapPenalty(route){const legs=route?.legs||[];let penalty=0,maxRatio=0;for(let i=1;i<legs.length;i++){const a=legSegments(legs[i-1]),b=legSegments(legs[i]);if(!a.size||!b.size)continue;let common=0;for(const k of a)if(b.has(k))common++;const ratio=common/Math.max(1,Math.min(a.size,b.size));maxRatio=Math.max(maxRatio,ratio);if(ratio>.12)penalty+=(ratio-.12)*2600}return{penalty,maxRatio}}
function score(data){const route=data?.routes?.[0];if(!route)return{score:Infinity,distance:Infinity,overlap:1};const o=overlapPenalty(route);return{score:Number(route.distance||0)+o.penalty,distance:Number(route.distance||0),overlap:o.maxRatio}}
function clickMove(from,to){if(from===to||from<0||to<0)return;const dir=to>from?1:-1;let pos=from;while(pos!==to){const btn=document.querySelector(`#manualList .move[data-pos="${pos}"][data-dir="${dir}"]`);if(!btn)break;btn.click();pos+=dir}}
async function repairHairpins(){if(STATE.repairing||$('routeMode')?.value!=='progressive')return 0;const route=manualStops();if(route.length<3)return 0;STATE.repairing=true;let fixed=0,checks=0;try{for(let i=0;i<route.length-2&&checks<6;i++){const prev=i===0?(STATE.origin||route[i]):route[i-1],a=route[i],b=route[i+1],tail=route[i+2];if(!prev||!a||!b||!tail)continue;checks++;let base,candidate;try{base=score(await routePoints([prev,a,b,tail]));candidate=score(await routePoints([prev,b,a,tail]))}catch{continue}const overlapGain=base.overlap-candidate.overlap,distanceGain=base.distance-candidate.distance;if(base.overlap>.22&&candidate.score+80<base.score&&(overlapGain>.08||distanceGain>120)){clickMove(i,i+1);[route[i],route[i+1]]=[route[i+1],route[i]];fixed++}}if(fixed){const recalc=$('recalculate');if(recalc&&!recalc.disabled)recalc.click();const n=$('notice');if(n)n.textContent=`Precisão viária aplicada: ${fixed} retorno(s) local(is) corrigido(s) pela geometria real do percurso.`}return fixed}finally{STATE.repairing=false}}
function waitForReady(){const token=++STATE.run;let tries=0;const timer=setInterval(async()=>{if(token!==STATE.run){clearInterval(timer);return}tries++;if($('status')?.textContent==='Rota pronta'){clearInterval(timer);const choice=window.__routeflowRoadStartChoice,addr=window.__routeflowRoadStartAddress;if(choice&&$('notice'))$('notice').textContent=`Rota iniciada pela parada fisicamente mais próxima${addr?`: ${addr}`:''}. Distância inicial aproximada: ${Math.round(choice.geo||0)} m.`;await repairHairpins()}else if(tries>120)clearInterval(timer)},250)}
function bind(){installRoadOrigin();$('file')?.addEventListener('change',e=>e.target.files?.[0]&&readExcel(e.target.files[0]));$('currentLocation')?.addEventListener('click',rememberOrigin,true);$('optimize')?.addEventListener('click',waitForReady);}
if(typeof window!=='undefined'&&typeof document!=='undefined')bind();
