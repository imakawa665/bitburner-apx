/** apx-sing-actions.js
 *  Singularity 安全ラッパと具体的行動（犯罪/ジム/大学） + 予算リミッタ
 *  @param {NS} ns
 */
export class Sing {
  constructor(ns, opts = {}) {
    this.ns = ns;
    this.focus = !!opts.focus;
    this.defaultCity = opts.defaultCity ?? "Sector-12";
    this.defaultGym = opts.defaultGym ?? "Powerhouse Gym";
    this.defaultUni = opts.defaultUni ?? "Rothman University";
    this.reserve = Math.max(0, opts.reserve ?? 0);
    try { this.hasSF4 = (ns.getOwnedSourceFiles?.() ?? []).some(sf => sf.n === 4 && sf.lvl >= 1); } catch { this.hasSF4 = false; }
  }
  async sleep(ms){ await this.ns.sleep(ms); }
  toast(msg,type="info",ms=3000){ this.ns.toast(msg,type,ms); }
  player(){ return this.ns.getPlayer(); }
  money(){ return this.player().money ?? 0; }
  lowBudget(){ return this.money() <= this.reserve; }
  stopIfPossible(){ try{ this.ns.singularity.stopAction(); }catch{} }
  async ensureCity(city){
    const p=this.player(); if(p.city===city) return true; if(!this.hasSF4) return false;
    if((this.money()-this.reserve)<200_000){ this.toast("予算不足のため都市移動をスキップ","warning"); return false; }
    try { return this.ns.singularity.travelToCity(city); } catch { return false; }
  }
  pickCrime({prefer="Mug",minChance=0.5}={}){
    const S=this.ns.singularity; const list=["Heist","Assassination","Homicide","Kidnap","Grand Theft Auto","Traffick Arms","Bond Forgery","Drugs","Larceny","Mug","Rob Store","Shoplift"];
    const chance=(n)=>{ try{return S.getCrimeChance(n)||0;}catch{return 0;} };
    const score=(n)=>{ try{ const st=S.getCrimeStats(n); const c=chance(n); return (st.money*c)/Math.max(1,st.time);}catch{return 0;} };
    if(chance(prefer)>=minChance) return prefer;
    let best="Mug", bestScore=-1; for(const n of list){ const sc=score(n); if(sc>bestScore){bestScore=sc; best=n;} }
    if(chance(best)>=0.15) return best; return "Shoplift";
  }
  async runCrimeLoop(opts={}){
    if(!this.hasSF4) return; const S=this.ns.singularity; const untilMoney=opts.untilMoney??0, minChance=opts.minChance??0.5;
    while(true){
      if(opts.stopSignal?.()) break; if(this.lowBudget()) break;
      const curMoney=Math.floor(this.money()); if(untilMoney>0 && curMoney>=untilMoney) break;
      const name=this.pickCrime({prefer:opts.prefer,minChance}); let ms=0;
      try{ ms=S.commitCrime(name,this.focus);}catch(e){ this.toast(`commitCrime失敗: ${e}`,"error"); break; }
      await this.sleep(Math.max(1000,ms+50));
    } this.stopIfPossible();
  }
  async trainGymUntil(stat,target,stopSignal){
    if(!this.hasSF4) return; if(this.lowBudget()) return;
    const S=this.ns.singularity; await this.ensureCity(this.defaultCity);
    try{ if(!S.gymWorkout(this.defaultGym,stat,this.focus)){ this.toast(`ジム開始失敗 (${this.defaultGym}, ${stat})`,"warning"); return; } }
    catch(e){ this.toast(`gymWorkout失敗: ${e}`,"error"); return; }
    while(true){
      if(stopSignal?.()) break; if(this.lowBudget()) break;
      const p=this.player(); const cur={strength:p.strength, defense:p.defense, dexterity:p.dexterity, agility:p.agility}[stat]??0;
      if(cur>=target) break; await this.sleep(1500);
    } this.stopIfPossible();
  }
  async studyUniversity({course="Study Computer Science",hours=1,until=null,stopSignal}={}){
    if(!this.hasSF4) return; if(this.lowBudget()) return; const S=this.ns.singularity; await this.ensureCity(this.defaultCity);
    try{ if(!S.universityCourse(this.defaultUni,course,this.focus)){ this.toast(`大学開始失敗 (${this.defaultUni}, ${course})`,"warning"); return; } }
    catch(e){ this.toast(`universityCourse失敗: ${e}`,"error"); return; }
    const endAt=Date.now()+hours*3600_000;
    while(true){
      if(stopSignal?.()) break; if(this.lowBudget()) break;
      if(until){ const p=this.player(); if((until.hacking&&p.hacking>=until.hacking)||(until.charisma&&p.charisma>=until.charisma)) break; }
      else if(Date.now()>=endAt) break;
      await this.sleep(1500);
    } this.stopIfPossible();
  }
}
