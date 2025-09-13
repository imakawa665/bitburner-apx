/** tools/apx-hud.lily.v1.js (light HUD, stats.js-inspired)
 * Uses overview-extra-hook-0/1; removes lines on exit; low-RAM polling.
 */
export async function main(ns){
  ns.disableLog('sleep'); const doc=eval('document');
  const h0=doc.getElementById('overview-extra-hook-0'), h1=doc.getElementById('overview-extra-hook-1');
  const add=(id,t,tip="")=>{ const p=doc.createElement('p'); p.className='tooltip'; const s=doc.createElement('span'); s.textContent=t; const tt=doc.createElement('span'); tt.textContent=tip; tt.className='tooltiptext'; p.appendChild(s); p.appendChild(tt); p.id=id; return p; };
  const rows=[['APX',''],['Cash',''],['Home',''],['All RAM',''],['Share',''],['Target','']];
  for(const [k,_] of rows){ h0.appendChild(add(`apx-${k}-t`,k)); h1.appendChild(add(`apx-${k}-v`,'...')); }
  ns.atExit(()=>{ for(const [k,_] of rows){ const e0=doc.getElementById(`apx-${k}-t`), e1=doc.getElementById(`apx-${k}-v`); if(e0?.remove) e0.remove(); if(e1?.remove) e1.remove(); } });

  function set(k,v){ const e=doc.getElementById(`apx-${k}-v`); if(e) e.firstChild.textContent=' '+v; }

  while(true){
    try{
      set('APX','v1.9.3');
      set('Cash', ns.nFormat(ns.getServerMoneyAvailable('home'),'$0.00a'));
      const mx=ns.getServerMaxRam('home'), used=ns.getServerUsedRam('home'); set('Home', `${ns.nFormat(mx, '0.0') }GB ${(100*used/mx).toFixed(1)}%`);
      // All RAM
      let tot=0, use=0; const seen=new Set(); const q=['home']; while(q.length){ const s=q.pop(); if(seen.has(s)) continue; seen.add(s); for(const n of ns.scan(s)) q.push(n); try{ const sv=ns.getServer(s); if(sv.hasAdminRights){ tot+=sv.maxRam; use+=sv.ramUsed; } }catch{} }
      set('All RAM', `${ns.nFormat(tot,'0.0')}GB ${(tot>0?(100*use/tot):0).toFixed(1)}%`);
      set('Share', ns.getSharePower().toFixed(2));
      // Target (pin or auto best)
      let tgt=(ns.read('/Temp/apx.pin.target.txt')||'').trim(); if(!tgt){ const me=ns.getPlayer(); const seen2=new Set(); const q2=['home']; const cand=[]; while(q2.length){ const s=q2.pop(); if(seen2.has(s)) continue; seen2.add(s); for(const n of ns.scan(s)) q2.push(n); if(s==='home') continue; try{ const sv=ns.getServer(s); if(!sv.hasAdminRights || sv.requiredHackingSkill>me.skills.hacking || sv.moneyMax<=0) continue; const score=(sv.moneyMax/(ns.getHackTime(s)||1))*(1.5-Math.min(1,(sv.minDifficulty||1)/100)); cand.push([score,s]); }catch{} } cand.sort((a,b)=>b[0]-a[0]); tgt=(cand[0]||[])[1]||'n00dles'; }
      set('Target', tgt);
    }catch{}
    await ns.sleep(1200);
  }
}
