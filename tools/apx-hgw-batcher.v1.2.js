/** apx-hgw-batcher.v1.2.js */
export async function main(ns) {
  ns.disableLog('sleep');
  const F=ns.flags([['target','n00dles'],['hackPct',-1],['gap',200],['lanes',1],['loop',true],['log',true]]);
  const t=String(F.target);
  const log=(...a)=>{ if(F.log) ns.print('[batch]',...a); };
  if(!ns.serverExists(t) || (ns.getServerMaxMoney(t)||0)<=0) return ns.tprint(`[batcher] 無効ターゲット: ${t}`);
  const autoPct=()=>{ const ht=ns.getHackTime(t); if(ht<=4000) return 0.08; if(ht<=8000) return 0.06; if(ht<=15000) return 0.04; return 0.03; };
  const pct = (Number(F.hackPct)>=0) ? Math.min(0.99, Math.max(0.001, Number(F.hackPct))) : autoPct();
  const can=async(file,th,...args)=>{ if(th<=0) return 0; let started=0,tryTh=th; while(tryTh>0){ const pid=ns.run(file,tryTh,...args); if(pid!==0){started=tryTh;break;} tryTh=Math.floor(tryTh/2); if(tryTh===1){ if(ns.run(file,1,...args)!==0){started=1;break;} else break;} await ns.sleep(5);} log('run',file,'t',started); return started; };
  const schedule=async(offset=0)=>{ const s=ns.getServer(t); const ht=ns.getHackTime(t), gt=ns.getGrowTime(t), wt=ns.getWeakenTime(t); const max=s.moneyMax||ns.getServerMaxMoney(t); const cur=Math.max(1,ns.getServerMoneyAvailable(t));
    const hackThreads=Math.max(1,Math.floor(ns.hackAnalyzeThreads(t, cur*pct))); const moneyAfterHack=Math.max(1, cur - ns.hackAnalyze(t) * cur * hackThreads);
    const growAmountNeeded=Math.max(1,max)/Math.max(1,moneyAfterHack); const growThreads=Math.max(1,Math.ceil(ns.growthAnalyze(t,growAmountNeeded)));
    const secIncHack=0.002*hackThreads, secIncGrow=0.004*growThreads, wpt=0.05; const w1=Math.ceil(secIncHack/wpt), w2=Math.ceil(secIncGrow/wpt);
    log('calc',{pct,hackThreads,growThreads,w1,w2,ht,gt,wt,laneOffset:offset});
    const now=Date.now(), gap=Math.max(50,Number(F.gap)), end=now+wt+4*gap+offset; const times={ w2:end-wt, g:end-gt-gap, w1:end-wt-2*gap, h:end-ht-3*gap };
    const sleepUntil=async(ms)=>{ const d=ms-Date.now(); if(d>0) await ns.sleep(d); };
    await sleepUntil(times.h);  await can('workers/apx-h1.js', hackThreads, t);
    await sleepUntil(times.w1); await can('workers/apx-w1.js', w1, t);
    await sleepUntil(times.g);  await can('workers/apx-g1.js', growThreads, t);
    await sleepUntil(times.w2); await can('workers/apx-w1.js', w2, t);
  };
  while(true){ const lanes=Math.max(1,Math.min(3,Number(F.lanes)||1)); const laneGap=Math.max(100,Number(F.gap))*2; for(let i=0;i<lanes;i++){ schedule(i*laneGap); await ns.sleep(50);} if(!F.loop) break; await ns.sleep(Math.max(400,Number(F.gap))); }
}
