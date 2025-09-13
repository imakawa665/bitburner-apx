/** tools/apx-stanek.charge.v1.js */
export async function main(ns){
  ns.disableLog('sleep');
  if(!ns.stanek){ ns.tprint('[stanek] API not available'); return; }
  while(true){
    try{
      const fr=ns.stanek.activeFragments(); for(const f of fr){ try{ await ns.stanek.chargeFragment(f.x, f.y); }catch{} }
    }catch{} await ns.sleep(1000);
  }
}
