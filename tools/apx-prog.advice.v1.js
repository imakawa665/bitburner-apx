
export async function main(ns){
  const owned=['NUKE.exe','BruteSSH.exe','FTPCrack.exe','relaySMTP.exe','HTTPWorm.exe','SQLInject.exe'].filter(x=>ns.fileExists(x,'home'));
  const missing=['BruteSSH.exe','FTPCrack.exe','relaySMTP.exe','HTTPWorm.exe','SQLInject.exe'].filter(x=>!ns.fileExists(x,'home'));
  ns.tprint('[prog.advice] Owned: '+(owned.join(', ')||'none'));
  ns.tprint('[prog.advice] Missing: '+(missing.join(', ')||'none'));
  if(missing.length) ns.tprint(`[prog.advice] 手順: Terminal -> 'buy -l' で価格確認 / 'connect darkweb' -> 'buy -a' が安全（SF4なし）`);
}
