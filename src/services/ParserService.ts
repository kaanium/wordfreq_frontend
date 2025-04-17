import { API_URL } from "../config/constants";

export async function extractWords(text: string) {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("Token is required");
    }
    return await fetch(`${API_URL}/extract-words`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
    });
}
