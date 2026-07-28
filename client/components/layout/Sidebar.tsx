"use client";

// ─────────────────────────────────────────────────────────────────────────────
// components/layout/Sidebar.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Fixed sidebar navigation for the developer testing dashboard.
// Divided into two modules: Auth (7 endpoints) + User Management (5 endpoints).
// Active route is highlighted with a violet glow indicator.
// ─────────────────────────────────────────────────────────────────────────────

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FlaskIcon, ShieldIcon, UserIcon } from "@/components/ui/Icons";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface NavItem {
    label: string;
    path: string;
    method: HttpMethod;
}

const AUTH_ROUTES: NavItem[] = [
    { label: "Register",            path: "/auth/register",     method: "POST"   },
    { label: "Verify Email",        path: "/auth/verify",       method: "POST"   },
    { label: "Login",               path: "/auth/login",        method: "POST"   },
    { label: "Current User",        path: "/auth/me",           method: "GET"    },
    { label: "Refresh Token",       path: "/auth/refresh",      method: "POST"   },
    { label: "Logout",              path: "/auth/logout",       method: "POST"   },
    { label: "Unauthorized Test",   path: "/auth/unauthorized", method: "GET"    },
];

const USER_ROUTES: NavItem[] = [
    { label: "Get / Update Profile", path: "/user/profile",  method: "GET"    },
    { label: "Change Password",      path: "/user/password", method: "PUT"    },
    { label: "Upload Avatar",        path: "/user/avatar",   method: "POST"   },
    { label: "Delete Account",       path: "/user/account",  method: "DELETE" },
    { label: "Settings",             path: "/user/settings", method: "GET"    },
];

const METHOD_COLORS: Record<HttpMethod, string> = {
    GET:    "text-emerald-500",
    POST:   "text-blue-500",
    PUT:    "text-amber-500",
    DELETE: "text-red-500",
};

function NavGroup({ title, icon, items }: { title: string; icon: React.ReactNode; items: NavItem[] }) {
    const pathname = usePathname();

    return (
        <div className="mb-6">
            <div className="flex items-center gap-2 px-3 mb-2">
                <span className="text-white/30">{icon}</span>
                <span className="text-[11px] font-semibold text-white/30 uppercase tracking-widest">
                    {title}
                </span>
            </div>

            <div className="space-y-0.5">
                {items.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`
                                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                                transition-all duration-150 group relative
                                ${isActive
                                    ? "bg-violet-600/20 text-white border border-violet-500/30"
                                    : "text-white/50 hover:text-white/80 hover:bg-white/5"
                                }
                            `}
                        >
                            {/* Active indicator bar */}
                            {isActive && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-violet-500 rounded-full" />
                            )}

                            {/* Method badge */}
                            <span className={`text-[10px] font-mono font-bold w-12 flex-shrink-0 ${METHOD_COLORS[item.method]}`}>
                                {item.method}
                            </span>

                            {/* Label */}
                            <span className="truncate">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

export default function Sidebar() {
    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0d0d14] border-r border-white/8 flex flex-col overflow-y-auto z-40">
            {/* ── Logo / Brand ──────────────────────────────────────────────── */}
            <div className="px-4 py-5 border-b border-white/8">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center group-hover:bg-violet-600/30 transition-colors">
                        <FlaskIcon />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white leading-tight">AgentForge</p>
                        <p className="text-[10px] text-white/30">Dev Testing Dashboard</p>
                    </div>
                </Link>
            </div>

            {/* ── Navigation ───────────────────────────────────────────────── */}
            <nav className="flex-1 px-3 py-5">
                <NavGroup
                    title="Auth Module"
                    icon={<ShieldIcon />}
                    items={AUTH_ROUTES}
                />
                <NavGroup
                    title="User Module"
                    icon={<UserIcon />}
                    items={USER_ROUTES}
                />
            </nav>

            {/* ── Footer ───────────────────────────────────────────────────── */}
            <div className="px-4 py-4 border-t border-white/8">
                <p className="text-[10px] text-white/20 font-mono">Backend: localhost:5000</p>
                <p className="text-[10px] text-white/20 font-mono">Frontend: localhost:3000</p>
                <div className="flex items-center gap-1.5 mt-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-emerald-400/70">Express + MongoDB</span>
                </div>
            </div>
        </aside>
    );
}
