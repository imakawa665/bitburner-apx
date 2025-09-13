/** tools/apx-study.train.dom.v1.js (v1.0)
 * Singularity無しで 大学/ジム を自動操作（DOM）
 * - Hack が --hackTo 未満なら Rothman University の CS を受講
 * - Agi が --agiTo 未満なら Powerhouse Gym で敏捷を訓練
 * - UIロック(/Temp/apx.ui.lock.txt)で他DOMスクリプトと排他制御
 */
export async function main(ns){
  ns.disableLog('sleep'); ns.clearLog();
  const F=ns.flags([['hackTo',50],['agiTo',50],['lock','/Temp/apx.ui.lock.txt'],['watch',120000],['log',false]]);
  const log=(...a)=>{ if(F.log) ns.print('[study/train]',...a); };
  const haveLock=()=>ns.fileExists(F.lock,'home');
  const acquire=()=>{ try{ if(!haveLock()){ ns.write(F.lock, String(ns.pid),'w'); return true;} }catch{} return false; };
  const release=()=>{ try{ const cur=Number(ns.read(F.lock)||0); if(cur===ns.pid) ns.rm(F.lock,'home'); }catch{} };
  const me=()=>ns.getPlayer();

  async function clickByText(txts){
    try{
      const doc=eval('document');
      for(const t of txts){
        const el=Array.from(doc.querySelectorAll('button,div,span,a')).find(e=>(e.textContent||'').trim()==t);
        if(el){ el.click(); await ns.sleep(50); }
      }
      return true;
    }catch{ return false; }
  }
  async function toTerminal(){ try{ const doc=eval('document'); const tab=Array.from(doc.querySelectorAll('button,[role="tab"],.MuiTab-root')).find(e=>(e.textContent||'').toLowerCase().includes('terminal')); if(tab) tab.click(); }catch{} }

  while(true){
    const p=me();
    const needHack = p.skills.hacking < Number(F.hackTo||50);
    const needAgi  = p.skills.agility < Number(F.agiTo||50);

    if(!(needHack||needAgi)){ await ns.sleep(Math.max(5000, Number(F.watch)||120000)); continue; }

    if(!acquire()){ log('UI locked; retry later'); await ns.sleep(3000); continue; }

    // City -> Rothman University -> Study Computer Science -> Start studying
    if(needHack){
      ns.tprint('[study/train] 自動学習: RothmanでCSを開始');
      try{
        const doc=eval('document');
        // 左メニュー City
        const city=Array.from(doc.querySelectorAll('button,[role="tab"],.MuiTab-root')).find(e=>(e.textContent||'').trim().toLowerCase()=='city');
        if(city) city.click(); await ns.sleep(200);
        await clickByText(['Rothman University','Study Computer Science','Start studying']);
      }catch{}
    } else if(needAgi){
      ns.tprint('[study/train] 自動訓練: PowerhouseでAgiを開始');
      try{
        const doc=eval('document');
        const city=Array.from(doc.querySelectorAll('button,[role="tab"],.MuiTab-root')).find(e=>(e.textContent||'').trim().toLowerCase()=='city');
        if(city) city.click(); await ns.sleep(200);
        await clickByText(['Powerhouse Gym','Train Agility','Start training']);
      }catch{}
    }

    // 戻す
    await toTerminal();
    release();
    await ns.sleep(Math.max(15000, Number(F.watch)||120000));
  }
}
