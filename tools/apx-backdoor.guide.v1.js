/** apx-backdoor.guide.v1.js
 * バックドア候補を抽出し、最短connectコマンドを提示（Singularity不要）
 * @param {NS} ns
 */
export async function main(ns) {
  ns.disableLog('sleep'); const F=ns.flags([['watch',0]]); const SPECIAL=['CSEC','avmnite-02h','I.I.I.I','run4theh111z','w0r1d_d43m0n'];
  const find=(t)=>{ const q=['home'],p={home:null},seen=new Set(['home']); while(q.length){ const c=q.shift(); for(const n of ns.scan(c)){ if(seen.has(n))continue; seen.add(n); p[n]=c; q.push(n); if(n===t){ q.length=0; break; } } } if(!p.hasOwnProperty(t)) return null; const path=[]; let x=t; while(x){ path.push(x); x=p[x]; } path.reverse(); return path; };
  const gen=(path)=>{ if(!path||path[0]!=='home')return null; const hops=path.slice(1); return ['home',...hops.map(h=>`connect ${h}`),'backdoor'].join('; '); };
  const row=(h)=>{ const s=ns.getServer(h); return {host:h,req:ns.getServerRequiredHackingLevel(h),rooted:ns.hasRootAccess(h),back:s?.backdoorInstalled===true}; };
  const show=(rows)=>{ ns.clearLog(); ns.print('=== Backdoor Guide ==='); for(const r of rows){ ns.print(`${r.host.padEnd(16)} | req:${String(r.req).padStart(3)} | root:${r.rooted?'Y':'-'} | backdoor:${r.back?'Y':'-'} ${r.note||''}`); if(r.cmd) ns.print(`  → ${r.cmd}`);} ns.tail(); };
  while(true){ const me=ns.getPlayer().skills.hacking; const rows=[]; for(const h of SPECIAL){ if(!ns.serverExists(h)) continue; const r=row(h); if(r.back){ r.note='(済)'; rows.push(r); continue; } if(r.req>me){ r.note=`(Hack ${r.req}必要)`; rows.push(r); continue; } if(!r.rooted){ r.note='(root未取得)'; rows.push(r); continue; } const path=find(h); if(path){ r.cmd=gen(path); r.note='(準備OK)'; } else r.note='(到達不可)'; rows.push(r); }
    rows.sort((a,b)=>{ const ra=(a.back?2:(a.cmd?0:1)), rb=(b.back?2:(b.cmd?0:1)); if(ra!==rb) return ra-rb; return (a.req||0)-(b.req||0); }); show(rows); const top=rows.find(r=>r.cmd); if(top?.cmd) ns.write('connect-backdoor.txt', top.cmd+'\n', 'w'); if(!F.watch) break; await ns.sleep(Math.max(500,F.watch)); }
}
