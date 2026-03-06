'use client'

import { useEffect, useState } from 'react'
import { adminFetchLogs, adminFetchCashiers, adminFetchStationsWithAssignments, type LogFilters } from '@/app/actions/admin'
import { AdminTable } from '@/components/admin/AdminTable'
import { NeumorphicButton } from '@/components/NeumorphicButton'
import { ChevronLeft, ChevronRight, LogIn, LogOut, Minus } from 'lucide-react'
import { type EventType, EVENT_TYPE_LABELS } from '@/types/punch'

const PAGE_SIZE = 30

const RANGE_OPTIONS: { label: string; value: LogFilters['range'] }[] = [
    { label: 'Hoy', value: 'today' },
    { label: 'Últimos 7 días', value: '7d' },
    { label: 'Últimos 30 días', value: '30d' },
]

const TYPE_OPTIONS: { label: string; value: string }[] = [
    { label: 'Todos', value: '' },
    { label: 'Entrada', value: 'ENTRY' },
    { label: 'Salida', value: 'EXIT' },
    { label: 'Legado', value: 'PUNCH' },
]

function EventTypeBadge({ value }: { value: string }) {
    if (value === 'ENTRY') {
        return (
            <span className="inline-flex items-center gap-1.5 text-[#007BFF] text-xs font-bold tracking-wider">
                <LogIn size={12} /> ENTRADA
            </span>
        )
    }
    if (value === 'EXIT') {
        return (
            <span className="inline-flex items-center gap-1.5 text-gray-400 text-xs font-bold tracking-wider">
                <LogOut size={12} /> SALIDA
            </span>
        )
    }
    // Legacy PUNCH
    return (
        <span className="inline-flex items-center gap-1.5 text-gray-600 text-xs font-mono">
            <Minus size={11} /> PUNCH (legado)
        </span>
    )
}

export default function LogsPage() {
    const [rows, setRows] = useState<any[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [range, setRange] = useState<LogFilters['range']>('7d')
    const [stationId, setStationId] = useState('')
    const [cashierId, setCashierId] = useState('')
    const [eventType, setEventType] = useState('')
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
        if (res.ok) {
            // Filtrar por eventType en cliente si está seleccionado
            // (evita modificar la server action por ahora)
            const allRows = res.data!.rows
            const filtered = eventType
                ? allRows.filter((r: any) => (r.event_type || r.action) === eventType)
                : allRows
            setRows(filtered)
            setTotal(eventType ? filtered.length : res.data!.total)
        }
        setLoading(false)
    }

    useEffect(() => { setPage(1); load(1) }, [range, stationId, cashierId, eventType])

    const totalPages = Math.ceil(total / PAGE_SIZE)

    const columns = [
        {
            key: 'created_at', header: 'Fecha',
            render: (r: any) => new Date(r.created_at).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })
        },
        { key: 'station', header: 'Estación', render: (r: any) => r.stations?.label ?? r.station_id },
        { key: 'cashier', header: 'Cajero', render: (r: any) => r.cashiers?.display_name ?? r.cashier_id },
        {
            key: 'event_type', header: 'Tipo',
            render: (r: any) => <EventTypeBadge value={r.event_type || r.action || 'PUNCH'} />
        },
    ]

    return (
        <div>
            <div className="mb-8">
                <h2 className="text-3xl font-black tracking-widest text-white mb-1">LOGS</h2>
                <p className="text-xs text-gray-500 tracking-widest">HISTORIAL DE FICHAJES</p>
            </div>

            <div className="flex gap-3 mb-6 flex-wrap items-center">
                {/* Rango */}
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

                {/* Tipo de fichaje */}
                <div className="flex gap-2">
                    {TYPE_OPTIONS.map((opt) => (
                        <NeumorphicButton
                            key={opt.value}
                            onClick={() => setEventType(opt.value)}
                            className={`px-3 py-2 text-xs tracking-wider ${eventType === opt.value ? 'text-[#007BFF]' : 'text-gray-500'}`}
                        >
                            {opt.label}
                        </NeumorphicButton>
                    ))}
                </div>

                {/* Estación */}
                <select
                    value={stationId}
                    onChange={(e) => setStationId(e.target.value)}
                    className="neu-input text-gray-400 text-xs px-4 py-2 outline-none"
                >
                    <option value="">Todas las estaciones</option>
                    {stations.map((s: any) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>

                {/* Cajero */}
                <select
                    value={cashierId}
                    onChange={(e) => setCashierId(e.target.value)}
                    className="neu-input text-gray-400 text-xs px-4 py-2 outline-none"
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
