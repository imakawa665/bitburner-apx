/** tools/apx-oneclick.lily.js (v1.8)
 * - 追加: --autopilot / profile=autofull で「全自動オーケストレーター」を起動
 */
export async function main(ns) {
  ns.disableLog('sleep'); ns.disableLog('run'); ns.disableLog('getServerMaxRam'); ns.disableLog('getServerUsedRam'); ns.clearLog();
  const F = ns.flags([
    ['profile',''], ['autopilot', false],
    ['rooter', true], ['hud', true], ['micro', true], ['pserv', true], ['hacknet', true], ['share', true],
    ['spread', false], ['backdoor', true], ['advice', true], ['daemon', true], ['hash', true],
    ['crimeLoop', false], ['crimeAutoPick', true],
    ['factionAssist', true], ['stanekCharge', false],
    ['pservBudget', 0.3], ['pservMin', 8], ['pservMax', 8192],
    ['sharePct', 0.25],
    ['withBatcher', false], ['target', ''], ['hackPct', 0.03], ['gap', 200], ['lanes', 1],
    // darkweb buyer flags
    ['darkweb', true], ['dwMode','ports'], ['dwQol', false],
    ['dwSafety', 1.0], ['dwMethod','auto'], ['dwInterval', 1500],
    ['log', true],
  ]);
  const print=(...a)=>{ if(F.log) ns.print('[oneclick]',...a); };
  const isAny=(f)=> ns.ps('home').some(p=>p.filename===f);
  const exists=(f)=>ns.fileExists(f,'home');
  const runOnce=(f,th=1,...args)=>{ if(!exists(f)){ ns.print(`[oneclick] missing: ${f}`); return 0;} if(isAny(f)) return 1; const pid=ns.run(f,th,...args); if(pid===0) ns.tprint(`[oneclick] failed: ${f}`); else print('start',f,'pid',pid,'args',JSON.stringify(args)); return pid?1:0; };

  const pf=String(F.profile||'').toLowerCase();
  if (pf==='autofull') F.autopilot=true;

  if (F.autopilot) {
    // 全自動：オーケストレーターに委譲
    runOnce('tools/apx-autopilot.full.v1.js',1,'--interval',5000,'--goal',1e9,'--uiLock','/Temp/apx.ui.lock.txt','--crimeAuto',false);
    ns.tprint(`[oneclick] 起動: autopilot (v1.8)`);
    return;
  }

  // 既存の従来モード（省略）: 以前のv1.7相当の処理を簡略化
  ns.tprint('[oneclick] v1.8: 従来モード起動（必要なら --autopilot 推奨）');
  // 主要サービスだけ起動
  if (F.rooter) runOnce('rooter/apx-rooter.auto.v1.js', 1, '--interval', 10000, '--log');
  if (F.hud) runOnce('tools/apx-hud.lily.v1.js');
  if (F.micro) runOnce('core/apx-core.micro.v2.09.js', 1, '--allRooted', 'true', '--reserveRamPct', 0.1, '--log', 'true');
  if (F.pserv) runOnce('tools/apx-pserv.auto.v1.js', 1, '--budget', F.pservBudget, '--minRam', F.pservMin, '--maxRam', F.pservMax, '--log', 'true');
  if (F.hacknet) runOnce('tools/apx-hacknet.nano.v1.js', 1, '--budget', 0.2, '--maxROI', 3600, '--log', 'true');
  if (F.share) { await ns.sleep(200); const file='tools/apx-share.nano.v1.js'; if (exists(file) && !isAny(file)) { let cost=ns.getScriptRam(file,'home')||1.6; const max=ns.getServerMaxRam('home'), used=ns.getServerUsedRam('home'); const free=Math.max(0,max-used); let th=Math.floor((free*Math.min(Math.max(0,Number(F.sharePct)),0.9))/cost); th=Math.max(0,th); if(th>=1) runOnce(file,th); else print('share: 空きRAM不足'); } }
  if (F.backdoor) runOnce('tools/apx-backdoor.guide.v1.js', 1, '--watch', 3000);
  if (F.hash) runOnce('tools/apx-hash.spender.v1.js', 1, '--threshold', 0.9, '--mode', 'money');
  if (F.factionAssist) runOnce('tools/apx-faction.join.assist.v1.js', 1);
  ns.tprint(`[oneclick] 従来モード完了`);
}
