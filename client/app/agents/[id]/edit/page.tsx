"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import api from "@/lib/axios";
import AgentForm from "../../AgentForm";
import { Agent } from "@/lib/types";

export default function EditAgentPage() {
    const router = useRouter();
    const { id } = useParams<{ id: string }>();
    const [agent, setAgent] = useState<Agent | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        api.get(`/api/agents/${id}`)
            .then(res => setAgent(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
            </div>
        );
    }

    if (!agent) {
        return (
            <div className="text-center py-20 text-[var(--text-muted)]">
                Agent not found. <Link href="/agents" className="text-[var(--accent)]">Go back</Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
                <Link href="/agents" className="p-2 rounded-lg text-[var(--text-muted)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <span className="text-[var(--text-muted)] text-sm">Back to Agents</span>
            </div>
            <AgentForm
                initialData={agent}
                onSuccess={() => router.push("/agents")}
                onCancel={() => router.push("/agents")}
            />
        </div>
    );
}
