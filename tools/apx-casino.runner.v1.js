
export async function main(ns){
  const F=ns.flags([['goal',1e9],['minTravel',200000],['ban','apx.state.casino.banned.txt']]);
  if(ns.fileExists(String(F.ban||'apx.state.casino.banned.txt'),'home')){ ns.print('[casino] banned; skip'); return; }
  if(ns.getServerMoneyAvailable('home') >= Number(F.goal||1e9)) return;
  if (!ns.fileExists('casino.js','home')){ ns.print('[casino] casino.js not found'); return; }
  if (ns.getServerMoneyAvailable('home') < Number(F.minTravel||200000)){ ns.print('[casino] not enough for travel'); return; }
  // We don't control DOM here - just run user's casino.js and rely on its guards
  ns.run('casino.js',1);
}
