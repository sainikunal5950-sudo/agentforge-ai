"use client";

import { History } from "lucide-react";
import Link from "next/link";

export default function HistoryPage() {
    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Conversation History</h1>
                <p className="text-[var(--text-muted)] text-sm">View and resume past conversations with your AI workforce.</p>
            </div>

            <div className="glass-panel p-12 text-center flex flex-col items-center justify-center border-dashed border-2 border-[var(--border)] min-h-[400px]">
                <div className="w-16 h-16 rounded-full bg-[rgba(255,255,255,0.02)] flex items-center justify-center mb-6 border border-[var(--border)] shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                    <History className="w-8 h-8 text-[var(--text-muted)]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Feature Coming Soon</h3>
                <p className="text-[var(--text-muted)] mb-8 max-w-md leading-relaxed">
                    The conversation history module is currently under development. Soon, you'll be able to search, resume, and fork past AI executions.
                </p>
                <Link href="/agents" className="btn-secondary">
                    Back to Agents
                </Link>
            </div>
        </div>
    );
}
