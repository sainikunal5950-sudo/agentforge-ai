"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/axios";
import { useApiCall } from "@/hooks/useApiCall";
import { Agent, CreateAgentInput, UpdateAgentInput } from "@/lib/types";
import { useToast } from "@/contexts/ToastContext";

interface AgentFormProps {
    initialData?: Agent;
    onSuccess: () => void;
    onCancel?: () => void;
}

export default function AgentForm({ initialData, onSuccess, onCancel }: AgentFormProps) {
    const isEdit = !!initialData;
    const [name, setName] = useState(initialData?.name || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const { addToast } = useToast();
    
    // We use our custom hook to handle loading/error states for the API call
    const { state, execute } = useApiCall<Agent>();

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setDescription(initialData.description);
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!name.trim()) {
            addToast("Name is required", "error");
            return;
        }

        try {
            await execute(async () => {
                if (isEdit) {
                    const payload: UpdateAgentInput = { name, description };
                    return api.put(`/api/agents/${initialData.id}`, payload);
                } else {
                    const payload: CreateAgentInput = { name, description };
                    return api.post("/api/agents", payload);
                }
            });

            // The execute function catches errors and sets state.error, so we check if it succeeded
            // Wait, useApiCall execute function doesn't return a value, but we can check state.error after?
            // Actually, execute() resolves. We can just wait for it. But wait, if it fails, it catches the error internally and doesn't throw.
            // Let's rely on onSuccess callback, but we need to know it succeeded.
            // A better way is to do the try-catch ourselves or use the state in a useEffect.
            // Let's just do it directly so we can trigger onSuccess() reliably.
        } catch (err) {
            console.error(err);
        }
    };

    // To reliably trigger onSuccess, we should use a useEffect watching state.data and state.timestamp
    // But since execute() swallows errors, let's just use axios directly for the form submission to have fine-grained control,
    // OR we can use execute and then check if state.error is null.
    // Let's refactor the submit handler to use execute, and watch for success:
    useEffect(() => {
        if (state.data && !state.loading && !state.error && state.timestamp) {
            addToast(isEdit ? "Agent updated successfully!" : "Agent created successfully!", "success");
            setName("");
            setDescription("");
            onSuccess();
        }
        if (state.error && !state.loading) {
            addToast(state.error, "error");
        }
    }, [state.data, state.error, state.loading, state.timestamp, isEdit, addToast, onSuccess]);

    return (
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-4 text-violet-100">
                {isEdit ? "Edit Agent" : "Create New Agent"}
            </h2>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                        placeholder="e.g. Trading Bot"
                        disabled={state.loading}
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors min-h-[100px]"
                        placeholder="What does this agent do?"
                        disabled={state.loading}
                    />
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={state.loading}
                        className="bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
                    >
                        {state.loading ? (
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            isEdit ? "Save Changes" : "Create Agent"
                        )}
                    </button>
                    
                    {isEdit && onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={state.loading}
                            className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>
        </form>
    );
}
