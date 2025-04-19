import type React from "react";
import { useState } from "react";
import ePub from "epubjs";
import AnalyzeButton from "./AnalyzeButton";
import { wordAnalyzer } from "../../utils/WordAnalyzer";
import { FrequencyPageProps, SpineItem } from "../../types";

const EpubFrequencyApp: React.FC<FrequencyPageProps> = ({
    onAnalysisComplete,
}) => {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setFile(event.target.files[0]);
        }
    };

    const extractTextFromEpub = async (epubFile: File): Promise<string> => {
        const arrayBuffer = await epubFile.arrayBuffer();
        const book = ePub(arrayBuffer);

        await book.ready;

        const spineItems = book.spine;
        let fullText = "";

        const promises: Promise<void>[] = [];
        spineItems.each((item: SpineItem) => {
            const loadFn = book.load.bind(book) as (
                url: string
            ) => Promise<Document>;
            const p = item
                .load(loadFn)
                .then((loadedDoc: Document) => {
                    const text = loadedDoc?.textContent || "";
                    fullText += text + "\n";
                    item.unload();
                })
                .catch((err: unknown) => {
                    console.warn("Failed to load item:", err);
                });

            promises.push(p);
        });

        await Promise.all(promises);
        return fullText;
    };

    const handleProcessFile = async () => {
        await wordAnalyzer(
            file,
            true,
            setIsProcessing,
            onAnalysisComplete,
            extractTextFromEpub
        );
    };

    return (
        <div className="max-w-4xl mx-auto bg-gradient-to-b from-white to-gray-50 dark:from-[#1E1E2A] dark:to-[#1E1E2A] rounded-2xl shadow-lg overflow-hidden p-8 my-8 border border-gray-100 dark:border-[#32324A]">
            <h1 className="text-3xl font-extrabold text-center mb-8 text-gray-800 dark:text-[#F8F8FC] flex items-center justify-center gap-2">
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
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
                ePub Frequency Analyzer
            </h1>

            <div className="space-y-6">
                <div className="flex flex-col items-center bg-white dark:bg-[#1E1E2A] p-8 rounded-xl shadow-sm border border-gray-100 dark:border-[#1E1E2A]">
                    <label className="w-full flex flex-col items-center px-6 py-8 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-[#32324A] dark:to-[#32324A] text-purple-700 rounded-xl shadow-sm tracking-wide border border-purple-200 dark:border-[#4f4f71] border-dashed cursor-pointer hover:bg-purple-100 dark:hover:bg-[#2A2A3A] transition duration-300 group">
                        <div className="relative">
                            <svg
                                className="w-10 h-10 mb-2 text-purple-500 group-hover:text-purple-600 transition-all duration-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                ></path>
                            </svg>
                            {file && (
                                <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                            )}
                        </div>
                        <span className="mt-2 text-base font-medium">
                            {file ? "Change ePub File" : "Select ePub File"}
                        </span>
                        <span className="text-sm text-purple-500 mt-1">
                            Drag and drop or click to browse
                        </span>
                        <input
                            type="file"
                            accept=".epub"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                    </label>

                    {file && (
                        <div className="mt-4 p-3 bg-purple-50 dark:bg-[#2A2A3A] rounded-lg border border-purple-100 dark:border-[#32324A] w-full">
                            <div className="flex items-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 text-purple-600 mr-2"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <span className="text-sm font-medium text-gray-700 dark:text-[#F8F8FC] truncate flex-1">
                                    {file.name}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-[#A0A0B8] bg-white dark:bg-[#1E1E2A] px-2 py-1 rounded-full ml-2">
                                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={handleProcessFile}
                        disabled={!file || isProcessing}
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
                                Processing ePub...
                            </>
                        ) : (
                            <AnalyzeButton />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EpubFrequencyApp;
