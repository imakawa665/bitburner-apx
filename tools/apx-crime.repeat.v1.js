
/** tools/apx-crime.repeat.v1.js (v1.0.1 HOTFIX)
 * Fix: Use Singularity API (ns.singularity.commitCrime) instead of ns.commitCrime
 * Fallback: If Singularity is unavailable, advise using tools/apx-crime.repeat.dom.v1.js
 */
export async function main(ns){
  ns.disableLog('sleep');
  const F = ns.flags([['autoPick', true]]);
  const sing = ns.singularity && typeof ns.singularity.commitCrime === 'function';
  const me = ()=>ns.getPlayer();
  const pick = ()=>{
    const p=me();
    // very rough heuristic
    if (p.skills.strength >= 60 && p.skills.defense >= 60 && p.skills.dexterity >= 60) return 'mug someone';
    return 'shoplift';
  };
  if(!sing){
    ns.tprint('[crime.repeat] Singularity APIが無いため、このスクリプトでは犯罪を開始できません。');
    ns.tprint('[crime.repeat] 代わりに `run tools/apx-crime.repeat.dom.v1.js` を使用してください。');
    return;
  }
  while(true){
    const c = F.autoPick ? pick() : 'shoplift';
    const ms = ns.singularity.commitCrime(c) || 4000;
    await ns.sleep(Math.max(2000, ms + 50));
  }
}
