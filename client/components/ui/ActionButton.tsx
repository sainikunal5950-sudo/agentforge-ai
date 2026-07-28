"use client";

// ─────────────────────────────────────────────────────────────────────────────
// components/ui/ActionButton.tsx
// ─────────────────────────────────────────────────────────────────────────────
// A submit button that shows a spinner when loading and disables itself.
// This prevents double-submissions and gives immediate visual feedback.
// ─────────────────────────────────────────────────────────────────────────────

import { LoaderIcon } from "./Icons";

type ButtonVariant = "primary" | "danger" | "secondary" | "ghost";

interface ActionButtonProps {
    label: string;
    loadingLabel?: string;
    loading: boolean;
    onClick?: () => void;
    type?: "button" | "submit";
    variant?: ButtonVariant;
    fullWidth?: boolean;
    disabled?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
    primary:
        "bg-violet-600 hover:bg-violet-500 text-white border-transparent shadow-lg shadow-violet-600/20",
    danger:
        "bg-red-600/80 hover:bg-red-600 text-white border-transparent shadow-lg shadow-red-600/20",
    secondary:
        "bg-white/10 hover:bg-white/15 text-white border-white/10",
    ghost:
        "bg-transparent hover:bg-white/5 text-white/70 hover:text-white border-white/10",
};

export default function ActionButton({
    label,
    loadingLabel = "Loading...",
    loading,
    onClick,
    type = "button",
    variant = "primary",
    fullWidth = true,
    disabled = false,
}: ActionButtonProps) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={loading || disabled}
            className={`
                ${fullWidth ? "w-full" : ""}
                flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg
                border font-medium text-sm transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                active:scale-[0.98]
                ${variantStyles[variant]}
            `}
        >
            {loading ? (
                <>
                    <LoaderIcon />
                    {loadingLabel}
                </>
            ) : (
                label
            )}
        </button>
    );
}
