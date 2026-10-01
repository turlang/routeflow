import{initSubscriberPortal,openSubscriberPortal}from'./subscriber-ui.js';
import{initAdminUI,openAdminUI}from'./admin-ui.js';
import {flushRouteQueue} from './route-sync.js';
import {initStorage,captureScope,assertScope,isCurrentScope,readData} from './storage.js';
import {exportLegacyArchive} from './legacy-migration.js';
import{apiBase,setApiBase,authUser,authToken,hasSession,saveSession,clearSession,register,login,me}from'./api.js';
import{pullAddresses}from'./sync.js';
import{syncDeliveryHistory}from'./history-sync.js';
import{pullRouteHistory}from'./route-history-ui.js';
import{syncActiveRoute}from'./route-session.js';
const $=id=>document.getElementById(id);
function mount(){const host=document.createElement('div');host.className='account-shell';host.innerHTML=`<button id="accountToggle" class="account-toggle" type="button">Conta</button><section id="accountPanel" class="account-panel" hidden><div class="account-head"><div><b>RouteFlow Cloud</b><small id="apiState">Modo local</small></div><button id="accountClose" class="secondary" type="button">Fechar</button></div><div class="account-config"><label>API RouteFlow<input id="apiUrl" type="url" placeholder="https://api.seudominio.com"></label><button id="saveApi" type="button">Conectar API</button></div><div id="accountGuest"><label>Nome<input id="accountName" autocomplete="name" placeholder="Seu nome"></label><label>E-mail<input id="accountEmailInput" type="email" autocomplete="email" placeholder="voce@email.com"></label><label>Senha<input id="accountPassword" type="password" autocomplete="current-password" minlength="8" placeholder="Mínimo 8 caracteres"></label><div class="account-actions"><button id="loginAccount" type="button">Entrar</button><button id="createAccount" class="secondary" type="button">Criar conta</button></div></div><div id="accountSigned" hidden><strong id="accountUser"></strong><span id="accountEmail"></span><button id="subscriberOpen" class="subscriber-open" type="button">Área do Assinante</button><button id="adminOpen" class="subscriber-open" type="button" hidden>Administração</button><button id="logoutAccount" class="secondary" type="button">Sair</button></div><p id="accountMessage" class="account-message"></p></section>`;document.querySelector('header')?.insertBefore(host,$('status'));return host}
function setMessage(text,error=false){const el=$('accountMessage');if(!el)return;el.textContent=text||'';el.classList.toggle('error',error)}
function render(){const user=authUser(),signed=hasSession();$('accountGuest').hidden=signed;$('accountSigned').hidden=!signed;$('adminOpen').hidden=!(signed&&user?.role==='ADMIN');if(signed){$('accountUser').textContent=user?.name||user?.email||'Usuário';$('accountEmail').textContent=user?.email||''}$('apiUrl').value=apiBase();$('apiState').textContent=apiBase()?'API configurada':'Modo local';$('accountToggle').textContent=signed?(user?.name||'Conta'):'Conta'}
async function syncCloud(){
 const scope=captureScope();
 try{await flushRouteQueue({force:true});assertScope(scope);const addresses=await pullAddresses();assertScope(scope);const history=await syncDeliveryHistory();assertScope(scope);const routes=await pullRouteHistory();assertScope(scope);const active=await syncActiveRoute();assertScope(scope);if(addresses.mode==='cloud')setMessage(`Conta conectada \u00b7 ${addresses.count} endere\u00e7o(s) \u00b7 ${history.pulled?.count??0} entrega(s) \u00b7 ${routes.count??0} rota(s) sincronizada(s)${active?.status==='ACTIVE'?' \u00b7 rota ativa recuperada':''}.`)}
 catch(e){if(isCurrentScope(scope))setMessage(`Conta conectada, mas a sincroniza\u00e7\u00e3o falhou: ${e.message}`,true)}
}
async function submit(mode){
 const scope=captureScope(),email=$('accountEmailInput').value.trim(),password=$('accountPassword').value,name=$('accountName').value.trim();
 if(!apiBase())return setMessage('Configure primeiro o endere\u00e7o da API.',true);if(!email||!password)return setMessage('Informe e-mail e senha.',true);
 setMessage(mode==='register'?'Criando conta...':'Entrando...');
 try{const data=mode==='register'?await register({name:name||undefined,email,password}):await login({email,password});assertScope(scope);saveSession(data);$('accountPassword').value='';render();setMessage('Conta conectada. Sincronizando...');await syncCloud()}
 catch(e){if(isCurrentScope(scope))setMessage(e.message,true)}
}
export function initAuthUI(){
 const migration=initStorage();mount();initSubscriberPortal();initAdminUI();
 const legacy=document.createElement('div');legacy.className='account-message';
 if(migration.status==='blocked')legacy.textContent=`Dados antigos preservados; migra\u00e7\u00e3o bloqueada: ${migration.error}`;
 else if(migration.count){legacy.textContent='Dados antigos preservados separadamente. Eles não serão enviados à conta.';const button=document.createElement('button');button.type='button';button.textContent='Exportar dados antigos';button.addEventListener('click',()=>{try{const url=URL.createObjectURL(new Blob([exportLegacyArchive()],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='routeflow-dados-antigos.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}catch(e){setMessage(e.message,true)}});legacy.appendChild(button)}
 $('accountPanel').appendChild(legacy);
 const syncState=document.createElement('p');syncState.className='account-message';$('accountPanel').appendChild(syncState);
 const renderSync=()=>{const pending=Object.values(readData('routeOutbox',{}));const blocked=pending.find(item=>item.blocked);syncState.textContent=blocked?`Sincronização de rota precisa de atenção: ${blocked.error}`:pending.length?`${pending.length} rota(s) aguardando sincronização${hasSession()?'.':' no modo local.'}`:''};
 window.addEventListener('routeflow:route-sync-state',renderSync);window.addEventListener('routeflow:session-changed',renderSync);renderSync();
 $('accountToggle').addEventListener('click',()=>{$('accountPanel').hidden=!$('accountPanel').hidden});$('accountClose').addEventListener('click',()=>{$('accountPanel').hidden=true});
 $('saveApi').addEventListener('click',()=>{try{setApiBase($('apiUrl').value.trim());render();setMessage('API configurada.')}catch(e){setMessage(e.message,true)}});
 $('createAccount').addEventListener('click',()=>submit('register'));$('loginAccount').addEventListener('click',()=>submit('login'));
 $('subscriberOpen').addEventListener('click',()=>{openSubscriberPortal();$('accountPanel').hidden=true});$('adminOpen').addEventListener('click',()=>{openAdminUI();$('accountPanel').hidden=true});
 $('logoutAccount').addEventListener('click',()=>{clearSession();render();setMessage('Sessão encerrada. O modo local continua disponível.');});
 window.addEventListener('routeflow:session-changed',()=>{render();$('accountPassword').value='';$('accountEmailInput').value='';$('accountName').value='';setMessage('')});
 render();if(hasSession()&&apiBase()){const scope=captureScope();me().then(async user=>{assertScope(scope);saveSession({token:authToken(),user});render();await syncCloud()}).catch(()=>{if(isCurrentScope(scope)){render();setMessage('Não foi possível validar a sessão.',true)}})}
}
