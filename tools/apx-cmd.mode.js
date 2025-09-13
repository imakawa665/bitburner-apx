
/** tools/apx-cmd.mode.js - toggle modes for APX */
export async function main(ns){ const m=String(ns.args[0]||'').toLowerCase(); if(m==='rep'){ ns.write('/Temp/apx.mode.rep','1','w'); } else { if(ns.fileExists('/Temp/apx.mode.rep','home')) ns.rm('/Temp/apx.mode.rep','home'); } ns.tprint('[mode] '+m); }
