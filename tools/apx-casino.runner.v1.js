/** apx-casino.runner.v1.js (v1.6.4) */
export async function main(ns){
  ns.disableLog('sleep');
  const F=ns.flags([['goal',1e9],['script','casino.js'],['alt','bitburner-scripts-main/casino.js'],['args',''],['watch',5000],['log',true],['lock','/Temp/apx.lock.casino.txt'],['minTravel',200000],['banLimit',1e10],['banFile','apx.state.casino.banned.txt'],['earnFile','apx.state.casino.earned.txt'],['failFile','apx.state.casino.failcount.txt'],['fastMs',3000],['failBan',2]]);
  const print=(...a)=>{ if(F.log) ns.print('[casino]',...a); };
  const money=()=>ns.getServerMoneyAvailable('home');
  const readNum=(f)=>{ try{ return Number(ns.read(f)||0);}catch{return 0;} };
  const write=(f,s)=>{ try{ ns.write(f,String(s),'w'); }catch{} };
  const inc=(f,d)=>{ write(f, readNum(f) + d ); };
  if (ns.fileExists(F.banFile,'home')) return ns.tprint(`[casino] disabled: ${String(ns.read(F.banFile)||'banned').trim()}`);
  const LOCK=String(F.lock||'/Temp/apx.lock.casino.txt'); const readPid=()=>{ try{ return Number(ns.read(LOCK)||0);}catch{return 0;} }; const alive=(pid)=> ns.ps('home').some(p=>p.pid===pid); const old=readPid(); if(old&&alive(old)) return ns.tprint(`[casino] already running (PID ${old})`); ns.write(LOCK,String(ns.pid),'w'); ns.atExit(()=>{ try{ const cur=readPid(); if(cur===ns.pid) ns.rm(LOCK); }catch{} });
  const goal = Math.max(1, Number(F.goal)||1e9); if (money() >= goal) return ns.tprint(`[casino] 既に目標資金に到達: $${money().toLocaleString()}`);
  const need = Math.max(1, Number(F.minTravel)||200000);
  while (money() < need) { if (ns.fileExists(F.banFile,'home')) return; await ns.sleep(Math.max(1000, Number(F.watch)||5000)); }
  let target = null; if (ns.fileExists(F.script,'home')) target = F.script; else if (ns.fileExists(F.alt,'home')) target = F.alt; else { ns.tprint(`[casino] casino.js が見つかりません`); return; }
  const args = String(F.args||'').trim().split(/\s+/).filter(Boolean);
  const prevEarn = readNum(F.earnFile);
  if (prevEarn >= Number(F.banLimit||1e10)*0.999) { write(F.banFile, `banned (earned≈$${prevEarn.toLocaleString()})`); return ns.tprint(`[casino] 10b cap のため無効化（推定累計=$${prevEarn.toLocaleString()}）`); }
  const startTs=Date.now(); const pid = ns.run(target, 1, ...args);
  if(pid===0){ ns.tprint(`[casino] 起動失敗: ${target}`); inc(F.failFile,1); return; }
  ns.tprint(`[casino] 起動: ${target} (pid=${pid}) 目標=$${goal.toLocaleString()}  最低資金$${need.toLocaleString()}`);
  let last=money(), earned=0, lastSave=Date.now();
  while(true){
    if (ns.fileExists(F.banFile,'home')) { if (alive(pid)) ns.kill(pid); break; }
    const m=money(); if(m>last){ earned += (m-last); } last=m;
    if (Date.now()-lastSave>5000) { lastSave=Date.now(); write(F.earnFile, readNum(F.earnFile)+earned); }
    const total=readNum(F.earnFile)+earned;
    if(total >= Number(F.banLimit||1e10)*0.999){ write(F.earnFile,total); write(F.banFile, `banned (earned≈$${total.toLocaleString()})`); if(alive(pid)) ns.kill(pid); ns.tprint(`[casino] 10b cap 到達と推定（累計≈$${total.toLocaleString()}）`); break; }
    if(m>=goal){ ns.tprint(`[casino] 目標達成 $${m.toLocaleString()} >= $${goal.toLocaleString()}`); break; }
    if(!alive(pid)){ const life=Date.now()-startTs; if (life < Number(F.fastMs)||3000) inc(F.failFile,1); const fails = readNum(F.failFile); if (fails >= Number(F.failBan)||2) { write(F.banFile, `disabled due to repeated early failures (fails=${fails})`); ns.tprint(`[casino] 早期失敗が連続（${fails}回）。以降は無効化します。`); } break; }
    await ns.sleep(Math.max(1000, Number(F.watch)||5000));
  }
  if (earned>0) write(F.earnFile, readNum(F.earnFile)+earned);
}
