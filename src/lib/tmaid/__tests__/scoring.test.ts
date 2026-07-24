import { describe, expect, it } from "vitest";
import { calcularResultadoTmaid, ETIQUETA_DIMENSION, MODULOS_POR_NIVEL } from "../scoring";
import { PREGUNTAS_LIKERT } from "../preguntas";
import type { PerfilDocente } from "@/lib/store/session";

const perfilBase: PerfilDocente = {
  nombre: "Docente de prueba",
  nivelEducativo: "Secundaria",
  materia: "Física",
  pais: "Colombia",
  usoPrevioIA: "Algo",
  mayorDesafio: "Falta de tiempo",
  objetivoPrincipal: "Ahorrar tiempo",
};

function respuestasConValor(valor: number): Record<string, number> {
  return Object.fromEntries(PREGUNTAS_LIKERT.map((p) => [p.id, valor]));
}

describe("calcularResultadoTmaid", () => {
  it("asigna nivel Experto cuando todas las respuestas son maximas (5)", () => {
    const resultado = calcularResultadoTmaid(respuestasConValor(5), perfilBase);
    expect(resultado.nivelAsignado).toBe("Experto");
    expect(resultado.puntajePromedio).toBe(5);
    expect(resultado.dimensiones.conocimientoIA).toBe(5);
    expect(resultado.dimensiones.usoHerramientas).toBe(5);
    expect(resultado.dimensiones.integracionAula).toBe(5);
    expect(resultado.dimensiones.actitudCambio).toBe(5);
  });

  it("asigna nivel Iniciante cuando todas las respuestas son minimas (1)", () => {
    const resultado = calcularResultadoTmaid(respuestasConValor(1), perfilBase);
    expect(resultado.nivelAsignado).toBe("Iniciante");
    expect(resultado.puntajePromedio).toBe(1);
  });

  it("respeta los umbrales exactos de nivelDesdePromedio (< 2.5 / < 3.5 / < 4.5 / >= 4.5)", () => {
    // Umbral es sobre el promedio general, no por dimension individual, pero
    // con todas las respuestas iguales el promedio == esa misma respuesta.
    // Los cortes estan centrados en cada valor entero de la escala Likert
    // (1-5) para que responder consistentemente un valor te de el nivel
    // que ese valor realmente representa -- "Neutral" (3) no debe sonar a
    // "Avanzado", ni "De acuerdo" (4) a "Experto".
    expect(calcularResultadoTmaid(respuestasConValor(2.4), perfilBase).nivelAsignado).toBe(
      "Iniciante"
    );
    expect(calcularResultadoTmaid(respuestasConValor(2.5), perfilBase).nivelAsignado).toBe(
      "En desarrollo"
    );
    expect(calcularResultadoTmaid(respuestasConValor(3), perfilBase).nivelAsignado).toBe(
      "En desarrollo"
    );
    expect(calcularResultadoTmaid(respuestasConValor(3.4), perfilBase).nivelAsignado).toBe(
      "En desarrollo"
    );
    expect(calcularResultadoTmaid(respuestasConValor(3.5), perfilBase).nivelAsignado).toBe(
      "Avanzado"
    );
    expect(calcularResultadoTmaid(respuestasConValor(4), perfilBase).nivelAsignado).toBe(
      "Avanzado"
    );
    expect(calcularResultadoTmaid(respuestasConValor(4.4), perfilBase).nivelAsignado).toBe(
      "Avanzado"
    );
    expect(calcularResultadoTmaid(respuestasConValor(4.5), perfilBase).nivelAsignado).toBe(
      "Experto"
    );
  });

  it("usa 3 (neutral) como default para preguntas sin responder, lo que da nivel En desarrollo", () => {
    const resultado = calcularResultadoTmaid({}, perfilBase);
    expect(resultado.puntajePromedio).toBe(3);
    expect(resultado.nivelAsignado).toBe("En desarrollo");
  });

  it("mapaBrechas siempre incluye las 4 dimensiones, cada una con su etiqueta y un consejo especifico", () => {
    // Antes solo se listaban las dimensiones por debajo de 3 (con fallback
    // generico si ninguna calificaba). Feedback real: el resultado se
    // sentia corto y repetido entre intentos. Ahora siempre trae las 4,
    // con contenido accionable en vez del texto generico "oportunidad
    // clara de refuerzo".
    const resultado = calcularResultadoTmaid(respuestasConValor(5), perfilBase);
    expect(resultado.mapaBrechas).toHaveLength(4);
    Object.values(ETIQUETA_DIMENSION).forEach((etiqueta) => {
      expect(resultado.mapaBrechas.some((b) => b.includes(etiqueta))).toBe(true);
    });
    // Ya no debe quedar el texto generico anterior.
    resultado.mapaBrechas.forEach((b) => {
      expect(b).not.toMatch(/oportunidad clara de refuerzo/);
    });
  });

  it("mapaBrechas ordena las dimensiones de la mas debil a la mas fuerte", () => {
    const respuestas = respuestasConValor(5);
    // Fuerza conocimientoIA muy por debajo del resto.
    PREGUNTAS_LIKERT.filter((p) => p.dimension === "conocimientoIA").forEach((p) => {
      respuestas[p.id] = 1;
    });

    const resultado = calcularResultadoTmaid(respuestas, perfilBase);
    expect(resultado.mapaBrechas[0]).toContain(ETIQUETA_DIMENSION.conocimientoIA);
  });

  // Antes rutaPersonalizada SIEMPRE tenia exactamente 3 fases fijas
  // (Explorar/Aplicar/Dominar), sin importar el nivel -- feedback real:
  // la ruta se sentia corta y terminaba muy rapido, y "por nivel" solo
  // cambiaba el texto, no el largo. Ahora la cantidad y el contenido de
  // modulos dependen de MODULOS_POR_NIVEL (scoring.ts): 4 o 5 modulos,
  // variando segun el nivel real del docente.
  it("la cantidad y el orden de modulos de rutaPersonalizada coincide con MODULOS_POR_NIVEL para cada nivel", () => {
    const casos: [number, "Iniciante" | "En desarrollo" | "Avanzado" | "Experto"][] = [
      [1, "Iniciante"],
      [3, "En desarrollo"],
      [4, "Avanzado"],
      [5, "Experto"],
    ];
    casos.forEach(([valor, nivelEsperado]) => {
      const resultado = calcularResultadoTmaid(respuestasConValor(valor), perfilBase);
      expect(resultado.nivelAsignado).toBe(nivelEsperado);
      expect(resultado.rutaPersonalizada.map((f) => f.fase)).toEqual(
        MODULOS_POR_NIVEL[nivelEsperado]
      );
      // Ya no deben quedar fases vacias ni sin recursos sugeridos -- cada
      // modulo siempre trae descripcion y al menos 1 recurso (video,
      // lectura, libro o consulta -- sugerencia por tema, sin link
      // inventado, ver RecursoSugerido en session.tsx).
      resultado.rutaPersonalizada.forEach((f) => {
        expect(f.descripcion.length).toBeGreaterThan(0);
        expect(f.recursos?.length ?? 0).toBeGreaterThan(0);
      });
    });
  });

  it("Iniciante recibe mas modulos que Experto (ruta mas larga para quien recien empieza)", () => {
    const iniciante = calcularResultadoTmaid(respuestasConValor(1), perfilBase);
    const experto = calcularResultadoTmaid(respuestasConValor(5), perfilBase);
    expect(iniciante.rutaPersonalizada.length).toBeGreaterThanOrEqual(4);
    expect(experto.rutaPersonalizada.length).toBeGreaterThanOrEqual(4);
    // Iniciante arranca con el modulo previo "Fundamentos" que Experto no
    // tiene -- Experto se salta lo basico e incluye "Innovar", que
    // Iniciante todavia no tiene.
    expect(iniciante.rutaPersonalizada.map((f) => f.fase)).toContain("Fundamentos");
    expect(experto.rutaPersonalizada.map((f) => f.fase)).not.toContain("Fundamentos");
    expect(experto.rutaPersonalizada.map((f) => f.fase)).toContain("Innovar");
  });

  it("la fase Aplicar incluye un ejemplo concreto en cifras ligado a la dimension mas debil", () => {
    const respuestas = respuestasConValor(5);
    PREGUNTAS_LIKERT.filter((p) => p.dimension === "usoHerramientas").forEach((p) => {
      respuestas[p.id] = 1;
    });

    const resultado = calcularResultadoTmaid(respuestas, perfilBase);
    const aplicar = resultado.rutaPersonalizada.find((f) => f.fase === "Aplicar");
    expect(aplicar?.descripcion).toContain("30 minutos");
    expect(aplicar?.descripcion).toContain("5-10 minutos");
  });

  it("la fase Explorar varia segun el nivel asignado (comparando 2 niveles que ambos la incluyen)", () => {
    // Experto ya no incluye el modulo Explorar (ver MODULOS_POR_NIVEL), asi
    // que la comparacion valida es entre Iniciante y "En desarrollo", que
    // son los 2 niveles que si lo incluyen.
    const iniciante = calcularResultadoTmaid(respuestasConValor(1), perfilBase);
    const enDesarrollo = calcularResultadoTmaid(respuestasConValor(3), perfilBase);

    const explorarIniciante = iniciante.rutaPersonalizada.find((f) => f.fase === "Explorar")
      ?.descripcion;
    const explorarEnDesarrollo = enDesarrollo.rutaPersonalizada.find((f) => f.fase === "Explorar")
      ?.descripcion;
    expect(explorarIniciante).not.toBe(explorarEnDesarrollo);
  });

  it("la fase Evaluar varia segun el nivel asignado (todos los niveles la incluyen)", () => {
    const iniciante = calcularResultadoTmaid(respuestasConValor(1), perfilBase);
    const experto = calcularResultadoTmaid(respuestasConValor(5), perfilBase);

    const evaluarIniciante = iniciante.rutaPersonalizada.find((f) => f.fase === "Evaluar")
      ?.descripcion;
    const evaluarExperto = experto.rutaPersonalizada.find((f) => f.fase === "Evaluar")
      ?.descripcion;
    expect(evaluarIniciante).not.toBe(evaluarExperto);
  });

  it("perfilPedagogicoIA incorpora la materia y el mayor desafio del perfil", () => {
    const resultado = calcularResultadoTmaid(respuestasConValor(3), perfilBase);
    expect(resultado.perfilPedagogicoIA).toContain(perfilBase.materia);
    expect(resultado.perfilPedagogicoIA).toContain(perfilBase.mayorDesafio);
  });

  it("usa valores de reemplazo neutros cuando el perfil no tiene materia/desafio", () => {
    const perfilVacio: PerfilDocente = { ...perfilBase, materia: "", mayorDesafio: "" };
    const resultado = calcularResultadoTmaid(respuestasConValor(3), perfilVacio);
    expect(resultado.perfilPedagogicoIA).toContain("tu materia");
    expect(resultado.perfilPedagogicoIA).toContain("tu mayor desafío actual");
  });

  it("cita la respuesta abierta 'miedos' en perfilPedagogicoIA cuando viene con texto", () => {
    // Bug real: la pregunta abierta se pedia y se mostraba en pantalla,
    // pero nunca llegaba a calcularResultadoTmaid() -- se descartaba por
    // completo. Ahora, si viene texto, se cita textualmente.
    const resultado = calcularResultadoTmaid(
      respuestasConValor(3),
      perfilBase,
      "Que los estudiantes hagan trampa con IA"
    );
    expect(resultado.perfilPedagogicoIA).toContain(
      "Que los estudiantes hagan trampa con IA"
    );
  });

  it("no agrega nada sobre 'miedos' si no se pasa o viene vacio/solo espacios", () => {
    const sinParametro = calcularResultadoTmaid(respuestasConValor(3), perfilBase);
    const vacio = calcularResultadoTmaid(respuestasConValor(3), perfilBase, "");
    const soloEspacios = calcularResultadoTmaid(respuestasConValor(3), perfilBase, "   ");
    expect(sinParametro.perfilPedagogicoIA).not.toContain("nos contaste");
    expect(vacio.perfilPedagogicoIA).not.toContain("nos contaste");
    expect(soloEspacios.perfilPedagogicoIA).not.toContain("nos contaste");
  });
});
