"use client";

import { useState, useEffect } from "react";
import WordFrequencyApp from "./components/analyze/WordFrequencyApp";
import EpubFrequencyApp from "./components/analyze/EpubFrequencyApp";
import ReviewsPage from "./components/Reviews";
import Popup from "./components/analyze/AnalyzePopup";
import AuthPage from "./components/authentication/AuthPage";
import Header from "./components/Header";
import { getUser } from "./services/AuthenticationService";
import {
    getReviewWordsFromFlashcard,
    getWordsFromFlashcard,
} from "./services/FlashcardService";
import type { FlashcardWord } from "./types";

const App = () => {
    const [activeTab, setActiveTab] = useState("text");
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [reviewWords, setReviewWords] = useState<FlashcardWord[]>([]);
    const [reviewCount, setReviewCount] = useState(0);
    const [lastAnalyzedWords, setLastAnalyzedWords] = useState<any[]>([]);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [existingWords, setExistingWords] = useState<string[]>([]);

    const enableDarkMode = () => {
        document.body.classList.add("dark");
        localStorage.setItem("theme", "dark");
    };
    const disableDarkMode = () => {
        document.body.classList.remove("dark");
        localStorage.setItem("theme", "light");
    };

    const handleAddNewWord = (words: string[]) => {
        setExistingWords(words);
    }

    const detectColorScheme = () => {
        let theme: string | null = "light";

        if (localStorage.getItem("theme")) {
            theme = localStorage.getItem("theme");
        } else if (
            window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches
        ) {
            theme = "dark";
        }

        theme === "dark" ? enableDarkMode() : disableDarkMode();
    };

    detectColorScheme();

    const handleLogin = async () => {
        try {
            const response = await getUser();
            if (response && response.ok) {
                const loggedInUser = await response.json();
                setUser(loggedInUser);
                setReviewCount(loggedInUser.reviewCount);
                fetchReviewWords();
            } else {
                console.error("Login failed:", response);
            }
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    const handleLogout = async () => {
        try {
            setUser(null);
            localStorage.removeItem("token");
            setReviewWords([]);
            setReviewCount(0);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const fetchReviewWords = async () => {
        try {
            const response = await getReviewWordsFromFlashcard();
            if (response) {
                const data = await response.json();
                if (data && data.length > 0) {
                    setReviewWords(data);
                    setReviewCount(data.length);
                } else {
                    setReviewWords([]);
                    setReviewCount(0);
                }
            }
        } catch (error) {
            console.error("Error fetching review words:", error);
            setReviewWords([]);
            setReviewCount(0);
        }
    };

    const fetchExistingWords = async () => {
        try {
            const response = await getWordsFromFlashcard();
            if (response) {
                const data = await response.json();
                if (data && data.length > 0) {
                    setExistingWords(
                        data.map((card: any) => card.key.toLowerCase())
                    );
                }
            }
        } catch (error) {
            console.error("Error fetching existing words:", error);
        }
    };

    const handleOpenLastAnalysis = () => {
        if (lastAnalyzedWords.length > 0) {
            setIsPopupVisible(true);
        }
    };

    const handleAnalyzeComplete = async (words: any[]) => {
        await fetchExistingWords();
        setLastAnalyzedWords(words);
        setIsPopupVisible(true);
    }

    useEffect(() => {
        getUser()
            .then((response) => {
                if (response && response.ok) {
                    return response.json();
                } else {
                    throw new Error(
                        `Error: ${response?.status} ${response?.statusText}`
                    );
                }
            })
            .then((loggedInUser) => {
                if (loggedInUser) {
                    setUser(loggedInUser);
                    setReviewCount(loggedInUser.reviewCount);
                    fetchReviewWords();
                }
            })
            .catch((e) => {
                setUser(null);
                console.log("User not logged in:", e);
            })
            .finally(() => setLoading(false));
    }, []);

    // Refresh review words when switching to reviews tab
    useEffect(() => {
        if (activeTab === "reviews" && user) {
            fetchReviewWords();
        }
    }, [activeTab, user]);

    const renderActiveComponent = () => {
        switch (activeTab) {
            case "text":
                return (
                    <>
                        <WordFrequencyApp
                            onAnalysisComplete={handleAnalyzeComplete}
                        />
                    </>
                );
            case "epub":
                return (
                    <>
                        <EpubFrequencyApp
                            onAnalysisComplete={handleAnalyzeComplete}
                        />
                    </>
                );
            case "reviews":
                return (
                    <>
                        <ReviewsPage
                            words={reviewWords}
                            onReviewComplete={fetchReviewWords}
                        />
                    </>
                );
            default:
                return (
                    <WordFrequencyApp
                        onAnalysisComplete={handleAnalyzeComplete}
                    />
                );
        }
    };

    if (loading)
        return (
            <div className="flex justify-center items-center h-screen bg-gradient-to-b dark:from-[#121218] dark:to-[#121218] from-gray-50 to-gray-100">
                <div
                    className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"
                    role="status"
                    aria-label="Loading"
                ></div>
            </div>
        );

    return (
        <div>
            {user ? (
                <div className="min-h-screen bg-gradient-to-b dark:from-[#121218] dark:to-[#121218] from-gray-50 to-gray-100">
                    <Header
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        onLogout={handleLogout}
                        enableDarkMode={enableDarkMode}
                        disableDarkMode={disableDarkMode}
                        reviewCount={reviewCount}
                    />
                    <main className="py-8 px-4">
                        <div className="container mx-auto">
                            {renderActiveComponent()}
                        </div>
                    </main>
                    {user &&
                        lastAnalyzedWords.length > 0 &&
                        !isPopupVisible && (
                            <button
                                onClick={handleOpenLastAnalysis}
                                className="fixed bottom-6 right-6 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-3 shadow-lg transition-all duration-300 flex items-center justify-center z-40"
                                title="Show last analysis"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                                </svg>
                            </button>
                        )}
                    {isPopupVisible && (
                        <Popup
                            title="Word Analysis"
                            items={lastAnalyzedWords}
                            onClose={() => setIsPopupVisible(false)}
                            initialExistingWords={existingWords}
                            onAddNewWord={handleAddNewWord}
                        />
                    )}
                </div>
            ) : (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-b dark:from-[#121218] dark:to-[#121218] from-gray-50 to-gray-100 py-12 px-4">
                    <div className="max-w-md w-full">
                        <AuthPage onLogin={handleLogin} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
