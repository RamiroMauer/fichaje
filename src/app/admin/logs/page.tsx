'use client'

import { useEffect, useState } from 'react'
import { adminFetchLogs, adminFetchCashiers, adminFetchStationsWithAssignments, type LogFilters } from '@/app/actions/admin'
import { AdminTable } from '@/components/admin/AdminTable'
import { NeumorphicButton } from '@/components/NeumorphicButton'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const PAGE_SIZE = 30

const RANGE_OPTIONS: { label: string; value: LogFilters['range'] }[] = [
    { label: 'Hoy', value: 'today' },
    { label: 'Últimos 7 días', value: '7d' },
    { label: 'Últimos 30 días', value: '30d' },
]

export default function LogsPage() {
    const [rows, setRows] = useState<any[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [range, setRange] = useState<LogFilters['range']>('7d')
    const [stationId, setStationId] = useState('')
    const [cashierId, setCashierId] = useState('')
    const [stations, setStations] = useState<any[]>([])
    const [cashiers, setCashiers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([adminFetchStationsWithAssignments(), adminFetchCashiers()]).then(([sRes, cRes]) => {
            if (sRes.ok) setStations(sRes.data!)
            if (cRes.ok) setCashiers(cRes.data!)
        })
    }, [])

    const load = async (p = page) => {
        setLoading(true)
        const res = await adminFetchLogs({
            stationId: stationId || undefined,
            cashierId: cashierId || undefined,
            range,
            page: p,
            pageSize: PAGE_SIZE,
        })
        if (res.ok) { setRows(res.data!.rows); setTotal(res.data!.total) }
        setLoading(false)
    }

    useEffect(() => { setPage(1); load(1) }, [range, stationId, cashierId])

    const totalPages = Math.ceil(total / PAGE_SIZE)

    const columns = [
        {
            key: 'created_at', header: 'Fecha',
            render: (r: any) => new Date(r.created_at).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })
        },
        { key: 'station', header: 'Estación', render: (r: any) => r.stations?.label ?? r.station_id },
        { key: 'cashier', header: 'Cajero', render: (r: any) => r.cashiers?.display_name ?? r.cashier_id },
        { key: 'action', header: 'Acción', render: (r: any) => <span className="text-[#007BFF] font-bold text-xs tracking-widest">{r.action}</span> },
    ]

    return (
        <div>
            <div className="mb-8">
                <h2 className="text-3xl font-black tracking-widest text-white mb-1">LOGS</h2>
                <p className="text-xs text-gray-500 tracking-widest">HISTORIAL DE FICHAJES</p>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6 flex-wrap items-center">
                {/* Range */}
                <div className="flex gap-2">
                    {RANGE_OPTIONS.map((opt) => (
                        <NeumorphicButton
                            key={opt.value}
                            onClick={() => setRange(opt.value)}
                            className={`px-4 py-2 text-xs tracking-wider ${range === opt.value ? 'text-[#007BFF]' : 'text-gray-500'}`}
                        >
                            {opt.label}
                        </NeumorphicButton>
                    ))}
                </div>

                {/* Station filter */}
                <select
                    value={stationId}
                    onChange={(e) => setStationId(e.target.value)}
                    className="bg-[#121212] text-gray-400 text-xs px-4 py-2 rounded-2xl outline-none"
                    style={{ boxShadow: 'inset 3px 3px 6px #000, inset -3px -3px 6px #1e1e1e' }}
                >
                    <option value="">Todas las estaciones</option>
                    {stations.map((s: any) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>

                {/* Cashier filter */}
                <select
                    value={cashierId}
                    onChange={(e) => setCashierId(e.target.value)}
                    className="bg-[#121212] text-gray-400 text-xs px-4 py-2 rounded-2xl outline-none"
                    style={{ boxShadow: 'inset 3px 3px 6px #000, inset -3px -3px 6px #1e1e1e' }}
                >
                    <option value="">Todos los cajeros</option>
                    {cashiers.map((c: any) => <option key={c.id} value={c.id}>{c.display_name}</option>)}
                </select>

                <span className="text-gray-600 text-xs ml-auto">{total} registros</span>
            </div>

            {loading ? (
                <p className="text-gray-600 text-sm">Cargando...</p>
            ) : (
                <>
                    <AdminTable columns={columns} rows={rows} emptyMessage="Sin registros para los filtros seleccionados." />

                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 mt-6">
                            <NeumorphicButton onClick={() => { const p = page - 1; setPage(p); load(p) }} disabled={page === 1} className="w-10 h-10">
                                <ChevronLeft size={16} />
                            </NeumorphicButton>
                            <span className="text-gray-500 text-xs tracking-widest">{page} / {totalPages}</span>
                            <NeumorphicButton onClick={() => { const p = page + 1; setPage(p); load(p) }} disabled={page === totalPages} className="w-10 h-10">
                                <ChevronRight size={16} />
                            </NeumorphicButton>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
