"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Bot, Zap, Shield, ArrowRight } from "lucide-react";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[var(--bg-base)] text-white selection:bg-[var(--accent-glow)] selection:text-white">
            {/* Navigation */}
            <nav className="fixed w-full z-50 border-b border-[var(--border)] bg-[rgba(0,0,0,0.5)] backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[var(--violet)] to-[var(--cyan)] flex items-center justify-center shadow-lg shadow-[var(--accent-glow)]">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">AgentForge</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/auth/login" className="text-sm font-medium text-[var(--text-muted)] hover:text-white transition-colors">
                            Sign In
                        </Link>
                        <Link href="/auth/register" className="btn-primary text-sm shadow-none">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--accent)] rounded-full blur-[120px] opacity-10 pointer-events-none" />
                
                <div className="max-w-5xl mx-auto text-center relative z-10 pt-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(255,255,255,0.03)] border border-[var(--border)] text-sm mb-8">
                            <span className="text-[var(--accent)] flex items-center gap-1.5 font-medium">
                                <Sparkles className="w-3.5 h-3.5" />
                                AgentForge 2.0
                            </span>
                            <span className="w-px h-3 bg-[var(--border)] mx-1" />
                            <span className="text-[var(--text-muted)]">Enterprise AI SaaS</span>
                        </div>
                        
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
                            Build autonomous <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--violet)] to-[var(--cyan)]">
                                AI employees
                            </span>
                        </h1>
                        
                        <p className="text-lg md:text-xl text-[var(--text-muted)] max-w-2xl mx-auto mb-10 leading-relaxed">
                            Deploy highly intelligent AI agents powered by Groq, OpenAI, and Gemini. 
                            Configure their roles, give them memory, and watch them execute tasks autonomously.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/auth/register" className="btn-primary flex items-center gap-2 text-base px-8 py-4 w-full sm:w-auto justify-center">
                                Start Building <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link href="/auth/login" className="btn-secondary flex items-center gap-2 text-base px-8 py-4 w-full sm:w-auto justify-center bg-[rgba(255,255,255,0.03)]">
                                View Documentation
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 px-6 border-t border-[var(--border)] bg-[rgba(255,255,255,0.01)] relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Production-ready infrastructure</h2>
                        <p className="text-[var(--text-muted)] max-w-xl mx-auto">
                            Everything you need to scale your AI operations, from lightning-fast inference routing to secure JWT authentication.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { icon: Zap, title: "Multi-Provider Router", desc: "Seamlessly switch between Groq, OpenAI, and Gemini. Failover automatically." },
                            { icon: Bot, title: "Agent Profiles", desc: "Define strict personas, system prompts, and execution capabilities for each agent." },
                            { icon: Shield, title: "Enterprise Security", desc: "HttpOnly cookies, JWT rotation, and strict resource isolation built-in." }
                        ].map((feature, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-card p-8 hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                            >
                                <div className="w-12 h-12 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[var(--border)] flex items-center justify-center mb-6">
                                    <feature.icon className="w-6 h-6 text-[var(--accent)]" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                                <p className="text-[var(--text-muted)] leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-[var(--border)] py-12 px-6 text-center">
                <p className="text-[var(--text-muted)] text-sm">
                    © 2026 AgentForge Inc. All rights reserved. Designed for the future.
                </p>
            </footer>
        </div>
    );
}
