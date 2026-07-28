"use client";

// ─────────────────────────────────────────────────────────────────────────────
// components/theory/TheoryBox.tsx
// ─────────────────────────────────────────────────────────────────────────────
// A collapsible accordion that explains the theory behind each API call.
// Toggled with a chevron — open by default to ensure developers read it.
//
// WHY THIS EXISTS:
//   This dashboard is a learning tool. After every API test, the developer
//   should understand: what happened at the backend, how the middleware ran,
//   how the cookie was set, and what to say in an interview about it.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { ChevronDownIcon } from "@/components/ui/Icons";

interface FlowStep {
    label: string;
    detail?: string;
}

interface TheoryBoxProps {
    title?: string;
    explanation: string;
    flowSteps?: FlowStep[];
    securityNotes?: string[];
}

export default function TheoryBox({
    title = "How This Works",
    explanation,
    flowSteps,
    securityNotes,
}: TheoryBoxProps) {
    const [open, setOpen] = useState(true);

    return (
        <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 overflow-hidden">
            {/* Toggle Header */}
            <button
                onClick={() => setOpen((prev) => !prev)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-violet-500/5 transition-colors"
            >
                <div className="flex items-center gap-2.5">
                    <span className="text-violet-400 text-lg">🧠</span>
                    <span className="text-sm font-semibold text-violet-300">{title}</span>
                </div>
                <ChevronDownIcon open={open} />
            </button>

            {/* Content */}
            {open && (
                <div className="px-5 pb-5 space-y-4 border-t border-violet-500/15">
                    {/* Explanation Paragraph */}
                    <p className="text-sm text-white/60 leading-relaxed mt-4">{explanation}</p>

                    {/* Request Flow Diagram */}
                    {flowSteps && flowSteps.length > 0 && (
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
                                Request Flow
                            </p>
                            <div className="space-y-1">
                                {flowSteps.map((step, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="flex flex-col items-center pt-1">
                                            <div className="w-5 h-5 rounded-full bg-violet-600/30 border border-violet-500/40 flex items-center justify-center flex-shrink-0">
                                                <span className="text-[10px] text-violet-300 font-mono">{i + 1}</span>
                                            </div>
                                            {i < flowSteps.length - 1 && (
                                                <div className="w-px h-4 bg-violet-500/20 mt-1" />
                                            )}
                                        </div>
                                        <div className="pb-1">
                                            <span className="text-sm font-medium text-white/70">{step.label}</span>
                                            {step.detail && (
                                                <p className="text-xs text-white/35 mt-0.5">{step.detail}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Security Notes */}
                    {securityNotes && securityNotes.length > 0 && (
                        <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-4 space-y-2">
                            <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                                🔒 Security Notes
                            </p>
                            <ul className="space-y-1.5">
                                {securityNotes.map((note, i) => (
                                    <li key={i} className="text-xs text-amber-200/70 flex items-start gap-2">
                                        <span className="text-amber-500 mt-0.5">→</span>
                                        {note}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
