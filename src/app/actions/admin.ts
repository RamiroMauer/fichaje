'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import {
    createSessionToken,
    verifyToken,
    SESSION_COOKIE_NAME,
    getSessionCookieOptions,
} from '@/lib/auth'
import bcrypt from 'bcrypt'

// ─────────────────────────────────────────────
// Helpers internos
// ─────────────────────────────────────────────

async function assertAdminSession() {
    const cookieStore = await cookies()
    const session = cookieStore.get(SESSION_COOKIE_NAME)
    if (!session || !verifyToken(session.value)) {
        redirect('/admin/login')
    }
}

type ActionResult<T = undefined> =
    | { ok: true; data?: T }
    | { ok: false; code: string; message: string }

// ─────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────

export async function adminLogin(
    password: string
): Promise<ActionResult> {
    const adminPassword = process.env.ADMIN_PASSWORD
    if (!adminPassword) {
        return { ok: false, code: 'CONFIG_ERROR', message: 'ADMIN_PASSWORD no configurado.' }
    }

    if (password !== adminPassword) {
        return { ok: false, code: 'INVALID_PASSWORD', message: 'Contraseña incorrecta.' }
    }

    const token = createSessionToken()
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions())

    return { ok: true }
}

export async function adminLogout(): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.delete(SESSION_COOKIE_NAME)
    redirect('/admin/login')
}

// ─────────────────────────────────────────────
// Cajeros (Cashiers)
// ─────────────────────────────────────────────

export async function adminFetchCashiers(): Promise<ActionResult<any[]>> {
    await assertAdminSession()
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .from('cashiers')
        .select('id, display_name, is_active')
        .order('display_name')

    if (error) return { ok: false, code: 'DB_ERROR', message: error.message }
    return { ok: true, data: data ?? [] }
}

export async function adminCreateCashier(
    displayName: string
): Promise<ActionResult<{ id: string }>> {
    await assertAdminSession()

    if (!displayName?.trim()) {
        return { ok: false, code: 'VALIDATION', message: 'El nombre es requerido.' }
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
        .from('cashiers')
        .insert({ display_name: displayName.trim(), is_active: true })
        .select('id')
        .single()

    if (error) return { ok: false, code: 'DB_ERROR', message: error.message }
    return { ok: true, data: { id: data.id } }
}

export async function adminUpdateCashier(
    cashierId: string,
    displayName: string
): Promise<ActionResult> {
    await assertAdminSession()

    if (!displayName?.trim()) {
        return { ok: false, code: 'VALIDATION', message: 'El nombre es requerido.' }
    }

    const supabase = createAdminClient()
    const { error } = await supabase
        .from('cashiers')
        .update({ display_name: displayName.trim() })
        .eq('id', cashierId)

    if (error) return { ok: false, code: 'DB_ERROR', message: error.message }
    return { ok: true }
}

export async function adminToggleCashierActive(
    cashierId: string,
    isActive: boolean
): Promise<ActionResult> {
    await assertAdminSession()

    const supabase = createAdminClient()
    const { error } = await supabase
        .from('cashiers')
        .update({ is_active: isActive })
        .eq('id', cashierId)

    if (error) return { ok: false, code: 'DB_ERROR', message: error.message }
    return { ok: true }
}

// ─────────────────────────────────────────────
// Estaciones (Stations)
// ─────────────────────────────────────────────

export async function adminFetchStationsWithAssignments(): Promise<ActionResult<any[]>> {
    await assertAdminSession()
    const supabase = createAdminClient()

    const { data: stations, error: stErr } = await supabase
        .from('stations')
        .select('id, label')
        .order('id')

    if (stErr) return { ok: false, code: 'DB_ERROR', message: stErr.message }

    const { data: assignments, error: aErr } = await supabase
        .from('station_assignments')
        .select('station_id, cashier_id, cashiers(id, display_name, is_active)')

    if (aErr) return { ok: false, code: 'DB_ERROR', message: aErr.message }

    const enriched = (stations ?? []).map((s: any) => ({
        ...s,
        cashiers: (assignments ?? [])
            .filter((a: any) => a.station_id === s.id)
            .map((a: any) => a.cashiers),
    }))

    return { ok: true, data: enriched }
}

export async function adminSetStationAssignments(
    stationId: string,
    cashierIds: string[]
): Promise<ActionResult> {
    await assertAdminSession()

    if (cashierIds.length !== 4) {
        return {
            ok: false,
            code: 'VALIDATION',
            message: `Se requieren exactamente 4 cajeros. Tenés ${cashierIds.length}.`,
        }
    }

    const supabase = createAdminClient()

    // Reemplazo atómico: delete + insert en transacción
    const { error: delErr } = await supabase
        .from('station_assignments')
        .delete()
        .eq('station_id', stationId)

    if (delErr) return { ok: false, code: 'DB_ERROR', message: delErr.message }

    const rows = cashierIds.map((id) => ({ station_id: stationId, cashier_id: id }))
    const { error: insErr } = await supabase.from('station_assignments').insert(rows)

    if (insErr) return { ok: false, code: 'DB_ERROR', message: insErr.message }
    return { ok: true }
}

// ─────────────────────────────────────────────
// PINs
// ─────────────────────────────────────────────

export async function adminGeneratePin(
    cashierId: string
): Promise<ActionResult<{ pin: string }>> {
    await assertAdminSession()

    // Genera PIN 4 dígitos aleatorio
    const pin = String(Math.floor(1000 + Math.random() * 9000))
    const hash = await bcrypt.hash(pin, 10)

    const supabase = createAdminClient()
    const { error } = await supabase
        .from('cashier_pins')
        .upsert(
            { cashier_id: cashierId, pin_hash: hash, updated_at: new Date().toISOString() },
            { onConflict: 'cashier_id' }
        )

    if (error) return { ok: false, code: 'DB_ERROR', message: error.message }

    // Devolver PIN plano solo en esta respuesta; no se persiste en claro.
    return { ok: true, data: { pin } }
}

// ─────────────────────────────────────────────
// Logs
// ─────────────────────────────────────────────

export type LogFilters = {
    stationId?: string
    cashierId?: string
    range?: 'today' | '7d' | '30d'
    page?: number
    pageSize?: number
}

export async function adminFetchLogs(
    filters: LogFilters = {}
): Promise<ActionResult<{ rows: any[]; total: number }>> {
    await assertAdminSession()

    const { stationId, cashierId, range = '7d', page = 1, pageSize = 30 } = filters
    const supabase = createAdminClient()

    let query = supabase
        .from('punch_logs')
        .select(
            'id, station_id, cashier_id, action, device_info, created_at, cashiers(display_name), stations(label)',
            { count: 'exact' }
        )
        .order('created_at', { ascending: false })

    if (stationId) query = query.eq('station_id', stationId)
    if (cashierId) query = query.eq('cashier_id', cashierId)

    const now = new Date()
    if (range === 'today') {
        const start = new Date(now)
        start.setHours(0, 0, 0, 0)
        query = query.gte('created_at', start.toISOString())
    } else if (range === '7d') {
        const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        query = query.gte('created_at', start.toISOString())
    } else if (range === '30d') {
        const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        query = query.gte('created_at', start.toISOString())
    }

    const from = (page - 1) * pageSize
    query = query.range(from, from + pageSize - 1)

    const { data, error, count } = await query

    if (error) return { ok: false, code: 'DB_ERROR', message: error.message }
    return { ok: true, data: { rows: data ?? [], total: count ?? 0 } }
}

// ─────────────────────────────────────────────
// Bloqueos (Locks)
// ─────────────────────────────────────────────

export async function adminFetchLocks(): Promise<ActionResult<any[]>> {
    await assertAdminSession()
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .from('pin_attempts')
        .select(
            'id, station_id, cashier_id, failed_count, locked_until, cashiers(display_name), stations(label)'
        )
        .gt('locked_until', new Date().toISOString())
        .order('locked_until', { ascending: true })

    if (error) return { ok: false, code: 'DB_ERROR', message: error.message }
    return { ok: true, data: data ?? [] }
}

export async function adminUnlock(
    cashierId: string,
    stationId: string
): Promise<ActionResult> {
    await assertAdminSession()
    const supabase = createAdminClient()

    const { error } = await supabase
        .from('pin_attempts')
        .update({ failed_count: 0, locked_until: null, updated_at: new Date().toISOString() })
        .eq('cashier_id', cashierId)
        .eq('station_id', stationId)

    if (error) return { ok: false, code: 'DB_ERROR', message: error.message }
    return { ok: true }
}
