
export async function main(ns){
  ns.disableLog('sleep'); ns.disableLog('run'); ns.clearLog();
  const F = ns.flags([['profile',''], ['reserve', null], ['allowDom', false]]);
  const mark='/Temp/apx.mode.rep'; const set=(on)=>{ try{ if(on) ns.write(mark,'1','w'); else if(ns.fileExists(mark,'home')) ns.rm(mark,'home'); }catch{} };
  if (F.reserve!=null){ ns.write('reserve.txt', String(Math.max(0,Number(F.reserve)||0)), 'w'); ns.tprint(`[oneclick] reserve=${ns.formatMoney(Math.max(0,Number(F.reserve)||0))}`); }
  const pf=String(F.profile||'').toLowerCase(); const domFlag = F.allowDom ? ['--noDom','false'] : ['--noDom','true'];
  if (pf==='rep'){ set(true); ns.run('tools/apx-autopilot.full.v1.js',1,'--interval',900,'--repMode','true',...domFlag); ns.tprint(`[oneclick] REPモード (noDOM=${!F.allowDom})`); return; }
  if (pf==='autofull'){ set(false); ns.run('tools/apx-autopilot.full.v1.js',1,'--interval',1000, ...domFlag); ns.tprint(`[oneclick] AUTOFULL (noDOM=${!F.allowDom})`); return; }
  ns.tprint(`[oneclick] 例: --profile rep | --profile autofull  （--reserve 5e8） ／ DOMを許可: --allowDom`);
}
