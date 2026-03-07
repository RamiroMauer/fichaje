# CasinoClock MVP — Resumen del Proyecto

## ¿Qué es?

Sistema de fichaje digital para estaciones de caja (casino). Cada caja tiene un QR único que el cajero escanea para registrar su fichaje (ENTRADA o SALIDA) con PIN personal. Incluye un panel de administración completo para gestionar cajeros, estaciones y monitorear la actividad.

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | Tailwind CSS v4 + Framer Motion |
| Base de datos | Supabase (PostgreSQL) |
| Hashing de PIN | bcrypt |
| Autenticación admin | HMAC-SHA256 + cookie httpOnly |
| Deploy | Vercel |

---

## Diseño (Stealth Dark Neumorfism)

- Fondo `#121212`, acento `#007BFF`, error `#FF3B30`
- Radios ≥ 24px, sombras neumórficas convexas/cóncavas sin glow
- Clases utilitarias globales en `globals.css`: `.neu-card`, `.neu-pressed`, `.neu-input` con `isolation: isolate`
- Regla core: `border-radius`, `background-color` y `box-shadow` siempre en el **mismo elemento**
- Animaciones con Framer Motion (shake, spring, scale)

---

## Estructura del Proyecto

```
src/
├── app/
│   ├── s/[station]/page.tsx     # Estación individual (Server Component)
│   ├── admin/
│   │   ├── layout.tsx           # Layout con sidebar
│   │   ├── login/page.tsx       # Login del encargado
│   │   ├── page.tsx             # Dashboard con métricas
│   │   ├── cashiers/page.tsx    # CRUD de cajeros
│   │   ├── stations/page.tsx    # Asignación 4 cajeros/caja
│   │   ├── pins/page.tsx        # Generación de PINs (1 sola vez)
│   │   ├── qrs/page.tsx         # Ver / descargar / imprimir / regenerar QRs
│   │   ├── logs/page.tsx        # Historial con filtros (estación, cajero, tipo, fecha)
│   │   └── locks/page.tsx       # Bloqueos activos por rate limit
│   └── actions/
│       ├── punch.ts             # Server Action: validar PIN + loguear fichaje
│       └── admin.ts             # Server Actions del panel admin
├── components/
│   ├── StationFlow.tsx          # Máquina de estados: SELECT_EMPLOYEE → SELECT_TYPE → AUTH_PIN → SUCCESS/LOCKED
│   ├── PinPad.tsx               # Teclado numérico 4 dígitos
│   ├── ClockInView.tsx          # Vista pre-fichaje (confirmación)
│   ├── NeumorphicButton.tsx     # Botón base reutilizable
│   └── admin/
│       ├── AdminSidebar.tsx     # Navegación lateral
│       ├── AdminCard.tsx        # Card de métricas
│       ├── AdminTable.tsx       # Tabla genérica
│       └── AdminModal.tsx       # Modal con animaciones
├── types/
│   └── punch.ts                 # EventType ('ENTRY' | 'EXIT' | 'PUNCH') + helpers
└── lib/
    ├── auth.ts                  # HMAC signing/verify + verifyTokenEdge (Edge Runtime)
    ├── supabase/
    │   ├── server.ts            # Cliente Supabase (anon + service role)
    │   └── client.ts            # Cliente browser
    └── env.ts                   # Validación fail-fast de env vars

src/middleware.ts                # Protege /admin/* vía cookie HMAC (Edge Runtime)

supabase/
├── schema.sql                   # Tablas + RLS
├── seed.sql                     # Cajas + cajeros de prueba
└── migrations/
    ├── 001_add_cashier_active.sql   # is_active en cashiers
    └── 002_add_event_type.sql       # event_type en punch_logs (ENTRY/EXIT/PUNCH)
```

---

## Base de Datos (Supabase)

### Tablas

| Tabla | Descripción |
|---|---|
| `stations` | Las 6 cajas (id: "1"–"6") |
| `cashiers` | Cajeros con nombre, UUID e `is_active` |
| `station_assignments` | 4 cajeros por caja |
| `cashier_pins` | Hash bcrypt del PIN |
| `pin_attempts` | Rate limit: intentos y bloqueo temporal |
| `punch_logs` | Historial con `action`, `event_type` y `device_info` |

### Columnas clave de `punch_logs`

| Columna | Tipo | Descripción |
|---|---|---|
| `action` | TEXT | Compatibilidad legacy (`PUNCH`, `ENTRY`, `EXIT`) |
| `event_type` | TEXT | `ENTRY`, `EXIT`, `PUNCH` — con CHECK constraint |

### Seguridad
- RLS habilitado en todas las tablas
- `SUPABASE_SERVICE_ROLE_KEY` solo en servidor (Server Actions)
- `ANON_KEY` pública puede leer estaciones/cajeros vía RLS

---

## Flujo de Fichaje (Cajero)

```
[Escaneo QR] → /s/1
    ↓
[Selección de cajero]
    ↓
[Selección ENTRADA / SALIDA]   ← nuevo
    ↓
[PIN 4 dígitos]  (con badge del tipo elegido)
    ↓
[Server Action: punchCashier({ eventType })]
    ├── Rate limit check
    ├── bcrypt.compare(pin, pin_hash)
    ├── INSERT en punch_logs (event_type = 'ENTRY' o 'EXIT')
    └── Reset intentos fallidos
    ↓
[Éxito] → "¡Entrada registrada!" / "¡Salida registrada!" + reset 3s
[Error]  → shake + texto rojo #FF3B30
[Lock]   → BLOQUEADO + countdown 60s
```

---

## Panel de Administración

Acceso: `/admin/login` — contraseña + cookie `httpOnly` HMAC firmada.

| Sección | Funcionalidad |
|---|---|
| Dashboard | Métricas: cajeros activos, estaciones, fichajes del día, bloqueos |
| Cajeros | Crear, editar, activar/desactivar |
| Estaciones | Asignar exactamente 4 cajeros por caja |
| PINs | Generar PIN 4 dígitos (muestra solo una vez, guarda hash) |
| QR Codes | Ver, descargar (PNG 600px), imprimir individual o todos. Regeneración con confirmación |
| Logs | Historial con filtros: estación, cajero, rango de fechas, **tipo (ENTRADA/SALIDA/Legado)** |
| Bloqueos | Ver y desbloquear rate limits activos |

---

## Variables de Entorno

```env
NEXT_PUBLIC_SUPABASE_URL=https://kgiugfhxguxrtpkokrri.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...        ← Solo server
ADMIN_PASSWORD=...                   ← Contraseña del panel admin
ADMIN_SESSION_SECRET=...             ← Secreto HMAC para la cookie de sesión
```

Ver `ENV_SETUP.md` para instrucciones completas.

---

## URLs de Producción

| Recurso | URL |
|---|---|
| Panel Admin | https://ficha-indol.vercel.app/admin/login |
| Caja 1–6 | https://ficha-indol.vercel.app/s/[1-6] |

---

## Estado Actual

- [x] Estaciones `/s/[station]` funcionales
- [x] PIN hasheado con bcrypt + rate limit + logs
- [x] Diferenciación **ENTRADA / SALIDA** explícita en el fichaje
- [x] Panel de administración completo (7 secciones)
- [x] Autenticación HMAC compatible con Edge Runtime
- [x] QR codes: vista, descarga, impresión y regeneración con confirmación
- [x] Sistema de diseño neumórfico centralizado, sin glow exagerado
- [x] Tipos compartidos en `src/types/punch.ts`
- [x] Migración DB `002_add_event_type.sql` lista para aplicar en Supabase

## Próximos pasos sugeridos

- [ ] Ejecutar migración `002_add_event_type.sql` en Supabase SQL Editor
- [ ] Dashboard de reportes con gráficos de `punch_logs` (entradas vs salidas por turno)
- [ ] Notificaciones al supervisor ante bloqueos
- [ ] Soporte multi-turno (horarios programados por cajero)
