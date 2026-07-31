"use client";

import React from "react";

interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    error?: string;
    hint?: string;
}

export default function TextareaField({ label, error, hint, id, ...rest }: TextareaFieldProps) {
    const fieldId = id || label.toLowerCase().replace(/\s+/g, "-");

    return (
        <div className="space-y-1.5">
            <label htmlFor={fieldId} className="block text-sm font-medium text-white/70">
                {label}
            </label>

            <textarea
                id={fieldId}
                {...rest}
                className={`
                    w-full px-4 py-2.5 rounded-lg bg-white/5 border text-white text-sm
                    placeholder:text-white/20 outline-none transition-all duration-200
                    focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50
                    min-h-[100px] resize-y
                    ${error ? "border-red-500/50 bg-red-500/5" : "border-white/10 hover:border-white/20"}
                `}
            />

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
