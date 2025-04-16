export async function login(email: string, password: string) {
    const response = await fetch("http://localhost:3000/api/login", {
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
    return await fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email }),
    });
}

export async function getUser() {
    const token = localStorage.getItem("token");
    if (!token) return null;

    return await fetch("http://localhost:3000/api/get-user", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
    });
}
