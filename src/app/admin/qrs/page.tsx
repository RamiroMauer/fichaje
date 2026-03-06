'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Printer, QrCode, ExternalLink } from 'lucide-react'
import { NeumorphicButton } from '@/components/NeumorphicButton'

// Las URLs base se detectan del entorno en el cliente
const BASE_URL = typeof window !== 'undefined'
    ? window.location.origin
    : 'https://ficha-indol.vercel.app'

const STATIONS = [
    { id: '1', label: 'CAJA 1' },
    { id: '2', label: 'CAJA 2' },
    { id: '3', label: 'CAJA 3' },
    { id: '4', label: 'CAJA 4' },
    { id: '5', label: 'CAJA 5' },
    { id: '6', label: 'CAJA 6' },
]

function getQrUrl(stationId: string, size = 240) {
    const target = `${BASE_URL}/s/${stationId}`
    // API pública, sin key, dark theme
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(target)}&bgcolor=121212&color=ffffff&qzone=2&format=png`
}

function StationQrCard({ id, label }: { id: string; label: string }) {
    const [refreshKey, setRefreshKey] = useState(0)
    const stationUrl = `${BASE_URL}/s/${id}`
    const qrSrc = getQrUrl(id) + (refreshKey > 0 ? `&r=${refreshKey}` : '')

    const handleDownload = async () => {
        // Descarga el QR como PNG con el nombre de la caja
        const res = await fetch(getQrUrl(id, 600))
        const blob = await res.blob()
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = `qr-caja-${id}.png`
        a.click()
        URL.revokeObjectURL(a.href)
    }

    const handlePrint = () => {
        const win = window.open('', '_blank')
        if (!win) return
        win.document.write(`
      <html>
        <head>
          <title>QR ${label}</title>
          <style>
            body { margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: monospace; background: white; }
            img { width: 300px; height: 300px; }
            h2 { margin-top: 16px; font-size: 28px; letter-spacing: 4px; }
            p  { color: #666; font-size: 14px; margin-top: 6px; }
          </style>
        </head>
        <body>
          <img src="${getQrUrl(id, 600)}" />
          <h2>${label}</h2>
          <p>${stationUrl}</p>
          <script>window.onload = () => { window.print(); window.close(); }<\/script>
        </body>
      </html>
    `)
        win.document.close()
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="neu-card p-6 flex flex-col items-center gap-5"
        >
            {/* Header */}
            <div className="text-center">
                <p className="text-xs text-gray-500 tracking-widest mb-0.5">ESTACIÓN</p>
                <h3 className="text-xl font-black tracking-widest text-white">{label}</h3>
            </div>

            {/* QR Code */}
            <div
                className="rounded-2xl overflow-hidden"
                style={{ boxShadow: 'var(--shadow-neu-pressed)', isolation: 'isolate' }}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    key={qrSrc}
                    src={qrSrc}
                    alt={`QR ${label}`}
                    width={200}
                    height={200}
                    className="block"
                    style={{ imageRendering: 'pixelated' }}
                />
            </div>

            {/* URL de la estación */}
            <a
                href={stationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[#007BFF] text-xs tracking-wide hover:underline"
            >
                <ExternalLink size={11} />
                /s/{id}
            </a>

            {/* Acciones */}
            <div className="flex gap-2 w-full">
                <NeumorphicButton onClick={handleDownload} className="flex-1 py-2.5 gap-1.5 text-xs">
                    <Download size={13} /> Descargar
                </NeumorphicButton>
                <NeumorphicButton onClick={handlePrint} className="flex-1 py-2.5 gap-1.5 text-xs">
                    <Printer size={13} /> Imprimir
                </NeumorphicButton>
            </div>
        </motion.div>
    )
}

export default function QrsPage() {
    const handlePrintAll = () => {
        const imgs = STATIONS.map(s =>
            `<div class="card">
         <img src="${getQrUrl(s.id, 500)}" />
         <h2>${s.label}</h2>
         <p>${BASE_URL}/s/${s.id}</p>
       </div>`
        ).join('')

        const win = window.open('', '_blank')
        if (!win) return
        win.document.write(`
      <html>
        <head>
          <title>QR Codes — CasinoClock</title>
          <style>
            body { margin: 0; font-family: monospace; background: white; }
            .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; padding: 32px; }
            .card { display: flex; flex-direction: column; align-items: center; break-inside: avoid; }
            img { width: 200px; height: 200px; }
            h2 { margin-top: 12px; font-size: 22px; letter-spacing: 3px; }
            p  { color: #666; font-size: 11px; margin-top: 4px; }
            @media print { body { -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div class="grid">${imgs}</div>
          <script>window.onload = () => { window.print(); window.close(); }<\/script>
        </body>
      </html>
    `)
        win.document.close()
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h2 className="text-3xl font-black tracking-widest text-white mb-1">QR CODES</h2>
                    <p className="text-xs text-gray-500 tracking-widest">ACCESOS POR ESTACIÓN</p>
                </div>
                <NeumorphicButton onClick={handlePrintAll} className="px-5 py-3 gap-2 text-sm">
                    <Printer size={15} /> Imprimir todos
                </NeumorphicButton>
            </div>

            {/* Grid de QRs */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {STATIONS.map((s, i) => (
                    <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                        <StationQrCard id={s.id} label={s.label} />
                    </motion.div>
                ))}
            </div>

            {/* Info */}
            <div className="neu-pressed p-5 mt-8">
                <div className="flex items-start gap-3">
                    <QrCode size={16} className="text-gray-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Cada QR lleva al operario directamente a la pantalla de fichaje de esa caja.
                            Los códigos se generan dinámicamente y siempre apuntan a la URL correcta del entorno activo.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
