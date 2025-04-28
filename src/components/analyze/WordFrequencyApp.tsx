import { useState } from "react";
import { wordAnalyzer } from "../../utils/WordAnalyzer";
import AnalyzeButton from "./AnalyzeButton";
import { FrequencyPageProps } from "../../types";
import BaseCardLayout from "../BaseCard";

const WordFrequencyApp: React.FC<FrequencyPageProps> = ({
    onAnalysisComplete,
}) => {
    const [inputText, setInputText] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const handleButtonClick = async () => {
        await wordAnalyzer(
            inputText,
            false,
            setIsProcessing,
            onAnalysisComplete
        );
    };

    const icon = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-purple-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
    );

    return (
        <BaseCardLayout title="Paragraph Frequency Analyzer" icon={icon}>
            <div className="bg-white dark:bg-[#2C2C3C] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-[#32324A]">
                <label
                    htmlFor="text-input"
                    className="block text-sm font-medium text-gray-700 dark:text-[#F8F8FC] mb-2"
                >
                    Enter your text:
                </label>
                <textarea
                    id="text-input"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Paste a paragraph, article, or any text you want to analyze..."
                    rows={8}
                    className="w-full px-4 py-3 text-gray-700 dark:text-[#F8F8FC] border border-gray-200 dark:border-[#32324A] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y transition duration-200 bg-gray-50 dark:bg-[#2A2A3A] hover:bg-white dark:hover:bg-[#32324A]"
                />

                <div className="flex items-center justify-between mt-3 flex-row-reverse">
                    <button
                        onClick={() => setInputText("")}
                        className="text-sm text-purple-600 hover:text-purple-800 hover:underline transition duration-200 flex items-center gap-1"
                        disabled={!inputText}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                        Clear text
                    </button>
                </div>
            </div>

            <div className="flex justify-center">
                <button
                    onClick={handleButtonClick}
                    disabled={!inputText.trim() || isProcessing}
                    className="flex items-center justify-center bg-purple-600 hover:bg-purple-700 focus:ring-4 focus:ring-purple-300 text-white font-medium rounded-lg px-8 py-4 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 shadow-md"
                >
                    {isProcessing ? (
                        <>
                            <svg
                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                            Processing...
                        </>
                    ) : (
                        <AnalyzeButton />
                    )}
                </button>
            </div>
        </BaseCardLayout>
    );
};

export default WordFrequencyApp;
