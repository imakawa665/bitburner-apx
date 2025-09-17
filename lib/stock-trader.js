/** @param {NS} ns 
 * 高頻度株式取引システム
 * 4Sデータを活用した予測とポートフォリオ管理
 */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.tail();
    
    // 取引設定
    const CONFIG = {
        updateInterval: 2000,        // 2秒ごとに更新
        maxPositions: 10,            // 最大保有銘柄数
        minForecast: 0.55,          // 買いシグナルの最小予測値
        maxForecast: 0.45,          // 売りシグナルの最大予測値
        reserveCash: 1000000000,    // 予備資金（10億）
        maxPositionSize: 0.3,       // 1銘柄への最大投資比率
        stopLoss: 0.15,            // ストップロス（15%）
        takeProfit: 0.50,          // 利益確定（50%）
        useShorts: false,          // 空売りを使用（BitNode4では制限あり）
        commission: 100000,        // 取引手数料
    };
    
    // 4Sデータアクセスの確認
    if (!ns.stock.has4SDataTIXAPI()) {
        ns.print("ERROR: 4Sデータアクセスが必要です");
        ns.print("WSEとTIXAPIを購入してください");
        return;
    }
    
    ns.print("INFO: 高頻度株式取引システム起動");
    
    // ポートフォリオ初期化
    const portfolio = new Map();
    const symbols = ns.stock.getSymbols();
    
    // メインループ
    while (true) {
        try {
            // 市場分析
            const marketData = analyzeMarket(ns, symbols);
            
            // ポジション管理
            await managePositions(ns, portfolio, marketData, CONFIG);
            
            // 新規エントリー検討
            await findNewEntries(ns, portfolio, marketData, CONFIG);
            
            // ポートフォリオ状況表示
            displayPortfolioStatus(ns, portfolio, CONFIG);
            
            await ns.sleep(CONFIG.updateInterval);
        } catch (error) {
            ns.print(`ERROR: ${error}`);
            await ns.sleep(5000);
        }
    }
}

function analyzeMarket(ns, symbols) {
    const marketData = [];
    
    for (const symbol of symbols) {
        const position = ns.stock.getPosition(symbol);
        const forecast = ns.stock.getForecast(symbol);
        const volatility = ns.stock.getVolatility(symbol);
        const price = ns.stock.getPrice(symbol);
        const maxShares = ns.stock.getMaxShares(symbol);
        
        // 買い注文の影響を計算
        const buyInfluence = getBuyInfluence(ns, symbol);
        const sellInfluence = getSellInfluence(ns, symbol);
        
        const data = {
            symbol,
            price,
            forecast,
            volatility,
            maxShares,
            longShares: position[0],
            longAvgPrice: position[1],
            shortShares: position[2],
            shortAvgPrice: position[3],
            buyInfluence,
            sellInfluence,
            trend: calculateTrend(ns, symbol),
            momentum: calculateMomentum(forecast, volatility),
            score: calculateScore(forecast, volatility, price)
        };
        
        marketData.push(data);
    }
    
    // スコアでソート
    marketData.sort((a, b) => b.score - a.score);
    
    return marketData;
}

function getBuyInfluence(ns, symbol) {
    // サーバーハッキングが株価に与える影響を推定
    // これは概算値
    const servers = getRelatedServers(symbol);
    let influence = 0;
    
    for (const server of servers) {
        if (ns.serverExists(server)) {
            const growth = ns.getServerGrowth(server);
            const money = ns.getServerMoneyAvailable(server);
            const maxMoney = ns.getServerMaxMoney(server);
            
            if (maxMoney > 0) {
                influence += (money / maxMoney) * growth / 100;
            }
        }
    }
    
    return influence;
}

function getSellInfluence(ns, symbol) {
    // ハッキングによる売り圧力を推定
    const servers = getRelatedServers(symbol);
    let influence = 0;
    
    for (const server of servers) {
        if (ns.serverExists(server)) {
            const security = ns.getServerSecurityLevel(server);
            const minSecurity = ns.getServerMinSecurityLevel(server);
            
            influence += Math.max(0, (security - minSecurity) / minSecurity);
        }
    }
    
    return influence;
}

function getRelatedServers(symbol) {
    // 株式シンボルと関連サーバーのマッピング
    const mapping = {
        "ECP": ["ecorp"],
        "MGCP": ["megacorp"],
        "BLD": ["blade"],
        "CLRK": ["clarkinc"],
        "OMTK": ["omnitek"],
        "FSIG": ["4sigma"],
        "KGI": ["kuai-gong"],
        "FLCM": ["fulcrumtech", "fulcrumassets"],
        "STM": ["stormtech"],
        "DCOMM": ["defcomm"],
        "HLS": ["helios"],
        "VITA": ["vitalife"],
        "ICRS": ["icarus"],
        "UNV": ["univ-energy"],
        "AERO": ["aerocorp"],
        "OMN": ["omnia"],
        "SLRS": ["solaris"],
        "GPH": ["global-pharm"],
        "NVMD": ["nova-med"],
        "LXO": ["lexo-corp"],
        "RHOC": ["rho-construction"],
        "APHE": ["alpha-ent"],
        "SYSC": ["syscore"],
        "CTK": ["computek"],
        "NTLK": ["netlink"],
        "OMGA": ["omega-net"],
        "JGN": ["joesguns"],
        "SGC": ["sigma-cosmetics"],
        "FNS": ["foodnstuff"]
    };
    
    return mapping[symbol] || [];
}

function calculateTrend(ns, symbol) {
    // 簡単なトレンド計算（現在価格と移動平均の比較）
    const price = ns.stock.getPrice(symbol);
    const avgPrice = ns.stock.getPurchaseCost(symbol, 1, "Long");
    
    if (avgPrice > 0) {
        return (price - avgPrice) / avgPrice;
    }
    return 0;
}

function calculateMomentum(forecast, volatility) {
    // モメンタム = (予測 - 0.5) / ボラティリティ
    return (forecast - 0.5) / Math.max(0.01, volatility);
}

function calculateScore(forecast, volatility, price) {
    // 総合スコア計算
    const forecastScore = Math.abs(forecast - 0.5) * 2; // 0-1の範囲
    const volScore = Math.min(1, volatility * 10); // ボラティリティボーナス
    const priceScore = Math.min(1, 1000000 / price); // 低価格銘柄優遇
    
    return forecastScore * (1 + volScore) * (1 + priceScore);
}

async function managePositions(ns, portfolio, marketData, config) {
    for (const stock of marketData) {
        if (stock.longShares > 0) {
            const profit = (stock.price - stock.longAvgPrice) / stock.longAvgPrice;
            
            // ストップロスまたは利益確定
            if (profit <= -config.stopLoss || profit >= config.takeProfit) {
                const salePrice = ns.stock.sellStock(stock.symbol, stock.longShares);
                if (salePrice > 0) {
                    const totalProfit = (salePrice - stock.longAvgPrice) * stock.longShares;
                    ns.print(`SELL: ${stock.symbol} - ${stock.longShares}株を$${ns.formatNumber(salePrice)}で売却`);
                    ns.print(`利益: $${ns.formatNumber(totalProfit)} (${(profit * 100).toFixed(2)}%)`);
                    portfolio.delete(stock.symbol);
                }
            }
            // トレンド反転の場合も売却
            else if (stock.forecast < 0.48) {
                const salePrice = ns.stock.sellStock(stock.symbol, stock.longShares);
                if (salePrice > 0) {
                    const totalProfit = (salePrice - stock.longAvgPrice) * stock.longShares;
                    ns.print(`TREND SELL: ${stock.symbol} - 予測値${stock.forecast.toFixed(3)}`);
                    portfolio.delete(stock.symbol);
                }
            }
        }
        
        // 空売りポジションの管理
        if (config.useShorts && stock.shortShares > 0) {
            const profit = (stock.shortAvgPrice - stock.price) / stock.shortAvgPrice;
            
            if (profit <= -config.stopLoss || profit >= config.takeProfit || stock.forecast > 0.52) {
                const coverPrice = ns.stock.buyShort(stock.symbol, stock.shortShares);
                if (coverPrice > 0) {
                    ns.print(`COVER SHORT: ${stock.symbol} - ${stock.shortShares}株を$${ns.formatNumber(coverPrice)}でカバー`);
                }
            }
        }
    }
}

async function findNewEntries(ns, portfolio, marketData, config) {
    const availableCash = ns.getServerMoneyAvailable("home") - config.reserveCash;
    if (availableCash <= 0) return;
    
    const maxPositionValue = availableCash * config.maxPositionSize;
    
    for (const stock of marketData) {
        // すでにポジションがある場合はスキップ
        if (portfolio.has(stock.symbol)) continue;
        if (portfolio.size >= config.maxPositions) break;
        
        // 買いシグナル
        if (stock.forecast >= config.minForecast && stock.momentum > 0) {
            const sharesToBuy = Math.min(
                stock.maxShares,
                Math.floor(maxPositionValue / stock.price),
                Math.floor(availableCash / (stock.price + config.commission))
            );
            
            if (sharesToBuy > 100) { // 最小100株
                const purchasePrice = ns.stock.buyStock(stock.symbol, sharesToBuy);
                if (purchasePrice > 0) {
                    portfolio.set(stock.symbol, {
                        shares: sharesToBuy,
                        avgPrice: purchasePrice,
                        entryTime: Date.now()
                    });
                    
                    ns.print(`BUY: ${stock.symbol} - ${sharesToBuy}株を$${ns.formatNumber(purchasePrice)}で購入`);
                    ns.print(`予測値: ${stock.forecast.toFixed(3)}, モメンタム: ${stock.momentum.toFixed(2)}`);
                }
            }
        }
        
        // 空売りシグナル
        if (config.useShorts && stock.forecast <= config.maxForecast && stock.momentum < 0) {
            const sharesToShort = Math.min(
                stock.maxShares,
                Math.floor(maxPositionValue / stock.price)
            );
            
            if (sharesToShort > 100) {
                const shortPrice = ns.stock.sellShort(stock.symbol, sharesToShort);
                if (shortPrice > 0) {
                    ns.print(`SHORT: ${stock.symbol} - ${sharesToShort}株を$${ns.formatNumber(shortPrice)}で空売り`);
                }
            }
        }
    }
}

function displayPortfolioStatus(ns, portfolio, config) {
    if (portfolio.size === 0) return;
    
    let totalValue = 0;
    let totalProfit = 0;
    
    ns.print("=== ポートフォリオ状況 ===");
    
    for (const [symbol, position] of portfolio.entries()) {
        const currentPrice = ns.stock.getPrice(symbol);
        const currentValue = position.shares * currentPrice;
        const profit = (currentPrice - position.avgPrice) * position.shares;
        const profitPercent = ((currentPrice - position.avgPrice) / position.avgPrice) * 100;
        
        totalValue += currentValue;
        totalProfit += profit;
        
        const holdTime = Math.floor((Date.now() - position.entryTime) / 60000); // 分単位
        
        ns.print(`${symbol}: ${position.shares}株 | ` +
                `現在値: $${ns.formatNumber(currentValue)} | ` +
                `損益: $${ns.formatNumber(profit)} (${profitPercent.toFixed(2)}%) | ` +
                `保有時間: ${holdTime}分`);
    }
    
    ns.print(`総資産価値: $${ns.formatNumber(totalValue)}`);
    ns.print(`総損益: $${ns.formatNumber(totalProfit)}`);
    ns.print("========================");
}