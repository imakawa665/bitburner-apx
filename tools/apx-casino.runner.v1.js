/** apx-casino.runner.v1.js (v1.6.2 HOTFIX)
 * - Waits until bankroll >= minTravel (default $200k) before launching casino.js
 * - Uses /Temp lock file and stays alive while waiting so daemon won't re-spawn it
 */
export async function main(ns){
  ns.disableLog('sleep');
  const F=ns.flags([
    ['goal',1e9],
    ['script','casino.js'],
    ['alt','bitburner-scripts-main/casino.js'],
    ['args',''],
    ['watch',5000],
    ['log',true],
    ['lock','/Temp/apx.lock.casino.txt'],
    ['minTravel', 200000]  // Travel to Aevum requires $200k
  ]);
  const print=(...a)=>{ if(F.log) ns.print('[casino]',...a); };
  const LOCK=String(F.lock||'/Temp/apx.lock.casino.txt');
  const money=()=>ns.getServerMoneyAvailable('home');

  // singleton lock
  const readPid=()=>{ try{ return Number(ns.read(LOCK)||0);}catch{return 0;} };
  const alive=(pid)=> ns.ps('home').some(p=>p.pid===pid);
  const old=readPid(); if(old&&alive(old)) return ns.tprint(`[casino] already running (PID ${old})`);
  ns.write(LOCK,String(ns.pid),'w');
  ns.atExit(()=>{ try{ const cur=readPid(); if(cur===ns.pid) ns.rm(LOCK); }catch{} });

  const goal = Math.max(1, Number(F.goal)||1e9);
  if (money() >= goal) return ns.tprint(`[casino] 既に目標資金に到達: $${money().toLocaleString()}`);

  // --- NEW: wait until bankroll is enough to travel ---
  const need = Math.max(1, Number(F.minTravel)||200000);
  while (money() < need) {
    const m = money();
    ns.clearLog();
    ns.print(`[casino] Waiting bankroll to reach $${need.toLocaleString()} (current $${m.toLocaleString()})`);
    ns.print(`[casino] Tip: oneclick is running micro/spread to earn starter funds.`);
    await ns.sleep(Math.max(1000, Number(F.watch)||5000));
  }

  // choose casino.js path
  let target = null;
  if (ns.fileExists(F.script,'home')) target = F.script;
  else if (ns.fileExists(F.alt,'home')) target = F.alt;
  else { ns.tprint(`[casino] casino.js が見つかりません。home に配置してください（例: ${F.script}）`); return; }

  // pass-through args
  const args = String(F.args||'').trim().split(/\s+/).filter(Boolean);

  // launch
  const pid = ns.run(target, 1, ...args);
  if(pid===0){ ns.tprint(`[casino] 起動失敗: ${target}`); return; }
  ns.tprint(`[casino] 起動: ${target} (pid=${pid}) 目標=$${goal.toLocaleString()}  最低資金$${need.toLocaleString()}`);
  print('args', JSON.stringify(args));

  // monitor
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
