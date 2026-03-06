import { adminFetchCashiers, adminFetchLogs, adminFetchLocks, adminFetchStationsWithAssignments } from '@/app/actions/admin'
import { AdminCard } from '@/components/admin/AdminCard'
import { Users, Layers, KeyRound, ScrollText, ShieldAlert } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
    const [cashiersRes, stationsRes, logsRes, locksRes] = await Promise.all([
        adminFetchCashiers(),
        adminFetchStationsWithAssignments(),
        adminFetchLogs({ range: 'today' }),
        adminFetchLocks(),
    ])

    const totalCashiers = cashiersRes.ok ? cashiersRes.data!.filter((c: any) => c.is_active).length : 0
    const totalStations = stationsRes.ok ? stationsRes.data!.length : 0
    const todayLogs = logsRes.ok ? logsRes.data!.total : 0
    const activeLocks = locksRes.ok ? locksRes.data!.length : 0

    const cards = [
        { title: 'Cajeros Activos', value: totalCashiers, icon: <Users size={20} />, href: '/admin/cashiers' },
        { title: 'Estaciones', value: totalStations, icon: <Layers size={20} />, href: '/admin/stations' },
        { title: 'Fichajes Hoy', value: todayLogs, icon: <ScrollText size={20} />, href: '/admin/logs' },
        { title: 'Bloqueos Activos', value: activeLocks, icon: <ShieldAlert size={20} />, href: '/admin/locks', alert: activeLocks > 0 },
        { title: 'Gestionar PINs', value: '→', icon: <KeyRound size={20} />, href: '/admin/pins' },
    ]

    return (
        <div>
            <div className="mb-10">
                <h2 className="text-3xl font-black tracking-widest text-white mb-1">DASHBOARD</h2>
                <p className="text-xs text-gray-500 tracking-widest">RESUMEN OPERATIVO</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map(({ title, value, icon, href, alert }) => (
                    <Link key={href} href={href}>
                        <AdminCard
                            title={title}
                            value={value}
                            icon={icon}
                            className={`hover:scale-[1.01] transition-transform duration-200 ${alert ? 'border border-[#FF3B30]/20' : ''}`}
                        >
                            {alert && (
                                <p className="text-[#FF3B30] text-xs font-bold tracking-widest">ATENCIÓN REQUERIDA</p>
                            )}
                        </AdminCard>
                    </Link>
                ))}
            </div>
        </div>
    )
}
