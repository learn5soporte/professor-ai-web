import type { ReactNode } from "react";

/**
 * Fondo inmersivo compartido por las pantallas "especializadas" de Stitch:
 * splash, login, registro, onboarding e intro TMAID. Replica exactamente
 * el body{} navy (#00113a) + los "Shared Global Background Blobs" del
 * code.html real (bloque_1_y_2_acceso_y_onboarding/code.html).
 */
export function DarkScreen({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`dark-screen ${className}`}>
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute right-0 top-0 h-[500px] w-[500px] translate-x-1/2 -translate-y-1/2 rounded-full bg-tertiary-fixed-dim/20 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[600px] w-[600px] -translate-x-1/2 translate-y-1/2 rounded-full bg-secondary-container/20 blur-[150px]" />
      </div>
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center">
        {children}
      </main>
    </div>
  );
}
