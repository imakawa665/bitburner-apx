
export async function main(ns){
  ns.disableLog('sleep'); ns.disableLog('exec'); ns.disableLog('getServerMaxRam'); ns.disableLog('getServerUsedRam'); ns.clearLog();
  const F=ns.flags([['target','n00dles'],['hackPct',0.05],['gap',200],['lanes',2],['secMargin',0.5],['reserveHomeGB',8]]);
  const H='workers/apx-hack.sched.v1.js', G='workers/apx-grow.sched.v1.js', W='workers/apx-weak.sched.v1.js';
  if(!ns.serverExists(F.target) || !ns.hasRootAccess(F.target)) { ns.tprint(`[batcher] invalid target or no root: ${F.target}`); return; }
  for(const f of [H,G,W]) if(!ns.fileExists(f,'home')){ ns.tprint('[batcher] missing '+f); return; }
  const rcH=ns.getScriptRam(H), rcG=ns.getScriptRam(G), rcW=ns.getScriptRam(W);
  const gap=Math.max(50,Number(F.gap)||200);
  const free=()=>{ const m=ns.getServerMaxRam('home'), u=ns.getServerUsedRam('home'); return Math.max(0, m-u-(Number(F.reserveHomeGB)||8)); };
  const secPerWeak=0.05, secPerHack=0.002, secPerGrow=0.004;
  async function prep(){
    const s=ns.getServer(F.target);
    if(s.hackDifficulty > s.minDifficulty + Number(F.secMargin||0.5)){
      const tw=Math.ceil((s.hackDifficulty - s.minDifficulty)/secPerWeak);
      ns.exec(W,'home',tw,F.target,0); await ns.sleep(ns.getWeakenTime(F.target)+100); return false;
    }
    if(s.moneyAvailable < s.moneyMax*0.99){
      const mult = Math.max(1.01, s.moneyMax / Math.max(1, s.moneyAvailable));
      const tg = Math.max(1, Math.ceil(ns.growthAnalyze(F.target, mult)));
      const tw = Math.max(1, Math.ceil((tg*secPerGrow)/secPerWeak));
      ns.exec(G,'home',tg,F.target,0); ns.exec(W,'home',tw,F.target,0); await ns.sleep(ns.getGrowTime(F.target)+200); return false;
    }
    return true;
  }
  function threads(){
    const s=ns.getServer(F.target);
    const steal = Math.max(1, Math.floor((s.moneyMax||1) * Math.min(0.9, Number(F.hackPct)||0.05)));
    let hth = Math.max(1, Math.floor(ns.hackAnalyzeThreads(F.target, steal)));
    if(!isFinite(hth) || hth<1){ hth = Math.max(1, Math.floor((Number(F.hackPct)||0.05) / Math.max(1e-6, ns.hackAnalyze(F.target)))); }
    const after = Math.max(1, s.moneyAvailable - steal);
    const mult = Math.max(1.01, (s.moneyMax||1) / after);
    const gth = Math.max(1, Math.ceil(ns.growthAnalyze(F.target, mult)));
    const w1 = Math.max(1, Math.ceil((hth*secPerHack)/secPerWeak));
    const w2 = Math.max(1, Math.ceil((gth*secPerGrow)/secPerWeak));
    return {hth,gth,w1,w2};
  }
  while(true){
    const ok = await prep(); if(!ok) continue;
    const {hth,gth,w1,w2} = threads();
    const perBatchRam = hth*rcH + gth*rcG + (w1+w2)*rcW + 2;
    const lanes = Math.min(Math.max(1, Number(F.lanes)||1), Math.max(1, Math.floor(free()/perBatchRam)));
    const tH=ns.getHackTime(F.target), tG=ns.getGrowTime(F.target), tW=ns.getWeakenTime(F.target);
    const base = Date.now() + 200;
    for(let i=0;i<lanes;i++){
      const off = i * gap; const fin = base + 3*gap + off;
      const dH = Math.max(0, fin - tH - Date.now());
      const dW1= Math.max(0, fin + gap - tW - Date.now());
      const dG = Math.max(0, fin + 2*gap - tG - Date.now());
      const dW2= Math.max(0, fin + 3*gap - tW - Date.now());
      ns.exec(H,'home',hth,F.target,dH); ns.exec(W,'home',w1,F.target,dW1); ns.exec(G,'home',gth,F.target,dG); ns.exec(W,'home',w2,F.target,dW2);
      await ns.sleep(gap);
    }
    await ns.sleep(gap*5);
  }
}