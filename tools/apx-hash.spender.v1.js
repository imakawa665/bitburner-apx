
export async function main(ns){
  ns.disableLog('sleep');
  const repMark='/Temp/apx.mode.rep';
  function isRep(){ return ns.fileExists(repMark,'home'); }
  function best(){ const seen=new Set(); const q=['home']; const out=[]; while(q.length){ const s=q.pop(); if(seen.has(s)) continue; seen.add(s); for(const n of ns.scan(s)) q.push(n);} for(const h of seen){ try{ const sv=ns.getServer(h); if(!sv.hasAdminRights) continue; if(sv.moneyMax>0) out.push(h);}catch{} } out.sort((a,b)=>ns.getServerMaxMoney(b)-ns.getServerMaxMoney(a)); return out[0]||'n00dles'; }
  while(true){
    try{
      if(!ns.hacknet.hashCapacity) return;
      const cap=ns.hacknet.hashCapacity(); if(cap<=0) return;
      const n=ns.hacknet.numHashes();
      if(n/cap > 0.8){
        if(isRep()){ ns.hacknet.spendHashes('Reduce Minimum Security', best()); ns.hacknet.spendHashes('Increase Maximum Money', best()); }
        else { ns.hacknet.spendHashes('Sell for Money'); }
      }
    }catch{}
    await ns.sleep(2000);
  }
}
