'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface AdminCardProps {
    title: string
    value?: string | number
    icon?: ReactNode
    href?: string
    className?: string
    onClick?: () => void
    children?: ReactNode
}

export function AdminCard({ title, value, icon, className = '', onClick, children }: AdminCardProps) {
    return (
        <motion.div
            whileTap={onClick ? { scale: 0.97 } : {}}
            onClick={onClick}
            className={`neu-card p-6 flex flex-col gap-3 ${onClick ? 'cursor-pointer' : ''} ${className}`}
        >
            {(icon || title) && (
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold tracking-widest text-gray-500 uppercase">{title}</span>
                    {icon && <span className="text-[#007BFF]">{icon}</span>}
                </div>
            )}
            {value !== undefined && (
                <span className="text-4xl font-black text-white" style={{ textShadow: '0 0 20px rgba(0,123,255,0.2)' }}>
                    {value}
                </span>
            )}
            {children}
        </motion.div>
    )
}
