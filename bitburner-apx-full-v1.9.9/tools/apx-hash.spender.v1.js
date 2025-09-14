
export async function main(ns){
  ns.disableLog('sleep');
  const rep='/Temp/apx.mode.rep';
  const target='n00dles';
  function isRep(){ return ns.fileExists(rep,'home'); }
  while(true){
    try{
      if(!ns.hacknet.hashCapacity) return;
      const cap=ns.hacknet.hashCapacity(); if(cap<=0) return;
      const n=ns.hacknet.numHashes();
      if(n/cap>0.8){
        if(isRep()){ ns.hacknet.spendHashes('Reduce Minimum Security',target); ns.hacknet.spendHashes('Increase Maximum Money',target); }
        else ns.hacknet.spendHashes('Sell for Money');
      }
    }catch{}
    await ns.sleep(1500);
  }
}