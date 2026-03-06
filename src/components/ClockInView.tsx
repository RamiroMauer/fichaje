"use client";

import { motion } from "framer-motion";
import { NeumorphicButton } from "./NeumorphicButton";

interface Props {
    employeeName: string;
    onClockIn: () => void;
    onCancel: () => void;
}

export function ClockInView({ employeeName, onClockIn, onCancel }: Props) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center gap-16 text-center h-full pt-10"
        >
            <div>
                <h2 className="text-xl font-medium text-gray-400 mb-2">Bienvenido/a</h2>
                <h1 className="text-4xl font-bold text-white tracking-wide">{employeeName}</h1>
            </div>

            <motion.button
                onClick={onClockIn}
                style={{ boxShadow: "var(--shadow-neu-flat)" }}
                className={`
          w-56 h-56 rounded-full flex flex-col items-center justify-center 
          bg-gradient-to-br from-[#161616] to-[#101010] border-4 border-[var(--color-accent)] 
          text-[var(--color-accent)] font-bold text-3xl tracking-widest
          cursor-pointer select-none
        `}
            >
                FICHAR
            </motion.button>

            <div className="mt-8">
                <NeumorphicButton onClick={onCancel} className="px-8 py-3 text-sm text-gray-400 font-medium">
                    Cancelar
                </NeumorphicButton>
            </div>
        </motion.div>
    );
}
