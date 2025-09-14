
export async function main(ns){
  const F=ns.flags([['interval',10000],['log',false]]); const log=(...a)=>{ if(F.log) ns.print('[rooter]',...a); };
  function tryRoot(h){
    const sv=ns.getServer(h); if(sv.hasAdminRights) return;
    let opened=0;
    try{ if(ns.fileExists('BruteSSH.exe','home')){ ns.brutessh(h); opened++; } }catch{}
    try{ if(ns.fileExists('FTPCrack.exe','home')){ ns.ftpcrack(h); opened++; } }catch{}
    try{ if(ns.fileExists('relaySMTP.exe','home')){ ns.relaysmtp(h); opened++; } }catch{}
    try{ if(ns.fileExists('HTTPWorm.exe','home')){ ns.httpworm(h); opened++; } }catch{}
    try{ if(ns.fileExists('SQLInject.exe','home')){ ns.sqlinject(h); opened++; } }catch{}
    if((sv.numOpenPortsRequired||0) <= opened && (sv.requiredHackingSkill||0)<=ns.getPlayer().skills.hacking){ try{ ns.nuke(h); log('rooted',h); }catch{} }
  }
  while(true){
    const seen=new Set(); const q=['home'];
    while(q.length){ const s=q.pop(); if(seen.has(s)) continue; seen.add(s); for(const n of ns.scan(s)) q.push(n); }
    for(const h of seen){ if(h!=='home') tryRoot(h); }
    await ns.sleep(Math.max(500,Number(F.interval)||10000));
  }
}
