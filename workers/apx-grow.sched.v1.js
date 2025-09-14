
export async function main(ns){ const t=String(ns.args[0]||'n00dles'), d=Number(ns.args[1]||0); if(d>0) await ns.sleep(d); try{ await ns.grow(t);}catch{} }
