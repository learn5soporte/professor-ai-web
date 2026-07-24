-- Professor AI — Fase 1.4: linea base de progreso en /progreso.
--
-- Feedback real de un docente probando el prototipo (2026-07-23): pidio
-- una linea base ("asi comenzaste, en esto mejoraste"). Hoy resultado_tmaid
-- es 1:1 por usuario via upsert (ver 0002_professor_ai_schema.sql) --
-- repetir el diagnostico pisa el resultado anterior sin dejar rastro del
-- punto de partida.
--
-- Esta migracion es ADITIVA (no borra ni modifica columnas existentes):
-- agrega una columna `primer_resultado` que queda congelada para siempre
-- con el PRIMER resultado del docente, gestionada 100% del lado del
-- servidor via trigger. El cliente (src/lib/supabase/datos.ts) nunca
-- escribe esta columna, solo la lee -- asi no hay forma de que un bug del
-- cliente la sobreescriba, y el codigo de la app ya funciona hoy sin este
-- campo (usa `select("*")`, asi que si esta migracion todavia no corrio,
-- la app simplemente no muestra la comparacion de evolucion, sin romper
-- nada mas).
--
-- Como aplicar: pegar este archivo completo en el SQL Editor del proyecto
-- de Supabase y ejecutarlo. Seguro de correr mas de una vez (usa
-- if not exists / or replace / drop-if-exists en todo).

alter table resultado_tmaid
  add column if not exists primer_resultado jsonb;

-- Backfill: los usuarios que ya tienen un resultado_tmaid hoy (antes de
-- que existiera esta columna) usan su resultado actual como su propia
-- linea base -- es lo mas honesto posible sin datos historicos reales, y
-- evita que la funcionalidad quede vacia para quien ya hizo el
-- diagnostico antes de esta migracion.
update resultado_tmaid
set primer_resultado = jsonb_build_object(
  'puntajePromedio', puntaje_promedio,
  'dimensiones', jsonb_build_object(
    'conocimientoIA', dimension_conocimiento_ia,
    'usoHerramientas', dimension_uso_herramientas,
    'integracionAula', dimension_integracion_aula,
    'actitudCambio', dimension_actitud_cambio
  ),
  'nivelAsignado', nivel_asignado
)
where primer_resultado is null;

-- Trigger: en cada INSERT, congela el resultado recien creado como
-- "primer_resultado". En cada UPDATE (repetir el diagnostico via upsert),
-- preserva el valor que ya existia sin importar lo que mande el cliente
-- -- asi la linea base nunca se pisa, ni siquiera si en el futuro alguien
-- llega a mandarla por error desde datos.ts.
create or replace function public.congelar_primer_resultado_tmaid()
returns trigger
language plpgsql
as $$
begin
  if TG_OP = 'INSERT' then
    NEW.primer_resultado := jsonb_build_object(
      'puntajePromedio', NEW.puntaje_promedio,
      'dimensiones', jsonb_build_object(
        'conocimientoIA', NEW.dimension_conocimiento_ia,
        'usoHerramientas', NEW.dimension_uso_herramientas,
        'integracionAula', NEW.dimension_integracion_aula,
        'actitudCambio', NEW.dimension_actitud_cambio
      ),
      'nivelAsignado', NEW.nivel_asignado
    );
  elsif TG_OP = 'UPDATE' then
    NEW.primer_resultado := OLD.primer_resultado;
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_congelar_primer_resultado_tmaid on resultado_tmaid;
create trigger trg_congelar_primer_resultado_tmaid
  before insert or update on resultado_tmaid
  for each row execute procedure public.congelar_primer_resultado_tmaid();

comment on column resultado_tmaid.primer_resultado is
  'Snapshot congelado (nunca se sobreescribe) del primer resultado TMAID del docente -- usado en /progreso para mostrar "asi comenzaste vs. como vas ahora". Gestionado por trg_congelar_primer_resultado_tmaid, no por el cliente.';
