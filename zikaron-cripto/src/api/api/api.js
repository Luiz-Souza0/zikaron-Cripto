// import axios from 'axios';

export const API = "http://127.0.0.1:3001";

export async function login(email, password) {
    const response = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email,
            password,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Erro ao realizar login.");
    }

    return data;
}

export async function register(name, email, password) {
    const response = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name,
            email,
            password,
            role: "standard",
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Erro ao realizar cadastro.");
    }

    return data;
}