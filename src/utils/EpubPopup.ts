// components/analyze/PopupDictionary.ts
import { OptimizedDictionary, PopupElements } from "../types";
import { unconjugate } from "jp-conjugation";

export function setupPopupDictionary(
    rendition: any,
    dictionary: OptimizedDictionary
): void {
    rendition.on("rendered", () => {
        const doc = getDocument();
        if (!doc) return;

        injectPopupStyles(doc);
        const popup = createPopupElement(doc);
        setupMouseInteractions(doc, popup, dictionary);
    });
}

function getDocument(): Document | null {
    const iframe = document.querySelector("iframe");
    return iframe?.contentDocument ?? null;
}

function injectPopupStyles(doc: Document): void {
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
            pointer-events: none;
            z-index: 9999;
            max-width: 300px;
            opacity: 0;
            border-left: 3px solid rgb(126 34 206);
            animation: fadeIn 0.2s ease forwards;
        }
        .meaning-popup.hiding {
            animation: fadeOut 0.15s ease forwards;
        }
        .meaning-title {
            font-weight: bold;
            direction: initial;
            margin-bottom: 6px;
            color: #1a1a1a;
            font-size: 16px;
            border-bottom: 1px solid rgba(0,0,0,0.08);
            padding-bottom: 4px;
        }
        .meaning-list {
            padding: 0;
            margin: 0;
            list-style-position: inside;
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
    `;
    doc.head.appendChild(style);
}

function createPopupElement(doc: Document): PopupElements {
    const popup = doc.createElement("div");
    popup.className = "meaning-popup";
    popup.style.display = "none";

    const title = doc.createElement("div");
    title.className = "meaning-title";

    const meaningList = doc.createElement("ul");
    meaningList.className = "meaning-list";

    popup.appendChild(title);
    popup.appendChild(meaningList);
    doc.body.appendChild(popup);

    return { popup, title, meaningList };
}

function setupMouseInteractions(
    doc: Document,
    elements: PopupElements,
    dictionary: OptimizedDictionary
): void {
    let isPopupVisible = false;
    let hideTimeout: number | undefined;

    const { popup, title, meaningList } = elements;

    (
        doc.querySelectorAll(
            "p, h1, h2, h3, h4, h5, h6"
        ) as unknown as HTMLElement[]
    ).forEach((p: HTMLElement) => {
        p.addEventListener("mousemove", (e: Event) =>
            handleMouseMove(
                e as MouseEvent,
                doc,
                popup,
                title,
                meaningList,
                dictionary
            )
        );
        p.addEventListener("mouseleave", () => hidePopup(popup));
    });

    function hidePopup(popup: HTMLDivElement): void {
        if (isPopupVisible) {
            popup.classList.add("hiding");
            hideTimeout = window.setTimeout(() => {
                popup.style.display = "none";
                isPopupVisible = false;
            }, 150); // Match animation duration
        }
    }

    function handleMouseMove(
        e: MouseEvent,
        doc: Document,
        popup: HTMLDivElement,
        title: HTMLDivElement,
        meaningList: HTMLUListElement,
        dictionary: OptimizedDictionary
    ): void {
        const mouseEvent = e;

        // Clear any pending hide operations
        if (hideTimeout) {
            clearTimeout(hideTimeout);
        }

        const textPosition = getTextPositionFromMouse(mouseEvent, doc);
        if (!textPosition) {
            hidePopup(popup);
            return;
        }

        const { node, offset } = textPosition;
        const text = node.nodeValue ?? "";
        if (!text) return;

        const dictionaryMatch = findLongestMatch(text, offset, dictionary);
        if (!dictionaryMatch) {
            hidePopup(popup);
            return;
        }

        const [matchedWord, meanings] = dictionaryMatch;

        if (meanings && meanings.length > 0) {
            updatePopupContent(matchedWord, meanings, title, meaningList, doc);
            positionPopup(popup, mouseEvent);

            // Show popup with animation
            popup.classList.remove("hiding");
            popup.style.display = "block";
            isPopupVisible = true;
        } else {
            hidePopup(popup);
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

    function updatePopupContent(
        word: string,
        meanings: string[],
        title: HTMLDivElement,
        meaningList: HTMLUListElement,
        doc: Document
    ): void {
        title.textContent = word;
        meaningList.innerHTML = "";

        meanings.forEach((meaning: string) => {
            const item = doc.createElement("li");
            item.className = "meaning-item";
            item.textContent = meaning;
            meaningList.appendChild(item);
        });
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
}

function findLongestMatch(
    text: string,
    offset: number,
    dictionary: OptimizedDictionary
): [string, string[] | null] | null {
    const maxLookahead = 10;
    const limit = Math.min(text.length, offset + maxLookahead);

    for (let end = limit; end > offset; end--) {
        const slice = text.slice(offset, end);

        // Check unconjugated forms
        const unconjugatedForms = unconjugate(slice);
        for (const form of unconjugatedForms) {
            const word = form[0].word;
            if (dictionary[word]) {
                return [word, dictionary[word]];
            }
        }

        // Direct match in dictionary
        if (dictionary[slice]) {
            return [slice, dictionary[slice]];
        }
    }

    return null;
}
