"use client";

import { useIdioma } from "@/lib/i18n";
import type { Idioma } from "@/lib/i18n/traducciones";

/**
 * Botón ES | EN. Dos variantes visuales:
 *  - "oscuro": para las pantallas inmersivas (splash, login, registro,
 *    onboarding) que usan DarkScreen / fondo navy.
 *  - "claro": para el header del AppShell (fondo surface).
 * Mismo componente en ambos casos para que el estado venga siempre del
 * IdiomaProvider.
 */
export function LanguageToggle({
  variante = "claro",
}: {
  variante?: "claro" | "oscuro";
}) {
  const { idioma, cambiarIdioma } = useIdioma();
  const oscuro = variante === "oscuro";

  const contenedor = oscuro
    ? "bg-white/10 backdrop-blur-sm"
    : "bg-surface-container-low";

  function claseBoton(activo: boolean) {
    if (oscuro) {
      return activo
        ? "bg-white text-primary"
        : "text-white/50 hover:text-white";
    }
    return activo
      ? "bg-primary-container text-white"
      : "text-on-surface-variant hover:text-primary";
  }

  const opciones: { valor: Idioma; etiqueta: string }[] = [
    { valor: "es", etiqueta: "ES" },
    { valor: "en", etiqueta: "EN" },
  ];

  return (
    <div
      className={`flex items-center gap-0.5 rounded-full p-0.5 ${contenedor}`}
      role="group"
      aria-label="Idioma / Language"
    >
      {opciones.map((op) => (
        <button
          key={op.valor}
          type="button"
          onClick={() => cambiarIdioma(op.valor)}
          aria-pressed={idioma === op.valor}
          className={`rounded-full px-2.5 py-1 font-label text-[11px] font-bold tracking-wide transition-colors ${claseBoton(
            idioma === op.valor
          )}`}
        >
          {op.etiqueta}
        </button>
      ))}
    </div>
  );
}
