/** tools/apx-daemon.autoadapt.v1.js - minimal watchdog */
export async function main(ns){
  ns.disableLog('sleep');
  while(true){
    if(!ns.ps('home').some(p=>p.filename==='tools/apx-autopilot.full.v1.js')) ns.run('tools/apx-oneclick.lily.js',1,'--profile','autofull');
    await ns.sleep(5000);
  }
}
