import { useEffect, useRef, useState, useCallback } from "react";
import ePub from "epubjs";
import type { Book, Rendition } from "epubjs";
import jsonDictionary from "../../assets/optimized-dictionary-new.json";
import { EpubViewerProps, OptimizedDictionary } from "../../types";
import { setupPopupDictionary } from "../../utils/EpubPopup";

const dictionary: OptimizedDictionary = jsonDictionary as OptimizedDictionary;

const EpubViewer = ({ file, onClose }: EpubViewerProps) => {
    const viewerRef = useRef<HTMLDivElement>(null);
    const cleanupRef = useRef<() => void>(() => {});
    const [rendition, setRendition] = useState<Rendition | null>(null);
    const [metadata, setMetadata] = useState<{
        title?: string;
        creator?: string;
    }>({});
    const currentPageIndex = useRef(0);
    const pagesRef = useRef<HTMLElement[][]>([]);

    const handleClose = useCallback(() => {
        cleanupRef.current();
        document.removeEventListener("mousedown", closeModalOnClickOutside);
        onClose();
    }, [onClose]);

    const closeModalOnClickOutside = useCallback(
        (e: MouseEvent) => {
            const popup = document.querySelector("#popup");
            if (popup && !popup.contains(e.target as Node) && e.button === 0) {
                handleClose();
            }
        },
        [handleClose]
    );

    const goNext = useCallback(async () => {
        const condition = await remainingParagraphChecker("next");
        if (rendition && condition) {
            await rendition.next();
            resetParagraphCalculation();
            precalculatePages();
            await goToFirstPage();
        }
    }, [rendition]);

    const goPrev = useCallback(async () => {
        const condition = await remainingParagraphChecker("prev");
        if (rendition && condition) {
            await rendition.prev();
            resetParagraphCalculation();
            precalculatePages();
            // await goToFirstPage();

            setTimeout(async () => {
                await goToLastPage();
            }, 10);
        }
    }, [rendition]);

    // Keyboard event handling
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") {
                e.preventDefault();
                goNext();
            } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                goPrev();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [goNext, goPrev]);

    // EPUB initialization
    useEffect(() => {
        if (!file || !viewerRef.current) return;

        let isMounted = true;
        let currentRendition: Rendition | null = null;

        const initializeEpub = async () => {
            try {
                const book = ePub(await file.arrayBuffer());
                if (!isMounted) return;

                await loadMetadata(book);

                currentRendition = book.renderTo(viewerRef.current!, {
                    width: "100%",
                    height: "100%",
                    spread: "none",
                    flow: "paginated",
                });

                setupThemes(currentRendition);
                setupPopupDictionary(currentRendition, dictionary);
                currentRendition.on("rendered", setupIframeNavigation);

                await currentRendition.display();
                precalculatePages();
                if (isMounted) setRendition(currentRendition);

                document.addEventListener(
                    "mousedown",
                    closeModalOnClickOutside
                );
                cleanupRef.current = () => currentRendition?.destroy();
            } catch (error) {
                console.error("Error initializing EPUB:", error);
            }
        };

        const loadMetadata = async (book: Book) => {
            await book.ready;
            const meta = await book.loaded.metadata;
            if (isMounted) {
                setMetadata({
                    title: meta.title,
                    creator: meta.creator,
                });
            }
        };

        const setupThemes = (rendition: Rendition) => {
            rendition.themes.register("custom", {
                body: {
                    "font-family":
                        "'ヒラギノ角ゴ ProN', 'Hiragino Kaku Gothic ProN', '游ゴシック', '游ゴシック体', YuGothic, 'Yu Gothic', 'メイリオ', Meiryo, 'ＭＳ ゴシック', 'MS Gothic', HiraKakuProN-W3, 'TakaoExゴシック', TakaoExGothic, 'MotoyaLCedar', 'Droid Sans Japanese', sans-serif",
                    "line-height": "1.65",
                    color: "#2a2a2a",
                    background: "#fcfcf7 !important",
                    "font-size": "19px !important",
                    padding: "20px !important",
                    direction: "ltr",
                    "text-rendering": "optimizeLegibility",
                    "-webkit-font-smoothing": "antialiased",
                },
                "body > div": { display: "inline-block" },
                p: { margin: "0 0 1.2em 0", "text-align": "justify" },
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
                ".chapter": { "page-break-after": "always" },
            });
            rendition.themes.select("custom");
        };

        const setupIframeNavigation = () => {
            const iframeDoc = getDocument();
            if (!iframeDoc) return;

            const handleIframeKeyDown = (e: KeyboardEvent) => {
                const parentDoc = window.document;
                const nextButton = parentDoc.getElementById("next");
                const prevButton = parentDoc.getElementById("prev");

                if (e.key === "ArrowRight" && nextButton) {
                    e.preventDefault();
                    e.stopPropagation();
                    nextButton.click();
                } else if (e.key === "ArrowLeft" && prevButton) {
                    e.preventDefault();
                    e.stopPropagation();
                    prevButton.click();
                }
            };

            iframeDoc.addEventListener("keydown", handleIframeKeyDown);
            return () =>
                iframeDoc.removeEventListener("keydown", handleIframeKeyDown);
        };

        initializeEpub();

        return () => {
            isMounted = false;
            currentRendition?.destroy();
        };
    }, [file, closeModalOnClickOutside]);

    const getDocument = useCallback((): Document | null => {
        const iframe = viewerRef.current?.querySelector("iframe");
        return iframe?.contentDocument ?? null;
    }, []);

    const getTextElements = useCallback((doc: Document): HTMLElement[] => {
        return Array.from(
            doc.querySelectorAll("p, h1, h2, h3, h4, h5, h6")
        ) as HTMLElement[];
    }, []);

    const getViewportHeight = useCallback((): number => {
        const iframe = viewerRef.current?.querySelector("iframe");
        return iframe?.getBoundingClientRect().height ?? 0;
    }, []);

    const updatePageIndex = useCallback(
        (option: "next" | "prev" | undefined, total: number): boolean => {
            if (option === "next" && currentPageIndex.current < total - 1) {
                currentPageIndex.current++;
                return true;
            }
            if (option === "prev" && currentPageIndex.current > 0) {
                currentPageIndex.current--;
                return true;
            }
            return option === undefined;
        },
        []
    );

    const displayPage = useCallback((pageIndex: number) => {
        const allPages = pagesRef.current;
        if (!allPages.length) return;

        const allElements = allPages.flat();
        allElements.forEach((el) => (el.style.display = "none"));

        const page = allPages[pageIndex] ?? [];
        page.forEach((el) => (el.style.display = "block"));
    }, []);

    const remainingParagraphChecker = useCallback(
        async (option?: "next" | "prev"): Promise<boolean> => {
            const totalPages = pagesRef.current.length;
            if (!updatePageIndex(option, totalPages)) return true;

            displayPage(currentPageIndex.current);
            return false;
        },
        [displayPage]
    );

    const resetParagraphCalculation = useCallback(() => {
        currentPageIndex.current = 0;
    }, []);

    const goToPage = useCallback(
        async (position: "first" | "last") => {
            const totalPages = pagesRef.current.length;
            const pageIndex = position === "first" ? 0 : totalPages - 1;

            currentPageIndex.current = pageIndex;
            displayPage(pageIndex);
        },
        [displayPage]
    );

    const goToLastPage = useCallback(async () => {
        await goToPage("last");
    }, [goToPage]);

    const goToFirstPage = useCallback(async () => {
        await goToPage("first");
    }, [goToPage]);

    const precalculatePages = useCallback(() => {
        const doc = getDocument();
        if (!doc) return;

        const elements = getTextElements(doc);
        if (elements.length === 0) return;

        const height = getViewportHeight();
        elements.forEach((el) => (el.style.display = "block"));

        const pages: HTMLElement[][] = [];
        let page: HTMLElement[] = [];
        let currentTop = elements[0].getBoundingClientRect().top;

        for (const el of elements) {
            const rect = el.getBoundingClientRect();
            if (rect.bottom - currentTop > height && page.length) {
                pages.push(page);
                page.map((p) => {
                    p.style.display = "none";
                });
                page = [];
                currentTop = rect.top;
            }
            page.push(el);
        }
        if (page.length) pages.push(page);

        // Hide all again
        elements.forEach((el) => (el.style.display = "none"));

        pagesRef.current = pages;
    }, [getDocument, getTextElements, getViewportHeight]);

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
                </div>
            </div>
        </div>
    );
};

export default EpubViewer;
