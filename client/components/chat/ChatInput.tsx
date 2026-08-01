import React, { useState, useRef, useEffect } from "react";

interface ChatInputProps {
    onSendMessage: (message: string) => void;
    isDisabled: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isDisabled }) => {
    const [inputValue, setInputValue] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize the textarea based on content
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [inputValue]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleSubmit = () => {
        const trimmed = inputValue.trim();
        if (!trimmed || isDisabled) return;
        
        onSendMessage(trimmed);
        setInputValue("");
        
        // Reset height
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto px-4 pb-6 pt-2">
            <div className="relative flex items-end bg-zinc-900 border border-zinc-700/50 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 rounded-2xl p-2 transition-all shadow-lg shadow-black/20">
                <textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isDisabled}
                    placeholder="Message AI Employee..."
                    className="w-full max-h-[200px] bg-transparent text-zinc-100 placeholder-zinc-500 resize-none outline-none py-3 px-4 custom-scrollbar min-h-[52px]"
                    rows={1}
                />
                
                <button
                    onClick={handleSubmit}
                    disabled={!inputValue.trim() || isDisabled}
                    className="flex-shrink-0 mb-1 ml-2 w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-all disabled:opacity-50 disabled:hover:bg-indigo-600 focus:outline-none"
                    aria-label="Send message"
                >
                    <svg className="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </button>
            </div>
            <div className="text-center mt-3 text-[10px] text-zinc-500">
                AI employees can make mistakes. Verify important information.
            </div>
        </div>
    );
};
