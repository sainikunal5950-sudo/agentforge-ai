"use client";

// ─────────────────────────────────────────────────────────────────────────────
// components/ui/ResponseViewer.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Renders JSON in a syntax-highlighted, copy-to-clipboard dark terminal block.
// This is the core output panel for every API test — developers immediately
// see the raw response that came from the Express backend.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { ClipboardIcon, CheckIcon } from "./Icons";

interface ResponseViewerProps {
    data: unknown;
    title?: string;
}

// Syntax highlighting: colorize JSON keys vs values
function syntaxHighlight(json: string): string {
    return json
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(
            /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
            (match) => {
                let cls = "text-violet-300"; // number
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = "text-cyan-400"; // key
                    } else {
                        cls = "text-emerald-300"; // string value
                    }
                } else if (/true|false/.test(match)) {
                    cls = "text-amber-400"; // boolean
                } else if (/null/.test(match)) {
                    cls = "text-rose-400"; // null
                }
                return `<span class="${cls}">${match}</span>`;
            }
        );
}

export default function ResponseViewer({ data, title = "Response" }: ResponseViewerProps) {
    const [copied, setCopied] = useState(false);

    const formatted = JSON.stringify(data, null, 2);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(formatted);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="rounded-xl border border-white/10 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-white/5 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-rose-500/70" />
                        <span className="w-3 h-3 rounded-full bg-amber-500/70" />
                        <span className="w-3 h-3 rounded-full bg-emerald-500/70" />
                    </div>
                    <span className="text-xs text-white/40 font-mono ml-2">{title}</span>
                </div>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/80 transition-colors"
                >
                    {copied ? <CheckIcon /> : <ClipboardIcon />}
                    {copied ? "Copied!" : "Copy"}
                </button>
            </div>

            {/* Code Block */}
            <div className="bg-[#0d0d14] p-4 overflow-x-auto max-h-96">
                <pre
                    className="text-sm font-mono leading-relaxed"
                    dangerouslySetInnerHTML={{
                        __html: syntaxHighlight(formatted),
                    }}
                />
            </div>
        </div>
    );
}
