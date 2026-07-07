import { DetalleModuloClient } from "./DetalleModuloClient";

const SLUG_A_FASE: Record<string, string> = {
  explorar: "Explorar",
  aplicar: "Aplicar",
  dominar: "Dominar",
};

export function generateStaticParams() {
  return Object.keys(SLUG_A_FASE).map((fase) => ({ fase }));
}

export default function DetalleModuloPage({ params }: { params: { fase: string } }) {
  const nombreFase = SLUG_A_FASE[params.fase] ?? null;
  return <DetalleModuloClient nombreFase={nombreFase} />;
}
