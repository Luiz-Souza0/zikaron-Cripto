// convert.js

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

// Mapeia os símbolos da Binance (ex: "BTC", "ETH") para os ids usados pela CoinGecko
const SYMBOL_TO_ID = {
    BTC: "bitcoin",
    ETH: "ethereum",
    BNB: "binancecoin",
    SOL: "solana",
    ADA: "cardano",
    XRP: "ripple",
    DOGE: "dogecoin",
    DOT: "polkadot",
    MATIC: "matic-network",
    LTC: "litecoin",
    USDT: "tether",
    USDC: "usd-coin",
    BUSD: "binance-usd",
    TRX: "tron",
    AVAX: "avalanche-2",
    SHIB: "shiba-inu",
    LINK: "chainlink",
    PEPE: "pepe",
    HOLO: "holoworld",
    HOME: "home",
    NEAR: "near",
};

/**
 * Resolve o símbolo de um balance para o ID usado pela CoinGecko.
 *
 * A Binance prefixa com "LD" os ativos alocados em Simple Earn / Locked
 * Staking (ex: "LDPEPE" é o PEPE que está em Earn, não um ativo diferente).
 * Só removemos o prefixo quando o símbolo completo NÃO existir no mapa mas
 * o restante (sem "LD") existir — isso evita quebrar ativos que legitimamente
 * começam com "LD", como o LDO da Lido DAO.
 *
 * @param {string} symbolUpper - símbolo já em maiúsculas (ex: "LDPEPE")
 * @returns {string|null} - o id da CoinGecko, ou null se não mapeado
 */
function resolveId(symbolUpper) {
    if (SYMBOL_TO_ID[symbolUpper]) return SYMBOL_TO_ID[symbolUpper];

    if (symbolUpper.startsWith("LD") && symbolUpper.length > 2) {
        const base = symbolUpper.slice(2);
        if (SYMBOL_TO_ID[base]) return SYMBOL_TO_ID[base];
    }

    return null;
}

// Cache simples em memória para evitar chamadas repetidas em curto intervalo
let cache = { data: null, timestamp: 0 };
const CACHE_TTL = 60 * 1000; // 1 minuto

/**
 * Busca as cotações de uma lista de ativos em relação a BRL, USD e BTC.
 * @param {string[]} symbols - ex: ["BTC", "ETH", "USDT"]
 * @returns {Promise<Object>} - { BTC: { brl, usd, btc }, ETH: { ... }, ... }
 */
export async function getPrices(symbols = []) {
    const now = Date.now();
    if (cache.data && now - cache.timestamp < CACHE_TTL) {
        return cache.data;
    }

    const ids = symbols
        .map(s => resolveId(s.toUpperCase()))
        .filter(Boolean);

    if (ids.length === 0) return {};

    const uniqueIds = [...new Set(ids)];
    const url = `${COINGECKO_BASE}/simple/price?ids=${uniqueIds.join(",")}&vs_currencies=brl,usd,btc`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Erro ao buscar cotações: ${res.status}`);

    const data = await res.json();

    // Remonta o resultado usando o símbolo original (com prefixo LD, se houver) como chave
    const result = {};
    for (const symbol of symbols) {
        const id = resolveId(symbol.toUpperCase());
        if (id && data[id]) {
            result[symbol.toUpperCase()] = {
                brl: data[id].brl ?? null,
                usd: data[id].usd ?? null,
                btc: data[id].btc ?? null,
            };
        }
    }

    cache = { data: result, timestamp: now };
    return result;
}

/**
 * Converte um valor de uma criptomoeda para outra moeda (BRL, USD ou BTC).
 * @param {number} amount - quantidade da cripto (ex: 0.5)
 * @param {string} fromAsset - símbolo da cripto de origem (ex: "ETH")
 * @param {"brl"|"usd"|"btc"} toCurrency - moeda de destino
 * @param {Object} [pricesCache] - opcional, resultado já obtido de getPrices()
 * @returns {Promise<number|null>}
 */
export async function convertCrypto(amount, fromAsset, toCurrency, pricesCache = null) {
    const symbol = fromAsset.toUpperCase();
    const currency = toCurrency.toLowerCase();

    if (!resolveId(symbol)) {
        console.warn(`Ativo não mapeado: ${symbol}`);
        return null;
    }

    const prices = pricesCache || (await getPrices([symbol]));
    const rate = prices[symbol]?.[currency];

    if (rate == null) return null;

    return Number(amount) * rate;
}

/**
 * Converte uma lista inteira de balances (como os da Binance) para uma moeda alvo.
 * @param {Array<{asset: string, free: string|number}>} balances
 * @param {"brl"|"usd"|"btc"} toCurrency
 * @returns {Promise<Array<{asset: string, free: number, converted: number|null}>>}
 */
export async function convertBalancesList(balances, toCurrency = "brl") {
    const symbols = balances.map(b => b.asset);
    const prices = await getPrices(symbols);

    return balances.map(b => {
        const free = parseFloat(b.free) + parseFloat(b.locked || 0) + parseFloat(b.earn || 0);
        const rate = prices[b.asset.toUpperCase()]?.[toCurrency.toLowerCase()];
        return {
            ...b,
            free,
            converted: rate != null ? free * rate : null,
        };
    });
}

/**
 * Soma o total convertido de uma lista de balances já convertidos.
 * @param {Array<{converted: number|null}>} convertedBalances
 * @returns {number}
 */
export function sumConverted(convertedBalances) {
    return convertedBalances.reduce((acc, b) => acc + (b.converted || 0), 0);
}