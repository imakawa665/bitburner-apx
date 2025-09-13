/** tools/apx-prog.advice.v1.js */
export async function main(ns){
  ns.disableLog('sleep');
  const owned=['NUKE.exe','BruteSSH.exe','FTPCrack.exe','relaySMTP.exe','HTTPWorm.exe','SQLInject.exe'].filter(f=>ns.fileExists(f,'home'));
  const miss=['BruteSSH.exe','FTPCrack.exe','relaySMTP.exe','HTTPWorm.exe','SQLInject.exe'].filter(f=>!ns.fileExists(f,'home'));
  const zeroPorts=['n00dles','foodnstuff']; ns.tprint(`[prog.advice] Owned: ${owned.join(', ')||'(none)'}`); ns.tprint(`[prog.advice] Missing: ${miss.join(', ')||'(none)'}`); ns.tprint(`[prog.advice] 0ポート候補: ${zeroPorts.join(', ')} （NUKE.exe があれば即root可能）`); ns.tprint(`[prog.advice] 手順ヒント: Terminal → 'buy -l' で価格一覧, 'connect darkweb' → 'buy NUKE.exe' → rooter を実行`);
}
