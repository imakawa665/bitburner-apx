/** tools/apx-oneclick.lily.js (v1.3) */
export async function main(ns) {
  ns.disableLog('sleep'); ns.disableLog('run'); ns.disableLog('getServerMaxRam'); ns.disableLog('getServerUsedRam'); ns.clearLog();
  const F = ns.flags([
    ['rooter', true], ['hud', true], ['micro', true], ['pserv', true], ['hacknet', true], ['share', true],
    ['spread', false], ['backdoor', true], ['advice', true], ['daemon', true],
    ['pservBudget', 0.3], ['pservMin', 8], ['pservMax', 8192],
    ['sharePct', 0.25],
    ['withBatcher', false], ['target', ''], ['hackPct', 0.03], ['gap', 200],
    ['log', true],
  ]);
  const print=(...a)=>{ if(F.log) ns.print('[oneclick]',...a); };
  const exists=(f)=>ns.fileExists(f,'home'); const is=(f)=>ns.isRunning(f,'home'); const runOnce=(f,th=1,...args)=>{ if(!exists(f)){ ns.tprint(`[oneclick] missing: ${f}`); return 0;} if(is(f)) return 1; const pid=ns.run(f,th,...args); if(pid===0) ns.tprint(`[oneclick] failed: ${f}`); else print('start',f,'pid',pid,'args',JSON.stringify(args)); return pid?1:0; };

  if (F.advice) runOnce('tools/apx-prog.advice.v1.js');
  if (F.rooter) runOnce('rooter/apx-rooter.auto.v1.js', 1, '--interval', 10000, '--log');
  if (F.hud) runOnce('tools/apx-hud.lily.v1.js');
  if (F.micro) runOnce('core/apx-core.micro.v2.09.js', 1, '--allRooted', 'true', '--log', 'true');
  if (F.pserv) runOnce('tools/apx-pserv.auto.v1.js', 1, '--budget', F.pservBudget, '--minRam', F.pservMin, '--maxRam', F.pservMax, '--log', 'true');
  if (F.hacknet) runOnce('tools/apx-hacknet.nano.v1.js', 1, '--budget', 0.2, '--maxROI', 3600, '--log', 'true');

  if (F.withBatcher) { const args=[]; if(F.target) args.push('--target',String(F.target)); args.push('--hackPct',Number(F.hackPct),'--gap',Number(F.gap),'--log','true'); runOnce('tools/apx-hgw-batcher.v1.js',1,...args); }
  if (F.spread) { const args=[]; if(F.target) args.push('--target',String(F.target)); runOnce('tools/apx-spread.remote.v1.js',1,...args); }
  if (F.share) { await ns.sleep(200); const file='tools/apx-share.nano.v1.js'; if (exists(file) && !is(file)) { let cost=ns.getScriptRam(file,'home')||1.6; const max=ns.getServerMaxRam('home'), used=ns.getServerUsedRam('home'); const free=Math.max(0,max-used); let th=Math.floor((free*Math.min(Math.max(0,Number(F.sharePct)),0.9))/cost); th=Math.max(0,th); if(th>=1) runOnce(file,th); else print('share: 空きRAM不足'); } }
  if (F.backdoor) runOnce('tools/apx-backdoor.guide.v1.js', 1, '--watch', 2000);
  if (F.daemon) runOnce('tools/apx-daemon.autoadapt.v1.js', 1, '--interval', 5000, '--log', 'true');

  ns.tprint(`[oneclick] 起動完了: HUD=${F.hud} rooter=${F.rooter} micro=${F.micro} pserv=${F.pserv} hacknet=${F.hacknet} share=${F.share} spread=${F.spread} batcher=${F.withBatcher} daemon=${F.daemon}`);
}
