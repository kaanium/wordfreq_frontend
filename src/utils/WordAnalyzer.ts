import { extractWords } from "../services/ParserService";
import { addMeaningsToList } from "../services/DictionaryService";

export const wordAnalyzer = async (
    input: string | File | null,
    isFile: boolean,
    setIsProcessing: (value: boolean) => void,
    setCommonWords: (words: { word: string; frequency: number; meanings: string[] }[]) => void,
    setShowPopup: (value: boolean) => void,
    extractTextFromEpub?: (file: File) => Promise<string>
) => {
    if (isFile && (!input || !(input instanceof File))) return;
    if (!isFile && (!input || typeof input !== "string" || !input.trim())) return;

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
        const response = await addMeaningsToList(words);
        const result = await response.json();

        const sortedWords = result.sort(
            (a: { frequency: number }, b: { frequency: number }) =>
                b.frequency - a.frequency
        );
        setCommonWords(sortedWords);
        setShowPopup(true);
    } catch (error) {
        console.error("Error processing input:", error);
    } finally {
        setIsProcessing(false);
    }
};