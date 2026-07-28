"use client";

// ─────────────────────────────────────────────────────────────────────────────
// app/auth/unauthorized/page.tsx — GET /api/auth/me (after logout)
// ─────────────────────────────────────────────────────────────────────────────
// This page deliberately calls a protected route with NO valid cookie.
// The expected (and correct) response is 401 Unauthorized.
// This validates that the middleware is working — it's not a bug, it's a test.
// ─────────────────────────────────────────────────────────────────────────────

import ApiCard from "@/components/ui/ApiCard";
import ActionButton from "@/components/ui/ActionButton";
import TheoryBox from "@/components/theory/TheoryBox";
import { useApiCall } from "@/hooks/useApiCall";
import api from "@/lib/axios";

export default function UnauthorizedPage() {
    const { state, execute } = useApiCall();

    const handleTest = async () => {
        await execute(() => api.get("/api/auth/me"));
    };

    const is401 = state.statusCode === 401;

    return (
        <div className="space-y-6">
            {/* Instruction Banner */}
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-5 py-4">
                <p className="text-sm font-semibold text-amber-300 mb-2">📋 Setup: Log Out First</p>
                <p className="text-xs text-white/50">
                    To properly test this, click <span className="text-white/70">Logout</span> in the sidebar first.
                    Then return here and click the button below. You should receive a{" "}
                    <code className="text-red-400 text-xs">401 Unauthorized</code> response — this proves
                    the middleware correctly rejects requests without a valid token.
                </p>
            </div>

            <ApiCard
                method="GET"
                endpoint="/api/auth/me"
                description="Calls GET /api/auth/me without a valid accessToken cookie. Expected result: 401 Unauthorized. This verifies that the requireAuth middleware is correctly protecting routes."
                requiresAuth={true}
                state={state}
            >
                <div className="space-y-3">
                    <ActionButton
                        label="Test GET /api/auth/me (no cookie)"
                        loadingLabel="Sending request..."
                        loading={state.loading}
                        onClick={handleTest}
                        variant="secondary"
                    />
                </div>

                {/* 401 Success Panel */}
                {is401 && (
                    <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                        <p className="text-sm font-semibold text-emerald-400">
                            ✓ 401 Received — Middleware is Working Correctly!
                        </p>
                        <p className="text-xs text-white/50 mt-1">
                            The <code className="text-violet-300">requireAuth</code> middleware correctly rejected
                            the request because no valid <code className="text-violet-300">accessToken</code> cookie exists.
                            This is the expected behavior.
                        </p>
                    </div>
                )}

                {/* Not-401 Warning */}
                {state.statusCode && !is401 && (
                    <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                        <p className="text-sm font-semibold text-amber-400">
                            ⚠ Got {state.statusCode} — You&apos;re Still Logged In
                        </p>
                        <p className="text-xs text-white/50 mt-1">
                            The browser still has a valid cookie. Go to the Logout page first, then return here.
                        </p>
                    </div>
                )}
            </ApiCard>

            <TheoryBox
                title="Why 401 is the Correct and Expected Response"
                explanation="401 Unauthorized means: 'I don't know who you are — no valid credentials provided.' After logout, the browser's cookie store no longer contains the accessToken. When Axios sends GET /api/auth/me, there is no Cookie header in the request. requireAuth checks req.cookies.accessToken — it's undefined. The middleware immediately returns 401 without touching the database. This proves: (1) the middleware correctly guards routes, (2) cookies were actually cleared by logout, (3) the session is truly terminated. Compare this to 403 Forbidden which means 'I know who you are but you don't have permission.'"
                flowSteps={[
                    { label: "Button Click → Axios GET", detail: "api.get('/api/auth/me') — withCredentials: true" },
                    { label: "Browser checks cookie store", detail: "No accessToken cookie found (cleared by logout)" },
                    { label: "Request sent WITHOUT cookie header", detail: "GET /api/auth/me HTTP/1.1 — no Cookie: field" },
                    { label: "requireAuth middleware", detail: "let token = req.cookies?.accessToken → undefined" },
                    { label: "Also checks Authorization header", detail: "req.headers.authorization → undefined" },
                    { label: "No token found", detail: "Returns 401: { success: false, message: 'Unauthorized: Access token is missing' }" },
                    { label: "Axios receives 401", detail: "Throws AxiosError (non-2xx response)" },
                    { label: "useApiCall catch block", detail: "Sets error + statusCode: 401 in state" },
                    { label: "React re-renders with 401 banner", detail: "UI shows 'Middleware is Working Correctly!'" },
                ]}
                securityNotes={[
                    "401 = Unauthenticated (no credentials), 403 = Unauthorized (credentials present but insufficient)",
                    "requireAuth returns early — no database query happens on missing credentials (performance + security)",
                    "Even if JS injected a fake cookie value, jwt.verify() would fail the signature check → 401",
                    "This test proves end-to-end: session creation (login) → session destruction (logout) → rejection (401)",
                ]}
            />
        </div>
    );
}
