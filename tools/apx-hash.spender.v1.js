/** apx-hash.spender.v1.js */
export async function main(ns){
  ns.disableLog('sleep');
  const F=ns.flags([['threshold',0.9],['mode','money'],['interval',2000],['log',false]]);
  const log=(...a)=>{ if(F.log) ns.print('[hash]',...a); };
  while(true){
    let cap=0, h=0; try{ cap=ns.hacknet.hashCapacity(); h=ns.hacknet.numHashes(); }catch{ await ns.sleep(F.interval); continue; }
    if(cap>0 && h>=cap*F.threshold){
      let ok=false;
      if(F.mode==='money') ok = ns.hacknet.spendHashes('Sell for Money');
      else if(F.mode==='corp') ok = ns.hacknet.spendHashes('Exchange for Corporation Research');
      else if(F.mode==='study') ok = ns.hacknet.spendHashes('Improve Studying');
      else ok = ns.hacknet.spendHashes('Sell for Money');
      log('spend', ok, 'hashes', h.toFixed(1), '/', cap.toFixed(1));
    }
    await ns.sleep(F.interval);
  }
}
