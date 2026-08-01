"use client";

import React, { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, AlertCircle, Copy, RotateCcw, MoreHorizontal } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

import api from "@/lib/axios";
import { Agent, ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function ChatPage({ params }: PageProps) {
    const resolvedParams = use(params);
    const agentId = resolvedParams.id;
    const router = useRouter();

    const [agent, setAgent] = useState<Agent | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingAgent, setLoadingAgent] = useState(true);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const fetchAgent = async () => {
            try {
                const res = await api.get(`/api/agents/${agentId}`);
                if (res.data) setAgent(res.data);
            } catch (err) {
                console.error("Failed to load agent:", err);
                router.push("/agents");
            } finally {
                setLoadingAgent(false);
            }
        };
        fetchAgent();
    }, [agentId, router]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    };

    const handleSendMessage = async () => {
        if (!input.trim() || isTyping) return;

        const content = input;
        setInput("");
        if (textareaRef.current) textareaRef.current.style.height = "auto";

        const newUserMsg: ChatMessage = {
            id: Date.now().toString(),
            role: "user",
            content: content,
            createdAt: new Date()
        };
        
        setMessages(prev => [...prev, newUserMsg]);
        setIsTyping(true);
        setError(null);

        const startTime = Date.now();

        try {
            const res = await api.post("/api/chat", { agentId, message: content });

            if (res.data?.success && res.data?.message) {
                const responseTimeMs = Date.now() - startTime;
                const newAiMsg: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: res.data.message,
                    createdAt: new Date(),
                    // @ts-ignore
                    metadata: {
                        model: res.data.modelUsed || agent?.preferredModel || "Groq",
                        timeMs: responseTimeMs
                    }
                };
                setMessages(prev => [...prev, newAiMsg]);
            }
        } catch (err: any) {
            console.error("Chat Execution Error:", err);
            let errorMessage = "Failed to communicate with the AI Execution Engine.";
            
            if (err.response) {
                if (err.response.status === 501) errorMessage = err.response.data.message || "Model provider not yet implemented.";
                else if (err.response.status === 403) errorMessage = "Unauthorized access to this AI Employee.";
                else if (err.response.data?.message) errorMessage = err.response.data.message;
            }
            
            setError(errorMessage);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (loadingAgent) {
        return (
            <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[var(--text-muted)] text-sm">Initializing Secure Connection...</p>
                </div>
            </div>
        );
    }

    if (!agent) return null;

    return (
        <div className="flex flex-col h-[calc(100vh-10rem)] max-w-4xl mx-auto w-full relative">
            
            {/* Chat History */}
            <div className="flex-1 overflow-y-auto pb-32 pr-2 custom-scrollbar">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-80">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[rgba(99,102,241,0.2)] to-[rgba(139,92,246,0.2)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(99,102,241,0.15)]">
                            <Bot className="w-8 h-8 text-[var(--accent)]" />
                        </div>
                        <h2 className="text-2xl font-semibold text-white mb-2">Chat with {agent.name}</h2>
                        <p className="text-[var(--text-muted)] max-w-md mb-8">
                            This agent is configured as a {agent.role}. Ask it anything to test its behavior and capabilities.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                            {["What are your main goals?", "Help me understand your role.", "Are you ready for deployment?"].map((prompt, i) => (
                                <button 
                                    key={i}
                                    onClick={() => { setInput(prompt); setTimeout(() => textareaRef.current?.focus(), 50); }}
                                    className="p-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[var(--border)] hover:bg-[rgba(255,255,255,0.06)] hover:border-[var(--border-strong)] transition-all text-sm text-left text-[var(--text-muted)] hover:text-white"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <AnimatePresence initial={false}>
                            {messages.map((msg) => (
                                <motion.div 
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={cn("flex gap-4 w-full", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
                                >
                                    {/* Avatar */}
                                    <div className="flex-shrink-0 mt-1">
                                        {msg.role === "user" ? (
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--emerald)] to-[var(--cyan)] flex items-center justify-center shadow-lg">
                                                <User className="w-4 h-4 text-white" />
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--violet)] to-[var(--accent)] flex items-center justify-center shadow-lg shadow-[var(--accent-glow)]">
                                                <Bot className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Message Bubble */}
                                    <div className={cn(
                                        "max-w-[85%] group",
                                        msg.role === "user" ? "items-end" : "items-start"
                                    )}>
                                        <div className={cn(
                                            "rounded-2xl px-5 py-3.5 text-[0.95rem] leading-relaxed",
                                            msg.role === "user" 
                                                ? "bg-[rgba(255,255,255,0.08)] border border-[var(--border)] text-white" 
                                                : "bg-transparent text-[var(--text-primary)] prose prose-invert prose-p:leading-relaxed prose-pre:my-0"
                                        )}>
                                            {msg.role === "user" ? (
                                                msg.content
                                            ) : (
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    components={{
                                                        code({node, inline, className, children, ...props}: any) {
                                                            const match = /language-(\w+)/.exec(className || "");
                                                            return !inline && match ? (
                                                                <div className="rounded-xl overflow-hidden my-4 border border-[var(--border)]">
                                                                    <div className="flex justify-between items-center px-4 py-2 bg-[rgba(0,0,0,0.5)] border-b border-[var(--border)]">
                                                                        <span className="text-xs font-mono text-[var(--text-muted)]">{match[1]}</span>
                                                                        <button className="text-[var(--text-faint)] hover:text-white transition-colors">
                                                                            <Copy className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    </div>
                                                                    <SyntaxHighlighter
                                                                        {...props}
                                                                        style={vscDarkPlus}
                                                                        language={match[1]}
                                                                        PreTag="div"
                                                                        customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}
                                                                    >
                                                                        {String(children).replace(/\n$/, "")}
                                                                    </SyntaxHighlighter>
                                                                </div>
                                                            ) : (
                                                                <code {...props} className={className}>
                                                                    {children}
                                                                </code>
                                                            );
                                                        }
                                                    }}
                                                >
                                                    {msg.content}
                                                </ReactMarkdown>
                                            )}
                                        </div>
                                        
                                        {/* Assistant Metadata / Actions */}
                                        {msg.role === "assistant" && (
                                            <div className="flex items-center gap-3 mt-2 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="text-[var(--text-faint)] hover:text-white transition-colors" title="Copy response">
                                                    <Copy className="w-3.5 h-3.5" />
                                                </button>
                                                <button className="text-[var(--text-faint)] hover:text-white transition-colors" title="Regenerate">
                                                    <RotateCcw className="w-3.5 h-3.5" />
                                                </button>
                                                <div className="w-px h-3 bg-[var(--border)]" />
                                                {/* @ts-ignore */}
                                                {msg.metadata?.model && (
                                                    // @ts-ignore
                                                    <span className="text-xs font-mono text-[var(--text-faint)]">model: {msg.metadata.model}</span>
                                                )}
                                                {/* @ts-ignore */}
                                                {msg.metadata?.timeMs && (
                                                    // @ts-ignore
                                                    <span className="text-xs font-mono text-[var(--text-faint)]">{msg.metadata.timeMs}ms</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Typing Indicator */}
                        {isTyping && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 w-full">
                                <div className="flex-shrink-0 mt-1">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--violet)] to-[var(--accent)] flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                                        <Bot className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 h-10 px-4">
                                    <span className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </motion.div>
                        )}
                        
                        {/* Error Message */}
                        {error && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center my-4">
                                <div className="bg-[rgba(244,63,94,0.1)] border border-[rgba(244,63,94,0.2)] rounded-xl px-4 py-3 flex items-center gap-3 text-[var(--rose)] max-w-lg w-full">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <div className="flex-1 text-sm font-medium">{error}</div>
                                    <button onClick={handleSendMessage} className="px-3 py-1 rounded bg-[rgba(244,63,94,0.15)] hover:bg-[rgba(244,63,94,0.25)] text-xs font-semibold transition-colors">
                                        Retry
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        <div ref={messagesEndRef} className="h-4" />
                    </div>
                )}
            </div>

            {/* Input Area (Floating) */}
            <div className="absolute bottom-4 left-0 w-full z-10 px-2 sm:px-0">
                <div className="relative glass-panel bg-[rgba(18,18,20,0.85)] p-2 shadow-2xl shadow-black">
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={handleInput}
                        onKeyDown={handleKeyDown}
                        disabled={isTyping}
                        placeholder={`Message ${agent.name}...`}
                        className="w-full bg-transparent text-white placeholder:text-[var(--text-faint)] resize-none outline-none py-3 px-4 pr-14 max-h-48 custom-scrollbar text-[0.95rem]"
                        rows={1}
                        style={{ minHeight: "56px" }}
                    />
                    
                    <div className="absolute right-4 bottom-3 flex items-center gap-2">
                        <button 
                            className="p-2 rounded-lg text-[var(--text-faint)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors hidden sm:block"
                            title="Tools / Settings"
                        >
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleSendMessage}
                            disabled={!input.trim() || isTyping}
                            className={cn(
                                "p-2 rounded-lg transition-all flex items-center justify-center",
                                input.trim() && !isTyping 
                                    ? "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] hover:shadow-lg hover:shadow-[var(--accent-glow)]" 
                                    : "bg-[rgba(255,255,255,0.05)] text-[var(--text-faint)]"
                            )}
                        >
                            <Send className="w-4 h-4 ml-0.5" />
                        </button>
                    </div>
                </div>
                <div className="text-center mt-2">
                    <p className="text-[10px] text-[var(--text-faint)] font-medium">
                        AgentForge AI Execution Engine can make mistakes. Consider verifying important information.
                    </p>
                </div>
            </div>
        </div>
    );
}
