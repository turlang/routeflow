import{renderDeliveryHistory}from'./delivery-history-ui.js';
import{populateRegistryAddresses}from'./registry-ui.js';
import{initPackageProofEnhancer}from'./package-proof.js';
import{initReportingUI,renderReporting}from'./reporting-ui.js';
import{initDeliverySyncStatus,renderDeliverySyncState}from'./sync-status-ui.js';
export function initMobileUI(){const tabs=[...document.querySelectorAll('.mobile-tabs button')],pages=[...document.querySelectorAll('.mobile-page')];function openPage(name){pages.forEach(p=>p.classList.toggle('mobile-active',p.dataset.page===name));tabs.forEach(b=>b.classList.toggle('active',b.dataset.target===name));if(name==='mapa')setTimeout(()=>window.dispatchEvent(new Event('resize')),80);if(name==='historico'){renderDeliveryHistory();renderReporting();renderDeliverySyncState()}if(name==='cadastros')populateRegistryAddresses();window.scrollTo({top:0,behavior:'instant'})}tabs.forEach(b=>b.addEventListener('click',()=>openPage(b.dataset.target)));openPage('resumo');initPackageProofEnhancer();initReportingUI();initDeliverySyncStatus()}
