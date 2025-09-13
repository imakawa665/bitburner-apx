
/** tools/apx-darkweb.autobuyer.v1.js
 * Dark Web Auto Buyer (Singularity不要 / DOMアシスト) - v1.1
 * - 購入のたびに rooter を「再走（再起動）」して即時root拡張
 */
export async function main(ns) {
  ns.disableLog('sleep'); ns.disableLog('getServerMoneyAvailable'); ns.clearLog();
  const F = ns.flags([
    ['mode','ports'], ['qol', false],
    ['safety', 1.0], ['interval', 1500], ['log', false],
    ['method','auto'], // auto | dom | singularity
    ['autoRooterRestart', true],
    ['rooter','rooter/apx-rooter.auto.v1.js']
  ]);

  const log=(...a)=>{ if(F.log) ns.print('[dw-buyer]',...a); };
  const exists=(f)=>ns.fileExists(f,'home');
  const isAny=(f)=> ns.ps('home').some(p=>p.filename===f);
  const restart=(file,args)=>{ try{
      if(!exists(file)) return false;
      const procs=ns.ps('home').filter(p=>p.filename===file);
      for(const p of procs) ns.kill(p.pid);
      const pid=ns.run(file,1,...(args||['--interval',10000,'--log']));
      return pid>0;
    }catch{return false;} };

  // 商品リスト
  const programs = [
    {name:'BruteSSH.exe',  cost:  500_000,   kind:'port'},
    {name:'FTPCrack.exe',  cost:1_500_000,   kind:'port'},
    {name:'relaySMTP.exe', cost:5_000_000,   kind:'port'},
    {name:'HTTPWorm.exe',  cost:30_000_000,  kind:'port'},
    {name:'SQLInject.exe', cost:250_000_000, kind:'port'},
    // QoL（任意）
    {name:'DeepscanV1.exe',    cost:  500_000,  kind:'qol'},
    {name:'DeepscanV2.exe',    cost:25_000_000, kind:'qol'},
    {name:'ServerProfiler.exe',cost:1_000_000,  kind:'qol'},
    {name:'AutoLink.exe',      cost:1_000_000,  kind:'qol'}
  ];
  const needKinds = (String(F.mode).toLowerCase()==='all') ? new Set(['port','qol']) : new Set(['port']);
  const wantQol = F.qol || needKinds.has('qol');
  const list = programs.filter(p => p.kind==='port' || (wantQol && p.kind==='qol'));

  // 購入手段の決定
  let useSing = false;
  if (String(F.method).toLowerCase()==='singularity') useSing = true;
  else if (String(F.method).toLowerCase()==='dom') useSing = false;
  else { try { useSing = !!(ns.singularity && ns.singularity.purchaseProgram); } catch { useSing = false; } }
  ns.tprint(`[darkweb] method=${useSing?'singularity':'dom'} mode=${F.mode} qos=${wantQol?'on':'off'} safety=${F.safety}`);

  const money = ()=> ns.getServerMoneyAvailable('home');
  const have  = (prog)=> ns.fileExists(prog, 'home');

  async function term(cmd){
    try{
      const doc = eval('document');
      const tab = Array.from(doc.querySelectorAll('button, [role="tab"], .MuiTab-root')).find(e => (e.textContent||'').toLowerCase().includes('terminal'));
      if (tab) tab.click(); await ns.sleep(10);
      const input = doc.getElementById('terminal-input') || doc.querySelector('input.MuiInputBase-input');
      if(!input) return false;
      input.value = cmd; input.dispatchEvent(new Event('input', { bubbles: true }));
      const ke = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', which: 13, keyCode: 13, bubbles: true });
      input.dispatchEvent(ke); log('terminal:', cmd); return true;
    }catch(e){ return false; }
  }
  const ensureTorAndConnectDom = async () => { await term(`buy tor; connect darkweb`); await ns.sleep(300); };

  const tryPurchaseSing = async (prog)=>{
    try{ if (ns.singularity.purchaseTor) { try{ ns.singularity.purchaseTor(); }catch{} } return !!ns.singularity.purchaseProgram(prog.name); }catch{ return false; }
  };
  const tryPurchaseDom = async (prog)=>{ await ensureTorAndConnectDom(); await term(`buy ${prog.name}`); await ns.sleep(400); return have(prog.name); };

  // ループ: 購入→rooter再走
  while(true){
    let pending=0, justBought=0;
    for(const prog of list){
      if (have(prog.name)) continue;
      pending++;
      const need = Math.max(1, prog.cost * Math.max(0, Number(F.safety)||1.0));
      if (money() < need) continue;
      let ok=false; if (useSing) ok = await tryPurchaseSing(prog); else ok = await tryPurchaseDom(prog);
      if (ok || have(prog.name)) {
        justBought++;
        ns.toast(`Purchased ${prog.name}`, 'success', 4000);
        ns.tprint(`[darkweb] Purchased ${prog.name}  $${prog.cost.toLocaleString()}`);
        // ここで rooter を再走
        if (F.autoRooterRestart) {
          restart(String(F.rooter||'rooter/apx-rooter.auto.v1.js'), ['--interval',10000,'--log']);
        }
        await ns.sleep(200);
      }
    }
    if (pending===0) { ns.tprint(`[darkweb] すべて購入済み（mode=${F.mode}, qol=${wantQol?'on':'off'}）`); break; }
    if (justBought===0) { ns.print(`[darkweb] waiting funds... (${pending} remaining)`); await ns.sleep(Math.max(300, Number(F.interval)||1500)); }
  }
}
