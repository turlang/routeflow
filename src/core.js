export function normalizeStreet(value='') {
  return String(value).split(',')[0].normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
    .replace(/^(r\.?|rua|av\.?|avenida|trav\.?|travessa|al\.?|alameda|estr\.?|estrada|rod\.?|rodovia)\s+/,'')
    .replace(/\s+/g,' ').trim();
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
function routeCost(order,matrix,stops,streetPenalty=900){let cost=0;const left=new Set();let prevStreet=stops[order[0]]?.street||'';for(let k=1;k<order.length;k++){const a=order[k-1],b=order[k];cost+=matrix[a][b]??1e12;const s=stops[b].street;if(s!==prevStreet){if(prevStreet)left.add(prevStreet);if(s&&left.has(s))cost+=streetPenalty;prevStreet=s;}}return cost;}
function nearestNeighbor(stops,matrix,startIndex,streetPenalty){const remaining=new Set(stops.map((_,i)=>i));let cur=startIndex;const out=[cur];remaining.delete(cur);const closed=new Set();let street=stops[cur].street;
 while(remaining.size){let best=-1,bestScore=Infinity;for(const i of remaining){let score=matrix[cur][i]??1e12;const nextStreet=stops[i].street;if(nextStreet===street)score*=.72;else if(closed.has(nextStreet))score+=streetPenalty;if(score<bestScore){best=i;bestScore=score;}}
  if(stops[best].street!==street){if(street)closed.add(street);street=stops[best].street;}out.push(best);remaining.delete(best);cur=best;
 }return out;}
function improve2Opt(order,matrix,stops,streetPenalty){let best=[...order],bestCost=routeCost(best,matrix,stops,streetPenalty);let changed=true,passes=0;while(changed&&passes++<12){changed=false;outer:for(let i=1;i<best.length-1;i++){for(let j=i+1;j<best.length;j++){const candidate=[...best.slice(0,i),...best.slice(i,j+1).reverse(),...best.slice(j+1)];const c=routeCost(candidate,matrix,stops,streetPenalty);if(c+1<bestCost){best=candidate;bestCost=c;changed=true;break outer;}}}}return best;}
export function optimizeOrder(stops,matrix,startIndex=0,streetPenalty=900){if(!stops.length)return[];const start=Math.max(0,Math.min(startIndex,stops.length-1));let best=improve2Opt(nearestNeighbor(stops,matrix,start,streetPenalty),matrix,stops,streetPenalty);let bestCost=routeCost(best,matrix,stops,streetPenalty);
 const candidates=[...Array(Math.min(stops.length,12)).keys()].filter(i=>i!==start).sort((a,b)=>(matrix[start][a]??0)-(matrix[start][b]??0));
 for(const seed of candidates){const tailStops=new Set(stops.map((_,i)=>i));tailStops.delete(start);const trial=[start];let cur=seed;if(tailStops.has(cur)){trial.push(cur);tailStops.delete(cur);}let street=stops[cur]?.street||stops[start].street;const closed=new Set([stops[start].street]);while(tailStops.size){let pick=-1,score=Infinity;for(const i of tailStops){let s=matrix[cur][i]??1e12;if(stops[i].street===street)s*=.72;else if(closed.has(stops[i].street))s+=streetPenalty;if(s<score){score=s;pick=i;}}if(stops[pick].street!==street){closed.add(street);street=stops[pick].street;}trial.push(pick);tailStops.delete(pick);cur=pick;}const improved=improve2Opt(trial,matrix,stops,streetPenalty),c=routeCost(improved,matrix,stops,streetPenalty);if(c<bestCost){best=improved;bestCost=c;}}
 return best;
}
export function flattenRoute(stops,order){let deliverySeq=1;return order.flatMap((idx,stopNo)=>stops[idx].rows.map(row=>({...row,'Optimized Sequence':deliverySeq++,'Optimized Stop':stopNo+1})));}
export function routeMetrics(order,matrix,stops){let distance=0,reentries=0,transitions=0;const left=new Set();let prev=stops[order[0]]?.street||'';for(let k=1;k<order.length;k++){distance+=matrix[order[k-1]][order[k]]||0;const s=stops[order[k]].street;if(s!==prev){transitions++;if(prev)left.add(prev);if(s&&left.has(s))reentries++;prev=s;}}return{distance,reentries,transitions};}
