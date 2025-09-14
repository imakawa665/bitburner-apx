
export async function main(ns){

  const $m = (v, dp=2) => {
    try {
      if (typeof ns.formatNumber === 'function') return '$' + ns.formatNumber(Number(v)||0, 3, dp);
    } catch {}
    try { return '$' + (Number(v)||0).toLocaleString(undefined, {maximumFractionDigits: dp}); } catch {}
    return '$' + String(v);
  };

  if(!ns.stock?.hasTIXAPIAccess?.()){ ns.tprint('[stocks.status] TIX APIがありません'); return; }
  let total=0, inv=0;
  for(const s of ns.stock.getSymbols()){
    const p=ns.stock.getPrice(s); const [sh,avg]=ns.stock.getPosition(s);
    if(sh>0){ const val=p*sh; const pl=ns.stock.getSaleGain(s, sh, 'Long') - avg*sh; total+=pl; inv+=val; ns.tprint(`${s.padEnd(5)} sh=${String(sh).padStart(6)} val=${$m(val)} P/L=${$m(pl)}`); }
  }
  ns.tprint(`[stocks.status] 投資額(時価)=${ $m(inv) } 累計P/L(概算)=${ $m(total) }`);
}
