import type { OptimizedDictionary, PopupElements } from "../types";
import { unconjugate } from "jp-conjugation";

import { addWordFlashcard, isExists } from "../services/FlashcardService";

interface HoverState {
    timeoutId: number | null;
    lastWord: string | null;
    lastX: number;
    lastY: number;
}

export function setupPopupDictionary(
    rendition: any,
    dictionary: OptimizedDictionary
): () => void {
    let cleanupFunctions: (() => void)[] = [];

    rendition.on("rendered", () => {
        const doc = getDocument();
        if (!doc) return;

        // Cleanup previous instance if exists
        cleanupFunctions.forEach((fn) => fn());
        cleanupFunctions = [];

        const styleCleanup = injectPopupStyles(doc);
        const popupElements = createPopupElement(doc);
        const mouseInteractionsCleanup = setupMouseInteractions(
            doc,
            popupElements, // Pass the full popupElements object
            dictionary
        );

        cleanupFunctions.push(
            styleCleanup,
            popupElements.cleanup,
            mouseInteractionsCleanup
        );
    });

    return () => {
        cleanupFunctions.forEach((fn) => fn());
    };
}

function getDocument(): Document | null {
    const iframe = document.querySelector("iframe");
    return iframe?.contentDocument ?? null;
}

function injectPopupStyles(doc: Document): () => void {
    const style = doc.createElement("style");
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(5px); }
        }
        li::marker {
            content: "";
        }
        .meaning-popup {
            position: absolute;
            padding: 12px 16px;
            background: #fcfcf7;
            writing-mode: horizontal-tb;
            color: #2a2a2a;
            border-radius: 8px;
            font-family: 'Georgia', 'Times New Roman', serif;
            font-size: 15px;
            line-height: 1.5;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
            z-index: 9999;
            max-width: 300px;
            min-width: 200px;
            opacity: 0;
            border-left: 3px solid rgb(126 34 206);
            animation: fadeIn 0.2s ease forwards;
        }
        .meaning-popup.hiding {
            animation: fadeOut 0.15s ease forwards;
        }
        .meaning-popup.interactive {
            pointer-events: auto;
        }
        .meaning-title {
            font-weight: bold;
            direction: initial;
            margin-bottom: 6px;
            color: #1a1a1a;
            font-size: 16px;
            border-bottom: 1px solid rgba(0,0,0,0.08);
            padding-bottom: 4px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .add-button {
            background-color: rgb(126 34 206);
            color: white;
            border: none;
            border-radius: 4px;
            padding: 4px 8px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 4px;
        }
        .add-button:hover:not(:disabled) {
            background-color: rgb(107 33 168);
        }
        .add-button:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
            opacity: 0.7;
        }
        .add-button.loading {
            opacity: 0.7;
            cursor: wait;
        }
        .add-button.success {
            background-color: #10b981;
        }
        .add-button-icon {
            width: 12px;
            height: 12px;
            display: inline-block;
        }
        .meaning-list {
            padding: 0;
            margin: 0;
            list-style-position: inside;
            max-height: 150px;
            overflow-y: auto;
            scrollbar-width: thin;
            scrollbar-color: rgba(126, 34, 206, 0.3) transparent;
        }
        .meaning-list::-webkit-scrollbar {
            width: 6px;
        }
        .meaning-list::-webkit-scrollbar-track {
            background: transparent;
        }
        .meaning-list::-webkit-scrollbar-thumb {
            background-color: rgba(126, 34, 206, 0.3);
            border-radius: 6px;
        }
        .meaning-list::-webkit-scrollbar-thumb:hover {
            background-color: rgba(126, 34, 206, 0.5);
        }
        .meaning-item {
            margin-bottom: 4px;
            position: relative;
            padding-left: 12px;
            direction: initial;
        }
        .meaning-item:before {
            content: "•";
            position: absolute;
            left: 0;
            color: rgb(126 34 206);
        }
        .meaning-item:last-child {
            margin-bottom: 0;
        }
        ruby {
            display: inline-ruby;
            ruby-align: center;
        }
        rt {
            font-size: 10px;
            color: #666;
            line-height: 1;
            text-align: center;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .spinner {
            animation: spin 1s linear infinite;
            display: inline-block;
        }
    `;
    doc.head.appendChild(style);

    return () => {
        if (doc.head.contains(style)) {
            doc.head.removeChild(style);
        }
    };
}

interface EnhancedPopupElements extends PopupElements {
    addButton: HTMLButtonElement;
    cleanup: () => void;
}

function createPopupElement(doc: Document): EnhancedPopupElements {
    const popup = doc.createElement("div");
    popup.className = "meaning-popup";
    popup.style.display = "none";

    const title = doc.createElement("div");
    title.className = "meaning-title";

    const addButton = doc.createElement("button");
    addButton.className = "add-button";
    addButton.innerHTML = `
        <svg class="add-button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Add
    `;

    const meaningList = doc.createElement("ul");
    meaningList.className = "meaning-list";

    title.appendChild(addButton);
    popup.appendChild(title);
    popup.appendChild(meaningList);
    doc.body.appendChild(popup);

    return {
        popup,
        title,
        meaningList,
        addButton,
        cleanup: () => {
            if (doc.body.contains(popup)) {
                doc.body.removeChild(popup);
            }
        },
    };
}

function setupMouseInteractions(
    doc: Document,
    elements: EnhancedPopupElements,
    dictionary: OptimizedDictionary
): () => void {
    let isPopupVisible = false;
    let hideTimeout: number | undefined;
    const hoverState: HoverState = {
        timeoutId: null,
        lastWord: null,
        lastX: 0,
        lastY: 0,
    };
    let currentWord = "";
    let currentMeanings: string[] = [];
    let currentReading: string = "";
    let isWordExistsChecking = false;
    let isWordExists = false;
    let isAddingWord = false;

    const { popup, addButton } = elements;

    // Make popup interactive
    popup.classList.add("interactive");

    // Add event listeners for popup interaction
    const popupMouseEnterHandler = () => {
        if (hideTimeout) {
            clearTimeout(hideTimeout);
        }
    };

    const popupMouseLeaveHandler = () => {
        hidePopup(popup);
    };

    const docClickHandler = (e: MouseEvent) => {
        if (isPopupVisible && !popup.contains(e.target as Node)) {
            hidePopup(popup);
        }
    };

    const addButtonClickHandler = async (e: MouseEvent) => {
        e.stopPropagation();

        if (isAddingWord || isWordExists) return;

        try {
            isAddingWord = true;
            updateAddButtonState("loading");

            const response = await addWordFlashcard(
                currentWord,
                currentMeanings,
                currentReading
            );

            if (response && response.ok) {
                updateAddButtonState("success");
                isWordExists = true;

                // Reset button after 2 seconds
                const successTimeout = window.setTimeout(() => {
                    updateAddButtonState("exists");
                }, 2000);

                cleanupFunctions.push(() => clearTimeout(successTimeout));
            } else {
                updateAddButtonState("error");

                // Reset button after 2 seconds
                const errorTimeout = window.setTimeout(() => {
                    updateAddButtonState("normal");
                }, 2000);

                cleanupFunctions.push(() => clearTimeout(errorTimeout));
            }
        } catch (error) {
            console.error("Error adding word:", error);
            updateAddButtonState("error");

            // Reset button after 2 seconds
            const errorTimeout = window.setTimeout(() => {
                updateAddButtonState("normal");
            }, 2000);

            cleanupFunctions.push(() => clearTimeout(errorTimeout));
        } finally {
            isAddingWord = false;
        }
    };

    const textElements = doc.querySelectorAll("p, h1, h2, h3, h4, h5, h6");
    const textElementHandlers: {
        element: Element;
        handlers: [string, EventListener][];
    }[] = [];
    textElements.forEach((element) => {
        const mouseMoveHandler = (e: Event) => {
            handleHover(e as MouseEvent, doc, hoverState, () => {
                showPopup(e as MouseEvent, doc, elements, dictionary);
            });
        };

        const clickHandler = (e: Event) => {
            const mouseEvent = e as MouseEvent;
            const match = getDictionaryMatchAtPosition(
                mouseEvent,
                doc,
                dictionary
            );

            if (match) {
                const [matchedWord, meanings, reading] = match;
                updateAndShowPopup(
                    mouseEvent,
                    matchedWord,
                    meanings,
                    reading,
                    elements,
                    doc
                );

                e.preventDefault();
            }
        };

        element.addEventListener("mousemove", mouseMoveHandler);
        element.addEventListener("click", clickHandler);

        textElementHandlers.push({
            element,
            handlers: [
                ["mousemove", mouseMoveHandler],
                ["click", clickHandler],
            ],
        });
    });

    const mousemoveHandler = (e: MouseEvent) => {
        hoverState.lastX = e.clientX;
        hoverState.lastY = e.clientY;
    };

    const delayedMousemoveSetup = window.setTimeout(() => {
        doc.addEventListener("mousemove", mousemoveHandler);
    }, 100);

    popup.addEventListener("mouseenter", popupMouseEnterHandler);
    popup.addEventListener("mouseleave", popupMouseLeaveHandler);
    doc.addEventListener("click", docClickHandler);
    addButton.addEventListener("click", addButtonClickHandler);

    const cleanupFunctions: (() => void)[] = [
        () => {
            popup.removeEventListener("mouseenter", popupMouseEnterHandler);
            popup.removeEventListener("mouseleave", popupMouseLeaveHandler);
            doc.removeEventListener("click", docClickHandler);
            addButton.removeEventListener("click", addButtonClickHandler);
            clearTimeout(delayedMousemoveSetup);
            doc.removeEventListener("mousemove", mousemoveHandler);

            if (hideTimeout) {
                clearTimeout(hideTimeout);
            }

            if (hoverState.timeoutId) {
                clearTimeout(hoverState.timeoutId);
            }

            textElementHandlers.forEach(({ element, handlers }) => {
                handlers.forEach(([event, handler]) => {
                    element.removeEventListener(event, handler);
                });
            });
        },
    ];

    function updateAddButtonState(
        state: "normal" | "loading" | "success" | "error" | "exists"
    ) {
        switch (state) {
            case "normal":
                addButton.disabled = false;
                addButton.classList.remove("loading", "success");
                addButton.innerHTML = `
                    <svg class="add-button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                `;
                break;
            case "loading":
                addButton.disabled = true;
                addButton.classList.add("loading");
                addButton.innerHTML = `
                    <svg class="add-button-icon spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 6v6l4 2"></path>
                    </svg>
                `;
                break;
            case "success":
                addButton.disabled = true;
                addButton.classList.add("success");
                addButton.classList.remove("loading");
                addButton.innerHTML = `
                    <svg class="add-button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                `;
                break;
            case "error":
                addButton.disabled = false;
                addButton.classList.remove("loading", "success");
                addButton.innerHTML = `
                    <svg class="add-button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                `;
                break;
            case "exists":
                addButton.disabled = true;
                addButton.classList.remove("loading", "success");
                addButton.innerHTML = `
                    <svg class="add-button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                    </svg>
                `;
                break;
        }
    }

    async function checkIfWordExists(word: string): Promise<boolean> {
        try {
            isWordExistsChecking = true;
            updateAddButtonState("loading");

            const response = await isExists(word);

            if (!response) return false;

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error checking if word exists:", error);
            return false;
        } finally {
            isWordExistsChecking = false;
        }
    }

    function updateAndShowPopup(
        mouseEvent: MouseEvent,
        word: string,
        meanings: string[],
        reading: string | undefined,
        elements: EnhancedPopupElements,
        doc: Document
    ): void {
        const { popup, title, meaningList } = elements;

        // Update current word and meanings
        currentWord = word;
        currentMeanings = meanings;
        currentReading = reading || "";

        // Reset word exists state
        isWordExists = false;

        // Update popup content
        updatePopupContent(word, meanings, reading, title, meaningList, doc);

        // Show popup
        popup.classList.remove("hiding");
        popup.style.display = "block";
        isPopupVisible = true;

        positionPopup(popup, mouseEvent);

        // Check if word exists
        checkIfWordExists(word).then((exists) => {
            isWordExists = exists;
            updateAddButtonState(exists ? "exists" : "normal");
        });
    }

    function handleHover(
        mouseEvent: MouseEvent,
        doc: Document,
        state: HoverState,
        callback: () => void
    ): void {
        if (state.timeoutId) {
            clearTimeout(state.timeoutId);
            state.timeoutId = null;
        }

        const match = getDictionaryMatchAtPosition(mouseEvent, doc, dictionary);
        if (!match) {
            return;
        }

        const [currentWord] = match;
        const isSameWord = currentWord === state.lastWord;

        if (!isSameWord) {
            state.timeoutId = window.setTimeout(() => {
                const syntheticEvent = new MouseEvent("mousemove", {
                    clientX: hoverState.lastX,
                    clientY: hoverState.lastY,
                    bubbles: true,
                    cancelable: true,
                    view: window,
                });
                const newMatch = getDictionaryMatchAtPosition(
                    syntheticEvent,
                    doc,
                    dictionary
                );

                if (!newMatch) {
                    return;
                }

                const [newWord] = newMatch;
                if (currentWord === newWord) callback();
            }, 300);

            cleanupFunctions.push(() => {
                if (state.timeoutId) {
                    clearTimeout(state.timeoutId);
                }
            });
        }
    }

    function showPopup(
        mouseEvent: MouseEvent,
        doc: Document,
        elements: EnhancedPopupElements,
        dictionary: OptimizedDictionary
    ): void {
        const match = getDictionaryMatchAtPosition(mouseEvent, doc, dictionary);
        if (!match) {
            hidePopup(popup);
            return;
        }
        const [matchedWord, meanings, reading] = match;

        if (hoverState.lastWord === matchedWord && isPopupVisible) return;

        if (meanings?.length > 0) {
            updateAndShowPopup(
                mouseEvent,
                matchedWord,
                meanings,
                reading,
                elements,
                doc
            );
            hoverState.lastWord = matchedWord;
        } else {
            hidePopup(popup);
        }
    }

    function getDictionaryMatchAtPosition(
        mouseEvent: MouseEvent,
        doc: Document,
        dictionary: OptimizedDictionary
    ): [string, string[], string?] | null {
        const textPosition = getTextPositionFromMouse(mouseEvent, doc);
        if (!textPosition) return null;

        const { node, offset } = textPosition;
        const text = node.nodeValue ?? "";
        return text ? findLongestMatch(text, offset, dictionary) : null;
    }

    function hidePopup(popup: HTMLDivElement): void {
        if (isPopupVisible) {
            popup.classList.add("hiding");
            hideTimeout = window.setTimeout(() => {
                popup.style.display = "none";
                isPopupVisible = false;
                hoverState.lastWord = null;

                // Reset states
                currentWord = "";
                currentMeanings = [];
                isWordExists = false;

                // Reset button state
                updateAddButtonState("normal");
            }, 150); // Match animation duration

            cleanupFunctions.push(() => {
                if (hideTimeout) {
                    clearTimeout(hideTimeout);
                }
            });
        }
    }

    function getTextPositionFromMouse(
        mouseEvent: MouseEvent,
        doc: Document
    ): { node: Text; offset: number } | null {
        const docWithCaretPos = doc as Document & {
            caretPositionFromPoint?: (
                x: number,
                y: number
            ) => {
                offsetNode: Node;
                offset: number;
            };
        };

        const pos = docWithCaretPos.caretPositionFromPoint?.(
            mouseEvent.clientX,
            mouseEvent.clientY - 7
        );

        if (!pos) return null;

        const range = doc.createRange();
        range.setStart(pos.offsetNode, pos.offset);
        range.setEnd(pos.offsetNode, pos.offset);

        if (
            !range ||
            !range.startContainer ||
            range.startContainer.nodeType !== Node.TEXT_NODE
        ) {
            return null;
        }

        return {
            node: range.startContainer as Text,
            offset: range.startOffset,
        };
    }

    function updateMeaningsList(
        meanings: string[],
        meaningList: HTMLUListElement,
        doc: Document
    ): void {
        meaningList.innerHTML = "";
        meanings.forEach((meaning: string) => {
            const item = doc.createElement("li");
            item.className = "meaning-item";
            item.textContent = meaning;
            meaningList.appendChild(item);
        });
    }

    function updatePopupContent(
        word: string,
        meanings: string[],
        reading: string | undefined,
        title: HTMLDivElement,
        meaningList: HTMLUListElement,
        doc: Document
    ): void {
        // Clear previous content but keep the add button
        const addButtonElement = title.querySelector(".add-button");
        title.innerHTML = "";

        if (addButtonElement) {
            title.appendChild(addButtonElement);
        }

        // Add word with furigana reading
        if (reading && reading !== word) {
            const rubyElement = doc.createElement("ruby");
            rubyElement.textContent = word;

            const rtElement = doc.createElement("rt");
            rtElement.textContent = reading;

            rubyElement.appendChild(rtElement);
            title.insertBefore(rubyElement, addButtonElement);
        } else {
            const wordSpan = doc.createElement("span");
            wordSpan.textContent = word;
            title.insertBefore(wordSpan, addButtonElement);
        }

        // Show all meanings in scrollable list
        updateMeaningsList(meanings, meaningList, doc);
    }

    function positionPopup(
        popup: HTMLDivElement,
        mouseEvent: MouseEvent
    ): void {
        const offset = 15;
        const xPosition = mouseEvent.pageX;
        const yPosition = mouseEvent.pageY;
        const iframe = document.querySelector("iframe");
        const window = iframe?.contentWindow as Window;

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const popupWidth = popup.clientWidth;
        const popupHeight = popup.clientHeight;

        const checkRightOverflow = xPosition + popupWidth < viewportWidth;
        const checkBottomOverflow = yPosition + popupHeight < viewportHeight;

        popup.style.left = `${
            checkRightOverflow
                ? xPosition + offset
                : xPosition - popup.clientWidth - offset
        }px`;
        popup.style.top = `${
            checkBottomOverflow
                ? yPosition + offset
                : yPosition - popup.clientHeight - offset
        }px`;
    }

    return () => {
        cleanupFunctions.forEach((fn) => fn());
    };
}

function findLongestMatch(
    text: string,
    offset: number,
    dictionary: OptimizedDictionary
): [string, string[], string?] | null {
    const maxLookahead = 10;
    const limit = Math.min(text.length, offset + maxLookahead);

    for (let end = limit; end > offset; end--) {
        const slice = text.slice(offset, end);

        // Direct match in dictionary
        if (dictionary[slice]) {
            return [slice, dictionary[slice].m, dictionary[slice].r];
        }

        // Check unconjugated forms
        const unconjugatedForms = unconjugate(slice);
        for (const form of unconjugatedForms) {
            const word = form[0].word;
            if (dictionary[word]) {
                return [word, dictionary[word].m, dictionary[word].r];
            }
        }
    }

    return null;
}
