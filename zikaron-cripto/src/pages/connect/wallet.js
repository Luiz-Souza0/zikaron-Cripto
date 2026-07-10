import { useState, useCallback, useEffect, useRef } from "react";
import { API } from "../../api/api/api";
import { convertBalancesList, sumConverted } from "./convert";

const PROXY = "http://localhost:3001";
const REFRESH_INTERVAL = 3 * 60 * 1000; // 3 minutos em ms

const numFmt = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 8 });
function fmt(v) {
    const n = Number(v);
    if (!n) return "0.00";
    if (n >= 1000) return numFmt.format(n);
    if (n >= 1) return n.toFixed(4);
    return n.toFixed(8);
}

export default function Wallet() {
    const [apiKey, setApiKey] = useState("");
    const [apiSecret, setApiSecret] = useState("");
    const [stage, setStage] = useState("idle");
    const [balances, setBalances] = useState([]);
    const [errorMsg, setErrorMsg] = useState("");
    const [showSecret, setShowSecret] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [countdown, setCountdown] = useState(REFRESH_INTERVAL / 1000);

    const [token, setToken] = useState(() => {
        const saved = localStorage.getItem("auth");

        return saved
            ? JSON.parse(saved)
            : null;
    });

    useEffect(() => {
        if (token) {
            setStage("loading");
            getWallet(token);
        }
    }, [token]);


    function getWallet(token) {
        fetch(`${API}/auth/getBinanceWallet/${token.user.id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token.token}`
            },
        })
            .then(response => response.json())
            .then(data => {
                console.log("wallet data ->>> ", data);

                if (!data.wallet || !data.valid) return;

                setApiKey(data.wallet.api_key);
                setApiSecret(data.wallet.api_secret);

                const nonZero = data.balances_merged
                    .filter(b =>  !b.asset.startsWith("LD") && (parseFloat(b.free) > 0 || parseFloat(b.locked) > 0 || parseFloat(b.earn) > 0))
                    .sort((a, b) => parseFloat(b.free) - parseFloat(a.free) || parseFloat(b.locked) - parseFloat(a.locked) || parseFloat(b.earn) - parseFloat(a.earn));

                console.log("MERGED", data.balances_merged);
                console.log("ACCOUNT", data.account.balances);

                setBalances(nonZero);
                setStage("connected");
                setLastUpdate(new Date());
                setCountdown(REFRESH_INTERVAL / 1000);

                keysRef.current = {
                    apiKey: data.wallet.api_key,
                    apiSecret: data.wallet.api_secret,
                    name: data.wallet.name,
                    id: data.wallet.user_id,
                };
            })
            .catch(error => console.error("Erro ao buscar carteira:", error));
    }


    const intervalRef = useRef(null);
    const countdownRef = useRef(null);
    const keysRef = useRef({ apiKey: "", apiSecret: "", name: "", id: "" });

    // ── Busca saldo no proxy Python ───────────────────────────────
    const fetchBalances = useCallback(async (key, secret, silent = false) => {
        if (!silent) setStage("loading");

        try {
            const res = await fetch(`${PROXY}/api/account`, {
                headers: {
                    "X-Api-Key": key,
                    "X-Api-Secret": secret,
                },
            });
            const data = await res.json();
            console.log('data:'  +  JSON.stringify(data));

            if (!res.ok) throw new Error(data.msg || data.error || `Erro ${res.status}`);
            const nonZero = data.balances_merged
                .filter(b =>  !b.asset.startsWith("LD") && (parseFloat(b.free) > 0 || parseFloat(b.locked) > 0 || parseFloat(b.earn) > 0))
                .sort((a, b) => parseFloat(b.free) - parseFloat(a.free) || parseFloat(b.locked) - parseFloat(a.locked) || parseFloat(b.earn) - parseFloat(a.earn));
            const pepe = data.balances_merged.find(b => b.asset === "pepe");
            console.log("pepe PROXY", pepe);
            setBalances(nonZero);
            setStage("connected");
            setLastUpdate(new Date());
            setCountdown(REFRESH_INTERVAL / 1000);
        } catch (err) {
            if (!silent) {
                setErrorMsg(err.message || "Erro ao conectar.");
                setStage("error");
            }
        }
    }, []);

    async function registerBinanceWallet(name, id, key, secret) {
        const response = await fetch(`${API}/auth/registerBinanceWallet`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name,
                id,
                key,
                secret
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Erro ao realizar cadastro.");
        }

        return data;
    }

    // ── Conectar (primeira vez) ───────────────────────────────────
    const connect = useCallback(async () => {
        if (!apiKey.trim() || !apiSecret.trim()) return;
        console.log("connect", { apiKey, apiSecret, name: token.user.name, id: token.user.id });
        keysRef.current = { apiKey: apiKey.trim(), apiSecret: apiSecret.trim(), name: token.user.name, id: token.user.id };

        registerBinanceWallet(token.user.name, token.user.id, apiKey.trim(), apiSecret.trim());

        await fetchBalances(apiKey.trim(), apiSecret.trim());
    }, [apiKey, apiSecret, fetchBalances]);

    // ── Auto-refresh a cada 3min ──────────────────────────────────
    useEffect(() => {
        if (stage !== "connected") return;

        countdownRef.current = setInterval(() => {
            setCountdown(c => (c <= 1 ? REFRESH_INTERVAL / 1000 : c - 1));
        }, 1000);

        intervalRef.current = setInterval(() => {
            const { apiKey: k, apiSecret: s } = keysRef.current;
            fetchBalances(k, s, true);
        }, REFRESH_INTERVAL);

        return () => {
            clearInterval(intervalRef.current);
            clearInterval(countdownRef.current);
        };
    }, [stage, fetchBalances]);

    // ── Desconectar ───────────────────────────────────────────────
    const disconnect = useCallback(() => {
        clearInterval(intervalRef.current);
        clearInterval(countdownRef.current);
        setStage("idle");
        setBalances([]);
        setApiKey("");
        setApiSecret("");
        setErrorMsg("");
        setLastUpdate(null);
        setCountdown(REFRESH_INTERVAL / 1000);
        keysRef.current = { apiKey: "", apiSecret: "", name: "", id: "" };
    }, []);

    // ── Refresh manual ────────────────────────────────────────────
    const refreshNow = useCallback(() => {
        clearInterval(intervalRef.current);
        clearInterval(countdownRef.current);
        const { apiKey: k, apiSecret: s } = keysRef.current;
        fetchBalances(k, s, true);

        countdownRef.current = setInterval(() => {
            setCountdown(c => (c <= 1 ? REFRESH_INTERVAL / 1000 : c - 1));
        }, 1000);
        intervalRef.current = setInterval(() => {
            fetchBalances(keysRef.current.apiKey, keysRef.current.apiSecret, true);
        }, REFRESH_INTERVAL);
    }, [fetchBalances]);

    const fmtCountdown = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
    const [currency, setCurrency] = useState("brl"); // "brl" | "usd" | "btc"
    const [convertedBalances, setConvertedBalances] = useState([]);

    useEffect(() => {
        if (balances.length === 0) return;

        convertBalancesList(balances, currency)
            .then(setConvertedBalances)
            .catch(err => console.error("Erro na conversão:", err));
    }, [balances, currency]);

    const total = sumConverted(convertedBalances);

    return (
        <div style={{
            background: "#0a0b0f", minHeight: "100vh",
            color: "#e8eaf0", fontFamily: "system-ui, sans-serif",
            display: "flex", flexDirection: "column", alignItems: "center",
            padding: "40px 20px",
        }}>
            <style>{`
                @keyframes spin   { to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
                @keyframes pulse  { 50% { opacity: 0.4; } }
                input::placeholder { color: #3a3d4a; }
                input:focus        { outline: none; border-color: #4f7fff !important; }
                button:disabled    { opacity: 0.4; cursor: not-allowed; }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-thumb { background: #2e3040; border-radius: 99px; }
            `}</style>

            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 40 }}>
                <div style={{ fontSize: 13, color: "#4f7fff", fontFamily: "monospace", letterSpacing: "0.15em", marginBottom: 10 }}>
                    BINANCE
                </div>
                <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Conectar Carteira</h1>
                <p style={{ color: "#707687", fontSize: 14, marginTop: 8 }}>
                    Insira suas chaves para consultar o saldo
                </p>
            </div>

            {/* Card */}
            <div style={{
                background: "#111318", border: "1px solid #23252f",
                borderRadius: 20, padding: "32px", width: "100%", maxWidth: 480,
                animation: "fadeIn 0.3s ease",
            }}>

                {/* Formulário */}
                {stage !== "connected" && (
                    <>
                        <Field label="API Key">
                            <input
                                type="text"
                                value={apiKey}
                                onChange={e => setApiKey(e.target.value)}
                                placeholder="Cole sua API Key aqui"
                                disabled={stage === "loading"}
                                style={inputStyle}
                            />
                        </Field>

                        <div style={{ marginTop: 16 }}>
                            <Field label="API Secret">
                                <div style={{ position: "relative" }}>
                                    <input
                                        type={showSecret ? "text" : "password"}
                                        value={apiSecret}
                                        onChange={e => setApiSecret(e.target.value)}
                                        placeholder="Cole seu API Secret aqui"
                                        disabled={stage === "loading"}
                                        style={{ ...inputStyle, paddingRight: 44 }}
                                    />
                                    <button onClick={() => setShowSecret(s => !s)} style={{
                                        position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                                        background: "none", border: "none", color: "#707687", cursor: "pointer", fontSize: 14, padding: 4,
                                    }}>{showSecret ? "🙈" : "👁"}</button>
                                </div>
                            </Field>
                        </div>

                        {stage === "error" && (
                            <div style={{
                                marginTop: 16, padding: "12px 14px", borderRadius: 10,
                                background: "#f0415a18", border: "1px solid #f0415a30", color: "#f0415a", fontSize: 13,
                            }}>
                                ⚠️ {errorMsg}
                            </div>
                        )}

                        <button
                            onClick={connect}
                            disabled={!apiKey.trim() || !apiSecret.trim() || stage === "loading"}
                            style={{
                                marginTop: 24, width: "100%", padding: "14px",
                                background: "#4f7fff", color: "#fff", border: "none",
                                borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                            }}
                        >
                            {stage === "loading" ? (
                                <>
                                    <div style={{
                                        width: 16, height: 16, border: "2px solid #ffffff50",
                                        borderTop: "2px solid #fff", borderRadius: "50%",
                                        animation: "spin 0.7s linear infinite",
                                    }} />
                                    Conectando...
                                </>
                            ) : "Conectar"}
                        </button>

                        <p style={{ marginTop: 16, textAlign: "center", fontSize: 11, color: "#3a3d4a" }}>
                            🔒 As chaves vão apenas para o seu servidor local — nunca para terceiros.
                        </p>
                    </>
                )}

                {/* Saldo */}
                {stage === "connected" && (
                    <div style={{ animation: "fadeIn 0.35s ease" }}>

                        {/* Status */}
                        <div style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #23252f",
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{
                                    width: 8, height: 8, borderRadius: "50%",
                                    background: "#00d48a", boxShadow: "0 0 8px #00d48a",
                                    animation: "pulse 2s infinite",
                                }} />
                                <span style={{ fontSize: 13, color: "#00d48a", fontFamily: "monospace" }}>CONECTADO</span>
                            </div>
                            <span style={{ fontSize: 12, color: "#707687" }}>
                                {balances.length} ativo{balances.length !== 1 ? "s" : ""}
                            </span>
                        </div>

                        {/* Total convertido + seletor de moeda */}
                        <div style={{
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            marginBottom: 14, padding: "14px", background: "#181b22",
                            borderRadius: 10, border: "1px solid #23252f",
                        }}>
                            <div>
                                <div style={{ fontSize: 10, color: "#707687", marginBottom: 2 }}>TOTAL ESTIMADO</div>
                                <div style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 600, color: "#e8eaf0" }}>
                                    {total.toFixed(8)} {currency.toUpperCase()}
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: 6 }}>
                                {["brl", "usd", "btc"].map(c => (
                                    <button
                                        key={c}
                                        onClick={() => setCurrency(c)}
                                        style={{
                                            padding: "6px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600,
                                            cursor: "pointer", textTransform: "uppercase",
                                            background: currency === c ? "#4f7fff" : "transparent",
                                            color: currency === c ? "#fff" : "#707687",
                                            border: `1px solid ${currency === c ? "#4f7fff" : "#2e3040"}`,
                                        }}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Countdown */}
                        <div style={{
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            marginBottom: 14, padding: "10px 14px",
                            background: "#181b22", borderRadius: 10, border: "1px solid #23252f",
                        }}>
                            <div>
                                <div style={{ fontSize: 10, color: "#707687", marginBottom: 2 }}>PRÓXIMA ATUALIZAÇÃO</div>
                                <div style={{ fontFamily: "monospace", fontSize: 14, color: "#4f7fff" }}>
                                    {fmtCountdown(countdown)}
                                </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: 10, color: "#707687", marginBottom: 2 }}>ÚLTIMA ATUALIZAÇÃO</div>
                                <div style={{ fontFamily: "monospace", fontSize: 12, color: "#707687" }}>
                                    {lastUpdate ? lastUpdate.toLocaleTimeString("pt-BR") : "—"}
                                </div>
                            </div>
                        </div>

                        {/* Lista */}
                        {balances.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "40px 0", color: "#707687", fontSize: 14 }}>
                                Nenhum ativo com saldo encontrado.
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 300, overflowY: "auto" }}>
                                {balances.map(b => {
                                    const free = parseFloat(b.free) + parseFloat(b.locked) + parseFloat(b.earn);
                                    const locked = parseFloat(b.locked);
                                    return (
                                        <div key={b.asset} style={{
                                            display: "flex", alignItems: "center", justifyContent: "space-between",
                                            padding: "12px 14px", background: "#181b22",
                                            borderRadius: 12, border: "1px solid #23252f",
                                        }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                <div style={{
                                                    width: 36, height: 36, borderRadius: "50%",
                                                    background: "#23252f", color: "#e8eaf0",
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    fontSize: 11, fontWeight: 700, fontFamily: "monospace",
                                                }}>
                                                    {b.asset.slice(0, 3)}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: 14 }}>{b.asset}</div>
                                                    {locked > 0 && (
                                                        <div style={{ fontSize: 10, color: "#f7b731", marginTop: 2 }}>
                                                            🔒 {fmt(locked)} bloqueado
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: "right" }}>
                                                <div style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 500 }}>
                                                    {fmt(free)}
                                                </div>
                                                <div style={{ fontSize: 10, color: "#707687", marginTop: 2 }}>disponível</div>
                                                {(() => {
                                                    const cb = convertedBalances.find(c => c.asset === b.asset);
                                                    return cb && cb.converted != null ? (
                                                        <div style={{ fontSize: 11, color: "#4f7fff", marginTop: 2 }}>
                                                            ≈ {cb.converted.toFixed(2)} {currency.toUpperCase()}
                                                        </div>
                                                    ) : null;
                                                })()}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Botões */}
                        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                            <button
                                onClick={refreshNow}
                                style={{
                                    flex: 1, padding: "12px", background: "transparent", color: "#4f7fff",
                                    border: "1px solid #4f7fff40", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer",
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = "#4f7fff12"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                            >
                                ↻ Atualizar agora
                            </button>
                            <button
                                onClick={disconnect}
                                style={{
                                    flex: 1, padding: "12px", background: "transparent", color: "#f0415a",
                                    border: "1px solid #f0415a40", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer",
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = "#f0415a12"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                            >
                                Encerrar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function Field({ label, children }) {
    return (
        <div>
            <label style={{ display: "block", fontSize: 12, color: "#707687", marginBottom: 8, letterSpacing: "0.05em" }}>
                {label}
            </label>
            {children}
        </div>
    );
}

const inputStyle = {
    width: "100%", padding: "12px 14px",
    background: "#181b22", border: "1px solid #2e3040",
    borderRadius: 10, color: "#e8eaf0", fontSize: 14,
    fontFamily: "monospace", letterSpacing: "0.03em",
    transition: "border-color 0.2s",
};