
export async function main(ns){
  ns.disableLog('sleep'); ns.disableLog('run'); ns.clearLog();
  const F = ns.flags([['profile',''], ['reserve', null], ['allowDom', false], ['stocks', true]]);
  if (F.reserve!=null){ ns.write('reserve.txt', String(Math.max(0,Number(F.reserve)||0)), 'w'); ns.tprint(`[oneclick] reserve=${ns.formatMoney(Math.max(0,Number(F.reserve)||0))}`); }
  const pf=String(F.profile||'').toLowerCase(); const domFlag = F.allowDom ? ['--noDom','false'] : ['--noDom','true'];
  if (pf==='rep'){ ns.run('tools/apx-autopilot.full.v1.js',1,'--interval',900,'--repMode','true','--stocks',String(Boolean(F.stocks)),...domFlag); ns.tprint(`[oneclick] REPモード (stocks=${F.stocks})`); return; }
  if (pf==='autofull'){ ns.run('tools/apx-autopilot.full.v1.js',1,'--interval',1000,'--stocks',String(Boolean(F.stocks)), ...domFlag); ns.tprint(`[oneclick] AUTOFULL (stocks=${F.stocks})`); return; }
  ns.tprint(`[oneclick] 例: --profile rep | --profile autofull  （--reserve 5e8） ／ DOMを許可: --allowDom ／ 株ON/OFF: --stocks true|false`);
}
