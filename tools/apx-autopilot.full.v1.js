
/** tools/apx-autopilot.full.v1.js  (v1.8.3) */
export async function main(ns){
  ns.disableLog('sleep'); ns.disableLog('run'); ns.disableLog('getServerMoneyAvailable'); ns.disableLog('getServerMaxRam'); ns.disableLog('getServerUsedRam'); ns.clearLog();
  const F=ns.flags([['interval',5000],['goal',1e9],['uiLock','/Temp/apx.ui.lock.txt'],['banFile','apx.state.casino.banned.txt'],['autostudy',true],['studyHackTo',50],['trainAgiTo',50],['crimeAuto',false],['karmaGoal',-54000],['hud',true],['log',true]]);
  const print=(...a)=>{ if(F.log) ns.print('[autopilot]',...a); };
  const exists=(f)=>ns.fileExists(f,'home'); const isAny=(f)=> ns.ps('home').some(p=>p.filename===f);
  const runOnce=(f,th=1,...args)=>{ if(!exists(f)) { print('missing',f); return 0;} if(isAny(f)) return 1; const pid=ns.run(f,th,...args); if(!pid) ns.tprint(`[autopilot] failed to start ${f}`); return pid?1:0; };
  const restart=async(file,args)=>{ if(!exists(file)) return false; const procs=ns.ps('home').filter(p=>p.filename===file); if(procs.length===0){ runOnce(file,1,...args); return true; } const same=procs.some(p=>JSON.stringify(p.args)===JSON.stringify(args)); if(!same){ for(const p of procs) ns.kill(p.pid); await ns.sleep(10); runOnce(file,1,...args); return true; } return false; };
  // base services
  runOnce('tools/apx-hacknet.nano.v1.js',1,'--budget',0.2,'--maxROI',3600,'--log','true');
  runOnce('rooter/apx-rooter.auto.v1.js',1,'--interval',10000,'--log');
  runOnce('core/apx-core.micro.v2.09.js',1,'--allRooted','true','--reserveRamPct',0.1,'--log','true');
  if (F.hud) runOnce('tools/apx-hud.lily.v1.js');
  runOnce('tools/apx-share.nano.v1.js'); runOnce('tools/apx-faction.join.assist.v1.js'); runOnce('tools/apx-healthcheck.v1.js');

  const crackers=['BruteSSH.exe','FTPCrack.exe','relaySMTP.exe','HTTPWorm.exe','SQLInject.exe']; let lastCrackers=crackers.filter(exists).length; let mode='setup';
  const stage=()=>{ const m=ns.getServerMoneyAvailable('home'); const h=ns.getPlayer().skills.hacking; const cr=crackers.filter(exists).length; if (m<5e6 && (h<50 || cr<2)) return 'setup'; if (m<1e9) return 'moneypush'; return 'late'; };

  // helper: test singularity access
  const canSing = ()=>{
    try{
      if(!ns.singularity || typeof ns.singularity.commitCrime!=='function') return false;
      // Try a harmless call that still throws if API is blocked
      ns.singularity.isBusy?.();
      return true;
    }catch{ return false; }
  };

  while(true){
    const now=stage(); if(now!==mode){ ns.tprint(`[autopilot] stage: ${mode} -> ${now}`); mode=now; }
    // Darkweb buyer auto + rooter/spread on new crackers
    const missing=crackers.filter(c=>!exists(c));
    if (missing.length>0 && exists('tools/apx-darkweb.autobuyer.v1.js')) {
      runOnce('tools/apx-darkweb.autobuyer.v1.js',1,'--mode','ports','--safety',1.0,'--method','auto','--autoRooterRestart');
      print('darkweb buyer running; missing=', missing.join(','));
    }
    const nowC=crackers.filter(exists).length;
    if (nowC>lastCrackers){ await restart('rooter/apx-rooter.auto.v1.js',['--interval',10000,'--log']); runOnce('tools/apx-spread.remote.v1.js',1); lastCrackers=nowC; ns.toast(`New crackers: ${nowC}/5. Rooting expanded.`,'info',4000); }

    // Casino launcher (ban/goal-aware)
    const banned = ns.fileExists(F.banFile,'home');
    if (!banned && ns.getServerMoneyAvailable('home') < Number(F.goal||1e9)) runOnce('tools/apx-casino.runner.v1.js',1,'--goal',Number(F.goal||1e9),'--minTravel',200000);
    else { for (const p of ns.ps('home').filter(p=>p.filename==='tools/apx-casino.runner.v1.js')) ns.kill(p.pid); }

    // Backdoor / Study (DOM)
    if (exists('tools/apx-backdoor.auto.dom.v1.js')) runOnce('tools/apx-backdoor.auto.dom.v1.js',1,'--lock',F.uiLock,'--watch',6000);
    if (F.autostudy && exists('tools/apx-study.train.dom.v1.js')) { const me=ns.getPlayer(); const wantsHack=me.skills.hacking < Number(F.studyHackTo||50); const wantsAgi=me.skills.agility < Number(F.trainAgiTo||50); if (wantsHack || wantsAgi) runOnce('tools/apx-study.train.dom.v1.js',1,'--lock',F.uiLock,'--hackTo',Number(F.studyHackTo||50),'--agiTo',Number(F.trainAgiTo||50)); }

    // Crime loop (auto): prefer Singularity, fallback to DOM
    if (F.crimeAuto) {
      if (canSing()) runOnce('tools/apx-crime.repeat.v1.js',1,'--autoPick',true);
      else          runOnce('tools/apx-crime.repeat.dom.v1.js',1,'--crime','shoplift','--lock',F.uiLock);
      runOnce('tools/apx-karma.watch.v1.js',1,'--goal',Number(F.karmaGoal||-54000));
    }

    await ns.sleep(Math.max(1000, Number(F.interval)||5000));
  }
}
