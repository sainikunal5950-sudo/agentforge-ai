"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { ReactNode } from "react";

export default function ClientLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    // Do not show the App Shell (Sidebar/TopBar) on Landing and Auth pages
    const isPublicPage = pathname === "/" || pathname.startsWith("/auth");

    if (isPublicPage) {
        return (
            <main className="min-h-screen relative overflow-x-hidden">
                {children}
            </main>
        );
    }

    return (
        <>
            <div className="absolute inset-0 gradient-bg -z-10" />
            
            {/* Fixed Sidebar */}
            <Sidebar />

            {/* Main Application Area */}
            <div className="flex flex-col flex-1 min-w-0 transition-all duration-300">
                {/* Fixed Top Bar */}
                <TopBar />

                {/* Scrollable Content Area */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
                    <div className="mx-auto max-w-6xl p-6 lg:p-8 w-full min-h-full page-enter pb-32">
                        {children}
                    </div>
                </main>
            </div>
        </>
    );
}
