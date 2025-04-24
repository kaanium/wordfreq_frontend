import { API_URL } from "../config/constants";

export async function addWordFlashcard(
    word: string,
    meanings: string[],
    reading: string
) {
    const token = localStorage.getItem("token");
    if (!token) return null;
    return await fetch(`${API_URL}/add-word`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ word, meanings, reading }),
    });
}

export async function addWordsBulkToFlashcard(
    words: string[],
    meanings: string[][],
    readings: string[]
) {
    const token = localStorage.getItem("token");
    if (!token) return null;
    return await fetch(`${API_URL}/add-words-bulk`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ words, meanings, readings }),
    });
}

export async function isExists(word: string) {
    const token = localStorage.getItem("token");
    if (!token) return null;
    return await fetch(`${API_URL}/check-if-exists`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ word }),
    });
}

export async function getWordsFromFlashcard() {
    const token = localStorage.getItem("token");
    if (!token) return null;

    return await fetch(`${API_URL}/get-words`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });
}

export async function getReviewWordsFromFlashcard() {
    const token = localStorage.getItem("token");
    if (!token) return null;

    return await fetch(`${API_URL}/get-review-words`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });
}

export async function updateReviewCount(count: number) {
    const token = localStorage.getItem("token");
    if (!token) return null;

    return await fetch(`${API_URL}/update-review-count`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ count }),
    });
}

export async function reviewFlashcard(word: string, answer: boolean) {
    const token = localStorage.getItem("token");
    if (!token) return null;

    return await fetch(`${API_URL}/review`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ word, answer }),
    });
}
