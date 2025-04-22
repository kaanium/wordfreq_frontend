// components/analyze/EpubViewer.tsx
import { useEffect, useRef, useState } from "react";
import ePub from "epubjs";
import type { Book, Rendition } from "epubjs";
import jsonDictionary from "../../assets/optimized-dictionary.json";
import { EpubViewerProps, OptimizedDictionary } from "../../types";
import { setupPopupDictionary } from "../../utils/EpubPopup";

let dictionary: OptimizedDictionary = jsonDictionary as OptimizedDictionary;

const EpubViewer = ({ file, onClose }: EpubViewerProps) => {
    const viewerRef = useRef<HTMLDivElement>(null);
    const cleanupRef = useRef<() => void>(() => {});
    const [book, setBook] = useState<Book | null>(null);
    const [rendition, setRendition] = useState<Rendition | null>(null);
    const [metadata, setMetadata] = useState<{
        title?: string;
        creator?: string;
    }>({});

    let currentPageIndex = 0;
    let paragraphsPerPage = 0;

    useEffect(() => {
        if (!file || !viewerRef.current) return;

        let isMounted = true;

        const initializeEpub = async (): Promise<void> => {
            try {
                const book = await loadBook();
                if (!isMounted) return;

                setBook(book);
                await loadMetadata(book);

                const rendition = createRendition(book);
                setupThemes(rendition);
                setupPopupDictionary(rendition, dictionary);

                await rendition.display();

                if (isMounted) {
                    setRendition(rendition);
                }

                document.addEventListener(
                    "mousedown",
                    closeModalOnClickOutside
                );

                cleanupRef.current = () => {
                    if (rendition) {
                        rendition.destroy();
                    }
                };
            } catch (error) {
                console.error("Error initializing EPUB:", error);
            }
        };

        const loadBook = async () => {
            const arrayBuffer = await file.arrayBuffer();
            return ePub(arrayBuffer);
        };

        const loadMetadata = async (book: any): Promise<void> => {
            await book.ready;
            const meta = await book.loaded.metadata;

            if (isMounted) {
                setMetadata({
                    title: meta.title,
                    creator: meta.creator,
                });
            }
        };

        const createRendition = (book: any): any => {
            return book.renderTo(viewerRef.current!, {
                width: "100%",
                height: "100%",
                spread: "none",
                flow: "paginated",
            });
        };

        const setupThemes = (rendition: any): void => {
            rendition.themes.register("custom", {
                body: {
                    "font-family": "'Georgia', 'Times New Roman', serif",
                    "line-height": "1.65",
                    color: "#2a2a2a",
                    background: "#fcfcf7",
                    "font-size": "19px !important",
                    padding: "20px !important",
                    direction: "ltr",
                    "text-rendering": "optimizeLegibility",
                    "-webkit-font-smoothing": "antialiased",
                },
                p: {
                    margin: "0 0 1.2em 0",
                    "text-align": "justify",
                },
                image: {
                    width: "100%",
                    height: "128vh",
                    "background-color": "black",
                    display: "block",
                    margin: "1.5em auto",
                    padding: "0",
                    "box-sizing": "border-box",
                },
                svg: {
                    "max-height": "none !important",
                },
                h1: {
                    "font-size": "1.8em",
                    "font-weight": "700",
                    margin: "1.2em 0 0.6em 0",
                    color: "#1a1a1a",
                },
                h2: {
                    "font-size": "1.5em",
                    "font-weight": "600",
                    margin: "1.1em 0 0.5em 0",
                    color: "#1a1a1a",
                },
                h3: {
                    "font-size": "1.3em",
                    "font-weight": "600",
                    margin: "1em 0 0.5em 0",
                    color: "#1a1a1a",
                },
                a: {
                    color: "#4a6da7",
                    "text-decoration": "none",
                    "border-bottom": "1px solid rgba(74, 109, 167, 0.2)",
                },
                blockquote: {
                    "border-left": "3px solid #ddd",
                    margin: "1.5em 0",
                    padding: "0.5em 0 0.5em 1em",
                    "font-style": "italic",
                    color: "#555",
                },
                hr: {
                    border: "none",
                    height: "1px",
                    background: "#ddd",
                    margin: "2em 0",
                },
                ".chapter": {
                    "page-break-after": "always",
                },
            });
            rendition.themes.select("custom");
        };

        initializeEpub();

        return () => {
            isMounted = false;
            rendition?.destroy();
            book?.destroy();
        };
    }, [file]);

    const handleClose = () => {
        cleanupRef.current();
        onClose();
    };

    const remainingParagraphChecker = async (
        option?: "next" | "prev"
    ): Promise<boolean> => {
        const doc = getDocument();
        if (!doc) return true;

        const elements = getTextElements(doc);
        if (elements.length === 0) return true;

        const viewportHeight = getViewportHeight();
        paragraphsPerPage = calculateVisibleCount(elements, viewportHeight);
        const totalPages = Math.ceil(elements.length / paragraphsPerPage);

        if (!updatePageIndex(option, totalPages)) return true;

        displayPage(elements, currentPageIndex, paragraphsPerPage);
        return false;
    };

    const getDocument = (): Document | null => {
        const iframe = viewerRef.current?.querySelector("iframe");
        return iframe?.contentDocument ?? null;
    };

    const getTextElements = (doc: Document): HTMLElement[] => {
        return Array.from(
            doc.querySelectorAll("p, h1, h2, h3, h4, h5, h6")
        ) as HTMLElement[];
    };

    const getViewportHeight = (): number => {
        const iframe = viewerRef.current?.querySelector("iframe");
        return iframe?.getBoundingClientRect().height ?? 0;
    };

    const calculateVisibleCount = (
        elements: HTMLElement[],
        height: number
    ): number => {
        elements.forEach((el) => (el.style.display = "block"));

        let count = 0;
        for (const el of elements) {
            if (el.getBoundingClientRect().bottom <= height) count++;
            else break;
        }

        elements.forEach((el) => (el.style.display = "none"));
        return Math.max(1, count);
    };

    const updatePageIndex = (
        option: "next" | "prev" | undefined,
        total: number
    ): boolean => {
        if (option === "next" && currentPageIndex < total - 1) {
            currentPageIndex++;
            return true;
        }
        if (option === "prev" && currentPageIndex > 0) {
            currentPageIndex--;
            return true;
        }
        return option === undefined;
    };

    const displayPage = (
        elements: HTMLElement[],
        pageIndex: number,
        count: number
    ) => {
        const start = pageIndex * count;
        const end = start + count;

        elements.forEach((el, i) => {
            el.style.display = i >= start && i < end ? "block" : "none";
        });
    };

    const resetParagraphCalculation = () => {
        paragraphsPerPage = 0;
        currentPageIndex = 0;
    };

    const goToLastPage = async () => {
        const doc = getDocument();
        if (!doc) return;

        const elements = getTextElements(doc);
        if (elements.length === 0) return;

        const viewportHeight = getViewportHeight();

        paragraphsPerPage = calculateVisibleCount(elements, viewportHeight);

        const totalPages = Math.ceil(elements.length / paragraphsPerPage);
        currentPageIndex = totalPages - 1;

        displayPage(elements, currentPageIndex, paragraphsPerPage);
    };

    const goToFirstPage = async () => {
        const doc = getDocument();
        if (!doc) return;

        const elements = getTextElements(doc);
        if (elements.length === 0) return;

        const viewportHeight = getViewportHeight();

        paragraphsPerPage = calculateVisibleCount(elements, viewportHeight);

        displayPage(elements, 0, paragraphsPerPage);
    };

    const goNext = async () => {
        const condition = await remainingParagraphChecker("next");
        if (rendition && condition) {
            if (rendition) await rendition.next();
            resetParagraphCalculation();
            await goToFirstPage();
        }
    };

    const goPrev = async () => {
        const condition = await remainingParagraphChecker("prev");

        if (rendition && condition) {
            if (rendition) await rendition.prev();
            resetParagraphCalculation();
            await goToLastPage();
        }
    };

    const closeModalOnClickOutside = (e: MouseEvent) => {
        const a = document.querySelector("#popup");
        if (a && !a.contains(e.target as Node) && e.button === 0) {
            handleClose();
            document.removeEventListener("mousedown", closeModalOnClickOutside);
        }
    };

    if (!file) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div
                id="popup"
                className="bg-white dark:bg-[#1E1E2A] rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col"
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-[#32324A]">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-[#F8F8FC]">
                            {metadata.title || "EPUB Viewer"}
                        </h2>
                        {metadata.creator && (
                            <p className="text-sm text-gray-600 dark:text-[#A0A0B8]">
                                by {metadata.creator}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#2A2A3A] text-gray-500 dark:text-[#A0A0B8]"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 relative">
                    <div
                        ref={viewerRef}
                        className="absolute inset-0 overflow-auto"
                    />
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-[#32324A] flex justify-between items-center">
                    <div className="flex space-x-2">
                        <button
                            onClick={goPrev}
                            id="prev"
                            className="p-2 bg-gray-100 dark:bg-[#2A2A3A] rounded-md hover:bg-gray-200 dark:hover:bg-[#32324A] text-gray-700 dark:text-[#F8F8FC]"
                            title="Previous page"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>

                        <button
                            onClick={goNext}
                            id="next"
                            className="p-2 bg-gray-100 dark:bg-[#2A2A3A] rounded-md hover:bg-gray-200 dark:hover:bg-[#32324A] text-gray-700 dark:text-[#F8F8FC]"
                            title="Next page"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                    </div>
                    {/* <button
                        onClick={toggleFullscreen}
                        className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md"
                        title="Toggle fullscreen"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button> */}
                </div>
            </div>
        </div>
    );
};

export default EpubViewer;
