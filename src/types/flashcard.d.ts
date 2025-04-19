export interface Word {
    id: string;
    key: string;
    meanings: string[];
    nextReview: string;
    interval: number;
    state?: "learned" | "relearning1" | "relearning2";
}

export interface FlashcardWord {
    word: string;
    frequency: number;
    meanings: string[];
}

export interface ReviewsPageProps {
    words: Word[];
    onReviewComplete: () => void;
}
