"use client";

// ─────────────────────────────────────────────────────────────────────────────
// app/auth/login/page.tsx — POST /api/auth/login
// ─────────────────────────────────────────────────────────────────────────────
// The most important page in this dashboard.
// After login, the Express backend calls res.cookie() twice:
//   - accessToken (15 min, HttpOnly)
//   - refreshToken (7 days, HttpOnly)
// The browser receives Set-Cookie headers, stores them internally.
// From this point, the browser attaches both cookies on every request
// to localhost:5000 — completely automatic, zero JavaScript involvement.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import ApiCard from "@/components/ui/ApiCard";
import FormField from "@/components/ui/FormField";
import ActionButton from "@/components/ui/ActionButton";
import TheoryBox from "@/components/theory/TheoryBox";
import { useApiCall } from "@/hooks/useApiCall";
import api from "@/lib/axios";
import { LoginInput } from "@/lib/types";

export default function LoginPage() {
    const { state, execute } = useApiCall();
    const [form, setForm] = useState<LoginInput>({ email: "", password: "" });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async () => {
        await execute(() => api.post("/api/auth/login", form));
    };

    return (
        <div className="space-y-6">
            {/* Cookie Lifecycle Visual */}
            <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 px-5 py-4">
                <p className="text-sm font-semibold text-violet-300 mb-3">🍪 What Happens After Login</p>
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                    {[
                        "Express signs JWT",
                        "→",
                        "res.cookie('accessToken')",
                        "→",
                        "Set-Cookie header",
                        "→",
                        "Browser stores cookie",
                        "→",
                        "Auto-attached on future requests",
                    ].map((step, i) => (
                        <span
                            key={i}
                            className={step === "→" ? "text-white/25" : "text-white/60 bg-white/5 border border-white/10 px-2 py-1 rounded"}
                        >
                            {step}
                        </span>
                    ))}
                </div>
            </div>

            <ApiCard
                method="POST"
                endpoint="/api/auth/login"
                description="Authenticates user credentials. On success, Express calls res.cookie() to set accessToken (15min) and refreshToken (7d) as HTTP-only cookies. The browser stores these — frontend code never sees the JWT."
                requiresAuth={false}
                state={state}
                requestBody={state.data ? { email: form.email, password: "[hidden]" } : undefined}
            >
                <div className="space-y-4">
                    <FormField
                        label="Email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={form.email}
                        onChange={handleChange}
                    />
                    <FormField
                        label="Password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        value={form.password}
                        onChange={handleChange}
                        hint="Never sent to MongoDB — compared against bcrypt hash"
                    />

                    <ActionButton
                        label="POST /api/auth/login"
                        loadingLabel="Authenticating..."
                        loading={state.loading}
                        onClick={handleSubmit}
                        disabled={!form.email || !form.password}
                    />
                </div>

                {state.data?.success && (
                    <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                        <p className="text-sm font-semibold text-emerald-400">✓ Login Successful!</p>
                        <p className="text-xs text-white/50 mt-1">
                            Check DevTools → Application → Cookies → localhost:5000 to see the HTTP-only cookies.
                        </p>
                        <div className="mt-3 space-y-1.5 font-mono text-xs">
                            <div className="flex items-center gap-2">
                                <span className="text-white/30">accessToken:</span>
                                <span className="text-violet-300">set ✓ (expires in 15 min, HttpOnly)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-white/30">refreshToken:</span>
                                <span className="text-violet-300">set ✓ (expires in 7 days, HttpOnly, stored in DB)</span>
                            </div>
                        </div>
                    </div>
                )}
            </ApiCard>

            <TheoryBox
                title="Complete Cookie Authentication Lifecycle"
                explanation="Login is where JWT + Cookie authentication comes together. The service verifies the password with bcrypt.compare() (never the plain text). If it matches, the controller calls jwt.sign() twice — once for a short-lived accessToken (15 min) and once for a long-lived refreshToken (7 days). Both are set as HTTP-only cookies via res.cookie(). The browser receives two Set-Cookie response headers and stores them in its internal cookie store — NEVER in localStorage or sessionStorage. JavaScript cannot read HttpOnly cookies via document.cookie. On every subsequent request to localhost:5000, the browser automatically includes Cookie: accessToken=xxx; refreshToken=yyy in the request headers. Express cookie-parser middleware then reads them via req.cookies."
                flowSteps={[
                    { label: "Button Click → Axios POST", detail: "{ email, password } sent as JSON body" },
                    { label: "Express: loginUser controller", detail: "Calls loginUserService(req.body)" },
                    { label: "Service: bcrypt.compare()", detail: "Compares submitted password vs stored hash — never stores plain text" },
                    { label: "jwt.sign(accessToken)", detail: "Payload: { id, email }, expires: 15m, signed with ACCESS_TOKEN_SECRET" },
                    { label: "jwt.sign(refreshToken)", detail: "Payload: { id, email }, expires: 7d, signed with REFRESH_TOKEN_SECRET" },
                    { label: "refreshToken saved to MongoDB", detail: "User.refreshToken = newRefreshToken (for rotation validation)" },
                    { label: "res.cookie('accessToken', ...)", detail: "httpOnly:true, secure:false(dev), sameSite:lax, maxAge:900000ms" },
                    { label: "res.cookie('refreshToken', ...)", detail: "httpOnly:true, secure:false(dev), sameSite:lax, maxAge:604800000ms" },
                    { label: "HTTP 200 + Set-Cookie headers sent", detail: "Browser stores both cookies automatically" },
                    { label: "Axios resolves → React state updates", detail: "UI shows user data — cookies managed by browser, not React" },
                ]}
                securityNotes={[
                    "Access tokens are short-lived (15 min) to limit damage if intercepted",
                    "Refresh tokens are long-lived (7 days) and stored in the DB for revocation",
                    "HttpOnly prevents XSS — even malicious scripts cannot access the cookie",
                    "sameSite:lax prevents CSRF in most scenarios (cookie not sent on cross-site POST)",
                    "secure:true in production — cookie only sent over HTTPS, never plain HTTP",
                ]}
            />
        </div>
    );
}
