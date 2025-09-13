/** rooter/apx-rooter.auto.v1.js
 * Auto-root all servers you can, using available port crackers.
 */
export async function main(ns){
  ns.disableLog('sleep');
  const F=ns.flags([['interval',10000],['log',true]]);
  const print=(...a)=>{ if(F.log) ns.print('[rooter]',...a); };
  const crackers=[
    ['BruteSSH.exe', ns.brutessh?.bind(ns)],
    ['FTPCrack.exe', ns.ftpcrack?.bind(ns)],
    ['relaySMTP.exe', ns.relaysmtp?.bind(ns)],
    ['HTTPWorm.exe', ns.httpworm?.bind(ns)],
    ['SQLInject.exe', ns.sqlinject?.bind(ns)],
  ];
  const portsOpeners=()=>crackers.filter(([f])=>ns.fileExists(f,'home')).map(([,fn])=>fn).filter(Boolean);
  const scanAll=()=>{ const seen=new Set(['home']); const q=['home']; const order=[]; while(q.length){ const c=q.shift(); order.push(c); for(const n of ns.scan(c)) if(!seen.has(n)){ seen.add(n); q.push(n);} } return order; };
  while(true){
    const openers=portsOpeners();
    for(const h of scanAll()){
      if(h==='home'||h==='darkweb') continue;
      if(ns.hasRootAccess(h)) continue;
      try{
        const need=ns.getServerNumPortsRequired(h);
        for(let i=0;i<Math.min(need,openers.length);i++) try{ openers[i](h);}catch{}
        if((openers.length)>=need){ ns.nuke(h); print('root',h); }
      }catch{}
    }
    await ns.sleep(Math.max(1000,Number(F.interval)||10000));
  }
}
