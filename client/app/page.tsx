// ─────────────────────────────────────────────────────────────────────────────
// app/page.tsx — Dashboard Home / Overview
// ─────────────────────────────────────────────────────────────────────────────
// Server Component — no "use client" needed. Just renders static HTML.
// Provides a complete API reference table and architecture explanation.
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Dashboard Overview",
};

const AUTH_ENDPOINTS = [
    { method: "POST",   path: "/api/auth/register",     desc: "Create new user account",          auth: false, link: "/auth/register"     },
    { method: "POST",   path: "/api/auth/verify-code",  desc: "Verify email via OTP",             auth: false, link: "/auth/verify"        },
    { method: "POST",   path: "/api/auth/login",        desc: "Login + set HTTP-only cookies",    auth: false, link: "/auth/login"         },
    { method: "GET",    path: "/api/auth/me",           desc: "Get current user (needs cookie)",  auth: true,  link: "/auth/me"            },
    { method: "POST",   path: "/api/auth/refresh",      desc: "Rotate access + refresh tokens",   auth: false, link: "/auth/refresh"       },
    { method: "POST",   path: "/api/auth/logout",       desc: "Clear cookies + invalidate token", auth: true,  link: "/auth/logout"        },
    { method: "GET",    path: "/api/auth/me",           desc: "Test 401 Unauthorized",            auth: true,  link: "/auth/unauthorized"  },
];

const USER_ENDPOINTS = [
    { method: "GET",    path: "/api/user/profile",      desc: "Get full user profile",            auth: true, link: "/user/profile"   },
    { method: "PUT",    path: "/api/user/profile",      desc: "Update name, bio, phone",          auth: true, link: "/user/profile"   },
    { method: "PUT",    path: "/api/user/password",     desc: "Change password (requires current)", auth: true, link: "/user/password" },
    { method: "POST",   path: "/api/user/avatar",       desc: "Upload avatar (multipart)",        auth: true, link: "/user/avatar"    },
    { method: "DELETE", path: "/api/user/account",      desc: "Delete account (needs password)",  auth: true, link: "/user/account"   },
    { method: "GET",    path: "/api/user/settings",     desc: "Get theme + notification settings",auth: true, link: "/user/settings"  },
    { method: "PUT",    path: "/api/user/settings",     desc: "Update settings (partial update)", auth: true, link: "/user/settings"  },
];

const METHOD_STYLES: Record<string, string> = {
    GET:    "bg-emerald-500/15 text-emerald-400",
    POST:   "bg-blue-500/15 text-blue-400",
    PUT:    "bg-amber-500/15 text-amber-400",
    DELETE: "bg-red-500/15 text-red-400",
};

function EndpointRow({ method, path, desc, auth, link }: {
    method: string; path: string; desc: string; auth: boolean; link: string;
}) {
    return (
        <Link href={link}
            className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/3 transition-colors group"
        >
            <span className={`w-16 text-center text-xs font-mono font-bold px-2 py-0.5 rounded ${METHOD_STYLES[method]}`}>
                {method}
            </span>
            <code className="flex-1 text-sm text-white/60 group-hover:text-white/80 font-mono transition-colors">
                {path}
            </code>
            <span className="hidden md:block text-sm text-white/40 w-64">{desc}</span>
            {auth
                ? <span className="text-[10px] px-2 py-0.5 rounded bg-violet-500/15 text-violet-400 border border-violet-500/20">🔒 Auth</span>
                : <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/30 border border-white/10">Public</span>
            }
            <span className="text-white/20 group-hover:text-violet-400 transition-colors text-sm">→</span>
        </Link>
    );
}

export default function HomePage() {
    return (
        <div className="space-y-10">
            {/* ── Hero ─────────────────────────────────────────────────────── */}
            <div className="rounded-2xl border border-white/10 bg-[#111118] p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-cyan-600/5 pointer-events-none" />
                <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-2xl">
                            🧪
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">AgentForge Dev Dashboard</h1>
                            <p className="text-white/40 text-sm">Module 1 (Auth) + Module 2 (User Management)</p>
                        </div>
                    </div>
                    <p className="text-white/60 leading-relaxed max-w-2xl">
                        This dashboard communicates with your Express backend exactly like a real production frontend —
                        using <strong className="text-white/80">Axios</strong> with{" "}
                        <code className="text-cyan-400 text-xs bg-white/5 px-1.5 py-0.5 rounded">withCredentials: true</code> so the
                        browser automatically attaches <strong className="text-white/80">HTTP-only cookies</strong> on every request.
                        No token is ever stored in JavaScript.
                    </p>

                    <div className="flex flex-wrap gap-3 mt-6">
                        {[
                            "JWT Authentication",
                            "HTTP-Only Cookies",
                            "Refresh Token Rotation",
                            "requireAuth Middleware",
                            "MongoDB",
                        ].map((tag) => (
                            <span key={tag} className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/50">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Architecture Diagram ──────────────────────────────────────── */}
            <div className="rounded-2xl border border-white/10 bg-[#111118] p-6">
                <h2 className="text-base font-semibold text-white mb-5">Architecture Flow</h2>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center">
                    {[
                        { label: "Next.js", sub: "Port 3000", icon: "⚛️", color: "border-cyan-500/30 bg-cyan-500/5" },
                        { label: "Axios", sub: "withCredentials", icon: "📡", color: "border-blue-500/30 bg-blue-500/5" },
                        { label: "Express", sub: "Port 5000", icon: "🚀", color: "border-violet-500/30 bg-violet-500/5" },
                        { label: "Middleware", sub: "requireAuth", icon: "🔐", color: "border-amber-500/30 bg-amber-500/5" },
                        { label: "MongoDB", sub: "Atlas Cloud", icon: "🍃", color: "border-emerald-500/30 bg-emerald-500/5" },
                    ].map((item, i, arr) => (
                        <div key={item.label} className="flex items-center gap-2 md:contents">
                            <div className={`flex-1 rounded-xl border ${item.color} p-3`}>
                                <div className="text-2xl mb-1">{item.icon}</div>
                                <div className="text-sm font-semibold text-white">{item.label}</div>
                                <div className="text-[10px] text-white/35">{item.sub}</div>
                            </div>
                            {i < arr.length - 1 && (
                                <span className="text-white/20 text-lg md:hidden">→</span>
                            )}
                        </div>
                    ))}
                </div>
                <div className="hidden md:flex justify-between px-[10%] mt-2">
                    {["HTTP + Cookies", "CORS + creds", "JWT Verify", "DB Query"].map((label) => (
                        <div key={label} className="flex items-center gap-1 text-[10px] text-white/25">
                            <span className="w-8 h-px bg-white/15" />
                            <span>{label}</span>
                            <span className="w-8 h-px bg-white/15" />
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Cookie Security Box ───────────────────────────────────────── */}
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
                <h2 className="text-base font-semibold text-amber-300 mb-4">🔒 Cookie Security Model</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div>
                        <p className="font-semibold text-white/70 mb-2">Why HTTP-Only Cookies?</p>
                        <ul className="space-y-1.5 text-white/50">
                            <li>→ <code className="text-amber-300 text-xs">HttpOnly</code>: JavaScript cannot read the cookie (document.cookie returns nothing)</li>
                            <li>→ Prevents <strong className="text-white/70">XSS attacks</strong> from stealing JWTs</li>
                            <li>→ Browser attaches cookie automatically on every matching request</li>
                            <li>→ <code className="text-amber-300 text-xs">SameSite: lax</code>: Only sent on same-site navigation, not embedded cross-site</li>
                        </ul>
                    </div>
                    <div>
                        <p className="font-semibold text-white/70 mb-2">Cookie vs Authorization Header</p>
                        <div className="space-y-1.5 text-white/50">
                            <div className="flex items-start gap-2">
                                <span className="text-rose-400 text-xs mt-0.5 flex-shrink-0">✗</span>
                                <span><code className="text-xs text-white/40">localStorage.setItem(&apos;token&apos;, jwt)</code> — XSS readable</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-rose-400 text-xs mt-0.5 flex-shrink-0">✗</span>
                                <span><code className="text-xs text-white/40">Authorization: Bearer token</code> — must be managed in JS</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-emerald-400 text-xs mt-0.5 flex-shrink-0">✓</span>
                                <span>HTTP-only cookie — browser manages it, JS never sees it</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Auth Endpoints Table ──────────────────────────────────────── */}
            <div className="rounded-2xl border border-white/10 bg-[#111118] overflow-hidden">
                <div className="px-5 py-4 border-b border-white/10 bg-white/3">
                    <h2 className="text-sm font-semibold text-white">🔐 Authentication Module — 7 Endpoints</h2>
                    <p className="text-xs text-white/35 mt-0.5">Click any row to open the test panel</p>
                </div>
                <div className="divide-y divide-white/5">
                    {AUTH_ENDPOINTS.map((ep, i) => (
                        <EndpointRow key={i} {...ep} />
                    ))}
                </div>
            </div>

            {/* ── User Endpoints Table ──────────────────────────────────────── */}
            <div className="rounded-2xl border border-white/10 bg-[#111118] overflow-hidden">
                <div className="px-5 py-4 border-b border-white/10 bg-white/3">
                    <h2 className="text-sm font-semibold text-white">👤 User Management Module — 7 Endpoints</h2>
                    <p className="text-xs text-white/35 mt-0.5">All routes require valid accessToken cookie</p>
                </div>
                <div className="divide-y divide-white/5">
                    {USER_ENDPOINTS.map((ep, i) => (
                        <EndpointRow key={i} {...ep} />
                    ))}
                </div>
            </div>
        </div>
    );
}
