import { useState } from "react";

import "./App.css";

import ZikaronHeader from "./pages/components/header/header";
import ZikaronSidebar from "./pages/components/menuLateral";
import MiddleService from "./api/api/middleware";
import { ZikaronLoginModal, ZikaronRegisterModal } from "./pages/components/auth/authModal";
function App() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const [modal, setModal] = useState(null);
    const [activeNav, setActiveNav] = useState("dashboard");

const [token] = useState({
    user: {
        id: 1,
        name: "Luiz Souza",
        initials: "LS",
        plan: "Premium",
    },

    menu: [
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
    ],
});

    function openModal(Type) {
        setModal(Type);
    }
    return (
        <div
            style={{
                margin: 0 ,
                display: "flex"
            }}
        >
            <ZikaronSidebar
                token={token}
                open={sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
                activeNav={activeNav}
                onNav={setActiveNav}
            />

            <div
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <ZikaronHeader
                    open={sidebarOpen}
                    onToggle={() => setSidebarOpen(!sidebarOpen)}
                    title="Dashboard"
                    onOpenModal={openModal} 
                    user={token.user} 

                />

                <div
                    style={{
                        flex: 1,
                        overflow: "auto",
                    }}
                >
                    <MiddleService token={token} />
                </div>
            </div>
            <ZikaronLoginModal
                    open={modal === "login"}
                    onClose={() => setModal(null)}
                    onSuccess={({ email }) => {
                        // seu fetch de login aqui
                        setModal(null);
                    }}
                    onGoRegister={() => setModal("register")}
                    />

                    <ZikaronRegisterModal
                    open={modal === "register"}
                    onClose={() => setModal(null)}
                    onSuccess={({ name, email }) => {
                        // seu fetch de cadastro aqui
                        setModal(null);
                    }}
                    onGoLogin={() => setModal("login")}
                    />
        </div>
    );
}

export default App;