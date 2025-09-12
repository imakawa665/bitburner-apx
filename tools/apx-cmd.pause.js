export async function main(ns){ ns.writePort(20, JSON.stringify({cmd:'pause'})); ns.tprint('[apx-cmd] pause sent'); }
