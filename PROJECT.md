# CasinoClock MVP — Resumen del Proyecto

## ¿Qué es?

Sistema de fichaje digital para estaciones de caja (casino). Cada caja tiene un QR único que el supervisor escanea para que el cajero realice su fichaje con PIN personal.

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | Tailwind CSS v4 + Framer Motion |
| Base de datos | Supabase (PostgreSQL) |
| Hashing de PIN | bcrypt |
| Deploy | Vercel |

---

## Diseño (Stealth Dark Neumorfism)

- Fondo `#121212`
- Acento interactivo `#007BFF` con glow
- Error en `#FF3B30`
- Radios ≥ 24px, sombras neumórficas convexas/cóncavas
- Animaciones con Framer Motion (shake, spring, scale)

---

## Estructura del Proyecto

```
src/
├── app/
│   ├── s/[station]/page.tsx   # Página de cada estación (Server Component)
│   ├── actions/punch.ts        # Server Action: validar PIN + loguear fichaje
│   └── page.tsx               # Home
├── components/
│   ├── StationFlow.tsx         # Máquina de estados principal (UI)
│   ├── PinPad.tsx              # Teclado numérico 4 dígitos
│   ├── ClockInView.tsx         # Vista de confirmación pre-fichaje
│   └── NeumorphicButton.tsx    # Botón base reutilizable
└── lib/
    ├── supabase/
    │   ├── server.ts           # Cliente Supabase (anon + service role)
    │   └── client.ts           # Cliente Supabase para el browser
    └── env.ts                  # Validación "fail fast" de env vars

supabase/
├── schema.sql                  # Definición de tablas y RLS
└── seed.sql                    # Estaciones + cajeros de prueba (PIN 1234)

scripts/
└── generate-qrs.mjs            # Genera los QR PNGs para cada caja

public/qrs/                     # QRs generados apuntando a /s/1..6
```

---

## Base de Datos (Supabase)

### Tablas

| Tabla | Descripción |
|---|---|
| `stations` | Las 6 cajas (id: "1" a "6") |
| `cashiers` | Cajeros con nombre y UUID |
| `station_assignments` | Qué cajeros pertenecen a cada caja |
| `cashier_pins` | Hash bcrypt del PIN de cada cajero |
| `pin_attempts` | Rate limit: intentos y bloqueo temporal |
| `punch_logs` | Log de cada fichaje realizado |

### Seguridad
- RLS habilitado en todas las tablas
- `SUPABASE_SERVICE_ROLE_KEY` **solo en el servidor** (Server Actions)
- La `ANON_KEY` pública puede leer estaciones/cajeros vía RLS

---

## Flujo Principal

```
[Escaneo QR] → /s/1
    ↓
[Selección de cajero]
    ↓
[PIN 4 dígitos]
    ↓
[Server Action: punchCashier()]
    ├── Rate limit check (pin_attempts)
    ├── bcrypt.compare(pin, pin_hash)
    ├── INSERT en punch_logs
    └── Reset de intentos fallidos
    ↓
[Éxito] → animación ✓ + reset 3s
[Error]  → shake + texto rojo #FF3B30
[Lock]   → pantalla BLOQUEADO + countdown 60s
```

---

## Variables de Entorno

```env
NEXT_PUBLIC_SUPABASE_URL=https://kgiugfhxguxrtpkokrri.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...    ← Solo server, NUNCA al cliente
```

Ver `ENV_SETUP.md` para instrucciones completas de configuración local y Vercel.

---

## URLs de Producción

| Acción | URL |
|---|---|
| Caja 1 | https://ficha-indol.vercel.app/s/1 |
| Caja 2 | https://ficha-indol.vercel.app/s/2 |
| ... | ... |
| Caja 6 | https://ficha-indol.vercel.app/s/6 |

---

## Pendiente / Próximos pasos sugeridos

- [ ] Panel de administración (crear/editar cajeros y asignaciones)
- [ ] Diferenciación ENTRADA / SALIDA (actualmente es `PUNCH` genérico)
- [ ] Dashboard de reportes con historial de `punch_logs`
- [ ] Configurar env vars en Vercel y hacer redeploy con Supabase activo
