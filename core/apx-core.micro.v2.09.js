
export async function main(ns){
  const F=ns.flags([['allRooted',true],['reserveRamPct',0.10],['target',''],['log',false]]);
  const log=(...a)=>{ if(F.log) ns.print('[micro]',...a); };
  const LOOP='workers/apx-loop-hgw.nano.js';
  if(!ns.fileExists(LOOP,'home')){ ns.tprint('[micro] missing '+LOOP); return; }
  function readPin(){ try{ const t=(ns.read('/Temp/apx.pin.target.txt')||'').trim(); return t||null; }catch{return null;} }
  function bestTarget(){
    const pin=String(F.target||'').trim()||readPin();
    if(pin && ns.serverExists(pin)) return pin;
    const me=ns.getPlayer(); const seen=new Set(); const q=['home']; const cand=[];
    while(q.length){ const s=q.pop(); if(seen.has(s)) continue; seen.add(s); for(const n of ns.scan(s)) q.push(n); }
    for(const h of seen){ if(h==='home') continue; try{ const sv=ns.getServer(h); if(!sv.hasAdminRights) continue; if(sv.requiredHackingSkill>me.skills.hacking) continue; if(sv.moneyMax<=0) continue; const sec=sv.minDifficulty||1; const money=sv.moneyMax||1; const tHack=ns.getHackTime(h)||1; const score=(money/Math.max(1,tHack))*(1.5-Math.min(1,sec/100)); cand.push([score,h]); }catch{} }
    cand.sort((a,b)=>b[0]-a[0]); return (cand[0]||[])[1]||'n00dles';
  }
  function rootedHosts(){ const seen=new Set(); const q=['home']; const out=[]; while(q.length){ const s=q.pop(); if(seen.has(s)) continue; seen.add(s); for(const n of ns.scan(s)) q.push(n); } for(const h of seen){ try{ const sv=ns.getServer(h); if(!sv.hasAdminRights) continue; out.push(h);}catch{} } return out; }
  function freeRam(host){ const max=ns.getServerMaxRam(host), used=ns.getServerUsedRam(host); const keep=(host==='home') ? Math.floor(max*Number(F.reserveRamPct||0.1)) : 0; return Math.max(0, Math.floor(max-used-keep)); }
  function runLoop(host,target){ if(ns.ps(host).some(p=>p.filename===LOOP && p.args[0]===target)) return; try{ if(host!=='home' && !ns.fileExists(LOOP,host)) ns.scp(LOOP,host); }catch{} const cost=ns.getScriptRam(LOOP,'home')||1.6; const th=Math.max(1, Math.floor(freeRam(host)/cost)); if(th>0) ns.exec(LOOP,host,1,target); }
  while(true){ const tgt=bestTarget(); for(const h of rootedHosts()){ runLoop(h,tgt); await ns.sleep(10);} await ns.sleep(2000); }
}
