
export async function main(ns){
  ns.disableLog('sleep'); ns.disableLog('getServerMoneyAvailable'); ns.clearLog();
  const F=ns.flags([['budget',0.40],['minCash',1e9],['short',5],['long',21],['buffer',0.0015],['interval',1200],['log',false]]);
  const log=(...a)=>{ if(F.log) ns.print('[stocks]',...a); };
  if(!ns.stock?.hasTIXAPIAccess?.()){ ns.tprint('[stocks] TIX API なし'); return; }
  const syms = ns.stock.getSymbols(); const hist=Object.fromEntries(syms.map(s=>[s,[]]));
  const reserve=()=>{ try{ return Math.max(0, Number(ns.read('reserve.txt')||0)); }catch{return 0;} };
  const pos=(s)=> ns.stock.getPosition(s); // [shares, avgPrice, sharesShort, avgShort]
  const sma=(arr,n)=>{ const a=arr.slice(-n); if(a.length<n) return null; return a.reduce((x,y)=>x+y,0)/n; };
  const buy=(s,cash)=>{ const max=ns.stock.getMaxShares(s)-pos(s)[0]; if(max<=0) return 0; const price=ns.stock.getPrice(s); const shares=Math.min(max, Math.floor(cash/price)); if(shares>0) ns.stock.buyStock(s,shares); return shares; };
  const sellAll=(s)=>{ const have=pos(s)[0]; if(have>0) ns.stock.sellStock(s, have); };
  while(true){
    const free=Math.max(0, ns.getServerMoneyAvailable('home') - reserve());
    const cap = free * Math.max(0, Number(F.budget)||0.4);
    const per = cap / syms.length;
    for(const s of syms){
      const p=ns.stock.getPrice(s); const a=hist[s]; a.push(p); if(a.length>120) a.shift();
      const S=sma(a, Number(F.short)||5), L=sma(a, Number(F.long)||21); if(S==null||L==null) continue;
      const [sh] = pos(s);
      const up = S > L*(1+Number(F.buffer)||0.0015);
      const down = S < L*(1-Number(F.buffer)||0.0015);
      if(sh===0 && up && free >= Number(F.minCash||1e9)){ const bought = buy(s, per); if(bought>0) log('BUY',s,'x'+bought); }
      else if(sh>0 && down){ sellAll(s); log('SELL', s); }
    }
    await ns.sleep(Math.max(200, Number(F.interval)||1200));
  }
}
