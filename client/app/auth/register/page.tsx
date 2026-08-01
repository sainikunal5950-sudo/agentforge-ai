"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, ArrowRight, Lock, Mail, User, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import { RegisterInput } from "@/lib/types";
import { useToast } from "@/contexts/ToastContext";

export default function RegisterPage() {
    const router = useRouter();
    const { addToast } = useToast();
    const [form, setForm] = useState<RegisterInput>({ name: "", email: "", password: "" });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("/api/auth/register", form);
            addToast("Account created successfully!", "success");
            router.push("/dashboard");
        } catch (err: any) {
            const msg = err.response?.data?.message || "Registration failed.";
            addToast(msg, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative p-6 bg-[var(--bg-base)] text-white">
            <div className="absolute inset-0 gradient-bg opacity-50" />
            
            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="flex flex-col items-center mb-10">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[var(--violet)] to-[var(--cyan)] flex items-center justify-center shadow-lg shadow-[var(--accent-glow)] mb-4">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight mb-2">Create an account</h2>
                    <p className="text-[var(--text-muted)] text-sm">Join AgentForge and build your AI workforce</p>
                </div>

                {/* Form Card */}
                <div className="glass-panel p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-medium text-[var(--text-faint)] uppercase tracking-wider mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-[var(--text-muted)]" />
                                </div>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={form.name}
                                    onChange={handleChange}
                                    className="w-full bg-[rgba(255,255,255,0.03)] border border-[var(--border)] rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--violet)] focus:ring-1 focus:ring-[var(--violet)] transition-colors"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-[var(--text-faint)] uppercase tracking-wider mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-[var(--text-muted)]" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={form.email}
                                    onChange={handleChange}
                                    className="w-full bg-[rgba(255,255,255,0.03)] border border-[var(--border)] rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--violet)] focus:ring-1 focus:ring-[var(--violet)] transition-colors"
                                    placeholder="john@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-[var(--text-faint)] uppercase tracking-wider mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-[var(--text-muted)]" />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    minLength={6}
                                    value={form.password}
                                    onChange={handleChange}
                                    className="w-full bg-[rgba(255,255,255,0.03)] border border-[var(--border)] rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--violet)] focus:ring-1 focus:ring-[var(--violet)] transition-colors"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !form.name || !form.email || !form.password}
                            className="btn-primary w-full py-3 flex justify-center mt-6 group disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-[var(--text-muted)]">
                        Already have an account?{" "}
                        <Link href="/auth/login" className="text-[var(--accent)] hover:text-white font-medium transition-colors">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
