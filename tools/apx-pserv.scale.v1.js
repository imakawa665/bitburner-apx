
/** tools/apx-pserv.scale.v1.js (v1.0)
 * 目的: 既存の購入サーバ群を、予算の範囲で順次スケールアップ（置換）する。
 * 仕様:
 *   - --budget <0..1> : 所持金の何割までを使うか（既定0.3）
 *   - 最も小さいRAMのサーバから、購入可能な最大RAMへ「置換」
 *   - 25台に未達なら新規購入を優先
 */
export async function main(ns){
  ns.disableLog('sleep'); ns.disableLog('getServerMoneyAvailable'); ns.disableLog('getPurchasedServerCost');
  const F=ns.flags([['budget',0.30],['prefix','px-'],['interval',3000],['log',true]]);
  const log=(...a)=>{ if(F.log) ns.print('[pserv.scale]',...a); };
  const lim = ns.getPurchasedServerLimit();
  const maxRam = ns.getPurchasedServerMaxRam();
  const cost = r=>ns.getPurchasedServerCost(r);
  const money = ()=>ns.getServerMoneyAvailable('home');
  function list(){ return ns.getPurchasedServers().sort((a,b)=>ns.getServerMaxRam(a)-ns.getServerMaxRam(b)); }
  function affordableMax(){
    let r=2; while(r<=maxRam && cost(r)<=money()*Number(F.budget||0.3)) r*=2; return r/2;
  }
  while(true){
    let servers = list();
    const want = Math.max(2, affordableMax());
    if (servers.length<lim){
      if (want>=2){
        const name = `${F.prefix}${Date.now().toString().slice(-6)}`;
        const pid = ns.purchaseServer(name, want);
        if(pid){ ns.tprint(`[pserv.scale] PURCHASE ${name} ${want}GB`); servers=list(); }
      }
    } else {
      // 置換：最小RAMと最大RAMの差があるときだけ
      servers = list();
      const smallest = servers[0]; const sram = ns.getServerMaxRam(smallest);
      if (want > sram){
        // 対象停止→削除→購入→deployなし（micro/daemonに委任）
        for(const p of ns.ps(smallest)) ns.kill(p.pid);
        ns.deleteServer(smallest);
        const name = `${F.prefix}${Date.now().toString().slice(-6)}`;
        if (ns.purchaseServer(name, want)){
          ns.tprint(`[pserv.scale] REPLACE ${smallest} (${sram}GB) -> ${name} (${want}GB)`);
        }
      }
    }
    await ns.sleep(Math.max(500, Number(F.interval)||3000));
  }
}
