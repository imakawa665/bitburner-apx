/** tools/apx-cmd.pinTarget.js */
export async function main(ns){
  const host = String(ns.args[0] ?? "");
  if (!host || !ns.serverExists(host)) return ns.tprint("usage: run tools/apx-cmd.pinTarget.js <host>");
  ns.writePort(20, JSON.stringify({cmd:"target", host}));
  ns.tprint(`[apx-cmd] target=${host} を送信しました`);
}
