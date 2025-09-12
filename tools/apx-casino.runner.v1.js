/** apx-casino.runner.v1.js (HOTFIX: lock uses *.txt) */
export async function main(ns){
  ns.disableLog('sleep');
  const F=ns.flags([['goal',1e9],['script','casino.js'],['alt','bitburner-scripts-main/casino.js'],['args',''],['watch',5000],['log',true],['lock','apx.lock.casino.txt']]);
  const print=(...a)=>{ if(F.log) ns.print('[casino]',...a); };
  let LOCK = String(F.lock||'apx.lock.casino.txt');
  if (!LOCK.endsWith('.txt') && !LOCK.endsWith('.js')) LOCK += '.txt';
  const readPid=()=>{ try{ return Number(ns.read(LOCK)||0);}catch{return 0;} };
  const alive=(pid)=> ns.ps('home').some(p=>p.pid===pid);
  const old=readPid(); if(old&&alive(old)) return ns.tprint(`[casino] already running (PID ${old})`);
  let target = null;
  if (ns.fileExists(F.script,'home')) target = F.script;
  else if (ns.fileExists(F.alt,'home')) target = F.alt;
  else { ns.tprint(`[casino] casino.js が見つかりません。home に配置してください（例: ${F.script}）`); return; }
  ns.write(LOCK,String(ns.pid),'w');
  ns.atExit(()=>{ try{ const cur=readPid(); if(cur===ns.pid) ns.rm(LOCK,'home'); }catch{} });
  const goal = Math.max(1, Number(F.goal)||1e9);
  const money=()=>ns.getServerMoneyAvailable('home');
  if (money() >= goal) return ns.tprint(`[casino] 既に目標資金に到達: $${money().toLocaleString()}`);
  const args = String(F.args||'').trim().split(/\s+/).filter(Boolean);
  const pid = ns.run(target, 1, ...args);
  if(pid===0){ ns.tprint(`[casino] 起動失敗: ${target}`); return; }
  ns.tprint(`[casino] 起動: ${target} (pid=${pid}) 目標=$${goal.toLocaleString()}`); print('args', JSON.stringify(args));
  let last = money(), stagnation=0;
  while(true){
    const m=money();
    if(m>=goal){ ns.tprint(`[casino] 目標達成 $${m.toLocaleString()} >= $${goal.toLocaleString()}`); break; }
    if(!alive(pid)){ ns.tprint(`[casino] casino.js が終了しました。現在: $${m.toLocaleString()}`); break; }
    stagnation = (m<=last)?(stagnation+1):0; last=m;
    if(stagnation>36){ ns.tprint(`[casino] 進展が見られませんでした（約{:.1f}分）。中断します。`.replace('{:.1f}', (F.watch*stagnation/60000).toFixed(1))); break; }
    await ns.sleep(Math.max(1000, Number(F.watch)||5000));
  }
}
