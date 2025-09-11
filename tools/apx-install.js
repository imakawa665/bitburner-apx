/** apx-install.js
 * Public Raw から APX 一式を wget で自動インストール
 * @param {NS} ns
 */
export async function main(ns) {
  ns.disableLog("sleep");
  const f = ns.flags([["user",""],["repo",""],["branch","main"],["raw",""],["start",false]]);
  const FILES = [
    "core/apx-core.nano.v2.06.js",
    "core/apx-core.micro.v2.07.js",
    "core/apx-core.micro.v2.08.js",
    "core/apx-core.micro.v2.09.js",
    "rooter/apx-root0.js",
    "rooter/apx-rooter.nano.v1.js",
    "rooter/apx-rooter.auto.v1.js",
    "workers/apx-w1.js",
    "workers/apx-g1.js",
    "workers/apx-h1.js",
    "workers/apx-loop-hgw.nano.js",
    "tools/apx-backdoor.guide.v1.js",
    "tools/apx-pserv.nano.v1.js",
    "tools/apx-pserv.auto.v1.js",
    "tools/apx-hacknet.nano.v1.js",
    "tools/apx-hgw-batcher.v1.js",
    "tools/apx-hud.lily.v1.js",
    "tools/apx-install.js",
    "tools/apx-startup.lily.js",
    "singularity/apx-autopilot.v2.05.js",
    "singularity/apx-sing-actions.js",
    "singularity/apx-remote-send.js",
  ];
  let base = f.raw;
  if (!base) {
    if (!f.user || !f.repo) return ns.tprint("usage: run apx-install.js --user <user> --repo <repo> [--branch main] [--start]");
    base = `https://raw.githubusercontent.com/${f.user}/${f.repo}/${f.branch}/`;
  }
  let ok=0, ng=0;
  for (const rel of FILES) {
    const url = base + rel;
    const dest = rel;
    try {
      const r = await ns.wget(url, dest, "home");
      if (r) { ok++; ns.print("OK  ", dest); }
      else   { ng++; ns.print("NG  ", dest); }
      await ns.sleep(20);
    } catch {
      ng++; ns.print("ERR ", dest);
    }
  }
  ns.tprint(`[apx-install] done: OK=${ok}, NG=${ng}`);
  if (f.start) {
    if (!ns.isRunning("tools/apx-hud.lily.v1.js", "home")) ns.run("tools/apx-hud.lily.v1.js");
    if (!ns.isRunning("rooter/apx-rooter.auto.v1.js", "home")) ns.run("rooter/apx-rooter.auto.v1.js", 1, "--interval", 10000, "--log");
    if (!ns.isRunning("core/apx-core.micro.v2.09.js", "home")) ns.run("core/apx-core.micro.v2.09.js", 1, "--allRooted", "true");
  }
}
