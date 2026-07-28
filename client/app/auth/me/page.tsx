"use client";

// ─────────────────────────────────────────────────────────────────────────────
// app/auth/me/page.tsx — GET /api/auth/me
// ─────────────────────────────────────────────────────────────────────────────
// Tests the requireAuth middleware. No form fields needed — the browser
// automatically sends the accessToken cookie on this request. The middleware
// decodes it, fetches the user from MongoDB, and attaches it to req.user.
// The controller reads req.user and returns it directly.
// ─────────────────────────────────────────────────────────────────────────────

import ApiCard from "@/components/ui/ApiCard";
import ActionButton from "@/components/ui/ActionButton";
import TheoryBox from "@/components/theory/TheoryBox";
import { useApiCall } from "@/hooks/useApiCall";
import api from "@/lib/axios";

export default function MePage() {
    const { state, execute } = useApiCall();

    const handleFetch = async () => {
        await execute(() => api.get("/api/auth/me"));
    };

    return (
        <div className="space-y-6">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-3 flex items-start gap-3">
                <span className="text-lg">🍪</span>
                <div>
                    <p className="text-sm font-medium text-emerald-300">No form fields needed</p>
                    <p className="text-xs text-white/40 mt-0.5">
                        The browser automatically attaches the <code className="text-violet-300">accessToken</code> cookie.
                        If you&apos;re not logged in, you&apos;ll get 401.
                    </p>
                </div>
            </div>

            <ApiCard
                method="GET"
                endpoint="/api/auth/me"
                description="Returns the authenticated user's data. No request body needed — the browser sends the accessToken cookie automatically. The requireAuth middleware verifies it and populates req.user."
                requiresAuth={true}
                state={state}
            >
                <ActionButton
                    label="GET /api/auth/me"
                    loadingLabel="Fetching user..."
                    loading={state.loading}
                    onClick={handleFetch}
                />
            </ApiCard>

            <TheoryBox
                title="How requireAuth Middleware Works"
                explanation="This is the most important middleware in the entire backend. When GET /api/auth/me is called: (1) cookie-parser extracts accessToken from req.cookies, (2) jwt.verify() checks the signature and expiry — a tampered or expired token throws immediately, (3) User.findById(decoded.id) fetches the actual user from MongoDB (password and refreshToken excluded via .select()), (4) if isVerified is false, it returns 403 Forbidden, (5) req.user is set to the full user document, (6) next() passes control to the controller. The controller reads req.user and returns it — no DB query needed in the controller because middleware already did it."
                flowSteps={[
                    { label: "Button Click → Axios GET", detail: "api.get('/api/auth/me') — no body" },
                    { label: "Browser auto-attaches cookie", detail: "Cookie: accessToken=eyJhbGciOi... sent in headers" },
                    { label: "Express: requireAuth middleware runs FIRST", detail: "Extracts token: req.cookies.accessToken" },
                    { label: "jwt.verify(token, ACCESS_TOKEN_SECRET)", detail: "Decodes payload: { id, email, iat, exp }" },
                    { label: "User.findById(decoded.id)", detail: ".select('-password -refreshToken') — excludes sensitive fields" },
                    { label: "user.isVerified check", detail: "false → 403 Forbidden; true → continue" },
                    { label: "req.user = user → next()", detail: "User document now available to all downstream handlers" },
                    { label: "getMe controller", detail: "Returns res.json({ success: true, data: { user: req.user } })" },
                    { label: "HTTP 200 Response", detail: "Contains user without password or refreshToken" },
                ]}
                securityNotes={[
                    "JWT is stateless — verification requires no DB call (signature math only)",
                    "But we still do a DB call (findById) to: (1) confirm user exists, (2) check isVerified",
                    "Excluding password + refreshToken via .select() prevents accidental exposure in responses",
                    "If accessToken is expired, middleware returns 401 — frontend should then call /api/auth/refresh",
                ]}
            />
        </div>
    );
}
