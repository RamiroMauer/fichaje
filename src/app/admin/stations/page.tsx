'use client'

import { useEffect, useState } from 'react'
import {
    adminFetchStationsWithAssignments,
    adminFetchCashiers,
    adminSetStationAssignments,
} from '@/app/actions/admin'
import { NeumorphicButton } from '@/components/NeumorphicButton'
import { motion, AnimatePresence } from 'framer-motion'
import { UserCircle2, X, Search, Save } from 'lucide-react'

const REQUIRED = 4

export default function StationsPage() {
    const [stations, setStations] = useState<any[]>([])
    const [allCashiers, setAllCashiers] = useState<any[]>([])
    const [selectedStation, setSelectedStation] = useState<string>('1')
    const [assigned, setAssigned] = useState<any[]>([])
    const [search, setSearch] = useState('')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const load = async () => {
        const [sRes, cRes] = await Promise.all([
            adminFetchStationsWithAssignments(),
            adminFetchCashiers(),
        ])
        if (sRes.ok) setStations(sRes.data!)
        if (cRes.ok) setAllCashiers(cRes.data!.filter((c: any) => c.is_active))
    }

    useEffect(() => { load() }, [])

    useEffect(() => {
        const station = stations.find((s) => s.id === selectedStation)
        setAssigned(station?.cashiers ?? [])
        setError('')
        setSuccess(false)
    }, [selectedStation, stations])

    const assignedIds = new Set(assigned.map((c) => c.id))
    const available = allCashiers.filter(
        (c) => !assignedIds.has(c.id) && c.display_name.toLowerCase().includes(search.toLowerCase())
    )

    const addCashier = (c: any) => {
        if (assigned.length >= REQUIRED) return
        setAssigned((prev) => [...prev, c])
        setError('')
    }

    const removeCashier = (id: string) => {
        setAssigned((prev) => prev.filter((c) => c.id !== id))
    }

    const handleSave = async () => {
        if (assigned.length !== REQUIRED) {
            setError(`Se requieren exactamente ${REQUIRED} cajeros. Tenés ${assigned.length}.`)
            return
        }
        setSaving(true)
        setError('')
        const res = await adminSetStationAssignments(selectedStation, assigned.map((c) => c.id))
        setSaving(false)
        if (!res.ok) { setError(res.message); return }
        setSuccess(true)
        load()
    }

    return (
        <div>
            <div className="mb-10">
                <h2 className="text-3xl font-black tracking-widest text-white mb-1">ESTACIONES</h2>
                <p className="text-xs text-gray-500 tracking-widest">ASIGNACIÓN DE CAJEROS (4 POR CAJA)</p>
            </div>

            {/* Station Tabs */}
            <div className="flex gap-3 mb-8 flex-wrap">
                {stations.map((s) => (
                    <NeumorphicButton
                        key={s.id}
                        onClick={() => setSelectedStation(s.id)}
                        className={`px-5 py-2.5 text-sm tracking-widest ${selectedStation === s.id ? 'text-[#007BFF]' : 'text-gray-500'}`}
                    >
                        {s.label}
                    </NeumorphicButton>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Assigned Slots */}
                <div>
                    <p className="text-xs text-gray-500 tracking-widest mb-4">
                        ASIGNADOS — <span className={assigned.length === REQUIRED ? 'text-[#007BFF]' : 'text-[#FF3B30]'}>{assigned.length}/{REQUIRED}</span>
                    </p>
                    <div className="flex flex-col gap-3">
                        {Array.from({ length: REQUIRED }).map((_, i) => {
                            const c = assigned[i]
                            return (
                                <AnimatePresence key={i} mode="wait">
                                    {c ? (
                                        <motion.div
                                            key={c.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#121212]"
                                            style={{ boxShadow: '6px 6px 12px #000000, -6px -6px 12px #1e1e1e' }}
                                        >
                                            <UserCircle2 size={18} className="text-[#007BFF]" />
                                            <span className="flex-1 text-sm text-white">{c.display_name}</span>
                                            <button onClick={() => removeCashier(c.id)} className="text-gray-600 hover:text-[#FF3B30] transition-colors">
                                                <X size={14} />
                                            </button>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key={`empty-${i}`}
                                            className="h-12 rounded-2xl border border-dashed border-[#2a2a2a] flex items-center justify-center text-gray-700 text-xs tracking-widest"
                                        >
                                            SLOT {i + 1}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            )
                        })}
                    </div>

                    {error && <p className="text-[#FF3B30] text-xs mt-4 font-bold">{error}</p>}
                    {success && <p className="text-[#007BFF] text-xs mt-4 font-bold">Asignación guardada ✓</p>}

                    <NeumorphicButton
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full py-4 mt-6 text-sm tracking-widest gap-2"
                    >
                        <Save size={16} />
                        {saving ? 'GUARDANDO...' : 'GUARDAR ASIGNACIÓN'}
                    </NeumorphicButton>
                </div>

                {/* Available Cashiers */}
                <div>
                    <p className="text-xs text-gray-500 tracking-widest mb-4">CAJEROS DISPONIBLES</p>
                    <div
                        className="flex items-center gap-2 px-4 py-3 rounded-2xl mb-4"
                        style={{ boxShadow: 'inset 3px 3px 6px #000, inset -3px -3px 6px #1e1e1e' }}
                    >
                        <Search size={14} className="text-gray-600" />
                        <input
                            type="text"
                            placeholder="Buscar cajero..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1 bg-transparent text-white placeholder-gray-600 outline-none text-sm"
                        />
                    </div>
                    <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
                        {available.map((c) => (
                            <motion.button
                                key={c.id}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => addCashier(c)}
                                disabled={assigned.length >= REQUIRED}
                                className="flex items-center gap-3 px-5 py-3 rounded-2xl text-sm text-gray-400 hover:text-white transition-colors text-left disabled:opacity-30"
                                style={{ boxShadow: '4px 4px 8px #000, -4px -4px 8px #1a1a1a' }}
                            >
                                <UserCircle2 size={16} className="text-gray-600" />
                                {c.display_name}
                            </motion.button>
                        ))}
                        {available.length === 0 && (
                            <p className="text-gray-700 text-xs text-center py-6">Sin cajeros disponibles</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
