
/** 全銘柄をクローズして現金化（TIX必須）。 */
export async function main(ns){
  if(!ns.stock.hasTIXAPIAccess?.()){ ns.tprint('[stocks.close] TIX APIがありません'); return; }
  for(const s of ns.stock.getSymbols()){
    const [sh] = ns.stock.getPosition(s);
    if(sh>0) ns.stock.sellStock(s, sh);
  }
  ns.tprint('[stocks.close] 全ポジションをクローズしました。');
}
