import { API_URL } from "../config/constants";

export async function login(email: string, password: string) {
    const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    localStorage.setItem("token", data.token);
    return data;
}

export async function register(
    username: string,
    password: string,
    email: string
) {
    return await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email }),
    });
}

export async function getUser() {
    const token = localStorage.getItem("token");
    if (!token) return null;

    return await fetch(`${API_URL}/get-user`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
    });
}
