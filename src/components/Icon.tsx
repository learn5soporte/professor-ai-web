import type { CSSProperties } from "react";

/**
 * Icono Material Symbols Outlined -- el set real que usa Stitch en todo el
 * export (splash, onboarding, dashboard, herramientas, TMAID, etc). El
 * font se carga en el <head> del layout raiz. Ver code.html original para
 * los nombres exactos de icono usados por pantalla.
 */
export function Icon({
  name,
  filled = false,
  className = "",
  style,
}: {
  name: string;
  filled?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}`,
        ...style,
      }}
    >
      {name}
    </span>
  );
}
