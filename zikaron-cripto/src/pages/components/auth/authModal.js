import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
// ─── TOKENS ──────────────────────────────────────────────────────────────────

const C = {
    green: "#06402B",
    greenHover: "#0a5c3e",
    greenPale: "#e6f0eb",
    brown: "#7A4E38",
    brownLight: "#f0e6e0",
    brownMid: "#9B6245",
    brownDark: "#5C3520",
    textPri: "#1a1a1a",
    textSec: "#6b7280",
    border: "#e5e7eb",
    borderFocus: "#06402B",
    bg: "#f4f6f4",
    card: "#ffffff",
    error: "#b91c1c",
    errorLight: "#fee2e2",
};

// ─── VALIDATION ───────────────────────────────────────────────────────────────

function validateEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
        ? null
        : "E-mail inválido";
}

function validatePassword(v) {
    if (v.length < 8) return "Mínimo 8 caracteres";
    if (!/[A-Z]/.test(v)) return "Precisa de ao menos uma letra maiúscula";
    if (!/[0-9]/.test(v)) return "Precisa de ao menos um número";
    return null;
}

function validateName(v) {
    return v.trim().length >= 3 ? null : "Nome deve ter ao menos 3 caracteres";
}

function validateConfirm(pw, confirm) {
    return pw === confirm ? null : "As senhas não coincidem";
}

// ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────

function Overlay({ onClick }) {
    return (
        <div
            onClick={onClick}
            style={{
                position: "fixed", inset: 0,
                background: "rgba(0,0,0,0.45)",
                backdropFilter: "blur(3px)",
                zIndex: 999,
                animation: "fadeIn 200ms ease",
            }}
        />
    );
}

function ModalShell({ children, visible }) {
    return (
        <div
            style={{
                position: "fixed", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 1000,
                pointerEvents: visible ? "all" : "none",
            }}
        >
            <div
                style={{
                    background: C.card,
                    borderRadius: 16,
                    width: "100%",
                    maxWidth: 420,
                    margin: "0 16px",
                    boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
                    animation: "slideUp 240ms cubic-bezier(0.34,1.56,0.64,1)",
                    overflow: "hidden",
                }}
            >
                {children}
            </div>
        </div>
    );
}

function ModalHeader({ title, subtitle, onClose }) {
    const [hovClose, setHovClose] = useState(false);
    return (
        <div style={{ padding: "24px 24px 0", position: "relative" }}>
            {/* Brand mark */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <span style={{ fontFamily: "serif", color: C.brownMid, fontSize: 22 }}>ז</span>
                <span style={{ fontSize: 15, fontWeight: 600, color: C.green }}>Zikaron</span>
                <span style={{ fontSize: 11, color: C.textSec, marginLeft: 2 }}>Cripto</span>
            </div>
            {/* Close button */}
            <button
                onClick={onClose}
                onMouseEnter={() => setHovClose(true)}
                onMouseLeave={() => setHovClose(false)}
                style={{
                    position: "absolute", top: 20, right: 20,
                    width: 30, height: 30, borderRadius: "50%",
                    border: `1px solid ${C.border}`,
                    background: hovClose ? C.bg : C.card,
                    color: C.textSec, fontSize: 15,
                    cursor: "pointer", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    transition: "background 0.15s",
                }}
            >
                ✕
            </button>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.textPri }}>{title}</div>
            {subtitle && (
                <div style={{ fontSize: 13, color: C.textSec, marginTop: 5 }}>{subtitle}</div>
            )}
            <div style={{ height: 1, background: C.border, margin: "20px 0 0" }} />
        </div>
    );
}

function Field({ label, type = "text", value, onChange, onBlur, error, placeholder, hint, autoFocus }) {
    const [show, setShow] = useState(false);
    const [focused, setFocused] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (show ? "text" : "password") : type;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: C.textSec }}>{label}</label>
            <div style={{ position: "relative" }}>
                <input
                    autoFocus={autoFocus}
                    type={inputType}
                    value={value}
                    placeholder={placeholder}
                    onChange={e => onChange(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => { setFocused(false); onBlur && onBlur(); }}
                    style={{
                        width: "100%",
                        padding: isPassword ? "10px 40px 10px 12px" : "10px 12px",
                        border: `1.5px solid ${error ? C.error : focused ? C.borderFocus : C.border}`,
                        borderRadius: 8,
                        fontSize: 13.5,
                        color: C.textPri,
                        background: error ? C.errorLight : C.card,
                        outline: "none",
                        transition: "border 0.15s, background 0.15s",
                        boxSizing: "border-box",
                        boxShadow: focused && !error ? `0 0 0 3px rgba(6,64,43,0.08)` : "none",
                    }}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShow(s => !s)}
                        style={{
                            position: "absolute", right: 10, top: "50%",
                            transform: "translateY(-50%)",
                            background: "none", border: "none",
                            cursor: "pointer", fontSize: 15,
                            color: C.textSec, padding: 2,
                        }}
                    >
                        {show ? "🙈" : "👁"}
                    </button>
                )}
            </div>
            {error && (
                <div style={{ fontSize: 11, color: C.error, display: "flex", alignItems: "center", gap: 4 }}>
                    ⚠ {error}
                </div>
            )}
            {hint && !error && (
                <div style={{ fontSize: 11, color: C.textSec }}>{hint}</div>
            )}
        </div>
    );
}

function PasswordStrength({ password }) {
    if (!password) return null;

    const checks = [
        { label: "8+ caracteres", ok: password.length >= 8 },
        { label: "Maiúscula", ok: /[A-Z]/.test(password) },
        { label: "Número", ok: /[0-9]/.test(password) },
        { label: "Símbolo", ok: /[^A-Za-z0-9]/.test(password) },
    ];

    const score = checks.filter(c => c.ok).length;
    const colors = ["#e5e7eb", C.error, C.brownMid, "#f59e0b", C.green];
    const labels = ["", "Fraca", "Razoável", "Boa", "Forte"];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", gap: 4 }}>
                {[1, 2, 3, 4].map(i => (
                    <div
                        key={i}
                        style={{
                            flex: 1, height: 3, borderRadius: 2,
                            background: i <= score ? colors[score] : C.border,
                            transition: "background 0.3s",
                        }}
                    />
                ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 8 }}>
                    {checks.map(c => (
                        <span key={c.label} style={{ fontSize: 10, color: c.ok ? C.green : C.textSec, display: "flex", alignItems: "center", gap: 2 }}>
                            {c.ok ? "✓" : "○"} {c.label}
                        </span>
                    ))}
                </div>
                {score > 0 && (
                    <span style={{ fontSize: 10, fontWeight: 600, color: colors[score] }}>{labels[score]}</span>
                )}
            </div>
        </div>
    );
}

function SubmitButton({ label, loading, disabled }) {
    const [hov, setHov] = useState(false);
    return (
        <button
            type="submit"
            disabled={disabled || loading}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                width: "100%",
                padding: "12px",
                background: disabled || loading ? "#9ca3af" : hov ? C.greenHover : C.green,
                color: "#fff",
                border: "none",
                borderRadius: 9,
                fontSize: 14,
                fontWeight: 600,
                cursor: disabled || loading ? "not-allowed" : "pointer",
                transition: "background 0.15s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                letterSpacing: "0.2px",
            }}
        >
            {loading && (
                <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
            )}
            {loading ? "Aguarde..." : label}
        </button>
    );
}

function Divider({ label }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, height: 1, background: C.border }} />
            <span style={{ fontSize: 11, color: C.textSec }}>{label}</span>
            <div style={{ flex: 1, height: 1, background: C.border }} />
        </div>
    );
}

// ─── LOGIN MODAL ──────────────────────────────────────────────────────────────

/**
 * ZikaronLoginModal
 *
 * Props:
 *   open          {boolean}    — controla visibilidade
 *   onClose       {function}   — callback para fechar
 *   onSuccess     {function}   — callback({ email }) ao submeter
 *   onGoRegister  {function}   — callback para abrir modal de cadastro
 */
export function ZikaronLoginModal({ open, onClose, onSuccess, onGoRegister }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [touched, setTouched] = useState({});

    // Reset ao abrir
    useEffect(() => {
        if (open) {
            setEmail(""); setPassword("");
            setErrors({}); setTouched({});
            setLoading(false);
        }
    }, [open]);

    // Fechar com ESC
    useEffect(() => {
        if (!open) return;
        const handler = e => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [open, onClose]);

    function validate() {
        const e = {};
        const emailErr = validateEmail(email);
        if (emailErr) e.email = emailErr;
        if (!password) e.password = "Informe sua senha";
        return e;
    }

    async function handleSubmit(ev) {
        ev.preventDefault();
        setTouched({ email: true, password: true });
        const e = validate();
        setErrors(e);
        if (Object.keys(e).length > 0) return;

        setLoading(true);
        // Simula chamada de API — substitua pelo seu fetch/axios
        await new Promise(r => setTimeout(r, 1400));
        setLoading(false);
        onSuccess?.({ email });
    }

    if (!open) return null;

    return (
        <>
            <style>{`
        @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(24px) scale(0.97) } to { opacity:1; transform:translateY(0) scale(1) } }
        @keyframes spin    { to { transform:rotate(360deg) } }
      `}</style>
            <Overlay onClick={onClose} />
            <ModalShell visible={open}>
                <ModalHeader
                    title="Entrar na conta"
                    subtitle="Bem-vindo de volta ao Zikaron Cripto"
                    onClose={onClose}
                />
                <form onSubmit={handleSubmit} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                    <Field
                        label="E-mail"
                        type="email"
                        value={email}
                        onChange={v => { setEmail(v); if (touched.email) setErrors(e => ({ ...e, email: validateEmail(v) })); }}
                        onBlur={() => { setTouched(t => ({ ...t, email: true })); setErrors(e => ({ ...e, email: validateEmail(email) })); }}
                        error={touched.email ? errors.email : null}
                        placeholder="seu@email.com"
                        autoFocus
                    />
                    <Field
                        label="Senha"
                        type="password"
                        value={password}
                        onChange={v => { setPassword(v); if (touched.password) setErrors(e => ({ ...e, password: v ? null : "Informe sua senha" })); }}
                        onBlur={() => setTouched(t => ({ ...t, password: true }))}
                        error={touched.password ? errors.password : null}
                        placeholder="*******"
                    />

                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -8 }}>
                        <span style={{ fontSize: 12, color: C.green, cursor: "pointer" }}>
                            Esqueci minha senha
                        </span>
                    </div>

                    <SubmitButton label="Entrar" loading={loading} />

                    <Divider label="não tem uma conta?" />

                    <button
                        type="button"
                        onClick={onGoRegister}
                        style={{
                            width: "100%", padding: "11px",
                            background: C.card,
                            color: C.green,
                            border: `1.5px solid ${C.green}`,
                            borderRadius: 9, fontSize: 14,
                            fontWeight: 600, cursor: "pointer",
                            transition: "background 0.15s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = C.greenPale}
                        onMouseLeave={e => e.currentTarget.style.background = C.card}
                    >
                        Criar conta gratuita
                    </button>

                    <p style={{ textAlign: "center", fontSize: 11, color: C.textSec, margin: 0 }}>
                        Ao continuar você concorda com os{" "}
                        <span style={{ color: C.green, cursor: "pointer" }}>Termos de Uso</span>
                        {" "}e a{" "}
                        <span style={{ color: C.green, cursor: "pointer" }}>Política de Privacidade</span>.
                    </p>
                </form>
            </ModalShell>
        </>
    );
}

// ─── REGISTER MODAL ───────────────────────────────────────────────────────────

/**
 * ZikaronRegisterModal
 *
 * Props:
 *   open        {boolean}    — controla visibilidade
 *   onClose     {function}   — callback para fechar
 *   onSuccess   {function}   — callback({ name, email }) ao submeter
 *   onGoLogin   {function}   — callback para abrir modal de login
 */
export function ZikaronRegisterModal({ open, onClose, onSuccess, onGoLogin }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [agree, setAgree] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [touched, setTouched] = useState({});

    useEffect(() => {
        if (open) {
            setName(""); setEmail(""); setPassword(""); setConfirm("");
            setAgree(false); setErrors({}); setTouched({}); setLoading(false);
        }
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const handler = e => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [open, onClose]);

    function validate() {
        const e = {};
        const nameErr = validateName(name);
        if (nameErr) e.name = nameErr;
        const emailErr = validateEmail(email);
        if (emailErr) e.email = emailErr;
        const pwErr = validatePassword(password);
        if (pwErr) e.password = pwErr;
        const confErr = validateConfirm(password, confirm);
        if (confErr) e.confirm = confErr;
        if (!agree) e.agree = "Você precisa aceitar os termos";
        return e;
    }

    async function handleSubmit(ev) {
        ev.preventDefault();
        setTouched({ name: true, email: true, password: true, confirm: true, agree: true });
        const e = validate();
        setErrors(e);
        if (Object.keys(e).length > 0) return;

        setLoading(true);
        await new Promise(r => setTimeout(r, 1600));
        setLoading(false);
        onSuccess?.({ name, email });
    }

    if (!open) return null;

    return (
        <>
            <style>{`
        @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(24px) scale(0.97) } to { opacity:1; transform:translateY(0) scale(1) } }
        @keyframes spin    { to { transform:rotate(360deg) } }
      `}</style>
            <Overlay onClick={onClose} />
            <ModalShell visible={open}>
                <ModalHeader
                    title="Criar conta"
                    subtitle="Comece a controlar seu patrimônio cripto"
                    onClose={onClose}
                />
                <form
                    onSubmit={handleSubmit}
                    style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14, maxHeight: "70vh", overflowY: "auto" }}
                >
                    <Field
                        label="Nome completo"
                        type="text"
                        value={name}
                        onChange={v => { setName(v); if (touched.name) setErrors(e => ({ ...e, name: validateName(v) })); }}
                        onBlur={() => { setTouched(t => ({ ...t, name: true })); setErrors(e => ({ ...e, name: validateName(name) })); }}
                        error={touched.name ? errors.name : null}
                        placeholder="Seu nome"
                        autoFocus
                    />
                    <Field
                        label="E-mail"
                        type="email"
                        value={email}
                        onChange={v => { setEmail(v); if (touched.email) setErrors(e => ({ ...e, email: validateEmail(v) })); }}
                        onBlur={() => { setTouched(t => ({ ...t, email: true })); setErrors(e => ({ ...e, email: validateEmail(email) })); }}
                        error={touched.email ? errors.email : null}
                        placeholder="seu@email.com"
                    />
                    <Field
                        label="Senha"
                        type="password"
                        value={password}
                        onChange={v => {
                            setPassword(v);
                            if (touched.password) setErrors(e => ({ ...e, password: validatePassword(v) }));
                            if (touched.confirm && confirm) setErrors(e => ({ ...e, confirm: validateConfirm(v, confirm) }));
                        }}
                        onBlur={() => { setTouched(t => ({ ...t, password: true })); setErrors(e => ({ ...e, password: validatePassword(password) })); }}
                        error={touched.password ? errors.password : null}
                        placeholder="Mínimo 8 caracteres"
                    />
                    <PasswordStrength password={password} />
                    <Field
                        label="Confirmar senha"
                        type="password"
                        value={confirm}
                        onChange={v => { setConfirm(v); if (touched.confirm) setErrors(e => ({ ...e, confirm: validateConfirm(password, v) })); }}
                        onBlur={() => { setTouched(t => ({ ...t, confirm: true })); setErrors(e => ({ ...e, confirm: validateConfirm(password, confirm) })); }}
                        error={touched.confirm ? errors.confirm : null}
                        placeholder="Repita a senha"
                    />

                    {/* Agree checkbox */}
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <input
                            type="checkbox"
                            id="agree"
                            checked={agree}
                            onChange={e => { setAgree(e.target.checked); setErrors(err => ({ ...err, agree: e.target.checked ? null : "Você precisa aceitar os termos" })); }}
                            style={{ marginTop: 2, accentColor: C.green, width: 15, height: 15, flexShrink: 0 }}
                        />
                        <label htmlFor="agree" style={{ fontSize: 13, color: C.textSec, cursor: "pointer", lineHeight: 1.5 }}>
                            Li e aceito os{" "}
                            <Link to="/terms" style={{textDecoration: 'none' }} onClick={onClose} ><span style={{ color: C.green, fontSize:"16px"  }}>Termos de Uso</span></Link>
                            {" "}e a{" "}
                            <Link to="/privacy" style={{textDecoration: 'none' }} onClick={onClose}><span style={{ color: C.green, fontSize:"16px"  }}>Política de Privacidade</span></Link>
                            {" "}do Zikaron Cripto
                        </label>
                    </div>
                    {touched.agree && errors.agree && (
                        <div style={{ fontSize: 11, color: C.error, marginTop: -8 }}>⚠ {errors.agree}</div>
                    )}

                    <SubmitButton label="Criar conta" loading={loading} disabled={!agree} />

                    <Divider label="já tem uma conta?" />

                    <button
                        type="button"
                        onClick={onGoLogin}
                        style={{
                            width: "100%", padding: "11px",
                            background: C.card, color: C.green,
                            border: `1.5px solid ${C.green}`,
                            borderRadius: 9, fontSize: 14,
                            fontWeight: 600, cursor: "pointer",
                            transition: "background 0.15s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = C.greenPale}
                        onMouseLeave={e => e.currentTarget.style.background = C.card}
                    >
                        Já tenho conta — Entrar
                    </button>
                </form>
            </ModalShell>
        </>
    );
}

// ─── DEMO (remova em produção) ────────────────────────────────────────────────

export default function AuthModalDemo() {
    const [modal, setModal] = useState(null); // "login" | "register" | null

    return (
        <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontFamily: "serif", color: C.brownMid, fontSize: 32 }}>ז</span>
                <span style={{ fontSize: 24, fontWeight: 700, color: C.green }}>Zikaron Cripto</span>
            </div>
            <p style={{ fontSize: 14, color: C.textSec, marginBottom: 8 }}>Clique para testar os modais</p>
            <div style={{ display: "flex", gap: 12 }}>
                <button
                    onClick={() => setModal("login")}
                    style={{ padding: "11px 28px", background: C.green, color: "#fff", border: "none", borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
                >
                    Entrar
                </button>
                <button
                    onClick={() => setModal("register")}
                    style={{ padding: "11px 28px", background: C.card, color: C.green, border: `1.5px solid ${C.green}`, borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
                >
                    Criar conta
                </button>
            </div>

            <ZikaronLoginModal
                open={modal === "login"}
                onClose={() => setModal(null)}
                onSuccess={({ email }) => { alert(`Login: ${email}`); setModal(null); }}
                onGoRegister={() => setModal("register")}
            />

            <ZikaronRegisterModal
                open={modal === "register"}
                onClose={() => setModal(null)}
                onSuccess={({ name, email }) => { alert(`Cadastro: ${name} — ${email}`); setModal(null); }}
                onGoLogin={() => setModal("login")}
            />
        </div>
    );
}