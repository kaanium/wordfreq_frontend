import { API_URL } from "../config/constants";

export async function addEntriesToList(
    list: { word: string; frequency: number }[]
) {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("Token is required");
    }
    return await fetch(`${API_URL}/entries`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ list }),
    });
}
