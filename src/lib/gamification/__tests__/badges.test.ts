import { describe, expect, it } from "vitest";
import { BADGES, calcularNivel } from "../badges";

describe("calcularNivel", () => {
  it("nivel 1 para puntos entre 0 y 19", () => {
    expect(calcularNivel(0)).toEqual({ nivel: 1, siguienteEn: 20 });
    expect(calcularNivel(19)).toEqual({ nivel: 1, siguienteEn: 20 });
  });

  it("nivel 2 justo en el umbral de 20, hasta 49", () => {
    expect(calcularNivel(20)).toEqual({ nivel: 2, siguienteEn: 50 });
    expect(calcularNivel(49)).toEqual({ nivel: 2, siguienteEn: 50 });
  });

  it("nivel 3 justo en el umbral de 50, hasta 89", () => {
    expect(calcularNivel(50)).toEqual({ nivel: 3, siguienteEn: 90 });
    expect(calcularNivel(89)).toEqual({ nivel: 3, siguienteEn: 90 });
  });

  it("nivel 4 justo en el umbral de 90, hasta 149", () => {
    expect(calcularNivel(90)).toEqual({ nivel: 4, siguienteEn: 150 });
    expect(calcularNivel(149)).toEqual({ nivel: 4, siguienteEn: 150 });
  });

  it("nivel 5 (maximo) desde 150 en adelante, sin siguiente nivel", () => {
    expect(calcularNivel(150)).toEqual({ nivel: 5, siguienteEn: null });
    expect(calcularNivel(10000)).toEqual({ nivel: 5, siguienteEn: null });
  });
});

describe("catalogo BADGES", () => {
  it("cada badge tiene su id interno igual a la key del record", () => {
    Object.entries(BADGES).forEach(([key, badge]) => {
      expect(badge.id).toBe(key);
    });
  });

  it("cada badge otorga puntos positivos", () => {
    Object.values(BADGES).forEach((badge) => {
      expect(badge.puntos).toBeGreaterThan(0);
    });
  });

  it("cada badge tiene nombre, descripcion y emoji no vacios", () => {
    Object.values(BADGES).forEach((badge) => {
      expect(badge.nombre.length).toBeGreaterThan(0);
      expect(badge.descripcion.length).toBeGreaterThan(0);
      expect(badge.emoji.length).toBeGreaterThan(0);
    });
  });

  it("incluye los badges de las 3 fases de la ruta (Explorar/Aplicar/Dominar)", () => {
    expect(BADGES["fase-explorar"]).toBeDefined();
    expect(BADGES["fase-aplicar"]).toBeDefined();
    expect(BADGES["fase-dominar"]).toBeDefined();
  });
});
