export async function main(ns){ ns.writePort(20, JSON.stringify({cmd:'resume'})); ns.tprint('[apx-cmd] resume sent'); }
