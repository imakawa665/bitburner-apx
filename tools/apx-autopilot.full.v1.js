/** tools/apx-autopilot.full.v1.js  (v1.8)
 * 目的: できる限り「全自動」に近づける進行管理のオーケストレーター（Singularityなしでも動作）
 * - 段階(state machine)で自動切替: setup -> moneypush -> reppush -> late
 * - ダークウェブ: クラッカー不足なら buyer を自動起動。購入検知で rooter/spread 再走
 * - Casino: banフラグ/資金/最低資金/目標を監視し、必要時のみ起動（ban時は停止）
 * - Backdoor: DOM版の自動backdoorを安全に実行（UIロック使用）
 * - Karma: 要求があれば犯罪ループを開始し、Karma目標達成で停止
 * - 学習/トレーニング: Hack閾値やステ振りに合わせて DOM で大学/ジムを自動操作（UIロック使用）
 * - Hacknet: 初回ノードも自動購入（v1.1に委任）
 *
 * 使い方:
 *   run tools/apx-autopilot.full.v1.js --interval 5000 --uiLock /Temp/apx.ui.lock.txt --goal 1e9
 */
export async function main(ns){
  ns.disableLog('sleep'); ns.disableLog('run'); ns.disableLog('getServerMoneyAvailable'); ns.disableLog('getServerMaxRam'); ns.disableLog('getServerUsedRam'); ns.clearLog();
  const F=ns.flags([
    ['interval', 5000],
    ['goal', 1e9],                 // 資金目標（到達でcasino抑止など）
    ['uiLock','/Temp/apx.ui.lock.txt'],
    ['banFile','apx.state.casino.banned.txt'],
    ['autostudy', true],           // 大学/ジムの自動UI操作
    ['studyHackTo', 50],           // Hackがこの値を下回る場合、CSを学ぶ
    ['trainAgiTo',  50],           // Agiがこの値を下回る場合、ジムでAgiを鍛える
    ['crimeAuto', false],          // Karmaループの自動化
    ['karmaGoal', -54000],         // 目標Karma
    ['log', true],
  ]);
  const print=(...a)=>{ if(F.log) ns.print('[autopilot]',...a); };
  const exists=(f)=>ns.fileExists(f,'home');
  const isAny=(f)=> ns.ps('home').some(p=>p.filename===f);
  const runOnce=(f,th=1,...args)=>{ if(!exists(f)) { print('missing',f); return 0;} if(isAny(f)) return 1; const pid=ns.run(f,th,...args); if(!pid) ns.tprint(`[autopilot] failed to start ${f}`); return pid?1:0; };
  const restart=async(file,args)=>{ if(!exists(file)) return false; const procs=ns.ps('home').filter(p=>p.filename===file); if(procs.length===0){ runOnce(file,1,...args); return true; } const same=procs.some(p=>JSON.stringify(p.args)===JSON.stringify(args)); if(!same){ for(const p of procs) ns.kill(p.pid); await ns.sleep(10); runOnce(file,1,...args); return true; } return false; };

  // 常駐: 基本サービスを起動（必要に応じて）
  runOnce('tools/apx-hacknet.nano.v1.js',1,'--budget',0.2,'--maxROI',3600,'--log','true');
  runOnce('rooter/apx-rooter.auto.v1.js',1,'--interval',10000,'--log');
  runOnce('core/apx-core.micro.v2.09.js',1,'--allRooted','true','--reserveRamPct',0.1,'--log','true');
  runOnce('tools/apx-share.nano.v1.js');
  runOnce('tools/apx-faction.join.assist.v1.js');
  runOnce('tools/apx-healthcheck.v1.js');

  // 内部状態
  const crackers=['BruteSSH.exe','FTPCrack.exe','relaySMTP.exe','HTTPWorm.exe','SQLInject.exe'];
  let lastCrackers = crackers.filter(exists).length;
  let mode='setup';

  // 簡易ステージ判定
  const stage=()=>{
    const m=ns.getServerMoneyAvailable('home');
    const h=ns.getPlayer().skills.hacking;
    const cr=crackers.filter(exists).length;
    if (m<5e6 && (h<50 || cr<2)) return 'setup';
    if (m<1e9) return 'moneypush';
    return 'late';
  };

  while(true){
    // ステージ更新
    const now=stage();
    if(now!==mode){ ns.tprint(`[autopilot] stage: ${mode} -> ${now}`); mode=now; }

    // ダークウェブ: クラッカー不足なら buyer 起動
    const missing = crackers.filter(c=>!exists(c));
    if (missing.length>0 && exists('tools/apx-darkweb.autobuyer.v1.js')) {
      runOnce('tools/apx-darkweb.autobuyer.v1.js',1,'--mode','ports','--safety',1.0,'--method','auto','--autoRooterRestart');
      print('darkweb buyer running; missing=', missing.join(','));
    }

    // クラッカー新規入手で rooter/spread 再走
    const nowC = crackers.filter(exists).length;
    if (nowC>lastCrackers){
      await restart('rooter/apx-rooter.auto.v1.js',['--interval',10000,'--log']);
      runOnce('tools/apx-spread.remote.v1.js',1);
      lastCrackers=nowC;
      ns.toast(`New crackers: ${nowC}/5. Rooting expanded.`, 'info', 4000);
    }

    // Casino: 目標未達 && banでないときのみ起動
    const banned = ns.fileExists(F.banFile,'home');
    if (!banned && ns.getServerMoneyAvailable('home') < Number(F.goal||1e9)) {
      runOnce('tools/apx-casino.runner.v1.js',1,'--goal',Number(F.goal||1e9),'--minTravel',200000);
    } else {
      // 停止条件を満たすなら kill
      for (const p of ns.ps('home').filter(p=>p.filename==='tools/apx-casino.runner.v1.js')) ns.kill(p.pid);
    }

    // Backdoor 自動（UIロックを尊重）
    if (exists('tools/apx-backdoor.auto.dom.v1.js')) runOnce('tools/apx-backdoor.auto.dom.v1.js',1,'--lock',F.uiLock,'--watch',6000);

    // 学習/トレーニング（UIロックを尊重）
    if (F.autostudy && exists('tools/apx-study.train.dom.v1.js')) {
      const me=ns.getPlayer();
      const wantsHack = me.skills.hacking < Number(F.studyHackTo||50);
      const wantsAgi  = me.skills.agility < Number(F.trainAgiTo||50);
      if (wantsHack || wantsAgi) runOnce('tools/apx-study.train.dom.v1.js',1,'--lock',F.uiLock,'--hackTo',Number(F.studyHackTo||50),'--agiTo',Number(F.trainAgiTo||50));
    }

    // Karma 監視→犯罪ループ（任意）
    if (F.crimeAuto) {
      runOnce('tools/apx-karma.watch.v1.js',1,'--goal',Number(F.karmaGoal||-54000));
      runOnce('tools/apx-crime.repeat.v1.js',1,'--autoPick',true);
    }

    await ns.sleep(Math.max(1000, Number(F.interval)||5000));
  }
}
