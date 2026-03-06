'use client'

import { useEffect, useState } from 'react'
import { adminFetchLocks, adminUnlock } from '@/app/actions/admin'
import { AdminTable } from '@/components/admin/AdminTable'
import { NeumorphicButton } from '@/components/NeumorphicButton'
import { ShieldCheck, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'

export default function LocksPage() {
    const [locks, setLocks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [unlocking, setUnlocking] = useState<string | null>(null)

    const load = async () => {
        setLoading(true)
        const res = await adminFetchLocks()
        if (res.ok) setLocks(res.data!)
        setLoading(false)
    }

    useEffect(() => { load() }, [])

    const handleUnlock = async (lock: any) => {
        const key = `${lock.cashier_id}-${lock.station_id}`
        setUnlocking(key)
        await adminUnlock(lock.cashier_id, lock.station_id)
        setUnlocking(null)
        load()
    }

    const formatTimeLeft = (lockedUntil: string) => {
        const diff = new Date(lockedUntil).getTime() - Date.now()
        if (diff <= 0) return 'Expirado'
        const secs = Math.ceil(diff / 1000)
        return `${Math.floor(secs / 60)}m ${secs % 60}s`
    }

    const columns = [
        { key: 'cashier', header: 'Cajero', render: (r: any) => r.cashiers?.display_name ?? r.cashier_id },
        { key: 'station', header: 'Estación', render: (r: any) => r.stations?.label ?? r.station_id },
        { key: 'failed_count', header: 'Intentos', render: (r: any) => <span className="text-[#FF3B30] font-bold">{r.failed_count}</span> },
        { key: 'locked_until', header: 'Expira en', render: (r: any) => <span className="text-yellow-500 text-xs font-mono">{formatTimeLeft(r.locked_until)}</span> },
        {
            key: 'actions', header: 'Acción',
            render: (r: any) => {
                const key = `${r.cashier_id}-${r.station_id}`
                return (
                    <NeumorphicButton
                        onClick={() => handleUnlock(r)}
                        disabled={unlocking === key}
                        className="px-4 py-2 text-xs gap-2 text-[#007BFF]"
                    >
                        <ShieldCheck size={12} />
                        {unlocking === key ? 'DESBLOQUEANDO...' : 'Desbloquear'}
                    </NeumorphicButton>
                )
            }
        }
    ]

    return (
        <div>
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h2 className="text-3xl font-black tracking-widest text-white mb-1">BLOQUEOS</h2>
                    <p className="text-xs text-gray-500 tracking-widest">RATE LIMIT ACTIVOS</p>
                </div>
                <NeumorphicButton onClick={load} className="px-4 py-2.5 gap-2 text-xs text-gray-400">
                    <RefreshCw size={14} /> Actualizar
                </NeumorphicButton>
            </div>

            {loading ? (
                <p className="text-gray-600 text-sm">Cargando...</p>
            ) : locks.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-20 gap-4"
                >
                    <ShieldCheck size={48} className="text-[#007BFF]" style={{ filter: 'drop-shadow(0 0 12px rgba(0,123,255,0.4))' }} />
                    <p className="text-gray-500 text-sm tracking-widest">SIN BLOQUEOS ACTIVOS</p>
                </motion.div>
            ) : (
                <AdminTable columns={columns} rows={locks} emptyMessage="Sin bloqueos activos." />
            )}
        </div>
    )
}
