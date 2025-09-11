/** apx-core.micro.v2.09.js
 * 高RAM向けデフォルト（allRooted:true / 攻め設定）
 * LOG: 状態や選定・モードを ns.print に出力（ロジック変更なし）
 * @param {NS} ns
 */
export async function main(ns) {
  ns.disableLog('sleep'); ns.disableLog('getServerMaxRam'); ns.disableLog('getServerUsedRam');
  ns.clearPort(20); ns.clearPort(21);
  const FLAGS = ns.flags([['cmdPort',20],['statPort',21],['mode','auto'],['target',''],['secPad',0.25],['moneyThr',0.85],['wgSleep',250],['allRooted',true],['log',true]]);
  const log=(...a)=>{ if(FLAGS.log) ns.print('[micro]',...a); };
  const st={paused:false,mode:FLAGS.mode,target:FLAGS.target||'',lastPush:0,lastPick:0,lastScan:0,discovered:['n00dles','foodnstuff']};
  const discover=()=>{ if(!FLAGS.allRooted&&st.discovered.length>0) return st.discovered; if(Date.now()-st.lastScan<2000) return st.discovered; const seen=new Set(['home']); const q=['home']; while(q.length){ const cur=q.pop(); for(const n of ns.scan(cur)){ if(!seen.has(n)){ seen.add(n); q.push(n);} } } st.discovered=[...seen].filter(h=>h!=='home'); st.lastScan=Date.now(); return st.discovered; };
  const cands=()=>{ const me=ns.getPlayer().skills.hacking; if(!FLAGS.allRooted){ return ['n00dles','foodnstuff','sigma-cosmetics','joesguns','nectar-net','hong-fang-tea','harakiri-sushi'].filter(h=>ns.serverExists(h)&&ns.getServerNumPortsRequired(h)===0&&ns.getServerRequiredHackingLevel(h)<=me); }
    const skip=new Set(['home','darkweb',...(ns.getPurchasedServers?.()??[])]); const list=[]; for(const h of discover()){ if(skip.has(h))continue; if(!ns.serverExists(h))continue; if(!ns.hasRootAccess(h))continue; if(ns.getServerRequiredHackingLevel(h)>me)continue; if((ns.getServerMaxMoney(h)||0)<=0)continue; list.push(h);} return list; };
  const pick=()=>{ if(st.target&&ns.serverExists(st.target))return st.target; if(Date.now()-st.lastPick<3000&&st.target) return st.target; let best='',score=-1; for(const h of cands()){ const mmax=ns.getServerMaxMoney(h)||0,req=ns.getServerRequiredHackingLevel(h)||1; const s=mmax/(1+req); if(s>score){score=s;best=h;} } st.lastPick=Date.now(); if(best!==st.target){ log('pick',best); } st.target=best; return best; };
  const snap=(h)=>!h?null:{money:ns.getServerMoneyAvailable(h),max:ns.getServerMaxMoney(h),sec:ns.getServerSecurityLevel(h),min:ns.getServerMinSecurityLevel(h)};
  const push=()=>{ const p=ns.getPlayer(); const t=st.target||pick(); const s=t?snap(t):null; ns.tryWritePort(FLAGS.statPort, JSON.stringify({ts:Date.now(),paused:st.paused,mode:st.mode,target:t,money:Math.floor(p.money),snap:s})); };
  const runFill=async(file,args=[],prefer=1e9)=>{ const max=ns.getServerMaxRam('home'),used=ns.getServerUsedRam('home'); let free=Math.max(0,max-used); if(free<1)return 0; let th=Math.min(prefer,Math.max(1,Math.floor(free/2))); let started=0; while(th>0){ const pid=ns.run(file,th,...args); if(pid!==0){started=th;break;} th=Math.floor(th/2); await ns.sleep(20);} if(started>0) log('runFill',file,'t',started,args.join(' ')); return started; };
  const cmd=(m)=>{ if(!m||m==='NULL PORT DATA')return; let c; try{c=JSON.parse(m);}catch{return;} if(c.cmd==='pause')st.paused=true; else if(c.cmd==='resume')st.paused=false; else if(c.cmd==='mode'&&['auto','hack','grow','weaken'].includes(c.mode))st.mode=c.mode; else if(c.cmd==='target'&&typeof c.host==='string'&&ns.serverExists(c.host))st.target=c.host; else if(c.cmd==='status')push(); };
  const H='workers/apx-h1.js', G='workers/apx-g1.js', W='workers/apx-w1.js';
  while(true){
    for(let i=0;i<30;i++){ const m=ns.readPort(FLAGS.cmdPort); if(m==='NULL PORT DATA')break; cmd(m);} const tgt=pick(); if(!tgt){ if(Date.now()-st.lastPick>2000) log('no target: waiting NUKE/root'); await ns.sleep(200); continue; }
    if(!st.paused){ const s=snap(tgt); let mode=st.mode; if(mode==='auto'){ if(s.sec>s.min+FLAGS.secPad)mode='weaken'; else if(s.max>0&&s.money<s.max*FLAGS.moneyThr)mode='grow'; else mode='hack'; } log('mode',mode,'tgt',tgt,'$=',(s?.money||0).toFixed(0),'sec=',s?.sec?.toFixed(2)); if(mode==='weaken') await runFill(W,[tgt]); else if(mode==='grow') await runFill(G,[tgt]); else await runFill(H,[tgt],128); }
    if(Date.now()-st.lastPush>800){ push(); st.lastPush=Date.now(); } await ns.sleep(FLAGS.wgSleep);
  }
}
