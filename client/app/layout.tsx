import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "@/components/layout/ClientLayout";
import { ToastProvider } from "@/contexts/ToastContext";

export const metadata: Metadata = {
    title: {
        default: "AgentForge — Enterprise AI SaaS",
        template: "%s | AgentForge",
    },
    description: "Premium enterprise AI platform for managing autonomous AI agents.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <body className="bg-[var(--bg-base)] text-[var(--text-primary)] antialiased selection:bg-[var(--accent-glow)] selection:text-white min-h-screen flex overflow-hidden">
                <ToastProvider>
                    <ClientLayout>
                        {children}
                    </ClientLayout>
                </ToastProvider>
            </body>
        </html>
    );
}
