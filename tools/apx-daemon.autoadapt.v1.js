/** apx-daemon.autoadapt.v1.js
 * 常駐オーケストレータ（フルオート強化）
 * - 予算/段階の自動調整で pserv.auto を再起動
 * - 空きRAMに応じて share スレを自動再配分
 * - 条件が整えば batcher を自動ON/OFF（hackTime, freeRAM, security など）
 * - 定期的に spread を実行（root済み一般サーバへ配備）
 * - Backdoor Guide を常時監視（軽量）
 * 注: 既存ロジックは尊重し、起動/停止のみ制御。危険なkillは行いません。
 * @param {NS} ns
 */
export async function main(ns){
  ns.disableLog('sleep'); ns.disableLog('run'); ns.disableLog('getServerMaxRam'); ns.disableLog('getServerUsedRam');
  const F=ns.flags([
    ['interval', 5000],
    ['minSharePct', 0.1], ['maxSharePct', 0.5],
    ['batchMinFree', 0.25], ['batchMaxFree', 0.7],
    ['pservMin', 8], ['pservMax', 16384],
    ['log', true],
  ]);
  const print=(...a)=>{ if(F.log) ns.print('[daemon]',...a); };
  const exists=(f)=>ns.fileExists(f,'home'); const run=(f,th=1,...args)=>{ if(!exists(f)) return 0; if(ns.isRunning(f,'home')) return 1; const pid=ns.run(f,th,...args); return pid?1:0; };
  const restart=(file, pred, args)=>{ if(!exists(file)) return false; const procs=ns.ps('home').filter(p=>p.filename===file); if(procs.length===0){ run(file,1,...args); return true; } const same=procs.some(p=>JSON.stringify(p.args)===JSON.stringify(args)); if(!same){ for(const p of procs) ns.kill(p.pid); ns.sleep(10); run(file,1,...args); return true; } return false; };

  let lastSpread = 0, lastAdvice = 0;

  while(true){
    // 1) 共有パワーの自動再配分
    const max=ns.getServerMaxRam('home'), used=ns.getServerUsedRam('home'), free=Math.max(0, max-used);
    const freeRatio = max>0 ? free/max : 0;
    const shareFile='tools/apx-share.nano.v1.js';
    if (exists(shareFile)) {
      let cost=ns.getScriptRam(shareFile,'home')||1.6;
      // 目標: freeRatioを F.minSharePct..F.maxSharePct の範囲で share に吸わせる
      const targetPct = Math.min(F.maxSharePct, Math.max(F.minSharePct, freeRatio*0.9));
      const targetThreads = Math.max(0, Math.floor((free*targetPct)/cost));
      // すでに走っている share を見直す（増減はランナーに任せ、ここでは不足時のみ追加起動）
      if (targetThreads>=1 && !ns.isRunning(shareFile,'home')) {
        run(shareFile, targetThreads);
        print('share start t',targetThreads,'freeRatio',freeRatio.toFixed(2));
      }
    }

    // 2) batcher 自動ON/OFF（条件が整えば起動）
    const tgt = (()=>{
      // microが選んだ/ピン固定されたターゲットがあればそれを尊重（Port21の情報は省略、簡易選定）
      const list=['n00dles','foodnstuff','sigma-cosmetics','joesguns','nectar-net','hong-fang-tea','harakiri-sushi'];
      const me=ns.getPlayer().skills.hacking;
      const c=list.filter(h=>ns.serverExists(h)&&ns.hasRootAccess(h)&&ns.getServerRequiredHackingLevel(h)<=me);
      if(c.length===0) return 'n00dles';
      c.sort((a,b)=>(ns.getServerMaxMoney(b)||0)-(ns.getServerMaxMoney(a)||0));
      return c[0];
    })();
    const ht = ns.getHackTime(tgt);
    const batchWanted = (freeRatio>=F.batchMinFree) && (ht<=20000); // 20s以下の軽いターゲット & 十分な空きRAM
    if (batchWanted) {
      const hackPct = ht<=5000 ? 0.05 : 0.03;
      const args=['--target',tgt,'--hackPct',hackPct,'--gap',200,'--log','true'];
      restart('tools/apx-hgw-batcher.v1.js', ()=>true, args) && print('batch restart',tgt,hackPct);
    } else {
      // 空きが少ない/ターゲットが重いときは batch を使わない（止めるだけ）
      for(const p of ns.ps('home').filter(p=>p.filename==='tools/apx-hgw-batcher.v1.js')) ns.kill(p.pid);
    }

    // 3) pserv 自動最適化（予算・段階）
    const money=ns.getServerMoneyAvailable('home');
    let budget = money>5e6 ? 0.5 : (money>1e6 ? 0.4 : 0.3);
    let minRam = money>2e6 ? 64 : 8;
    let maxRam = money>2e7 ? 16384 : (money>5e6 ? 8192 : 2048);
    minRam = Math.max(F.pservMin, minRam); maxRam = Math.min(F.pservMax, maxRam);
    restart('tools/apx-pserv.auto.v1.js', ()=>true, ['--budget',budget,'--minRam',minRam,'--maxRam',maxRam,'--log','true']) && print('pserv restart',budget,minRam,maxRam);

    // 4) spread を定期実行（rootが増えたら自然に配布）
    if (Date.now()-lastSpread > 120000) { // 2分に1回
      run('tools/apx-spread.remote.v1.js', 1, '--target', tgt);
      lastSpread = Date.now();
    }

    // 5) backdoor ガイド（軽量ウォッチ）
    run('tools/apx-backdoor.guide.v1.js', 1, '--watch', 3000);

    // 6) ときどき advice（.exe 提示）
    if (Date.now()-lastAdvice > 300000) { run('tools/apx-prog.advice.v1.js'); lastAdvice = Date.now(); }

    await ns.sleep(F.interval);
  }
}
