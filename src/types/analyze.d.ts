import { FlashcardWord } from "./flashcard";
export interface PopupProps {
    title: string;
    items: FlashcardWord[];
    onClose: () => void;
    initialExistingWords?: string[];
    onAddNewWord: (word: string[]) => void;
}

export interface FrequencyPageProps {
    onAnalysisComplete?: (words: FlashcardWord[]) => void;
}
