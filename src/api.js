const CONFIG_KEY='routeflow.apiBaseUrl.v1';
const TOKEN_KEY='routeflow.authToken.v1';
const USER_KEY='routeflow.authUser.v1';

export const apiBase=()=>localStorage.getItem(CONFIG_KEY)||'';
export const setApiBase=value=>localStorage.setItem(CONFIG_KEY,String(value||'').replace(/\/$/,''));
export const authToken=()=>localStorage.getItem(TOKEN_KEY)||'';
export const authUser=()=>{try{return JSON.parse(localStorage.getItem(USER_KEY)||'null')}catch{return null}};
export const hasSession=()=>Boolean(authToken());
export function saveSession({token,user}){localStorage.setItem(TOKEN_KEY,token);localStorage.setItem(USER_KEY,JSON.stringify(user))}
export function clearSession(){localStorage.removeItem(TOKEN_KEY);localStorage.removeItem(USER_KEY)}

export async function api(path,{method='GET',body,auth=true}={}){
  const base=apiBase();
  if(!base)throw new Error('API ainda não configurada.');
  const headers={'Content-Type':'application/json'};
  if(auth&&authToken())headers.Authorization=`Bearer ${authToken()}`;
  const response=await fetch(`${base}${path}`,{method,headers,body:body===undefined?undefined:JSON.stringify(body)});
  let data=null;
  try{data=await response.json()}catch{}
  if(!response.ok){
    if(response.status===401&&auth)clearSession();
    throw new Error(data?.error||`Falha HTTP ${response.status}`)
  }
  return data
}

export const register=body=>api('/v1/auth/register',{method:'POST',body,auth:false});
export const login=body=>api('/v1/auth/login',{method:'POST',body,auth:false});
export const me=()=>api('/v1/me');
export const listAddresses=()=>api('/v1/addresses');
export const importAddresses=addresses=>api('/v1/addresses/import',{method:'POST',body:{addresses}});
export const updateAddress=(id,body)=>api(`/v1/addresses/${encodeURIComponent(id)}`,{method:'PATCH',body});
export const listDeliveries=()=>api('/v1/deliveries');
export const createDelivery=body=>api('/v1/deliveries',{method:'POST',body});
export const importDeliveries=deliveries=>api('/v1/deliveries/import',{method:'POST',body:{deliveries}});
export const listRoutes=()=>api('/v1/routes');
