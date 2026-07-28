"use client";

// ─────────────────────────────────────────────────────────────────────────────
// components/ui/StatusBadge.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Renders a color-coded HTTP status code badge.
// Color convention follows standard REST semantics:
//   2xx → green  (success)
//   3xx → blue   (redirect)
//   4xx → orange/red (client error)
//   5xx → dark red   (server error)
// ─────────────────────────────────────────────────────────────────────────────

interface StatusBadgeProps {
    code: number | null;
}

export default function StatusBadge({ code }: StatusBadgeProps) {
    if (code === null) return null;

    const getStyle = () => {
        if (code >= 200 && code < 300) return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
        if (code >= 300 && code < 400) return "bg-blue-500/20 text-blue-400 border-blue-500/30";
        if (code === 401) return "bg-red-500/20 text-red-400 border-red-500/30";
        if (code === 403) return "bg-purple-500/20 text-purple-400 border-purple-500/30";
        if (code >= 400 && code < 500) return "bg-amber-500/20 text-amber-400 border-amber-500/30";
        return "bg-rose-500/20 text-rose-400 border-rose-500/30";
    };

    const getLabel = () => {
        const labels: Record<number, string> = {
            200: "OK",
            201: "Created",
            400: "Bad Request",
            401: "Unauthorized",
            403: "Forbidden",
            404: "Not Found",
            500: "Server Error",
        };
        return labels[code] || "";
    };

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-mono font-semibold border ${getStyle()}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {code} {getLabel()}
        </span>
    );
}
