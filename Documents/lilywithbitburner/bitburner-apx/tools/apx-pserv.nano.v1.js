/** apx-pserv.nano.v1.js
 * 買収サーバの自動購入・配置（単発）
 * @param {NS} ns
 */
export async function main(ns) {
  ns.disableLog('sleep'); ns.disableLog('getServerMoneyAvailable'); ns.disableLog('getPurchasedServerCost');
  const F=ns.flags([['budget',0.6],['minRam',8],['maxRam',256],['target',''],['prefix','px'],['keep',false]]);
  const limit=ns.getPurchasedServerLimit(), have=ns.getPurchasedServers(), money=ns.getServerMoneyAvailable('home'), budget=money*Math.max(0,Math.min(1,F.budget));
  const pick=()=>{ if(F.target&&ns.serverExists(F.target))return F.target; const me=ns.getPlayer().skills.hacking; const c=['n00dles','foodnstuff','sigma-cosmetics','joesguns','nectar-net','hong-fang-tea','harakiri-sushi'].filter(h=>ns.serverExists(h)&&ns.hasRootAccess(h)&&ns.getServerRequiredHackingLevel(h)<=me); if(c.length===0)return'n00dles'; c.sort((a,b)=>(ns.getServerMaxMoney(b)||0)-(ns.getServerMaxMoney(a)||0)); return c[0]; };
  const target=pick(); let bestRam=Math.max(F.minRam,2); for(let r=F.minRam; r<=F.maxRam; r*=2){ const c=ns.getPurchasedServerCost(r); if(c<=budget) bestRam=r; }
  if(bestRam<F.minRam) return ns.tprint(`[pserv] 予算不足: minRam=${F.minRam}GB`);
  const need=Math.max(0,limit-have.length); let deleted=0; if(need===0 && !F.keep){ const infos=have.map(h=>({h,r:ns.getServerMaxRam(h)})).sort((a,b)=>a.r-b.r); for(const info of infos){ if(info.r>=bestRam) continue; if(ns.ps(info.h).length>0){ ns.killall(info.h); await ns.sleep(10);} if(ns.deleteServer(info.h)){ deleted++; break; } } }
  const buy=(need>0||deleted>0)?1:0; if(buy===0) return ns.tprint(`[pserv] 置換対象なし`);
  const name=`${F.prefix}-${Date.now().toString().slice(-6)}`; const cost=ns.getPurchasedServerCost(bestRam); if(cost>ns.getServerMoneyAvailable('home')) return ns.tprint(`[pserv] 資金不足: $${cost.toLocaleString()}`);
  const host=ns.purchaseServer(name,bestRam); if(!host) return ns.tprint(`[pserv] 購入失敗`);
  const files=['apx-loop-hgw.nano.js','apx-w1.js','apx-g1.js','apx-h1.js'].filter(f=>ns.fileExists(f,'home')); if(files.length>0) await ns.scp(files, host);
  const max=ns.getServerMaxRam(host), sCost=ns.getScriptRam('apx-loop-hgw.nano.js'), th=Math.max(1,Math.floor(max/sCost));
  ns.exec('apx-loop-hgw.nano.js', host, th, '--target', target); ns.tprint(`[pserv] 購入 ${host} (${bestRam}GB) → target=${target}, threads=${th}`);
}
