/** apx-loop-hgw.nano.js (v1.1) */
export async function main(ns) {
  ns.disableLog('sleep');
  const F=ns.flags([['target','n00dles'],['secPad',0.5],['moneyThr',0.95],['sleep',500],['log',false]]);
  const log=(...a)=>{ if(F.log) ns.print('[loop]',...a); };
  const t=String(F.target);
  log('start target=',t,'secPad=',F.secPad,'thr=',F.moneyThr);
  while(true){
    const min=ns.getServerMinSecurityLevel(t), sec=ns.getServerSecurityLevel(t), max=ns.getServerMaxMoney(t), cur=ns.getServerMoneyAvailable(t);
    if(sec>min+F.secPad){ log('weaken',sec,'>',min+F.secPad); await ns.weaken(t); }
    else if(max>0&&cur<max*F.moneyThr){ log('grow',cur,'/',max); await ns.grow(t); }
    else { log('hack'); await ns.hack(t); }
    await ns.sleep(F.sleep);
  }
}
