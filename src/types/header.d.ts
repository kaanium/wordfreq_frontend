export interface HeaderProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    onLogout?: () => void;
    enableDarkMode: () => void;
    disableDarkMode: () => void;
    reviewCount: number;
}