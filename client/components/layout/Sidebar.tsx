"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import { 
    LayoutDashboard, 
    Bot, 
    PlusSquare, 
    MessageSquare, 
    Settings, 
    History,
    LogOut,
    User,
    Sparkles,
    Search
} from "lucide-react";

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await api.post("/api/auth/logout");
        } catch (e) {
            // ignore errors, still redirect
        }
        router.push("/auth/login");
    };

    const menuItems = [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "AI Agents", href: "/agents", icon: Bot },
        { label: "Create Agent", href: "/agents/create", icon: PlusSquare },
        { label: "History", href: "/history", icon: History, placeholder: true },
        { label: "Analytics", href: "/analytics", icon: Sparkles, placeholder: true },
    ];

    const bottomItems = [
        { label: "Search", href: "#", icon: Search, action: true },
        { label: "Settings", href: "/settings", icon: Settings, placeholder: true },
        { label: "Profile", href: "/user/profile", icon: User },
    ];

    return (
        <div className="w-64 flex-shrink-0 border-r border-[var(--border)] bg-[rgba(18,18,20,0.6)] backdrop-blur-xl h-screen sticky top-0 flex flex-col z-20 transition-all duration-300">
            {/* Logo Area */}
            <div className="h-16 flex items-center px-6 border-b border-[var(--border)]">
                <Link href="/dashboard" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[var(--violet)] to-[var(--cyan)] flex items-center justify-center shadow-lg shadow-[var(--accent-glow)] group-hover:scale-105 transition-transform duration-300">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-[var(--text-muted)]">
                        AgentForge
                    </span>
                </Link>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                <div className="text-xs font-semibold text-[var(--text-faint)] uppercase tracking-wider mb-4 px-2">
                    Platform
                </div>
                {menuItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                    const Icon = item.icon;
                    
                    return (
                        <Link 
                            key={item.href} 
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 relative group",
                                isActive ? "text-white" : "text-[var(--text-muted)] hover:text-white hover:bg-[rgba(255,255,255,0.03)]"
                            )}
                        >
                            {isActive && (
                                <motion.div 
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.2)] rounded-xl -z-10"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}
                            <Icon className={cn("w-4 h-4", isActive ? "text-[var(--accent)]" : "group-hover:text-[var(--text-primary)] transition-colors")} />
                            {item.label}
                            
                            {item.placeholder && (
                                <span className="ml-auto text-[9px] font-bold tracking-widest uppercase bg-[rgba(255,255,255,0.05)] px-1.5 py-0.5 rounded text-[var(--text-faint)]">
                                    Soon
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-[var(--border)] space-y-1">
                {bottomItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link 
                            key={item.label} 
                            href={item.href}
                            onClick={item.action ? (e) => { e.preventDefault(); /* Global search trigger here */ } : undefined}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-[var(--text-muted)] hover:text-white hover:bg-[rgba(255,255,255,0.03)] transition-all duration-200 group"
                        >
                            <Icon className="w-4 h-4 group-hover:text-white transition-colors" />
                            {item.label}
                            {item.action && (
                                <div className="ml-auto flex items-center gap-1">
                                    <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-[rgba(255,255,255,0.05)] border border-[var(--border)] rounded text-[var(--text-faint)] font-mono">
                                        Ctrl
                                    </kbd>
                                    <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-[rgba(255,255,255,0.05)] border border-[var(--border)] rounded text-[var(--text-faint)] font-mono">
                                        K
                                    </kbd>
                                </div>
                            )}
                        </Link>
                    );
                })}
                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-[var(--rose)] hover:bg-[rgba(244,63,94,0.1)] transition-all duration-200"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </button>
            </div>
        </div>
    );
}
