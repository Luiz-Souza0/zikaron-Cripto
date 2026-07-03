import { Routes, Route } from "react-router-dom";

import ZikaronDashboard from "../../pages/dashboard/dashboard";
import Home from "../../pages/home";
import Wallet from "../../pages/connect/wallet";
// import Wallets from "../../pages/wallets/wallets";
// import Transactions from "../../pages/transactions/transactions";

export default function MiddleService({ token }) {
    return (
        <Routes> 
            <Route
                path="/"
                element={<Home/>}
            />
            
            
            if(token){
                <Route
                    path="/Dashboard"
                    element={<ZikaronDashboard token={token} />}
                />
            }

            <Route
                path="/wallets"
                element={<Wallet/>}
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