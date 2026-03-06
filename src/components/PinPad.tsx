"use client";

import { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { NeumorphicButton } from "./NeumorphicButton";
import { Delete } from "lucide-react";

interface Props {
    onComplete: (pin: string) => void;
    isError: boolean;
    onErrorReset: () => void;
}

export function PinPad({ onComplete, isError, onErrorReset }: Props) {
    const [pin, setPin] = useState("");
    const controls = useAnimation();

    useEffect(() => {
        if (isError) {
            controls.start({
                x: [0, -10, 10, -10, 10, -5, 5, 0],
                transition: { duration: 0.4 }
            }).then(() => {
                setPin("");
                onErrorReset();
            });
        }
    }, [isError, controls, onErrorReset]);

    useEffect(() => {
        if (pin.length === 4) {
            onComplete(pin);
        }
    }, [pin, onComplete]);

    const handlePress = (val: string) => {
        if (pin.length < 4 && !isError) {
            setPin(prev => prev + val);
        }
    };

    const handleDelete = () => {
        if (!isError) {
            setPin(prev => prev.slice(0, -1));
        }
    };

    const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

    return (
        <motion.div animate={controls} className="flex flex-col items-center gap-8">
            {/* Indicadores de PIN — cada dot: bg + sombra en el mismo elemento redondeado */}
            <div className="flex gap-6 mb-2">
                {[0, 1, 2, 3].map((index) => (
                    <div
                        key={index}
                        className="w-4 h-4 rounded-full transition-all duration-300"
                        style={{
                            backgroundColor: index < pin.length ? 'var(--color-accent)' : '#1a1a1a',
                            boxShadow: index < pin.length
                                ? 'none'
                                : 'inset 2px 2px 5px #000000, inset -2px -2px 4px #202020',
                            transform: index < pin.length ? 'scale(1.1)' : 'scale(1)',
                            isolation: 'isolate',
                        }}
                    />
                ))}
            </div>

            <div className="grid grid-cols-3 gap-6">
                {digits.map(d => (
                    <NeumorphicButton key={d} onClick={() => handlePress(d)} className="w-16 h-16 text-xl">
                        {d}
                    </NeumorphicButton>
                ))}
                <div /> {/* Empty slot */}
                <NeumorphicButton onClick={() => handlePress("0")} className="w-16 h-16 text-xl">
                    0
                </NeumorphicButton>
                <NeumorphicButton onClick={handleDelete} className="w-16 h-16 text-xl text-red-500">
                    <Delete size={24} />
                </NeumorphicButton>
            </div>
        </motion.div>
    );
}
