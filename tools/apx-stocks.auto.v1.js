
export async function main(ns){
  ns.disableLog('sleep'); ns.disableLog('getServerMoneyAvailable'); ns.clearLog();
  const F=ns.flags([['budget',0.40],['minCash',1e9],['interval',15000],['log',false]]);
  const log=(...a)=>{ if(F.log) ns.print('[stocks.auto]',...a); };
  const reserve=()=>{ try{ return Math.max(0, Number(ns.read('reserve.txt')||0)); }catch{return 0;} };
  const cash=()=> Math.max(0, ns.getServerMoneyAvailable('home') - reserve());
  function ensure(){
    let changed=false;
    try{ if(!ns.stock.hasWSEAccount()) { if(cash()>=200000) { ns.stock.purchaseWseAccount(); changed=true; } } }catch{}
    try{ if(!ns.stock.hasTIXAPIAccess()) { if(cash()>=5e9) { ns.stock.purchaseTixApi(); changed=true; } } }catch{}
    return changed;
  }
  function running(){ return ns.ps('home').some(p=>p.filename==='tools/apx-stocks.momentum.v1.js'); }
  while(true){
    try{
      if(!(ns.stock?.hasWSEAccount?.() && ns.stock?.hasTIXAPIAccess?.())){
        const ch=ensure(); if(ch) ns.tprint('[stocks.auto] 購入: '+(ns.stock.hasWSEAccount()?'WSE ':'')+(ns.stock.hasTIXAPIAccess()?'TIX ':''));
      } else {
        if(!running()){
          ns.run('tools/apx-stocks.momentum.v1.js',1,'--budget',Number(F.budget||0.4),'--minCash',Number(F.minCash||1e9));
          ns.tprint('[stocks.auto] momentum 起動');
        }
      }
    }catch{}
    await ns.sleep(Math.max(5000, Number(F.interval)||15000));
  }
}
