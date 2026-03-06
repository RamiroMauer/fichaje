# CasinoClock MVP — Resumen del Proyecto

## ¿Qué es?

Sistema de fichaje digital para estaciones de caja (casino). Cada caja tiene un QR único que el cajero escanea para registrar su fichaje con PIN personal. Incluye un panel de administración completo para gestionar cajeros, estaciones y monitorear la actividad.

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

- Fondo `#121212`
- Acento interactivo `#007BFF`
- Error en `#FF3B30`
- Radios ≥ 24px, sombras neumórficas convexas/cóncavas
- Clases utilitarias globales: `.neu-card`, `.neu-pressed`, `.neu-input` con `isolation: isolate`
- Animaciones con Framer Motion (shake, spring, scale)
- Sin glow/halo — sombras limpias y contenidas

---

## Estructura del Proyecto

```
src/
├── app/
│   ├── s/[station]/page.tsx     # Página de cada estación (Server Component)
│   ├── admin/
│   │   ├── layout.tsx           # Layout del panel admin (sidebar + main)
│   │   ├── login/page.tsx       # Login del encargado
│   │   ├── page.tsx             # Dashboard con métricas
│   │   ├── cashiers/page.tsx    # CRUD de cajeros
│   │   ├── stations/page.tsx    # Asignación (4 cajeros por caja)
│   │   ├── pins/page.tsx        # Generación de PINs (mostrado solo 1 vez)
│   │   ├── qrs/page.tsx         # Ver, descargar e imprimir QRs por caja
│   │   ├── logs/page.tsx        # Historial de fichajes con filtros
│   │   └── locks/page.tsx       # Bloqueos activos por rate limit
│   └── actions/
│       ├── punch.ts             # Server Action: validar PIN + loguear fichaje
│       └── admin.ts             # Server Actions del panel admin
├── components/
│   ├── StationFlow.tsx          # Máquina de estados principal (UI pública)
│   ├── PinPad.tsx               # Teclado numérico 4 dígitos
│   ├── ClockInView.tsx          # Vista de confirmación pre-fichaje
│   ├── NeumorphicButton.tsx     # Botón base reutilizable
│   └── admin/
│       ├── AdminSidebar.tsx     # Navegación lateral del panel
│       ├── AdminCard.tsx        # Card neumórfica de métricas
│       ├── AdminTable.tsx       # Tabla genérica reutilizable
│       └── AdminModal.tsx       # Modal neumórfico con animaciones
└── lib/
    ├── auth.ts                  # HMAC signing/verify + verifyTokenEdge (Edge Runtime)
    ├── supabase/
    │   ├── server.ts            # Cliente Supabase (anon + service role)
    │   └── client.ts            # Cliente Supabase para el browser
    └── env.ts                   # Validación "fail fast" de env vars

src/middleware.ts                # Protege /admin/* — verifica cookie de sesión (Edge)

supabase/
├── schema.sql                   # Definición de tablas y RLS
├── seed.sql                     # Estaciones + cajeros de prueba (PIN 1234)
└── migrations/
    └── 001_add_cashier_active.sql  # Agrega columna is_active a cashiers

public/qrs/                      # QRs generados apuntando a /s/1..6
```

---

## Base de Datos (Supabase)

### Tablas

| Tabla | Descripción |
|---|---|
| `stations` | Las 6 cajas (id: "1" a "6") |
| `cashiers` | Cajeros con nombre, UUID e `is_active` |
| `station_assignments` | Qué cajeros pertenecen a cada caja (exactamente 4) |
| `cashier_pins` | Hash bcrypt del PIN de cada cajero |
| `pin_attempts` | Rate limit: intentos y bloqueo temporal |
| `punch_logs` | Log de cada fichaje realizado |

### Seguridad
- RLS habilitado en todas las tablas
- `SUPABASE_SERVICE_ROLE_KEY` **solo en el servidor** (Server Actions)
- La `ANON_KEY` pública puede leer estaciones/cajeros vía RLS

---

## Panel de Administración

Acceso: `/admin/login` — protegido por contraseña + cookie `httpOnly` firmada con HMAC.

| Sección | Funcionalidad |
|---|---|
| Dashboard | Métricas en tiempo real: cajeros activos, estaciones, fichajes del día, bloqueos |
| Cajeros | Crear, editar, activar/desactivar |
| Estaciones | Asignar exactamente 4 cajeros por caja |
| PINs | Generar PIN 4 dígitos (muestra solo una vez, guarda hash bcrypt) |
| QR Codes | Ver, descargar (PNG 600px) e imprimir QRs por caja. Regeneración con confirmación |
| Logs | Historial de fichajes con filtros por estación, cajero y rango de fechas |
| Bloqueos | Ver y desbloquear cajeros con rate limit activo |

---

## Flujo Principal (Cajero)

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
ADMIN_PASSWORD=...               ← Contraseña del panel admin
ADMIN_SESSION_SECRET=...         ← Secreto HMAC para firmar la cookie de sesión
```

Ver `ENV_SETUP.md` para instrucciones completas de configuración local y Vercel.

---

## URLs de Producción

| Recurso | URL |
|---|---|
| Panel Admin | https://ficha-indol.vercel.app/admin/login |
| Caja 1 | https://ficha-indol.vercel.app/s/1 |
| Caja 2 | https://ficha-indol.vercel.app/s/2 |
| Caja 3 | https://ficha-indol.vercel.app/s/3 |
| Caja 4 | https://ficha-indol.vercel.app/s/4 |
| Caja 5 | https://ficha-indol.vercel.app/s/5 |
| Caja 6 | https://ficha-indol.vercel.app/s/6 |

---

## Estado Actual

- [x] Estaciones `/s/[station]` funcionales con Supabase
- [x] PIN hasheado con bcrypt + rate limit + logs
- [x] Panel de administración completo (login, cajeros, estaciones, PINs, QRs, logs, bloqueos)
- [x] Autenticación HMAC con Edge Runtime compatible
- [x] QR codes con vista, descarga e impresión desde el panel
- [x] Sistema de diseño neumórfico centralizado en `globals.css`

## Próximos pasos sugeridos

- [ ] Diferenciación ENTRADA / SALIDA (actualmente es `PUNCH` genérico)
- [ ] Dashboard de reportes con gráficos de `punch_logs`
- [ ] Notificaciones al supervisor ante bloqueos
- [ ] Soporte multi-turno (horarios programados por cajero)
