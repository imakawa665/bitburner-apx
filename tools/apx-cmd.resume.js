
export async function main(ns){ if(ns.fileExists('/Temp/apx.pause','home')) ns.rm('/Temp/apx.pause','home'); ns.tprint('[resume]'); }
