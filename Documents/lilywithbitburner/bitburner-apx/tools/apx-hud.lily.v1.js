/** apx-hud.lily.v1.js
 * Lily HUD — Overview の 'overview-extra-hook-0/1' を用いた軽量HUD
 * @param {NS} ns
 */
export async function main(ns) {
  ns.disableLog('sleep');
  let doc = eval('document'); let hook0=doc.getElementById('overview-extra-hook-0'); let hook1=doc.getElementById('overview-extra-hook-1');
  const nodes={}; ns.atExit(()=>{ try{ hook0.innerHTML=hook1.innerHTML=''; }catch{} });
  const line=(id,title,val,tip='')=>{ const mk=(t,c)=>{ const s=doc.createElement('span'); s.textContent=t; s.className=c; return s; };
    const p0=doc.createElement('p'); p0.className='tooltip'; const s0=mk(title,'title'); const t0=mk(tip,'tooltiptext'); p0.appendChild(s0); p0.appendChild(t0);
    const p1=doc.createElement('p'); p1.className='tooltip'; const s1=mk(val,'value');  const t1=mk(tip,'tooltiptext'); p1.appendChild(s1); p1.appendChild(t1);
    hook0.appendChild(p0); hook1.appendChild(p1); nodes[id]=[s0,s1,t0,t1,p0,p1]; };
  const set=(id,val,tip='')=>{ if(!nodes[id])return; const [s0,s1,t0,t1,p0,p1]=nodes[id]; if(s1.textContent!==val) s1.textContent=val; if(t0.textContent!==tip){ t0.textContent=tip; t1.textContent=tip; } p0.classList.remove('hidden'); p1.classList.remove('hidden'); };
  const css=()=>{ let prior=doc.getElementById('lilyHUDCSS'); if(prior) prior.remove(); doc.head.insertAdjacentHTML('beforeend', `<style id="lilyHUDCSS">
      .tooltip{margin:0;position:relative;} .tooltip.hidden{display:none;} .tooltip:hover .tooltiptext{visibility:visible;opacity:0.85;}
      .tooltip .tooltiptext{visibility:hidden;position:absolute;z-index:1;right:20px;top:19px;padding:2px 10px;text-align:right;white-space:pre;border-radius:6px;background-color:#900C;}
      .title{font-weight:600;} .value{cursor:default;}
  </style>`); }; css();
  for(const r of ['Target','HomeRAM','Network','Purchased','Income','Backdoor','NextCmd']) line(r,r,'-','');
  const scanAll=()=>{ const seen=new Set(['home']); const q=['home']; const order=[]; while(q.length){ const c=q.shift(); order.push(c); for(const n of ns.scan(c)) if(!seen.has(n)){ seen.add(n); q.push(n);} } return order; };
  let last=0, cache=['home']; const servers=()=>{ const now=Date.now(); if(now-last>4000){ cache=scanAll(); last=now; } return cache; };
  const pathTo=(host)=>{ const q=['home'],p={home:null},seen=new Set(['home']); while(q.length){ const c=q.shift(); for(const n of ns.scan(c)){ if(seen.has(n))continue; seen.add(n); p[n]=c; q.push(n); if(n===host){ q.length=0; break; } } } if(!p.hasOwnProperty(host)) return null; const path=[]; let x=host; while(x){ path.push(x); x=p[x]; } path.reverse(); return path; };
  const gen=(path)=>{ if(!path||path[0]!=='home')return null; const hops=path.slice(1); return ['home',...hops.map(h=>`connect ${h}`),'backdoor'].join('; '); };
  const best=()=>{ const me=ns.getPlayer().skills.hacking; let b='',score=-1; for(const h of servers()){ if(h==='home'||h==='darkweb') continue; if(!ns.hasRootAccess(h)) continue; if(ns.getServerRequiredHackingLevel(h)>me) continue; const m=ns.getServerMaxMoney(h)||0; if(m<=0) continue; const req=ns.getServerRequiredHackingLevel(h)||1; const s=m/(1+req); if(s>score){score=s;b=h;} } return b||'n00dles'; };
  const backlist=['CSEC','avmnite-02h','I.I.I.I','run4theh111z','w0r1d_d43m0n'].filter(h=>ns.serverExists(h));
  const nextBack=()=>{ const me=ns.getPlayer().skills.hacking; for(const h of backlist){ const s=ns.getServer(h); if(!s||s.backdoorInstalled) continue; if(ns.getServerRequiredHackingLevel(h)>me) continue; if(!ns.hasRootAccess(h)) continue; const path=pathTo(h); const tip=`Path: ${path?path.join(' -> '):'N/A'}\nReqHack: ${ns.getServerRequiredHackingLevel(h)}`; return {host:h,path,tip}; } return null; };
  nodes['NextCmd'][5].style.cursor='pointer'; nodes['NextCmd'][5].onclick=async()=>{ const nb=nextBack(); if(!nb?.path) return; const cmd=gen(nb.path); try{ await navigator.clipboard.writeText(cmd); ns.toast('connectコマンドをコピーしました','success',2000);}catch{} };
  while(true){
    const tgt=best(); set('Target',tgt,'期待収益の高いroot済みサーバ');
    const max=ns.getServerMaxRam('home'), used=ns.getServerUsedRam('home'); set('HomeRAM', `${max.toFixed(1)}GB ${(100*used/max).toFixed(0)}%`, `Used ${used.toFixed(1)} / Free ${(max-used).toFixed(1)}`);
    const sv=servers(); const rooted=sv.filter(h=>ns.hasRootAccess(h)).length; set('Network', `${sv.length}/${rooted}`, '全サーバ数 / root済み数');
    const p=ns.getPurchasedServers(); const lim=ns.getPurchasedServerLimit(); const tRam=p.reduce((a,h)=>a+ns.getServerMaxRam(h),0); set('Purchased', `${p.length}/${lim} (${tRam}GB)`, '買収サーバ数 / 上限 (総RAM)');
    const inc=ns.getTotalScriptIncome()[0]; set('Income', `$${(inc).toFixed(2)}/s`, '全スクリプトの瞬間収益');
    const nb=nextBack(); if(nb){ set('Backdoor', nb.host, nb.tip); const cmd=gen(nb.path); set('NextCmd','Click to Copy',cmd);} else { set('Backdoor','-','候補なし'); set('NextCmd','-',''); }
    await ns.sleep(1000);
  }
}
