/** apx-rooter.nano.v1.js
 * 超軽量ルーター（1回実行で到達可能サーバを一括NUKE）— Singularity不要
 * @param {NS} ns
 */
export async function main(ns) {
  const FLAGS = ns.flags([['log', false], ['depth', 1e9]]);
  const print = (...a) => { if (FLAGS.log) ns.tprint(...a); };

  const openers = [
    ['BruteSSH.exe', (h)=>ns.brutessh(h)],
    ['FTPCrack.exe', (h)=>ns.ftpcrack(h)],
    ['relaySMTP.exe', (h)=>ns.relaysmtp(h)],
    ['HTTPWorm.exe', (h)=>ns.httpworm(h)],
    ['SQLInject.exe', (h)=>ns.sqlinject(h)],
  ].filter(([prog]) => ns.fileExists(prog,'home'));
  const openerCount = openers.length;
  const hasNUKE = ns.fileExists('NUKE.exe','home');
  const me = ns.getPlayer().skills.hacking;

  const seen = new Set(['home']); const q = [['home',0]]; const all=[];
  while (q.length) {
    const [cur, d] = q.shift();
    for (const n of ns.scan(cur)) {
      if (seen.has(n)) continue; seen.add(n);
      if (d+1 <= FLAGS.depth) q.push([n, d+1]);
      all.push([n, d+1]);
    }
  }
  const purchased = new Set((ns.getPurchasedServers?.() ?? []));
  const skip = new Set(['home','darkweb', ...purchased]);

  let rooted = 0, tried = 0, skipped = 0;
  for (const [h, dep] of all) {
    if (skip.has(h)) { skipped++; continue; }
    const req = ns.getServerRequiredHackingLevel(h);
    const need = ns.getServerNumPortsRequired(h);
    if (ns.hasRootAccess(h)) { continue; }
    if (!hasNUKE) { skipped++; continue; }
    if (req > me) { skipped++; continue; }
    if (need > openerCount) { skipped++; continue; }

    for (const [,fn] of openers) { try { fn(h); } catch {} }
    try { ns.nuke(h); } catch {}

    tried++;
    if (ns.hasRootAccess(h)) { rooted++; print(`Rooted: ${h} (ports ${need}/${openerCount}, req ${req}, depth ${dep})`); }
  }

  ns.tprint(`[rooter.nano] rooted=${rooted}, tried=${tried}, skipped=${skipped}, openers=${openerCount}, NUKE=${hasNUKE?'yes':'no'}`);
}
