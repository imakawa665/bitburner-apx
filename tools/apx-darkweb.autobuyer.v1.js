
/** tools/apx-darkweb.autobuyer.v1.js (v1.2.0 'buy -a' 対応)
 * DOM操作で Terminal に 'buy -a' を投入して一括購入。
 * Singularity があればそれを優先し、失敗したものだけ DOM で試行。
 * クールダウン: buy tor=10分, connect darkweb=10秒, buy -a=12秒
 */
export async function main(ns){
  ns.disableLog('sleep'); ns.disableLog('getServerMoneyAvailable'); ns.clearLog();
  const F=ns.flags([['mode','ports'],['qol',false],['safety',1.0],['interval',1500],['log',false],['method','auto'],
                    ['cdTor',600000],['cdConn',10000],['cdBuyAll',12000],['autoRooterRestart',true],['rooter','rooter/apx-rooter.auto.v1.js']]);
  const log=(...a)=>{ if(F.log) ns.print('[dw-buyer]',...a); };
  const wr=(f,v)=>{ try{ ns.write(f,String(v),'w'); }catch{} }; const rd=(f)=>{ try{ return Number(ns.read(f)||0);}catch{return 0;} };
  const mTor='/Temp/apx.state.tor.ready.txt', mConn='/Temp/apx.state.dw.connected.txt', mBuyAll='/Temp/apx.state.dw.buyall.txt';
  const programs=[
    {name:'BruteSSH.exe',cost:500000,kind:'port'},{name:'FTPCrack.exe',cost:1500000,kind:'port'},{name:'relaySMTP.exe',cost:5000000,kind:'port'},{name:'HTTPWorm.exe',cost:30000000,kind:'port'},{name:'SQLInject.exe',cost:250000000,kind:'port'},
    {name:'DeepscanV1.exe',cost:500000,kind:'qol'},{name:'DeepscanV2.exe',cost:25000000,kind:'qol'},{name:'ServerProfiler.exe',cost:1000000,kind:'qol'},{name:'AutoLink.exe',cost:1000000,kind:'qol'}
  ];
  const wantQol = F.qol || String(F.mode).toLowerCase()==='all';
  const list=programs.filter(p=>p.kind==='port'||wantQol);
  const have=(x)=>ns.fileExists(x,'home');
  const money=()=>ns.getServerMoneyAvailable('home');
  ns.tprint(`[darkweb] mode=${F.mode} qos=${wantQol?'on':'off'} safety=${F.safety}`);

  async function term(cmd){
    try{
      const doc=eval('document');
      const tab=[...doc.querySelectorAll('button,[role="tab"],.MuiTab-root')].find(e=>(e.textContent||'').toLowerCase().includes('terminal'));
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
  const ensureTor=async()=>{ const cd=Math.max(0,Number(F.cdTor)||600000); if(Date.now()-rd(mTor)<cd) return; await term('buy tor'); wr(mTor,Date.now()); };
  const ensureConn=async()=>{ const cd=Math.max(0,Number(F.cdConn)||10000); if(Date.now()-rd(mConn)<cd) return; await term('connect darkweb'); wr(mConn,Date.now()); };
  const canBuyAll=()=> (Date.now()-rd(mBuyAll)) >= Math.max(0,Number(F.cdBuyAll)||12000);
  const markBuyAll=()=> wr(mBuyAll,Date.now());

  const singBuy = async (p)=>{ try{ if(ns.singularity?.purchaseTor) { try{ ns.singularity.purchaseTor(); }catch{} } return !!ns.singularity?.purchaseProgram?.(p.name); }catch{ return false; } };

  while(true){
    const missing=list.filter(p=>!have(p.name));
    if(missing.length===0){ ns.tprint(`[darkweb] すべて購入済み`); break; }
    const minNeed = Math.min(...missing.map(p=>p.cost))*Math.max(1,Number(F.safety)||1.0);
    if(money()>=minNeed){
      let bought=false;
      if(String(F.method).toLowerCase()!=='dom'){
        for(const p of missing){ if(await singBuy(p)){ ns.tprint(`[darkweb] Purchased ${p.name}`); bought=true; } }
      }
      if(!bought && canBuyAll()){
        await ensureTor(); await ensureConn();
        // 事前所有状況（差分検出）
        const before=Object.fromEntries(list.map(x=>[x.name,have(x.name)]));
        await term('buy -a'); markBuyAll();
        await ns.sleep(250);
        const purchased=[]; for(const p of list){ if(!before[p.name] && have(p.name)) purchased.push(p.name); }
        if(purchased.length){ ns.tprint(`[darkweb] buy -a 購入: ${purchased.join(', ')}`); bought=true; }
      }
      if(bought && F.autoRooterRestart && ns.fileExists(String(F.rooter||'rooter/apx-rooter.auto.v1.js'),'home')){
        for(const p of ns.ps('home').filter(p=>p.filename===String(F.rooter||'rooter/apx-rooter.auto.v1.js'))) ns.kill(p.pid);
        ns.run(String(F.rooter||'rooter/apx-rooter.auto.v1.js'),1,'--interval',10000,'--log');
      }
    }
    await ns.sleep(Math.max(500,Number(F.interval)||1500));
  }
}
