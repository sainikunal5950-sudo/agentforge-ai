"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bot } from "lucide-react";
import {
    Plus,
    MessageSquare,
    Settings,
    MoreHorizontal,
    BrainCircuit,
    Activity
} from "lucide-react";
import api from "@/lib/axios";

export default function AgentsPage() {
    const router = useRouter();
    const [agents, setAgents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAgents = async () => {
            try {
                const res = await api.get("/api/agents");
                setAgents(res.data);
            } catch (err: any) {
                if (err.response?.status === 401) {
                    router.push("/auth/login");
                    return;
                }
                console.error("Failed to load agents", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAgents();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center mb-8">
                    <div className="h-8 w-48 bg-[rgba(255,255,255,0.05)] rounded animate-pulse" />
                    <div className="h-10 w-32 bg-[rgba(255,255,255,0.05)] rounded animate-pulse" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 glass-card animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1">AI Agents</h1>
                    <p className="text-[var(--text-muted)] text-sm">Manage and configure your autonomous AI workforce.</p>
                </div>
                <Link href="/agents/create" className="btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    New Agent
                </Link>
            </div>

            {agents.length === 0 ? (
                <div className="glass-panel p-12 text-center flex flex-col items-center justify-center border-dashed border-2 border-[var(--border)]">
                    <div className="w-16 h-16 rounded-full bg-[rgba(255,255,255,0.02)] flex items-center justify-center mb-4 border border-[var(--border)]">
                        <BrainCircuit className="w-8 h-8 text-[var(--text-muted)]" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No agents found</h3>
                    <p className="text-[var(--text-muted)] mb-6 max-w-sm">
                        You haven't created any AI agents yet. Start by defining an agent's role and capabilities.
                    </p>
                    <Link href="/agents/create" className="btn-primary">
                        Create Your First Agent
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {agents.map((agent, index) => (
                        <motion.div
                            key={agent._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="glass-card flex flex-col overflow-hidden group"
                        >
                            {/* Card Header */}
                            <div className="p-5 border-b border-[var(--border)]">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[rgba(99,102,241,0.2)] to-[rgba(139,92,246,0.2)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center">
                                        <Bot className="w-5 h-5 text-[var(--accent)]" />
                                    </div>
                                    <button className="text-[var(--text-faint)] hover:text-white transition-colors">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>
                                </div>

                                <h3 className="text-lg font-semibold text-white truncate" title={agent.name}>
                                    {agent.name}
                                </h3>
                                <p className="text-sm text-[var(--text-muted)] mt-1 truncate" title={agent.role}>
                                    {agent.role || "No role specified"}
                                </p>
                            </div>

                            {/* Card Body (Badges) */}
                            <div className="p-5 flex-1 flex flex-col gap-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="badge badge-emerald gap-1.5">
                                        <Activity className="w-3 h-3" />
                                        {agent.status || "Active"}
                                    </span>
                                    <span className="badge badge-violet">
                                        {agent.preferredModel || "Default"}
                                    </span>
                                </div>
                                <p className="text-xs text-[var(--text-faint)] mt-auto line-clamp-2">
                                    {agent.description || "No description provided."}
                                </p>
                            </div>

                            {/* Card Actions */}
                            <div className="p-3 bg-[rgba(255,255,255,0.02)] border-t border-[var(--border)] flex items-center gap-2">
                                <Link
                                    href={`/agents/${agent._id}/chat`}
                                    className="flex-1 btn-primary bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[var(--border)] shadow-none text-center flex items-center justify-center gap-2 py-2"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    Chat
                                </Link>
                                <Link
                                    href={`/agents/${agent._id}/edit`}
                                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-[rgba(255,255,255,0.05)] border border-[var(--border)] text-[var(--text-muted)] hover:text-white hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                                >
                                    <Settings className="w-4 h-4" />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
