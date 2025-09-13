/** workers/apx-loop-hgw.nano.js (v1.2) - guarded HGW loop */
export async function main(ns) {
  ns.disableLog('sleep');
  const F=ns.flags([['target','n00dles'],['secPad',0.5],['moneyThr',0.95],['sleep',500],['log',false]]);
  const log=(...a)=>{ if(F.log) ns.print('[loop]',...a); };
  const t=String(F.target);
  while(true){
    if (!ns.serverExists(t)) { log('no such host',t); await ns.sleep(Math.max(200,Number(F.sleep))); continue; }
    if (!ns.hasRootAccess(t)) { log('no root on',t); await ns.sleep(Math.max(400,Number(F.sleep))); continue; }
    const min=ns.getServerMinSecurityLevel(t), sec=ns.getServerSecurityLevel(t), max=ns.getServerMaxMoney(t), cur=ns.getServerMoneyAvailable(t);
    if (!isFinite(max) || max<=0) { log('maxMoney=0',t); await ns.sleep(Math.max(600,Number(F.sleep))); continue; }
    try {
      if(sec>min+F.secPad){ await ns.weaken(t); }
      else if(cur<max*F.moneyThr){ await ns.grow(t); }
      else { await ns.hack(t); }
    } catch { await ns.sleep(Math.max(600,Number(F.sleep))); }
    await ns.sleep(F.sleep);
  }
}
