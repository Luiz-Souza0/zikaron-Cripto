// import { HiAdjustmentsHorizontal } from "react-icons/hi2";


import { useState } from "react";

const C = {
    green: "#06402B",
    brownMid: "#9B6245",
    brown:      "#7A4E38",   // ← estava faltando

};

function HeaderButton({ label, variant = "outline", onClick }) {
    const [hov, setHov] = useState(false);
 
    const styles = {
        solid: {
            background: hov ? C.greenHover : C.green,
            color: "#fff",
            border: "none",
        },
        outline: {
            background: hov ? C.greenPale : "#fff",
            color: C.green,
            border: `1.5px solid ${C.green}`,
        },
    };

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                padding: "7px 18px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.15s",
                ...styles[variant],
            }}
        >
            {label}
        </button>
    );
}

export default function ZikaronHeader({
    open,
    onToggle,
    title = "Dashboard",
    onOpenModal, 
    user
}) {
    const [hover, setHover] = useState(false);

    return (
        <header
            style={{
                height: 60,
                background: "#fff",
                borderBottom: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 20px",
                boxSizing: "border-box",
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                }}
            >
                <button
                    onClick={onToggle}
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                    style={{
                        width: 38,
                        height: 38,
                        border: "none",
                        borderRadius: 8,
                        cursor: "pointer",
                        background: hover ? C.green : "#f3f4f6",
                        color: hover ? "#fff" : C.green,
                        fontSize: 20,
                        transition: ".2s",
                    }}
                >
                    ☰
                </button>

                <h2
                    style={{
                        margin: 0,
                        fontSize: 20,
                        color: C.green,
                        fontWeight: 600,
                    }}
                >
                    {title}
                </h2>
            </div>

            <div
                style={{
                    fontSize: 13,
                    color: "#6b7280",
                }}
            >
                {!user ? (
            // Avatar do usuário logado
            <div style={{ width: 32, height: 32, borderRadius: "50%",
                background: C.brown, color: "#fff", display: "flex",
                alignItems: "center", justifyContent: "center",
                fontWeight: 600, fontSize: 12 }}>
                {user.initials}
            </div>
        ) : (
            // Botões de login/cadastro
            <>
                <HeaderButton label="Entrar" variant="outline" onClick={() => onOpenModal?.("login")} />
                <HeaderButton label="Criar conta" variant="solid" onClick={() => onOpenModal?.("register")} />
            </>
        )}
            </div>
        </header>
    );
}