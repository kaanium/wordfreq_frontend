export interface Backendword {
    id: string;
    key: string;
    meanings: string[];
    reading: string;
    nextReview: string;
    interval: number;
    state?: "learned" | "relearning1" | "relearning2";
}

export interface FlashcardWord {
    word: string;
    frequency: number;
    meanings: string[];
    reading: string;
}

export interface ReviewsPageProps {
    words: Backendword[];
    onReviewComplete: () => void;
}
