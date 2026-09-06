import{apiBase,setApiBase,authUser,hasSession,saveSession,clearSession,register,login,me}from'./api.js';

const $=id=>document.getElementById(id);
function setMessage(text,error=false){const el=$('accountMessage');if(!el)return;el.textContent=text||'';el.classList.toggle('error',error)}
function render(){const user=authUser(),signed=hasSession();$('accountGuest').hidden=signed;$('accountSigned').hidden=!signed;if(signed){$('accountUser').textContent=user?.name||user?.email||'Usuário';$('accountEmail').textContent=user?.email||''}const configured=apiBase();$('apiUrl').value=configured;$('apiState').textContent=configured?'API configurada':'Modo local';}
async function submit(mode){const email=$('accountEmailInput').value.trim(),password=$('accountPassword').value,name=$('accountName').value.trim();if(!email||!password)return setMessage('Informe e-mail e senha.',true);setMessage(mode==='register'?'Criando conta…':'Entrando…');try{const data=mode==='register'?await register({name:name||undefined,email,password}):await login({email,password});saveSession(data);render();setMessage('Conta conectada.')}catch(e){setMessage(e.message,true)}}
export function initAuthUI(){
  $('saveApi').addEventListener('click',()=>{const value=$('apiUrl').value.trim();if(!value)return setMessage('Informe o endereço HTTPS da API.',true);setApiBase(value);render();setMessage('API configurada.');});
  $('createAccount').addEventListener('click',()=>submit('register'));
  $('loginAccount').addEventListener('click',()=>submit('login'));
  $('logoutAccount').addEventListener('click',()=>{clearSession();render();setMessage('Sessão encerrada. O modo local continua disponível.');});
  render();
  if(hasSession()&&apiBase())me().then(user=>{saveSession({token:localStorage.getItem('routeflow.authToken.v1'),user});render()}).catch(()=>{render();setMessage('A sessão precisa ser renovada.',true)});
}
