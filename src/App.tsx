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
    };

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

    const closeModalOnClickOutside = (e: MouseEvent) => {
        const a = document.querySelector("#popup");
        if (a && !a.contains(e.target as Node) && e.button === 0) {
            setIsPopupVisible(false);
            document.removeEventListener("mousedown", closeModalOnClickOutside);
        }
    };

    const openModal = () => {
        setIsPopupVisible(true);
        document.addEventListener("mousedown", closeModalOnClickOutside);
    };

    const handleOpenLastAnalysis = () => {
        if (lastAnalyzedWords.length > 0) {
            openModal();
        }
    };

    const handleAnalyzeComplete = async (words: any[]) => {
        await fetchExistingWords();
        setLastAnalyzedWords(words);
        openModal();
    };

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
                                    <g
                                        id="SVGRepo_bgCarrier"
                                        strokeWidth="0"
                                    ></g>
                                    <g
                                        id="SVGRepo_tracerCarrier"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    ></g>
                                    <g id="SVGRepo_iconCarrier">
                                        {" "}
                                        <path
                                            d="M15.4862 9C15.5559 9.45126 15.5119 10.0367 15.3595 10.7008M15.3595 10.7008C14.647 13.8037 11.5647 18.6233 6.63251 19.4919C6.63251 19.4919 5.28441 19.7802 4.54266 19.0227C3.28198 17.7351 3.41266 14.3283 14.0208 11.0015C14.456 10.865 14.9075 10.764 15.3595 10.7008ZM15.3595 10.7008C19.6125 10.1058 23.899 12.8624 14.8758 21M7.53125 6C9 6 13 5.5 15.5352 5M11.5306 3C10.5 7 9.5 10.5 11.5306 19"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        ></path>{" "}
                                    </g>
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
