export async function addMeaningsToList(list: { word: string; frequency: number }[]) {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("Token is required");
    }
    return await fetch("http://localhost:3000/api/meanings", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ list }),
    });
}
