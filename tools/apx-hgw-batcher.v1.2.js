
/** tools/apx-hgw-batcher.v1.2.js
 * Simplified, conservative batcher that tries to keep a single target at high money and low security.
 * It does not try to squeeze max throughput, but schedules batches with gap spacing and 'lanes'.
 * Args: --target <host> --hackPct 0.05 --gap 200 --lanes 2
 */
export async function main(ns){
  ns.disableLog('sleep'); ns.disableLog('exec'); ns.clearLog();
  const F=ns.flags([['target','n00dles'],['hackPct',0.05],['gap',200],['lanes',2]]);
  const H='workers/apx-h1.js', G='workers/apx-g1.js', W='workers/apx-w1.js';
  if(!ns.serverExists(F.target)){ ns.tprint(`[batcher] target not found: ${F.target}`); return; }
  if(!ns.fileExists(H,'home')||!ns.fileExists(G,'home')||!ns.fileExists(W,'home')){ ns.tprint('[batcher] missing worker files'); return; }
  function tHack(){ return ns.getHackTime(F.target); }
  function tGrow(){ return ns.getGrowTime(F.target); }
  function tWeak(){ return ns.getWeakenTime(F.target); }
  function threadsHack(pct){
    const per = ns.hackAnalyze(F.target);
    if(per<=0) return 1;
    return Math.max(1, Math.floor(pct / per));
  }
  function threadsGrow(mult){
    const g = ns.growthAnalyze(F.target, mult);
    return Math.max(1, Math.ceil(g));
  }
  function threadsWeaken(sec){ return Math.max(1, Math.ceil(sec/0.05)); } // each weaken thread ~0.05
  function free(){ const m=ns.getServerMaxRam('home'); const u=ns.getServerUsedRam('home'); return Math.max(0,m-u); }
  const rcH=ns.getScriptRam(H), rcG=ns.getScriptRam(G), rcW=ns.getScriptRam(W);
  const GAP=Math.max(50,Number(F.gap)||200);

  // Prep loop
  async function prep(){
    const s=ns.getServer(F.target);
    if(s.hackDifficulty > s.minDifficulty + 1){ const tw=threadsWeaken(s.hackDifficulty - s.minDifficulty); ns.exec(W,'home',tw,F.target); await ns.sleep(tWeak()+200); return false; }
    if(s.moneyAvailable < s.moneyMax*0.99){ const tg=threadsGrow(s.moneyMax/Math.max(1,s.moneyAvailable+1)); const tw=threadsWeaken(0.004*tg); ns.exec(G,'home',tg,F.target); ns.exec(W,'home',tw,F.target); await ns.sleep(tGrow()+400); return false; }
    return true;
  }

  while(true){
    if(!ns.hasRootAccess(F.target)){ await ns.sleep(1000); continue; }
    const ok = await prep();
    if(!ok) continue;

    // compute batch threads
    const hth=threadsHack(Math.max(0.001,Number(F.hackPct)||0.05));
    const gth=threadsGrow(1/(1 - Math.min(0.9, (hth*ns.hackAnalyze(F.target)))) );
    const w1 = threadsWeaken(0.002*hth);
    const w2 = threadsWeaken(0.004*gth);

    const perBatchRam = hth*rcH + gth*rcG + (w1+w2)*rcW + 4; // overhead
    const maxLanes = Math.max(1, Number(F.lanes)||1);
    const lanes = Math.min(maxLanes, Math.max(1, Math.floor(free()/perBatchRam)));

    const tH=tHack(), tG=tGrow(), tW=tWeak();
    const start = Date.now()+200;

    for(let lane=0; lane<lanes; lane++){
      const offset = lane * GAP;
      // Finish order: H -> W1 -> G -> W2 (rough alignment)
      ns.exec(H,'home',hth,F.target, Date.now()+ (start + 1*GAP + offset) - (Date.now()+tH) );
      ns.exec(W,'home',w1,F.target, Date.now()+ (start + 2*GAP + offset) - (Date.now()+tW) );
      ns.exec(G,'home',gth,F.target, Date.now()+ (start + 3*GAP + offset) - (Date.now()+tG) );
      ns.exec(W,'home',w2,F.target, Date.now()+ (start + 4*GAP + offset) - (Date.now()+tW) );
      await ns.sleep(GAP);
    }
    await ns.sleep(GAP*6);
  }
}
