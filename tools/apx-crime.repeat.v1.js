/** apx-crime.repeat.v1.js */
export async function main(ns){
  ns.disableLog('sleep');
  const F=ns.flags([['autoPick', true], ['interval', 500], ['log', false]]);
  const log=(...a)=>{ if(F.log) ns.print('[crime]',...a); };
  const doc = eval('document');
  const clickByText = (texts) => {
    const T = Array.isArray(texts)?texts:[texts];
    const els = Array.from(doc.querySelectorAll('button, [role="button"], .MuiButton-root, .MuiSwitch-root, .MuiTab-root, span, div'));
    for(const t of T){
      const tt=(t||'').toLowerCase();
      const el = els.find(e => (e.innerText||'').trim().toLowerCase().includes(tt) && !e.disabled);
      if (el){ el.click(); log('click', t); return true; }
    }
    return false;
  };
  const ensureCrimePage = () => { if (clickByText(['city'])) {} clickByText(['crime', 'commit crime']); };
  const ensureRepeatOn = () => { clickByText(['repeat']); };
  const tryAutoPick = () => { if (clickByText(['homicide'])) return true; if (clickByText(['mug'])) return true; if (clickByText(['shoplift'])) return true; return false; };
  let picked=false; ensureCrimePage(); if (F.autoPick) { picked = tryAutoPick(); } ensureRepeatOn();
  while(true){
    clickByText(['continue','close','ok']);
    ensureRepeatOn();
    clickByText(['commit','attempt']);
    await ns.sleep(Math.max(200, Number(F.interval)));
  }
}
