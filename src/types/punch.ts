/**
 * Tipos centralizados para el sistema de fichaje.
 * Importar desde aquí; evitar literals sueltos en el codebase.
 */

export type EventType = 'ENTRY' | 'EXIT' | 'PUNCH'

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
    ENTRY: 'Entrada',
    EXIT: 'Salida',
    PUNCH: 'PUNCH (legado)',
}

export const VALID_CURRENT_EVENT_TYPES: Array<EventType> = ['ENTRY', 'EXIT']

export function isValidEventType(v: string): v is EventType {
    return ['ENTRY', 'EXIT', 'PUNCH'].includes(v)
}
