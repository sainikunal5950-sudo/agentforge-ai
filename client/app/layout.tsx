// ─────────────────────────────────────────────────────────────────────────────
// app/layout.tsx — Root Layout (App Router)
// ─────────────────────────────────────────────────────────────────────────────
// Next.js App Router requires a root layout that wraps every page.
// This file:
//   1. Sets global <head> metadata (title, description for SEO)
//   2. Applies global CSS
//   3. Renders the Sidebar + TopBar shell
//   4. Renders each page's content inside the main area
//
// WHY NOT use pages/ router?
//   App Router (Next.js 13+) uses React Server Components by default,
//   meaning components don't ship any JavaScript unless marked "use client".
//   Layout.tsx itself is a Server Component — it has zero client JS overhead.
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";

export const metadata: Metadata = {
    title: {
        default: "AgentForge — Dev Testing Dashboard",
        template: "%s | AgentForge Dev",
    },
    description:
        "Developer testing dashboard for the AgentForge AI backend. Test authentication, JWT cookies, refresh token rotation, and user management APIs.",
    keywords: ["AgentForge", "JWT", "Developer Dashboard", "API Testing", "Express", "MongoDB"],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <body className="bg-[#0a0a0f] text-white antialiased">
                {/* ── Fixed Sidebar (260px wide) ─────────────────────────── */}
                <Sidebar />

                {/* ── Fixed Top Bar ─────────────────────────────────────── */}
                <TopBar />

                {/* ── Main Content Area ─────────────────────────────────── */}
                {/*
                    Using inline styles for the layout-critical parts:
                    Tailwind utilities (fixed, left-64, flex, justify-center)
                    can sometimes be overridden or miscalculated at runtime.
                    Inline styles are browser-native and always win.

                    top: 64px  → height of TopBar (h-16 = 4rem = 64px)
                    left: 256px → width of Sidebar (w-64 = 16rem = 256px)
                    right: 0 / bottom: 0 → fills remaining viewport
                    overflow-y: auto → scrolling happens inside this box
                */}
                <main
                    className="gradient-bg"
                    style={{
                        position: "fixed",
                        top: "64px",
                        left: "256px",
                        right: 0,
                        bottom: 0,
                        overflowY: "auto",
                    }}
                >
                    {/*
                        display: flex + justifyContent: center
                        → horizontally centers the content column
                        inside the available area (viewport − sidebar)
                    */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            padding: "2rem 1.5rem",
                            minHeight: "100%",
                        }}
                    >
                        {/* maxWidth: 768px → readable line-length for forms + JSON */}
                        <div
                            style={{ width: "100%", maxWidth: "768px" }}
                            className="page-enter"
                        >
                            {children}
                        </div>
                    </div>
                </main>
            </body>
        </html>
    );
}
