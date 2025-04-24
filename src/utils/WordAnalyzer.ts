import { extractWords } from "../services/ParserService";
import { addEntriesToList } from "../services/DictionaryService";
import { FlashcardWord } from "../types";

export const wordAnalyzer = async (
    input: string | File | null,
    isFile: boolean,
    setIsProcessing: (value: boolean) => void,
    onAnalysisComplete?: (words: FlashcardWord[]) => void,
    extractTextFromEpub?: (file: File) => Promise<string>
) => {
    if (isFile && (!input || !(input instanceof File))) return;
    if (!isFile && (!input || typeof input !== "string" || !input.trim()))
        return;

    setIsProcessing(true);
    try {
        let textContent = "";
        if (isFile && extractTextFromEpub) {
            textContent = await extractTextFromEpub(input as File);
        } else {
            textContent = input as string;
        }

        const wordsResponse = await extractWords(textContent);
        const words = await wordsResponse.json();
        const response = await addEntriesToList(words);
        const result = await response.json();

        const sortedWords = result.sort(
            (a: { frequency: number }, b: { frequency: number }) =>
                b.frequency - a.frequency
        );
        if (onAnalysisComplete) {
            onAnalysisComplete(sortedWords);
        }
    } catch (error) {
        console.error("Error processing input:", error);
    } finally {
        setTimeout(() => {
            setIsProcessing(false);
        }, 1000);
    }
};
