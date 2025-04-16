"use client";

import { useState, useEffect } from "react";
import WordFrequencyApp from "./components/analyze/WordFrequencyApp";
import EpubFrequencyApp from "./components/analyze/EpubFrequencyApp";
import ReviewsPage from "./components/Reviews";
import AuthPage from "./components/authentication/AuthPage";
import Header from "./components/Header";
import { getUser } from "./services/AuthenticationService";

const App = () => {
    const [activeTab, setActiveTab] = useState("text");
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const handleLogin = async () => {
        try {
            const response = await getUser();
            if (response && response.ok) {
                const loggedInUser = await response.json();
                setUser(loggedInUser);
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
        } catch (error) {
            console.error("Logout failed:", error);
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
                }
            })
            .catch((e) => {
                setUser(null);
                console.log("User not logged in:", e);
            })
            .finally(() => setLoading(false));
    }, []);

    const renderActiveComponent = () => {
        switch (activeTab) {
            case "text":
                return (
                    <>
                        <WordFrequencyApp />
                    </>
                );
            case "epub":
                return (
                    <>
                        <EpubFrequencyApp />
                    </>
                );
            case "reviews":
                return (
                    <>
                        <ReviewsPage />
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
