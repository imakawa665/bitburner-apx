
export async function main(ns){
  ns.disableLog('sleep'); ns.disableLog('run'); ns.disableLog('getServerMoneyAvailable'); ns.disableLog('getServerMaxRam'); ns.disableLog('getServerUsedRam'); ns.clearLog();
  const F=ns.flags([
    ['interval',1000],['goal',1e9],['hud',false],['log',true],['noDom',true],
    ['batchEnable',true],['batchMinFreePct',0.25],['batchMinFreeGB',16],['batchHackPct',0.05],['batchGap',200],['batchLanes',2],['batchTarget',''],['batchMinThreads',64],['microReservePct',0.10],
    ['repMode',false],['repFaction','auto'],['repJob','hack'],['shareReserveHomeGB',8],
    ['reserveFile','reserve.txt'],['pservBudget',0.30],['hacknetBudget',0.20],
    ['stocks',true],['stocksBudget',0.40],['stocksMinCash',1e9]
  ]);
  const exists=(f)=>ns.fileExists(f,'home'); const isAny=(f)=> ns.ps('home').some(p=>p.filename===f);
  const runOnce=(f,th=1,...args)=>{ if(!exists(f)) return 0; if(isAny(f)) return 1; const pid=ns.run(f,th,...args); if(!pid) ns.tprint(`[autopilot] failed to start ${f}`); return pid?1:0; };
  const restart=async(file,args)=>{ if(!exists(file)) return false; const procs=ns.ps('home').filter(p=>p.filename===file); if(procs.length===0){ runOnce(file,1,...args); return true; } const same=procs.some(p=>JSON.stringify(p.args)===JSON.stringify(args)); if(!same){ for(const p of procs) ns.kill(p.pid); await ns.sleep(10); runOnce(file,1,...args); return true; } return false; };
  const reserve=()=>{ try{ return Math.max(0, Number(ns.read(String(F.reserveFile)||'reserve.txt')||0)); }catch{return 0;} };
  ns.tprint(`[autopilot] reserve=${ns.formatMoney(reserve())}`);

  runOnce('tools/apx-hacknet.nano.v1.js',1,'--budget',Number(F.hacknetBudget||0.20),'--maxROI',3600,'--log','true');
  runOnce('rooter/apx-rooter.auto.v1.js',1,'--interval',10000,'--log');
  runOnce('core/apx-core.micro.v2.09.js',1,'--allRooted','true','--reserveRamPct',Math.max(0,Number(F.microReservePct)||0.1),'--log','true');
  if (F.hud && !F.noDom && exists('tools/apx-hud.lily.v1.1.js')) runOnce('tools/apx-hud.lily.v1.1.js');
  runOnce('tools/apx-share.nano.v1.js');
  runOnce('tools/apx-healthcheck.v1.js');

  if(F.stocks){ runOnce('tools/apx-stocks.auto.v1.js',1,'--budget',Number(F.stocksBudget||0.40),'--minCash',Number(F.stocksMinCash||1e9)); }
  else { for(const p of ns.ps('home').filter(p=>p.filename?.startsWith('tools/apx-stocks.'))) ns.kill(p.pid); }

  function homeFree(){ const max=ns.getServerMaxRam('home'), used=ns.getServerUsedRam('home'); return Math.max(0,max-used); }
  function enoughForBatch(){ const free=homeFree(); const pct=free/Math.max(1,ns.getServerMaxRam('home')); return free>=Math.max(0,Number(F.batchMinFreeGB)||0) && pct>=Math.max(0,Number(F.batchMinFreePct)||0); }
  function totalThreadsIfBatch(){ const free=homeFree(); const cost=(ns.getScriptRam('workers/apx-hack.sched.v1.js','home')||1.75); return Math.floor(free/cost); }
  function readPin(){ try{ const t=(ns.read('/Temp/apx.pin.target.txt')||'').trim(); return t||null; }catch{return null;} }
  function bestTarget(){
    const pin = String(F.batchTarget||'').trim() || readPin();
    if (pin && ns.serverExists(pin)) return pin;
    const me=ns.getPlayer(); const seen=new Set(); const q=['home']; const cand=[];
    while(q.length){ const s=q.pop(); if(seen.has(s)) continue; seen.add(s); for(const n of ns.scan(s)) q.push(n); }
    for(const h of seen){ if(h==='home') continue; try{ const sv=ns.getServer(h); if(!sv.hasAdminRights) continue; if(sv.requiredHackingSkill>me.skills.hacking) continue; if(sv.moneyMax<=0) continue; const sec=sv.minDifficulty||1; const money=sv.moneyMax||1; const tHack=ns.getHackTime(h)||1; const score=(money/Math.max(1,tHack))*(1.5-Math.min(1,sec/100)); cand.push([score,h]); }catch{} }
    cand.sort((a,b)=>b[0]-a[0]); return (cand[0]||[])[1]||'n00dles';
  }

  let batchOn=false;
  while(true){
    const tgt=bestTarget();
    if (F.repMode){
      ns.write('/Temp/apx.mode.rep','1','w');
      runOnce('tools/apx-share.manager.v1.js',1,'--reserveHomeGB',Number(F.shareReserveHomeGB)||8);
      for(const p of ns.ps('home').filter(p=>p.filename?.startsWith('tools/apx-hgw-batcher'))) ns.kill(p.pid);
    } else {
      if(ns.fileExists('/Temp/apx.mode.rep','home')) ns.rm('/Temp/apx.mode.rep','home');
      const canBatch = !!F.batchEnable && enoughForBatch() && totalThreadsIfBatch() >= Math.max(1,Number(F.batchMinThreads)||64);
      if (canBatch){
        const args=['--target',tgt,'--hackPct',Number(F.batchHackPct)||0.05,'--gap',Number(F.batchGap)||200,'--lanes',Number(F.batchLanes)||2];
        await restart('tools/apx-hgw-batcher.v1.3.js', args);
        if(!batchOn){ ns.tprint(`[autopilot] batcher ON -> target=${tgt}`); batchOn=true; }
      } else {
        for(const p of ns.ps('home').filter(p=>p.filename?.startsWith('tools/apx-hgw-batcher'))) ns.kill(p.pid);
        if(batchOn){ ns.tprint(`[autopilot] batcher OFF`); batchOn=false; }
      }
    }
    await ns.sleep(Math.max(500, Number(F.interval)||1000));
  }
}
