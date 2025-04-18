export interface PopupProps {
    title: string;
    items: { word: string; frequency: number; meanings: string[] }[];
    onClose: () => void;
    initialExistingWords?: string[];
    onAddNewWord: (word: string[]) => void;
}