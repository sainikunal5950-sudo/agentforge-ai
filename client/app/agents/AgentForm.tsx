"use client";

import React, { useState } from "react";
import api from "@/lib/axios";
import { Agent } from "@/lib/types";
import { useToast } from "@/contexts/ToastContext";

// Import our new UI components
import { Card, CardSection } from "@/components/ui/Card";
import FormField from "@/components/ui/FormField";
import TextareaField from "@/components/ui/TextareaField";
import SelectField from "@/components/ui/SelectField";
import Toggle from "@/components/ui/Toggle";
import RadioCards from "@/components/ui/RadioCards";
import TagInput from "@/components/ui/TagInput";

interface AgentFormProps {
    initialData?: Agent;
    onSuccess: () => void;
    onCancel?: () => void;
}

export default function AgentForm({ initialData, onSuccess, onCancel }: AgentFormProps) {
    const isEdit = !!initialData;
    const { addToast } = useToast();
    
    // Form State
    const [name, setName] = useState(initialData?.name || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [role, setRole] = useState(initialData?.role || "");
    const [goal, setGoal] = useState(initialData?.goal || "");
    const [agentType, setAgentType] = useState(initialData?.agentType || "assistant");
    const [systemPrompt, setSystemPrompt] = useState(initialData?.systemPrompt || "");
    const [preferredModel, setPreferredModel] = useState(initialData?.preferredModel || "gpt-4o");
    const [temperature, setTemperature] = useState<number>(initialData?.temperature ?? 0.7);
    const [skills, setSkills] = useState<string[]>(initialData?.skills || []);
    const [memoryEnabled, setMemoryEnabled] = useState<boolean>(initialData?.memoryEnabled ?? false);
    const [executionMode, setExecutionMode] = useState<'manual' | 'automatic'>(initialData?.executionMode || "manual");
    const [visibility, setVisibility] = useState<'private' | 'team' | 'public'>(initialData?.visibility || "private");
    const [status, setStatus] = useState<'active' | 'inactive' | 'archived'>(initialData?.status || "active");

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!name.trim()) {
            addToast("Name is required", "error");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                name,
                description,
                role,
                goal,
                agentType,
                systemPrompt,
                preferredModel,
                temperature: Number(temperature),
                skills,
                memoryEnabled,
                executionMode,
                visibility,
                status
            };

            if (isEdit) {
                // Unified update endpoint handles both base info and config
                await api.put(`/api/agents/${initialData.id}`, payload);
                addToast("Agent updated successfully!", "success");
            } else {
                await api.post("/api/agents", payload);
                addToast("Agent created successfully!", "success");
            }
            onSuccess();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } }, message?: string };
            const msg = error.response?.data?.message || error.message || "Failed to save agent";
            addToast(msg, "error");
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
                        {isEdit ? "Agent Configuration" : "Deploy AI Agent"}
                    </h2>
                    <p className="text-[var(--text-muted)] text-sm">
                        {isEdit ? "Modify behavior, capabilities, and system parameters." : "Define identity, behavior, and capabilities for your new agent."}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {isEdit && onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isSubmitting}
                            className="btn-secondary"
                        >
                            Discard
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary min-w-[140px] flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            isEdit ? "Save Changes" : "Initialize Agent"
                        )}
                    </button>
                </div>
            </div>

            <Card className="mb-6 border-none shadow-none bg-transparent">
                <CardSection 
                    title="Basic Information" 
                    description="The foundational details that identify this agent across your workspace."
                >
                    <FormField
                        label="Agent Name *"
                        placeholder="e.g. Sales Development Representative"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isSubmitting}
                    />
                    <TextareaField
                        label="Description"
                        placeholder="Provide a brief summary of what this agent does."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={isSubmitting}
                    />
                </CardSection>

                <CardSection 
                    title="Identity & Purpose" 
                    description="Define the overarching objective and persona of the AI."
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                            label="Role"
                            placeholder="e.g. Code Reviewer"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            disabled={isSubmitting}
                        />
                        <SelectField
                            label="Agent Type"
                            value={agentType}
                            onChange={(e) => setAgentType(e.target.value)}
                            disabled={isSubmitting}
                            options={[
                                { label: "Assistant", value: "assistant" },
                                { label: "Worker (Autonomous)", value: "worker" },
                                { label: "Researcher", value: "researcher" },
                                { label: "Supervisor", value: "supervisor" }
                            ]}
                        />
                    </div>
                    <FormField
                        label="Goal"
                        placeholder="e.g. To identify bugs and suggest optimizations."
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        disabled={isSubmitting}
                    />
                </CardSection>

                <CardSection 
                    title="Behaviour" 
                    description="Configure the core model parameters and the system instructions."
                >
                    <TextareaField
                        label="System Prompt"
                        placeholder="You are an expert software engineer..."
                        value={systemPrompt}
                        onChange={(e) => setSystemPrompt(e.target.value)}
                        disabled={isSubmitting}
                        className="min-h-[200px] font-mono text-[13px] bg-[rgba(0,0,0,0.5)] border-[var(--border)] leading-relaxed"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <SelectField
                            label="Preferred Model"
                            value={preferredModel}
                            onChange={(e) => setPreferredModel(e.target.value)}
                            disabled={isSubmitting}
                            options={[
                                { label: "GPT-4o", value: "gpt-4o" },
                                { label: "Claude 3.5 Sonnet", value: "claude-3.5-sonnet" },
                                { label: "Gemini 1.5 Pro", value: "gemini-1.5-pro" },
                                { label: "Llama 3 (70B)", value: "llama-3-70b" }
                            ]}
                        />
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-white/70">Temperature ({temperature})</label>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={temperature}
                                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                                disabled={isSubmitting}
                                className="w-full accent-violet-500 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] text-white/40 mt-1 px-1">
                                <span>Precise</span>
                                <span>Creative</span>
                            </div>
                        </div>
                    </div>
                </CardSection>

                <CardSection 
                    title="Capabilities & Memory" 
                    description="Equip your agent with specific tools and long-term context."
                >
                    <TagInput
                        label="Skills (Tools)"
                        placeholder="e.g. WebSearch, ExecuteCode, ReadFiles..."
                        tags={skills}
                        onChange={setSkills}
                        disabled={isSubmitting}
                    />
                    <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/5">
                        <Toggle
                            label="Enable Long-Term Memory"
                            description="Allows the agent to recall past conversations and learn over time using a vector database."
                            checked={memoryEnabled}
                            onChange={setMemoryEnabled}
                            disabled={isSubmitting}
                        />
                    </div>
                </CardSection>

                <CardSection 
                    title="Execution & Visibility" 
                    description="Determine how this agent operates and who can see it."
                >
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-3">Execution Mode</label>
                            <RadioCards
                                value={executionMode}
                                onChange={(val) => setExecutionMode(val as 'manual' | 'automatic')}
                                disabled={isSubmitting}
                                options={[
                                    { label: "Manual", value: "manual", description: "Agent requires human approval before executing actions." },
                                    { label: "Automatic", value: "automatic", description: "Agent can execute actions fully autonomously." }
                                ]}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-3">Visibility</label>
                            <RadioCards
                                value={visibility}
                                onChange={(val) => setVisibility(val as 'private' | 'team' | 'public')}
                                disabled={isSubmitting}
                                columns={3}
                                options={[
                                    { label: "Private", value: "private", description: "Only you can use this agent." },
                                    { label: "Team", value: "team", description: "Your organization can use it." },
                                    { label: "Public", value: "public", description: "Anyone can discover it." }
                                ]}
                            />
                        </div>
                    </div>
                </CardSection>

                <CardSection 
                    title="Agent Status" 
                    description="Current operational status of this agent."
                    isLast={true}
                >
                    <RadioCards
                        value={status}
                        onChange={(val) => setStatus(val as 'active' | 'inactive' | 'archived')}
                        disabled={isSubmitting}
                        columns={3}
                        options={[
                            { label: "Active", value: "active", description: "Online and ready." },
                            { label: "Inactive", value: "inactive", description: "Offline, cannot be invoked." },
                            { label: "Archived", value: "archived", description: "Hidden from views." }
                        ]}
                    />
                </CardSection>
            </Card>
        </form>
    );
}
