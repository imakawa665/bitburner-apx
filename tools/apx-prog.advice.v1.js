
export async function main(ns){
  const owned=['NUKE.exe','BruteSSH.exe','FTPCrack.exe','relaySMTP.exe','HTTPWorm.exe','SQLInject.exe'].filter(x=>ns.fileExists(x,'home'));
  const missing=['BruteSSH.exe','FTPCrack.exe','relaySMTP.exe','HTTPWorm.exe','SQLInject.exe'].filter(x=>!ns.fileExists(x,'home'));
  ns.tprint('[prog.advice] Owned: '+(owned.join(', ')||'none'));
  ns.tprint('[prog.advice] Missing: '+(missing.join(', ')||'none'));
  if(missing.length) ns.tprint("[prog.advice] 手順ヒント: Terminal → 'buy -l' で価格一覧, 'connect darkweb' → 'buy -a' で一括購入 → rooter 実行");
  const roots=['n00dles','foodnstuff'].filter(h=>ns.serverExists(h));
  if(roots.length) ns.tprint('[prog.advice] 0ポート候補: '+roots.join(', ')+' （NUKE.exe があれば即root可能）');
}
