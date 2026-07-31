"use client";

import React from "react";

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`bg-white/5 border border-white/10 rounded-xl overflow-hidden shadow-xl ${className}`}>
            {children}
        </div>
    );
}

export function CardSection({ 
    title, 
    description, 
    children, 
    className = "",
    isLast = false
}: { 
    title: string; 
    description?: string; 
    children: React.ReactNode; 
    className?: string;
    isLast?: boolean;
}) {
    return (
        <div className={`p-6 md:p-8 flex flex-col md:flex-row gap-8 ${!isLast ? "border-b border-white/5" : ""} ${className}`}>
            <div className="md:w-1/3 flex-shrink-0">
                <h3 className="text-lg font-semibold text-white/90 mb-2">{title}</h3>
                {description && <p className="text-sm text-white/50 leading-relaxed">{description}</p>}
            </div>
            <div className="md:w-2/3 flex-grow space-y-5">
                {children}
            </div>
        </div>
    );
}
