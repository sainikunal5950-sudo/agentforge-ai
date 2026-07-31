"use client";

import React, { useState, KeyboardEvent } from "react";

interface TagInputProps {
    label: string;
    tags: string[];
    onChange: (tags: string[]) => void;
    placeholder?: string;
    error?: string;
    hint?: string;
    disabled?: boolean;
}

export default function TagInput({ label, tags, onChange, placeholder = "Type and press enter...", error, hint, disabled }: TagInputProps) {
    const [inputValue, setInputValue] = useState("");

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            const newTag = inputValue.trim();
            if (newTag && !tags.includes(newTag)) {
                onChange([...tags, newTag]);
            }
            setInputValue("");
        } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
            e.preventDefault();
            onChange(tags.slice(0, -1));
        }
    };

    const removeTag = (tagToRemove: string) => {
        if (disabled) return;
        onChange(tags.filter((tag) => tag !== tagToRemove));
    };

    return (
        <div className="space-y-1.5">
            <label className="block text-sm font-medium text-white/70">
                {label}
            </label>

            <div
                className={`
                    w-full min-h-[44px] flex flex-wrap items-center gap-2 p-2 rounded-lg bg-white/5 border transition-all duration-200
                    focus-within:ring-2 focus-within:ring-violet-500/50 focus-within:border-violet-500/50
                    ${error ? "border-red-500/50 bg-red-500/5" : "border-white/10 hover:border-white/20"}
                    ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                `}
            >
                {tags.map((tag) => (
                    <span
                        key={tag}
                        className="flex items-center gap-1 bg-violet-600/20 text-violet-300 text-xs font-medium px-2.5 py-1 rounded-md"
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            disabled={disabled}
                            className="text-violet-400 hover:text-violet-200 focus:outline-none transition-colors"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </span>
                ))}
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    className="flex-1 min-w-[120px] bg-transparent outline-none text-white text-sm placeholder:text-white/20"
                    placeholder={tags.length === 0 ? placeholder : ""}
                />
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
