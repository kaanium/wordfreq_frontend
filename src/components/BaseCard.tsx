import React from "react";
import type { BaseCardLayoutProps } from "../types";

const BaseCardLayout: React.FC<BaseCardLayoutProps> = ({
    title,
    icon,
    children,
    badgeContent,
}) => {
    return (
        <div className="max-w-4xl mx-auto bg-white dark:bg-[#1E1E2A] rounded-2xl shadow-lg overflow-hidden p-8 my-8 border border-gray-100 dark:border-[#32324A]">
            <div className="relative mb-8">
                <h1 className="text-3xl font-extrabold text-center text-gray-800 dark:text-[#F8F8FC] flex items-center justify-center gap-2">
                    {icon}
                    {title}
                </h1>
                {badgeContent && (
                    <div className="absolute top-1/2 right-0 transform -translate-y-1/2">
                        <span className="bg-purple-100 dark:bg-[#2A2A3A] dark:text-purple-700 text-purple-800 text-xs font-medium px-2.5 py-1 rounded-full flex items-center">
                            {badgeContent}
                        </span>
                    </div>
                )}
            </div>

            <div className="space-y-6">{children}</div>
        </div>
    );
};

export default BaseCardLayout;
