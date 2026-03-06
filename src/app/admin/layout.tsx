import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { ReactNode } from 'react'

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen bg-[#121212]">
            <AdminSidebar />
            <main className="flex-1 p-8 overflow-auto">{children}</main>
        </div>
    )
}
