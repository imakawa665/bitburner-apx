
/** apx-casino.runner.v1.js (v1.6.4 HOTFIX-2)
 * - Wait until bankroll >= minTravel
 * - Persist earnings / ban near $10b
 * - Mark ban after 2 fast early failures
 * - Kill self if ban detected mid-run
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
    ['minTravel', 200000],
    ['banLimit', 1e10],
    ['banFile','apx.state.casino.banned.txt'],
    ['earnFile','apx.state.casino.earned.txt'],
    ['failFile','apx.state.casino.failcount.txt'],
    ['fastMs', 3000],        // early-exit threshold
    ['failBan', 2]           // fast fails needed to ban
  ]);
  const print=(...a)=>{ if(F.log) ns.print('[casino]',...a); };
  const money=()=>ns.getServerMoneyAvailable('home');
  const readNum=(f)=>{ try{ return Number(ns.read(f)||0);}catch{return 0;} };
  const write=(f,s)=>{ try{ ns.write(f,String(s),'w'); }catch{} };
  const inc=(f,d)=>{ write(f, readNum(f) + d ); };

  // BAN persistence
  if (ns.fileExists(F.banFile,'home')) return ns.tprint(`[casino] disabled: ${String(ns.read(F.banFile)||'banned').trim()}`);

  // singleton lock
  const LOCK=String(F.lock||'/Temp/apx.lock.casino.txt');
  const readPid=()=>{ try{ return Number(ns.read(LOCK)||0);}catch{return 0;} };
  const alive=(pid)=> ns.ps('home').some(p=>p.pid===pid);
  const old=readPid(); if(old&&alive(old)) return ns.tprint(`[casino] already running (PID ${old})`);
  ns.write(LOCK,String(ns.pid),'w');
  ns.atExit(()=>{ try{ const cur=readPid(); if(cur===ns.pid) ns.rm(LOCK); }catch{} });

  const goal = Math.max(1, Number(F.goal)||1e9);
  if (money() >= goal) return ns.tprint(`[casino] 既に目標資金に到達: $${money().toLocaleString()}`);

  // bankroll wait
  const need = Math.max(1, Number(F.minTravel)||200000);
  while (money() < need) {
    if (ns.fileExists(F.banFile,'home')) return; // disabled while waiting
    const m = money();
    ns.clearLog();
    ns.print(`[casino] Waiting bankroll to reach $${need.toLocaleString()} (current $${m.toLocaleString()})`);
    await ns.sleep(Math.max(1000, Number(F.watch)||5000));
  }

  // choose script
  let target = null;
  if (ns.fileExists(F.script,'home')) target = F.script;
  else if (ns.fileExists(F.alt,'home')) target = F.alt;
  else { ns.tprint(`[casino] casino.js が見つかりません。home に配置してください（例: ${F.script}）`); return; }

  const args = String(F.args||'').trim().split(/\s+/).filter(Boolean);

  // Early-calc: if we previously earned near cap, disable
  const prevEarn = readNum(F.earnFile);
  if (prevEarn >= Number(F.banLimit||1e10)*0.999) {
    write(F.banFile, `banned (earned≈$${prevEarn.toLocaleString()})`);
    return ns.tprint(`[casino] 10b cap のため無効化（推定累計=$${prevEarn.toLocaleString()}）`);
  }

  // launch and monitor
  const startTs = Date.now();
  const pid = ns.run(target, 1, ...args);
  if(pid===0){ ns.tprint(`[casino] 起動失敗: ${target}`); inc(F.failFile,1); return; }
  ns.tprint(`[casino] 起動: ${target} (pid=${pid}) 目標=$${goal.toLocaleString()}  最低資金$${need.toLocaleString()}`);
  print('args', JSON.stringify(args));

  let last = money(), stagnation=0, earned=0, lastSave=Date.now();
  while(true){
    if (ns.fileExists(F.banFile,'home')) { if (alive(pid)) ns.kill(pid); break; }
    const m=money();
    if(m>last){ const delta = m-last; earned += delta; } // count positive deltas
    last=m;

    // save progress periodically
    if (Date.now()-lastSave > 5000) { lastSave=Date.now(); const total = readNum(F.earnFile) + earned; write(F.earnFile, total); }

    // cap check
    const total = readNum(F.earnFile) + earned;
    if(total >= Number(F.banLimit||1e10)*0.999){
      write(F.earnFile, total);
      write(F.banFile, `banned (earned≈$${total.toLocaleString()})`);
      if (alive(pid)) ns.kill(pid);
      ns.tprint(`[casino] 10b cap 到達と推定（累計≈$${total.toLocaleString()}）。以降は自動起動しません。`);
      break;
    }

    if(m>=goal){ ns.tprint(`[casino] 目標達成 $${m.toLocaleString()} >= $${goal.toLocaleString()}`); break; }

    if(!alive(pid)){
      const life = Date.now()-startTs;
      if (life < Number(F.fastMs)||3000) inc(F.failFile,1);
      const fails = readNum(F.failFile);
      if (fails >= Number(F.failBan)||2) {
        write(F.banFile, `disabled due to repeated early failures (fails=${fails})`);
        ns.tprint(`[casino] 早期失敗が連続（${fails}回）。以降は無効化します。`);
      } else {
        ns.tprint(`[casino] casino.js が終了しました。現在: $${m.toLocaleString()}（fails=${fails}）`);
      }
      break;
    }

    stagnation = (m<=last)?(stagnation+1):0;
    if(stagnation>36){ ns.tprint(`[casino] 進展が見られませんでした（約{:.1f}分）。中断します。`.replace('{:.1f}', (F.watch*stagnation/60000).toFixed(1))); break; }
    await ns.sleep(Math.max(1000, Number(F.watch)||5000));
  }

  if (earned>0) write(F.earnFile, readNum(F.earnFile)+earned);
}
