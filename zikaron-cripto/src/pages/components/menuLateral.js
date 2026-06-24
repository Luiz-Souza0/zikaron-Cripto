import { useState, useEffect } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
    {
        section: "Geral",
        items: [
            { icon: "▦", label: "Dashboard", id: "dashboard" },
            { icon: "◈", label: "Carteiras", id: "wallets" },
            { icon: "⇄", label: "Transações", id: "tx" },
        ],
    },
    {
        section: "Fiscal",
        items: [
            { icon: "⊟", label: "Relatório GCAP", id: "gcap" },
            { icon: "◻", label: "Imposto de Renda", id: "ir" },
            { icon: "◉", label: "Alertas", id: "alerts" },
        ],
    },
    {
        section: "Conta",
        items: [
            { icon: "⚙", label: "Configurações", id: "settings" },
        ],
    },
];

// ─── TOKENS ──────────────────────────────────────────────────────────────────

const C = {
    green: "#06402B",
    brownMid: "#9B6245",
    brown: "#7A4E38",
};

const SIDEBAR_WIDTH = 210; // px — fully open
const SIDEBAR_COLLAPSED = 56;  // px — icons only
const TRANSITION = "width 320ms cubic-bezier(0.4, 0, 0.2, 1), opacity 160ms ease";

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function Logo({ open }) {
    return (
        <div
            style={{
                padding: "20px 16px 14px",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                gap: 8,
                overflow: "hidden",
                whiteSpace: "nowrap",
            }}
        >
            <span style={{ fontFamily: "serif", color: C.brownMid, fontSize: 22, flexShrink: 0 }}>ז</span>
            <div
                style={{
                    opacity: open ? 1 : 0,
                    transform: open ? "translateX(0)" : "translateX(-8px)",
                    transition: "opacity 200ms ease, transform 200ms ease",
                    overflow: "hidden",
                }}
            >
                <div style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>Zikaron</div>
                <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.38)", marginTop: 1 }}>
                    Cripto · Registro Fiscal
                </div>
            </div>
        </div>
    );
}

function SectionLabel({ label, open }) {
    return (
        <div
            style={{
                fontSize: 9.5,
                color: "rgba(255,255,255,0.28)",
                padding: open ? "12px 18px 3px" : "12px 0 3px",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                textAlign: open ? "left" : "center",
                overflow: "hidden",
                whiteSpace: "nowrap",
                transition: "padding 320ms cubic-bezier(0.4,0,0.2,1)",
            }}
        >
            {open ? label : "·"}
        </div>
    );
}

function NavItem({ item, active, open, onClick }) {
    const [hov, setHov] = useState(false);
    const isActive = active === item.id;

    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            title={!open ? item.label : undefined}
            style={{
                display: "flex",
                alignItems: "center",
                gap: open ? 10 : 0,
                padding: open ? "8px 18px" : "8px 0",
                justifyContent: open ? "flex-start" : "center",
                fontSize: 12.5,
                cursor: "pointer",
                color: isActive ? "#fff" : hov ? "#fff" : "rgba(255,255,255,0.62)",
                background: isActive
                    ? "rgba(255,255,255,0.13)"
                    : hov
                        ? "rgba(255,255,255,0.06)"
                        : "transparent",
                borderRight: isActive ? `2px solid ${C.brownMid}` : "2px solid transparent",
                transition: "background 0.15s, color 0.15s, padding 320ms cubic-bezier(0.4,0,0.2,1), gap 320ms cubic-bezier(0.4,0,0.2,1)",
                overflow: "hidden",
                whiteSpace: "nowrap",
            }}
        >
            <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
            <span
                style={{
                    opacity: open ? 1 : 0,
                    maxWidth: open ? 160 : 0,
                    transition: "opacity 180ms ease, max-width 320ms cubic-bezier(0.4,0,0.2,1)",
                    overflow: "hidden",
                }}
            >
                {item.label}
            </span>
        </div>
    );
}

function UserChip({ user, open }) {
    return (
        <div
            style={{
                padding: open ? "12px 18px" : "12px 0",
                borderTop: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                gap: open ? 10 : 0,
                justifyContent: open ? "flex-start" : "center",
                overflow: "hidden",
                transition: "padding 320ms cubic-bezier(0.4,0,0.2,1), gap 320ms cubic-bezier(0.4,0,0.2,1)",
            }}
        >
            <div
                style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: C.brown,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#fff",
                    flexShrink: 0,
                }}
            >
                {user.initials}
            </div>
            <div
                style={{
                    opacity: open ? 1 : 0,
                    maxWidth: open ? 160 : 0,
                    overflow: "hidden",
                    transition: "opacity 180ms ease, max-width 320ms cubic-bezier(0.4,0,0.2,1)",
                    whiteSpace: "nowrap",
                }}
            >
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)" }}>
                    {user.name}
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.38)" }}>
                    Plano {user.plan}
                </div>
            </div>
        </div>
    );
}

function ToggleButton({ open, onClick }) {
    const [hov, setHov] = useState(false);
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            title={open ? "Recolher menu" : "Expandir menu"}
            style={{
                position: "absolute",
                top: 18,
                right: -12,
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: hov ? C.brownMid : "#fff",
                border: `1.5px solid #e5e7eb`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: 11,
                color: hov ? "#fff" : C.green,
                boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
                transition: "background 0.15s, color 0.15s, transform 320ms ease",
                transform: open ? "rotate(0deg)" : "rotate(180deg)",
                zIndex: 10,
            }}
        >
            ‹
        </button>
    );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

/**
 * ZikaronSidebar
 *
 * Props:
 *   open       {boolean}  — controlled open/close state
 *   onToggle   {function} — callback to flip open state in parent
 *   activeNav  {string}   — currently active nav item id
 *   onNav      {function} — callback(id) when a nav item is clicked
 *   user       {object}   — { name, initials, plan }
 */
export default function ZikaronSidebar({ open, onToggle, activeNav, onNav, user }) {
    // Keep track of whether the sidebar is fully collapsed to hide overflow cleanly
    const [fullyCollapsed, setFullyCollapsed] = useState(!open);

    useEffect(() => {
        let timer;
        if (open) {
            // As soon as it starts opening, allow overflow
            setFullyCollapsed(false);
        } else {
            // Wait for animation to finish before hiding overflow
            timer = setTimeout(() => setFullyCollapsed(true), 340);
        }
        return () => clearTimeout(timer);
    }, [open]);

    return (
        <div
            style={{
                position: "relative",
                width: open ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED,
                minWidth: open ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED,
                background: C.green,
                display: "flex",
                flexDirection: "column",
                flexShrink: 0,
                overflow: fullyCollapsed ? "visible" : "hidden",
                transition: TRANSITION,
                // Subtle shadow when open to separate from content
                boxShadow: open ? "2px 0 12px rgba(0,0,0,0.08)" : "none",
            }}
        >
            {/* Toggle button — floats on the right edge */}
            <ToggleButton open={open} onClick={onToggle} />

            {/* Logo */}
            <Logo open={open} />

            {/* Navigation */}
            <div style={{ flex: 1, padding: "10px 0", overflowY: "auto", overflowX: "hidden" }}>
                {NAV_ITEMS.map((group) => (
                    <div key={group.section}>
                        <SectionLabel label={group.section} open={open} />
                        {group.items.map((item) => (
                            <NavItem
                                key={item.id}
                                item={item}
                                active={activeNav}
                                open={open}
                                onClick={() => onNav(item.id)}
                            />
                        ))}
                    </div>
                ))}
            </div>

            {/* User chip */}
            <UserChip user={user} open={open} />
        </div>
    );
}