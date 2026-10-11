const SUPABASE_URL = 'https://dbxmjfvbdzygbewkcelz.supabase.co';
const PUBLISHABLE_KEY = 'sb_publishable_FHP1sDrjDJwtralj8ahYGA_WPO6V5TT';
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/se-license`;
let accessToken = sessionStorage.getItem('se_admin_access_token') || '';
let licenses = [];
let logs = [];
let siteVisits = [];
const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function message(id, text, type='') { const el=$(id); el.textContent=text; el.className=`message ${type}`.trim(); }
function status(text, ok=false) { $('statusText').textContent=text; $('statusDot').style.background=ok?'#38dca5':'#71809e'; }
function showAdmin(show) { $('loginPane').classList.toggle('hidden',show); $('adminPane').classList.toggle('hidden',!show); $('logoutButton').classList.toggle('hidden',!show); }
async function authRequest(path, body, token='') {
  const headers={'apikey':PUBLISHABLE_KEY,'Content-Type':'application/json'};
  if(token) headers.Authorization=`Bearer ${token}`;
  const res=await fetch(`${SUPABASE_URL}${path}`,{method:'POST',headers,body:JSON.stringify(body)});
  const data=await res.json().catch(()=>({msg:'Unexpected server response'}));
  if(!res.ok) throw new Error(data.msg||data.message||data.error_description||data.error||`Request failed (${res.status})`);
  return data;
}
async function api(payload) {
  if(!accessToken) throw new Error('Please sign in again.');
  const res=await fetch(FUNCTION_URL,{method:'POST',headers:{'apikey':PUBLISHABLE_KEY,'Authorization':`Bearer ${accessToken}`,'Content-Type':'application/json'},body:JSON.stringify(payload)});
  const data=await res.json().catch(()=>({error:'invalid_response'}));
  if(!res.ok||!data.ok){ if(res.status===401 || data.error==='admin_auth_required') { status('Admin access denied'); throw new Error('Server rejected admin privileges. Set app_metadata.role to admin for the owner account in Supabase Auth, then sign in again.'); } throw new Error(errorText(data.error||`HTTP ${res.status}`)); }
  return data;
}
function errorText(error){const map={invalid_license:'License key not found.',invalid_plan:'Choose a supported plan.',invalid_release:'Version and a valid HTTPS download URL are required.',server_error:'Server operation failed. Check function/database logs.',updates_not_covered:'Updates are not covered by this license.'};return map[error]||String(error||'Request failed');}
$('loginForm').addEventListener('submit',async e=>{
  e.preventDefault(); message('loginMessage','Signing in…');
  try{
    const data=await authRequest('/auth/v1/token?grant_type=password',{email:$('email').value.trim(),password:$('password').value});
    accessToken=data.access_token; sessionStorage.setItem('se_admin_access_token',accessToken);
    await api({action:'admin_list_licenses'}); showAdmin(true); status(`Signed in: ${$('email').value.trim()}`,true); await refreshAll(); message('loginMessage','');
  }catch(err){accessToken='';sessionStorage.removeItem('se_admin_access_token');showAdmin(false);status('Sign-in failed');message('loginMessage',err.message,'error');}
});
$('logoutButton').addEventListener('click',async()=>{try{await authRequest('/auth/v1/logout',{},accessToken)}catch{}accessToken='';sessionStorage.removeItem('se_admin_access_token');showAdmin(false);status('Signed out');});
$('refreshButton').addEventListener('click',refreshAll);
async function refreshAll(){
  try{
    const [licenseData,logData,visitData]=await Promise.all([api({action:'admin_list_licenses'}),api({action:'admin_list_logs'}),api({action:'admin_list_site_visits'})]);
    licenses=licenseData.licenses||[];logs=logData.logs||[];siteVisits=visitData.visits||[];
    $('metricTotal').textContent=licenses.length;
    $('metricActive').textContent=licenses.filter(l=>!l.revoked&&(l.lifetime||!l.expires_at||new Date(l.expires_at)>new Date())).length;
    $('metricBound').textContent=licenses.filter(l=>l.device_fingerprint).length;
    $('metricUpdates').textContent=licenses.filter(l=>l.updates_until&&new Date(l.updates_until)>new Date()).length;
    $('metricVisits').textContent=siteVisits.length;
    renderLicenses();renderLogs();renderVisits();status('Admin data refreshed',true);
  }catch(err){status('Data refresh failed');message('loginMessage',err.message,'error');}
}
function fmtDate(value){if(!value)return '—';const d=new Date(value);return Number.isNaN(d.getTime())?'—':d.toLocaleString();}
function lastEvent(licenseId){return logs.find(l=>l.license_id===licenseId);}
function renderLicenses(){
 const filter=$('filterBox').value.toLowerCase();
 const found=licenses.filter(l=>[l.key,l.issued_to,l.customer_email,l.certificate_id,l.plan].join(' ').toLowerCase().includes(filter));
 $('licensesBody').innerHTML=found.length?found.map(l=>{
   const log=lastEvent(l.id); const expired=!l.lifetime&&l.expires_at&&new Date(l.expires_at)<new Date();
   const state=l.revoked?'<span class="badge red">Revoked</span>':expired?'<span class="badge gold">Expired</span>':'<span class="badge">Active</span>';
   const device=l.device_fingerprint?`Bound <small>${esc(l.device_fingerprint.slice(0,14))}…</small>`:'Not yet bound';
   const last=log?`${fmtDate(log.created_at)}<small>${esc(log.ip_address||'IP unavailable')} · ${esc(log.event_type)}</small>`:'No activity yet';
   return `<tr><td><b class="license-key">${esc(l.key)}</b><small class="cert">Cert: ${esc(l.certificate_id||'—')}</small><div class="row-actions"><button data-cert="${esc(l.id)}">Print certificate</button><button data-copy="${esc(l.key)}">Copy key</button></div></td><td>${esc(l.plan)}<small>EGP ${esc(l.price)}</small></td><td>${esc(l.issued_to||'—')}<small>${esc(l.customer_email||'')}</small></td><td>${l.lifetime?'Lifetime':fmtDate(l.expires_at)}</td><td>${fmtDate(l.updates_until)}</td><td>${device}<small>Last event: ${last}</small></td><td>${state}<div class="row-actions"><button class="danger" data-revoke="${esc(l.key)}" ${l.revoked?'disabled':''}>Revoke</button><button data-reset="${esc(l.key)}">Reset device</button><button data-grant="${esc(l.key)}">+30d updates</button></div></td></tr>`;
 }).join(''):'<tr><td colspan="7" class="empty">No matching licenses.</td></tr>';
}
function renderLogs(){
 $('logsBody').innerHTML=logs.length?logs.map(log=>{const lic=licenses.find(l=>l.id===log.license_id);return `<tr><td>${fmtDate(log.created_at)}</td><td>${esc(log.event_type)}</td><td><span class="license-key">${esc(lic?.key||log.license_id)}</span><small>${esc(lic?.issued_to||'')}</small></td><td>${esc(log.ip_address||'Unavailable')}</td><td>${esc(log.app_version||'—')}</td><td>${esc((log.device_fingerprint||'—').slice(0,14))}…</td></tr>`;}).join(''):'<tr><td colspan="6" class="empty">No activity has been recorded yet. Activation/launch events are recorded when the app connects.</td></tr>';
}

function renderVisits(){
 $('visitsBody').innerHTML=siteVisits.length?siteVisits.map(v=>`<tr><td>${fmtDate(v.created_at)}</td><td><span class="license-key">${esc((v.visitor_id||'—').slice(0,16))}…</span></td><td>${esc(v.ip_address||'Unavailable')}</td><td>${esc(v.path||'/')}</td><td>${esc(v.referrer||'Direct / not supplied')}</td><td><small>${esc(v.user_agent||'—')}</small></td></tr>`).join(''):'<tr><td colspan="6" class="empty">No consented website visits have been recorded. Visitors who reject analytics are not logged.</td></tr>';
}

$('filterBox').addEventListener('input',renderLicenses);
$('licensesBody').addEventListener('click',async e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.copy){try{await navigator.clipboard.writeText(b.dataset.copy);b.textContent='Copied';}catch{window.prompt('Copy license key',b.dataset.copy);}return;}
 if(b.dataset.cert){const l=licenses.find(x=>x.id===b.dataset.cert);if(l)printCertificate(l);return;}
 if(b.dataset.revoke){if(!confirm(`Revoke ${b.dataset.revoke}? This disables PRO access at the next server validation.`))return;try{await api({action:'admin_revoke',license_key:b.dataset.revoke});await refreshAll();}catch(err){alert(err.message);}return;}
 if(b.dataset.reset){if(!confirm(`Reset device binding for ${b.dataset.reset}? It can then be activated on another computer.`))return;try{await api({action:'admin_reset_device',license_key:b.dataset.reset});await refreshAll();}catch(err){alert(err.message);}return;}
 if(b.dataset.grant){const licenseKey=b.dataset.grant;if(!confirm(`Grant 30 additional days of updates to ${licenseKey}?`))return;try{const d=await api({action:'admin_grant_updates',license_key:licenseKey,days:30});alert(`Updates covered through ${fmtDate(d.updates_until)}`);await refreshAll();}catch(err){alert(err.message);}}
});
function printCertificate(l){
 const expiry=l.lifetime?'Lifetime use of licensed current version':fmtDate(l.expires_at);
 const html=`<!doctype html><html><head><meta charset="utf-8"><title>SE Tweaker License Certificate</title><style>body{font:16px/1.6 Arial,sans-serif;margin:50px;color:#172033}.box{border:3px solid #6336c9;padding:38px;max-width:760px;margin:auto}.brand{font-size:18px;letter-spacing:4px;color:#6336c9;font-weight:900}.code{font:20px monospace;word-break:break-all;background:#f1f1f8;padding:12px}.muted{color:#5c6880;font-size:12px}.footer{margin-top:50px;border-top:1px solid #bbb;padding-top:15px;font-size:12px}</style></head><body><div class="box"><div class="brand">SE TWEAKER</div><h1>License Certificate</h1><p>This certificate records a SE Tweaker license issued by the product administrator. It is not a hardware/software code-signing certificate.</p><h3>License Key</h3><div class="code">${esc(l.key)}</div><p><b>Certificate ID:</b> ${esc(l.certificate_id||'—')}</p><p><b>Issued to:</b> ${esc(l.issued_to||'Customer')}</p><p><b>Plan:</b> ${esc(l.plan)} — EGP ${esc(l.price)}</p><p><b>Use license:</b> ${esc(expiry)}</p><p><b>Updates:</b> ${l.updates_until?'Covered through '+esc(fmtDate(l.updates_until)):'Sold separately'}</p><p><b>Device policy:</b> One device per license.</p><p class="muted">Issued ${esc(fmtDate(l.created_at))}. License remains subject to the service terms and can be revoked for misuse.</p><div class="footer">SE Tweaker · Developed by Devyater Yassin Mohamed · Verify this certificate ID in the authorized admin system.</div></div><script>window.onload=()=>window.print()<\/script></body></html>`;
 const win=window.open('','_blank','width=900,height=720');if(!win){alert('Allow pop-ups to print the certificate.');return;}win.document.write(html);win.document.close();
}
$('createForm').addEventListener('submit',async e=>{
 e.preventDefault();message('createMessage','Generating key…');$('createdLicense').classList.add('hidden');
 try{const result=await api({action:'admin_create_license',plan:$('plan').value,issued_to:$('issuedTo').value,customer_email:$('customerEmail').value,notes:$('notes').value});const l=result.license;
 $('createdLicense').innerHTML=`<b>License created</b><small>Send this key privately to the customer:</small><code>${esc(l.key)}</code><small>Certificate ID: ${esc(l.certificate_id)}</small><button id="copyNewKey">Copy License Key</button><button id="printNewCert">Print Certificate</button>`;$('createdLicense').classList.remove('hidden');$('copyNewKey').addEventListener('click',()=>navigator.clipboard.writeText(l.key));$('printNewCert').addEventListener('click',()=>printCertificate(l));message('createMessage','Created successfully. Updates are not included by default.','success');$('createForm').reset();await refreshAll();
 }catch(err){message('createMessage',err.message,'error');}
});
$('updatesForm').addEventListener('submit',async e=>{e.preventDefault();message('updatesMessage','Updating entitlement…');try{const r=await api({action:'admin_grant_updates',license_key:$('updatesKey').value,days:Number($('updatesDays').value)});message('updatesMessage',`Updates covered through ${fmtDate(r.updates_until)}.`,'success');await refreshAll();}catch(err){message('updatesMessage',err.message,'error');}});
$('releaseForm').addEventListener('submit',async e=>{e.preventDefault();message('releaseMessage','Publishing release metadata…');try{await api({action:'admin_add_release',version:$('releaseVersion').value,download_url:$('releaseUrl').value,notes:$('releaseNotes').value,mandatory:$('releaseMandatory').checked});message('releaseMessage','Release metadata published. Installer hosting and file signing are separate steps.','success');$('releaseForm').reset();}catch(err){message('releaseMessage',err.message,'error');}});
$('licensesBody').addEventListener('click',()=>{});
async function tryResume(){if(!accessToken)return;showAdmin(true);status('Restoring admin session…');try{await api({action:'admin_list_licenses'});await refreshAll();}catch{accessToken='';sessionStorage.removeItem('se_admin_access_token');showAdmin(false);status('Not signed in');}}
tryResume();
