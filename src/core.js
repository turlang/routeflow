export function normalizeStreet(value='') {
  return String(value).split(',')[0].normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
    .replace(/^(r\.?|rua|av\.?|avenida|trav\.?|travessa|al\.?|alameda)\s+/,'').replace(/\s+/g,' ').trim();
}
export function groupStops(rows) {
  const map=new Map();
  rows.forEach((row,index)=>{const lat=Number(row.Latitude),lon=Number(row.Longitude);if(!Number.isFinite(lat)||!Number.isFinite(lon))return;
    const key=`${lat.toFixed(5)}|${lon.toFixed(5)}`;
    if(!map.has(key)) map.set(key,{key,lat,lon,street:normalizeStreet(row['Destination Address']),address:row['Destination Address']||'',rows:[],firstIndex:index});
    map.get(key).rows.push(row);
  });
  return [...map.values()];
}
export function haversine(a,b){const rad=x=>x*Math.PI/180,R=6371000,dLat=rad(b.lat-a.lat),dLon=rad(b.lon-a.lon);const q=Math.sin(dLat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLon/2)**2;return 2*R*Math.asin(Math.sqrt(q));}
export function fallbackMatrix(stops){return stops.map(a=>stops.map(b=>haversine(a,b)));}
function routeCost(order,matrix,stops,streetPenalty=450){let cost=0;const left=new Set();let prevStreet=stops[order[0]]?.street||'';for(let k=1;k<order.length;k++){const a=order[k-1],b=order[k];cost+=matrix[a][b]??1e12;const s=stops[b].street;if(s!==prevStreet){if(prevStreet)left.add(prevStreet);if(s&&left.has(s))cost+=streetPenalty;prevStreet=s;}}return cost;}
export function optimizeOrder(stops,matrix,startIndex=0,streetPenalty=450){if(!stops.length)return[];const remaining=new Set(stops.map((_,i)=>i));let cur=Math.max(0,Math.min(startIndex,stops.length-1));const order=[cur];remaining.delete(cur);const left=new Set();let currentStreet=stops[cur].street;
  while(remaining.size){let best=null,bestScore=Infinity;for(const i of remaining){let score=matrix[cur][i]??1e12;const s=stops[i].street;if(s===currentStreet)score-=Math.min(streetPenalty*.55,score*.25);else if(left.has(s))score+=streetPenalty;if(score<bestScore){bestScore=score;best=i;}}
    if(stops[best].street!==currentStreet){if(currentStreet)left.add(currentStreet);currentStreet=stops[best].street;}cur=best;order.push(cur);remaining.delete(cur);
  }
  let improved=true,passes=0;while(improved&&passes++<5){improved=false;const base=routeCost(order,matrix,stops,streetPenalty);outer:for(let i=1;i<order.length-2;i++)for(let j=i+1;j<order.length-1;j++){const candidate=[...order.slice(0,i),...order.slice(i,j+1).reverse(),...order.slice(j+1)];if(routeCost(candidate,matrix,stops,streetPenalty)+1<base){order.splice(0,order.length,...candidate);improved=true;break outer;}}}
  return order;
}
export function flattenRoute(stops,order){let deliverySeq=1;return order.flatMap((idx,stopNo)=>stops[idx].rows.map(row=>({...row,'Optimized Sequence':deliverySeq++,'Optimized Stop':stopNo+1})));}
export function routeMetrics(order,matrix,stops){let distance=0,reentries=0,transitions=0;const left=new Set();let prev=stops[order[0]]?.street||'';for(let k=1;k<order.length;k++){distance+=matrix[order[k-1]][order[k]]||0;const s=stops[order[k]].street;if(s!==prev){transitions++;if(prev)left.add(prev);if(s&&left.has(s))reentries++;prev=s;}}return{distance,reentries,transitions};}
