
/** 安全ランチャ：所持金が目標到達 or BANフラグで即停止 */
export async function main(ns){
  const F=ns.flags([['goal',1e9],['minTravel',200000],['ban','apx.state.casino.banned.txt']]);
  const goal=Number(F.goal||1e9);
  if(ns.fileExists(String(F.ban||'apx.state.casino.banned.txt'),'home')){ ns.print('[casino] banned; skip'); return; }
  if(ns.getServerMoneyAvailable('home') >= goal) return;
  if(!ns.fileExists('casino.js','home')){ ns.print('[casino] casino.js not found'); return; }
  if(ns.getServerMoneyAvailable('home') < Number(F.minTravel||200000)){ ns.print('[casino] not enough cash to travel'); return; }
  ns.run('casino.js',1); // casino.js 側の自動停止ロジックに委任
}
