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

export interface FlashcardContentProps {
    word: Backendword;
    isFlipped: boolean;
    onFlip: (isFlipped: boolean) => void;
    handleReview: (word: string, isCorrect: boolean) => void;
    hasFlipped: boolean;
}

export interface CompleteStateProps {
    stats: {
        correct: number;
        incorrect: number;
    };
    onReset: () => void;
}
export interface TapSafeDivProps extends React.HTMLAttributes<HTMLDivElement> {
    onClick: () => void;
    children: React.ReactNode;
}

export interface CardStateProps {
    icon: React.ReactNode;
    title: string;
    description?: string;
    children?: React.ReactNode;
}

export interface StatBlockProps {
    value: React.ReactNode;
    label: string;
    color: string;
  }
