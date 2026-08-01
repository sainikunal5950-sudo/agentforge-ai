"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
    Bot, 
    MessageSquare, 
    Zap, 
    Activity, 
    Clock, 
    ChevronRight,
    Cpu,
    ArrowUpRight
} from "lucide-react";

const stats = [
    { label: "Total Agents", value: "4", icon: Bot, color: "text-[var(--violet)]", bg: "bg-[rgba(139,92,246,0.1)]" },
    { label: "Active Agents", value: "2", icon: Activity, color: "text-[var(--emerald)]", bg: "bg-[rgba(16,185,129,0.1)]" },
    { label: "Chats Today", value: "32", icon: MessageSquare, color: "text-[var(--cyan)]", bg: "bg-[rgba(6,182,212,0.1)]" },
    { label: "Avg Response", value: "0.8s", icon: Clock, color: "text-[var(--amber)]", bg: "bg-[rgba(245,158,11,0.1)]" },
];

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative glass-card overflow-hidden rounded-2xl p-8 sm:p-10"
            >
                {/* Decorative background blur */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[var(--accent)] rounded-full blur-[100px] opacity-20 pointer-events-none" />
                
                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(255,255,255,0.05)] border border-[var(--border)] text-sm mb-6">
                        <span className="w-2 h-2 rounded-full bg-[var(--emerald)] animate-pulse" />
                        <span className="text-[var(--text-muted)]">System Online</span>
                    </div>
                    
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-white">
                        Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--violet)] to-[var(--cyan)]">Developer</span>
                    </h1>
                    
                    <p className="text-lg text-[var(--text-muted)] mb-8">
                        Your AI execution engine is running flawlessly. You have 2 active agents currently utilizing the Groq Llama 3.3 model.
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <Link href="/agents/create" className="btn-primary flex items-center gap-2">
                            <PlusIcon /> Deploy New Agent
                        </Link>
                        <Link href="/agents" className="btn-secondary flex items-center gap-2">
                            View All Agents <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="glass-card p-6 flex flex-col justify-between"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl ${stat.bg}`}>
                                    <Icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-[var(--text-faint)]" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-white tracking-tight mb-1">{stat.value}</h3>
                                <p className="text-sm font-medium text-[var(--text-muted)]">{stat.label}</p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Bottom Section - System Health & Recent Activity placeholders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="glass-card p-6 lg:col-span-2"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-white">Execution Metrics</h2>
                        <span className="badge badge-violet">Last 24 Hours</span>
                    </div>
                    {/* Placeholder Chart Area */}
                    <div className="h-64 flex items-end justify-between gap-2 px-2">
                        {[40, 25, 60, 30, 80, 45, 90, 50, 75, 40, 65, 85].map((height, i) => (
                            <div key={i} className="w-full relative group">
                                <div 
                                    className="absolute bottom-0 w-full bg-[rgba(99,102,241,0.2)] rounded-t-sm group-hover:bg-[var(--accent)] transition-colors duration-300"
                                    style={{ height: `${height}%` }}
                                />
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="glass-card p-6"
                >
                    <h2 className="text-lg font-semibold text-white mb-6">Infrastructure</h2>
                    
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="p-2 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[var(--border)]">
                                <Cpu className="w-4 h-4 text-[var(--text-muted)]" />
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-white">Active Provider</h4>
                                <p className="text-xs text-[var(--text-muted)] mt-1">Groq (Default)</p>
                            </div>
                        </div>
                        
                        <div className="flex items-start gap-4">
                            <div className="p-2 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[var(--border)]">
                                <Zap className="w-4 h-4 text-[var(--text-muted)]" />
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-white">Default Model</h4>
                                <p className="text-xs text-[var(--text-muted)] mt-1">llama-3.3-70b-versatile</p>
                            </div>
                        </div>
                        
                        <div className="flex items-start gap-4">
                            <div className="p-2 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[var(--border)]">
                                <Activity className="w-4 h-4 text-[var(--emerald)]" />
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-white">Database Status</h4>
                                <p className="text-xs text-[var(--text-muted)] mt-1">Connected (0ms lag)</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function PlusIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"/><path d="M12 5v14"/>
        </svg>
    )
}
