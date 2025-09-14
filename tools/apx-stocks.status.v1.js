
/** 保有状況の要約を表示 */
export async function main(ns){
  if(!ns.stock.hasTIXAPIAccess?.()){ ns.tprint('[stocks.status] TIX APIがありません'); return; }
  let total=0, inv=0;
  for(const s of ns.stock.getSymbols()){
    const p=ns.stock.getPrice(s); const [sh,avg]=ns.stock.getPosition(s);
    if(sh>0){ const val=p*sh; const pl=ns.stock.getSaleGain(s, sh, 'Long') - avg*sh; total+=pl; inv+=val; ns.tprint(`${s.padEnd(5)} sh=${String(sh).padStart(6)} val=${ns.formatMoney(val)} P/L=${ns.formatMoney(pl)}`); }
  }
  ns.tprint(`[stocks.status] 投資額(時価)=${ns.formatMoney(inv)} 累計P/L(概算)=${ns.formatMoney(total)}`);
}
