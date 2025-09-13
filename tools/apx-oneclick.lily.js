
/** tools/apx-oneclick.lily.js (v1.7: integrate Dark Web Auto Buyer) */
export async function main(ns) {
  ns.disableLog('sleep'); ns.disableLog('run'); ns.disableLog('getServerMaxRam'); ns.disableLog('getServerUsedRam'); ns.clearLog();
  const F = ns.flags([
    ['profile',''], // lowram | moneypush | reppush | casino | karma | stanek | setup
    // core toggles
    ['rooter', true], ['hud', true], ['micro', true], ['pserv', true], ['hacknet', true], ['share', true],
    ['spread', false], ['backdoor', true], ['advice', true], ['daemon', true], ['hash', true],
    ['crimeLoop', false], ['crimeAutoPick', true],
    ['factionAssist', true], ['stanekCharge', false],
    ['pservBudget', 0.3], ['pservMin', 8], ['pservMax', 8192],
    ['sharePct', 0.25],
    ['withBatcher', false], ['target', ''], ['hackPct', 0.03], ['gap', 200], ['lanes', 1],
    // NEW: dark web auto buyer integration
    ['darkweb', true], ['dwMode','ports'], ['dwQol', false],
    ['dwSafety', 1.0], ['dwMethod','auto'], ['dwInterval', 1500],
    ['log', true],
  ]);
  const print=(...a)=>{ if(F.log) ns.print('[oneclick]',...a); };
  const isAny=(f)=> ns.ps('home').some(p=>p.filename===f);
  const exists=(f)=>ns.fileExists(f,'home');
  const runOnce=(f,th=1,...args)=>{ if(!exists(f)){ ns.print(`[oneclick] missing: ${f}`); return 0;} if(isAny(f)) return 1; const pid=ns.run(f,th,...args); if(pid===0) ns.tprint(`[oneclick] failed: ${f}`); else print('start',f,'pid',pid,'args',JSON.stringify(args)); return pid?1:0; };

  // ---- profile presets ----
  const pf=String(F.profile||'').toLowerCase();
  if (pf){
    if(pf==='lowram'){
      F.share=false; F.withBatcher=false; F.pservBudget=0.2; F.pservMax=Math.min(F.pservMax,512);
      ns.tprint(`[profile] lowram: share/batcher off, budget=0.2, pservMax<=512`);
    } else if(pf==='moneypush'){
      F.withBatcher=true; F.hackPct=0.05; F.gap=180; F.lanes=2; F.spread=true; F.share=true; F.pservBudget=0.6;
      ns.tprint(`[profile] moneypush: batcher(2 lanes, pct=0.05,gap=180) + spread + budget=0.6`);
    } else if(pf==='reppush'){
      F.share=true; F.sharePct=0.5; F.withBatcher=false; F.pservBudget=0.3;
      ns.tprint(`[profile] reppush: share重視(50%), batcher off`);
    } else if(pf==='casino'){
      F.daemon=true; F.hash=false; F.withBatcher=false; F.darkweb=true;
      ns.tprint(`[profile] casino: カジノ最優先（daemonでrunner起動）+ darkweb buyer`);
    } else if(pf==='karma'){
      F.share=false; F.withBatcher=false; F.crimeLoop=true; F.daemon=false;
      ns.tprint(`[profile] karma: 犯罪の自動リピート＆Karma監視（Singularity無し）`);
    } else if(pf==='stanek'){
      F.share=true; F.sharePct=0.5; F.stanekCharge=true; F.daemon=true;
      ns.tprint(`[profile] stanek: share多め(50%) + Stanek charge 常時`);
    } else if(pf==='setup'){
      // 初期セットアップ: rooter + darkweb + spread + micro + pserv控えめ
      F.withBatcher=false; F.share=false; F.pservBudget=0.2; F.pservMax=Math.min(F.pservMax,1024);
      F.spread=true; F.darkweb=true;
      ns.tprint(`[profile] setup: 初期導入（darkweb buyer + rooter + spread + micro）`);
    } else {
      ns.tprint(`[profile] unknown: ${F.profile}`);
    }
  }

  // ---- helper: check if any cracker missing ----
  const missingCrackers = ()=>{
    const need=['BruteSSH.exe','FTPCrack.exe','relaySMTP.exe','HTTPWorm.exe','SQLInject.exe'];
    return need.filter(x=>!exists(x));
  };

  // ---- optional: program advice ----
  if (F.advice) runOnce('tools/apx-prog.advice.v1.js');

  // ---- NEW: Dark Web auto buyer (run early so rooter benefits quickly) ----
  if (F.darkweb) {
    const buyer='tools/apx-darkweb.autobuyer.v1.js';
    if (exists(buyer)) {
      const miss = missingCrackers();
      if (miss.length>0) {
        const args=['--mode', (F.dwMode||'ports'), ...(F.dwQol?['--qol']:[]), '--safety', Number(F.dwSafety)||1.0, '--interval', Number(F.dwInterval)||1500, '--method', String(F.dwMethod||'auto'), ...(F.log?['--log']:[])];
        runOnce(buyer,1, ...args);
        print('darkweb buyer start; missing=', miss.join(','));
      } else {
        print('darkweb buyer: all crackers owned, skipped');
      }
    } else {
      ns.tprint(`[oneclick] darkweb buyer missing: ${buyer} （ZIP から追加してください）`);
    }
  }

  // ---- standard services ----
  if (F.rooter) runOnce('rooter/apx-rooter.auto.v1.js', 1, '--interval', 10000, '--log');
  if (F.hud) runOnce('tools/apx-hud.lily.v1.js');
  if (F.micro) runOnce('core/apx-core.micro.v2.09.js', 1, '--allRooted', 'true', '--reserveRamPct', pf==='stanek'?0.2:0.1, '--log', 'true');
  if (F.pserv) runOnce('tools/apx-pserv.auto.v1.js', 1, '--budget', F.pservBudget, '--minRam', F.pservMin, '--maxRam', F.pservMax, '--log', 'true');
  if (F.hacknet) runOnce('tools/apx-hacknet.nano.v1.js', 1, '--budget', 0.2, '--maxROI', 3600, '--log', 'true');

  if (F.withBatcher) {
    const args=[]; if(F.target) args.push('--target',String(F.target));
    args.push('--hackPct',Number(F.hackPct),'--gap',Number(F.gap),'--lanes',Number(F.lanes),'--log','true');
    runOnce('tools/apx-hgw-batcher.v1.2.js',1,...args);
  }
  if (F.spread) { const args=[]; if(F.target) args.push('--target',String(F.target)); runOnce('tools/apx-spread.remote.v1.js',1,...args); }
  if (F.share) { await ns.sleep(200); const file='tools/apx-share.nano.v1.js'; if (exists(file) && !isAny(file)) { let cost=ns.getScriptRam(file,'home')||1.6; const max=ns.getServerMaxRam('home'), used=ns.getServerUsedRam('home'); const free=Math.max(0,max-used); let th=Math.floor((free*Math.min(Math.max(0,Number(F.sharePct)),0.9))/cost); th=Math.max(0,th); if(th>=1) runOnce(file,th); else print('share: 空きRAM不足'); } }
  if (F.backdoor) runOnce('tools/apx-backdoor.guide.v1.js', 1, '--watch', 3000);
  if (F.hash) runOnce('tools/apx-hash.spender.v1.js', 1, '--threshold', 0.9, '--mode', 'money');
  if (F.factionAssist) runOnce('tools/apx-faction.join.assist.v1.js', 1);

  if (F.daemon) runOnce('tools/apx-daemon.autoadapt.v1.js', 1, '--interval', 5000, '--log', 'true');

  if (F.crimeLoop) {
    runOnce('tools/apx-karma.watch.v1.js', 1, '--goal', -54000);
    runOnce('tools/apx-crime.repeat.v1.js', 1, '--autoPick', F.crimeAutoPick);
  }
  if (F.stanekCharge) runOnce('tools/apx-stanek.charge.v1.js', 1);

  ns.tprint(`[oneclick] 起動完了: v1.7 profile=${pf||'-'} darkweb=${F.darkweb} dwMode=${F.dwMode} dwQol=${F.dwQol} crimeLoop=${F.crimeLoop} stanek=${F.stanekCharge} factionAssist=${F.factionAssist} HUD=${F.hud} rooter=${F.rooter} micro=${F.micro} pserv=${F.pserv} hacknet=${F.hacknet} share=${F.share} spread=${F.spread} batcher=${F.withBatcher} lanes=${F.lanes} backdoor=${F.backdoor} hash=${F.hash} daemon=${F.daemon}`);
}
