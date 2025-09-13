
/** tools/apx-healthcheck.v1.js */
export async function main(ns){
  const files=[
    "core/apx-core.micro.v2.09.js","rooter/apx-rooter.auto.v1.js",
    "workers/apx-w1.js","workers/apx-g1.js","workers/apx-h1.js","workers/apx-loop-hgw.nano.js",
    "tools/apx-hud.lily.v1.js","tools/apx-hgw-batcher.v1.2.js","tools/apx-hacknet.nano.v1.js",
    "tools/apx-pserv.auto.v1.js","tools/apx-pserv.nano.v1.js","tools/apx-share.nano.v1.js","tools/apx-share.manager.v1.js","tools/apx-spread.remote.v1.js",
    "tools/apx-prog.advice.v1.js","tools/apx-hash.spender.v1.js","tools/apx-darkweb.autobuyer.v1.js",
    "tools/apx-oneclick.lily.js","tools/apx-autopilot.full.v1.js"
  ];
  let ok=0, warn=0, err=0;
  for(const f of files){
    const ex=ns.fileExists(f,'home');
    if(!ex){ ns.tprint(`[health] WARN: missing ${f}`); warn++; }
    else ok++;
  }
  ns.tprint(`[health] SUMMARY OK=${ok} WARN=${warn} ERR=${err}`);
}
