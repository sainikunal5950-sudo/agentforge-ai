"use client";

import React, { useState } from "react";
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
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || "Failed to delete agent";
            addToast(msg, "error");
        } finally {
            setIsDeleting(false);
        }
    };

    // Helper to format date
    const formattedDate = new Date(agent.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

    return (
        <div className="bg-[#12121a] border border-white/5 rounded-xl p-5 hover:border-violet-500/30 transition-colors group">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-violet-400 transition-colors">
                        {agent.name}
                    </h3>
                    <p className="text-[10px] text-white/30 font-mono">ID: {agent.id}</p>
                </div>
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onEdit(agent)}
                        disabled={isDeleting}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
                        title="Edit Agent"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-colors"
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
            
            <p className="text-sm text-white/60 mb-4 line-clamp-3 min-h-[60px]">
                {agent.description || "No description provided."}
            </p>
            
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <span className="text-[11px] text-white/40">Created {formattedDate}</span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-medium uppercase tracking-wide">
                    Active
                </span>
            </div>
        </div>
    );
}
