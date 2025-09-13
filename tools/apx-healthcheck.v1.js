/** tools/apx-healthcheck.v1.js */
export async function main(ns){
  const reqFiles=['core/apx-core.micro.v2.09.js','rooter/apx-rooter.auto.v1.js','tools/apx-oneclick.lily.js','tools/apx-hud.lily.v1.js'];
  let ok=0,warn=0,err=0; for(const f of reqFiles){ if(ns.fileExists(f,'home')) ok++; else { ns.tprint(`[health] WARN: missing: ${f}`); warn++; } }
  if(!ns.ps('home').some(p=>p.filename==='tools/apx-hud.lily.v1.js')){ ns.tprint('[health] WARN: not running: tools/apx-hud.lily.v1.js (run tools/apx-oneclick.lily.js)'); warn++; }
  ns.tprint(`[health] SUMMARY OK=${ok} WARN=${warn} ERR=${err}`);
}
