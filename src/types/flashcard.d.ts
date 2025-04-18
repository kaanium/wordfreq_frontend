export interface FlashcardWord {
    id: string;
    key: string;
    meanings: string[];
    nextReview: string;
    interval: number;
    state?: "learned" | "relearning1" | "relearning2";
}

export interface ReviewsPageProps {
    words: FlashcardWord[];
    onReviewComplete: () => void;
}