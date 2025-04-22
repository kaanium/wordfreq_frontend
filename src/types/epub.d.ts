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

export interface TextPosition {
    node: Text;
    offset: number;
}

export interface EpubViewerProps {
    file: File | null;
    onClose: () => void;
}

export type OptimizedDictionary = Record<string, string[] | null>;
