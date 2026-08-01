"use client";

import { useEffect, useState } from "react";
import { User, Mail, Calendar, Shield, Edit3 } from "lucide-react";
import api from "@/lib/axios";

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Fetch current user details from existing backend
        api.get("/api/auth/me").then(res => setUser(res.data.data)).catch(console.error);
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1">User Profile</h1>
                    <p className="text-[var(--text-muted)] text-sm">Manage your personal information and security settings.</p>
                </div>
                <button className="btn-secondary flex items-center gap-2">
                    <Edit3 className="w-4 h-4" /> Edit Profile
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="glass-panel p-8 md:col-span-1 flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[var(--violet)] to-[var(--cyan)] flex items-center justify-center shadow-lg shadow-[var(--accent-glow)] mb-6 border-4 border-[rgba(255,255,255,0.05)]">
                        <span className="text-3xl font-bold text-white">
                            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </span>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-1">{user?.name || "Loading..."}</h2>
                    <p className="text-[var(--text-muted)] text-sm mb-4">{user?.email || "..."}</p>
                    
                    <div className="w-full h-px bg-[var(--border)] my-4" />
                    
                    <div className="w-full flex items-center justify-between text-sm">
                        <span className="text-[var(--text-muted)]">Role</span>
                        <span className="badge badge-violet">Developer</span>
                    </div>
                </div>

                {/* Details Section */}
                <div className="glass-card p-8 md:col-span-2 space-y-8">
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-[var(--accent)]" /> 
                            Personal Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[var(--border)]">
                                <span className="text-xs text-[var(--text-faint)] block mb-1">Full Name</span>
                                <span className="text-sm font-medium text-white">{user?.name || "-"}</span>
                            </div>
                            <div className="p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[var(--border)]">
                                <span className="text-xs text-[var(--text-faint)] block mb-1">Email Address</span>
                                <span className="text-sm font-medium text-white">{user?.email || "-"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-px bg-[var(--border)]" />

                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-[var(--accent)]" /> 
                            Security & Access
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[var(--border)] flex justify-between items-center">
                                <div>
                                    <span className="text-xs text-[var(--text-faint)] block mb-1">Password</span>
                                    <span className="text-sm font-medium text-white">••••••••</span>
                                </div>
                                <button className="text-xs text-[var(--accent)] hover:text-white transition-colors">Change</button>
                            </div>
                            <div className="p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[var(--border)]">
                                <span className="text-xs text-[var(--text-faint)] block mb-1">Account Created</span>
                                <span className="text-sm font-medium text-white">
                                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
