import { DetalleModuloClient } from "./DetalleModuloClient";

// Ampliado (jul 2026): la ruta ya no tiene siempre 3 modulos fijos --
// ahora son 4-5 segun el nivel (ver MODULOS_POR_NIVEL en scoring.ts).
// "dominar" se deja por compatibilidad con URLs ya compartidas/indexadas
// de la ruta vieja, aunque el modulo "Dominar" ya no se genera para
// diagnosticos nuevos.
const SLUG_A_FASE: Record<string, string> = {
  fundamentos: "Fundamentos",
  explorar: "Explorar",
  aplicar: "Aplicar",
  integrar: "Integrar",
  evaluar: "Evaluar",
  liderar: "Liderar",
  innovar: "Innovar",
  dominar: "Dominar",
};

export function generateStaticParams() {
  return Object.keys(SLUG_A_FASE).map((fase) => ({ fase }));
}

export default function DetalleModuloPage({ params }: { params: { fase: string } }) {
  const nombreFase = SLUG_A_FASE[params.fase] ?? null;
  return <DetalleModuloClient nombreFase={nombreFase} />;
}
