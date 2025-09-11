/** tools/apx-cmd.mode.js */
export async function main(ns){
  const mode = String(ns.args[0] ?? "auto");
  const ok = ["auto","hack","grow","weaken"];
  if (!ok.includes(mode)) return ns.tprint("usage: run tools/apx-cmd.mode.js [auto|hack|grow|weaken]");
  ns.writePort(20, JSON.stringify({cmd:"mode", mode}));
  ns.tprint(`[apx-cmd] mode=${mode} を送信しました`);
}
