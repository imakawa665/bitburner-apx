/** tools/apx-hud.lily.v1.js - minimal Overview HUD using overview-extra-hook-0/1 */
export async function main(ns){
  ns.disableLog('sleep'); const doc=eval('document');
  const h0=doc.getElementById('overview-extra-hook-0'), h1=doc.getElementById('overview-extra-hook-1');
  const write=(a,b)=>{ h0.innerText=a.join("\n"); h1.innerText=b.join("\n"); };
  while(true){
    try{
      const me=ns.getPlayer(); const tgt = 'n00dles';
      const a=['APX','Target','HomeRAM','Share']; 
      const max=ns.getServerMaxRam('home'), used=ns.getServerUsedRam('home');
      const b=['v1.8.1', tgt, `${(max-used).toFixed(1)}/${max.toFixed(1)} GB`, ns.getSharePower().toFixed(2)];
      write(a,b);
    }catch{} await ns.sleep(1000);
  }
}
