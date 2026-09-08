export const PLANS=Object.freeze({
  FREE:{routesPerMonth:2,stopsPerRoute:25,historyDays:30,drivers:1},
  DRIVER:{routesPerMonth:30,stopsPerRoute:80,historyDays:90,drivers:1},
  PRO:{routesPerMonth:200,stopsPerRoute:200,historyDays:null,drivers:1},
  TEAM:{routesPerMonth:1000,stopsPerRoute:200,historyDays:null,drivers:5},
  BUSINESS:{routesPerMonth:null,stopsPerRoute:500,historyDays:null,drivers:null}
});
export function normalizePlan(value){const key=String(value||'FREE').trim().toUpperCase();return PLANS[key]?key:'FREE'}
export function entitlementsFor(value){const plan=normalizePlan(value);return{plan,...PLANS[plan]}}
export function checkRouteEntitlement({plan,stops=0,routesThisMonth=0}){const limits=entitlementsFor(plan);if(limits.stopsPerRoute!=null&&stops>limits.stopsPerRoute)return{allowed:false,code:'STOP_LIMIT',message:`Seu plano permite até ${limits.stopsPerRoute} paradas por rota.`,limits};if(limits.routesPerMonth!=null&&routesThisMonth>=limits.routesPerMonth)return{allowed:false,code:'MONTHLY_ROUTE_LIMIT',message:`Seu plano permite ${limits.routesPerMonth} rotas por mês.`,limits};return{allowed:true,limits}}
export function monthStart(now=new Date()){return new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),1))}
