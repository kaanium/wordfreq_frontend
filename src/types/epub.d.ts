export type SpineItem = {
    load: (
        loader: (url: string) => Promise<XMLDocument>
    ) => Promise<XMLDocument>;
    unload: () => void;
};
