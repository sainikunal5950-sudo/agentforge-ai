import React from "react";
import { Agent } from "../../lib/types";

interface EmptyStateProps {
    agent: Agent;
    onPromptSelect: (prompt: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ agent, onPromptSelect }) => {
    // Generate some mock suggested prompts based on the agent's role/goal
    const suggestedPrompts = [
        `Tell me about your role as a ${agent.role || 'AI Assistant'}`,
        `How can you help me achieve: ${agent.goal?.substring(0, 30) || 'my objectives'}?`,
        "What are your core capabilities?",
        "Can you provide an example of your work?"
    ];

    return (
        <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto px-4 text-center mt-12 mb-20 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl shadow-xl shadow-indigo-500/20 mb-6 border border-white/10">
                🤖
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-2">{agent.name}</h1>
            <p className="text-indigo-400 font-medium mb-4">{agent.role || "AI Assistant"}</p>
            
            <p className="text-zinc-400 max-w-md mx-auto mb-10 leading-relaxed">
                {agent.description || agent.goal || "I am ready to assist you with your tasks."}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                {suggestedPrompts.map((prompt, index) => (
                    <button
                        key={index}
                        onClick={() => onPromptSelect(prompt)}
                        className="p-4 bg-zinc-900/50 hover:bg-zinc-800/80 border border-zinc-800 hover:border-indigo-500/50 rounded-xl text-left text-sm text-zinc-300 transition-all hover:-translate-y-1 group"
                    >
                        <span className="block text-indigo-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">Suggested</span>
                        {prompt}
                    </button>
                ))}
            </div>
        </div>
    );
};
