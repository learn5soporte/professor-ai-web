"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, perfilCompleto } from "@/lib/store/session";
import { BADGES } from "@/lib/gamification/badges";
import { generarFeedbackIA } from "@/lib/rutas/feedback";
import { Icon } from "@/components/Icon";
import { Confetti } from "@/components/Confetti";

/**
 * Espacio del Reto + Revisión/Autoevaluación + Celebración -- base literal:
 * code.html real de Stitch (bloque_4_y_5_dashboard_y_ruta_formativa,
 * Section 17: screen-challenge; Section 19: screen-celebration; y
 * revisi_n_del_reto_y_autoevaluaci_n: screen-review). Fase 0: no hay
 * GPT-4o real todavia, el "preview de output IA" es una simulacion.
 *
 * A diferencia del Stitch original de revisión (que comparaba una
 * propuesta ficticia sobre la Revolución Industrial contra sugerencias de
 * IA inventadas y regalaba "+500 XP" fijos), aquí la tarjeta "Tu
 * Propuesta" muestra el prompt REAL que el docente escribió, "Optimización
 * IA" reutiliza el mismo feedback simulado ya generado en el área de
 * trabajo, y el XP mostrado es el valor REAL del badge de la fase
 * (BADGES[...].puntos). Además, otorgar el badge y marcar la fase como
 * completada ahora depende de que el docente complete su autoevaluación
 * real (calificación de 1-5 estrellas + checkbox), no de un timeout
 * automático.
 *
 * Bug real encontrado por el usuario (2026-07-23): "feedbackIA" era un
 * string fijo ("Excelente enfoque...") sin importar lo que se escribiera
 * -- probó con texto sin sentido ("xczvgzdfsbgzdfgdf") y la
 * retroalimentación seguía elogiándolo. Reemplazado por
 * generarFeedbackIA() (src/lib/rutas/feedback.ts), que aplica una
 * heurística simple (sin NLP real, pero honesta al respecto en sus
 * comentarios) para distinguir texto que no parece un prompt, uno muy
 * corto, uno largo sin los elementos clave de la fase, y uno que sí los
 * tiene.
 */

/**
 * Ampliado (jul 2026): la ruta paso de tener siempre 3 fases fijas a 4-5
 * modulos segun el nivel real del docente (ver MODULOS_POR_NIVEL en
 * scoring.ts). Estos 2 mapas ahora cubren los 7 modulos posibles, no solo
 * los 3 originales -- si un modulo nuevo llegara sin entrada aqui, el
 * fallback a TEORIA_POR_FASE.Explorar de mas abajo evitaria un crash, pero
 * mostraria contenido equivocado, asi que se completaron todos.
 */
const BADGE_POR_FASE: Record<string, string> = {
  Fundamentos: "fase-fundamentos",
  Explorar: "fase-explorar",
  Aplicar: "fase-aplicar",
  Integrar: "fase-integrar",
  Evaluar: "fase-evaluar",
  Liderar: "fase-liderar",
  Innovar: "fase-innovar",
};

const TEORIA_POR_FASE: Record<string, { titulo: string; parrafo: string; tips: string[] }> = {
  Fundamentos: {
    titulo: "Teoría esencial: Antes de tu primer prompt",
    parrafo:
      "Un modelo de lenguaje no \"sabe\" nada con certeza -- predice la palabra más probable dada tu instrucción. Por eso puede sonar muy segura y aun así estar equivocada (una \"alucinación\").",
    tips: [
      "Pídele siempre que sea concreta: mientras más vago tu pedido, más genérica (o inventada) la respuesta.",
      "Verifica cualquier dato, cifra o cita antes de usarla con tus estudiantes.",
    ],
  },
  Explorar: {
    titulo: "Teoría esencial: Primeros prompts",
    parrafo:
      "Un buen prompt exploratorio define claramente el rol de la IA, el contexto de tu aula y el resultado que esperas.",
    tips: [
      'Define el rol: "Actúa como un especialista en didáctica..."',
      "Da contexto: nivel, materia, tamaño del grupo.",
    ],
  },
  Aplicar: {
    titulo: "Teoría esencial: Prompts de personalización",
    parrafo:
      "La personalización efectiva requiere tres elementos: contexto del estudiante, objetivo de aprendizaje y restricciones de formato.",
    tips: [
      'Define el rol: "Actúa como un psicopedagogo..."',
      'Sube o baja la dificultad: "Adapta este texto para un nivel..."',
    ],
  },
  Integrar: {
    titulo: "Teoría esencial: Prompts para tu rutina semanal",
    parrafo:
      "Integrar de verdad significa reutilizar: en vez de escribir un prompt distinto cada vez, guarda y ajusta los que ya te funcionaron para planeación, retroalimentación o comunicación con estudiantes.",
    tips: [
      "Guarda tus prompts que sí funcionaron -- reutilizarlos ahorra más tiempo que escribir uno nuevo cada vez.",
      "Fíjate una tarea semanal fija donde siempre uses IA (por ejemplo, el borrador de tu planeación).",
    ],
  },
  Evaluar: {
    titulo: "Teoría esencial: Prompts de evaluación",
    parrafo:
      "Para evaluar con IA, encadena instrucciones: primero pide criterios, luego pide retroalimentación específica por estudiante.",
    tips: [
      "Pide una rúbrica antes de pedir la evaluación en sí.",
      "Solicita siempre retroalimentación accionable, no solo una nota.",
    ],
  },
  Liderar: {
    titulo: "Teoría esencial: Prompts para explicarle a otros",
    parrafo:
      "Enseñar a un/a colega es distinto a usar algo tú mismo/a: necesitas poder explicar el prompt paso a paso, no solo el resultado final.",
    tips: [
      'Pide a la IA que te ayude a explicar un prompt "como si se lo enseñaras a alguien que nunca usó esto".',
      "Documenta el prompt exacto que funcionó, no solo la idea general -- así otros pueden reutilizarlo tal cual.",
    ],
  },
  Innovar: {
    titulo: "Teoría esencial: Prompts para casos poco comunes",
    parrafo:
      "Los usos más innovadores de IA (simulaciones, generación dinámica de casos, asistencia de investigación) requieren prompts más largos y con más restricciones explícitas que los prompts básicos.",
    tips: [
      "Divide una tarea compleja en varios prompts encadenados en vez de uno solo gigante.",
      "Pide siempre una justificación de la respuesta, no solo el resultado -- te ayuda a detectar errores sutiles.",
    ],
  },
};

/** Icono + etiqueta por tipo de recurso sugerido (ver RecursoSugerido en session.tsx). */
const ICONO_POR_TIPO_RECURSO: Record<string, string> = {
  video: "play_circle",
  lectura: "article",
  libro: "menu_book",
  consulta: "forum",
};

const ETIQUETA_TIPO_RECURSO: Record<string, string> = {
  video: "Video",
  lectura: "Lectura",
  libro: "Libro",
  consulta: "Consulta",
};

export default function RetoPage() {
  const router = useRouter();
  const {
    perfil,
    resultadoTmaid,
    progresoRutas,
    actualizarProgresoFase,
    otorgarBadge,
    cargando,
  } = useSession();
  const [prompt, setPrompt] = useState("");
  const [estado, setEstado] = useState<"editando" | "procesando" | "revision">("editando");
  const [calificacion, setCalificacion] = useState(0);
  const [marcadoCompleto, setMarcadoCompleto] = useState(false);
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);
  const [celebracion, setCelebracion] = useState(false);
  const [puntosGanados, setPuntosGanados] = useState(0);

  useEffect(() => {
    if (cargando) return;
    if (!perfil) router.replace("/login");
    else if (!perfilCompleto(perfil)) router.replace("/onboarding");
    else if (!resultadoTmaid) router.replace("/tmaid");
  }, [cargando, perfil, resultadoTmaid, router]);

  if (cargando || !perfil || !perfilCompleto(perfil) || !resultadoTmaid) return null;

  const fases = resultadoTmaid.rutaPersonalizada;
  const indiceActivo = fases.findIndex((f) => progresoRutas[f.fase] !== "completado");
  const faseActual = fases[indiceActivo] ?? fases[fases.length - 1];
  const teoria = TEORIA_POR_FASE[faseActual.fase] ?? TEORIA_POR_FASE.Explorar;
  const hayMasFases = indiceActivo >= 0 && indiceActivo < fases.length - 1;
  const badgeId = BADGE_POR_FASE[faseActual.fase];
  const badge = badgeId ? BADGES[badgeId] : null;
  const xpDisponible = badge?.puntos ?? 10;
  const feedbackIA = generarFeedbackIA(prompt, faseActual.fase, teoria.tips);

  function enviar() {
    if (!prompt.trim() || estado !== "editando") return;
    setEstado("procesando");
    // Bug real encontrado en auditoria (2026-07-23): "en_progreso" existe
    // como estado de EstadoFase y /rutas/page.tsx ya tenia logica para
    // mostrar una barra al 65% cuando una fase esta "en_progreso" (vs 25%
    // si no) -- pero ningun lugar del codigo llamaba nunca
    // actualizarProgresoFase(fase, "en_progreso"), asi que esa rama nunca
    // se activaba y la barra de la fase activa mostraba siempre el mismo
    // 25%, sin importar cuanto hubiera avanzado el docente. Marcar
    // "en_progreso" aqui (cuando el docente ya envio una propuesta real,
    // no solo abrio la pantalla) hace que ese indicador refleje avance de
    // verdad.
    actualizarProgresoFase(faseActual.fase, "en_progreso");
    setTimeout(() => {
      setEstado("revision");
    }, 1500);
  }

  function confirmar() {
    if (calificacion === 0) {
      setErrorValidacion("Selecciona una calificación antes de continuar.");
      return;
    }
    if (!marcadoCompleto) {
      setErrorValidacion("Marca el reto como completado para ganar los puntos XP.");
      return;
    }
    setErrorValidacion(null);
    actualizarProgresoFase(faseActual.fase, "completado");
    const gano = badgeId ? otorgarBadge(badgeId) : false;
    setPuntosGanados(gano && badge ? badge.puntos : xpDisponible);
    setCelebracion(true);
  }

  if (celebracion) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-on-secondary-fixed px-6 text-center">
        <Confetti />
        <div className="relative mb-8">
          <div className="absolute inset-0 animate-pulse rounded-full bg-tertiary-container opacity-40 blur-[80px]" />
          <Icon
            name="emoji_events"
            filled
            className="relative z-10 text-[160px] text-tertiary-fixed-dim"
          />
        </div>
        <h2 className="font-display-lg text-display-lg mb-2 text-white">¡EXCELENTE TRABAJO!</h2>
        <p className="font-headline-md text-headline-md mb-8 text-tertiary-fixed-dim">
          +{puntosGanados} XP GANADOS
        </p>
        <div className="w-full max-w-xs space-y-4">
          <button
            onClick={() => router.push(hayMasFases ? "/rutas" : "/dashboard")}
            className="text-label-lg w-full rounded-full bg-tertiary-container py-4 font-bold text-on-tertiary-fixed transition-transform hover:scale-105"
          >
            {hayMasFases ? "PRÓXIMO RETO" : "IR AL INICIO"}
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full font-bold text-white/60 transition-colors hover:text-white"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  if (estado === "revision") {
    return (
      <div className="min-h-screen bg-surface pb-32 pt-8">
        <div className="mx-auto max-w-5xl space-y-gap-xl px-margin-mobile">
          <div>
            <div className="mb-4 flex items-center gap-md">
              <span className="text-[12px] font-bold uppercase text-on-tertiary-fixed rounded-full bg-tertiary-fixed px-3 py-1">
                Reto {indiceActivo + 1} de {fases.length}
              </span>
              <span className="font-body-sm text-on-surface-variant">
                Fase: {faseActual.fase}
              </span>
            </div>
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-2 text-primary">
              Revisión del Reto
            </h2>
            <p className="text-body-lg max-w-2xl text-on-surface-variant">
              Compara tu propuesta con la retroalimentación de la IA y evalúa tu experiencia
              para avanzar.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-gap-xl md:grid-cols-2">
            <div className="atmospheric-shadow rounded-xl bg-surface-container-lowest p-8">
              <div className="mb-6 flex items-center gap-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container text-primary">
                  <Icon name="edit_note" />
                </div>
                <h3 className="font-headline-md text-headline-md">Tu Propuesta</h3>
              </div>
              <p className="text-body-md whitespace-pre-wrap leading-relaxed text-on-surface-variant">
                {prompt}
              </p>
            </div>

            <div className="atmospheric-shadow rounded-xl bg-primary-container p-8 text-on-primary-container">
              <div className="mb-6 flex items-center gap-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary-container text-on-secondary-container">
                  <Icon name="auto_awesome" filled />
                </div>
                <h3 className="font-headline-md text-headline-md text-white">
                  Retroalimentación IA
                </h3>
              </div>
              <p className="text-body-md leading-relaxed text-blue-100">{feedbackIA}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-gap-xl lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-xl bg-surface-container-high p-8">
              <h4 className="font-headline-md text-headline-md mb-6">Autoevaluación</h4>
              <div className="flex flex-col justify-between gap-lg md:flex-row md:items-center">
                <div className="space-y-2">
                  <p className="font-body-md text-on-surface-variant">
                    ¿Qué tan útil te ha parecido la retroalimentación de la IA para tu
                    práctica docente?
                  </p>
                  <div className="flex gap-2 py-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => {
                          setCalificacion(n);
                          setErrorValidacion(null);
                        }}
                        className="transition-transform hover:scale-110"
                        aria-label={`Calificar con ${n} estrella(s)`}
                      >
                        <Icon
                          name="star"
                          filled={n <= calificacion}
                          className={`text-[40px] ${
                            n <= calificacion ? "text-tertiary-container" : "text-outline"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <label className="flex items-center gap-md rounded-xl bg-white p-4 shadow-sm">
                  <input
                    type="checkbox"
                    checked={marcadoCompleto}
                    onChange={(e) => {
                      setMarcadoCompleto(e.target.checked);
                      setErrorValidacion(null);
                    }}
                    className="h-6 w-6 cursor-pointer rounded border-outline-variant text-secondary focus:ring-secondary"
                  />
                  <span className="text-label-lg font-label-lg cursor-pointer">
                    Marcar como completado
                  </span>
                </label>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-md">
              <button
                onClick={confirmar}
                className="font-headline-md group relative overflow-hidden rounded-full bg-primary px-10 py-6 text-on-primary transition-all hover:-translate-y-1 hover:shadow-xl active:scale-95"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Confirmar y ganar XP
                  <Icon
                    name="rocket_launch"
                    className="transition-transform group-hover:translate-x-2"
                  />
                </span>
              </button>
              <p className="text-center text-[12px] font-bold uppercase tracking-widest text-on-surface-variant">
                +{xpDisponible} XP disponibles
              </p>
              {errorValidacion && (
                <p className="text-center text-sm font-semibold text-error">
                  {errorValidacion}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-16 pt-8">
      <div className="mx-auto max-w-4xl space-y-gap-xl px-margin-mobile">
        <div className="flex items-center justify-between rounded-xl bg-tertiary-container/10 p-4">
          <button
            onClick={() => router.push("/rutas")}
            className="flex items-center gap-2 font-bold text-on-primary-fixed"
          >
            <Icon name="arrow_back" /> Atrás
          </button>
          <span className="font-bold uppercase tracking-widest text-tertiary-container">
            Reto {indiceActivo + 1} de {fases.length}
          </span>
          <div className="w-10" />
        </div>

        <details className="group overflow-hidden rounded-xl bg-surface-container-low">
          <summary className="flex list-none cursor-pointer items-center justify-between p-6 font-bold text-on-primary-fixed">
            <span>📚 {teoria.titulo}</span>
            <Icon name="expand_more" className="transition-transform group-open:rotate-180" />
          </summary>
          <div className="space-y-4 px-6 pb-6 text-on-surface-variant">
            <p>{teoria.parrafo}</p>
            <ul className="list-disc space-y-2 pl-5">
              {teoria.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
        </details>

        <div className="atmospheric-shadow rounded-xl bg-tertiary-fixed p-6 text-on-tertiary-fixed">
          <h3 className="font-headline-md text-headline-md mb-2">TU DESAFÍO</h3>
          <p className="font-body-lg text-body-lg">{faseActual.descripcion}</p>
        </div>

        {faseActual.recursos && faseActual.recursos.length > 0 && (
          <div className="atmospheric-shadow rounded-xl bg-white p-6">
            <h4 className="mb-1 flex items-center gap-2 font-bold text-primary">
              <Icon name="explore" className="text-[18px]" /> Para complementar este módulo
            </h4>
            <p className="text-body-sm mb-4 text-on-surface-variant">
              Sugerencias de tema, no un link específico -- tú eliges qué video, artículo o
              persona concreta te sirve más.
            </p>
            <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
              {faseActual.recursos.map((r, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl bg-surface-container-low p-4"
                >
                  <Icon
                    name={ICONO_POR_TIPO_RECURSO[r.tipo] ?? "lightbulb"}
                    className="mt-0.5 text-[20px] text-secondary"
                  />
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-secondary">
                      {ETIQUETA_TIPO_RECURSO[r.tipo] ?? r.tipo}
                    </span>
                    <p className="text-body-sm mt-1 text-on-surface-variant">{r.sugerencia}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid h-auto grid-cols-1 gap-lg lg:h-[500px] lg:grid-cols-2">
          <div className="atmospheric-shadow flex flex-col gap-md rounded-xl bg-white p-6">
            <div className="flex items-center justify-between">
              <span className="font-bold text-secondary">Área de Trabajo</span>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={estado !== "editando"}
              placeholder="Escribe tu prompt aquí..."
              className="text-body-sm flex-grow rounded-xl border-none bg-surface-container-lowest p-4 font-mono focus:ring-2 focus:ring-secondary/20"
            />
            <button
              onClick={enviar}
              disabled={!prompt.trim() || estado !== "editando"}
              className="animate-pulse-subtle flex items-center justify-center gap-2 rounded-full bg-primary py-4 font-bold text-on-primary transition-transform hover:scale-[1.02] disabled:animate-none disabled:opacity-50"
            >
              {estado === "procesando" ? (
                <>
                  <Icon name="autorenew" className="animate-spin" /> PROCESANDO...
                </>
              ) : (
                <>
                  ENVIAR Y COMPLETAR RETO <Icon name="send" />
                </>
              )}
            </button>
          </div>

          <div className="flex flex-col gap-md overflow-hidden rounded-xl border-2 border-dashed border-outline-variant bg-on-secondary-fixed/5 p-6">
            <span className="flex items-center gap-2 font-bold text-on-surface-variant">
              <Icon name="preview" /> Preview de Output IA
            </span>
            <div className="flex-grow space-y-4 overflow-y-auto">
              {estado === "editando" && (
                <div className="flex h-full items-center justify-center italic text-on-surface-variant opacity-30">
                  Esperando tu prompt para generar el resultado...
                </div>
              )}
              {estado === "procesando" && (
                <>
                  <div className="h-4 w-3/4 animate-pulse rounded bg-surface-container-highest" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-surface-container-highest" />
                  <div className="h-4 w-5/6 animate-pulse rounded bg-surface-container-highest" />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
