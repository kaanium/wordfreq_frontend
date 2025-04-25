export type SpineItem = {
    load: (
        loader: (url: string) => Promise<XMLDocument>
    ) => Promise<XMLDocument>;
    unload: () => void;
};

export interface PopupElements {
    popup: HTMLDivElement;
    title: HTMLDivElement;
    meaningList: HTMLUListElement;
}

export interface EnhancedPopupElements extends PopupElements {
    addButton: HTMLButtonElement;
    cleanup: () => void;
}

export interface HoverState {
    timeoutId: number | null;
    lastWord: string | null;
    lastX: number;
    lastY: number;
}

export interface TextPosition {
    node: Text;
    offset: number;
}

export interface EpubViewerProps {
    file: File | null;
    onClose: () => void;
}

export interface OptimizedDictionary {
    [word: string]: {
        m: string[];
        r: string;
    };
}
