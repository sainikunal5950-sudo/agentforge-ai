import React from "react";
import { ChatMessage } from "../../lib/types";

interface UserMessageProps {
    message: ChatMessage;
}

export const UserMessage: React.FC<UserMessageProps> = ({ message }) => {
    return (
        <div className="flex justify-end mb-6">
            <div className="max-w-[85%] md:max-w-[75%] bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-5 py-3 shadow-sm">
                <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                <div className="text-[10px] text-indigo-200 mt-2 text-right opacity-80">
                    {message.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        </div>
    );
};
