'use client'

import { ReactNode } from 'react'

interface Column<T> {
    key: string
    header: string
    render?: (row: T) => ReactNode
}

interface AdminTableProps<T> {
    columns: Column<T>[]
    rows: T[]
    emptyMessage?: string
}

export function AdminTable<T extends Record<string, any>>({
    columns,
    rows,
    emptyMessage = 'Sin resultados.',
}: AdminTableProps<T>) {
    return (
        // neu-card garantiza que border-radius, overflow:hidden y box-shadow estén en el mismo elemento
        <div className="neu-card">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-[#1e1e1e]">
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className="px-5 py-4 text-left text-xs font-bold tracking-widest text-gray-500 uppercase"
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="px-5 py-10 text-center text-gray-600 text-sm">
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        rows.map((row, i) => (
                            <tr
                                key={i}
                                className="border-b border-[#181818] hover:bg-[#161616] transition-colors duration-150"
                            >
                                {columns.map((col) => (
                                    <td key={col.key} className="px-5 py-4 text-gray-300">
                                        {col.render ? col.render(row) : row[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )
}
