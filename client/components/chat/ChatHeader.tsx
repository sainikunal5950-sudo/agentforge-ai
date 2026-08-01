import React from "react";
import Link from "next/link";
import { Agent } from "../../lib/types";

interface ChatHeaderProps {
    agent: Agent;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ agent }) => {
    return (
        <header className="sticky top-0 z-10 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/50 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
                <Link href="/agents" className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-lg shadow-lg">
                        🤖
                    </div>
                    <div>
                        <h2 className="text-white font-semibold leading-tight">{agent.name}</h2>
                        <div className="flex items-center space-x-2 text-xs mt-0.5">
                            <span className="text-zinc-400">{agent.role || 'Assistant'}</span>
                            <span className="text-zinc-700">•</span>
                            <div className="flex items-center space-x-1">
                                <span className={`w-2 h-2 rounded-full ${
                                    agent.status === 'active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 
                                    agent.status === 'inactive' ? 'bg-zinc-500' : 'bg-red-500'
                                }`}></span>
                                <span className="text-zinc-500 capitalize">{agent.status || 'Active'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="hidden sm:flex items-center space-x-3 text-xs">
                <div className="flex items-center space-x-1.5 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-full text-zinc-400">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    <span>{agent.preferredModel || 'gpt-4o'}</span>
                </div>
                <div className="flex items-center space-x-1.5 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-full text-zinc-400">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="capitalize">{agent.executionMode || 'Manual'}</span>
                </div>
            </div>
        </header>
    );
};
