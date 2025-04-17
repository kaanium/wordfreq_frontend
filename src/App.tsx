import { useState, useEffect } from "react";
import WordFrequencyApp from "./components/analyze/WordFrequencyApp";
import EpubFrequencyApp from "./components/analyze/EpubFrequencyApp";
import ReviewsPage from "./components/Reviews";
import AuthPage from "./components/authentication/AuthPage";
import Header from "./components/Header";
import { getUser } from "./services/AuthenticationService";
import { getWordsFromFlashcard } from "./services/FlashcardService";

interface FlashcardWord {
    id: string;
    key: string;
    meanings: string[];
    nextReview: string;
    interval: number;
}

const App = () => {
    const [activeTab, setActiveTab] = useState("text");
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [reviewWords, setReviewWords] = useState<FlashcardWord[]>([]);
    const [reviewCount, setReviewCount] = useState(0);

    const handleLogin = async () => {
        try {
            const response = await getUser();
            if (response && response.ok) {
                const loggedInUser = await response.json();
                setUser(loggedInUser);
                fetchReviewWords(); // Fetch review words after login
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
            const response = await getWordsFromFlashcard();
            if (response) {
                const data = await response.json();
                if (data && data.length > 0) {
                    const today = new Date();
                    const dueWords = data.filter((word: FlashcardWord) => {
                        const reviewDate = new Date(word.nextReview);
                        return reviewDate <= today;
                    });
                    setReviewWords(dueWords);
                    setReviewCount(dueWords.length);
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
                    fetchReviewWords(); // Fetch review words after confirming user is logged in
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
                        <h1 className="text-4xl font-extrabold text-center mb-8 text-gray-800">
                            Text Word Frequency Analyzer
                        </h1>
                        <WordFrequencyApp />
                    </>
                );
            case "epub":
                return (
                    <>
                        <h1 className="text-4xl font-extrabold text-center mb-8 text-gray-800">
                            ePub Word Frequency Analyzer
                        </h1>
                        <EpubFrequencyApp />
                    </>
                );
            case "reviews":
                return (
                    <>
                        <h1 className="text-4xl font-extrabold text-center mb-8 text-gray-800">
                            Reviews
                        </h1>
                        <ReviewsPage
                            words={reviewWords}
                            onReviewComplete={fetchReviewWords}
                        />
                    </>
                );
            default:
                return <WordFrequencyApp />;
        }
    };

    if (loading)
        return (
            <div className="flex justify-center items-center h-screen bg-gradient-to-b from-gray-50 to-gray-100">
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
                <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
                    <Header
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        onLogout={handleLogout}
                        reviewCount={reviewCount}
                    />
                    <main className="py-8 px-4">
                        <div className="container mx-auto">
                            {renderActiveComponent()}
                        </div>
                    </main>
                </div>
            ) : (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
                    <div className="max-w-md w-full">
                        <AuthPage onLogin={handleLogin} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
