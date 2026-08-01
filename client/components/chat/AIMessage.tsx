import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { ChatMessage } from "../../lib/types";

interface AIMessageProps {
    message: ChatMessage;
}

export const AIMessage: React.FC<AIMessageProps> = ({ message }) => {
    return (
        <div className="flex justify-start mb-6 w-full group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0 flex items-center justify-center text-sm shadow-md mt-1 mr-3 border border-white/10">
                🤖
            </div>
            <div className="flex-1 max-w-[85%] md:max-w-[75%] min-w-0">
                <div className="text-zinc-200 bg-transparent py-1 prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            code({ node, inline, className, children, ...props }: any) {
                                const match = /language-(\w+)/.exec(className || "");
                                const language = match ? match[1] : "";
                                const content = String(children).replace(/\n$/, "");
                                
                                if (!inline && match) {
                                    return <CodeBlock language={language} content={content} />;
                                }
                                
                                return (
                                    <code className="bg-zinc-800 text-indigo-300 px-1.5 py-0.5 rounded text-sm font-mono break-words" {...props}>
                                        {children}
                                    </code>
                                );
                            },
                            table({ children }) {
                                return (
                                    <div className="overflow-x-auto my-4 border border-zinc-800 rounded-lg">
                                        <table className="w-full border-collapse text-sm">{children}</table>
                                    </div>
                                );
                            },
                            th({ children }) {
                                return <th className="border-b border-zinc-800 bg-zinc-900/50 px-4 py-2 text-left font-medium text-zinc-300">{children}</th>;
                            },
                            td({ children }) {
                                return <td className="border-b border-zinc-800 px-4 py-2 text-zinc-400">{children}</td>;
                            },
                            a({ href, children }) {
                                return <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">{children}</a>;
                            },
                            ul({ children }) {
                                return <ul className="list-disc pl-5 my-3 space-y-1">{children}</ul>;
                            },
                            ol({ children }) {
                                return <ol className="list-decimal pl-5 my-3 space-y-1">{children}</ol>;
                            }
                        }}
                    >
                        {message.content}
                    </ReactMarkdown>
                </div>
                <div className="text-[10px] text-zinc-500 mt-2 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {message.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        </div>
    );
};

// ── Custom Code Block Component with Copy Button ──────────────────────────────

interface CodeBlockProps {
    language: string;
    content: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, content }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy code: ", err);
        }
    };

    return (
        <div className="relative my-4 rounded-xl overflow-hidden border border-zinc-800 bg-[#1E1E1E]">
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/80 border-b border-zinc-800 text-xs">
                <span className="text-zinc-400 font-mono lowercase">{language || "text"}</span>
                <button
                    onClick={handleCopy}
                    className="flex items-center space-x-1.5 text-zinc-400 hover:text-white transition-colors focus:outline-none"
                    aria-label="Copy code"
                >
                    {copied ? (
                        <>
                            <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-green-400">Copied!</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span>Copy</span>
                        </>
                    )}
                </button>
            </div>
            <SyntaxHighlighter
                language={language}
                style={vscDarkPlus as any}
                customStyle={{
                    margin: 0,
                    padding: "1rem",
                    backgroundColor: "transparent",
                    fontSize: "0.875rem",
                }}
                wrapLongLines={true}
            >
                {content}
            </SyntaxHighlighter>
        </div>
    );
};
