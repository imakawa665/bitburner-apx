
export async function main(ns){
  ns.disableLog('sleep'); ns.disableLog('run'); ns.clearLog();

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

  const F = ns.flags([['profile',''], ['reserve', null], ['allowDom', false], ['stocks', true]]);
  if (F.reserve!=null){ const val=Math.max(0,Number(F.reserve)||0); ns.write('reserve.txt', String(val), 'w'); ns.tprint(`[oneclick] reserve=${apxFmtMoney(ns,val)}`); }
  const pf=String(F.profile||'').toLowerCase(); const domFlag = F.allowDom ? ['--noDom','false'] : ['--noDom','true'];
  if (pf==='rep'){ ns.run('tools/apx-autopilot.full.v1.js',1,'--interval',900,'--repMode','true','--stocks',String(Boolean(F.stocks)),...domFlag); ns.tprint(`[oneclick] REPモード (stocks=${F.stocks})`); return; }
  if (pf==='autofull' || pf===''){ ns.run('tools/apx-autopilot.full.v1.js',1,'--interval',1000,'--stocks',String(Boolean(F.stocks)), ...domFlag); ns.tprint(`[oneclick] AUTOFULL (stocks=${F.stocks})`); return; }
  ns.tprint(`[oneclick] 例: --profile rep | --profile autofull  （--reserve 5e8） ／ DOMを許可: --allowDom ／ 株ON/OFF: --stocks true|false`);
}
