import { Routes, Route } from "react-router-dom";

import ZikaronDashboard from "../../pages/dashboard/dashboard";
// import Wallets from "../../pages/wallets/wallets";
// import Transactions from "../../pages/transactions/transactions";

export default function MiddleService({ token }) {
    return (
        <Routes>
            <Route
                path="/"
                element={<ZikaronDashboard token={token} />}
            />

            if (token["role"] != "admint") {
                <Route 
                    path="*"
                    element={<div style={{alignItems: "center", justifyContent: "center", display: "flex", height: "100vh", color: "red"}}> <h2>Sem Acesso</h2> </div>}
                />
            }

            <Route 
                path="*"
                element={<div style={{alignItems: "center", justifyContent: "center", display: "flex", height: "100vh"}}> <h2>Página não encontrada</h2> </div>}
            />

            {/* Exemplos */}
            {/* <Route
                path="/wallets"
                element={<Wallets token={token} />}
            />

            <Route
                path="/transactions"
                element={<Transactions token={token} />}
            /> */}
        </Routes>
    );
}