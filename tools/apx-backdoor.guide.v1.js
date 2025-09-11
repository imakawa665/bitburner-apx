/** apx-backdoor.guide.v1.js
 * バックドア候補を自動抽出し、最短connectコマンドを生成（Singularity不要）
 * @param {NS} ns
 */
export async function main(ns) {
  ns.disableLog('sleep');
  const FLAGS = ns.flags([['watch', 0]]);
  const SPECIAL = ['CSEC','avmnite-02h','I.I.I.I','run4theh111z','w0r1d_d43m0n'];

  const findPath = (target) => {
    const q = ['home'], parent = {home: null}, seen = new Set(['home']);
    while (q.length) {
      const cur = q.shift();
      for (const n of ns.scan(cur)) {
        if (seen.has(n)) continue;
        seen.add(n); parent[n] = cur; q.push(n);
        if (n === target) { q.length = 0; break; }
      }
    }
    if (!parent.hasOwnProperty(target)) return null;
    const path = []; let x = target;
    while (x) { path.push(x); x = parent[x]; }
    path.reverse(); return path;
  };
  const genCmd = (path) => { if (!path || path[0] !== 'home') return null; const hops=path.slice(1);
    return ['home', ...hops.map(h => `connect ${h}`), 'backdoor'].join('; '); };
  const toRow = (h) => { const s = ns.getServer(h); return { host:h, req:ns.getServerRequiredHackingLevel(h), rooted:ns.hasRootAccess(h), backdoored:s?.backdoorInstalled===true }; };
  const show = (rows) => { ns.clearLog(); ns.print('=== Backdoor Guide ===');
    for (const r of rows) { ns.print(`${r.host.padEnd(16)} | req:${String(r.req).padStart(3)} | root:${r.rooted?'Y':'-'} | backdoor:${r.backdoored?'Y':'-'} ${r.note||''}`); if(r.cmd) ns.print(`  → ${r.cmd}`); } ns.tail(); };

  while (true) {
    const me = ns.getPlayer().skills.hacking; const rows = [];
    for (const host of SPECIAL) {
      if (!ns.serverExists(host)) continue; const row = toRow(host);
      if (row.backdoored) { row.note='(済)'; rows.push(row); continue; }
      if (row.req > me)   { row.note=`(Hack ${row.req}必要)`; rows.push(row); continue; }
      if (!row.rooted)    { row.note='(root未取得)'; rows.push(row); continue; }
      const path = findPath(host); if (path) { row.cmd=genCmd(path); row.note='(準備OK: 端末に貼付)'; } else { row.note='(到達不可)'; }
      rows.push(row);
    }
    rows.sort((a,b)=>{ const ra=(a.backdoored?2:(a.cmd?0:1)), rb=(b.backdoored?2:(b.cmd?0:1)); if(ra!==rb) return ra-rb; return (a.req||0)-(b.req||0); });
    show(rows);
    const top = rows.find(r=>r.cmd); if (top?.cmd) ns.write('connect-backdoor.txt', top.cmd+'\n', 'w');
    if (!FLAGS.watch) break; await ns.sleep(Math.max(500, FLAGS.watch));
  }
}
