"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
    addWordFlashcard,
    addWordsBulkToFlashcard,
} from "../../services/FlashcardService";
import type { PopupProps } from "../../types";

const Popup: React.FC<PopupProps> = ({
    title,
    items,
    onClose,
    initialExistingWords,
    onAddNewWord,
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [isVisible, setIsVisible] = useState(false);
    const [existingWords, setExistingWords] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hideKnownWords, setHideKnownWords] = useState(false);
    const [message, setMessage] = useState<{
        text: string;
        type: "success" | "error" | "info";
    } | null>(null);
    const itemsPerPage = 20;

    useEffect(() => {
        onAddNewWord(existingWords);
    }, [existingWords, onAddNewWord]);

    useEffect(() => {
        setIsVisible(true);

        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                handleClose();
            }
        };

        document.addEventListener("keydown", handleEscKey);

        setExistingWords(initialExistingWords || []);

        return () => {
            document.removeEventListener("keydown", handleEscKey);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const resetScrollPosition = () => {
        const scrollableDiv = document.getElementById("scrollableDiv");
        if (scrollableDiv) {
            scrollableDiv.scrollTop = 0;
        }
    };

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation to complete
    };

    const handleAddWord = async (word: string, meanings: string[]) => {
        setIsLoading(true);
        try {
            const response = await addWordFlashcard(word, meanings);
            if (response && response.ok) {
                setMessage({
                    text: `Added "${word}" to flashcards`,
                    type: "success",
                });
                setExistingWords((prev) => [...prev, word.toLowerCase()]);
            } else {
                setMessage({ text: `Failed to add "${word}"`, type: "error" });
            }
        } catch (error) {
            console.error("Error adding word:", error);
            setMessage({ text: `Error adding "${word}"`, type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddAllNewWords = async () => {
        setIsLoading(true);
        try {
            const newWords = items
                .filter(
                    (item) =>
                        !existingWords.includes(item.word.toLowerCase()) &&
                        item.meanings &&
                        item.meanings.length > 0
                )
                .map((item) => item.word);

            const newMeanings = items
                .filter(
                    (item) =>
                        !existingWords.includes(item.word.toLowerCase()) &&
                        item.meanings &&
                        item.meanings.length > 0
                )
                .map((item) => item.meanings);

            if (newWords.length === 0) {
                setMessage({ text: "No new words to add", type: "info" });
                setIsLoading(false);
                return;
            }

            const response = await addWordsBulkToFlashcard(
                newWords,
                newMeanings
            );
            if (response && response.ok) {
                setMessage({
                    text: `Added ${newWords.length} new words to flashcards`,
                    type: "success",
                });
                setExistingWords((prev) => [
                    ...prev,
                    ...newWords.map((w) => w.toLowerCase()),
                ]);
            } else {
                setMessage({ text: "Failed to add words", type: "error" });
            }
        } catch (error) {
            console.error("Error adding words in bulk:", error);
            setMessage({ text: "Error adding words", type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    const filteredItems = items.filter((item) => {
        const matchesSearch = item.word
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const isExisting = existingWords.includes(item.word.toLowerCase());

        // If hideKnownWords is checked, exclude existing words
        if (hideKnownWords && isExisting) {
            return false;
        }

        return matchesSearch && item.meanings && item.meanings.length > 0;
    });

    const pageCount = Math.ceil(filteredItems.length / itemsPerPage);
    const paginatedItems = filteredItems.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    const isWordInDatabase = (word: string) => {
        return existingWords.includes(word.toLowerCase());
    };

    return (
        <div
            className={`fixed inset-0 bg-gray-900 bg-opacity-75 dark:bg-black dark:bg-opacity-80 flex justify-center items-center z-50 p-4 transition-opacity duration-300 ${
                isVisible ? "opacity-100" : "opacity-0"
            }`}
        >
            <div
                className={`bg-white dark:bg-[#1E1E2A] rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col transition-transform duration-300  ${
                    isVisible ? "scale-100" : "scale-95"
                }`}
            >
                <div className="p-5 border-b border-gray-200 dark:border-[#32324A] rounded-t-xl flex justify-between items-center bg-gradient-to-r from-purple-50 to-white dark:from-[#121218] dark:to-[#1E1E2A]">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-[#F8F8FC] flex items-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-2 text-purple-600"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                            <rect
                                x="8"
                                y="2"
                                width="8"
                                height="4"
                                rx="1"
                                ry="1"
                            ></rect>
                        </svg>
                        {title}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-[#A0A0B8] dark:hover:text-[#F8F8FC] focus:outline-none hover:bg-gray-100 dark:hover:bg-[#2A2A3A] rounded-full p-2 transition-colors duration-200"
                        aria-label="Close"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                            ></path>
                        </svg>
                    </button>
                </div>

                <div className="p-5 border-b border-gray-200 dark:border-[#32324A] bg-white dark:bg-[#1E1E2A]">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPage(1);
                            }}
                            placeholder="Search words..."
                            className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 dark:border-[#32324A] dark:bg-[#2A2A3A] dark:text-[#F8F8FC] dark:placeholder-[#A0A0B8] focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-200"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg
                                className="w-5 h-5 text-gray-400 dark:text-[#A0A0B8]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                ></path>
                            </svg>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-4 flex flex-wrap gap-2">
                        <button
                            onClick={handleAddAllNewWords}
                            disabled={isLoading}
                            className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <svg
                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-2"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                                    <polyline points="7 3 7 8 15 8"></polyline>
                                </svg>
                            )}
                            Add All New Words
                        </button>

                        {/* hideKnownWords checkbox */}
                        <label className="ml-auto inline-flex items-center space-x-2 text-sm text-gray-700 dark:text-[#A0A0B8] cursor-pointer hover:text-purple-700 dark:hover:text-purple-400 transition-colors duration-200 bg-white dark:bg-[#2A2A3A] px-3 py-1.5 rounded-md border border-gray-200 dark:border-[#32324A]">
                            <input
                                type="checkbox"
                                checked={hideKnownWords}
                                onChange={(e) => {
                                    setHideKnownWords(e.target.checked);
                                    setPage(1);
                                    resetScrollPosition();
                                }}
                                className="form-checkbox h-4 w-4 text-purple-600 dark:text-purple-400 rounded focus:ring-purple-500 border-gray-300 dark:border-gray-600"
                            />
                            <span>Hide existing flashcards</span>
                        </label>

                        {message && (
                            <div
                                className={`ml-auto px-4 py-2 text-sm rounded-md ${
                                    message.type === "success"
                                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                        : message.type === "error"
                                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                        : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                }`}
                            >
                                {message.text}
                            </div>
                        )}
                    </div>
                </div>

                <div
                    className="flex-1 p-5 overflow-y-auto bg-gray-50 dark:bg-[#121218]"
                    id="scrollableDiv"
                >
                    {paginatedItems.length > 0 ? (
                        <ul className="space-y-1">
                            {paginatedItems.map((wordObj, index) => {
                                const isInDatabase = isWordInDatabase(
                                    wordObj.word
                                );
                                return (
                                    <li
                                        key={index}
                                        className={`py-4 px-4 hover:bg-white dark:hover:bg-[#1E1E2A] rounded-lg transition-colors duration-150 ${
                                            isInDatabase
                                                ? "border-l-4 border-purple-400 dark:border-purple-600"
                                                : ""
                                        }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <h3
                                                className={`text-lg font-semibold ${
                                                    isInDatabase
                                                        ? "text-purple-700 dark:text-purple-400"
                                                        : "text-gray-800 dark:text-[#F8F8FC]"
                                                }`}
                                            >
                                                {wordObj.word}
                                                {isInDatabase && (
                                                    <span className="ml-2 text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 px-2 py-1 rounded-full">
                                                        In Flashcards
                                                    </span>
                                                )}
                                            </h3>
                                            <div className="flex items-center space-x-2">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-3.5 w-3.5 mr-1"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M18 10h-4V6"></path>
                                                        <circle
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                        ></circle>
                                                    </svg>
                                                    {wordObj.frequency}
                                                </span>
                                                {!isInDatabase && (
                                                    <button
                                                        onClick={() =>
                                                            handleAddWord(
                                                                wordObj.word,
                                                                wordObj.meanings
                                                            )
                                                        }
                                                        disabled={isLoading}
                                                        className="inline-flex items-center p-1.5 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/40 dark:hover:bg-purple-800/60 text-purple-700 dark:text-purple-300 rounded-full transition-colors duration-200"
                                                        title="Add to flashcards"
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
                                                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                                            <line
                                                                x1="12"
                                                                y1="9"
                                                                x2="12"
                                                                y2="15"
                                                            ></line>
                                                            <line
                                                                x1="9"
                                                                y1="12"
                                                                x2="15"
                                                                y2="12"
                                                            ></line>
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-3 bg-white dark:bg-[#2A2A3A] p-3 rounded-lg border border-gray-100 dark:border-[#32324A]">
                                            <h4 className="text-sm font-medium text-gray-500 dark:text-[#A0A0B8] mb-2 flex items-center">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-3.5 w-3.5 mr-1"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path d="M12 20V10"></path>
                                                    <path d="M18 20V4"></path>
                                                    <path d="M6 20v-6"></path>
                                                </svg>
                                                Meanings:
                                            </h4>
                                            <ul className="list-disc pl-5 space-y-1">
                                                {wordObj.meanings.map(
                                                    (meaning, i) => (
                                                        <li
                                                            key={i}
                                                            className="text-gray-700 dark:text-[#F8F8FC] text-sm"
                                                        >
                                                            {meaning}
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-gray-500 dark:text-[#A0A0B8] bg-white dark:bg-[#1E1E2A] rounded-lg border border-gray-100 dark:border-[#32324A] p-8">
                            <svg
                                className="w-12 h-12 mb-4 text-gray-300 dark:text-[#32324A]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                ></path>
                            </svg>
                            <p className="text-xl font-medium mb-2 dark:text-[#F8F8FC]">
                                No matching words found
                            </p>
                            <p className="text-sm text-gray-400 dark:text-[#A0A0B8] text-center">
                                Try adjusting your search or use different text
                            </p>
                        </div>
                    )}
                </div>

                {filteredItems.length > itemsPerPage && (
                    <div className="p-5 border-t border-gray-200 dark:border-[#32324A] flex items-center justify-between bg-white dark:bg-[#1E1E2A]">
                        <div className="text-sm text-gray-500 dark:text-[#A0A0B8]">
                            Showing {(page - 1) * itemsPerPage + 1} to{" "}
                            {Math.min(
                                page * itemsPerPage,
                                filteredItems.length
                            )}{" "}
                            of {filteredItems.length} results
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => {
                                    setPage((p) => Math.max(1, p - 1));
                                    resetScrollPosition();
                                }}
                                disabled={page === 1}
                                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#2A2A3A] text-gray-700 dark:text-[#F8F8FC] disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-[#32324A] transition-colors duration-200 flex items-center"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-3.5 w-3.5 mr-1"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <polyline points="15 18 9 12 15 6"></polyline>
                                </svg>
                                Previous
                            </button>
                            <button
                                onClick={() => {
                                    setPage((p) => Math.min(pageCount, p + 1));
                                    resetScrollPosition();
                                }}
                                disabled={page === pageCount}
                                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#2A2A3A] text-gray-700 dark:text-[#F8F8FC] disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-[#32324A] transition-colors duration-200 flex items-center"
                            >
                                Next
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-3.5 w-3.5 ml-1"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                <div className="p-5 border-t border-gray-200 rounded-b-xl dark:border-[#32324A] flex justify-end bg-gradient-to-r from-white to-purple-50 dark:from-[#1E1E2A] dark:to-[#121218]">
                    <button
                        onClick={handleClose}
                        className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 focus:ring-4 focus:ring-purple-300 text-white font-medium rounded-lg transition duration-300 flex items-center"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Popup;
