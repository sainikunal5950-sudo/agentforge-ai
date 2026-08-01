"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import api from "../../../../lib/axios";
import { Agent, ChatMessage } from "../../../../lib/types";
import { ChatHeader } from "../../../../components/chat/ChatHeader";
import { ChatWindow } from "../../../../components/chat/ChatWindow";
import { ChatInput } from "../../../../components/chat/ChatInput";
import { EmptyState } from "../../../../components/chat/EmptyState";

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function ChatPage({ params }: PageProps) {
    const resolvedParams = use(params);
    const agentId = resolvedParams.id;
    const router = useRouter();

    const [agent, setAgent] = useState<Agent | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingAgent, setLoadingAgent] = useState(true);

    // Fetch Agent Details on Mount
    useEffect(() => {
        const fetchAgent = async () => {
            try {
                const res = await api.get(`/api/agents/${agentId}`);
                if (res.data) {
                    setAgent(res.data);
                }
            } catch (err: any) {
                console.error("Failed to load agent:", err);
                router.push("/agents"); // Redirect if agent doesn't exist or unauthorized
            } finally {
                setLoadingAgent(false);
            }
        };
        fetchAgent();
    }, [agentId, router]);

    const handleSendMessage = async (content: string) => {
        if (!content.trim() || isTyping) return;

        // 1. Add User Message to UI
        const newUserMsg: ChatMessage = {
            id: Date.now().toString(),
            role: "user",
            content: content,
            createdAt: new Date()
        };
        
        setMessages(prev => [...prev, newUserMsg]);
        setIsTyping(true);
        setError(null);

        // 2. Call backend execution engine
        try {
            const res = await api.post("/api/chat", {
                agentId,
                message: content
            });

            // The backend now returns { success, message, model, agentId, timestamp }
            if (res.data?.success && res.data?.message) {
                const newAiMsg: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: res.data.message,
                    createdAt: new Date()
                };
                setMessages(prev => [...prev, newAiMsg]);
            }
        } catch (err: any) {
            console.error("Chat Execution Error:", err);
            
            // Map the API error into the UI
            let errorMessage = "Failed to communicate with the AI Execution Engine.";
            
            if (err.response) {
                if (err.response.status === 501) {
                    errorMessage = err.response.data.message || "Model provider not yet implemented in backend.";
                } else if (err.response.status === 403) {
                    errorMessage = "Unauthorized access to this AI Employee.";
                } else if (err.response.data?.message) {
                    errorMessage = err.response.data.message;
                }
            }
            
            setError(errorMessage);
        } finally {
            setIsTyping(false);
        }
    };

    if (loadingAgent) {
        return (
            <div className="flex h-screen bg-black items-center justify-center">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!agent) {
        return null;
    }

    return (
        <div className="flex flex-col h-screen bg-black">
            <ChatHeader agent={agent} />
            
            <div className="flex-1 overflow-hidden flex flex-col relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black">
                {messages.length === 0 ? (
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <EmptyState agent={agent} onPromptSelect={handleSendMessage} />
                    </div>
                ) : (
                    <ChatWindow 
                        messages={messages} 
                        isTyping={isTyping} 
                        error={error} 
                        onErrorDismiss={() => setError(null)} 
                    />
                )}
                
                <div className="flex-shrink-0 bg-gradient-to-t from-black via-black to-transparent pt-4 pb-2">
                    <ChatInput 
                        onSendMessage={handleSendMessage} 
                        isDisabled={isTyping} 
                    />
                </div>
            </div>
        </div>
    );
}
