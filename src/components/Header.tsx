import type React from "react";
import { useState } from "react";
import { HeaderProps } from "../types";

const Header: React.FC<HeaderProps> = ({
    activeTab,
    onTabChange,
    onLogout,
    enableDarkMode,
    disableDarkMode,
    reviewCount = 0,
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(
        localStorage.getItem("theme") === "dark"
    );

    const navItems = [
        {
            name: "Text Analyzer",
            id: "text",
            icon: (
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
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
            ),
        },
        {
            name: "ePub Analyzer",
            id: "epub",
            icon: (
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
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
            ),
        },
        {
            name: "Reviews",
            id: "reviews",
            icon: (
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
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
            ),
            comingSoon: false,
        },
    ];

    const handleTabClick = (tabId: string) => {
        onTabChange(tabId);
        setIsMenuOpen(false);
    };

    const handleLogout = async () => {
        try {
            if (onLogout) {
                onLogout();
            }
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const handleThemeToggle = () => {
        setIsDarkMode(!isDarkMode);
        if (localStorage.getItem("theme") === "light") {
            enableDarkMode();
        } else {
            disableDarkMode();
        }
    };

    return (
        <header className="bg-white dark:bg-[#1E1E2A] border-b border-gray-200 dark:border-[#32324A] sticky top-0 z-30 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <div
                            className="flex items-center cursor-pointer"
                            onClick={() => handleTabClick("text")}
                        >
                            <div className="h-8 w-8 rounded-md bg-gradient-to-r from-purple-600 to-purple-800 flex items-center justify-center text-white mr-2">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                    <line x1="16" y1="13" x2="8" y2="13"></line>
                                    <line x1="16" y1="17" x2="8" y2="17"></line>
                                    <polyline points="10 9 9 9 8 9"></polyline>
                                </svg>
                            </div>
                            <span className="text-xl font-bold text-gray-900 dark:text-[#F8F8FC]">
                                WordFreq
                            </span>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex md:items-center">
                        <nav className="md:ml-6 md:flex md:space-x-2">
                            {navItems.map((item) => (
                                <button
                                    key={item.name}
                                    onClick={() => handleTabClick(item.id)}
                                    disabled={item.comingSoon}
                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                                        activeTab === item.id
                                            ? "text-purple-700 bg-purple-50 dark:bg-[#2A2A3A]"
                                            : "text-gray-600 dark:text-gray-500 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-[#2A2A3A]"
                                    } transition-colors duration-200 ${
                                        item.comingSoon
                                            ? "opacity-60 cursor-not-allowed"
                                            : ""
                                    }`}
                                >
                                    {item.icon}
                                    {item.name}
                                    {item.id === "reviews" &&
                                        reviewCount > 0 && (
                                            <span
                                                id="reviewCount"
                                                className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                                            >
                                                {reviewCount}
                                            </span>
                                        )}
                                    {item.comingSoon && (
                                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                            Soon
                                        </span>
                                    )}
                                    {activeTab === item.id && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"></div>
                                    )}
                                </button>
                            ))}
                        </nav>

                        {/* Theme Toggle Button */}
                        <button
                            onClick={handleThemeToggle}
                            className="ml-4 p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2A2A3A] transition-colors duration-200"
                            aria-label="Toggle dark mode"
                        >
                            {isDarkMode ? (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <circle cx="12" cy="12" r="5"></circle>
                                    <line x1="12" y1="1" x2="12" y2="3"></line>
                                    <line
                                        x1="12"
                                        y1="21"
                                        x2="12"
                                        y2="23"
                                    ></line>
                                    <line
                                        x1="4.22"
                                        y1="4.22"
                                        x2="5.64"
                                        y2="5.64"
                                    ></line>
                                    <line
                                        x1="18.36"
                                        y1="18.36"
                                        x2="19.78"
                                        y2="19.78"
                                    ></line>
                                    <line x1="1" y1="12" x2="3" y2="12"></line>
                                    <line
                                        x1="21"
                                        y1="12"
                                        x2="23"
                                        y2="12"
                                    ></line>
                                    <line
                                        x1="4.22"
                                        y1="19.78"
                                        x2="5.64"
                                        y2="18.36"
                                    ></line>
                                    <line
                                        x1="18.36"
                                        y1="5.64"
                                        x2="19.78"
                                        y2="4.22"
                                    ></line>
                                </svg>
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                                </svg>
                            )}
                        </button>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="ml-4 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors duration-200"
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
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                            Logout
                        </button>
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-[#2A2A3A] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
                            aria-expanded="false"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMenuOpen ? (
                                <svg
                                    className="block h-6 w-6"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    className="block h-6 w-6"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu, show/hide based on menu state */}
            <div className={`md:hidden ${isMenuOpen ? "block" : "hidden"}`}>
                <div className="pt-2 pb-3 space-y-1">
                    {navItems.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => handleTabClick(item.id)}
                            disabled={item.comingSoon}
                            className={`w-full flex items-center px-3 py-2 text-base font-medium ${
                                activeTab === item.id
                                    ? "text-purple-700 bg-purple-50 dark:bg-[#2A2A3A] border-l-4 border-purple-500"
                                    : "text-gray-600 hover:bg-purple-50 hover:text-purple-700 dark:hover:bg-[#2A2A3A] border-l-4 border-transparent"
                            } ${
                                item.comingSoon
                                    ? "opacity-60 cursor-not-allowed"
                                    : ""
                            }`}
                        >
                            <div className="ml-3 flex items-center">
                                {item.icon}
                                {item.name}
                                {item.id === "reviews" && reviewCount > 0 && (
                                    <span
                                        id="reviewCount"
                                        className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                                    >
                                        {reviewCount}
                                    </span>
                                )}
                                {item.comingSoon && (
                                    <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                        Soon
                                    </span>
                                )}
                            </div>
                        </button>
                    ))}

                    {/* Mobile Theme Toggle Button */}
                    <button
                        onClick={handleThemeToggle}
                        className="w-full flex items-center px-3 py-2 text-base font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2A2A3A]"
                    >
                        <div className="ml-3 flex items-center">
                            {isDarkMode ? (
                                <>
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
                                        <circle cx="12" cy="12" r="5"></circle>
                                        <line
                                            x1="12"
                                            y1="1"
                                            x2="12"
                                            y2="3"
                                        ></line>
                                        <line
                                            x1="12"
                                            y1="21"
                                            x2="12"
                                            y2="23"
                                        ></line>
                                        <line
                                            x1="4.22"
                                            y1="4.22"
                                            x2="5.64"
                                            y2="5.64"
                                        ></line>
                                        <line
                                            x1="18.36"
                                            y1="18.36"
                                            x2="19.78"
                                            y2="19.78"
                                        ></line>
                                        <line
                                            x1="1"
                                            y1="12"
                                            x2="3"
                                            y2="12"
                                        ></line>
                                        <line
                                            x1="21"
                                            y1="12"
                                            x2="23"
                                            y2="12"
                                        ></line>
                                        <line
                                            x1="4.22"
                                            y1="19.78"
                                            x2="5.64"
                                            y2="18.36"
                                        ></line>
                                        <line
                                            x1="18.36"
                                            y1="5.64"
                                            x2="19.78"
                                            y2="4.22"
                                        ></line>
                                    </svg>
                                    Light Mode
                                </>
                            ) : (
                                <>
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
                                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                                    </svg>
                                    Dark Mode
                                </>
                            )}
                        </div>
                    </button>

                    {/* Mobile Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-3 py-2 text-base font-medium text-white bg-purple-600 hover:bg-purple-700 transition-colors duration-200"
                    >
                        <div className="ml-3 flex items-center">
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
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                            Logout
                        </div>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
