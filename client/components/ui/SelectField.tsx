"use client";

import React from "react";

interface Option {
    label: string;
    value: string;
}

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    options: Option[];
    error?: string;
    hint?: string;
}

export default function SelectField({ label, options, error, hint, id, ...rest }: SelectFieldProps) {
    const fieldId = id || label.toLowerCase().replace(/\s+/g, "-");

    return (
        <div className="space-y-1.5">
            <label htmlFor={fieldId} className="block text-sm font-medium text-white/70">
                {label}
            </label>

            <div className="relative">
                <select
                    id={fieldId}
                    {...rest}
                    className={`
                        w-full px-4 py-2.5 rounded-lg bg-white/5 border text-white text-sm appearance-none
                        outline-none transition-all duration-200 cursor-pointer
                        focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50
                        ${error ? "border-red-500/50 bg-red-500/5" : "border-white/10 hover:border-white/20"}
                    `}
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-gray-900 text-white">
                            {opt.label}
                        </option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-white/50">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {hint && !error && (
                <p className="text-xs text-white/30">{hint}</p>
            )}
            {error && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                    <span>⚠</span> {error}
                </p>
            )}
        </div>
    );
}
