/** rooter/apx-rooter.auto.v1.js */
export async function main(ns){
  ns.disableLog('sleep'); ns.clearLog();
  const F=ns.flags([['interval',10000],['log',true]]);
  const log=(...a)=>{ if(F.log) ns.print('[rooter]',...a); };
  const cracks=[['BruteSSH.exe','brutessh'],['FTPCrack.exe','ftpcrack'],['relaySMTP.exe','relaysmtp'],['HTTPWorm.exe','httpworm'],['SQLInject.exe','sqlinject']];
  function have(name){ return ns.fileExists(name,'home'); }
  function scanAll(){ const seen=new Set(); const q=['home']; const out=[]; while(q.length){ const s=q.pop(); if(seen.has(s)) continue; seen.add(s); for(const n of ns.scan(s)) q.push(n); if(s!=='home') out.push(s);} return out; }
  while(true){
    for(const h of scanAll()){
      try{
        const sv=ns.getServer(h);
        if(!sv.hasAdminRights){
          try{ if(have('BruteSSH.exe')) ns.brutessh(h); if(have('FTPCrack.exe')) ns.ftpcrack(h); if(have('relaySMTP.exe')) ns.relaysmtp(h); if(have('HTTPWorm.exe')) ns.httpworm(h); if(have('SQLInject.exe')) ns.sqlinject(h); }catch{}
          try{ ns.nuke(h); }catch{}
          if(ns.hasRootAccess(h)) log('rooted',h);
        }
      }catch{}
      await ns.sleep(5);
    }
    await ns.sleep(Math.max(1000, Number(F.interval)||10000));
  }
}
