
export async function main(ns){

function apxFmtMoney(ns, x){
  try { if (typeof ns.formatMoney === 'function') return ns.formatMoney(x); } catch {}
  try { if (typeof ns.nFormat === 'function') return ns.nFormat(x, "$0.000a"); } catch {}
  try { return '$' + Math.round(Number(x)||0).toLocaleString(); } catch { return String(x); }
}
function apxFmtNumber(ns, x, p=3){
  try { if (typeof ns.formatNumber === 'function') return ns.formatNumber(x, p); } catch {}
  try { if (typeof ns.nFormat === 'function') return ns.nFormat(x, "0."+("0".repeat(Math.max(0,p)))+"a"); } catch {}
  try { return (Number(x)||0).toLocaleString(); } catch { return String(x); }
}
function apxFmtRam(ns, gb){
  try { if (typeof ns.formatRam === 'function') return ns.formatRam(gb); } catch {}
  try { if (typeof ns.nFormat === 'function') return ns.nFormat((Number(gb)||0)*1e9, "0.00b"); } catch {}
  return String(gb)+"GB";
}

  if(!ns.stock?.hasTIXAPIAccess?.()){ ns.tprint('[stocks.status] TIX APIがありません'); return; }
  let total=0, inv=0;
  for(const s of ns.stock.getSymbols()){
    const p=ns.stock.getPrice(s); const [sh,avg]=ns.stock.getPosition(s);
    if(sh>0){ const val=p*sh; const pl=ns.stock.getSaleGain(s, sh, 'Long') - avg*sh; total+=pl; inv+=val; ns.tprint(`${s.padEnd(5)} sh=${String(sh).padStart(6)} val=${apxFmtMoney(ns,val)} P/L=${apxFmtMoney(ns,pl)}`); }
  }
  ns.tprint(`[stocks.status] 投資額(時価)=${apxFmtMoney(ns,inv)} 累計P/L(概算)=${apxFmtMoney(ns,total)}`);
}
