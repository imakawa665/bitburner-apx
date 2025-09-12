/** apx-faction.join.assist.v1.js */
export async function main(ns){
  ns.disableLog('sleep');
  const F=ns.flags([['interval',600],['log',false]]);
  const log=(...a)=>{ if(F.log) ns.print('[faction]',...a); };
  const doc = eval('document');
  const clickByText=(texts)=>{ const T=Array.isArray(texts)?texts:[texts]; const els=Array.from(doc.querySelectorAll('button,[role="button"],.MuiButton-root,span,div'));
    for(const t of T){ const tt=String(t||'').toLowerCase(); const el=els.find(e=>(e.innerText||'').trim().toLowerCase().includes(tt) && !e.disabled); if(el){ el.click(); log('click',t); return true; } } return false; };
  while(true){
    clickByText(['faction invitation','invitation']);
    if (clickByText(['accept','join'])) { log('accepted'); }
    clickByText(['ok','close']);
    await ns.sleep(Math.max(200, Number(F.interval)));
  }
}
