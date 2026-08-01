"use client";

import { useRouter } from "next/navigation";
import AgentForm from "../AgentForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateAgentPage() {
    const router = useRouter();

    const handleSuccess = () => {
        router.push("/agents");
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
                <Link href="/agents" className="p-2 rounded-lg text-[var(--text-muted)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <span className="text-[var(--text-muted)] text-sm">Back to Agents</span>
            </div>
            <AgentForm onSuccess={handleSuccess} />
        </div>
    );
}
