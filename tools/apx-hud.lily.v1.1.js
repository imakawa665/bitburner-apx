
export async function main(ns){
  ns.disableLog('sleep');
  const doc = eval('document'); const hook0 = doc.getElementById('overview-extra-hook-0'); const hook1 = doc.getElementById('overview-extra-hook-1');
  const rows={}; ns.atExit(()=>{ try{ hook0.innerHTML=""; hook1.innerHTML=""; }catch{} });
  function addRow(id, title, tip=""){
    const mk=()=>{ const p=doc.createElement("p"); p.className="tooltip"; const t=doc.createElement("span"); t.textContent=title.padEnd(9," "); p.appendChild(t); const v=doc.createElement("span"); v.textContent=""; p.appendChild(v); const tipSpan=doc.createElement("span"); tipSpan.className="tooltiptext"; tipSpan.textContent=tip; p.appendChild(tipSpan); return [t,v,tipSpan,p]; };
    const a=mk(), b=mk(); rows[id]=a; hook0.appendChild(a[3]); hook1.appendChild(b[3]); rows[id+'-val']=b;
  }
  function show(id,valueStr,tip=""){ const hdr=rows[id], val=rows[id+'-val']; if(!hdr||!val) return; const visible=valueStr!=null; hdr[3].style.display=val[3].style.display=visible?'':'none'; if(visible){ val[1].textContent=' '+String(valueStr).trim(); hdr[2].textContent=tip; val[2].textContent=tip; } }
  try{ let prior=doc.getElementById("apxHUDCSSv11"); if(prior) prior.remove(); const parent=doc.getElementsByClassName('MuiCollapse-root')[0]?.parentElement; if(parent) parent.style.zIndex=10000; doc.head.insertAdjacentHTML('beforeend', `<style id="apxHUDCSSv11"> .MuiTooltip-popper{z-index:10001}.tooltip{margin:0;position:relative}.tooltip .tooltiptext{visibility:hidden;position:absolute;right:20px;top:19px;padding:2px 10px;white-space:pre;border-radius:6px;background-color:#090a}.tooltip:hover .tooltiptext{visibility:visible;opacity:.9} </style>`);}catch{}
  ['Mode','Share','Hashes','HomeRAM','AllRAM','Income','Exp','Reserve'].forEach(h=>addRow(h,h));
  while(true){
    try{
      show("Mode", ns.fileExists('/Temp/apx.mode.rep','home')?'REP':'AUTO', "Current APX mode");
      const share=ns.getSharePower(); show("Share", share>1.0001?share.toFixed(2):null,"Share power");
      const cap=ns.hacknet.hashCapacity?.()||0; if(cap>0){ const n=ns.hacknet.numHashes?.()||0; show("Hashes", `${n.toFixed(0)}/${cap.toFixed(0)}`,"Hashes/Capacity"); } else show("Hashes",null,"");
      const maxH=ns.getServerMaxRam('home'), usedH=ns.getServerUsedRam('home'); show("HomeRAM", `${ns.formatRam(maxH)} ${(100*usedH/maxH).toFixed(1)}%`, "Home RAM");
      (function(){ const seen=new Set(); const q=['home']; let tU=0,tM=0; while(q.length){ const s=q.pop(); if(seen.has(s)) continue; seen.add(s); for(const n of ns.scan(s)) q.push(n);} for(const h of seen){ try{ const sv=ns.getServer(h); if(!sv.hasAdminRights) continue; tU+=sv.ramUsed||0; tM+=sv.maxRam||0; }catch{} } show("AllRAM", `${ns.formatRam(tM)} ${(tM?(100*tU/tM).toFixed(1):'0.0')}%`, "Total rooted RAM"); })();
      const inc=ns.getTotalScriptIncome?.()||[0,0]; show("Income", ns.formatNumber(inc[0],3)+'/s', "Instant income");
      const exp=ns.getTotalScriptExpGain?.()||0; show("Exp", ns.formatNumber(exp,3)+'/s', "Instant EXP");
      const reserve=Number(ns.read('reserve.txt')||0); show("Reserve", reserve>0?ns.formatMoney(reserve):null, "Reserved cash");
    }catch{}
    await ns.sleep(1000);
  }
}
