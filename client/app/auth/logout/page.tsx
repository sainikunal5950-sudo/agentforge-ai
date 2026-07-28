"use client";

// ─────────────────────────────────────────────────────────────────────────────
// app/auth/logout/page.tsx — POST /api/auth/logout
// ─────────────────────────────────────────────────────────────────────────────
// Tests the logout flow. This route is protected (requireAuth runs first).
// The backend: (1) clears accessToken + refreshToken cookies by setting
// maxAge: 0, (2) deletes the refreshToken from MongoDB so even the old
// cookie value is permanently invalid.
// ─────────────────────────────────────────────────────────────────────────────

import ApiCard from "@/components/ui/ApiCard";
import ActionButton from "@/components/ui/ActionButton";
import TheoryBox from "@/components/theory/TheoryBox";
import { useApiCall } from "@/hooks/useApiCall";
import api from "@/lib/axios";

export default function LogoutPage() {
    const { state, execute } = useApiCall();

    const handleLogout = async () => {
        await execute(() => api.post("/api/auth/logout"));
    };

    return (
        <div className="space-y-6">
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-5 py-3 flex items-start gap-3">
                <span className="text-lg">⚠️</span>
                <div>
                    <p className="text-sm font-medium text-rose-300">Protected Route</p>
                    <p className="text-xs text-white/40 mt-0.5">
                        Logout requires a valid <code className="text-violet-300">accessToken</code> cookie.
                        If you&apos;re not logged in, you&apos;ll get 401. After successful logout,
                        test the <span className="text-white/60">Unauthorized Test</span> page.
                    </p>
                </div>
            </div>

            <ApiCard
                method="POST"
                endpoint="/api/auth/logout"
                description="Terminates the user's session. Clears HTTP-only cookies (accessToken, refreshToken) and deletes the refreshToken from MongoDB. Any future requests with old cookies will fail authentication."
                requiresAuth={true}
                state={state}
            >
                <div className="space-y-3">
                    <p className="text-sm text-white/40">
                        No form fields needed. The <code className="text-violet-300">accessToken</code> cookie
                        authorizes this request automatically.
                    </p>
                    <ActionButton
                        label="POST /api/auth/logout"
                        loadingLabel="Logging out..."
                        loading={state.loading}
                        onClick={handleLogout}
                        variant="danger"
                    />
                </div>

                {state.data?.success && (
                    <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
                        <p className="text-sm font-semibold text-rose-400">✓ Logged Out</p>
                        <p className="text-xs text-white/50 mt-1">
                            Both cookies have been cleared by the server.
                            Check DevTools → Application → Cookies — they should be gone.
                            Now navigate to <span className="text-white/70">Unauthorized Test</span> to confirm 401.
                        </p>
                    </div>
                )}
            </ApiCard>

            <TheoryBox
                title="How Logout Destroys the Session Completely"
                explanation="Logout does TWO things: (1) tells the browser to delete the cookies by setting them with maxAge: 0 or an expired date — the browser receives Set-Cookie headers with past expiry dates and removes them from its store, (2) deletes the refreshToken from MongoDB. This second step is critical: even if an attacker captured the refreshToken cookie before logout, that value is now gone from the database — the rotation check would fail and the attacker gets 401. This is why HTTP-only cookies + server-side session revocation together form a complete logout."
                flowSteps={[
                    { label: "Button Click → Axios POST", detail: "api.post('/api/auth/logout') — accessToken cookie auto-sent" },
                    { label: "requireAuth middleware runs", detail: "Verifies accessToken → attaches req.user" },
                    { label: "logoutUser controller", detail: "Extracts userId = req.user._id" },
                    { label: "logoutUserService(userId)", detail: "User.findByIdAndUpdate({ refreshToken: null })" },
                    { label: "MongoDB: refreshToken field cleared", detail: "The stored refresh token is now null/deleted" },
                    { label: "res.clearCookie('accessToken')", detail: "Sets Set-Cookie: accessToken=; Max-Age=0; HttpOnly" },
                    { label: "res.clearCookie('refreshToken')", detail: "Sets Set-Cookie: refreshToken=; Max-Age=0; HttpOnly" },
                    { label: "Browser receives response", detail: "Deletes both cookies from its internal store" },
                    { label: "HTTP 200 Response", detail: "{ success: true, message: 'Logged out successfully' }" },
                ]}
                securityNotes={[
                    "Cookie deletion happens on the SERVER — the client has no way to fake it",
                    "Server-side token revocation (clearing DB refreshToken) closes the replay attack window",
                    "After logout, even a stolen refreshToken cookie returns 401 — the DB record is gone",
                    "The logout route itself requires authentication — prevents anonymous logout attempts",
                ]}
            />
        </div>
    );
}
