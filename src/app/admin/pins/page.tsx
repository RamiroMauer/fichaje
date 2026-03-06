'use client'

import { useEffect, useState } from 'react'
import { adminFetchCashiers, adminGeneratePin } from '@/app/actions/admin'
import { AdminTable } from '@/components/admin/AdminTable'
import { AdminModal } from '@/components/admin/AdminModal'
import { NeumorphicButton } from '@/components/NeumorphicButton'
import { Copy, RefreshCw, CheckCheck } from 'lucide-react'
import { motion } from 'framer-motion'

export default function PinsPage() {
    const [cashiers, setCashiers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState<string | null>(null)
    const [pinModal, setPinModal] = useState<{ cashierName: string; pin: string } | null>(null)
    const [copied, setCopied] = useState(false)

    const load = async () => {
        setLoading(true)
        const res = await adminFetchCashiers()
        if (res.ok) setCashiers(res.data!.filter((c: any) => c.is_active))
        setLoading(false)
    }

    useEffect(() => { load() }, [])

    const handleGenerate = async (c: any) => {
        setGenerating(c.id)
        const res = await adminGeneratePin(c.id)
        setGenerating(null)
        if (res.ok && res.data) {
            setPinModal({ cashierName: c.display_name, pin: res.data.pin })
            setCopied(false)
        }
    }

    const handleCopy = () => {
        if (pinModal) {
            navigator.clipboard.writeText(pinModal.pin)
            setCopied(true)
        }
    }

    const columns = [
        { key: 'display_name', header: 'Cajero' },
        {
            key: 'actions', header: 'Acciones',
            render: (row: any) => (
                <NeumorphicButton
                    onClick={() => handleGenerate(row)}
                    disabled={generating === row.id}
                    className="px-4 py-2 text-xs gap-2"
                >
                    <RefreshCw size={12} className={generating === row.id ? 'animate-spin' : ''} />
                    {generating === row.id ? 'GENERANDO...' : 'Generar PIN'}
                </NeumorphicButton>
            )
        }
    ]

    return (
        <div>
            <div className="mb-10">
                <h2 className="text-3xl font-black tracking-widest text-white mb-1">PINs</h2>
                <p className="text-xs text-gray-500 tracking-widest">GENERAR Y RESETEAR ACCESOS</p>
            </div>

            {loading ? (
                <p className="text-gray-600 text-sm">Cargando...</p>
            ) : (
                <AdminTable columns={columns} rows={cashiers} emptyMessage="No hay cajeros activos." />
            )}

            <AdminModal
                isOpen={!!pinModal}
                onClose={() => setPinModal(null)}
                title="PIN Generado"
            >
                {pinModal && (
                    <motion.div className="flex flex-col items-center gap-6 text-center">
                        <div>
                            <p className="text-gray-500 text-xs mb-1">{pinModal.cashierName}</p>
                            <p className="text-xs text-[#FF3B30] font-bold tracking-widest mb-4">SE MUESTRA SOLO UNA VEZ</p>
                            <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                className="text-7xl font-black text-white tracking-[0.3em] px-8 py-6 rounded-3xl bg-[#121212]"
                                style={{ boxShadow: 'inset 6px 6px 12px #000, inset -6px -6px 12px #1e1e1e', textShadow: '0 0 30px rgba(0,123,255,0.5)' }}
                            >
                                {pinModal.pin}
                            </motion.div>
                        </div>

                        <NeumorphicButton onClick={handleCopy} className="px-6 py-3 gap-2 text-sm w-full">
                            {copied ? <><CheckCheck size={16} className="text-[#007BFF]" /> COPIADO</> : <><Copy size={16} /> COPIAR PIN</>}
                        </NeumorphicButton>

                        <p className="text-gray-700 text-xs">
                            Comunicá este PIN al cajero de forma segura. No quedará almacenado en el sistema.
                        </p>
                    </motion.div>
                )}
            </AdminModal>
        </div>
    )
}
