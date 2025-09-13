/** tools/apx-darkweb.autobuyer.v1.js  (v1.2.0 'buy -a' 対応) */
export async function main(ns){
  ns.disableLog('sleep'); ns.disableLog('getServerMoneyAvailable'); ns.clearLog();
  const F = ns.flags([['mode','ports'],['qol',false],['safety',1.0],['interval',1500],['log',false],['method','auto'],['autoRooterRestart',true],['rooter','rooter/apx-rooter.auto.v1.js'],['cdTor',600000],['cdConn',10000],['cdBuyAll',12000]]);
  const log=(...a)=>{ if(F.log) ns.print('[dw-buyer]',...a); };
  const exists=(f)=>ns.fileExists(f,'home'); const isAny=(f)=>ns.ps('home').some(p=>p.filename===f);
  const restart=(file,args)=>{ try{ if(!exists(file)) return false; for(const p of ns.ps('home').filter(p=>p.filename===file)) ns.kill(p.pid); return ns.run(file,1,...(args||['--interval',10000,'--log']))>0; }catch{return false;} };
  const now=()=>Date.now(); const rd=(f)=>{ try{ return Number(ns.read(f)||0);}catch{return 0;} }; const wr=(f,v)=>{ try{ ns.write(f,String(v),'w'); }catch{} };
  const torMark='/Temp/apx.state.tor.ready.txt'; const connMark='/Temp/apx.state.dw.connected.txt'; const markBuyAllF='/Temp/apx.state.dw.buyall.txt';
  const programs=[
    {name:'BruteSSH.exe',cost:  500000,kind:'port'},{name:'FTPCrack.exe',cost: 1500000,kind:'port'},{name:'relaySMTP.exe',cost: 5000000,kind:'port'},{name:'HTTPWorm.exe',cost:30000000,kind:'port'},{name:'SQLInject.exe',cost:250000000,kind:'port'},
    {name:'DeepscanV1.exe',cost:  500000,kind:'qol'},{name:'DeepscanV2.exe',cost:25000000,kind:'qol'},{name:'ServerProfiler.exe',cost:1000000,kind:'qol'},{name:'AutoLink.exe',cost:1000000,kind:'qol'}
  ];
  const wantQol = F.qol || String(F.mode).toLowerCase()==='all';
  const list=programs.filter(p=>p.kind==='port'||wantQol);
  ns.tprint(`[darkweb] mode=${F.mode} qos=${wantQol?'on':'off'} safety=${F.safety}`);

  async function term(cmd){ try{ const doc=eval('document'); const tab=[...doc.querySelectorAll('button,[role="tab"],.MuiTab-root')].find(e=>(e.textContent||'').toLowerCase().includes('terminal')); if(tab) tab.click(); await ns.sleep(10); const input=doc.getElementById('terminal-input')||doc.querySelector('input.MuiInputBase-input'); if(!input) return false; input.value=cmd; input.dispatchEvent(new Event('input',{bubbles:true})); input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',which:13})); return true; }catch(e){ return false; } }
  const ensureTor=async()=>{ if (now()-rd(torMark) < Math.max(0,Number(F.cdTor)||600000)) return; await term('buy tor'); wr(torMark,now()); };
  const ensureConnect=async()=>{ if (now()-rd(connMark) < Math.max(0,Number(F.cdConn)||10000)) return; await term('connect darkweb'); wr(connMark,now()); };
  const canBuyAllAgain=()=> (now()-rd(markBuyAllF)) >= Math.max(0,Number(F.cdBuyAll)||12000); const markBuyAll=()=> wr(markBuyAllF, now());

  const have=(p)=>ns.fileExists(p,'home'); const money=()=>ns.getServerMoneyAvailable('home');
  while(true){
    const missing = list.filter(p=>!have(p.name));
    if (missing.length===0){ ns.tprint(`[darkweb] すべて購入済み`); break; }
    const minNeed = Math.min(...missing.map(p=>p.cost)) * Math.max(0, Number(F.safety)||1.0);
    if (money() >= minNeed){
      let bought=false;
      // Singularity優先
      for(const p of missing){ try{ if (ns.singularity?.purchaseProgram?.(p.name)) { ns.tprint(`[darkweb] Purchased ${p.name}`); bought=true; } }catch{} }
      if(!bought && canBuyAllAgain()){
        await ensureTor(); await ensureConnect();
        // 所有差分で判定
        const before=Object.fromEntries(list.map(x=>[x.name,have(x.name)]));
        await term('buy -a'); markBuyAll(); await ns.sleep(250);
        let got=false; for(const p of list){ if(!before[p.name] && have(p.name)) got=true; }
        if (got){ bought=true; ns.tprint(`[darkweb] buy -a: 何か購入されました`); }
      }
      if(bought && F.autoRooterRestart) restart(String(F.rooter||'rooter/apx-rooter.auto.v1.js'),['--interval',10000,'--log']);
    }
    await ns.sleep(Math.max(300, Number(F.interval)||1500));
  }
}
