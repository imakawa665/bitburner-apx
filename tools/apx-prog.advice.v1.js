/** tools/apx-prog.advice.v1.js - show missing port crackers & tips */
export async function main(ns){
  const owned=['NUKE.exe','BruteSSH.exe','FTPCrack.exe','relaySMTP.exe','HTTPWorm.exe','SQLInject.exe'].filter(f=>ns.fileExists(f,'home'));
  const miss=['BruteSSH.exe','FTPCrack.exe','relaySMTP.exe','HTTPWorm.exe','SQLInject.exe'].filter(f=>!ns.fileExists(f,'home'));
  ns.tprint(`[prog.advice] Owned: ${owned.join(', ')||'(none)'}`);
  ns.tprint(`[prog.advice] Missing: ${miss.join(', ')||'(none)'}`);
  if(miss.length>0) ns.tprint(`[prog.advice] 手順ヒント: Terminal → 'buy -l' で価格一覧, 'connect darkweb' → 'buy tor' → 'buy -a'`);
}
