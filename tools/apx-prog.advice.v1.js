
export async function main(ns){
  const owned=['NUKE.exe','BruteSSH.exe','FTPCrack.exe','relaySMTP.exe','HTTPWorm.exe','SQLInject.exe'].filter(x=>ns.fileExists(x,'home'));
  const missing=['BruteSSH.exe','FTPCrack.exe','relaySMTP.exe','HTTPWorm.exe','SQLInject.exe'].filter(x=>!ns.fileExists(x,'home'));
  ns.tprint('[prog.advice] Owned: '+(owned.join(', ')||'none'));
  ns.tprint('[prog.advice] Missing: '+(missing.join(', ')||'none'));
  if(missing.length) ns.tprint("[prog.advice] 手順: Terminalで 'buy -l' → 'connect darkweb' → 'buy -a' で一括購入可。NUKE後に rooter を実行。");
}
