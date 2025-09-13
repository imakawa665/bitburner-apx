/** tools/apx-casino.runner.v1.js - safe runner */
export async function main(ns){
  const F=ns.flags([['goal',1e9],['minTravel',200000]]);
  const ban='apx.state.casino.banned.txt';
  if(ns.fileExists(ban,'home')){ ns.tprint('[casino] banned file present. skip.'); return; }
  if(ns.getServerMoneyAvailable('home')<Number(F.minTravel||200000)){ ns.tprint('[casino] not enough money to travel.'); return; }
  // Best-effort: try to run the user's casino.js once if present
  if(ns.fileExists('casino.js','home')){ const pid=ns.run('casino.js'); await ns.sleep(1000); ns.tprint(`[casino] started casino.js pid=${pid}`); }
  // guard
  if(ns.getServerMoneyAvailable('home')>=Number(F.goal||1e9)) ns.write(ban,'1','w');
}
