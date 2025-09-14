
export async function main(ns){

  const $m = (v, dp=2) => {
    try {
      if (typeof ns.formatNumber === 'function') return '$' + ns.formatNumber(Number(v)||0, 3, dp);
    } catch {}
    try { return '$' + (Number(v)||0).toLocaleString(undefined, {maximumFractionDigits: dp}); } catch {}
    return '$' + String(v);
  };

  const a=Number(ns.args[0]||0); ns.write('reserve.txt',String(Math.max(0,a)),'w'); ns.tprint('[reserve] '+$m(Math.max(0,a)));
}
