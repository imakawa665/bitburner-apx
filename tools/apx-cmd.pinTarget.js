/** tools/apx-cmd.pinTarget.js
 * Port20へ target固定コマンドを送信（microが即時切替）
 * 使い方: run tools/apx-cmd.pinTarget.js <host>
 * @param {NS} ns */
export async function main(ns){
  const host = String(ns.args[0] ?? "");
  if (!host || !ns.serverExists(host)) return ns.tprint("usage: run tools/apx-cmd.pinTarget.js <host>");
  ns.writePort(20, JSON.stringify({cmd:"target", host}));
  ns.tprint(`[apx-cmd] target=${host} を送信しました`);
}
