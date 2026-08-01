"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Command, Bot, LayoutDashboard, Settings, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CommandPalette() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const router = useRouter();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
            if (e.key === "Escape") {
                setOpen(false);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const routes = [
        { icon: LayoutDashboard, title: "Dashboard", href: "/dashboard" },
        { icon: Bot, title: "AI Agents", href: "/agents" },
        { icon: Bot, title: "Create Agent", href: "/agents/create" },
        { icon: Settings, title: "Settings", href: "/settings" },
        { icon: User, title: "Profile", href: "/user/profile" },
    ];

    const filtered = routes.filter(route => 
        route.title.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <>
            <button 
                onClick={() => setOpen(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(255,255,255,0.03)] border border-[var(--border)] text-sm text-[var(--text-muted)] hover:text-white transition-colors"
            >
                <Command className="w-3.5 h-3.5" />
                <span className="font-mono text-xs">Ctrl K</span>
            </button>

            <AnimatePresence>
                {open && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        />
                        <div className="fixed inset-0 flex items-start justify-center pt-[15vh] z-50 pointer-events-none">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="w-full max-w-xl bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
                            >
                                <div className="flex items-center px-4 py-4 border-b border-[var(--border)] gap-3">
                                    <Search className="w-5 h-5 text-[var(--text-muted)]" />
                                    <input 
                                        autoFocus
                                        value={query}
                                        onChange={e => setQuery(e.target.value)}
                                        placeholder="Search agents, commands, and settings..."
                                        className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-[var(--text-muted)]"
                                    />
                                    <div className="flex gap-1">
                                        <kbd className="px-2 py-1 bg-[rgba(255,255,255,0.05)] border border-[var(--border)] rounded text-xs text-[var(--text-faint)] font-mono">
                                            ESC
                                        </kbd>
                                    </div>
                                </div>
                                <div className="max-h-[60vh] overflow-y-auto p-2">
                                    {filtered.length === 0 ? (
                                        <div className="py-14 text-center text-[var(--text-muted)]">
                                            No results found.
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            {filtered.map((route, i) => {
                                                const Icon = route.icon;
                                                return (
                                                    <button
                                                        key={i}
                                                        onClick={() => {
                                                            router.push(route.href);
                                                            setOpen(false);
                                                        }}
                                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[rgba(255,255,255,0.03)] text-left group transition-colors"
                                                    >
                                                        <Icon className="w-4 h-4 text-[var(--text-muted)] group-hover:text-white transition-colors" />
                                                        <span className="text-sm font-medium text-[var(--text-muted)] group-hover:text-white transition-colors">
                                                            {route.title}
                                                        </span>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
