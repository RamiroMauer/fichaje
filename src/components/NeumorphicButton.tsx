"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface Props {
    children: ReactNode;
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
}

export function NeumorphicButton({ children, onClick, className = "", disabled }: Props) {
    return (
        <motion.button
            whileTap={!disabled ? { scale: 0.95, boxShadow: "var(--shadow-neu-pressed)", color: "var(--color-accent)" } : {}}
            onClick={disabled ? undefined : onClick}
            initial={{ boxShadow: "var(--shadow-neu-flat)" }}
            className={`
        flex items-center justify-center rounded-2xl
        bg-[var(--color-background)] text-[var(--color-foreground)]
        font-bold cursor-pointer select-none
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
        >
            {children}
        </motion.button>
    );
}
