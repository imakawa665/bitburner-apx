
/** tools/apx-casino.runner.v1.js - safe launcher with ban guard */
export async function main(ns){
  const F=ns.flags([['goal',1e9],['minTravel',200000],['ban','apx.state.casino.banned.txt']]);
  if(ns.fileExists(String(F.ban||'apx.state.casino.banned.txt'),'home')){ ns.print('[casino] banned; skip'); return; }
  if (ns.getServerMoneyAvailable('home') >= Number(F.goal||1e9)) return;
  if (!ns.fileExists('casino.js','home')){ ns.print('[casino] casino.js not found'); return; }
  // Guard: require travel cost
  if (ns.getServerMoneyAvailable('home') < Number(F.minTravel||200000)) return;
  ns.run('casino.js',1);
}
