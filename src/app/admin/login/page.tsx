'use client'

import { useActionState } from 'react'
import { motion } from 'framer-motion'
import { NeumorphicButton } from '@/components/NeumorphicButton'
import { adminLogin } from '@/app/actions/admin'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

export default function AdminLoginPage() {
    const [state, action, pending] = useActionState(adminLogin, undefined)
    const [showPass, setShowPass] = useState(false)

    return (
        <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-sm"
            >
                {/* Header */}
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.1 }}
                        className="w-20 h-20 rounded-full bg-[#121212] flex items-center justify-center mx-auto mb-6"
                        style={{ boxShadow: '8px 8px 16px #000000, -8px -8px 16px #1e1e1e' }}
                    >
                        <Lock size={32} className="text-[#007BFF]" style={{ filter: 'drop-shadow(0 0 8px rgba(0,123,255,0.6))' }} />
                    </motion.div>
                    <h1 className="text-2xl font-black tracking-widest text-white mb-1">
                        CASINO<span className="text-[#007BFF]">CLOCK</span>
                    </h1>
                    <p className="text-xs text-gray-500 tracking-widest">PANEL DE ENCARGADO</p>
                </div>

                {/* Form — usa un <form> nativo con action para que Next.js maneje el Server Action y el redirect() seteando la cookie correctamente */}
                <form action={action} className="flex flex-col gap-4">
                    <div
                        className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-[#121212]"
                        style={{ boxShadow: 'inset 4px 4px 8px #000000, inset -4px -4px 8px #1e1e1e' }}
                    >
                        <input
                            type={showPass ? 'text' : 'password'}
                            name="password"
                            placeholder="Contraseña de encargado"
                            className="flex-1 bg-transparent text-white placeholder-gray-600 outline-none text-sm tracking-wider"
                            autoComplete="current-password"
                            autoFocus
                        />
                        <button
                            type="button"
                            onClick={() => setShowPass(!showPass)}
                            className="text-gray-600 hover:text-gray-400 transition-colors"
                        >
                            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>

                    {/* Error del server */}
                    {state && !state.ok && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-[#FF3B30] text-xs text-center tracking-wide"
                        >
                            {state.message}
                        </motion.p>
                    )}

                    <NeumorphicButton
                        onClick={() => { }}
                        className="w-full py-4 text-sm tracking-widest"
                        disabled={pending}
                    >
                        {pending ? 'VERIFICANDO...' : 'INGRESAR'}
                    </NeumorphicButton>
                </form>
            </motion.div>
        </div>
    )
}
