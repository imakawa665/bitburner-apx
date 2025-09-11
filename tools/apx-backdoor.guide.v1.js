/** apx-backdoor.guide.v1.js (v1.2)
 * - Singleton ロック: apx.lock.backdoor に PID を記録。既存が生きていれば即終了
 * - ns.tail() は初回のみ
 * - watch 間隔の指定: --watch <ms>（既定 3000）
 * @param {NS} ns
 */
export async function main(ns) {
  ns.disableLog('sleep');
  const F=ns.flags([['watch',3000],['lock','apx.lock.backdoor']]);
  const SELF = ns.getRunningScript().filename;
  const LOCK = String(F.lock||'apx.lock.backdoor');

  // --- Singleton lock (file-based) ---
  const readPid = ()=>{ try{ return Number(ns.read(LOCK)||0); }catch{return 0;} };
  const alive = (pid)=> ns.ps('home').some(p=>p.pid===pid && p.filename===SELF);
  const old = readPid();
  if (old && alive(old)) {
    ns.tprint(`[backdoor.guide] already running (PID ${old}). exit.`);
    return;
  }
  ns.write(LOCK, String(ns.pid), 'w');
  ns.atExit(()=>{ try{ const cur=readPid(); if(cur===ns.pid) ns.rm(LOCK,'home'); }catch{} });

  const SPECIAL=['CSEC','avmnite-02h','I.I.I.I','run4theh111z','w0r1d_d43m0n'].filter(h=>ns.serverExists(h));

  const find=(t)=>{ const q=['home'],p={home:null},seen=new Set(['home']); while(q.length){ const c=q.shift(); for(const n of ns.scan(c)){ if(seen.has(n))continue; seen.add(n); p[n]=c; q.push(n); if(n===t){ q.length=0; break; } } } if(!p.hasOwnProperty(t)) return null; const path=[]; let x=t; while(x){ path.push(x); x=p[x]; } path.reverse(); return path; };
  const gen=(path)=>{ if(!path||path[0]!=='home')return null; const hops=path.slice(1); return ['home',...hops.map(h=>`connect ${h}`),'backdoor'].join('; '); };
  const row=(h)=>{ const s=ns.getServer(h); return {host:h,req:ns.getServerRequiredHackingLevel(h),rooted:ns.hasRootAccess(h),back:s?.backdoorInstalled===true}; };
  const show=(rows)=>{ ns.clearLog(); ns.print(`=== Backdoor Guide (watch=${F.watch}ms) ===`); for(const r of rows){ ns.print(`${r.host.padEnd(16)} | req:${String(r.req).padStart(3)} | root:${r.rooted?'Y':'-'} | backdoor:${r.back?'Y':'-'} ${r.note||''}`); if(r.cmd) ns.print(`  → ${r.cmd}`);} };

  let tailed=false;
  while(true){
    const me=ns.getPlayer().skills.hacking; const rows=[];
    for(const h of SPECIAL){
      if(!ns.serverExists(h)) continue;
      const r=row(h);
      if(r.back){ r.note='(済)'; rows.push(r); continue; }
      if(r.req>me){ r.note=`(Hack ${r.req}必要)`; rows.push(r); continue; }
      if(!r.rooted){ r.note='(root未取得)'; rows.push(r); continue; }
      const path=find(h);
      if(path){ r.cmd=gen(path); r.note='(準備OK)'; }
      else r.note='(到達不可)';
      rows.push(r);
    }
    rows.sort((a,b)=>{ const ra=(a.back?2:(a.cmd?0:1)), rb=(b.back?2:(b.cmd?0:1)); if(ra!==rb) return ra-rb; return (a.req||0)-(b.req||0); });
    show(rows);
    if(!tailed){ ns.tail(); tailed=true; }
    const top=rows.find(r=>r.cmd);
    if(top?.cmd) ns.write('connect-backdoor.txt', top.cmd+'\n', 'w');
    if(!F.watch || Number(F.watch)<=0) break;
    await ns.sleep(Math.max(500, Number(F.watch)));
  }
}
