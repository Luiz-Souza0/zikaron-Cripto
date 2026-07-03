import { useState } from "react";
import { NavLink } from "react-router-dom";

const C = {
    green: "#06402B",
    brownMid: "#9B6245",
    brown: "#7A4E38",
};

const SIDEBAR_WIDTH = 210;
const SIDEBAR_COLLAPSED = 56;

const TRANSITION =
    "width 320ms cubic-bezier(0.4, 0, 0.2, 1), opacity 160ms ease";

function Logo({ open }) {
    return (
        <div
            style={{
                padding: "20px 16px 14px",
                borderBottom: "1px solid rgba(255,255,255,.1)",
                display: "flex",
                alignItems: "center",
                gap: 8,
                overflow: "hidden",
                whiteSpace: "nowrap",
            }}
        >
            <span
                style={{
                    fontFamily: "serif",
                    color: C.brownMid,
                    fontSize: 22,
                    flexShrink: 0,
                }}
            >
                ZC
            </span>

            <div
                style={{
                    opacity: open ? 1 : 0,
                    transform: open
                        ? "translateX(0)"
                        : "translateX(-8px)",
                    transition:
                        "opacity .2s ease, transform .2s ease",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: "#fff",
                    }}
                >
                    Zikaron
                </div>

                <div
                    style={{
                        fontSize: 9.5,
                        color: "rgba(255,255,255,.38)",
                    }}
                >
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
                color: "rgba(255,255,255,.28)",
                padding: open ? "12px 18px 3px" : "12px 0 3px",
                textTransform: "uppercase",
                letterSpacing: "2px",
                textAlign: open ? "left" : "center",
            }}
        >
            {open ? label : "·"}
        </div>
    );
}

function NavItem({ item, open, active }) {
    const [hover, setHover] = useState(false);

    return (
        <div
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            title={!open ? item.label : ""}
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: open ? "flex-start" : "center",
                gap: open ? 10 : 0,
                padding: open ? "8px 18px" : "8px 0",
                cursor: "pointer",
                fontSize: 12.5,

                color: active
                    ? "#fff"
                    : hover
                    ? "#fff"
                    : "rgba(255,255,255,.62)",

                background: active
                    ? "rgba(255,255,255,.13)"
                    : hover
                    ? "rgba(255,255,255,.06)"
                    : "transparent",

                borderRight: active
                    ? `2px solid ${C.brownMid}`
                    : "2px solid transparent",

                transition: ".2s",
                whiteSpace: "nowrap",
            }}
        >
            <span
                style={{
                    fontSize: 16,
                    flexShrink: 0,
                }}
            >
                {item.icon}
            </span>

            <span
                style={{
                    opacity: open ? 1 : 0,
                    maxWidth: open ? 160 : 0,
                    overflow: "hidden",
                    transition: ".5s",
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
                borderTop: "1px solid rgba(255,255,255,.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: open ? "flex-start" : "center",
                gap: open ? 10 : 0,
            }}
        >
            <div
                style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: C.brown,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "#fff",
                    fontWeight: 600,
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
                    whiteSpace: "nowrap",
                }}
            >
                <div
                    style={{
                        fontSize: 12,
                        color: "rgba(255,255,255,.85)",
                    }}
                >
                    {user.name}
                </div>

                <div
                    style={{
                        fontSize: 10,
                        color: "rgba(255,255,255,.38)",
                    }}
                >
                    Plano {user.plan}
                </div>
            </div>
        </div>
    );
}

export default function ZikaronSidebar({
    open,
}) {
    const menu = [
            {
                section: "Geral",
                items: [
                    {
                        id: "dashboard",
                        icon: "▦",
                        label: "Dashboard",
                        link: "/",
                    },
                    {
                        id: "wallets",
                        icon: "◈",
                        label: "Carteiras",
                        link: "/wallets",
                    },
                    {
                        id: "tx",
                        icon: "⇄",
                        label: "Transações",
                        link: "/transactions",
                    },
                ],
            },
            {
                section: "Fiscal",
                items: [
                    {
                        id: "gcap",
                        icon: "⊟",
                        label: "Relatório GCAP",
                        link: "/gcap",
                    },
                    {
                        id: "ir",
                        icon: "◻",
                        label: "Imposto de Renda",
                        link: "/ir",
                    },
                    {
                        id: "alerts",
                        icon: "◉",
                        label: "Alertas",
                        link: "/alerts",
                    },
                ],
            },
            {
                section: "Conta",
                items: [
                    {
                        id: "settings",
                        icon: "⚙",
                        label: "Configurações",
                        link: "/settings",
                    },
                ],
            },
        ];

    const user = {
        name: "Luiz Souza",
        initials: "LS",
        plan: "Premium",
    } 
    // token?.user ?? {
    //     name: "",
    //     initials: "",
    //     plan: "",
    // };

    return (
        <div
            style={{
                
                width: open
                    ? SIDEBAR_WIDTH
                    : SIDEBAR_COLLAPSED,

                minWidth: open
                    ? SIDEBAR_WIDTH
                    : SIDEBAR_COLLAPSED,

                background: C.green,

                display: "flex",
                flexDirection: "column",

                flexShrink: 0,

                transition: TRANSITION,

                boxShadow: open
                    ? "2px 0 12px rgba(0,0,0,.08)"
                    : "none",
            }}
        >
            <Logo open={open} />

            <div
                style={{
                    flex: 1,
                    padding: "10px 0",
                    overflowY: "auto",
                }}
            >
                {menu.map((group) => (
                    <div key={group.section}>
                        <SectionLabel
                            label={group.section}
                            open={open}
                        />

                        {group.items.map((item) => (
                            <NavLink
                                key={item.id}
                                to={item.link}
                                style={{
                                    textDecoration: "none",
                                    color: "inherit",
                                    display: "block",
                                }}
                                end={item.link === "/"}
                            >
                                {({ isActive }) => (
                                    <NavItem
                                        item={item}
                                        open={open}
                                        active={isActive}
                                    />
                                )}
                            </NavLink>
                        ))}
                    </div>
                ))}
            </div>

            <UserChip
                user={user}
                open={open}
            />
        </div>
    );
}