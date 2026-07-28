"use client";

// ─────────────────────────────────────────────────────────────────────────────
// app/auth/refresh/page.tsx — POST /api/auth/refresh
// ─────────────────────────────────────────────────────────────────────────────
// Tests Refresh Token Rotation. This is the mechanism that allows users to
// stay logged in beyond the 15-minute access token expiry — WITHOUT having
// to re-enter their password.
//
// Rotation means: the old refresh token is consumed and a brand-new pair
// of tokens is generated. Using the same refresh token twice → 401 error.
// This prevents replay attacks.
// ─────────────────────────────────────────────────────────────────────────────

import ApiCard from "@/components/ui/ApiCard";
import ActionButton from "@/components/ui/ActionButton";
import TheoryBox from "@/components/theory/TheoryBox";
import { useApiCall } from "@/hooks/useApiCall";
import api from "@/lib/axios";

export default function RefreshPage() {
    const { state, execute } = useApiCall();

    const handleRefresh = async () => {
        await execute(() => api.post("/api/auth/refresh"));
    };

    return (
        <div className="space-y-6">
            {/* Rotation Visual */}
            <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 px-5 py-4">
                <p className="text-sm font-semibold text-violet-300 mb-3">🔄 Refresh Token Rotation</p>
                <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                        <p className="text-white/40 font-semibold uppercase tracking-wider text-[10px]">Before</p>
                        <div className="bg-white/5 border border-white/10 rounded-lg p-3 font-mono space-y-1">
                            <div className="text-amber-300">accessToken_v1 (EXPIRED)</div>
                            <div className="text-violet-300">refreshToken_v1 (valid)</div>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-white/40 font-semibold uppercase tracking-wider text-[10px]">After</p>
                        <div className="bg-white/5 border border-white/10 rounded-lg p-3 font-mono space-y-1">
                            <div className="text-emerald-300">accessToken_v2 (NEW, 15min)</div>
                            <div className="text-emerald-300">refreshToken_v2 (NEW, 7d)</div>
                            <div className="text-rose-400/60 line-through">refreshToken_v1 (INVALIDATED)</div>
                        </div>
                    </div>
                </div>
            </div>

            <ApiCard
                method="POST"
                endpoint="/api/auth/refresh"
                description="Rotates both tokens. Browser sends the refreshToken cookie automatically. Express verifies it, generates a NEW accessToken + NEW refreshToken, replaces the cookies. The old refreshToken is permanently invalid."
                requiresAuth={false}
                state={state}
            >
                <div className="space-y-3">
                    <p className="text-sm text-white/40">
                        No form fields needed — the browser sends the{" "}
                        <code className="text-violet-300 text-xs">refreshToken</code> cookie automatically.
                    </p>
                    <ActionButton
                        label="POST /api/auth/refresh"
                        loadingLabel="Rotating tokens..."
                        loading={state.loading}
                        onClick={handleRefresh}
                    />
                </div>
            </ApiCard>

            <TheoryBox
                title="Refresh Token Rotation & Replay Attack Prevention"
                explanation="When the accessToken expires (15 min), calling any protected endpoint returns 401. Instead of prompting the user to log in again, the frontend calls POST /api/auth/refresh with the refreshToken cookie. The backend: verifies the refreshToken JWT, looks up the user, validates the stored refreshToken matches the one in the cookie (replay check!), then generates BOTH a new accessToken AND a new refreshToken. The old refreshToken is overwritten in MongoDB and the cookie is replaced. This way, if an attacker steals a refresh token and tries to reuse it after it's been rotated, they get 401 — the token no longer exists in the database."
                flowSteps={[
                    { label: "Button Click → Axios POST", detail: "api.post('/api/auth/refresh') — no body" },
                    { label: "Browser sends refreshToken cookie", detail: "Cookie: refreshToken=eyJhbGci... auto-attached" },
                    { label: "refreshAccessToken controller", detail: "Extracts: const token = req.cookies.refreshToken" },
                    { label: "refreshAccessTokenService(token)", detail: "Calls the service layer" },
                    { label: "jwt.verify(token, REFRESH_SECRET)", detail: "Decodes payload — throws if invalid/expired" },
                    { label: "User.findById + compare stored token", detail: "Checks: user.refreshToken === incomingToken (replay prevention)" },
                    { label: "Generate new accessToken + refreshToken", detail: "jwt.sign() × 2 with fresh iat/exp claims" },
                    { label: "Save new refreshToken to MongoDB", detail: "user.refreshToken = newRefreshToken → user.save()" },
                    { label: "res.cookie × 2 — new pair set", detail: "Old cookies overwritten by browser with new values" },
                    { label: "HTTP 200 Response", detail: "{ success: true, message: 'Tokens refreshed' }" },
                ]}
                securityNotes={[
                    "Rotation means: each refresh token can only be used ONCE",
                    "If a token is reused (replay attack), the backend detects a DB mismatch → 401",
                    "accessToken is short-lived (15min) to limit the window of a stolen token",
                    "refreshToken is long-lived (7d) but invalidated the moment it's used",
                    "On logout, refreshToken is deleted from DB — even a stolen token becomes useless",
                ]}
            />
        </div>
    );
}
