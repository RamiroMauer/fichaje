# Configuración de Entorno y Variables MVP CasinoClock

Este documento detalla cómo configurar correctamente las variables de entorno para que el proyecto conecte con la base de datos Supabase, tanto de manera local como de manera productiva en Vercel.

---

## 1. Configuración Local (.env.local)

1. En la raíz de tu proyecto, crea un archivo llamado `.env.local`. (Verifica que Git lo ignore; normalmente Next.js lo hace automáticamente mediante el `/.env*` en el `.gitignore`).
2. Copiá el contenido completo del archivo `.env.example` dentro de tu nuevo `.env.local`.
3. Reemplaza los placeholders `__PASTE_ANON_KEY__` y `__PASTE_SERVICE_ROLE_KEY__` con los tokens que encontrarás en el Dashboard de tu proyecto Supabase (Settings -> API).
    - **`NEXT_PUBLIC_SUPABASE_URL`**: Debe ser siempre `"https://kgiugfhxguxrtpkokrri.supabase.co"`.
    - **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**: Clave pública, utilizada en utilidades genéricas SSR de Next.js u operaciones de cliente.
    - **`SUPABASE_SERVICE_ROLE_KEY`**: Clave privada y privilegiada, utilizada para **bypassear RLS**, forzar escrituras o validar contraseñas de manera segura en las llamadas desde nuestros Server Actions.

> [!CAUTION]
> **Seguridad Crítica sobre los Secretos de Supabase**
> La variable `SUPABASE_SERVICE_ROLE_KEY` puede bypassear completamente los permisos. **JAMÁS** debe ser importada desde archivos que se ejecutan en el _Client_ (`"use client"`). Siempre utilizá las Server Actions o los Server Components desde `lib/supabase/server.ts` de forma segura. Se sugiere migrar al uso de "Secret Keys" personalizadas si alguna vez se abandona la escala MVP.

---

## 2. Configuración en Vercel (Production)

Para desplegar estos cambios, necesitas informar a Vercel sobre estas tres variables requeridas. 

1. Abre el Dashboard de Vercel de tu proyecto (`ficha-indol` u otro vinculado a este repositorio).
2. Ve a la sección **Settings** -> **Environment Variables**.
3. Añade las siguientes variables una por una:
   - `NEXT_PUBLIC_SUPABASE_URL`: `"https://kgiugfhxguxrtpkokrri.supabase.co"`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: *[Tu Anon Key]*
   - `SUPABASE_SERVICE_ROLE_KEY`: *[Tu Service Role Key]*
4. **IMPORTANTE**: Cualquier cambio en las Environment Variables de Vercel no aplica retrospectivamente. Una vez colocadas, deberás hacer click en **Redeploy** (o realizar tu próximo `git push`) para que tengan un entorno en efecto y el servidor las reciba correctamente en los Server Actions de Next.js.

---

## 3. Checklist de QA para Entornos

Una vez añadidas a `Vercel` o de forma local en `localhost:3000`:
- [ ] Navega a la estación 1 `/s/1`: Debería cargar dinámicamente tu lista de cajeros desde Supabase y no tirar una pantalla de error ("Config de Supabase Faltante").
- [ ] Conéctate e ingresa un PIN correcto: Debes presenciar la interacción visual de "Fichaje Exitoso" (Check verde).
- [ ] Ir al Table Editor de tu Supabase DB -> `punch_logs`: Se debió crear una nueva fila registrando la acción 'PUNCH'.
- [ ] Fallar a propósito (Añadiendo PINes incorrectos al azar al menos 5 veces consecutivas): Debería mostrarte la pantalla visual de bloqueo de Rate Limiting por 60 segundos con cuenta atrás.
- [ ] Ir a DB -> `pin_attempts`: Verás cómo el `failed_count` se incrementó.
