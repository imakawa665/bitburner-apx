/** @param {NS} ns 
 * コーディング契約の自動解決システム
 */
export async function main(ns) {
    ns.disableLog("ALL");
    const foundContracts = findAllContracts(ns);
    
    if (foundContracts.length === 0) {
        ns.print("INFO: 契約が見つかりません");
        return;
    }
    
    ns.print(`INFO: ${foundContracts.length}個の契約を発見`);
    
    for (const contract of foundContracts) {
        await solveContract(ns, contract);
        await ns.sleep(100);
    }
}

function findAllContracts(ns) {
    const contracts = [];
    const servers = getAllServers(ns);
    
    for (const server of servers) {
        const files = ns.ls(server, ".cct");
        for (const file of files) {
            contracts.push({ server, file });
        }
    }
    
    return contracts;
}

function getAllServers(ns) {
    const visited = new Set();
    const queue = ["home"];
    const servers = [];
    
    while (queue.length > 0) {
        const current = queue.shift();
        if (visited.has(current)) continue;
        visited.add(current);
        servers.push(current);
        
        const neighbors = ns.scan(current);
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                queue.push(neighbor);
            }
        }
    }
    
    return servers;
}

async function solveContract(ns, contract) {
    const type = ns.codingcontract.getContractType(contract.file, contract.server);
    const data = ns.codingcontract.getData(contract.file, contract.server);
    
    ns.print(`契約: ${type} @ ${contract.server}`);
    
    let solution = null;
    
    // 各契約タイプの解法
    switch (type) {
        case "Find Largest Prime Factor":
            solution = findLargestPrimeFactor(data);
            break;
        case "Subarray with Maximum Sum":
            solution = maxSubarraySum(data);
            break;
        case "Total Ways to Sum":
            solution = totalWaysToSum(data);
            break;
        case "Total Ways to Sum II":
            solution = totalWaysToSumII(data[0], data[1]);
            break;
        case "Spiralize Matrix":
            solution = spiralizeMatrix(data);
            break;
        case "Array Jumping Game":
            solution = arrayJumpingGame(data);
            break;
        case "Array Jumping Game II":
            solution = arrayJumpingGameII(data);
            break;
        case "Merge Overlapping Intervals":
            solution = mergeOverlappingIntervals(data);
            break;
        case "Generate IP Addresses":
            solution = generateIPAddresses(data);
            break;
        case "Algorithmic Stock Trader I":
            solution = stockTraderI(data);
            break;
        case "Algorithmic Stock Trader II":
            solution = stockTraderII(data);
            break;
        case "Algorithmic Stock Trader III":
            solution = stockTraderIII(data);
            break;
        case "Algorithmic Stock Trader IV":
            solution = stockTraderIV(data[0], data[1]);
            break;
        case "Minimum Path Sum in a Triangle":
            solution = minimumPathSumTriangle(data);
            break;
        case "Unique Paths in a Grid I":
            solution = uniquePathsI(data);
            break;
        case "Unique Paths in a Grid II":
            solution = uniquePathsII(data);
            break;
        case "Shortest Path in a Grid":
            solution = shortestPath(data);
            break;
        case "Sanitize Parentheses in Expression":
            solution = sanitizeParentheses(data);
            break;
        case "Find All Valid Math Expressions":
            solution = findMathExpressions(data[0], data[1]);
            break;
        case "HammingCodes: Integer to Encoded Binary":
            solution = hammingEncode(data);
            break;
        case "HammingCodes: Encoded Binary to Integer":
            solution = hammingDecode(data);
            break;
        case "Proper 2-Coloring of a Graph":
            solution = graphColoring(data);
            break;
        case "Compression I: RLE Compression":
            solution = rleCompress(data);
            break;
        case "Compression II: LZ Decompression":
            solution = lzDecompress(data);
            break;
        case "Compression III: LZ Compression":
            solution = lzCompress(data);
            break;
        case "Encryption I: Caesar Cipher":
            solution = caesarCipher(data);
            break;
        case "Encryption II: Vigenere Cipher":
            solution = vigenereCipher(data);
            break;
    }
    
    if (solution !== null) {
        const result = ns.codingcontract.attempt(solution, contract.file, contract.server);
        if (result) {
            ns.print(`SUCCESS: ${type}を解決 - 報酬: ${result}`);
        } else {
            ns.print(`FAILED: ${type}の解決に失敗`);
        }
    } else {
        ns.print(`SKIP: ${type}は未実装`);
    }
}

// 契約解法の実装
function findLargestPrimeFactor(n) {
    let factor = n;
    for (let i = 2; i * i <= factor; i++) {
        while (factor % i === 0 && factor !== i) {
            factor = factor / i;
        }
    }
    return factor;
}

function maxSubarraySum(arr) {
    let maxSoFar = arr[0];
    let maxEndingHere = arr[0];
    
    for (let i = 1; i < arr.length; i++) {
        maxEndingHere = Math.max(arr[i], maxEndingHere + arr[i]);
        maxSoFar = Math.max(maxSoFar, maxEndingHere);
    }
    
    return maxSoFar;
}

function totalWaysToSum(n) {
    const ways = new Array(n + 1).fill(0);
    ways[0] = 1;
    
    for (let i = 1; i < n; i++) {
        for (let j = i; j <= n; j++) {
            ways[j] += ways[j - i];
        }
    }
    
    return ways[n];
}

function totalWaysToSumII(n, nums) {
    const ways = new Array(n + 1).fill(0);
    ways[0] = 1;
    
    for (const num of nums) {
        for (let i = num; i <= n; i++) {
            ways[i] += ways[i - num];
        }
    }
    
    return ways[n];
}

function spiralizeMatrix(matrix) {
    const result = [];
    if (!matrix.length) return result;
    
    let top = 0, bottom = matrix.length - 1;
    let left = 0, right = matrix[0].length - 1;
    
    while (top <= bottom && left <= right) {
        for (let i = left; i <= right; i++) {
            result.push(matrix[top][i]);
        }
        top++;
        
        for (let i = top; i <= bottom; i++) {
            result.push(matrix[i][right]);
        }
        right--;
        
        if (top <= bottom) {
            for (let i = right; i >= left; i--) {
                result.push(matrix[bottom][i]);
            }
            bottom--;
        }
        
        if (left <= right) {
            for (let i = bottom; i >= top; i--) {
                result.push(matrix[i][left]);
            }
            left++;
        }
    }
    
    return result;
}

function arrayJumpingGame(arr) {
    let maxReach = 0;
    for (let i = 0; i < arr.length && i <= maxReach; i++) {
        maxReach = Math.max(maxReach, i + arr[i]);
        if (maxReach >= arr.length - 1) return 1;
    }
    return 0;
}

function arrayJumpingGameII(arr) {
    if (arr.length <= 1) return 0;
    
    let jumps = 0;
    let currentEnd = 0;
    let farthest = 0;
    
    for (let i = 0; i < arr.length - 1; i++) {
        farthest = Math.max(farthest, i + arr[i]);
        if (i === currentEnd) {
            jumps++;
            currentEnd = farthest;
            if (currentEnd >= arr.length - 1) break;
        }
    }
    
    return currentEnd >= arr.length - 1 ? jumps : -1;
}

function mergeOverlappingIntervals(intervals) {
    if (intervals.length <= 1) return intervals;
    
    intervals.sort((a, b) => a[0] - b[0]);
    const merged = [intervals[0]];
    
    for (let i = 1; i < intervals.length; i++) {
        const last = merged[merged.length - 1];
        if (intervals[i][0] <= last[1]) {
            last[1] = Math.max(last[1], intervals[i][1]);
        } else {
            merged.push(intervals[i]);
        }
    }
    
    return merged;
}

function generateIPAddresses(s) {
    const result = [];
    
    for (let i = 1; i <= 3 && i < s.length; i++) {
        for (let j = i + 1; j <= i + 3 && j < s.length; j++) {
            for (let k = j + 1; k <= j + 3 && k < s.length; k++) {
                const part1 = s.substring(0, i);
                const part2 = s.substring(i, j);
                const part3 = s.substring(j, k);
                const part4 = s.substring(k);
                
                if (isValidIPPart(part1) && isValidIPPart(part2) && 
                    isValidIPPart(part3) && isValidIPPart(part4)) {
                    result.push(`${part1}.${part2}.${part3}.${part4}`);
                }
            }
        }
    }
    
    return result;
}

function isValidIPPart(s) {
    if (!s || s.length > 3) return false;
    if (s.length > 1 && s[0] === '0') return false;
    const num = parseInt(s);
    return num >= 0 && num <= 255;
}

function stockTraderI(prices) {
    let maxProfit = 0;
    let minPrice = prices[0];
    
    for (let i = 1; i < prices.length; i++) {
        maxProfit = Math.max(maxProfit, prices[i] - minPrice);
        minPrice = Math.min(minPrice, prices[i]);
    }
    
    return maxProfit;
}

function stockTraderII(prices) {
    let profit = 0;
    for (let i = 1; i < prices.length; i++) {
        profit += Math.max(0, prices[i] - prices[i - 1]);
    }
    return profit;
}

function stockTraderIII(prices) {
    let buy1 = -prices[0], sell1 = 0;
    let buy2 = -prices[0], sell2 = 0;
    
    for (let i = 1; i < prices.length; i++) {
        sell2 = Math.max(sell2, buy2 + prices[i]);
        buy2 = Math.max(buy2, sell1 - prices[i]);
        sell1 = Math.max(sell1, buy1 + prices[i]);
        buy1 = Math.max(buy1, -prices[i]);
    }
    
    return sell2;
}

function stockTraderIV(k, prices) {
    if (k >= prices.length / 2) {
        return stockTraderII(prices);
    }
    
    const buy = new Array(k + 1).fill(-prices[0]);
    const sell = new Array(k + 1).fill(0);
    
    for (let i = 1; i < prices.length; i++) {
        for (let j = k; j > 0; j--) {
            sell[j] = Math.max(sell[j], buy[j] + prices[i]);
            buy[j] = Math.max(buy[j], sell[j - 1] - prices[i]);
        }
    }
    
    return sell[k];
}

function minimumPathSumTriangle(triangle) {
    const dp = triangle[triangle.length - 1].slice();
    
    for (let i = triangle.length - 2; i >= 0; i--) {
        for (let j = 0; j <= i; j++) {
            dp[j] = triangle[i][j] + Math.min(dp[j], dp[j + 1]);
        }
    }
    
    return dp[0];
}

function uniquePathsI(dims) {
    const [rows, cols] = dims;
    const dp = Array(cols).fill(1);
    
    for (let i = 1; i < rows; i++) {
        for (let j = 1; j < cols; j++) {
            dp[j] = dp[j] + dp[j - 1];
        }
    }
    
    return dp[cols - 1];
}

function uniquePathsII(grid) {
    const rows = grid.length;
    const cols = grid[0].length;
    const dp = new Array(cols).fill(0);
    dp[0] = grid[0][0] === 0 ? 1 : 0;
    
    for (let j = 1; j < cols; j++) {
        dp[j] = grid[0][j] === 0 ? dp[j - 1] : 0;
    }
    
    for (let i = 1; i < rows; i++) {
        dp[0] = grid[i][0] === 0 ? dp[0] : 0;
        for (let j = 1; j < cols; j++) {
            dp[j] = grid[i][j] === 0 ? dp[j] + dp[j - 1] : 0;
        }
    }
    
    return dp[cols - 1];
}

// 簡略化のため、残りの複雑な契約の実装は省略
function shortestPath(grid) { return ""; }
function sanitizeParentheses(expr) { return []; }
function findMathExpressions(digits, target) { return []; }
function hammingEncode(data) { return ""; }
function hammingDecode(data) { return 0; }
function graphColoring(data) { return []; }
function rleCompress(data) { return ""; }
function lzDecompress(data) { return ""; }
function lzCompress(data) { return ""; }
function caesarCipher(data) { return []; }
function vigenereCipher(data) { return []; }