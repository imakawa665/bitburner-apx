/** apx-pserv.nano.v1.js */
export async function main(ns) {
  ns.disableLog('sleep'); ns.disableLog('getServerMoneyAvailable'); ns.disableLog('getPurchasedServerCost');
  const F=ns.flags([['budget',0.6],['minRam',8],['maxRam',256],['target',''],['prefix','px'],['keep',false],['log',true]]);
  const LOOP = 'workers/apx-loop-hgw.nano.js'; const WORKERS = ['workers/apx-w1.js','workers/apx-g1.js','workers/apx-h1.js'];
  const log=(...a)=>{ if(F.log) ns.print('[pserv]',...a); };
  const limit=ns.getPurchasedServerLimit(), have=ns.getPurchasedServers(), money=ns.getServerMoneyAvailable('home'), budget=money*Math.max(0,Math.min(1,F.budget));
  const pick=()=>{ if(F.target&&ns.serverExists(F.target))return F.target; const me=ns.getPlayer().skills.hacking; const c=['n00dles','foodnstuff','sigma-cosmetics','joesguns','nectar-net','hong-fang-tea','harakiri-sushi'].filter(h=>ns.serverExists(h)&&ns.getServerRequiredHackingLevel(h)<=me); if(c.length===0)return'n00dles'; c.sort((a,b)=>(ns.getServerMaxMoney(b)||0)-(ns.getServerMaxMoney(a)||0)); return c[0]; };
  const target=pick(); let bestRam=Math.max(F.minRam,2); for(let r=F.minRam; r<=F.maxRam; r*=2){ const c=ns.getPurchasedServerCost(r); if(c<=budget) bestRam=r; }
  if(bestRam<F.minRam){ ns.tprint(`[pserv] 予算不足: minRam=${F.minRam}GB`); return; }
  const need=Math.max(0,limit-have.length); let deleted=0; if(need===0 && !F.keep){ const infos=have.map(h=>({h,r:ns.getServerMaxRam(h)})).sort((a,b)=>a.r-b.r); for(const info of infos){ if(info.r>=bestRam) continue; if(ns.ps(info.h).length>0){ ns.killall(info.h); await ns.sleep(10);} if(ns.deleteServer(info.h)){ deleted++; log('deleted',info.h,'->',bestRam); break; } } }
  const buy=(need>0||deleted>0)?1:0; if(buy===0) return ns.tprint(`[pserv] 置換対象なし`);
  const name=`${F.prefix}-${Date.now().toString().slice(-6)}`; const cost=ns.getPurchasedServerCost(bestRam); if(cost>ns.getServerMoneyAvailable('home')) return ns.tprint(`[pserv] 資金不足: $${cost.toLocaleString()}`);
  const host=ns.purchaseServer(name,bestRam); if(!host) return ns.tprint(`[pserv] 購入失敗`);
  const files=[LOOP, ...WORKERS].filter(f=>ns.fileExists(f,'home')); if(files.length>0) await ns.scp(files, host); log('scp',host,files.join(','));
  const max=ns.getServerMaxRam(host); let loopCost=ns.getScriptRam(LOOP,'home'); if(!isFinite(loopCost)||loopCost<=0) loopCost=1.6; let th=Math.max(1,Math.floor(max/loopCost)); if(!isFinite(th)||th<1) th=1;
  ns.exec(LOOP, host, th, '--target', target); ns.tprint(`[pserv] 購入 ${host} (${bestRam}GB) → target=${target}, threads=${th}`); log('start',host,'t',th,'target',target);
}
