/** apx-healthcheck.v1.js (v1.1)
 * - 必須ファイルの存在/RAM値チェック
 * - Infinity スレ防止点検
 * - 主要常駐の起動状況
 * - ★ 重複起動（Singleton）の検出 & 任意で自動整理（--killDup）
 * @param {NS} ns
 */
export async function main(ns){
  const F=ns.flags([['killDup', true]]);
  const files=[
    'core/apx-core.micro.v2.09.js',
    'rooter/apx-rooter.auto.v1.js',
    'workers/apx-w1.js','workers/apx-g1.js','workers/apx-h1.js','workers/apx-loop-hgw.nano.js',
    'tools/apx-hud.lily.v1.js','tools/apx-hgw-batcher.v1.js','tools/apx-hacknet.nano.v1.js',
    'tools/apx-pserv.auto.v1.js','tools/apx-pserv.nano.v1.js','tools/apx-share.nano.v1.js',
    'tools/apx-spread.remote.v1.js','tools/apx-prog.advice.v1.js','tools/apx-oneclick.lily.js','tools/apx-daemon.autoadapt.v1.js','tools/apx-backdoor.guide.v1.js'
  ];
  const singletons=new Set(['core/apx-core.micro.v2.09.js','rooter/apx-rooter.auto.v1.js','tools/apx-hud.lily.v1.js','tools/apx-hacknet.nano.v1.js','tools/apx-pserv.auto.v1.js','tools/apx-daemon.autoadapt.v1.js','tools/apx-backdoor.guide.v1.js']);

  let ok=0, warn=0, err=0;
  const note=(lvl,msg)=>{ ns.tprint(`[health] ${lvl}: ${msg}`); if(lvl==='ERR')err++; else if(lvl==='WARN')warn++; else ok++; };

  for(const f of files){
    if(!ns.fileExists(f,'home')){ note('ERR',`missing file: ${f}`); continue; }
    const ram=ns.getScriptRam(f,'home'); if(!isFinite(ram)||ram<=0) note('ERR',`invalid RAM for ${f}: ${ram}`); else ok++;
  }

  // Infinity thread point check
  const loop='workers/apx-loop-hgw.nano.js'; const loopRam=ns.getScriptRam(loop,'home')||1.6;
  const max=ns.getServerMaxRam('home'); const th=Math.floor(max/loopRam);
  if(!(isFinite(loopRam)&&loopRam>0)) note('ERR',`loop RAM invalid (${loopRam})`);
  if(!(isFinite(th)&&th>=0)) note('ERR',`thread calc invalid for loop (th=${th})`);

  // Running state & duplicates
  const procs=ns.ps('home');
  const byFile = procs.reduce((m,p)=>{ (m[p.filename]=m[p.filename]||[]).push(p); return m; },{});
  for(const file of Object.keys(byFile)){
    const list=byFile[file];
    if(singletons.has(file) && list.length>1){
      note('WARN',`duplicate running: ${file} x${list.length}`);
      if(F.killDup){
        // keep newest (max PID), kill others
        const keep = list.reduce((a,b)=>a.pid>b.pid?a:b);
        for(const p of list){ if(p.pid!==keep.pid){ ns.kill(p.pid); } }
        note('OK',`deduped: kept pid=${keep.pid} killed=${list.length-1}`);
      }
    }
  }

  // Suggest starting oneclick if core services not running
  const need=['rooter/apx-rooter.auto.v1.js','core/apx-core.micro.v2.09.js','tools/apx-hud.lily.v1.js','tools/apx-daemon.autoadapt.v1.js'].filter(f=>!byFile[f]);
  if(need.length) note('WARN',`not running: ${need.join(', ')} (run tools/apx-oneclick.lily.js)`);

  ns.tprint(`[health] SUMMARY OK=${ok} WARN=${warn} ERR=${err}`);
}
