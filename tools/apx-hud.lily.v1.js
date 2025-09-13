
/** tools/apx-hud.lily.v1.js
 * 2列HUD（overview-extra-hook-0/1）に、必要な情報を低コストで表示。
 * - ns.atExit でクリーンアップ（重複回避）
 * - 必要時のみ取得（Hashes/Share/Servers等）
 */
export async function main(ns){
  ns.disableLog('sleep');
  const doc = eval('document');
  const hook0 = doc.getElementById('overview-extra-hook-0');
  const hook1 = doc.getElementById('overview-extra-hook-1');
  const rows = {};
  function line(id,header,value,tip=""){
    const p = doc.createElement("p"); p.className="tooltip";
    const a=doc.createElement("span"); a.textContent=header.padEnd(9," "); p.appendChild(a);
    const b=doc.createElement("span"); b.textContent=value; b.className='tooltiptext'; p.appendChild(b);
    rows[id]=[a,b,p];
    return p;
  }
  function show(id,val,tip=""){
    if(!rows[id]) return;
    if(val==null){ rows[id][2].style.display='none'; return; }
    rows[id][2].style.display='';
    rows[id][1].textContent=tip;
    rows[id][0].textContent = rows[id][0].textContent.replace(/\s+$/,' ') + ((' '+String(val)).trim()?(' '+String(val).trim()):'');
  }
  ns.atExit(()=>{ try{ hook0.innerHTML=""; hook1.innerHTML=""; }catch{} });
  // CSS front
  try{
    let prior = doc.getElementById("apxHUDCSS");
    if(prior) prior.parentElement.removeChild(prior);
    const parent = doc.getElementsByClassName('MuiCollapse-root')[0]?.parentElement;
    if(parent) parent.style.zIndex = 10000;
    doc.head.insertAdjacentHTML('beforeend', `<style id="apxHUDCSS">
      .MuiTooltip-popper { z-index: 10001 }
      .tooltip { margin: 0; position: relative; }
      .tooltip .tooltiptext { visibility: hidden; position: absolute; right: 20px; top: 19px; padding: 2px 10px; white-space: pre; border-radius: 6px; background-color: #090a; }
      .tooltip:hover .tooltiptext { visibility: visible; opacity: 0.9; }
    </style>`);
  }catch{}
  // initial rows
  const defs=[["Mode","-","APX"],["Share","-",""],["Hashes","-",""],["HomeRAM","-",""],["AllRAM","-",""],["Income","-",""],["Exp","-",""],["Reserve","-",""]];
  for(const [h,v,t] of defs){ hook0.appendChild(line(h+"-t",h,t)); hook1.appendChild(line(h+"-v","",t)); }
  while(true){
    const share=ns.getSharePower();
    show("Mode-v", (ns.fileExists('/Temp/apx.mode.rep','home')?'REP':'AUTO'),"Current APX mode");
    show("Share-v", share>1.0001 ? share.toFixed(2) : null, "Share power (boosts faction rep)");
    const hashesCap = ns.hacknet.hashCapacity?.()||0;
    if(hashesCap>0){ const n=ns.hacknet.numHashes?.()||0; show("Hashes-v", `${n.toFixed(0)}/${hashesCap.toFixed(0)}`, "Current/Capacity"); }
    const maxH=ns.getServerMaxRam('home'), usedH=ns.getServerUsedRam('home');
    show("HomeRAM-v", `${ns.formatRam(maxH)} ${(100*usedH/maxH).toFixed(1)}%`,"Home RAM usage");
    // total RAM
    (function(){
      const seen=new Set(); const q=['home']; let tUsed=0,tMax=0;
      while(q.length){ const s=q.pop(); if(seen.has(s)) continue; seen.add(s); for(const n of ns.scan(s)) q.push(n); }
      for(const h of seen){ try{ const sv=ns.getServer(h); if(!sv.hasAdminRights) continue; tUsed+=sv.ramUsed||0; tMax+=sv.maxRam||0; }catch{} }
      show("AllRAM-v", `${ns.formatRam(tMax)} ${(tMax? (100*tUsed/tMax).toFixed(1):'0.0')}%`, "Total rooted RAM usage");
    })();
    const inc = ns.getTotalScriptIncome?.()||[0,0]; show("Income-v", ns.nFormat(inc[0],"$0.00a")+"/s","Instant script income");
    const exp = ns.getTotalScriptExpGain?.()||0; show("Exp-v", ns.nFormat(exp,"0.0a")+"/s","Instant EXP gain");
    const reserve = Number(ns.read('reserve.txt')||0); show("Reserve-v", reserve>0?ns.nFormat(reserve,"$0.00a"):null,"Reserved cash (won't be spent)");
    await ns.sleep(1000);
  }
}
