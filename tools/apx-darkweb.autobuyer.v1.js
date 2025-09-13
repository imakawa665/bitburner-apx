
/** tools/apx-darkweb.autobuyer.v1.js (v1.1.3)
 * DOMの端末入力が多すぎる問題を抑制：
 * - "buy tor; connect darkweb" は 2分クールダウンで最大1回だけ発行（marker=/Temp/apx.state.tor.ready.txt に刻印）
 * - 実際に購入可能な資金がある時だけ、DOMコマンドを実行
 * - method=auto: Singularity購入→失敗時のみ DOM へ
 */
export async function main(ns) {
  ns.disableLog('sleep'); ns.disableLog('getServerMoneyAvailable'); ns.clearLog();
  const F = ns.flags([['mode','ports'],['qol',false],['safety',1.0],['interval',1500],['log',false],['method','auto'],['autoRooterRestart',true],['rooter','rooter/apx-rooter.auto.v1.js'],['cooldown',120000]]);
  const log=(...a)=>{ if(F.log) ns.print('[dw-buyer]',...a); };
  const exists=(f)=>ns.fileExists(f,'home'); const isAny=(f)=>ns.ps('home').some(p=>p.filename===f);
  const restart=(file,args)=>{ try{ if(!exists(file)) return false; for(const p of ns.ps('home').filter(p=>p.filename===file)) ns.kill(p.pid); return ns.run(file,1,...(args||['--interval',10000,'--log']))>0; }catch{return false;} };
  const marker='/Temp/apx.state.tor.ready.txt';
  const now=()=>Date.now();
  const lastTor=()=>{ try{ return Number(ns.read(marker)||0); }catch{return 0;} };
  const markTor=()=>{ try{ ns.write(marker,String(Date.now()),'w'); }catch{} };
  const programs=[
    {name:'BruteSSH.exe',cost:500000,kind:'port'},{name:'FTPCrack.exe',cost:1500000,kind:'port'},{name:'relaySMTP.exe',cost:5000000,kind:'port'},{name:'HTTPWorm.exe',cost:30000000,kind:'port'},{name:'SQLInject.exe',cost:250000000,kind:'port'},
    {name:'DeepscanV1.exe',cost:500000,kind:'qol'},{name:'DeepscanV2.exe',cost:25000000,kind:'qol'},{name:'ServerProfiler.exe',cost:1000000,kind:'qol'},{name:'AutoLink.exe',cost:1000000,kind:'qol'}
  ];
  const needKinds=(String(F.mode).toLowerCase()==='all') ? new Set(['port','qol']) : new Set(['port']); const wantQol=F.qol||needKinds.has('qol');
  const list=programs.filter(p=>p.kind==='port'||(wantQol&&p.kind==='qol'));
  ns.tprint(`[darkweb] mode=${F.mode} qos=${wantQol?'on':'off'} safety=${F.safety}`);

  const money=()=>ns.getServerMoneyAvailable('home'); const have=(prog)=>ns.fileExists(prog,'home');
  async function term(cmd){
    try{
      const doc=eval('document');
      const tab=Array.from(doc.querySelectorAll('button,[role="tab"],.MuiTab-root')).find(e=>(e.textContent||'').toLowerCase().includes('terminal'));
      if(tab) tab.click();
      await ns.sleep(10);
      const input=doc.getElementById('terminal-input')||doc.querySelector('input.MuiInputBase-input');
      if(!input) return false;
      input.value=cmd;
      input.dispatchEvent(new Event('input',{bubbles:true}));
      const ke=new KeyboardEvent('keydown',{key:'Enter',code:'Enter',which:13});
      input.dispatchEvent(ke);
      return true;
    }catch{ return false; }
  }
  const ensureTorConnect=async(force=false)=>{
    const cd=Math.max(0,Number(F.cooldown)||120000);
    if(!force && (now()-lastTor())<cd) return; // cooldown中は打たない
    await term(`buy tor; connect darkweb`);
    markTor();
    ns.print('[dw-buyer] ensured tor/connect (cooldown set)');
  };

  const tryPurchaseSing = async (prog)=>{
    try{ if (ns.singularity?.purchaseTor) { try{ ns.singularity.purchaseTor(); }catch{} } const ok = !!ns.singularity?.purchaseProgram?.(prog.name); return !!ok; }catch{ return false; }
  };
  const tryPurchaseDom = async (prog)=>{ await ensureTorConnect(false); await term(`buy ${prog.name}`); await ns.sleep(200); return have(prog.name); };

  while(true){
    let pending=0, bought=0;
    for(const prog of list){
      if(have(prog.name)) continue;
      pending++;
      const need=Math.max(1,prog.cost*Math.max(0,Number(F.safety)||1.0));
      if(money()<need){ continue; } // お金が足りないなら何もしない（端末コマンドも打たない）
      let ok=false;
      const method=String(F.method).toLowerCase();
      if (method==='singularity') ok = await tryPurchaseSing(prog);
      else if (method==='dom') { await ensureTorConnect(false); ok = await tryPurchaseDom(prog); }
      else { // auto: sing → dom
        ok = await tryPurchaseSing(prog);
        if(!ok){ await ensureTorConnect(false); ok = await tryPurchaseDom(prog); }
      }
      if(ok){
        bought++;
        ns.toast(`Purchased ${prog.name}`,'success',4000);
        ns.tprint(`[darkweb] Purchased ${prog.name}  $${prog.cost.toLocaleString()}`);
        if(F.autoRooterRestart) restart(String(F.rooter||'rooter/apx-rooter.auto.v1.js'),['--interval',10000,'--log']);
        await ns.sleep(150);
      }
    }
    if(pending===0){ ns.tprint(`[darkweb] すべて購入済み（mode=${F.mode}, qol=${wantQol?'on':'off'}）`); break; }
    if(bought===0){ ns.print(`[darkweb] waiting funds... (${pending} remaining)`); await ns.sleep(Math.max(300,Number(F.interval)||1500)); }
  }
}
