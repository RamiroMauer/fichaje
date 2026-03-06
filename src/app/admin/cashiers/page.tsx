'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
    adminFetchCashiers,
    adminCreateCashier,
    adminUpdateCashier,
    adminToggleCashierActive,
} from '@/app/actions/admin'
import { AdminTable } from '@/components/admin/AdminTable'
import { AdminModal } from '@/components/admin/AdminModal'
import { NeumorphicButton } from '@/components/NeumorphicButton'
import { Plus, CheckCircle2, XCircle, Pencil } from 'lucide-react'

export default function CashiersPage() {
    const [cashiers, setCashiers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editTarget, setEditTarget] = useState<any | null>(null)
    const [nameInput, setNameInput] = useState('')
    const [error, setError] = useState('')
    const [saving, setSaving] = useState(false)

    const load = async () => {
        setLoading(true)
        const res = await adminFetchCashiers()
        if (res.ok) setCashiers(res.data!)
        setLoading(false)
    }

    useEffect(() => { load() }, [])

    const openCreate = () => {
        setEditTarget(null)
        setNameInput('')
        setError('')
        setModalOpen(true)
    }

    const openEdit = (c: any) => {
        setEditTarget(c)
        setNameInput(c.display_name)
        setError('')
        setModalOpen(true)
    }

    const handleSave = async () => {
        if (!nameInput.trim()) { setError('El nombre es requerido.'); return }
        setSaving(true)
        const res = editTarget
            ? await adminUpdateCashier(editTarget.id, nameInput)
            : await adminCreateCashier(nameInput)
        setSaving(false)
        if (!res.ok) { setError(res.message); return }
        setModalOpen(false)
        load()
    }

    const handleToggle = async (c: any) => {
        await adminToggleCashierActive(c.id, !c.is_active)
        load()
    }

    const columns = [
        { key: 'display_name', header: 'Nombre' },
        {
            key: 'is_active', header: 'Estado',
            render: (row: any) => row.is_active
                ? <span className="flex items-center gap-1 text-[#007BFF] text-xs font-bold"><CheckCircle2 size={14} /> ACTIVO</span>
                : <span className="flex items-center gap-1 text-gray-600 text-xs font-bold"><XCircle size={14} /> INACTIVO</span>
        },
        {
            key: 'actions', header: 'Acciones',
            render: (row: any) => (
                <div className="flex gap-2">
                    <NeumorphicButton onClick={() => openEdit(row)} className="px-3 py-1.5 text-xs gap-1.5">
                        <Pencil size={12} /> Editar
                    </NeumorphicButton>
                    <NeumorphicButton
                        onClick={() => handleToggle(row)}
                        className={`px-3 py-1.5 text-xs ${row.is_active ? 'text-[#FF3B30]' : 'text-[#007BFF]'}`}
                    >
                        {row.is_active ? 'Desactivar' : 'Activar'}
                    </NeumorphicButton>
                </div>
            )
        },
    ]

    return (
        <div>
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h2 className="text-3xl font-black tracking-widest text-white mb-1">CAJEROS</h2>
                    <p className="text-xs text-gray-500 tracking-widest">GESTIÓN DE PERSONAL</p>
                </div>
                <NeumorphicButton onClick={openCreate} className="px-5 py-3 gap-2 text-sm">
                    <Plus size={16} /> Nuevo Cajero
                </NeumorphicButton>
            </div>

            {loading ? (
                <p className="text-gray-600 text-sm">Cargando...</p>
            ) : (
                <AdminTable columns={columns} rows={cashiers} emptyMessage="No hay cajeros registrados." />
            )}

            <AdminModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Editar Cajero' : 'Nuevo Cajero'}>
                <div className="flex flex-col gap-4">
                    <div
                        className="px-5 py-4 rounded-2xl"
                        style={{ boxShadow: 'inset 4px 4px 8px #000000, inset -4px -4px 8px #1e1e1e' }}
                    >
                        <input
                            type="text"
                            placeholder="Nombre del cajero"
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            className="w-full bg-transparent text-white placeholder-gray-600 outline-none text-sm"
                            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                            autoFocus
                        />
                    </div>
                    {error && <p className="text-[#FF3B30] text-xs text-center">{error}</p>}
                    <NeumorphicButton onClick={handleSave} disabled={saving} className="w-full py-4 text-sm tracking-widest">
                        {saving ? 'GUARDANDO...' : 'GUARDAR'}
                    </NeumorphicButton>
                </div>
            </AdminModal>
        </div>
    )
}
