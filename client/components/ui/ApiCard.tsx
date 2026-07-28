"use client";

// ─────────────────────────────────────────────────────────────────────────────
// components/ui/ApiCard.tsx
// ─────────────────────────────────────────────────────────────────────────────
// The primary container for every API test panel.
// Shows: HTTP method badge, endpoint path, auth requirement, status code,
// request/response JSON, and execution timestamp.
//
// This is the most visible component in the dashboard — every page wraps
// its content inside ApiCard to maintain consistent UX.
// ─────────────────────────────────────────────────────────────────────────────

import { ReactNode } from "react";
import StatusBadge from "./StatusBadge";
import ResponseViewer from "./ResponseViewer";
import { LockIcon } from "./Icons";
import { ApiState } from "@/lib/types";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

const methodColors: Record<HttpMethod, string> = {
    GET: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    POST: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    PUT: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    DELETE: "bg-red-500/20 text-red-400 border-red-500/30",
    PATCH: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

interface ApiCardProps {
    method: HttpMethod;
    endpoint: string;
    description: string;
    requiresAuth: boolean;
    state: ApiState;
    children: ReactNode;
    // typed as object so Object.keys() and JSX work; pages cast their typed forms
    requestBody?: Record<string, unknown>;
}

export default function ApiCard({
    method,
    endpoint,
    description,
    requiresAuth,
    state,
    children,
    requestBody,
}: ApiCardProps) {
    return (
        <div className="rounded-2xl border border-white/10 bg-[#111118] overflow-hidden">
            {/* ── Card Header ─────────────────────────────────────────────── */}
            <div className="p-6 border-b border-white/10 bg-gradient-to-r from-violet-600/5 to-cyan-600/5">
                <div className="flex flex-wrap items-start gap-3">
                    {/* HTTP Method Badge */}
                    <span className={`inline-block px-3 py-1 rounded-md text-xs font-mono font-bold uppercase border ${methodColors[method]}`}>
                        {method}
                    </span>

                    {/* Endpoint Path */}
                    <code className="flex-1 text-sm font-mono text-white/70 bg-white/5 px-3 py-1 rounded-md border border-white/10 break-all">
                        {endpoint}
                    </code>

                    {/* Auth Required Badge */}
                    {requiresAuth && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-violet-500/15 text-violet-400 border border-violet-500/25">
                            <LockIcon /> Auth Required
                        </span>
                    )}
                </div>

                <p className="mt-3 text-sm text-white/50">{description}</p>

                {/* Status Code */}
                {state.statusCode !== null && (
                    <div className="mt-3 flex items-center gap-3">
                        <StatusBadge code={state.statusCode} />
                        {state.timestamp && (
                            <span className="text-xs text-white/30 font-mono">
                                {new Date(state.timestamp).toLocaleTimeString()}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* ── Form Area ───────────────────────────────────────────────── */}
            <div className="p-6 space-y-6">
                {children}

                {/* ── Request Body Preview ──────────────────────────────── */}
                {requestBody && Object.keys(requestBody).length > 0 && (
                    <ResponseViewer data={requestBody} title="Request Body (sent)" />
                )}

                {/* ── Response Viewer ───────────────────────────────────── */}
                {state.loading && (
                    <div className="flex items-center gap-3 text-white/40 text-sm p-4 rounded-xl bg-white/5 border border-white/10">
                        <svg className="w-4 h-4 animate-spin text-violet-400" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Sending request to <code className="text-violet-300">{endpoint}</code>...
                    </div>
                )}

                {state.data && !state.loading && (
                    <ResponseViewer data={state.data} title="Response Body" />
                )}

                {state.error && !state.data && !state.loading && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                        <p className="text-sm text-red-400 font-medium">⚠ Network Error</p>
                        <p className="text-xs text-red-400/70 mt-1">{state.error}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
