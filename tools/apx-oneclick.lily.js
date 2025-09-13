
/** tools/apx-oneclick.lily.js (v1.9.2)
 * 追加: --profile rep で REP 特化 (Share 全展開 + Faction Work DOM、batcher停止)
 */
export async function main(ns){
  ns.disableLog('sleep'); ns.disableLog('run'); ns.clearLog();
  const F = ns.flags([
    ['profile',''], ['autopilot', false],
    ['rooter', true], ['hud', true], ['micro', true], ['pserv', true], ['hacknet', true], ['share', true],
    ['spread', false], ['backdoor', true], ['advice', true], ['daemon', true], ['hash', true],
    ['pservBudget', 0.3], ['pservMin', 8], ['pservMax', 16384],
    ['sharePct', 0.25],
    ['withBatcher', false], ['target', ''], ['hackPct', 0.03], ['gap', 200], ['lanes', 1],
    ['darkweb', true], ['dwMode','ports'], ['dwQol', false], ['dwSafety', 1.0], ['dwMethod','auto'], ['dwInterval', 1500],
    ['log', true],
  ]);
  const runOnce=(f,th=1,...args)=>{ if(!ns.fileExists(f,'home')){ ns.print(`[oneclick] missing: ${f}`); return 0;} if(ns.ps('home').some(p=>p.filename===f)) return 1; const pid=ns.run(f,th,...args); if(pid===0) ns.tprint(`[oneclick] failed: ${f}`); else ns.print('[oneclick] start',f,'pid',pid,'args',JSON.stringify(args)); return pid?1:0; };
  const pf=String(F.profile||'').toLowerCase();
  if (pf==='autofull'){ runOnce('tools/apx-autopilot.full.v1.js',1,'--interval',1500,'--goal',1e9,'--uiLock','/Temp/apx.ui.lock.txt'); ns.tprint(`[oneclick] 起動: autopilot (v1.9.2)`); return; }
  if (pf==='rep'){ runOnce('tools/apx-autopilot.full.v1.js',1,'--interval',1200,'--repMode','true','--uiLock','/Temp/apx.ui.lock.txt'); ns.tprint(`[oneclick] 起動: REPモード (autopilot v1.9.2)`); return; }
  // 従来モードは省略（既存の処理を利用）
  ns.tprint(`[oneclick] profileが指定されていません。例: --profile autofull | --profile rep`);
}
