/** apx-rooter.auto.v1.js
 * 常駐型ルーター（新規プログラム入手やHack上昇を検知して定期的にNUKE）
 * @param {NS} ns
 */
export async function main(ns) {
  const FLAGS = ns.flags([['interval', 10000], ['depth', 1e9], ['log', false]]);
  const print = (...a) => { if (FLAGS.log) ns.tprint(...a); };
  const snapshot = () => ({
    me: ns.getPlayer().skills.hacking,
    has: {
      NUKE: ns.fileExists('NUKE.exe','home'),
      SSH: ns.fileExists('BruteSSH.exe','home'),
      FTP: ns.fileExists('FTPCrack.exe','home'),
      SMTP: ns.fileExists('relaySMTP.exe','home'),
      HTTP: ns.fileExists('HTTPWorm.exe','home'),
      SQL: ns.fileExists('SQLInject.exe','home'),
    }
  });
  let prev = snapshot();

  while (true) {
    const now = snapshot();
    const openerCount = Object.values(now.has).filter(Boolean).length - (now.has.NUKE?1:0);
    const prevCount   = Object.values(prev.has).filter(Boolean).length - (prev.has.NUKE?1:0);
    const changed = (now.me !== prev.me) || (openerCount !== prevCount) || (now.has.NUKE !== prev.has.NUKE);

    if (changed) {
      const openers = [];
      if (now.has.SSH) openers.push((h)=>ns.brutessh(h));
      if (now.has.FTP) openers.push((h)=>ns.ftpcrack(h));
      if (now.has.SMTP) openers.push((h)=>ns.relaysmtp(h));
      if (now.has.HTTP) openers.push((h)=>ns.httpworm(h));
      if (now.has.SQL) openers.push((h)=>ns.sqlinject(h));

      const me = now.me;
      const seen = new Set(['home']); const q = [['home',0]];
      const purchased = new Set((ns.getPurchasedServers?.() ?? []));
      const skip = new Set(['home','darkweb', ...purchased]);
      let rooted=0, tried=0;

      while (q.length) {
        const [cur, d] = q.shift();
        for (const n of ns.scan(cur)) {
          if (seen.has(n)) continue; seen.add(n);
          if (d+1 <= FLAGS.depth) q.push([n, d+1]);
          if (skip.has(n)) continue;
          if (!now.has.NUKE) continue;
          const req = ns.getServerRequiredHackingLevel(n);
          const need = ns.getServerNumPortsRequired(n);
          if (ns.hasRootAccess(n)) continue;
          if (req > me) continue;
          if (need > openers.length) continue;
          for (const fn of openers) { try { fn(n); } catch {} }
          try { ns.nuke(n); } catch {}
          tried++; if (ns.hasRootAccess(n)) { rooted++; if (FLAGS.log) ns.tprint(`Rooted: ${n} (ports ${need}/${openers.length}, req ${req})`); }
        }
      }
      ns.tprint(`[rooter.auto] rooted+${rooted} / tried ${tried} / me=${me} / openers=${openers.length} / NUKE=${now.has.NUKE?'yes':'no'}`);
      prev = now;
    }
    await ns.sleep(FLAGS.interval);
  }
}
