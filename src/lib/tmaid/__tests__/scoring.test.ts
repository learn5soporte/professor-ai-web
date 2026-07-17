import { describe, expect, it } from "vitest";
import { calcularResultadoTmaid, ETIQUETA_DIMENSION } from "../scoring";
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

  it("respeta los umbrales exactos de nivelDesdePromedio (< 2 / < 3 / < 4 / >= 4)", () => {
    // Umbral es sobre el promedio general, no por dimension individual, pero
    // con todas las respuestas iguales el promedio == esa misma respuesta.
    expect(calcularResultadoTmaid(respuestasConValor(1.9), perfilBase).nivelAsignado).toBe(
      "Iniciante"
    );
    expect(calcularResultadoTmaid(respuestasConValor(2), perfilBase).nivelAsignado).toBe(
      "En desarrollo"
    );
    expect(calcularResultadoTmaid(respuestasConValor(2.9), perfilBase).nivelAsignado).toBe(
      "En desarrollo"
    );
    expect(calcularResultadoTmaid(respuestasConValor(3), perfilBase).nivelAsignado).toBe(
      "Avanzado"
    );
    expect(calcularResultadoTmaid(respuestasConValor(3.9), perfilBase).nivelAsignado).toBe(
      "Avanzado"
    );
    expect(calcularResultadoTmaid(respuestasConValor(4), perfilBase).nivelAsignado).toBe(
      "Experto"
    );
  });

  it("usa 3 (neutral) como default para preguntas sin responder", () => {
    const resultado = calcularResultadoTmaid({}, perfilBase);
    expect(resultado.puntajePromedio).toBe(3);
    expect(resultado.nivelAsignado).toBe("Avanzado");
  });

  it("mapaBrechas incluye una entrada por cada dimension por debajo de 3", () => {
    const respuestas = respuestasConValor(5);
    // Fuerza conocimientoIA por debajo de 3, el resto se queda en 5.
    const preguntasConocimiento = PREGUNTAS_LIKERT.filter(
      (p) => p.dimension === "conocimientoIA"
    );
    preguntasConocimiento.forEach((p) => {
      respuestas[p.id] = 1;
    });

    const resultado = calcularResultadoTmaid(respuestas, perfilBase);
    expect(resultado.mapaBrechas).toHaveLength(1);
    expect(resultado.mapaBrechas[0]).toContain(ETIQUETA_DIMENSION.conocimientoIA);
  });

  it("mapaBrechas cae en el mensaje de fallback cuando ninguna dimension esta por debajo de 3", () => {
    const resultado = calcularResultadoTmaid(respuestasConValor(5), perfilBase);
    expect(resultado.mapaBrechas).toHaveLength(1);
    expect(resultado.mapaBrechas[0]).toMatch(/dimensión relativamente más baja/);
  });

  it("siempre devuelve las 3 fases de rutaPersonalizada en el orden Explorar/Aplicar/Dominar", () => {
    const resultado = calcularResultadoTmaid(respuestasConValor(3), perfilBase);
    expect(resultado.rutaPersonalizada.map((f) => f.fase)).toEqual([
      "Explorar",
      "Aplicar",
      "Dominar",
    ]);
    resultado.rutaPersonalizada.forEach((f) => {
      expect(f.descripcion.length).toBeGreaterThan(0);
    });
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
});
