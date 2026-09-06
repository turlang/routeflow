export function normalizeStreet(value='') {
  return String(value).split(',')[0].normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
    .replace(/^(r\.?|rua|av\.?|avenida|trav\.?|travessa|al\.?|alameda|estr\.?|estrada|rod\.?|rodovia)\s+/,'').replace(/\s+/g,' ').trim();
}
export function groupStops(rows) {
  const map=new Map();
  rows.forEach((row,index)=>{const lat=Number(row.Latitude),lon=Number(row.Longitude);if(!Number.isFinite(lat)||!Number.isFinite(lon))return;
    const key=`${lat.toFixed(5)}|${lon.toFixed(5)}`;
    if(!map.has(key)) map.set(key,{key,lat,lon,street:normalizeStreet(row['Destination Address']),address:row['Destination Address']||'',neighborhood:row.Bairro||'',city:row.City||'',zipcode:row['Zipcode/Postal code']||'',rows:[],firstIndex:index});
    map.get(key).rows.push({...row,__sourceIndex:index});
  });
  return [...map.values()];
}
export function haversine(a,b){const rad=x=>x*Math.PI/180,R=6371000,dLat=rad(b.lat-a.lat),dLon=rad(b.lon-a.lon);const q=Math.sin(dLat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLon/2)**2;return 2*R*Math.asin(Math.sqrt(q));}
export function fallbackMatrix(stops){return stops.map(a=>stops.map(b=>haversine(a,b)));}
function routeCost(order,matrix,stops,streetPenalty=0){let cost=0;const left=new Set();let prev=stops[order[0]]?.street||'';for(let k=1;k<order.length;k++){const a=order[k-1],b=order[k];cost+=matrix[a][b]??1e12;const s=stops[b]?.street||'';if(s!==prev){if(prev)left.add(prev);if(streetPenalty&&s&&left.has(s))cost+=streetPenalty;prev=s;}}return cost;}
function nearest(stops,matrix,start,streetPenalty){const remaining=new Set(stops.map((_,i)=>i));const order=[start];remaining.delete(start);const left=new Set();let cur=start,prev=stops[start]?.street||'';while(remaining.size){let best=-1,bestScore=Infinity;for(const i of remaining){let score=matrix[cur][i]??1e12;const s=stops[i]?.street||'';if(streetPenalty&&s&&left.has(s)&&s!==prev)score+=streetPenalty;if(score<bestScore){bestScore=score;best=i;}}const nextStreet=stops[best]?.street||'';if(nextStreet!==prev){if(prev)left.add(prev);prev=nextStreet;}order.push(best);remaining.delete(best);cur=best;}return order;}
function improve2Opt(seed,matrix,stops,streetPenalty){let order=[...seed],bestCost=routeCost(order,matrix,stops,streetPenalty),passes=0,changed=true;while(changed&&passes++<20){changed=false;for(let i=1;i<order.length-1;i++){for(let j=i+1;j<order.length;j++){const candidate=[...order.slice(0,i),...order.slice(i,j+1).reverse(),...order.slice(j+1)];const cost=routeCost(candidate,matrix,stops,streetPenalty);if(cost+0.5<bestCost){order=candidate;bestCost=cost;changed=true;}}}}return order;}
export function optimizeOrder(stops,matrix,startIndex=0,streetPenalty=0){if(!stops.length)return[];const start=Math.max(0,Math.min(startIndex,stops.length-1));let best=improve2Opt(nearest(stops,matrix,start,streetPenalty),matrix,stops,streetPenalty);let bestCost=routeCost(best,matrix,stops,streetPenalty);
  const candidates=stops.map((_,i)=>i).filter(i=>i!==start).sort((a,b)=>(matrix[start][a]??1e12)-(matrix[start][b]??1e12)).slice(0,12);
  for(const second of candidates){const remaining=new Set(stops.map((_,i)=>i));remaining.delete(start);remaining.delete(second);const seed=[start,second];let cur=second;while(remaining.size){let next=-1,d=Infinity;for(const i of remaining){const v=matrix[cur][i]??1e12;if(v<d){d=v;next=i;}}seed.push(next);remaining.delete(next);cur=next;}const candidate=improve2Opt(seed,matrix,stops,streetPenalty);const cost=routeCost(candidate,matrix,stops,streetPenalty);if(cost<bestCost){best=candidate;bestCost=cost;}}
  return best;
}
export function flattenRoute(stops,order){let deliverySeq=1;return order.flatMap((idx,stopNo)=>stops[idx].rows.map(row=>{const {__sourceIndex,...original}=row;return {...original,'Optimized Sequence':deliverySeq++,'Optimized Stop':stopNo+1};}));}
export function routeMetrics(order,matrix,stops){let distance=0,reentries=0,transitions=0,maxLeg=0;const left=new Set();let prev=stops[order[0]]?.street||'';for(let k=1;k<order.length;k++){const leg=matrix[order[k-1]][order[k]]||0;distance+=leg;maxLeg=Math.max(maxLeg,leg);const s=stops[order[k]].street;if(s!==prev){transitions++;if(prev)left.add(prev);if(s&&left.has(s))reentries++;prev=s;}}return{distance,reentries,transitions,maxLeg};}
