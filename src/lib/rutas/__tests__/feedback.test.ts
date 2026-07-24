import { describe, expect, it } from "vitest";
import { generarFeedbackIA, parecePromptReal } from "../feedback";

const tips = [
  'Define el rol: "Actúa como un especialista en didáctica..."',
  "Da contexto: nivel, materia, tamaño del grupo.",
];

describe("parecePromptReal", () => {
  it("rechaza ruido de teclado sin espacios (bug real reportado por el usuario)", () => {
    expect(parecePromptReal("xczvgzdfsbgzdfgdf")).toBe(false);
  });

  it("rechaza texto vacío o muy corto", () => {
    expect(parecePromptReal("")).toBe(false);
    expect(parecePromptReal("hola")).toBe(false);
  });

  it("rechaza menos de 3 palabras aunque tengan vocales", () => {
    expect(parecePromptReal("hola profe")).toBe(false);
  });

  it("acepta un prompt real de al menos 3 palabras con vocales", () => {
    expect(parecePromptReal("Explica la fotosíntesis a mis estudiantes")).toBe(true);
  });
});

describe("generarFeedbackIA", () => {
  it("no elogia texto que no parece un prompt real (bug real: 'xczvgzdfsbgzdfgdf' recibía 'Excelente enfoque')", () => {
    const feedback = generarFeedbackIA("xczvgzdfsbgzdfgdf", "Aplicar", tips);
    expect(feedback).not.toMatch(/excelente|buen enfoque/i);
    expect(feedback).toMatch(/no parece un prompt completo/i);
  });

  it("marca como escueto un prompt real pero con menos de 8 palabras", () => {
    const feedback = generarFeedbackIA("Explica la fotosíntesis a mis estudiantes", "Aplicar", tips);
    expect(feedback).toMatch(/muy escueto/i);
    expect(feedback).not.toMatch(/excelente|buen enfoque/i);
  });

  it("señala falta de elementos clave en un prompt largo sin palabras clave de la fase", () => {
    const feedback = generarFeedbackIA(
      "Escribe algo largo pero generico sin ningun elemento especifico de la fase solo para probar que largo funciona bien aqui de verdad",
      "Aplicar",
      tips
    );
    expect(feedback).toMatch(/no veo elementos clave/i);
    expect(feedback).not.toMatch(/buen enfoque/i);
  });

  it("da feedback positivo y específico cuando el prompt es largo y usa palabras clave reales", () => {
    const feedback = generarFeedbackIA(
      "Actúa como un especialista en didáctica y explica la fotosíntesis a estudiantes de nivel medio, con ejemplos concretos y un objetivo claro de aprendizaje.",
      "Aplicar",
      tips
    );
    expect(feedback).toMatch(/buen enfoque/i);
    expect(feedback).toContain("Aplicar");
  });

  it("usa un tip de reemplazo neutro si la lista de tips viene vacía", () => {
    const feedback = generarFeedbackIA("xczvgzdfsbgzdfgdf", "Explorar", []);
    expect(feedback).toContain("define el rol de la IA y el contexto de tu aula");
  });
});
