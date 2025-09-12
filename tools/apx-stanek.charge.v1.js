/** apx-stanek.charge.v1.js */
export async function main(ns){
  ns.disableLog('sleep');
  const F=ns.flags([['interval',50],['log',false]]);
  const log=(...a)=>{ if(F.log) ns.print('[stanek]',...a); };
  try{ if(!ns.stanek?.activeFragment) throw new Error('no stanek'); }catch{ ns.tprint('[stanek] Stanek API未解禁（BN8/SF8が必要）'); return; }
  ns.tprint('[stanek] charge loop start');
  while(true){
    let frags=[];
    try{ frags = ns.stanek.getFragments()?.filter(f=>f?.active) || []; }catch{ frags=[]; }
    if(frags.length===0){ log('no active fragments'); await ns.sleep(Math.max(20,Number(F.interval))); continue; }
    for(const f of frags){
      try{ const ok = ns.stanek.charge(f.x, f.y); if(F.log) ns.print('[stanek] charge',f.x,f.y, ok?'ok':'fail'); }catch{}
      await ns.sleep(Math.max(20,Number(F.interval)));
    }
  }
}
