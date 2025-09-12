export async function main(ns){ ns.writePort(20, JSON.stringify({cmd:'status'})); ns.tprint('[apx-cmd] status requested'); }
