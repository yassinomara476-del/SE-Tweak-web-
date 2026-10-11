const CFG = window.SE_TWEAKER_CONFIG || {};
const langButton = document.getElementById('langButton');
let language = document.documentElement.lang === 'ar' ? 'ar' : 'en';
function setLanguage(next) {
  language = next;
  document.documentElement.lang = next;
  document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-en][data-ar]').forEach(el => { el.innerHTML = el.dataset[next]; });
  if (langButton) langButton.textContent = next === 'en' ? 'العربية' : 'English';
}
langButton?.addEventListener('click', () => setLanguage(language === 'en' ? 'ar' : 'en'));

let toastTimer;
function toast(message, kind = 'info') {
  let el = document.getElementById('siteToast');
  if (!el) { el = document.createElement('div'); el.id = 'siteToast'; el.className = 'site-toast'; el.setAttribute('role','status'); el.setAttribute('aria-live','polite'); document.body.appendChild(el); }
  el.dataset.kind = kind; el.textContent = message; el.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 5200);
}
function isSafeInvite(value) {
  try { const u = new URL(value); return u.protocol === 'https:' && (u.hostname === 'discord.gg' || u.hostname === 'discord.com' || u.hostname === 'www.discord.com') && (u.hostname !== 'discord.com' || u.pathname.startsWith('/invite/')); } catch { return false; }
}
document.querySelectorAll('[data-discord-link]').forEach(link => {
  if (isSafeInvite(CFG.discordInvite || '')) { link.href = CFG.discordInvite; link.target = '_blank'; link.rel = 'noopener noreferrer'; }
  else { link.href = '#contact'; link.addEventListener('click', event => { event.preventDefault(); toast('The official Discord invite has not been configured yet. The site owner must add it in config.js before launch.', 'warning'); }); }
});
document.querySelectorAll('[data-free-download]').forEach(link => {
  if (typeof CFG.freeToolsDownloadUrl === 'string' && CFG.freeToolsDownloadUrl.startsWith('https://')) { link.href = CFG.freeToolsDownloadUrl; link.target='_blank'; link.rel='noopener noreferrer'; }
  else { link.href='#contact'; link.addEventListener('click', event => { event.preventDefault(); toast('The separate Free Tools build is not published yet. Contact the administrator for availability.', 'info'); }); }
});
document.querySelectorAll('[data-pro-download]').forEach(link => {
  if (typeof CFG.proDownloadUrl === 'string' && CFG.proDownloadUrl.startsWith('https://')) { link.href = CFG.proDownloadUrl; link.target='_blank'; link.rel='noopener noreferrer'; }
  else { link.href='#contact'; link.addEventListener('click', event => { event.preventDefault(); toast('PRO installers are delivered privately by the administrator after purchase.', 'info'); }); }
});

// Optional analytics is sent only after an explicit consent choice.
const consentKey = 'se-tweaker-site-analytics-consent-v1';
const visitorKey = 'se-tweaker-browser-token-v1';
const banner = document.getElementById('privacyBanner');
function getVisitorToken() {
  try { let value = localStorage.getItem(visitorKey); if (!value) { value = crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0;return(c==='x'?r:(r&3|8)).toString(16);}); localStorage.setItem(visitorKey,value); } return value; } catch { return ''; }
}
async function recordConsentedVisit() {
  try {
    if (localStorage.getItem(consentKey) !== 'yes' || sessionStorage.getItem('se-tweaker-visit-recorded')) return;
    const visitor = getVisitorToken(); if (!visitor) return;
    sessionStorage.setItem('se-tweaker-visit-recorded','yes');
    const url = 'https://dbxmjfvbdzygbewkcelz.supabase.co/functions/v1/se-license';
    const key = 'sb_publishable_FHP1sDrjDJwtralj8ahYGA_WPO6V5TT';
    await fetch(url,{method:'POST',headers:{apikey:key,'Content-Type':'application/json'},body:JSON.stringify({action:'web_visit',consent:true,visitor_id:visitor,path:location.pathname||'/',referrer:document.referrer||''}),keepalive:true,mode:'cors'});
  } catch { /* Analytics failure must never prevent use of the public site. */ }
}
function hideConsentBanner(){ banner?.classList.add('hidden'); }
if (banner) { try { if (!localStorage.getItem(consentKey)) banner.classList.remove('hidden'); } catch {} }
document.getElementById('acceptAnalytics')?.addEventListener('click',async()=>{try{localStorage.setItem(consentKey,'yes');}catch{}hideConsentBanner();await recordConsentedVisit();});
document.getElementById('rejectAnalytics')?.addEventListener('click',()=>{try{localStorage.setItem(consentKey,'no');}catch{}hideConsentBanner();});
try { if (localStorage.getItem(consentKey)==='yes') recordConsentedVisit(); } catch {}
