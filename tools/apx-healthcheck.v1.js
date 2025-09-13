
/** tools/apx-healthcheck.v1.js (v1.1)
 * コア必須4件の存在チェック + 主要サービスの稼働状況を表示
 * NOTE: "OK=4" は「必須4ファイルが存在」の意味で**正常**です。
 */
export async function main(ns){
  const reqFiles=['core/apx-core.micro.v2.09.js','rooter/apx-rooter.auto.v1.js','tools/apx-oneclick.lily.js','tools/apx-hud.lily.v1.js'];
  let ok=0,warn=0,err=0; for(const f of reqFiles){ if(ns.fileExists(f,'home')) ok++; else { ns.tprint(`[health] WARN: missing: ${f}`); warn++; } }
  // running states
  const running=[
    'rooter/apx-rooter.auto.v1.js',
    'core/apx-core.micro.v2.09.js',
    'tools/apx-hud.lily.v1.js',
    'tools/apx-autopilot.full.v1.js',
    'tools/apx-daemon.autoadapt.v1.js',
    'tools/apx-darkweb.autobuyer.v1.js',
    'tools/apx-hgw-batcher.v1.2.js'
  ];
  for(const f of running){
    const on=ns.ps('home').some(p=>p.filename===f);
    ns.tprint(`[health] RUNNING ${on?'Y':'-'}: ${f}`);
  }
  ns.tprint(`[health] SUMMARY OK=${ok} WARN=${warn} ERR=${err}  (OKは「必須4ファイルの存在数」です)`);
}
