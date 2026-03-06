'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { ReactNode } from 'react'
import { NeumorphicButton } from '@/components/NeumorphicButton'

interface AdminModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: ReactNode
}

export function AdminModal({ isOpen, onClose, title, children }: AdminModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
                    />

                    {/* Modal — sombra y border-radius en el mismo div, overflow:hidden garantiza que el contenido no rompa las esquinas */}
                    <motion.div
                        key="modal"
                        initial={{ opacity: 0, scale: 0.92, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 20 }}
                        transition={{ type: 'spring', duration: 0.4 }}
                        className="fixed inset-0 flex items-center justify-center z-50 p-4"
                    >
                        {/* El neu-card aplica: bg, box-shadow, border-radius, overflow:hidden e isolation en un solo elemento */}
                        <div className="neu-card p-8 w-full max-w-md">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-black tracking-widest text-white">{title}</h2>
                                <NeumorphicButton onClick={onClose} className="w-10 h-10 text-gray-400">
                                    <X size={16} />
                                </NeumorphicButton>
                            </div>

                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
