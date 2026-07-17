-- Professor AI — Fase 1.1: ajustes de esquema para reflejar el shape real
-- de SessionState (src/lib/store/session.tsx) y automatizar el alta de
-- usuarios. Migracion aditiva: no modifica ni borra nada de 0001_init.sql,
-- solo agrega columnas/objetos nuevos, asi que es segura de aplicar sobre
-- un proyecto donde 0001 ya corrio (o sobre uno nuevo, corriendo ambas en
-- orden).
--
-- Contexto: 0001_init.sql se escribio antes de que existiera el prototipo
-- de Fase 0 real, basado solo en el brief. Esta migracion la alinea con
-- los campos que la app realmente usa hoy (ver PerfilDocente/ResultadoTmaid
-- /SessionState en session.tsx) mas lo que falta para persistencia real:
-- puntos/racha (hoy solo en localStorage) y un trigger que crea la fila en
-- `usuarios` automaticamente cuando alguien se registra via Supabase Auth.

-- 1) Alta automatica de usuarios: cuando Supabase Auth crea un registro en
--    auth.users (signUp), esta funcion crea la fila correspondiente en
--    public.usuarios. Sin esto, cualquier insert en perfil_docente /
--    resultado_tmaid fallaria (usuario_id no existiria todavia).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.usuarios (id, nombre)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nombre', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2) Contadores de gamificacion — hoy viven solo en localStorage
--    (SessionState.puntos / .racha / .ultimaFechaActiva). Se agregan a
--    `usuarios` porque son 1:1 con el usuario, no con un badge o resultado
--    puntual.
alter table usuarios
  add column if not exists puntos integer not null default 0,
  add column if not exists racha integer not null default 0,
  add column if not exists ultima_fecha_activa date;

-- 3) perfil_docente: falta el campo del paso 4 del onboarding real
--    ("¿Que quieres lograr?" — PerfilDocente.objetivoPrincipal).
alter table perfil_docente
  add column if not exists objetivo_principal text;

-- perfil_docente hoy permite multiples filas por usuario (no hay unique);
-- la app solo usa "el perfil vigente" del docente, asi que forzamos 1:1
-- para poder hacer upsert por usuario_id sin ambiguedad.
alter table perfil_docente
  add constraint perfil_docente_usuario_unico unique (usuario_id);

-- 4) resultado_tmaid: falta el desglose numerico de las 4 dimensiones y el
--    puntaje promedio (ResultadoTmaid.dimensiones / .puntajePromedio) — hoy
--    solo se guardarian dentro de `respuestas` (jsonb crudo), pero el resto
--    de la app (radar, barras de progreso, /progreso, /rutas) necesita
--    leerlos como columnas para consultarlos sin recalcular en cada carga.
alter table resultado_tmaid
  add column if not exists puntaje_promedio numeric(3, 2),
  add column if not exists dimension_conocimiento_ia numeric(3, 2),
  add column if not exists dimension_uso_herramientas numeric(3, 2),
  add column if not exists dimension_integracion_aula numeric(3, 2),
  add column if not exists dimension_actitud_cambio numeric(3, 2);

-- Igual que perfil_docente: la app solo trabaja con "el resultado TMAID
-- vigente" (se puede repetir el diagnostico, pero pisa el anterior — ver
-- /progreso "Repetir diagnostico"), asi que forzamos 1:1 por usuario.
alter table resultado_tmaid
  add constraint resultado_tmaid_usuario_unico unique (usuario_id);

-- 5) progreso: la app usa `progresoRutas: Record<fase, EstadoFase>` donde
--    fase es "Explorar" | "Aplicar" | "Dominar" (no un id de reto libre).
--    Renombramos la columna para reflejar esto con precision y evitar
--    confusion futura con "reto" (que en la UI es la actividad *dentro*
--    de una fase, no la fase misma).
alter table progreso
  rename column reto_id to fase;

comment on column progreso.fase is
  'Una de: Explorar, Aplicar, Dominar (coincide con ResultadoTmaid.rutaPersonalizada[].fase en session.tsx)';

-- Igual que arriba: 1 fila por (usuario, fase), para poder upsert el
-- estado de cada fase sin duplicar filas.
alter table progreso
  add constraint progreso_usuario_fase_unico unique (usuario_id, fase);

-- 6) badges.badge_key ya es 1:1 con BADGES (src/lib/gamification/badges.ts)
--    — sin cambios necesarios ahi, solo lo documentamos.
comment on column badges.badge_key is
  'Debe coincidir con una key de BADGES en src/lib/gamification/badges.ts (ej. "fase-explorar", "primer-prompt")';

-- 7) Incremento atomico de puntos al otorgar un badge (evita condiciones de
--    carrera de un patron leer-puntos-actuales -> sumar -> escribir desde
--    el cliente). security definer porque el update toca una fila que RLS
--    ya protege por su cuenta (auth.uid() = id en la policy de `usuarios`),
--    pero igual se valida auth.uid() = p_usuario_id explicitamente aqui
--    para que la funcion no pueda usarse para modificar puntos de otro
--    usuario aunque alguien intente llamarla directo.
create or replace function public.incrementar_puntos(p_usuario_id uuid, p_delta integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() <> p_usuario_id then
    raise exception 'No autorizado para modificar puntos de otro usuario';
  end if;
  update usuarios set puntos = puntos + p_delta where id = p_usuario_id;
end;
$$;
