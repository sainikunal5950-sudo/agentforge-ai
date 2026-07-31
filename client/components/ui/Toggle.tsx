"use client";

import React from "react";

interface ToggleProps {
    label: string;
    description?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}

export default function Toggle({ label, description, checked, onChange, disabled }: ToggleProps) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-col pr-4">
                <span className="text-sm font-medium text-white/90">{label}</span>
                {description && <span className="text-xs text-white/50">{description}</span>}
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => !disabled && onChange(!checked)}
                disabled={disabled}
                className={`
                    relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                    transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-violet-500/50
                    ${checked ? "bg-violet-600" : "bg-white/10"}
                    ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                `}
            >
                <span
                    aria-hidden="true"
                    className={`
                        pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
                        transition duration-200 ease-in-out
                        ${checked ? "translate-x-5" : "translate-x-0"}
                    `}
                />
            </button>
        </div>
    );
}
