/** apx-autopilot.v2.05.js
 *  Singularity 自動/リモート実行オーケストレーター（軽量構成ではありません。SF-4取得後に使用）
 *  @param {NS} ns
 */
import { Sing } from "apx-sing-actions.js";
export async function main(ns) {
  ns.disableLog("sleep"); ns.disableLog("getServerMoneyAvailable");
  ns.clearPort(20); ns.clearPort(21);
  const FLAGS = ns.flags([["auto", true], ["focus", false], ["cmdPort", 20], ["statPort", 21], ["log", false]]);
  const CONFIG = {
    city: "Sector-12",
    gymLocation: "Powerhouse Gym",
    university: "Rothman University",
    budget: { reserve: 500_000 },
    targets: { gym:{strength:100, defense:100, dexterity:100, agility:100}, uni:{hacking:50, charisma:110} },
    crime: { prefer:"Mug", minChance:0.75, untilMoney:3e6 },
    loops: { plannerMs: 1000, statusMs: 1000 }
  };
  const sing = new Sing(ns, { focus: FLAGS.focus, defaultCity: CONFIG.city, defaultGym: CONFIG.gymLocation, defaultUni: CONFIG.university, reserve: CONFIG.budget.reserve });
  const state = { lock:false, mode: FLAGS.auto ? "auto":"idle", current:null, lastStatusPush:0, stopRequested:false };
  const pushStatus = ()=>{
    const p = ns.getPlayer();
    ns.tryWritePort(FLAGS.statPort, JSON.stringify({ ts:Date.now(), mode:state.mode, current:state.current, city:p.city, money:Math.floor(p.money), stats:{hacking:p.hacking,str:p.strength,def:p.defense,dex:p.dexterity,agi:p.agility,cha:p.charisma}, sf4:sing.hasSF4 }));
  };
  const withLock = async(fn)=>{ if(state.lock) return false; state.lock=true; try{ await fn(); } finally { state.lock=false; state.current=null; } return true; };
  const handleCommand = async(msg)=>{
    if(!msg||msg==="NULL PORT DATA") return;
    let cmd; try{ cmd=JSON.parse(msg); }catch{ return ns.toast("Invalid JSON on port 20","error",3000); }
    switch(cmd.cmd){
      case "stop": state.stopRequested=true; sing.stopIfPossible(); ns.toast("STOP requested","warning",2500); break;
      case "status": pushStatus(); break;
      case "crime":
        if(!sing.hasSF4){ ns.toast("SF-4なし: 犯罪自動化は無効","warning",3000); break; }
        await withLock(async()=>{ state.current={kind:"crime", detail:cmd, started:Date.now()};
          await sing.runCrimeLoop({ prefer:cmd.prefer??CONFIG.crime.prefer, minChance:cmd.minChance??CONFIG.crime.minChance, untilMoney:cmd.untilMoney??0, stopSignal:()=>state.stopRequested }); });
        break;
      case "gym":
        if(!sing.hasSF4){ ns.toast("SF-4なし: ジム自動化は無効","warning",3000); break; }
        await withLock(async()=>{ const stat=cmd.stat, target=cmd.target??CONFIG.targets.gym[stat]??100; state.current={kind:"gym", detail:{stat,target}, started:Date.now()};
          await sing.trainGymUntil(stat, target, ()=>state.stopRequested); });
        break;
      case "uni":
        if(!sing.hasSF4){ ns.toast("SF-4なし: 大学自動化は無効","warning",3000); break; }
        await withLock(async()=>{ const course=cmd.course??"Study Computer Science", hours=cmd.hours??4, until=cmd.until??null;
          state.current={kind:"uni", detail:{course,hours,until}, started:Date.now()};
          await sing.studyUniversity({ course, hours, until, stopSignal:()=>state.stopRequested }); });
        break;
      default: ns.toast(`未知のcmd: ${cmd.cmd}`,"warning",3000);
    }
  };
  const autoPlanner = async()=>{
    if(!FLAGS.auto || state.lock || !sing.hasSF4) return;
    const p = ns.getPlayer();
    const needGym = p.strength<CONFIG.targets.gym.strength || p.defense<CONFIG.targets.gym.defense || p.dexterity<CONFIG.targets.gym.dexterity || p.agility<CONFIG.targets.gym.agility;
    if(needGym){
      const order=[["strength",CONFIG.targets.gym.strength,p.strength],["defense",CONFIG.targets.gym.defense,p.defense],["dexterity",CONFIG.targets.gym.dexterity,p.dexterity],["agility",CONFIG.targets.gym.agility,p.agility]];
      const next = order.find(([_,t,c])=>c<t); if(next){ const [stat,target]=next;
        await withLock(async()=>{ state.current={kind:"gym", detail:{stat,target}, started:Date.now()}; await sing.trainGymUntil(stat,target,()=>state.stopRequested); }); return; }
    }
    if(p.hacking<CONFIG.targets.uni.hacking){
      await withLock(async()=>{ state.current={kind:"uni", detail:{course:"Algorithms",until:{hacking:CONFIG.targets.uni.hacking}}, started:Date.now()};
        await sing.studyUniversity({course:"Algorithms",until:{hacking:CONFIG.targets.uni.hacking}, stopSignal:()=>state.stopRequested}); }); return;
    }
    if(p.charisma<CONFIG.targets.uni.charisma){
      await withLock(async()=>{ state.current={kind:"uni", detail:{course:"Leadership",until:{charisma:CONFIG.targets.uni.charisma}}, started:Date.now()};
        await sing.studyUniversity({course:"Leadership",until:{charisma:CONFIG.targets.uni.charisma}, stopSignal:()=>state.stopRequested}); }); return;
    }
    await withLock(async()=>{ state.current={kind:"crime", detail:CONFIG.crime, started:Date.now()};
      await sing.runCrimeLoop({ ...CONFIG.crime, stopSignal:()=>state.stopRequested }); });
  };
  while(true){
    for(let i=0;i<10;i++){ const msg=ns.readPort(FLAGS.cmdPort); if(msg==="NULL PORT DATA") break; await handleCommand(msg); }
    await autoPlanner();
    pushStatus();
    if(!state.lock && state.stopRequested) state.stopRequested=false;
    await ns.sleep(CONFIG.loops.plannerMs);
  }
}
