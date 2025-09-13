/** tools/apx-healthcheck.v1.js (v1.1) */
export async function main(ns){
  const req=['core/apx-core.micro.v2.09.js','rooter/apx-rooter.auto.v1.js','tools/apx-oneclick.lily.js','tools/apx-hud.lily.v1.js'];
  let ok=0,w=0,e=0; for(const f of req){ if(ns.fileExists(f,'home')) ok++; else { ns.tprint(`[health] WARN missing: ${f}`); w++; } }
  const running=['rooter/apx-rooter.auto.v1.js','core/apx-core.micro.v2.09.js','tools/apx-hud.lily.v1.js','tools/apx-autopilot.full.v1.js','tools/apx-daemon.autoadapt.v1.js','tools/apx-darkweb.autobuyer.v1.js','tools/apx-hgw-batcher.v1.2.js'];
  for(const f of running){ const on=ns.ps('home').some(p=>p.filename===f); ns.tprint(`[health] RUNNING ${on?'Y':'-'}: ${f}`); }
  ns.tprint(`[health] SUMMARY OK=${ok} WARN=${w} ERR=${e}  (OKは「必須4ファイルの存在数」です)`);
}
