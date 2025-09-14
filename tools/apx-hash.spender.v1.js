
export async function main(ns){
  ns.disableLog('sleep');
  const F=ns.flags([['threshold',0.8],['target','']]);
  while(true){
    try{
      if(!ns.hacknet.hashCapacity) return; // Early BN
      const cap=ns.hacknet.hashCapacity(); if(cap<=0){ await ns.sleep(5000); continue; }
      const n=ns.hacknet.numHashes();
      if(n >= cap*Number(F.threshold||0.8)){
        // 最も無難：Sell for Money
        while(ns.hacknet.numHashes() >= 4) ns.hacknet.spendHashes('Sell for Money');
      }
    }catch{}
    await ns.sleep(2000);
  }
}
