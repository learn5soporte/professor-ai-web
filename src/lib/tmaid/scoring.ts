import type { PerfilDocente, ResultadoTmaid } from "@/lib/store/session";
import { PREGUNTAS_LIKERT, type Dimension } from "./preguntas";

/**
 * Scoring TMAID — Fase 0/1: reglas simples client-side.
 * Fase 2 (según roadmap): este cálculo se conecta a un prompt estructurado
 * a GPT-4o para generar el perfil pedagógico-IA y la ruta con lenguaje
 * natural más rico; la lógica de dimensiones/nivel se mantiene igual.
 */

const DIMENSIONES: Dimension[] = [
  "conocimientoIA",
  "usoHerramientas",
  "integracionAula",
  "actitudCambio",
];

const ETIQUETA_DIMENSION: Record<Dimension, string> = {
  conocimientoIA: "Conocimiento de IA",
  usoHerramientas: "Uso de herramientas",
  integracionAula: "Integración al aula",
  actitudCambio: "Actitud ante el cambio",
};

function promedioPorDimension(
  respuestas: Record<string, number>,
  dimension: Dimension
): number {
  const preguntas = PREGUNTAS_LIKERT.filter((p) => p.dimension === dimension);
  const suma = preguntas.reduce((acc, p) => acc + (respuestas[p.id] ?? 3), 0);
  return suma / preguntas.length;
}

function nivelDesdePromedio(promedio: number): ResultadoTmaid["nivelAsignado"] {
  if (promedio < 2) return "Iniciante";
  if (promedio < 3) return "En desarrollo";
  if (promedio < 4) return "Avanzado";
  return "Experto";
}

export function calcularResultadoTmaid(
  respuestas: Record<string, number>,
  perfil: PerfilDocente
): ResultadoTmaid {
  const dimensiones = {
    conocimientoIA: promedioPorDimension(respuestas, "conocimientoIA"),
    usoHerramientas: promedioPorDimension(respuestas, "usoHerramientas"),
    integracionAula: promedioPorDimension(respuestas, "integracionAula"),
    actitudCambio: promedioPorDimension(respuestas, "actitudCambio"),
  };

  const puntajePromedio =
    Object.values(dimensiones).reduce((a, b) => a + b, 0) / DIMENSIONES.length;

  const nivelAsignado = nivelDesdePromedio(puntajePromedio);

  const masFuerte = DIMENSIONES.reduce((a, b) =>
    dimensiones[a] >= dimensiones[b] ? a : b
  );
  const masDebil = DIMENSIONES.reduce((a, b) =>
    dimensiones[a] <= dimensiones[b] ? a : b
  );

  const mapaBrechas = DIMENSIONES.filter((d) => dimensiones[d] < 3).map(
    (d) => `${ETIQUETA_DIMENSION[d]}: oportunidad clara de refuerzo.`
  );
  if (mapaBrechas.length === 0) {
    mapaBrechas.push(
      `${ETIQUETA_DIMENSION[masDebil]} es tu dimensión relativamente más baja — buen punto de partida para seguir creciendo.`
    );
  }

  const materia = perfil.materia || "tu materia";
  const desafio = perfil.mayorDesafio || "tu mayor desafío actual";

  const perfilPedagogicoIA = `Eres un/a docente de ${materia} con ${
    dimensiones[masFuerte] >= 4 ? "muy buena" : "cierta"
  } base en ${ETIQUETA_DIMENSION[masFuerte].toLowerCase()}. Tu mayor oportunidad está en fortalecer ${ETIQUETA_DIMENSION[
    masDebil
  ].toLowerCase()}, especialmente pensando en resolver ${desafio}.`;

  const rutaPersonalizada: ResultadoTmaid["rutaPersonalizada"] = [
    {
      fase: "Explorar",
      descripcion: `Familiarízate con 2-3 herramientas de IA aplicadas a ${materia}, sin presión de usarlas aún en clase.`,
    },
    {
      fase: "Aplicar",
      descripcion: `Lleva una primera actividad con IA a tu aula enfocada en ${desafio}, usando el Banco de Prompts.`,
    },
    {
      fase: "Dominar",
      descripcion: `Integra IA de forma regular en planeación y evaluación, y comparte tu experiencia con colegas.`,
    },
  ];

  return {
    nivelAsignado,
    puntajePromedio,
    dimensiones,
    perfilPedagogicoIA,
    mapaBrechas,
    rutaPersonalizada,
  };
}

export { ETIQUETA_DIMENSION };
