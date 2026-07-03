import { useState } from "react";

import "./App.css";

import { login, register } from "./api/api/api";

import ZikaronHeader from "./pages/components/header/header";
import ZikaronSidebar from "./pages/components/menuLateral";
import MiddleService from "./api/api/middleware";
import { ZikaronLoginModal, ZikaronRegisterModal } from "./pages/components/auth/authModal";
function App() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const [modal, setModal] = useState(null);
    const [activeNav, setActiveNav] = useState("dashboard");

    const [token, setToken] = useState(() => {
        const saved = localStorage.getItem("auth");

        return saved
            ? JSON.parse(saved)
            : null;
    });

    function logout() {
        localStorage.removeItem("auth");
        setToken(null);
    }

    function openModal(Type) {
        setModal(Type);
    }
    return (
        <div
            style={{
                margin: 0,
                display: "flex"
            }}
        >
            <ZikaronSidebar
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
                    user={token?.user}
                    onLogout={logout}
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
                onSuccess={async ({ email, password }) => {
                    try {

                        const auth = await login(email, password);

                        localStorage.setItem(
                            "auth",
                            JSON.stringify(auth)
                        );

                        setToken(auth);

                        setModal(null);

                    } catch (err) {
                        alert(err.message);
                    }
                }}
                onGoRegister={() => setModal("register")}
            />

            <ZikaronRegisterModal
                open={modal === "register"}
                onClose={() => setModal(null)}
                onSuccess={async ({ name, email, password, role }) => {
                    try {
                        await register(name, email, password, role);

                        alert("Cadastro realizado com sucesso!");

                        setModal("login");
                    } catch (err) {
                        alert(err.message);
                    }
                }}
                onGoLogin={() => setModal("login")}
            />
        </div>
    );
}

export default App;