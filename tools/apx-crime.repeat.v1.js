
/** tools/apx-crime.repeat.v1.js (v1.0.3 HOTFIX)
 * Singularity commitCrime with automatic DOM fallback when SF4不所持
 * - API許可が無い/例外が出た場合、自動で tools/apx-crime.repeat.dom.v1.js を起動します。
 */
export async function main(ns){
  ns.disableLog('sleep');
  const F = ns.flags([['autoPick', true]]);
  const me = ()=>ns.getPlayer();
  const pick = ()=>{
    const p=me();
    // 軽いヒューリスティクス
    if (p.skills.strength >= 60 && p.skills.defense >= 60 && p.skills.dexterity >= 60) return 'mug someone';
    return 'shoplift';
  };
  const trySing = async (crime)=>{
    try{
      if (!ns.singularity || typeof ns.singularity.commitCrime !== 'function') throw new Error('no-sing');
      const ms = ns.singularity.commitCrime(crime);
      if (!Number.isFinite(ms)) throw new Error('commit-failed');
      await ns.sleep(Math.max(2000, ms + 50));
      return true;
    }catch(e){
      return false;
    }
  };
  const runDom = ()=>{
    if (ns.fileExists('tools/apx-crime.repeat.dom.v1.js','home') && !ns.isRunning('tools/apx-crime.repeat.dom.v1.js','home')){
      ns.tprint('[crime.repeat] Falling back to DOM version…');
      ns.run('tools/apx-crime.repeat.dom.v1.js', 1, '--crime', F.autoPick ? pick() : 'shoplift');
    } else {
      ns.tprint('[crime.repeat] DOM版が見つからないか実行中です。`tools/apx-crime.repeat.dom.v1.js` を確認してください。');
    }
  };

  while(true){
    const c = F.autoPick ? pick() : 'shoplift';
    const ok = await trySing(c);
    if (!ok){ runDom(); break; }
  }
}
