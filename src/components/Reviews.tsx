import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { reviewFlashcard } from "../services/FlashcardService";

interface FlashcardWord {
    id: string;
    key: string;
    meanings: string[];
    nextReview: string;
    interval: number;
}

interface ReviewsPageProps {
    words: FlashcardWord[];
    onReviewComplete: () => void;
}

export default function ReviewsPage({
    words,
    onReviewComplete,
}: ReviewsPageProps) {
    const [reviewWords, setReviewWords] = useState<FlashcardWord[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [loading, setLoading] = useState(false);
    const [direction, setDirection] = useState(0);
    const [reviewComplete, setReviewComplete] = useState(false);
    const [reviewStats, setReviewStats] = useState({
        correct: 0,
        incorrect: 0,
    });
    const [hasFlipped, setHasFlipped] = useState(false);
    const [correctCount, setCorrectCount] = useState<Record<string, number>>(
        {}
    );

    useEffect(() => {
        if (words && words.length > 0) {
            setReviewWords(words);
            setLoading(false);
            setReviewComplete(false);
            setReviewStats({ correct: 0, incorrect: 0 });
            setCurrentIndex(0);
            setIsFlipped(false);
            setHasFlipped(false);
            setCorrectCount({});
        }
    }, [words]);

    const handleInitialFlip = (condition: boolean) => {
        setIsFlipped(condition);
        setHasFlipped(true);
    };

    const updateReviewStats = (isCorrect: boolean) => {
        setReviewStats((prev) => ({
            correct: isCorrect ? prev.correct + 1 : prev.correct,
            incorrect: !isCorrect ? prev.incorrect + 1 : prev.incorrect,
        }));
    };

    const handleReview = async (word: string, isCorrect: boolean) => {
        setDirection(isCorrect ? 1 : -1);

        try {
            await reviewFlashcard(word, isCorrect);

            updateReviewStats(isCorrect);

            // const updatedQueue = [...words];
            // console.log("Updated Queue:", updatedQueue);
            // console.log("words:", words);
            const updatedCount = { ...correctCount };

            updatedCount[word] = isCorrect ? (updatedCount[word] || 0) + 1 : -1;

            const shouldGraduate = updatedCount[word] >= 1;

            const [currentCard] = words.splice(currentIndex, 1);

            if (!shouldGraduate) {
                words.push(currentCard);
            }

            setCorrectCount(updatedCount);
            setReviewWords(words);
            setIsFlipped(false);
            setHasFlipped(false);
            setDirection(0);

            if (words.length === 0) {
                setReviewComplete(true);
            } else {
                setCurrentIndex(Math.min(currentIndex, words.length - 1));
            }
        } catch (error) {
            console.error("Error reviewing word:", error);
        }
    };

    const resetReview = () => {
        setReviewComplete(false);
        setReviewStats({ correct: 0, incorrect: 0 });
        onReviewComplete(); // Fetch fresh words
    };

    if (loading) {
        return (
            <div className="container mx-auto max-w-4xl">
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-4xl">
            {reviewWords.length === 0 && !reviewComplete ? (
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                    <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-10 w-10 text-purple-600"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M12 8v4"></path>
                            <path d="M12 16h.01"></path>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">
                        No Words to Review
                    </h2>
                    <p className="text-gray-600 mb-6">
                        You don't have any words due for review today. Check
                        back later or add more words to your flashcards.
                    </p>
                </div>
            ) : reviewComplete ? (
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                    <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-10 w-10 text-purple-600"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">
                        Review Complete!
                    </h2>
                    <div className="flex justify-center space-x-8 mb-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-500">
                                {reviewStats.correct}
                            </div>
                            <div className="text-sm text-gray-500">Correct</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-red-500">
                                {reviewStats.incorrect}
                            </div>
                            <div className="text-sm text-gray-500">
                                Incorrect
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-purple-500">
                                {words.length}
                            </div>
                            <div className="text-sm text-gray-500">Cards</div>
                        </div>
                    </div>
                    <button
                        onClick={resetReview}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition duration-300 shadow-md hover:shadow-lg flex items-center mx-auto"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                            <path d="M3 3v5h5"></path>
                        </svg>
                        Check Again
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-50 to-white p-5 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 mr-2 text-purple-600"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <rect
                                    x="2"
                                    y="3"
                                    width="20"
                                    height="14"
                                    rx="2"
                                    ry="2"
                                ></rect>
                                <line x1="8" y1="21" x2="16" y2="21"></line>
                                <line x1="12" y1="17" x2="12" y2="21"></line>
                            </svg>
                            Vocabulary Review
                        </h2>
                        <div className="flex items-center">
                            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-1 rounded-full flex items-center">
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
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                                {currentIndex + 1}/{reviewWords.length}
                            </span>
                        </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={
                                    currentIndex + (isFlipped ? "-flipped" : "")
                                }
                                initial={{
                                    x: direction * 100,
                                    opacity: 0,
                                    rotateY: isFlipped ? 0 : 180,
                                }}
                                animate={{
                                    x: 0,
                                    opacity: 1,
                                    rotateY: isFlipped ? 180 : 0,
                                }}
                                exit={{
                                    x: -direction * 100,
                                    opacity: 0,
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 25,
                                }}
                                className="bg-gradient-to-b from-white to-purple-50 rounded-lg p-6 shadow-sm border border-purple-100 min-h-[200px] flex flex-col items-center justify-center cursor-pointer"
                                onClick={() => handleInitialFlip(!isFlipped)}
                            >
                                {!isFlipped ? (
                                    <div className="text-center">
                                        <h3 className="text-2xl font-bold text-purple-700 mb-3">
                                            {reviewWords[currentIndex].key}
                                        </h3>
                                        <p className="text-gray-500 text-sm mt-4">
                                            Click to see meanings
                                        </p>
                                    </div>
                                ) : (
                                    <div
                                        className="w-full"
                                        style={{ transform: "scaleX(-1)" }}
                                    >
                                        <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
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
                                        <ul className="space-y-2">
                                            {reviewWords[
                                                currentIndex
                                            ].meanings.map((meaning, index) => (
                                                <li
                                                    key={index}
                                                    className="text-gray-700 bg-white p-2 rounded-md border border-gray-100 shadow-sm"
                                                >
                                                    {meaning}
                                                </li>
                                            ))}
                                        </ul>
                                        <p className="text-gray-500 text-sm text-center mt-4">
                                            Click to see word
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Actions */}
                    <div className="p-5 bg-gray-50 border-t border-gray-200">
                        <div className="flex flex-col space-y-3">
                            {hasFlipped ? (
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() =>
                                            handleReview(
                                                reviewWords[currentIndex].key,
                                                false
                                            )
                                        }
                                        className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition duration-200 flex items-center justify-center"
                                    >
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
                                            <polyline points="1 4 1 10 7 10"></polyline>
                                            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                                        </svg>
                                        Again
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleReview(
                                                reviewWords[currentIndex].key,
                                                true
                                            )
                                        }
                                        className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition duration-200 flex items-center justify-center"
                                    >
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
                                            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                                        </svg>
                                        Good
                                    </button>
                                </div>
                            ) : (
                                <></>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
