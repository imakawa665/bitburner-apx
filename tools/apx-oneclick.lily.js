/** tools/apx-oneclick.lily.js (v1.9.3) */
export async function main(ns){
  ns.disableLog('sleep'); ns.disableLog('run'); ns.clearLog();
  const F = ns.flags([['profile',''], ['reserve', null]]);
  const mark='/Temp/apx.mode.rep';
  const setMark=(on)=>{ try{ if(on) ns.write(mark,'1','w'); else if(ns.fileExists(mark,'home')) ns.rm(mark,'home'); }catch{} };

  if (F.reserve!=null){ ns.write('reserve.txt', String(Math.max(0,Number(F.reserve)||0)), 'w'); ns.tprint(`[oneclick] reserve=${ns.nFormat(Math.max(0,Number(F.reserve)||0),'$0.00a')}`); }

  const pf=String(F.profile||'').toLowerCase();
  if (pf==='rep'){
    setMark(true);
    ns.run('tools/apx-autopilot.full.v1.js',1,'--interval',1000,'--repMode','true','--uiLock','/Temp/apx.ui.lock.txt');
    ns.tprint(`[oneclick] 起動: REPモード (autopilot v1.9.3)`);
    return;
  }
  if (pf==='autofull'){
    setMark(false);
    ns.run('tools/apx-autopilot.full.v1.js',1,'--interval',1100,'--uiLock','/Temp/apx.ui.lock.txt');
    ns.tprint(`[oneclick] 起動: AUTOFULL (autopilot v1.9.3)`);
    return;
  }
  ns.tprint(`[oneclick] 例: --profile rep | --profile autofull  （--reserve 5e8 で初期リザーブ設定も可能）`);
}
