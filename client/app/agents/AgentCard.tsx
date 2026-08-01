"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Agent } from "@/lib/types";
import api from "@/lib/axios";
import { useToast } from "@/contexts/ToastContext";

interface AgentCardProps {
    agent: Agent;
    onEdit: (agent: Agent) => void;
    onDeleteSuccess: () => void;
}

export default function AgentCard({ agent, onEdit, onDeleteSuccess }: AgentCardProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const { addToast } = useToast();

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this agent? This action cannot be undone.")) {
            return;
        }
        
        setIsDeleting(true);
        try {
            await api.delete(`/api/agents/${agent.id}`);
            addToast("Agent deleted successfully!", "success");
            onDeleteSuccess();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } }, message?: string };
            const msg = error.response?.data?.message || error.message || "Failed to delete agent";
            addToast(msg, "error");
        } finally {
            setIsDeleting(false);
        }
    };

    // Helper to format string values (capitalize first letter)
    const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : "";

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "active":
                return <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-medium uppercase tracking-wide border border-emerald-500/20">Active</span>;
            case "inactive":
                return <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-medium uppercase tracking-wide border border-amber-500/20">Inactive</span>;
            case "archived":
                return <span className="px-2.5 py-1 rounded-full bg-white/5 text-white/40 text-[10px] font-medium uppercase tracking-wide border border-white/10">Archived</span>;
            default:
                return <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-medium uppercase tracking-wide border border-emerald-500/20">Active</span>;
        }
    };

    return (
        <div className="bg-[#12121a] border border-white/5 rounded-xl p-5 hover:border-violet-500/30 transition-all group flex flex-col h-full shadow-lg">
            {/* Header */}
            <div className="flex justify-between items-start mb-2">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-white group-hover:text-violet-400 transition-colors">
                            {agent.name}
                        </h3>
                        {agent.agentType && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-violet-500/10 text-violet-300 border border-violet-500/20">
                                {capitalize(agent.agentType)}
                            </span>
                        )}
                    </div>
                    {agent.role && (
                        <p className="text-xs text-white/50 font-medium">{agent.role}</p>
                    )}
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                        href={`/agents/${agent.id}/chat`}
                        className="p-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg text-indigo-400 hover:text-indigo-300 transition-colors"
                        title="Chat with Agent"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </Link>
                    <button
                        onClick={() => onEdit(agent)}
                        disabled={isDeleting}
                        className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
                        title="Edit Agent"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-colors"
                        title="Delete Agent"
                    >
                        {isDeleting ? (
                            <span className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin block"></span>
                        ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
            
            {/* Description */}
            <p className="text-sm text-white/60 mb-5 line-clamp-2 min-h-[40px]">
                {agent.description || "No description provided."}
            </p>
            
            {/* Specs Grid */}
            <div className="grid grid-cols-2 gap-y-3 gap-x-2 mb-5 mt-auto">
                <div className="flex flex-col">
                    <span className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">Model</span>
                    <span className="text-xs text-white/80 font-medium">{agent.preferredModel || "N/A"}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">Temp</span>
                    <span className="text-xs text-white/80 font-medium">{agent.temperature ?? "N/A"}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">Memory</span>
                    <span className="text-xs text-white/80 font-medium">{agent.memoryEnabled ? "Enabled" : "Disabled"}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">Execution</span>
                    <span className="text-xs text-white/80 font-medium">{capitalize(agent.executionMode || "") || "N/A"}</span>
                </div>
                <div className="flex flex-col col-span-2 mt-1">
                    <span className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">Visibility</span>
                    <span className="text-xs text-white/80 font-medium">{capitalize(agent.visibility || "") || "N/A"}</span>
                </div>
            </div>
            
            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                <span className="text-[10px] text-white/30 font-mono">ID: {agent.id.slice(-6)}</span>
                {getStatusBadge(agent.status || "active")}
            </div>
        </div>
    );
}
