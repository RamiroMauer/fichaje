'use server'

import { createAdminClient } from '@/lib/supabase/server'
import bcrypt from 'bcrypt'

const MAX_FAILED_ATTEMPTS = 5
const LOCK_DURATION_SECONDS = 60

export type PunchResponse =
    | { ok: true }
    | { error: 'INVALID_PIN' }
    | { error: 'LOCKED'; unlockSeconds: number }
    | { error: 'INVALID_STATION_OR_CASHIER' }
    | { error: 'SERVER_ERROR' }

export async function punchCashier(params: {
    stationId: string
    cashierId: string
    pin: string
    deviceInfo?: string
}): Promise<PunchResponse> {
    const { stationId, cashierId, pin, deviceInfo } = params

    // Usamos admin client (Service Role) ya que necesitamos bypassear RLS
    // para leer la tabla de hashes y attempts, además de forzar las escrituras
    // garantizadas desde el Server.
    const supabase = createAdminClient()

    try {
        // 1. Verificar si esta dupla (stationId, cashierId) existe y es válida
        const { data: assignmentData, error: assignmentError } = await supabase
            .from('station_assignments')
            .select('station_id')
            .eq('station_id', stationId)
            .eq('cashier_id', cashierId)
            .single()

        if (assignmentError || !assignmentData) {
            console.warn(`[punchCashier] Asignación no encontrada: station=${stationId} cashier=${cashierId}`)
            return { error: 'INVALID_STATION_OR_CASHIER' }
        }

        // 2. Verificar Rate Limit (Intentos fallidos previos)
        const { data: attemptData } = await supabase
            .from('pin_attempts')
            .select('failed_count, locked_until')
            .eq('station_id', stationId)
            .eq('cashier_id', cashierId)
            .single()

        if (attemptData) {
            const lockedUntil = attemptData.locked_until ? new Date(attemptData.locked_until) : null
            const now = new Date()

            if (lockedUntil && now < lockedUntil) {
                const remainingMs = lockedUntil.getTime() - now.getTime()
                const unlockSeconds = Math.ceil(remainingMs / 1000)
                return { error: 'LOCKED', unlockSeconds }
            }
        }

        // 3. Obtener el Hash del PIN
        const { data: pinData, error: pinError } = await supabase
            .from('cashier_pins')
            .select('pin_hash')
            .eq('cashier_id', cashierId)
            .single()

        if (pinError || !pinData) {
            console.error(`[punchCashier] PIN no configurado para cajero ${cashierId}`)
            return { error: 'SERVER_ERROR' } // No debría pasar si la DB está bien seedada
        }

        // 4. Comparar PIN contra Hash
        const isMatch = await bcrypt.compare(pin, pinData.pin_hash)

        if (!isMatch) {
            // Incrementar Fallos
            const newCount = attemptData ? attemptData.failed_count + 1 : 1
            let lockDate: Date | null = null

            if (newCount >= MAX_FAILED_ATTEMPTS) {
                lockDate = new Date(Date.now() + (LOCK_DURATION_SECONDS * 1000))
            }

            // Upsert usando la restricción UNIQUE definida en DB
            await supabase.from('pin_attempts').upsert({
                station_id: stationId,
                cashier_id: cashierId,
                failed_count: newCount,
                locked_until: lockDate ? lockDate.toISOString() : null,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'station_id, cashier_id'
            })

            if (lockDate) {
                return { error: 'LOCKED', unlockSeconds: LOCK_DURATION_SECONDS }
            }
            return { error: 'INVALID_PIN' }
        }

        // 5. PIN Corecto -> Log del Fichaje
        await supabase.from('punch_logs').insert({
            station_id: stationId,
            cashier_id: cashierId,
            action: 'PUNCH',
            device_info: deviceInfo || ''
        })

        // 6. Resetear Rate Limit
        if (attemptData && attemptData.failed_count > 0) {
            await supabase.from('pin_attempts').update({
                failed_count: 0,
                locked_until: null,
                updated_at: new Date().toISOString()
            }).eq('station_id', stationId).eq('cashier_id', cashierId)
        }

        return { ok: true }
    } catch (err) {
        console.error(`[punchCashier] Error no capturado:`, err)
        return { error: 'SERVER_ERROR' }
    }
}
