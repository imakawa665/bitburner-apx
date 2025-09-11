/** apx-remote-send.js */
export async function main(ns){ns.writePort(20,JSON.stringify({cmd:'crime',prefer:'Mug',minChance:0.75,untilMoney:3e6}));}
