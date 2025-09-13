
/** tools/apx-cmd.pinTarget.js - write /Temp/apx.pin.target.txt */
export async function main(ns){ const t=String(ns.args[0]||''); ns.write('/Temp/apx.pin.target.txt',t,'w'); ns.tprint('[pinTarget] '+t); }
