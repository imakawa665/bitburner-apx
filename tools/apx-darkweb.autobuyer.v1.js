
/** tools/apx-darkweb.autobuyer.v1.js  (v1.2.0 'buy -a' 対応)
 * 目的:
 *   - Dark Web のプログラムを自動購入（Singularity優先 → DOMフォールバック）
 *   - DOMは "buy -a" を使用（端末スパムを避けるためクールダウン付き）
 *   - 端末にコマンドが表示されないことがあるため、購入はファイル存在チェックで確定
 *
 * 使い方（例）:
 *   run tools/apx-darkweb.autobuyer.v1.js --mode ports --method auto --safety 1.0 --qol false
 *
 * 主なフラグ:
 *   --mode ports|all      : ports=クラッカーのみ / all=QoLも含む
 *   --qol                 : QoLを追加的に購入（--mode all と同義）
 *   --method auto|dom|singularity
 *   --safety <係数>       : 必要資金に掛ける係数（既定 1.0）
 *   --interval <ms>       : 監視インターバル
 *   --cdTor <ms>          : 'buy tor' のクールダウン（既定 10分）
 *   --cdConn <ms>         : 'connect darkweb' のクールダウン（既定 10秒）
 *   --cdBuyAll <ms>       : 'buy -a' のクールダウン（既定 12秒）
 *   --autoRooterRestart   : 購入後に rooter を自動再起動
 */
export async function main(ns){
  ns.disableLog('sleep'); ns.disableLog('getServerMoneyAvailable'); ns.clearLog();
  const F = ns.flags([
    ['mode','ports'],['qol',false],['safety',1.0],['interval',1500],['log',false],
    ['method','auto'],['autoRooterRestart',true],['rooter','rooter/apx-rooter.auto.v1.js'],
    ['cdTor',600000],['cdConn',10000],['cdBuyAll',12000]
  ]);
  const log=(...a)=>{ if(F.log) ns.print('[dw-buyer]',...a); };
  const exists=(f)=>ns.fileExists(f,'home'); const isAny=(f)=>ns.ps('home').some(p=>p.filename===f);
  const restart=(file,args)=>{ try{ if(!exists(file)) return false; for(const p of ns.ps('home').filter(p=>p.filename===file)) ns.kill(p.pid); return ns.run(file,1,...(args||['--interval',10000,'--log']))>0; }catch{return false;} };
  const now=()=>Date.now(); const rd=(f)=>{ try{ return Number(ns.read(f)||0);}catch{return 0;} }; const wr=(f,v)=>{ try{ ns.write(f,String(v),'w'); }catch{} };
  const markTorF='/Temp/apx.state.tor.ready.txt', markConnF='/Temp/apx.state.dw.connected.txt', markBuyAllF='/Temp/apx.state.dw.buyall.txt';

  const programs=[
    {name:'BruteSSH.exe',cost:  500000,kind:'port'},
    {name:'FTPCrack.exe',cost: 1500000,kind:'port'},
    {name:'relaySMTP.exe',cost: 5000000,kind:'port'},
    {name:'HTTPWorm.exe',cost:30000000,kind:'port'},
    {name:'SQLInject.exe',cost:250000000,kind:'port'},
    {name:'DeepscanV1.exe',cost:  500000,kind:'qol'},
    {name:'DeepscanV2.exe',cost:25000000,kind:'qol'},
    {name:'ServerProfiler.exe',cost:1000000,kind:'qol'},
    {name:'AutoLink.exe',cost: 1000000,kind:'qol'}
  ];
  const wantQol = F.qol || String(F.mode).toLowerCase()==='all';
  const list = programs.filter(p=>p.kind==='port'||wantQol);

  ns.tprint(`[darkweb] mode=${F.mode} qos=${wantQol?'on':'off'} safety=${F.safety}`);

  const money=()=>ns.getServerMoneyAvailable('home'); const have=(p)=>ns.fileExists(p,'home');

  // --- Terminal injection helpers (DOM) ---
  async function term(cmd){
    try{
      const doc=eval('document');
      // タブをTerminalに切替
      const tab=Array.from(doc.querySelectorAll('button,[role="tab"],.MuiTab-root')).find(e=>(e.textContent||'').toLowerCase().includes('terminal'));
      if(tab) tab.click();
      await ns.sleep(10);
      const input=doc.getElementById('terminal-input')||doc.querySelector('input.MuiInputBase-input');
      if(!input) return false;
      input.value=cmd;
      input.dispatchEvent(new Event('input', { bubbles:true }));
      input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',which:13}));
      // ※ UI の都合で履歴に表示されない場合があります（仕様）。購入は後続の fileExists で検証します。
      return true;
    }catch(e){ return false; }
  }
  const ensureTor      = async()=>{ const cd=Math.max(0,Number(F.cdTor)||600000);      if(now()-rd(markTorF)<cd) return; await term('buy tor'); wr(markTorF,now()); };
  const ensureConnect  = async()=>{ const cd=Math.max(0,Number(F.cdConn)||10000);     if(now()-rd(markConnF)<cd) return; await term('connect darkweb'); wr(markConnF,now()); };
  const canBuyAllAgain = ()=>  (now()-rd(markBuyAllF)) >= Math.max(0,Number(F.cdBuyAll)||12000);
  const markBuyAll     = ()=> wr(markBuyAllF, now());

  // --- Singularity path ---
  const purchaseSing = async (p)=>{
    try{
      if (ns.singularity?.purchaseTor) { try{ ns.singularity.purchaseTor(); }catch{} }
      const ok = !!ns.singularity?.purchaseProgram?.(p.name);
      return !!ok;
    }catch{ return false; }
  };

  // --- DOM path ---
  const buyAllDom = async()=>{
    if (!canBuyAllAgain()) return false;
    await ensureTor();
    await ensureConnect();
    // 実行前の所有状況をバックアップ
    const before = Object.fromEntries(list.map(x=>[x.name, have(x.name)]));
    const ok = await term('buy -a');
    markBuyAll();
    await ns.sleep(250);
    // 差分チェック
    let purchased=[];
    for(const p of list){ if(!before[p.name] && have(p.name)) purchased.push(p.name); }
    if(purchased.length>0){
      ns.tprint(`[darkweb] buy -a で購入: ${purchased.join(', ')}`);
      return true;
    }
    // 稀にUI遅延があるので軽く再確認
    await ns.sleep(250);
    for(const p of list){ if(!before[p.name] && have(p.name)) return true; }
    return ok;
  };

  while(true){
    // 未所有一覧
    const missing = list.filter(p=>!have(p.name));
    if (missing.length===0){
      ns.tprint(`[darkweb] すべて購入済み（mode=${F.mode}, qos=${wantQol?'on':'off'}）`);
      break;
    }
    // 直近で買えそう？（最安の未所有コスト基準）
    const minNeed = Math.min(...missing.map(p=>p.cost)) * Math.max(0, Number(F.safety)||1.0);
    if (money() >= minNeed){
      let bought=false;
      // Singularity優先
      if (String(F.method).toLowerCase()==='singularity'){
        for(const p of missing){ if(await purchaseSing(p)){ ns.tprint(`[darkweb] Purchased ${p.name}`); bought=true; break; } }
      } else if (String(F.method).toLowerCase()==='dom'){
        bought = await buyAllDom();
      } else { // auto
        for(const p of missing){ if(await purchaseSing(p)){ ns.tprint(`[darkweb] Purchased ${p.name}`); bought=true; } }
        if(!bought) bought = await buyAllDom();
      }
      if(bought && F.autoRooterRestart){
        // rooter再走 & spread更新
        if(exists(String(F.rooter||'rooter/apx-rooter.auto.v1.js'))){
          for(const p of ns.ps('home').filter(p=>p.filename===String(F.rooter||'rooter/apx-rooter.auto.v1.js'))) ns.kill(p.pid);
          ns.run(String(F.rooter||'rooter/apx-rooter.auto.v1.js'),1,'--interval',10000,'--log');
        }
        if (exists('tools/apx-spread.remote.v1.js') && !isAny('tools/apx-spread.remote.v1.js')) ns.run('tools/apx-spread.remote.v1.js',1);
      }
    }
    await ns.sleep(Math.max(300, Number(F.interval)||1500));
  }
}
