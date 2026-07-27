/**
 * Pantalla de carga compartida -- pedida indirectamente por el usuario al
 * decir que quiere mejorar la experiencia de usuario/interfaz de cara a
 * demos con universidades. Antes, las ~16 pantallas protegidas mostraban
 * un flash de pantalla en blanco (`return null`) mientras `cargando` era
 * true (la sesión hidratándose desde Supabase o localStorage) -- notorio
 * en una demo en vivo, sobre todo en conexiones lentas. Reusa la animación
 * `.loader-dot` ya definida en globals.css (3 puntos, la misma que usaba
 * el splash original) en vez de crear una nueva.
 *
 * `oscuro` es para las 2 pantallas que viven sobre el fondo inmersivo
 * navy (DarkScreen) -- onboarding y el intro/preguntas de TMAID -- para
 * que el loader no rompa con un flash blanco en medio de esas pantallas.
 * El resto de las pantallas (con AppShell o el wrapper claro propio de
 * /rutas/reto) usan la variante clara por defecto.
 */
export function CargandoPantalla({ oscuro = false }: { oscuro?: boolean }) {
  return (
    <div
      className={`flex min-h-screen items-center justify-center ${
        oscuro ? "bg-[#00113a]" : "bg-surface"
      }`}
    >
      <div className="flex gap-2">
        <span
          className={`loader-dot h-3 w-3 rounded-full ${
            oscuro ? "bg-tertiary-container" : "bg-secondary"
          }`}
        />
        <span
          className={`loader-dot h-3 w-3 rounded-full ${
            oscuro ? "bg-tertiary-container" : "bg-secondary"
          }`}
        />
        <span
          className={`loader-dot h-3 w-3 rounded-full ${
            oscuro ? "bg-tertiary-container" : "bg-secondary"
          }`}
        />
      </div>
    </div>
  );
}
