# Professor AI — Web (Learn5)

Fase 0 del roadmap (ver `Professor_AI_DocumentoTecnicoFuncional_v2.docx` y `Professor_AI_Brief_Cowork.md` en Drive). Identidad visual: **Lumina Academic** (azul `#0040a1` + dorado `#feb700`, Plus Jakarta Sans + Manrope).

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS con tokens de Lumina Academic (`tailwind.config.ts`)
- Supabase (Auth + Postgres + Storage) — placeholder, ver abajo
- OpenAI GPT-4o (a partir de Fase 2, motor TMAID)

## Setup local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Conectar Supabase real

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Copia la URL y las keys (Settings → API) a tu `.env.local`.
3. Corre la migración inicial contra tu proyecto:
   ```bash
   npx supabase db push
   # o pega el contenido de supabase/migrations/0001_init.sql
   # en el SQL Editor del dashboard de Supabase.
   ```

## Estructura

```
src/
  app/            # rutas (App Router)
  lib/supabase/   # clientes Supabase (browser + server)
  modules/        # lógica por módulo funcional (ver docs técnico v2.0)
    auth/
    onboarding/
    tmaid/            # Módulo 1 — core diferenciador
    dashboard/
    herramientas/
    seguimiento/
    institucional/    # B2B, Fase 5
supabase/
  migrations/     # SQL versionado (tablas base ya incluidas)
```

## Roadmap (resumen)

Fase 0 (este repo) → Fase 1 Auth + esquema → Fase 2 Motor TMAID → Fase 3 Herramientas IA → Fase 4 Gamificación persistente → Fase 5 Panel institucional. Detalle completo en el brief de Cowork.
