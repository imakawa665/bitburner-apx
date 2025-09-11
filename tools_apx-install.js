/** apx-install.js
 * GitHub / Raw ベースから APX 一式を wget 自動インストール
 * 使い方:
 *   run apx-install.js --user <GitHubユーザー> --repo <リポ名> [--branch main] [--raw <RAW_BASE_URL>] [--start]
 * 例:
 *   run apx-install.js --user yourname --repo bitburner-apx --start
 *   run apx-install.js --raw https://gist.githubusercontent.com/xxx/yyy/raw/ --start
 * 備考:
 *  - Private repo は wget 不可（認証ヘッダを付けられないため）
 *  - --raw を使うと直指定のベースURLから取得可能（末尾にサブパスを連結）
 *  - --start 指定時は HUD / rooter / micro を起動
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
    const dest = rel; // サブフォルダ名付きで保存
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