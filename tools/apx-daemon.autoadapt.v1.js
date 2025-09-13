
/** apx-daemon.autoadapt.v1.js (v1.6.1)
 * - Casino ban respect（v1.6 HOTFIXは維持）
 * - DarkWeb Buyer: クラッカー不足なら自動起動
 * - クラッカー新規入手を検知したら rooter/spread を再走
 */
export async function main(ns){
  ns.disableLog('sleep'); ns.disableLog('run'); ns.disableLog('getServerMaxRam'); ns.disableLog('getServerUsedRam');
  const F=ns.flags([
    ['interval', 5000],
    ['minSharePct', 0.1], ['maxSharePct', 0.5],
    ['batchMinFree', 0.25], ['batchMaxFree', 0.7],
    ['pservMin', 8], ['pservMax', 16384],
    ['spreadInterval', 120000], ['healthInterval', 600000],
    ['casino', true], ['casinoGoal', 1e9],
    ['darkweb', true],
    ['log', true],
  ]);
  const print=(...a)=>{ if(F.log) ns.print('[daemon]',...a); };
  const isAny=(f)=> ns.ps('home').some(p=>p.filename===f);
  const exists=(f)=>ns.fileExists(f,'home');
  const runOnce=(f,th=1,...args)=>{ if(!exists(f)) return 0; if(isAny(f)) return 1; const pid=ns.run(f,th,...args); return pid?1:0; };
  const restart=async(file,args)=>{ if(!exists(file)) return false; const procs=ns.ps('home').filter(p=>p.filename===file); if(procs.length===0){ runOnce(file,1,...args); return true; } const same=procs.some(p=>JSON.stringify(p.args)===JSON.stringify(args)); if(!same){ for(const p of procs) ns.kill(p.pid); await ns.sleep(10); runOnce(file,1,...args); return true; } return false; };

  let lastSpread = 0, lastAdvice = 0, lastHeal = 0;

  const crackers=['BruteSSH.exe','FTPCrack.exe','relaySMTP.exe','HTTPWorm.exe','SQLInject.exe'];
  const numCrackers = ()=>crackers.filter(exists).length;
  let lastCr = numCrackers();

  while(true){
    const casinoBanned = ns.fileExists('apx.state.casino.banned.txt','home');

    // Faction invite assist
    runOnce('tools/apx-faction.join.assist.v1.js', 1);

    // Casino launcher
    if (F.casino && !casinoBanned && ns.getServerMoneyAvailable('home') < Number(F.casinoGoal||1e9)) {
      if (exists('tools/apx-casino.runner.v1.js')) runOnce('tools/apx-casino.runner.v1.js', 1, '--goal', Number(F.casinoGoal||1e9));
    } else {
      for (const p of ns.ps('home').filter(p=>p.filename==='tools/apx-casino.runner.v1.js')) ns.kill(p.pid);
    }

    // DarkWeb Buyer orchestration
    const missing = crackers.filter(c=>!exists(c));
    if (F.darkweb && missing.length>0 && exists('tools/apx-darkweb.autobuyer.v1.js')) {
      runOnce('tools/apx-darkweb.autobuyer.v1.js', 1, '--mode','ports','--safety',1.0,'--method','auto');
      print('darkweb buyer running; missing=', missing.join(','));
    }

    // Share
    const max=ns.getServerMaxRam('home'), used=ns.getServerUsedRam('home'); const free=Math.max(0,max-used); const freeRatio=max>0?free/max:0;
    const shareFile='tools/apx-share.nano.v1.js';
    if (exists(shareFile)) {
      const cost=ns.getScriptRam(shareFile,'home')||1.6;
      const targetPct = Math.min(F.maxSharePct, Math.max(F.minSharePct, freeRatio*0.9));
      const targetThreads = Math.max(0, Math.floor((free*targetPct)/cost));
      if (targetThreads>=1 && !isAny(shareFile)) { runOnce(shareFile, targetThreads); print('share start t',targetThreads,'freeRatio',freeRatio.toFixed(2)); }
    }

    // Target pick + batcher
    const tgt = (()=>{ const L=['n00dles','foodnstuff','sigma-cosmetics','joesguns','nectar-net','hong-fang-tea','harakiri-sushi']; const me=ns.getPlayer().skills.hacking; const c=L.filter(h=>ns.serverExists(h)&&ns.hasRootAccess(h)&&ns.getServerRequiredHackingLevel(h)<=me); if(c.length===0) return 'n00dles'; c.sort((a,b)=>(ns.getServerMaxMoney(b)||0)-(ns.getServerMaxMoney(a)||0)); return c[0]; })();
    const ht = ns.getHackTime(tgt); const freeRatio2=(ns.getServerMaxRam('home')-ns.getServerUsedRam('home'))/Math.max(1,ns.getServerMaxRam('home'));
    const batchWanted = (freeRatio2>=F.batchMinFree) && (ht<=20000);
    if (batchWanted) { const hackPct = ht<=5000 ? 0.05 : 0.03; const args=['--target',tgt,'--hackPct',hackPct,'--gap',200,'--log','true']; if (await restart('tools/apx-hgw-batcher.v1.2.js', args)) print('batch restart',tgt,hackPct); }
    else { for(const p of ns.ps('home').filter(p=>p.filename==='tools/apx-hgw-batcher.v1.2.js')) ns.kill(p.pid); }

    // pserv
    const money=ns.getServerMoneyAvailable('home');
    let budget = money>5e6 ? 0.5 : (money>1e6 ? 0.4 : 0.3);
    let minRam = money>2e6 ? 64 : 8;
    let maxRam = money>2e7 ? 16384 : (money>5e6 ? 8192 : 2048);
    const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)); minRam=clamp(minRam,F.pservMin,F.pservMax); maxRam=clamp(maxRam,F.pservMin,F.pservMax);
    if (await restart('tools/apx-pserv.auto.v1.js', ['--budget',budget,'--minRam',minRam,'--maxRam',maxRam,'--log','true'])) print('pserv restart',budget,minRam,maxRam);

    // spread (periodic)
    if (Date.now()-lastSpread > F.spreadInterval) { runOnce('tools/apx-spread.remote.v1.js', 1, '--target', tgt); lastSpread = Date.now(); }

    // クラッカーが増えたら rooter/spread を即再走
    const nowCr = numCrackers();
    if (nowCr > lastCr) {
      print('new crackers detected; restarting rooter & spread');
      await restart('rooter/apx-rooter.auto.v1.js', ['--interval',10000,'--log']);
      runOnce('tools/apx-spread.remote.v1.js', 1, '--target', tgt);
      lastCr = nowCr;
    }

    // backdoor guide
    runOnce('tools/apx-backdoor.guide.v1.js', 1, '--watch', 3000);

    // advice
    if (Date.now()-lastAdvice > 300000) { runOnce('tools/apx-prog.advice.v1.js'); lastAdvice = Date.now(); }

    // hash
    runOnce('tools/apx-hash.spender.v1.js', 1, '--threshold', 0.9, '--mode', 'money');

    // health
    if (Date.now()-lastHeal > F.healthInterval) { ns.run('tools/apx-healthcheck.v1.js'); lastHeal = Date.now(); }

    await ns.sleep(F.interval);
  }
}
