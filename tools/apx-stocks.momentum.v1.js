
/** apx-stocks.momentum.v1.js
 * BN1-1対応（4S不要）：短期/長期SMAのクロスで売買。ロングのみ（空売りなし）。
 * 既定: 6秒Tickを前提に short=5, long=21, buffer=0.0015
 * --budget 0.4 で (現金 - reserve) * 40% を上限に使用。
 * --minCash 1e9 を下回ると新規購入を抑制（例: 他用途のために現金を残したい）
 * --interval 1200ms でポーリング（スパム抑制）。
 */
export async function main(ns){
  ns.disableLog('sleep'); ns.disableLog('getServerMoneyAvailable'); ns.clearLog();
  const F=ns.flags([['budget',0.40],['minCash',1e9],['short',5],['long',21],['buffer',0.0015],['interval',1200],['log',false]]);
  const log=(...a)=>{ if(F.log) ns.print('[stocks]',...a); };
  if(!ns.stock.hasTIXAPIAccess?.()){ ns.tprint('[stocks] TIX API がありません。先に apx-stocks.auto.v1.js を実行するか、手動で購入してください。'); return; }
  const symbols = ns.stock.getSymbols();
  const hist = Object.fromEntries(symbols.map(s=>[s,[]]));
  const reserve=()=>{ try{ return Math.max(0, Number(ns.read('reserve.txt')||0)); }catch{return 0;} };
  function freeCash(){ return Math.max(0, ns.getServerMoneyAvailable('home') - reserve()); }
  const pos = (s)=> ns.stock.getPosition(s); // [shares, avgPrice, sharesShort, avgShort]
  function sma(arr,n){ const a=arr.slice(-n); if(a.length<n) return null; const sum=a.reduce((x,y)=>x+y,0); return sum/n; }
  function buyMax(s, cash){
    const max=ns.stock.getMaxShares(s)-pos(s)[0];
    if(max<=0) return 0;
    const price=ns.stock.getPrice(s);
    const shares=Math.max(0, Math.floor(cash/price));
    const toBuy=Math.min(max, shares);
    return toBuy>0? ns.stock.buyStock(s,toBuy)||0 : 0;
  }
  function sellAll(s){ const have=pos(s)[0]; if(have>0){ ns.stock.sellStock(s, have); } }
  while(true){
    try{
      const nowCash = freeCash();
      const cap = nowCash * Math.max(0, Number(F.budget)||0);
      const perCap = cap / symbols.length;
      for(const s of symbols){
        const p=ns.stock.getPrice(s);
        const a=hist[s]; a.push(p); if(a.length>120) a.shift();
        const S=sma(a, Number(F.short)||5), L=sma(a, Number(F.long)||21);
        if(S==null||L==null) continue;
        const [sh, avg] = pos(s);
        const up = S > L*(1+Number(F.buffer)||0.0015);
        const down = S < L*(1-Number(F.buffer)||0.0015);
        if(sh===0 && up && nowCash >= Number(F.minCash||1e9)){
          const bought = buyMax(s, perCap);
          if(bought>0) log('BUY', s, 'x'+bought);
        } else if(sh>0 && down){
          sellAll(s); log('SELL', s);
        }
      }
    }catch(e){ ns.print(String(e)); }
    await ns.sleep(Math.max(200, Number(F.interval)||1200));
  }
}
