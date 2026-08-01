import React, { useRef, useEffect } from "react";
import { ChatMessage } from "../../lib/types";
import { UserMessage } from "./UserMessage";
import { AIMessage } from "./AIMessage";
import { LoadingIndicator } from "./LoadingIndicator";
import { ErrorBanner } from "./ErrorBanner";

interface ChatWindowProps {
    messages: ChatMessage[];
    isTyping: boolean;
    error: string | null;
    onErrorDismiss: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isTyping, error, onErrorDismiss }) => {
    const bottomRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logic: Scroll to bottom whenever messages array changes or isTyping changes
    // A production app might check if the user has scrolled up to prevent auto-scrolling,
    // but for this iteration, we keep it strictly scrolling to the newest message.
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    return (
        <div 
            ref={containerRef}
            className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth w-full max-w-4xl mx-auto custom-scrollbar"
        >
            {messages.map((msg) => (
                msg.role === "user" ? (
                    <UserMessage key={msg.id} message={msg} />
                ) : (
                    <AIMessage key={msg.id} message={msg} />
                )
            ))}

            {isTyping && (
                <div className="flex justify-start mb-6">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0 flex items-center justify-center text-sm shadow-md mt-1 mr-3 border border-white/10 opacity-50">
                        🤖
                    </div>
                    <div className="bg-zinc-900/50 rounded-2xl rounded-tl-sm px-4 shadow-sm border border-zinc-800/50">
                        <LoadingIndicator />
                    </div>
                </div>
            )}

            {error && (
                <div className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <ErrorBanner message={error} onRetry={onErrorDismiss} />
                </div>
            )}

            {/* Invisible div to scroll to */}
            <div ref={bottomRef} className="h-4" />
        </div>
    );
};
