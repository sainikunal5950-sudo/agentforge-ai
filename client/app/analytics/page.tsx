"use client";

import { Sparkles, Activity, Clock, Database, Zap } from "lucide-react";

export default function AnalyticsPage() {
    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Analytics Overview</h1>
                <p className="text-[var(--text-muted)] text-sm">Monitor agent performance, token usage, and system health.</p>
            </div>

            {/* Placeholder Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                    { label: "Token Usage", value: "Coming Soon", icon: Database, color: "text-[var(--violet)]" },
                    { label: "Total Cost", value: "Coming Soon", icon: Zap, color: "text-[var(--amber)]" },
                    { label: "Avg Latency", value: "Coming Soon", icon: Clock, color: "text-[var(--cyan)]" },
                    { label: "Success Rate", value: "Coming Soon", icon: Activity, color: "text-[var(--emerald)]" },
                ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="glass-card p-6 opacity-60 pointer-events-none">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 rounded-xl bg-[rgba(255,255,255,0.02)]">
                                    <Icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-1">{stat.value}</h3>
                            <p className="text-sm font-medium text-[var(--text-muted)]">{stat.label}</p>
                        </div>
                    );
                })}
            </div>

            <div className="glass-panel p-12 text-center flex flex-col items-center justify-center border-dashed border-2 border-[var(--border)] min-h-[300px]">
                <div className="w-16 h-16 rounded-full bg-[rgba(255,255,255,0.02)] flex items-center justify-center mb-6 border border-[var(--border)]">
                    <Sparkles className="w-8 h-8 text-[var(--text-muted)]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Advanced Analytics Module</h3>
                <p className="text-[var(--text-muted)] max-w-md leading-relaxed">
                    Detailed telemetry, cost tracking, and provider performance charts will be available in the next platform update.
                </p>
            </div>
        </div>
    );
}
