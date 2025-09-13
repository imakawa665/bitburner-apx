
/** tools/apx-autopilot.full.v1.js  (v1.9.3 Enhanced) */
export async function main(ns){
  ns.disableLog('sleep'); ns.disableLog('run'); ns.disableLog('getServerMoneyAvailable'); ns.disableLog('getServerMaxRam'); ns.disableLog('getServerUsedRam'); ns.clearLog();
  const F=ns.flags([
    ['interval',1200],['goal',1e9],
    ['uiLock','/Temp/apx.ui.lock.txt'],['banFile','apx.state.casino.banned.txt'],
    ['autostudy',true],['studyHackTo',50],['trainAgiTo',50],
    ['hud',true],['log',true],
    ['batchEnable',true],['batchMinFreePct',0.25],['batchMinFreeGB',16],['batchHackPct',0.05],['batchGap',200],['batchLanes',2],['batchTarget',''],['batchMinThreads',64],['microReservePct',0.10],
    ['repMode',false],['repFaction','auto'],['repJob','hack'],['shareReserveHomeGB',8],
    ['reserveFile','reserve.txt'],['pservBudget',0.30],['hacknetBudget',0.20]
  ]);
  const print=(...a)=>{ if(F.log) ns.print('[autopilot]',...a); };
  const exists=(f)=>ns.fileExists(f,'home'); const isAny=(f)=> ns.ps('home').some(p=>p.filename===f);
  const runOnce=(f,th=1,...args)=>{ if(!exists(f)) { print('missing',f); return 0;} if(isAny(f)) return 1; const pid=ns.run(f,th,...args); if(!pid) ns.tprint(`[autopilot] failed to start ${f}`); else print('start',f,'pid',pid,'args',JSON.stringify(args)); return pid?1:0; };
  const restart=async(file,args)=>{ if(!exists(file)) return false; const procs=ns.ps('home').filter(p=>p.filename===file); if(procs.length===0){ runOnce(file,1,...args); return true; } const same=procs.some(p=>JSON.stringify(p.args)===JSON.stringify(args)); if(!same){ for(const p of procs) ns.kill(p.pid); await ns.sleep(10); runOnce(file,1,...args); return true; } return false; };
  const killAll=(file)=>{ for(const p of ns.ps('home').filter(p=>p.filename===file)) ns.kill(p.pid); };

  const reserve = ()=>{ try{ return Math.max(0, Number(ns.read(String(F.reserveFile)||'reserve.txt')||0)); }catch{return 0;} };
  const freeCash = ()=> Math.max(0, ns.getServerMoneyAvailable('home') - reserve());
  ns.tprint(`[autopilot] reserve=${ns.nFormat(reserve(),'$0.00a')}`);

  // 基本サービス
  runOnce('tools/apx-hacknet.nano.v1.js',1,'--budget',Number(F.hacknetBudget||0.20),'--maxROI',3600,'--log','true');
  runOnce('rooter/apx-rooter.auto.v1.js',1,'--interval',10000,'--log');
  runOnce('core/apx-core.micro.v2.09.js',1,'--allRooted','true','--reserveRamPct',Math.max(0,Number(F.microReservePct)||0.1),'--log','true');
  if (F.hud) runOnce('tools/apx-hud.lily.v1.js');
  runOnce('tools/apx-share.nano.v1.js');
  runOnce('tools/apx-faction.join.assist.v1.js');
  runOnce('tools/apx-healthcheck.v1.js');
  if (exists('tools/apx-backdoor.auto.dom.v1.js')) runOnce('tools/apx-backdoor.auto.dom.v1.js',1,'--lock',F.uiLock,'--watch',6000);

  const casino=()=>{ const banned = ns.fileExists(F.banFile,'home'); if (!banned && ns.getServerMoneyAvailable('home') < Number(F.goal||1e9)) runOnce('tools/apx-casino.runner.v1.js',1,'--goal',Number(F.goal||1e9),'--minTravel',200000); else { for (const p of ns.ps('home').filter(p=>p.filename==='tools/apx-casino.runner.v1.js')) ns.kill(p.pid); } };

  const crackers=['BruteSSH.exe','FTPCrack.exe','relaySMTP.exe','HTTPWorm.exe','SQLInject.exe']; let lastCrackers=crackers.filter(exists).length;
  const stage=()=>{ const m=ns.getServerMoneyAvailable('home'); const h=ns.getPlayer().skills.hacking; const cr=crackers.filter(exists).length; if (m<5e6 && (h<50 || cr<2)) return 'setup'; if (m<1e9) return 'moneypush'; return 'late'; };
  let mode=stage(); ns.tprint(`[autopilot] stage start: ${mode}`);

  const repMark='/Temp/apx.mode.rep';
  const setRepMark=(on)=>{ try{ if(on) ns.write(repMark,'1','w'); else if(ns.fileExists(repMark,'home')) ns.rm(repMark,'home'); }catch{} };
  setRepMark(!!F.repMode);

  function needCracker(){ return crackers.find(c=>!exists(c)); }
  function mayBuy(cost){ return freeCash() >= Math.max(1,cost*0.99); }
  function startBuyer(){
    const miss=needCracker(); if(!miss) return;
    const price = miss==='BruteSSH.exe'?5e5: miss==='FTPCrack.exe'?1.5e6: miss==='relaySMTP.exe'?5e6: miss==='HTTPWorm.exe'?3e7: 2.5e8;
    if(!mayBuy(price)) return;
    runOnce('tools/apx-darkweb.autobuyer.v1.js',1,'--mode','ports','--safety',1.0,'--method','auto','--autoRooterRestart');
  }
  if (ns.fileExists('tools/apx-pserv.scale.v1.js','home')) runOnce('tools/apx-pserv.scale.v1.js',1,'--budget',Number(F.pservBudget||0.3),'--reserveFile',String(F.reserveFile||'reserve.txt'));

  function homeFree(){ const max=ns.getServerMaxRam('home'), used=ns.getServerUsedRam('home'); return Math.max(0,max-used); }
  function enoughForBatch(){ const free=homeFree(); const pct=free/Math.max(1,ns.getServerMaxRam('home')); return free>=Math.max(0,Number(F.batchMinFreeGB)||0) && pct>=Math.max(0,Number(F.batchMinFreePct)||0); }
  function totalThreadsIfBatch(){ const free=homeFree(); const cost=ns.getScriptRam('workers/apx-h1.js','home')||1.7; return Math.floor(free/cost); }
  function readPin(){ try{ const t=(ns.read('/Temp/apx.pin.target.txt')||'').trim(); return t||null; }catch{return null;} }
  function bestTarget(){
    const pin = String(F.batchTarget||'').trim() || readPin();
    if (pin && ns.serverExists(pin)) return pin;
    const me=ns.getPlayer(); const seen=new Set(); const q=['home']; const cand=[];
    while(q.length){ const s=q.pop(); if(seen.has(s)) continue; seen.add(s); for(const n of ns.scan(s)) q.push(n); }
    for(const h of seen){ if(h==='home') continue; try{ const sv=ns.getServer(h); if(!sv.hasAdminRights) continue; if(sv.requiredHackingSkill>me.skills.hacking) continue; if(sv.moneyMax<=0) continue; const sec=sv.minDifficulty||1; const money=sv.moneyMax||1; const tHack=ns.getHackTime(h)||1; const score=(money/Math.max(1,tHack))*(1.5-Math.min(1,sec/100)); cand.push([score,h]); }catch{} }
    cand.sort((a,b)=>b[0]-a[0]); return (cand[0]||[])[1]||'n00dles';
  }

  async function repModeOn(){
    for(const p of ns.ps('home').filter(p=>p.filename==='tools/apx-hgw-batcher.v1.2.js')) ns.kill(p.pid);
    if (exists('tools/apx-share.manager.v1.js')) runOnce('tools/apx-share.manager.v1.js',1,'--reserveHomeGB',Number(F.shareReserveHomeGB)||8);
    if (exists('tools/apx-faction.work.dom.v1.js')) runOnce('tools/apx-faction.work.dom.v1.js',1,'--target',String(F.repFaction||'auto'),'--job',String(F.repJob||'hack'),'--lock',F.uiLock,'--watch',6000);
  }

  let batchOn=false;
  while(true){
    casino();
    startBuyer();

    const now=stage(); if(now!==mode){ ns.tprint(`[autopilot] stage: ${mode} -> ${now}`); mode=now; }

    const nowC=crackers.filter(exists).length;
    if (nowC>lastCrackers){
      await restart('rooter/apx-rooter.auto.v1.js',['--interval',10000,'--log']);
      runOnce('tools/apx-spread.remote.v1.js',1);
      lastCrackers=nowC;
      ns.toast(`New crackers: ${nowC}/5. Rooting expanded.`,'info',3000);
    }

    if (F.repMode){
      setRepMark(true);
      await repModeOn();
    } else {
      setRepMark(false);
      const tgt=bestTarget();
      const canBatch = !!F.batchEnable && enoughForBatch() && totalThreadsIfBatch() >= Math.max(1,Number(F.batchMinThreads)||64);
      if (canBatch){
        const procs=ns.ps('home').filter(p=>p.filename==='tools/apx-share.nano.v1.js'); if (procs.length>1) for(let i=1;i<procs.length;i++) ns.kill(p.pid);
        const args=['--target',tgt,'--hackPct',Number(F.batchHackPct)||0.05,'--gap',Number(F.batchGap)||200,'--lanes',Number(F.batchLanes)||2];
        await restart('tools/apx-hgw-batcher.v1.2.js', args);
        if(!batchOn){ ns.tprint(`[autopilot] batcher ON -> target=${tgt} hackPct=${F.batchHackPct} lanes=${F.batchLanes}`); batchOn=true; }
      } else {
        for(const p of ns.ps('home').filter(p=>p.filename==='tools/apx-hgw-batcher.v1.2.js')) ns.kill(p.pid);
        if(batchOn){ ns.tprint(`[autopilot] batcher OFF`); batchOn=false; }
        if (!isAny('core/apx-core.micro.v2.09.js')) runOnce('core/apx-core.micro.v2.09.js',1,'--allRooted','true','--reserveRamPct',Math.max(0,Number(F.microReservePct)||0.1),'--log','true');
      }
    }
    await ns.sleep(Math.max(500, Number(F.interval)||1200));
  }
}
