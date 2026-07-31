"use client";

import React from "react";

interface RadioOption {
    label: string;
    value: string;
    description?: string;
    icon?: React.ReactNode;
}

interface RadioCardsProps {
    options: RadioOption[];
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    columns?: 2 | 3 | 4;
}

export default function RadioCards({ options, value, onChange, disabled, columns = 2 }: RadioCardsProps) {
    const gridCols = {
        2: "grid-cols-1 sm:grid-cols-2",
        3: "grid-cols-1 sm:grid-cols-3",
        4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-4",
    }[columns];

    return (
        <div className={`grid gap-3 ${gridCols}`}>
            {options.map((option) => {
                const isSelected = value === option.value;
                return (
                    <div
                        key={option.value}
                        onClick={() => !disabled && onChange(option.value)}
                        className={`
                            relative flex cursor-pointer rounded-xl border p-4 shadow-sm focus:outline-none transition-all duration-200
                            ${isSelected ? "bg-violet-600/10 border-violet-500" : "bg-white/5 border-white/10 hover:border-white/20"}
                            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                        `}
                    >
                        <div className="flex flex-col flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <span className={`text-sm font-medium ${isSelected ? "text-violet-300" : "text-white/80"}`}>
                                    {option.label}
                                </span>
                                {isSelected && (
                                    <svg className="h-4 w-4 text-violet-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                            {option.description && (
                                <span className={`text-xs ${isSelected ? "text-violet-400/80" : "text-white/40"}`}>
                                    {option.description}
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
