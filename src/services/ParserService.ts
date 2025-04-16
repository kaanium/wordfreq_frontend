export async function extractWords(text: string) {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("Token is required");
    }
    return await fetch("http://localhost:3000/api/extract-words", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
    });
}
