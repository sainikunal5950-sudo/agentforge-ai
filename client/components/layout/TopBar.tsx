"use client";

// ─────────────────────────────────────────────────────────────────────────────
// components/layout/TopBar.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Fixed top bar that shows the current page title and cookie/auth status.
// ─────────────────────────────────────────────────────────────────────────────

import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
    "/":                    { title: "Dashboard Overview",      subtitle: "All 13 backend endpoints at a glance" },
    "/auth/register":       { title: "Register",                subtitle: "POST /api/auth/register" },
    "/auth/verify":         { title: "Verify Email",            subtitle: "POST /api/auth/verify-code" },
    "/auth/login":          { title: "Login",                   subtitle: "POST /api/auth/login" },
    "/auth/me":             { title: "Current User",            subtitle: "GET /api/auth/me — requires accessToken cookie" },
    "/auth/refresh":        { title: "Refresh Token",           subtitle: "POST /api/auth/refresh — uses refreshToken cookie" },
    "/auth/logout":         { title: "Logout",                  subtitle: "POST /api/auth/logout — clears cookies" },
    "/auth/unauthorized":   { title: "Unauthorized Test",       subtitle: "GET /api/auth/me — expects 401" },
    "/user/profile":        { title: "User Profile",            subtitle: "GET + PUT /api/user/profile" },
    "/user/password":       { title: "Change Password",         subtitle: "PUT /api/user/password" },
    "/user/avatar":         { title: "Upload Avatar",           subtitle: "POST /api/user/avatar (multipart/form-data)" },
    "/user/account":        { title: "Delete Account",          subtitle: "DELETE /api/user/account" },
    "/user/settings":       { title: "User Settings",           subtitle: "GET + PUT /api/user/settings" },
};

export default function TopBar() {
    const pathname = usePathname();
    const page = PAGE_TITLES[pathname] ?? { title: "AgentForge", subtitle: "Developer Testing Dashboard" };

    return (
        <header className="fixed top-0 left-64 right-0 h-16 bg-[#0d0d14]/80 backdrop-blur-sm border-b border-white/8 z-30 flex items-center justify-between px-8">
            {/* Page Title */}
            <div>
                <h1 className="text-base font-semibold text-white leading-tight">
                    {page.title}
                </h1>
                <p className="text-xs text-white/35 font-mono mt-0.5">{page.subtitle}</p>
            </div>

            {/* Right Side Indicators */}
            <div className="flex items-center gap-4">
                {/* Cookie Info Badge */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-xs text-white/40">🍪</span>
                    <span className="text-[11px] text-white/40 font-mono">HTTP-Only Cookies</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                </div>

                {/* Axios Badge */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-[11px] text-white/40 font-mono">withCredentials: true</span>
                </div>
            </div>
        </header>
    );
}
