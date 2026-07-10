import { useState, useEffect, useRef, useCallback } from "react";

const COINS = [
    { symbol: "BTCUSDT", name: "Bitcoin", pair: "BTC/USDT", icon: "?", color: "#f7b731", bg: "#f7b73120" },
    { symbol: "ETHUSDT", name: "Ethereum", pair: "ETH/USDT", icon: "?", color: "#8b9ef7", bg: "#8b9ef720" },
    { symbol: "BNBUSDT", name: "BNB", pair: "BNB/USDT", icon: "B", color: "#f0b90b", bg: "#f0b90b20" },
    { symbol: "SOLUSDT", name: "Solana", pair: "SOL/USDT", icon: "S", color: "#9945ff", bg: "#9945ff20" },
    { symbol: "XRPUSDT", name: "XRP", pair: "XRP/USDT", icon: "X", color: "#00aae4", bg: "#00aae420" },
    { symbol: "DOGEUSDT", name: "Dogecoin", pair: "DOGE/USDT", icon: "D", color: "#c2a633", bg: "#c2a63320" },
];

const numFmt = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const tinyFmt = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 5, maximumFractionDigits: 5 });
const timeFmt = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

function fmt(v) {
    if (v === null || v === undefined) return "?";
    v = Number(v);
    if (v >= 1000) return numFmt.format(v);
    if (v >= 1) return v.toFixed(2);
    return tinyFmt.format(v);
}
function fmtVol(v) {
    if (!v) return "?";
    v = Number(v);
    if (v >= 1e9) return (v / 1e9).toFixed(2) + "B";
    if (v >= 1e6) return (v / 1e6).toFixed(2) + "M";
    if (v >= 1e3) return (v / 1e3).toFixed(1) + "K";
    return v.toFixed(0);
}
function fmtTime(ts) { return ts ? timeFmt.format(new Date(ts)) : "--"; }

// ?? Hook: WebSocket Binance ???????????????????????????????????????
function useBinanceTicker() {
    const [tickers, setTickers] = useState(() =>
        Object.fromEntries(COINS.map(c => [c.symbol, {
            price: null, previous: null,
            change: null, high: null, low: null,
            volume: null, updated: null,
        }]))
    );
    const [status, setStatus] = useState("CONECTANDO...");
    const socketRef = useRef(null);
    const reconnectDelay = useRef(3000);
    const lastMessage = useRef(Date.now());
    const unmounted = useRef(false);

    const connect = useCallback(() => {
        if (unmounted.current) return;
        const streams = COINS.map(c => `${c.symbol.toLowerCase()}@ticker`).join("/");
        const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);
        socketRef.current = ws;

        ws.onopen = () => {
            reconnectDelay.current = 3000;
            setStatus("AO VIVO");
        };

        ws.onmessage = (event) => {
            lastMessage.current = Date.now();
            const msg = JSON.parse(event.data);
            if (!msg.data) return;
            const d = msg.data;
            const symbol = d.s;

            setTickers(prev => {
                const old = prev[symbol];
                if (!old) return prev;
                return {
                    ...prev,
                    [symbol]: {
                        previous: old.price,
                        price: Number(d.c),
                        change: Number(d.P),
                        high: Number(d.h),
                        low: Number(d.l),
                        volume: Number(d.q),
                        updated: Date.now(),
                    },
                };
            });
        };

        ws.onerror = () => setStatus("ERRO");

        ws.onclose = () => {
            if (unmounted.current) return;
            setStatus("RECONECTANDO...");
            setTimeout(() => {
                reconnectDelay.current = Math.min(reconnectDelay.current * 2, 30000);
                connect();
            }, reconnectDelay.current);
        };
    }, []);

    useEffect(() => {
        unmounted.current = false;
        connect();

        // Watchdog
        const watchdog = setInterval(() => {
            if (Date.now() - lastMessage.current > 15000 && socketRef.current) {
                socketRef.current.close();
            }
        }, 5000);

        return () => {
            unmounted.current = true;
            clearInterval(watchdog);
            if (socketRef.current) socketRef.current.close();
        };
    }, [connect]);

    const maxVolume = Math.max(1, ...Object.values(tickers).map(t => t.volume || 0));

    return { tickers, status, maxVolume };
}

// ?? Flash hook ????????????????????????????????????????????????????
function useFlash(price, previous) {
    const [flash, setFlash] = useState(null); // "up" | "down" | null

    useEffect(() => {
        if (previous === null || price === previous) return;
        const dir = price > previous ? "up" : "down";
        setFlash(dir);
        const t = setTimeout(() => setFlash(null), 400);
        return () => clearTimeout(t);
    }, [price]);

    return flash;
}

// ?? CoinCard ??????????????????????????????????????????????????????
function CoinCard({ coin, ticker, volPct }) {
    const flash = useFlash(ticker.price, ticker.previous);
    const up = ticker.change > 0;
    const down = ticker.change < 0;
    const [clicked, setClicked] = useState(false);
    const changeStr = ticker.change !== null
        ? `${up ? "+" : ""}${Number(ticker.change).toFixed(2)}%`
        : "?";

    const flashBg = flash === "up"
        ? "rgba(0, 212, 138, 0.32)"
        : flash === "down"
            ? "rgba(168, 29, 50, 0.28)"
            : "transparent";

    return (
        <div  onClick={() => setClicked(!clicked)}
                style={{
                    background: clicked ? "#2a2e3a" : "#111318",
                    border:  clicked ? "3px solid #ffffff" : "1px solid #23252f",
                    borderRadius: 16,
                    padding: "22px",
                    cursor: "pointer",
                    transition: "all .5s",
                    position: "relative",
                    overflow: "hidden",
                }}
            onMouseEnter={clicked ? undefined : (e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = "#3b3d48"; })}
            onMouseLeave={clicked ? undefined : (e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "#23252f"; })}
        >
            {/* Flash overlay */}
            <div style={{
                position: "absolute", inset: 0,
                background: flashBg,
                borderRadius: 16,
                transition: "background 0.4s",
                pointerEvents: "none",
            }} />

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: "50%",
                        background: coin.bg, color: coin.color,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 18, fontWeight: "bold", flexShrink: 0,
                    }}>{coin.icon}</div>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: 15, color: "#e8eaf0" }}>{coin.name}</div>
                        <div style={{ fontSize: 10, color:  "#707687", fontFamily: "monospace", marginTop: 3 }}>{coin.pair}</div>
                    </div>
                </div>

                <div style={{
                    padding: "4px 9px", borderRadius: 8, fontSize: 11, fontFamily: "monospace",
                    color: up ? "#00d48a" : down ? "#f0415a" : "#707687",
                    background: up ? "#00d48a18" : down ? "#f0415a18" : "#33384455",
                }}>{changeStr}</div>
            </div>

            {/* Price */}
            <div style={{
                fontSize: 28, fontFamily: "monospace", marginBottom: 18,
                color: up ? "#00d48a" : down ? "#f0415a" :  "#e8eaf0",
                transition: "color 0.9s",
            }}>
                {ticker.price !== null ? `$${fmt(ticker.price)}` : "..."}
            </div>

            {/* Stats */}
            <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12,
                borderTop: "1px solid #23252f", paddingTop: 15,
            }}>
                {[
                    ["Máx 24h", `$${fmt(ticker.high)}`],
                    ["Mín 24h", `$${fmt(ticker.low)}`],
                    ["Volume", fmtVol(ticker.volume)],
                    ["Variação", changeStr],
                ].map(([label, value], i) => (
                    <div key={i}>
                        <div style={{ color:  "#707687", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
                        <div style={{
                            fontFamily: "monospace", fontSize: 12, marginTop: 4,
                            color: i === 3 ? (up ? "#00d48a" : down ? "#f0415a" : "#707687") :  "#e8eaf0",
                            fontWeight: clicked ? "bold" : "normal",
                        }}>{value}</div>
                    </div>
                ))}
            </div>

            {/* Volume bar */}
            <div style={{ marginTop: 16, height: 4, background: "#252830", borderRadius: 999, overflow: "hidden" }}>
                <div style={{
                    width: `${Math.min(volPct, 100)}%`,
                    height: "100%", background: "#4f7fff",
                    borderRadius: 999, transition: "width 0.45s",
                }} />
            </div>

            {/* Updated */}
            <div style={{ marginTop: 10, textAlign: "right", fontSize: 10, color: "#555", fontFamily: "monospace" }}>
                {ticker.updated ? fmtTime(ticker.updated) : "Aguardando..."}
            </div>
        </div>
    );
}

// ?? App ???????????????????????????????????????????????????????????
export default function Home() {
    const { tickers, status, maxVolume } = useBinanceTicker();
    const isLive = status === "AO VIVO";

    return (
        <div style={{ background: "#0a0b0f", minHeight: "100vh", padding: "25px", color: "#e8eaf0", fontFamily: "'Space Grotesk', sans-serif" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                        width: 11, height: 11, borderRadius: "50%",
                        background: isLive ? "#00d48a" : "#f0415a",
                        boxShadow: `0 0 15px ${isLive ? "#00d48a" : "#f0415a"}`,
                        animation: "pulse 2s infinite",
                    }} />
                    <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "0.08em" }}>CRYPTO LIVE</span>
                </div>
                <span style={{ fontSize: 11, color: "#707687", fontFamily: "monospace" }}>
                    WS BINANCE ?{" "}
                    <span style={{ color: isLive ? "#00d48a" : "#f0415a" }}>{status}</span>
                </span>
            </div>

            {/* Grid */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
                gap: 16,
                
            }}>
                {COINS.map(coin => (
                    <CoinCard
                        key={coin.symbol}
                        coin={coin}
                        ticker={tickers[coin.symbol]}
                        volPct={tickers[coin.symbol].volume ? (tickers[coin.symbol].volume / maxVolume) * 100 : 0}
                    />
                ))}
            </div>

            {/* Footer */}
            <div style={{ marginTop: 30, textAlign: "center", color: "#555", fontSize: 11, fontFamily: "monospace" }}>
                dados em tempo real ? binance public websocket ? sem api key
            </div>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
        @keyframes pulse { 50% { opacity: 0.35; } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>
        </div>
    );
}