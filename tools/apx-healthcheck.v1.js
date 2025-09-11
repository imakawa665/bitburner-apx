/** apx-healthcheck.v1.js
 * スクリプト整合性チェック（存在/パス/RAM/起動状態/Infinity回避点検）
 * @param {NS} ns
 */
export async function main(ns){
  const files=[
    'core/apx-core.micro.v2.09.js',
    'rooter/apx-rooter.auto.v1.js',
    'workers/apx-w1.js','workers/apx-g1.js','workers/apx-h1.js','workers/apx-loop-hgw.nano.js',
    'tools/apx-hud.lily.v1.js','tools/apx-hgw-batcher.v1.js','tools/apx-hacknet.nano.v1.js',
    'tools/apx-pserv.auto.v1.js','tools/apx-pserv.nano.v1.js','tools/apx-share.nano.v1.js',
    'tools/apx-spread.remote.v1.js','tools/apx-prog.advice.v1.js','tools/apx-oneclick.lily.js'
  ];
  let ok=0, warn=0, err=0;
  const check=(cond,msg,level='ok')=>{ if(!cond){ ns.tprint(`[health] ${level.toUpperCase()}: ${msg}`); if(level==='err')err++; else warn++; } else ok++; };
  for(const f of files){
    check(ns.fileExists(f,'home'), `missing file: ${f}`, 'err');
    if(ns.fileExists(f,'home')){
      const ram = ns.getScriptRam(f,'home'); check(isFinite(ram)&&ram>0, `invalid RAM for ${f}: ${ram}`, 'err');
    }
  }
  // Infinity thread になり得る箇所（代表）
  const loop='workers/apx-loop-hgw.nano.js'; const loopRam=ns.getScriptRam(loop,'home')||1.6;
  const max=ns.getServerMaxRam('home'); const th=Math.floor(max/loopRam);
  check(isFinite(loopRam) && loopRam>0, `loop RAM invalid (${loopRam})`, 'err');
  check(isFinite(th) && th>=0, `thread calc invalid for loop (th=${th})`, 'err');
  // 主要プロセスの起動有無
  const procs=[ 'rooter/apx-rooter.auto.v1.js', 'core/apx-core.micro.v2.09.js', 'tools/apx-hud.lily.v1.js' ];
  for(const p of procs){ check(ns.isRunning(p,'home'), `not running: ${p} (oneclickで起動可)`, 'warn'); }
  ns.tprint(`[health] OK=${ok} WARN=${warn} ERR=${err}`);
}
