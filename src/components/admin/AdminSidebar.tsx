'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { adminLogout } from '@/app/actions/admin'
import {
    LayoutDashboard,
    Users,
    Layers,
    KeyRound,
    QrCode,
    ScrollText,
    ShieldAlert,
    LogOut,
} from 'lucide-react'

const NAV_ITEMS = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/cashiers', label: 'Cajeros', icon: Users },
    { href: '/admin/stations', label: 'Estaciones', icon: Layers },
    { href: '/admin/pins', label: 'PINs', icon: KeyRound },
    { href: '/admin/qrs', label: 'QR Codes', icon: QrCode },
    { href: '/admin/logs', label: 'Logs', icon: ScrollText },
    { href: '/admin/locks', label: 'Bloqueos', icon: ShieldAlert },
]

export function AdminSidebar() {
    const pathname = usePathname()

    return (
        <aside
            className="flex flex-col w-64 min-h-screen bg-[#121212] p-6 gap-2"
            style={{
                // Sombra del sidebar en el mismo elemento que controla el fondo — no hay wrapper adicional
                boxShadow: '4px 0 24px rgba(0,0,0,0.6)',
                isolation: 'isolate',
            }}
        >
            {/* Logo */}
            <div className="mb-8">
                <h1 className="text-xl font-black tracking-widest text-white">CASINO<span className="text-[#007BFF]">CLOCK</span></h1>
                <p className="text-xs text-gray-600 mt-1 tracking-widest">PANEL ADMIN</p>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-2 flex-1">
                {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href
                    return (
                        <Link key={href} href={href}>
                            <motion.div
                                whileTap={{ scale: 0.96 }}
                                className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 cursor-pointer select-none ${isActive ? 'text-[#007BFF]' : 'text-gray-400 hover:text-white'
                                    }`}
                                style={{
                                    // border-radius, box-shadow y background en el MISMO elemento
                                    borderRadius: '1rem',
                                    backgroundColor: '#121212',
                                    boxShadow: isActive
                                        ? 'inset 4px 4px 8px #000000, inset -4px -4px 8px #1a1a1a'
                                        : 'none',
                                    isolation: 'isolate',
                                }}
                            >
                                <Icon size={18} />
                                <span className="text-sm font-semibold tracking-wide">{label}</span>
                                {isActive && (
                                    <div
                                        className="ml-auto w-1.5 h-1.5 rounded-full bg-[#007BFF]"
                                        style={{ boxShadow: '0 0 6px rgba(0,123,255,0.8)' }}
                                    />
                                )}
                            </motion.div>
                        </Link>
                    )
                })}
            </nav>

            {/* Logout */}
            <form action={adminLogout}>
                <motion.button
                    type="submit"
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-gray-500 hover:text-[#FF3B30] transition-colors duration-200 text-sm font-semibold tracking-wide cursor-pointer"
                    style={{ backgroundColor: '#121212' }}
                >
                    <LogOut size={18} />
                    Cerrar sesión
                </motion.button>
            </form>
        </aside>
    )
}
