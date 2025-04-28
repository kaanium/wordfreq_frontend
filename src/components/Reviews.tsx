"use client";

import type React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    reviewFlashcard,
    updateReviewCount,
} from "../services/FlashcardService";
import type {
    Backendword,
    ReviewsPageProps,
    TapSafeDivProps,
    CompleteStateProps,
    FlashcardContentProps,
    CardStateProps,
    StatBlockProps,
} from "../types";
import BaseCardLayout from "./BaseCard";
import { Icons } from "../icons/ReviewIcons";

const TapSafeDiv: React.FC<TapSafeDivProps> = ({
    onClick,
    children,
    ...props
}) => {
    const isLockedRef = useRef(false);
    const isExecutingRef = useRef(false);
    const tapStartTimeRef = useRef<number | null>(null);
    const wasTouchRef = useRef(false);

    const handleTapStart = useCallback(
        (e: React.TouchEvent | React.MouseEvent) => {
            if (e.type === "touchstart") {
                wasTouchRef.current = true;
            } else if (wasTouchRef.current && e.type === "mousedown") {
                return;
            }

            tapStartTimeRef.current = Date.now();
        },
        []
    );

    const handleTapEnd = useCallback(
        (e: React.TouchEvent | React.MouseEvent) => {
            if (e.type === "mouseup" && wasTouchRef.current) {
                return;
            }

            const tapStart = tapStartTimeRef.current;

            if (
                (tapStart && Date.now() - tapStart > 200) ||
                ("button" in e && e.button !== 0)
            ) {
                e.preventDefault?.();
                return;
            }

            if (isExecutingRef.current) {
                isLockedRef.current = true;
                return;
            }

            isExecutingRef.current = true;

            setTimeout(() => {
                if (!isLockedRef.current) {
                    onClick();
                } else {
                    isLockedRef.current = false;
                }
                isExecutingRef.current = false;
            }, 250);
        },
        [onClick]
    );

    return (
        <div
            onMouseDown={handleTapStart}
            onTouchStart={handleTapStart}
            onMouseUp={handleTapEnd}
            onTouchEnd={handleTapEnd}
            onContextMenu={(e) => e.preventDefault()}
            className="cursor-pointer bg-white dark:bg-[#2C2C3C] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-[#32324A]"
            {...props}
        >
            {children}
        </div>
    );
};

const StatBlock: React.FC<StatBlockProps> = ({ value, label, color }) => (
    <div className="text-center">
        <div className={`text-3xl font-bold ${color}`}>{value}</div>
        <div className="text-sm text-gray-500 dark:text-[#A0A0B8]">{label}</div>
    </div>
);

const CardState: React.FC<CardStateProps> = ({
    icon,
    title,
    description,
    children,
}) => (
    <div className="bg-white dark:bg-[#1E1E2A] rounded-2xl p-8 text-center">
        <div className="w-20 h-20 bg-purple-100 dark:bg-[#2A2A3A] rounded-full flex items-center justify-center mx-auto mb-6">
            {icon}
        </div>
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-[#F8F8FC]">
            {title}
        </h2>
        {description && (
            <p className="text-gray-600 dark:text-[#A0A0B8] mb-6">
                {description}
            </p>
        )}
        {children}
    </div>
);

const EmptyState = () => (
    <CardState
        icon={<Icons.Empty />}
        title="No Words to Review"
        description="You don't have any words due for review today. Check back later or add more words to your flashcards."
    />
);

const CompleteState: React.FC<CompleteStateProps> = ({ stats, onReset }) => {
    const retention =
        stats.correct > 0
            ? (
                  (stats.correct / (stats.correct + stats.incorrect)) *
                  100
              ).toFixed(2)
            : "0";

    return (
        <CardState icon={<Icons.Complete />} title="Review Complete!">
            <div className="flex justify-center space-x-8 mb-6">
                <StatBlock
                    value={stats.correct}
                    label="Correct"
                    color="text-green-500"
                />
                <StatBlock
                    value={stats.incorrect}
                    label="Incorrect"
                    color="text-red-500"
                />
                <StatBlock
                    value={`${retention}%`}
                    label="Retention"
                    color="text-purple-500"
                />
            </div>

            <button
                onClick={onReset}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition duration-300 shadow-md hover:shadow-lg flex items-center mx-auto"
            >
                <Icons.Reset />
                Check Again
            </button>
        </CardState>
    );
};

const FlashcardContent: React.FC<FlashcardContentProps> = ({
    word,
    isFlipped,
    onFlip,
    handleReview,
    hasFlipped,
}) => (
    <>
        <TapSafeDiv onClick={() => onFlip(!isFlipped)}>
            <div className="text-center mb-4 relative">
                <div
                    className={`text-s text-purple-700 dark:text-purple-400 mb-1 font-normal transition-opacity duration-200 ${
                        isFlipped && word.reading ? "opacity-100" : "opacity-0"
                    }`}
                >
                    {word.reading}
                </div>
                <h3 className="text-3xl font-bold text-purple-700 dark:text-purple-400">
                    {word.key}
                </h3>
            </div>

            <div className="min-h-[80px] flex flex-col justify-center">
                <AnimatePresence mode="wait">
                    {!isFlipped ? (
                        <motion.div
                            key="prompt"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-center"
                        >
                            <p className="text-gray-500 dark:text-[#A0A0B8] text-sm">
                                Click to see meanings
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="meanings"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="w-full"
                        >
                            <h4 className="text-sm font-medium text-gray-500 dark:text-[#A0A0B8] mb-3 flex items-center">
                                <Icons.Meanings />
                                Meanings
                            </h4>
                            <ul className="space-y-2">
                                {word.meanings.map(
                                    (meaning: string, index: number) => (
                                        <motion.li
                                            key={index}
                                            initial={{
                                                opacity: 0,
                                                y: 10,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                            }}
                                            transition={{
                                                delay: index * 0.05,
                                            }}
                                            className="text-gray-700 dark:text-[#F8F8FC] bg-gray-50 dark:bg-[#2A2A3A] p-2 rounded-md border border-gray-200 dark:border-[#32324A] shadow-sm"
                                        >
                                            {meaning}
                                        </motion.li>
                                    )
                                )}
                            </ul>
                            <p className="text-gray-500 dark:text-[#A0A0B8] text-sm text-center mt-4">
                                Click to hide meanings
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </TapSafeDiv>

        <div className="flex justify-center">
            {hasFlipped && (
                <div className="flex space-x-4 w-full">
                    <button
                        onClick={() => handleReview(word.key, false)}
                        className="flex-1 flex items-center justify-center bg-gray-200 dark:bg-[#32324A] hover:bg-gray-300 dark:hover:bg-[#2F2F47] text-gray-800 dark:text-[#F8F8FC] font-medium rounded-lg px-6 py-4 transition duration-300 transform hover:-translate-y-1"
                    >
                        <Icons.Again />
                        Again
                    </button>
                    <button
                        onClick={() => handleReview(word.key, true)}
                        className="flex-1 flex items-center justify-center bg-purple-600 hover:bg-purple-700 focus:ring-4 focus:ring-purple-300 text-white font-medium rounded-lg px-6 py-4 transition duration-300 transform hover:-translate-y-1 shadow-md"
                    >
                        <Icons.Good />
                        Good
                    </button>
                </div>
            )}
        </div>
    </>
);

function updateCardState(
    currentCard: Backendword,
    isCorrect: boolean,
    words: Backendword[]
) {
    if (!isCorrect) {
        if (
            currentCard.state === "learned" ||
            currentCard.state === "relearning2"
        ) {
            currentCard.state = "relearning1";
            words.push(currentCard);
        } else if (currentCard.state === "relearning1") {
            // Stay in relearning1 and keep the card in the queue
            words.push(currentCard);
        }
    } else {
        if (currentCard.state === "relearning1") {
            currentCard.state = "relearning2";
            words.push(currentCard);
        } else {
            updateRemainingWordCount();
        }
        // Correct answers for "learned" or "relearning2" require no action
    }
}

const updateRemainingWordCount = async () => {
    document.querySelectorAll("#reviewCount").forEach((el) => {
        const count = Number.parseInt(el.textContent || "0", 10);
        el.textContent = (count - 1).toString();
        updateReviewCount(count - 1);
    });
};

export default function ReviewsPage({
    words,
    onReviewComplete,
}: ReviewsPageProps) {
    const [reviewWords, setReviewWords] = useState<Backendword[]>(() => words);
    const [isFlipped, setIsFlipped] = useState(false);
    const [reviewComplete, setReviewComplete] = useState(false);
    const [reviewStats, setReviewStats] = useState({
        correct: 0,
        incorrect: 0,
    });
    const [hasFlipped, setHasFlipped] = useState(false);

    useEffect(() => {
        if (words && words.length > 0) {
            setReviewWords(words);
            setReviewComplete(false);
            setReviewStats({ correct: 0, incorrect: 0 });
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
        try {
            await reviewFlashcard(word, isCorrect);

            updateReviewStats(isCorrect);

            const [currentCard] = reviewWords.splice(0, 1);

            updateCardState(currentCard, isCorrect, reviewWords);

            setReviewWords([...reviewWords]);
            setIsFlipped(false);
            setHasFlipped(false);

            if (reviewWords.length === 0) {
                setReviewComplete(true);
            }
        } catch (error) {
            console.error("Error reviewing word:", error);
        }
    };

    const resetReview = () => {
        setReviewComplete(false);
        setReviewStats({ correct: 0, incorrect: 0 });
        onReviewComplete();
    };

    const badgeContent =
        reviewWords.length > 0 ? (
            <>
                <Icons.ReviewCount />
                {reviewWords.length}
            </>
        ) : null;

    const CardWrapper: React.FC<{ children: React.ReactNode }> = ({
        children,
    }) => (
        <div className="container mx-auto max-w-4xl">
            <div className="max-w-4xl mx-auto bg-white dark:bg-[#1E1E2A] rounded-2xl shadow-lg overflow-hidden p-8 my-8 border border-gray-100 dark:border-[#32324A]">
                {children}
            </div>
        </div>
    );

    const renderContent = () => {
        if (reviewWords.length === 0 && !reviewComplete) {
            return (
                <CardWrapper>
                    <EmptyState />
                </CardWrapper>
            );
        } else if (reviewComplete) {
            return (
                <CardWrapper>
                    <CompleteState stats={reviewStats} onReset={resetReview} />;
                </CardWrapper>
            );
        } else {
            return (
                <div className="container mx-auto max-w-4xl">
                    <BaseCardLayout
                        title="Vocabulary Review"
                        icon={<Icons.Vocabulary />}
                        badgeContent={badgeContent}
                    >
                        <FlashcardContent
                            word={reviewWords[0]}
                            isFlipped={isFlipped}
                            onFlip={handleInitialFlip}
                            handleReview={handleReview}
                            hasFlipped={hasFlipped}
                        />
                    </BaseCardLayout>
                </div>
            );
        }
    };

    return renderContent();
}
