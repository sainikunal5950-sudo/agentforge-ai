"use client";

import { usePathname } from "next/navigation";
import { Bell, ChevronRight } from "lucide-react";
import CommandPalette from "./CommandPalette";

export default function TopBar() {
    const pathname = usePathname();

    // Simple breadcrumb generator
    const generateBreadcrumbs = () => {
        const paths = pathname.split("/").filter(Boolean);
        if (paths.length === 0) return [{ name: "Dashboard", current: true }];
        
        return paths.map((path, index) => {
            const isLast = index === paths.length - 1;
            const name = path.charAt(0).toUpperCase() + path.slice(1);
            return {
                name: path === "agents" ? "AI Agents" : name.length > 24 ? name.substring(0, 10) + "..." : name,
                current: isLast
            };
        });
    };

    const breadcrumbs = generateBreadcrumbs();

    return (
        <header className="h-16 flex-shrink-0 flex items-center justify-between px-6 lg:px-8 border-b border-[var(--border)] bg-[rgba(18,18,20,0.6)] backdrop-blur-xl sticky top-0 z-10">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2">
                {breadcrumbs.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                        {index > 0 && <ChevronRight className="w-4 h-4 text-[var(--text-faint)]" />}
                        <span className={`text-sm font-medium ${item.current ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`}>
                            {item.name}
                        </span>
                    </div>
                ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
                <CommandPalette />
                
                <div className="w-px h-5 bg-[var(--border)] hidden sm:block" />
                
                <button className="relative text-[var(--text-muted)] hover:text-white transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-[var(--accent)] rounded-full border border-[var(--bg-base)]" />
                </button>
                
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--accent)] to-[var(--violet)] flex items-center justify-center border border-[var(--border)] cursor-pointer hover:shadow-lg hover:shadow-[var(--accent-glow)] transition-all">
                    <span className="text-white text-xs font-bold">JD</span>
                </div>
            </div>
        </header>
    );
}
