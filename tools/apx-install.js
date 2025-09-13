
/** tools/apx-install.js (v1.9.2) - 追加: faction.work.dom / share.manager */
export async function main(ns) {
  ns.disableLog("sleep");
  const f = ns.flags([["user",""],["repo",""],["branch","main"],["raw",""],["start",false],["retry",0]]);
  const FILES = [
    "core/apx-core.micro.v2.09.js","rooter/apx-rooter.auto.v1.js",
    "workers/apx-w1.js","workers/apx-g1.js","workers/apx-h1.js","workers/apx-loop-hgw.nano.js",
    "tools/apx-hud.lily.v1.js","tools/apx-hgw-batcher.v1.2.js","tools/apx-hacknet.nano.v1.js",
    "tools/apx-pserv.auto.v1.js","tools/apx-pserv.nano.v1.js","tools/apx-share.nano.v1.js","tools/apx-spread.remote.v1.js",
    "tools/apx-prog.advice.v1.js","tools/apx-hash.spender.v1.js",
    "tools/apx-cmd.pause.js","tools/apx-cmd.resume.js","tools/apx-cmd.status.js","tools/apx-cmd.pinTarget.js","tools/apx-cmd.mode.js",
    "tools/apx-oneclick.lily.js","tools/apx-daemon.autoadapt.v1.js","tools/apx-healthcheck.v1.js","tools/apx-install.js","tools/apx-startup.lily.js",
    "tools/apx-backdoor.guide.v1.js","tools/apx-casino.runner.v1.js",
    "tools/apx-faction.join.assist.v1.js","tools/apx-stanek.charge.v1.js","tools/apx-darkweb.autobuyer.v1.js",
    "tools/apx-autopilot.full.v1.js","tools/apx-backdoor.auto.dom.v1.js","tools/apx-study.train.dom.v1.js",
    "tools/apx-faction.work.dom.v1.js","tools/apx-share.manager.v1.js","tools/apx-pserv.scale.v1.js"
  ];
  let base = f.raw;
  if (!base) {
    if (!f.user || !f.repo) return ns.tprint("usage: run tools/apx-install.js --user <user> --repo <repo> [--branch main] [--start]");
    base = `https://raw.githubusercontent.com/${f.user}/${f.repo}/${f.branch}/`;
  }
  let ok=0, ng=0;
  for (const rel of FILES) {
    try {
      const url = base + rel;
      const r = await ns.wget(url, rel, "home");
      if (r) { ok++; ns.print("OK  ", rel); } else { ng++; ns.print("NG  ", rel); }
      await ns.sleep(20);
    } catch { ng++; ns.print("ERR ", rel); }
  }
  ns.tprint(`[apx-install] done: OK=${ok} NG=${ng} (branch=${f.branch})`);
  if (f.start) ns.run("tools/apx-oneclick.lily.js",1,"--profile","autofull");
}
