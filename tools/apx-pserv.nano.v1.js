/** apx-pserv.nano.v1.js
 * 買収サーバの自動購入・配置（超軽量）
 * @param {NS} ns
 */
export async function main(ns) {
  ns.disableLog('sleep'); ns.disableLog('getServerMoneyAvailable'); ns.disableLog('getPurchasedServerCost');
  const FLAGS = ns.flags([ ['budget',0.6], ['minRam',8], ['maxRam',256], ['target',''], ['prefix','px'], ['keep',false] ]);
  const limit=ns.getPurchasedServerLimit(), have=ns.getPurchasedServers(), money=ns.getServerMoneyAvailable('home'), budget=money*Math.max(0,Math.min(1,FLAGS.budget));
  const pickTarget = () => {
    if (FLAGS.target && ns.serverExists(FLAGS.target)) return FLAGS.target;
    const me=ns.getPlayer().skills.hacking;
    const c=['n00dles','foodnstuff','sigma-cosmetics','joesguns','nectar-net','hong-fang-tea','harakiri-sushi'].filter(h=>ns.serverExists(h)&&ns.hasRootAccess(h)&&ns.getServerRequiredHackingLevel(h)<=me);
    if(c.length===0) return 'n00dles';
    c.sort((a,b)=>(ns.getServerMaxMoney(b)||0)-(ns.getServerMaxMoney(a)||0)); return c[0];
  };
  const target = pickTarget();
  let bestRam = Math.max(FLAGS.minRam,2);
  for(let r=FLAGS.minRam; r<=FLAGS.maxRam; r*=2){ const cost=ns.getPurchasedServerCost(r); if(cost<=budget) bestRam=r; }
  if(bestRam < FLAGS.minRam){ ns.tprint(`[pserv] 予算不足: minRam=${FLAGS.minRam}GB を購入できません`); return; }

  const need=Math.max(0, limit - have.length); let deleted=0;
  if (need===0 && !FLAGS.keep) {
    const infos=have.map(h=>({h, r:ns.getServerMaxRam(h)})).sort((a,b)=>a.r-b.r);
    for(const info of infos){ if(info.r>=bestRam) continue; if(ns.ps(info.h).length>0){ ns.killall(info.h); await ns.sleep(10); } if(ns.deleteServer(info.h)){ deleted++; break; } }
  }
  const buyCount=(need>0 || deleted>0) ? 1 : 0; if(buyCount===0){ ns.tprint(`[pserv] 置換対象なし。既存サーバは十分なRAMです。`); return; }

  const name=`${FLAGS.prefix}-${Date.now().toString().slice(-6)}`; const cost=ns.getPurchasedServerCost(bestRam);
  if(cost>ns.getServerMoneyAvailable('home')){ ns.tprint(`[pserv] 資金不足: 必要 $${cost.toLocaleString()}`); return; }
  const host=ns.purchaseServer(name, bestRam); if(!host){ ns.tprint(`[pserv] 購入失敗`); return; }

  const files=['apx-loop-hgw.nano.js','apx-w1.js','apx-g1.js','apx-h1.js'].filter(f=>ns.fileExists(f,'home')); if(files.length>0) await ns.scp(files, host);
  const max=ns.getServerMaxRam(host), costLoop=ns.getScriptRam('apx-loop-hgw.nano.js'), t=Math.max(1, Math.floor(max/costLoop));
  ns.exec('apx-loop-hgw.nano.js', host, t, '--target', target);
  ns.tprint(`[pserv] 購入 {host:${host}, ram:${bestRam}GB} → target=${target}, threads=${t}`);
}
