"use client";

import { Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Global Settings</h1>
                <p className="text-[var(--text-muted)] text-sm">Configure your platform preferences and integrations.</p>
            </div>

            <div className="glass-panel p-12 text-center flex flex-col items-center justify-center border-dashed border-2 border-[var(--border)] min-h-[400px]">
                <div className="w-16 h-16 rounded-full bg-[rgba(255,255,255,0.02)] flex items-center justify-center mb-6 border border-[var(--border)]">
                    <SettingsIcon className="w-8 h-8 text-[var(--text-muted)]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Settings Panel Coming Soon</h3>
                <p className="text-[var(--text-muted)] max-w-md leading-relaxed">
                    Provider API keys, theme configuration, and billing management will be introduced in the next module. 
                    Currently, environment variables are handling core configurations.
                </p>
            </div>
        </div>
    );
}
