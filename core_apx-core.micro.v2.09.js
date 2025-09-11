/** apx-core.micro.v2.09.js
 *  低RAMマネージャ（Singularity非依存）— 高RAM向けデフォルト（このセーブ向けに最適化）
 *  改良点: 
 *   - ループ間隔を高速化(--wgSleep 250既定)
 *   - セキュリティ余白/資金閾値を攻めに(--secPad 0.25, --moneyThr 0.85既定)
 *   - allRooted対応(--allRooted trueでroot済み全体から選定)
 *   - 失敗時スレッド自動縮退(runFill)は維持
 *  @param {NS} ns
 */
export async function main(ns) {
  ns.disableLog('sleep'); ns.disableLog('getServerMaxRam'); ns.disableLog('getServerUsedRam');
  ns.clearPort(20); ns.clearPort(21);

  const FLAGS = ns.flags([
    ['cmdPort', 20], ['statPort', 21],
    ['mode', 'auto'], ['target', ''],
    ['secPad', 0.25], ['moneyThr', 0.85], ['wgSleep', 250],
    ['allRooted', true], // root済み全体から選定（高RAM前提）
  ]);

  const zeroPort = ['n00dles','foodnstuff','sigma-cosmetics','joesguns','nectar-net','hong-fang-tea','harakiri-sushi'];
  const state = { paused:false, mode:FLAGS.mode, target:FLAGS.target||'', lastPush:0, lastPick:0, lastScan:0, discovered:['n00dles','foodnstuff'] };

  const discover = () => {
    if (!FLAGS.allRooted && state.discovered.length>0) return state.discovered;
    if (Date.now()-state.lastScan<2000) return state.discovered;
    const seen=new Set(['home']); const q=['home']; while(q.length){ const cur=q.pop(); for(const n of ns.scan(cur)){ if(!seen.has(n)){ seen.add(n); q.push(n);} } }
    state.discovered=[...seen].filter(h=>h!=='home'); state.lastScan=Date.now(); return state.discovered;
  };
  const candidates = () => {
    const me=ns.getPlayer().skills.hacking;
    if(!FLAGS.allRooted){
      return zeroPort.filter(h=>ns.serverExists(h)&&ns.getServerNumPortsRequired(h)===0&&ns.getServerRequiredHackingLevel(h)<=me);
    }
    const skip=new Set(['home','darkweb', ...(ns.getPurchasedServers?.() ?? [])]); const list=[];
    for(const h of discover()){ if(skip.has(h)) continue; if(!ns.serverExists(h)) continue; if(!ns.hasRootAccess(h)) continue;
      if(ns.getServerRequiredHackingLevel(h)>me) continue; if((ns.getServerMaxMoney(h)||0)<=0) continue; list.push(h); }
    return list;
  };
  const pickTarget = () => {
    if (state.target && ns.serverExists(state.target)) return state.target;
    if (Date.now()-state.lastPick<3000 && state.target) return state.target;
    let best='',score=-1; for(const h of candidates()){ const mmax=ns.getServerMaxMoney(h)||0, req=ns.getServerRequiredHackingLevel(h)||1;
      const s=mmax/(1+req); if(s>score){score=s;best=h;} }
    state.lastPick=Date.now(); state.target=best; return best;
  };
  const getSnap = (h)=>!h?null:{money:ns.getServerMoneyAvailable(h),max:ns.getServerMaxMoney(h),sec:ns.getServerSecurityLevel(h),min:ns.getServerMinSecurityLevel(h)};
  const pushStatus = ()=>{ const p=ns.getPlayer(); const t=state.target||pickTarget(); const s=t?getSnap(t):null;
    ns.tryWritePort(FLAGS.statPort, JSON.stringify({ts:Date.now(),paused:state.paused,mode:state.mode,target:t,money:Math.floor(p.money),snap:s})); };
  const runFill = async(file,args=[],prefer=1e9)=>{ const max=ns.getServerMaxRam('home'), used=ns.getServerUsedRam('home');
    let free=Math.max(0,max-used); if (free<1) return 0; let th=Math.min(prefer,Math.max(1,Math.floor(free/2))); let started=0;
    while(th>0){ const pid=ns.run(file,th,...args); if(pid!==0){started=th;break;} th=Math.floor(th/2); await ns.sleep(20);} return started; };
  const handleCmd = (m)=>{ if(!m||m==='NULL PORT DATA') return; let c; try{c=JSON.parse(m);}catch{return;}
    if(c.cmd==='pause') state.paused=true; else if(c.cmd==='resume') state.paused=false;
    else if(c.cmd==='mode'&&['auto','hack','grow','weaken'].includes(c.mode)) state.mode=c.mode;
    else if(c.cmd==='target'&&typeof c.host==='string'&&ns.serverExists(c.host)) state.target=c.host;
    else if(c.cmd==='status') pushStatus(); };

  while(true){
    for(let i=0;i<30;i++){ const m=ns.readPort(FLAGS.cmdPort); if(m==='NULL PORT DATA') break; handleCmd(m); }
    const tgt=pickTarget(); if(!tgt){ await ns.sleep(200); continue; }
    if(!state.paused){
      const s=getSnap(tgt); let mode=state.mode;
      if(mode==='auto'){ if(s.sec>s.min+FLAGS.secPad) mode='weaken'; else if(s.max>0 && s.money<s.max*FLAGS.moneyThr) mode='grow'; else mode='hack'; }
      if(mode==='weaken') await runFill('apx-w1.js',[tgt]);
      else if(mode==='grow') await runFill('apx-g1.js',[tgt]);
      else await runFill('apx-h1.js',[tgt],128);
    }
    if(Date.now()-state.lastPush>800){ pushStatus(); state.lastPush=Date.now(); }
    await ns.sleep(FLAGS.wgSleep);
  }
}