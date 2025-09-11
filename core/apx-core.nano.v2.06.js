/** apx-core.nano.v2.06.js
 *  低RAM版オートパイロット（Singularity非依存）— 今すぐ使える収益化ハンドラー
 *  - Port20: コマンド受信（JSON） / Port21: ステータス配信（JSON）
 *  - 自動で 0ポート鯖をNUKE→最適ターゲット選定→HGWを常時回す
 *  - ワーカー（h1/g1/w1）は単機能・単発実行。マネージャが空きRAMに応じて枚数を調整して起動
 *  @param {NS} ns
 */
export async function main(ns) {
  ns.disableLog('sleep'); ns.disableLog('getServerMaxRam'); ns.disableLog('getServerUsedRam');
  ns.clearPort(20); ns.clearPort(21);

  const FLAGS = ns.flags([
    ['cmdPort', 20], ['statPort', 21],
    ['mode', 'auto'], ['target', ''],
    ['secPad', 0.5], ['moneyThr', 0.9], ['wgSleep', 800],
  ]);

  const state = { paused:false, mode:FLAGS.mode, target:FLAGS.target||'', lastPush:0, lastPick:0 };

  const servers0p = () => {
    const list = [], me = ns.getPlayer().skills.hacking;
    for (const h of ['n00dles','foodnstuff','sigma-cosmetics','joesguns','nectar-net','hong-fang-tea','harakiri-sushi']) {
      if (!ns.serverExists(h)) continue;
      const req = ns.getServerRequiredHackingLevel(h);
      const ports = ns.getServerNumPortsRequired(h);
      if (ports===0 && req<=me) list.push(h);
    } return list;
  };
  const ensureRoot = (h) => { if (ns.hasRootAccess(h)) return true; if (!ns.fileExists('NUKE.exe','home')) return false; try{ns.nuke(h);}catch{} return ns.hasRootAccess(h); };
  const pickTarget = () => {
    if (state.target && ns.serverExists(state.target)) return state.target;
    const now = Date.now(); if (now - state.lastPick < 5000 && state.target) return state.target;
    let best='',score=-1; for (const h of servers0p()) {
      if (!ensureRoot(h)) continue;
      const mmax=ns.getServerMaxMoney(h)||0, req=ns.getServerRequiredHackingLevel(h)||1;
      const s=mmax/(1+req); if (s>score){score=s;best=h;}
    } state.lastPick=now; state.target=best; return best;
  };
  const getSnap = (h)=>!h?null:{money:ns.getServerMoneyAvailable(h),max:ns.getServerMaxMoney(h),sec:ns.getServerSecurityLevel(h),min:ns.getServerMinSecurityLevel(h)};
  const pushStatus = ()=>{ const p=ns.getPlayer(); const t=state.target||pickTarget(); const s=t?getSnap(t):null;
    ns.tryWritePort(FLAGS.statPort, JSON.stringify({ts:Date.now(),paused:state.paused,mode:state.mode,target:t,money:Math.floor(p.money),snap:s})); };
  const runFill = async(file,args=[],prefer=1e9)=>{ const max=ns.getServerMaxRam('home'), used=ns.getServerUsedRam('home');
    let free=Math.max(0,max-used); if (free<1) return 0; let th=Math.min(prefer,Math.max(1,Math.floor(free/2))); let started=0;
    while(th>0){ const pid=ns.run(file,th,...args); if(pid!==0){started=th;break;} th=Math.floor(th/2); await ns.sleep(50);} return started; };
  const handleCmd = (m)=>{ if(!m||m==='NULL PORT DATA') return; let c; try{c=JSON.parse(m);}catch{return;}
    if(c.cmd==='pause') state.paused=true; else if(c.cmd==='resume') state.paused=false;
    else if(c.cmd==='mode'&&['auto','hack','grow','weaken'].includes(c.mode)) state.mode=c.mode;
    else if(c.cmd==='target'&&typeof c.host==='string'&&ns.serverExists(c.host)) state.target=c.host;
    else if(c.cmd==='status') pushStatus(); };

  while(true){
    for(let i=0;i<20;i++){ const m=ns.readPort(FLAGS.cmdPort); if(m==='NULL PORT DATA') break; handleCmd(m); }
    const tgt=pickTarget(); if(!tgt){ await ns.sleep(500); continue; }
    if(!state.paused){
      const s=getSnap(tgt); let mode=state.mode;
      if(mode==='auto'){ if(s.sec>s.min+FLAGS.secPad) mode='weaken'; else if(s.max>0 && s.money<s.max*FLAGS.moneyThr) mode='grow'; else mode='hack'; }
      if(mode==='weaken') await runFill('apx-w1.js',[tgt]);
      else if(mode==='grow') await runFill('apx-g1.js',[tgt]);
      else await runFill('apx-h1.js',[tgt],32);
    }
    if(Date.now()-state.lastPush>1000){ pushStatus(); state.lastPush=Date.now(); }
    await ns.sleep(FLAGS.wgSleep);
  }
}
