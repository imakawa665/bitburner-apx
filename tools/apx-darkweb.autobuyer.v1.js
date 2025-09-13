
/** tools/apx-darkweb.autobuyer.v1.js (v1.1.5)
 * DOM端末スパムをさらに抑止：
 * - "buy tor" と "connect darkweb" に個別クールダウン（tor=10分 / connect=10秒）
 * - 各プログラムの DOM 購入には 12秒クールダウン（/Temp/apx.dw.cool.<prog>.txt）
 * - DOM購入時は必ず直前に 'connect darkweb'（10秒CD）を実行
 * - 資金が十分な時だけ DOM コマンドを実行
 * - method=auto: Singularity→失敗時のみ DOM（従来）
 */
export async function main(ns) {
  ns.disableLog('sleep'); ns.disableLog('getServerMoneyAvailable'); ns.clearLog();
  const F = ns.flags([
    ['mode','ports'],['qol',false],['safety',1.0],['interval',1500],['log',false],
    ['method','auto'],['autoRooterRestart',true],['rooter','rooter/apx-rooter.auto.v1.js'],
    ['cdTor',600000],['cdConn',10000],['cdProg',12000]
  ]);
  const log=(...a)=>{ if(F.log) ns.print('[dw-buyer]',...a); };
  const exists=(f)=>ns.fileExists(f,'home'); const isAny=(f)=>ns.ps('home').some(p=>p.filename===f);
  const restart=(file,args)=>{ try{ if(!exists(file)) return false; for(const p of ns.ps('home').filter(p=>p.filename===file)) ns.kill(p.pid); return ns.run(file,1,...(args||['--interval',10000,'--log']))>0; }catch{return false;} };
  const now=()=>Date.now();
  const rd=(f)=>{ try{ return Number(ns.read(f)||0);}catch{return 0;} };
  const wr=(f,v)=>{ try{ ns.write(f,String(v),'w'); }catch{} };
  const torMark='/Temp/apx.state.tor.ready.txt';
  const connMark='/Temp/apx.state.dw.connected.txt';
  const lastTor = ()=>rd(torMark), markTor=()=>wr(torMark, now());
  const lastConn=()=>rd(connMark), markConn=()=>wr(connMark, now());
  const programs=[
    {name:'BruteSSH.exe',cost:500000,kind:'port'},
    {name:'FTPCrack.exe',cost:1500000,kind:'port'},
    {name:'relaySMTP.exe',cost:5000000,kind:'port'},
    {name:'HTTPWorm.exe',cost:30000000,kind:'port'},
    {name:'SQLInject.exe',cost:250000000,kind:'port'},
    {name:'DeepscanV1.exe',cost:500000,kind:'qol'},
    {name:'DeepscanV2.exe',cost:25000000,kind:'qol'},
    {name:'ServerProfiler.exe',cost:1000000,kind:'qol'},
    {name:'AutoLink.exe',cost:1000000,kind:'qol'}
  ];
  const wantQol = F.qol || String(F.mode).toLowerCase()==='all';
  const list=programs.filter(p=>p.kind==='port'||wantQol);

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
      input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',which:13}));
      return true;
    }catch{ return false; }
  }
  const ensureTor=async()=>{
    if (now()-lastTor() < Math.max(0,Number(F.cdTor)||600000)) return;
    await term('buy tor');
    markTor();
  };
  const ensureConnect=async()=>{
    if (now()-lastConn() < Math.max(0,Number(F.cdConn)||10000)) return;
    await term('connect darkweb');
    markConn();
  };
  const progCooldownOk=(prog)=>{
    const f = `/Temp/apx.dw.cool.${prog}.txt`; const last=rd(f); const ok = (now()-last) >= Math.max(0,Number(F.cdProg)||12000); if(ok) wr(f, now()); return ok;
  };

  const tryPurchaseSing = async (prog)=>{
    try{ if (ns.singularity?.purchaseTor) { try{ ns.singularity.purchaseTor(); }catch{} } const ok = !!ns.singularity?.purchaseProgram?.(prog.name); return !!ok; }catch{ return false; }
  };
  const tryPurchaseDom = async (prog)=>{
    if(!progCooldownOk(prog.name)) return have(prog.name);
    await ensureTor();
    await ensureConnect();
    await term(`buy ${prog.name}`);
    await ns.sleep(200);
    return have(prog.name);
  };

  while(true){
    let pending=0, bought=0;
    for(const prog of list){
      if(have(prog.name)) continue;
      pending++;
      const need = Math.max(1, prog.cost * Math.max(0, Number(F.safety)||1.0));
      if (money() < need) continue; // 不足時は完全に何もしない
      let ok=false;
      const method=String(F.method).toLowerCase();
      if (method==='singularity') ok = await tryPurchaseSing(prog);
      else if (method==='dom') ok = await tryPurchaseDom(prog);
      else { // auto
        ok = await tryPurchaseSing(prog);
        if(!ok) ok = await tryPurchaseDom(prog);
      }
      if(ok){
        bought++;
        ns.toast(`Purchased ${prog.name}`,'success',4000);
        ns.tprint(`[darkweb] Purchased ${prog.name}  $${prog.cost.toLocaleString()}`);
        if(F.autoRooterRestart) restart(String(F.rooter||'rooter/apx-rooter.auto.v1.js'),['--interval',10000,'--log']);
        await ns.sleep(120);
      }
    }
    if(pending===0){ ns.tprint(`[darkweb] すべて購入済み（mode=${F.mode}, qos=${wantQol?'on':'off'}）`); break; }
    if(bought===0){ ns.print(`[darkweb] waiting funds... (${pending} remaining)`); await ns.sleep(Math.max(500,Number(F.interval)||1500)); }
  }
}
