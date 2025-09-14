
export async function main(ns){
  ns.disableLog('sleep'); ns.disableLog('getServerMoneyAvailable');
  const F=ns.flags([['budget',0.40],['minCash',1e9],['short',5],['long',21],['buffer',0.0015],['interval',1500]]);
  if(!ns.stock?.hasTIXAPIAccess?.()){ ns.tprint('[stocks] TIX API がありません'); return; }
  const syms=ns.stock.getSymbols(); const hist=Object.fromEntries(syms.map(s=>[s,[]]));
  function reserve(){ try{ return Math.max(0, Number(ns.read('reserve.txt')||0)); }catch{return 0;} }
  function cash(){ return Math.max(0, ns.getServerMoneyAvailable('home') - reserve()); }
  function sma(a,n){ if(a.length<n) return null; const s=a.slice(-n).reduce((x,y)=>x+y,0); return s/n; }
  while(true){
    try{
      for(const s of syms){
        const p=ns.stock.getPrice(s);
        const a=hist[s]; a.push(p); if(a.length>Math.max(F.long, F.short)) a.shift();
        const S=sma(a,Number(F.short)||5), L=sma(a,Number(F.long)||21);
        if(S==null||L==null) continue;
        const [have,avg] = ns.stock.getPosition(s);
        const up = S>(L*(1+Number(F.buffer)||0.0015));
        if(up){
          const budget=cash()*Number(F.budget||0.40);
          const max=ns.stock.getMaxShares(s);
          const price=ns.stock.getAskPrice(s);
          const can=Math.max(0, Math.min(max-have, Math.floor(budget/price)));
          if(can>0) ns.stock.buyStock(s, can);
        } else if(have>0){
          ns.stock.sellStock(s, have);
        }
      }
    }catch{}
    await ns.sleep(Math.max(500, Number(F.interval)||1500));
  }
}