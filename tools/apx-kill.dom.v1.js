
export async function main(ns){
  const domLike=['tools/apx-hud.lily','tools/apx-faction.work.dom','tools/apx-backdoor.auto.dom','tools/apx-darkweb.autobuyer','tools/apx-study.train.dom'];
  let killed=0; for(const p of ns.ps('home')) if(domLike.some(sig=>p.filename.includes(sig))) { ns.kill(p.pid); killed++; }
  ns.tprint(`[kill.dom] stopped ${killed} process(es).`);
}
