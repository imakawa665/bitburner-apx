/** tools/apx-karma.watch.v1.js */
export async function main(ns){ ns.disableLog('sleep'); const F=ns.flags([['goal',-54000]]); const g=Number(F.goal||-54000); ns.tprint(`[karma] start ${ns.heart.break().toFixed(1)} > goal ${g}`); while(true){ if(ns.heart.break()<=g){ ns.tprint('[karma] goal reached'); break; } await ns.sleep(6000); } }
