export async function addWordFlashcard(word: string, meanings: string[]) {
    const token = localStorage.getItem("token");
    if (!token) return null;
    return await fetch("http://localhost:3000/api/add-word", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ word, meanings }),
    });
}

export async function addWordsBulkToFlashcard(
    words: string[],
    meanings: string[][]
) {
    const token = localStorage.getItem("token");
    if (!token) return null;
    return await fetch("http://localhost:3000/api/add-words-bulk", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ words, meanings }),
    });
}

export async function getWordsFromFlashcard() {
    const token = localStorage.getItem("token");
    if (!token) return null;

    return await fetch("http://localhost:3000/api/get-words", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });
}

export async function reviewFlashcard(word: string, answer: boolean) {
    const token = localStorage.getItem("token");
    if (!token) return null;

    return await fetch("http://localhost:3000/api/review", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ word, answer }),
    });
}
