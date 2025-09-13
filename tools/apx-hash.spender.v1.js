/** tools/apx-hash.spender.v1.js */
export async function main(ns){
  ns.disableLog('sleep'); const F=ns.flags([['threshold',0.9],['mode','money'],['log',true]]);
  const modes={'money':'Sell for Money','corp':'Sell for Corporation Funds'}; const which=modes[F.mode]||modes.money;
  while(true){
    try{
      const have=ns.hacknet.numHashes?.()||0, cap=ns.hacknet.hashCapacity?.()||0; if(cap>0 && have>=cap*Number(F.threshold||0.9)){ while( (ns.hacknet.numHashes?.()||0) >= 4 ){ ns.hacknet.spendHashes(which); if(F.log) ns.print('[hash] spend ->',which); } }
    }catch{} await ns.sleep(2000);
  }
}
