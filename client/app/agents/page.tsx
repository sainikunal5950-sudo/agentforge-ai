"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Agent } from "@/lib/types";
import api from "@/lib/axios";
import { useApiCall } from "@/hooks/useApiCall";
import AgentCard from "./AgentCard";
import AgentForm from "./AgentForm";
import { useToast } from "@/contexts/ToastContext";

export default function AgentsDashboard() {
    const { state, execute } = useApiCall<Agent[]>();
    const [editingAgent, setEditingAgent] = useState<Agent | undefined>(undefined);
    const { addToast } = useToast();

    // Fetch agents on mount
    const fetchAgents = useCallback(() => {
        execute(() => api.get("/api/agents")).catch((err) => {
            console.error(err);
        });
    }, [execute]);

    useEffect(() => {
        fetchAgents();
    }, [fetchAgents]);

    // Show error toast if fetching fails
    useEffect(() => {
        if (state.error && !state.loading) {
            addToast(`Failed to load agents: ${state.error}`, "error");
        }
    }, [state.error, state.loading, addToast]);

    const handleSuccess = useCallback(() => {
        setEditingAgent(undefined); // Close edit mode if active
        fetchAgents(); // Refresh the list
    }, [fetchAgents]);

    const handleCancelEdit = useCallback(() => {
        setEditingAgent(undefined);
    }, []);

    const agentsList = Array.isArray(state.data) ? state.data : null;

    return (
        <div className="pb-12">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Agent Management</h1>
                <p className="text-white/60">Create, configure, and manage your AI agents.</p>
            </div>

            {/* Form Section: Reused for Create and Edit */}
            <AgentForm 
                key={editingAgent ? editingAgent.id : "new-agent"}
                initialData={editingAgent} 
                onSuccess={handleSuccess} 
                onCancel={editingAgent ? handleCancelEdit : undefined} 
            />

            {/* List Section */}
            <div className="mt-10">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">Your Agents</h2>
                    <span className="text-sm text-white/40 bg-white/5 px-3 py-1 rounded-full">
                        {agentsList ? agentsList.length : 0} Total
                    </span>
                </div>

                {state.loading && !agentsList ? (
                    <div className="flex flex-col items-center justify-center py-20 text-white/50">
                        <span className="w-8 h-8 border-4 border-white/10 border-t-violet-500 rounded-full animate-spin mb-4"></span>
                        <p>Loading your agents...</p>
                    </div>
                ) : !agentsList || agentsList.length === 0 ? (
                    <div className="border border-dashed border-white/10 rounded-2xl p-12 text-center bg-white/5">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">🤖</span>
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">No agents found</h3>
                        <p className="text-white/50 max-w-sm mx-auto">
                            You haven&apos;t created any agents yet. Use the form above to get started.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {agentsList.map((agent) => (
                            <AgentCard
                                key={agent.id}
                                agent={agent}
                                onEdit={(a) => {
                                    setEditingAgent(a);
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                                onDeleteSuccess={fetchAgents}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
