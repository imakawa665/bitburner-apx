
/** apx-stocks.auto.v1.js
 * WSE/TIX の自動購入（資金と reserve を尊重）。購入後に momentum トレーダを起動。
 * --budget 0.4 --minCash 1e9 などはトレーダへ引き継ぎ。
 */
export async function main(ns){
  ns.disableLog('sleep'); ns.disableLog('getServerMoneyAvailable'); ns.clearLog();
  const F=ns.flags([['budget',0.40],['minCash',1e9],['interval',15000],['log',false]]);
  const log=(...a)=>{ if(F.log) ns.print('[stocks.auto]',...a); };
  const reserve=()=>{ try{ return Math.max(0, Number(ns.read('reserve.txt')||0)); }catch{return 0;} };
  const cash=()=> Math.max(0, ns.getServerMoneyAvailable('home') - reserve());

  function ensureAccounts(){
    let changed=false;
    try{ if(!ns.stock.hasWSEAccount()) { if(cash()>=200000) { ns.stock.purchaseWseAccount(); changed=true; } } }catch{}
    try{ if(!ns.stock.hasTIXAPIAccess()) { if(cash()>=5e9) { ns.stock.purchaseTixApi(); changed=true; } } }catch{}
    // 4S はBN1-1では不要／高額のため購入しない（あとで手動でOK）
    return changed;
  }

  function runningTrader(){ return ns.ps('home').some(p=>p.filename==='tools/apx-stocks.momentum.v1.js'); }

  while(true){
    try{
      const ready = ns.stock?.hasTIXAPIAccess?.() && ns.stock?.hasWSEAccount?.();
      if(!ready){
        const changed = ensureAccounts();
        if(changed) ns.tprint('[stocks.auto] 購入: '+ (ns.stock.hasWSEAccount()?'WSE ':'')+(ns.stock.hasTIXAPIAccess()?'TIX ':''));
      } else {
        if(!runningTrader()){
          ns.run('tools/apx-stocks.momentum.v1.js',1,'--budget',Number(F.budget||0.4),'--minCash',Number(F.minCash||1e9));
          ns.tprint('[stocks.auto] momentum trader 起動');
        }
      }
    }catch{}
    await ns.sleep(Math.max(5000, Number(F.interval)||15000));
  }
}
