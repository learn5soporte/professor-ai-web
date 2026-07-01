-- Professor AI — Fase 0: tablas base
-- Fuente: Professor_AI_Brief_Cowork.md + Professor_AI_DocumentoTecnicoFuncional_v2.docx

create extension if not exists "uuid-ossp";

-- Instituciones (para el panel B2B, Módulo 5)
create table if not exists instituciones (
  id uuid primary key default uuid_generate_v4(),
  nombre text not null,
  plan text not null default 'institucional', -- institucional / free / pro (a nivel cuenta)
  created_at timestamptz not null default now()
);

-- Usuarios (extiende auth.users de Supabase con datos propios de Professor AI)
create table if not exists usuarios (
  id uuid primary key references auth.users (id) on delete cascade,
  institucion_id uuid references instituciones (id) on delete set null,
  nombre text,
  plan text not null default 'free', -- free / pro / institucional
  created_at timestamptz not null default now()
);

-- Perfil Docente Base (PDB) — salida del Módulo 0 (Onboarding)
create table if not exists perfil_docente (
  id uuid primary key default uuid_generate_v4(),
  usuario_id uuid not null references usuarios (id) on delete cascade,
  nivel_educativo text, -- primaria / secundaria / universidad / formación corporativa
  materia text,
  pais text,
  uso_previo_ia text, -- nunca / algo / regularmente
  mayor_desafio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Resultado TMAID — salida del Módulo 1 (Diagnóstico inicial, core diferenciador)
create table if not exists resultado_tmaid (
  id uuid primary key default uuid_generate_v4(),
  usuario_id uuid not null references usuarios (id) on delete cascade,
  nivel_asignado text, -- Iniciante / En desarrollo / Avanzado / Experto
  respuestas jsonb not null default '{}'::jsonb,
  perfil_pedagogico_ia text,
  mapa_brechas jsonb,
  ruta_personalizada jsonb, -- 3 fases: Explorar / Aplicar / Dominar
  created_at timestamptz not null default now()
);

-- Progreso — Módulo 4 (Seguimiento y Evolución)
create table if not exists progreso (
  id uuid primary key default uuid_generate_v4(),
  usuario_id uuid not null references usuarios (id) on delete cascade,
  reto_id text not null,
  estado text not null default 'pendiente', -- pendiente / en_progreso / completado
  updated_at timestamptz not null default now()
);

-- Badges / logros — gamificación persistente (Fase 4)
create table if not exists badges (
  id uuid primary key default uuid_generate_v4(),
  usuario_id uuid not null references usuarios (id) on delete cascade,
  badge_key text not null,
  otorgado_at timestamptz not null default now(),
  unique (usuario_id, badge_key)
);

-- RLS: cada usuario solo ve/edita sus propios datos
alter table usuarios enable row level security;
alter table perfil_docente enable row level security;
alter table resultado_tmaid enable row level security;
alter table progreso enable row level security;
alter table badges enable row level security;

create policy "usuarios: propio registro" on usuarios
  for all using (auth.uid() = id);

create policy "perfil_docente: propio" on perfil_docente
  for all using (auth.uid() = usuario_id);

create policy "resultado_tmaid: propio" on resultado_tmaid
  for all using (auth.uid() = usuario_id);

create policy "progreso: propio" on progreso
  for all using (auth.uid() = usuario_id);

create policy "badges: propio" on badges
  for all using (auth.uid() = usuario_id);
