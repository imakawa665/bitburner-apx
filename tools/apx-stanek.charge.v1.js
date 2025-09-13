/** tools/apx-stanek.charge.v1.js - noop unless Stanek available */
export async function main(ns){
  if(!ns.stanek?.chargeFragment){ await ns.sleep(10000); return; }
  while(true){
    try{ const frags=ns.stanek.fragmentAt(0,0)? ns.stanek.fragments():[]; for(const f of frags){ try{ await ns.stanek.chargeFragment(f.x,f.y); }catch{} } }catch{} await ns.sleep(200);
  }
}
