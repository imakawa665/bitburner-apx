/** apx-karma.watch.v1.js */
export async function main(ns){
  ns.disableLog('sleep');
  const F=ns.flags([['goal', -54000], ['interval', 2000], ['notify', true], ['log', true]]);
  const log=(...a)=>{ if(F.log) ns.print('[karma]',...a); };
  let last = ns.heart.break(), lastTs=Date.now();
  ns.tprint(`[karma] start ${last.toFixed(1)} → goal ${F.goal}`);
  while(true){
    const nowK = ns.heart.break(); const nowTs = Date.now();
    const dK = nowK - last; const dt = (nowTs - lastTs) / 1000;
    const rate = dK / dt; const remain = Math.max(0, (nowK - F.goal)); const eta = rate<0 ? remain / (-rate) : Infinity;
    const etaStr = isFinite(eta) ? `${(eta/60).toFixed(1)}m` : '∞';
    ns.clearLog(); ns.print(`Karma: ${nowK.toFixed(1)}  dK/ds=${rate.toFixed(2)}  ETA=${etaStr}`);
    if (nowK <= F.goal && F.notify){ ns.toast(`Karma reached ${nowK.toFixed(0)} (goal ${F.goal})`, 'success', 5000); }
    last = nowK; lastTs = nowTs;
    await ns.sleep(Math.max(500, Number(F.interval)));
  }
}
