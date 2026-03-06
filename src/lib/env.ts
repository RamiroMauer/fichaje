// src/lib/env.ts

export type EnvValidationResult = {
    isValid: true;
} | {
    isValid: false;
    missingKeys: string[];
};

/**
 * Valida rápidamente de forma estática que las env vars críticas 
 * para el arranque estén presentes, enfocado en el Client/Server generico.
 */
export function validatePublicEnvVars(): EnvValidationResult {
    const missingKeys: string[] = [];

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        missingKeys.push('NEXT_PUBLIC_SUPABASE_URL');
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        missingKeys.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }

    if (missingKeys.length > 0) {
        return { isValid: false, missingKeys };
    }

    return { isValid: true };
}

/**
 * Valida de forma estática que el Service Role Key del Server exista en el server en ejecución.
 * Solo puede ser llamado de forma segura en 'use server' o Server Components puros.
 */
export function validateServerEnvVars(): EnvValidationResult {
    const missingKeys: string[] = [];

    // Valida también la base pública puesto a que el servidor la requiere igual para iniciar
    const publicValidation = validatePublicEnvVars();
    if (!publicValidation.isValid) {
        missingKeys.push(...publicValidation.missingKeys);
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        missingKeys.push('SUPABASE_SERVICE_ROLE_KEY');
    }

    if (missingKeys.length > 0) {
        return { isValid: false, missingKeys };
    }

    return { isValid: true };
}
