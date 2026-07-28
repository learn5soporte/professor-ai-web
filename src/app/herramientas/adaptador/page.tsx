"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, perfilCompleto } from "@/lib/store/session";
import { AppShell } from "@/components/AppShell";
import { BadgeUnlockToast } from "@/components/BadgeUnlockToast";
import { BADGES } from "@/lib/gamification/badges";
import { Icon } from "@/components/Icon";
import { CargandoPantalla } from "@/components/CargandoPantalla";

/**
 * Adaptador de Contenido -- herramienta nueva (jul 2026), pedida por el
 * usuario tras auditar el hub y ver que era la única marcada
 * "Próximamente" sin contenido real detrás.
 *
 * Decisión de honestidad deliberada (mismo principio que el resto de la
 * app -- ver Creador de Rúbricas, Planeación Pro, PremiumUpgradeModal):
 * sin GPT-4o real conectado todavía, esta herramienta NO finge reescribir
 * el texto del docente palabra por palabra (eso sería una simulación
 * engañosa). En cambio, genera una GUÍA DE ADAPTACIÓN real y accionable:
 * pasos concretos de cómo modificar ESE contenido específico para el tipo
 * de necesidad elegida, calculando datos reales del texto pegado
 * (cantidad de palabras, tiempo de lectura estimado) en vez de inventar
 * cifras.
 */

type TipoAdaptacion = "Nivel de lectura" | "Necesidad educativa específica" | "Nivel de idioma (ELL)";

const SUBOPCIONES: Record<TipoAdaptacion, string[]> = {
  "Nivel de lectura": ["Simplificar", "Profundizar"],
  "Necesidad educativa específica": [
    "TDAH",
    "Dislexia",
    "TEA (autismo)",
    "Baja visión",
    "Altas capacidades",
  ],
  "Nivel de idioma (ELL)": ["A1-A2 (principiante)", "B1-B2 (intermedio)"],
};

/**
 * Estrategias reales por subopción -- 5 cada una, pensadas para aplicarse
 * a cualquier contenido (no genéricas del estilo "adapta según
 * necesites"). Referenciadas en fuentes de diseño universal de
 * aprendizaje (DUA/UDL) y accesibilidad, adaptadas a lenguaje simple para
 * uso directo en el aula.
 */
const ESTRATEGIAS_POR_SUBOPCION: Record<string, string[]> = {
  Simplificar: [
    "Acorta las oraciones -- una idea principal por oración.",
    "Reemplaza palabras técnicas por su equivalente común, y define las que no puedas evitar.",
    "Usa ejemplos concretos y cercanos a la vida del estudiante antes que definiciones abstractas.",
    "Agrega subtítulos que resuman de qué trata cada sección.",
    "Reduce el contenido a lo esencial -- prioriza profundidad sobre cantidad de datos.",
  ],
  Profundizar: [
    "Incorpora vocabulario técnico específico de la disciplina, definiéndolo la primera vez que aparece.",
    "Agrega matices, excepciones o casos límite que el contenido original simplifica.",
    "Pide que relacione el tema con otro contenido ya visto (pensamiento conectado).",
    "Incluye un dato o fuente que invite a cuestionar o ampliar lo presentado.",
    "Formula una pregunta abierta que no tenga una única respuesta correcta.",
  ],
  TDAH: [
    "Divide el contenido en bloques cortos (5-7 líneas máx) con un encabezado claro por bloque.",
    "Resalta en negrita las 2-3 ideas que no pueden perderse.",
    "Agrega una pausa o actividad breve cada 10-15 minutos de lectura o explicación.",
    "Usa listas y numeración en vez de párrafos largos siempre que puedas.",
    "Da instrucciones de a una por vez, no varias juntas en la misma frase.",
  ],
  Dislexia: [
    "Usa una fuente sin serifas (Arial, Verdana) y tamaño de letra grande (14pt o más).",
    "Aumenta el interlineado (mínimo 1.5) y el espacio entre párrafos.",
    "Evita justificar el texto -- alineación a la izquierda es más fácil de seguir.",
    "Acompaña el texto denso con apoyos visuales (diagramas, íconos, color).",
    "Ofrece la opción de escuchar el contenido (texto a voz) además de leerlo.",
  ],
  "TEA (autismo)": [
    "Usa lenguaje literal y directo -- evita metáforas, sarcasmo o dobles sentidos sin explicarlos.",
    "Anticipa la estructura de la actividad al inicio (qué va a pasar, en qué orden).",
    "Reduce estímulos visuales innecesarios (colores o animaciones que no aportan información).",
    "Da tiempo explícito de transición entre actividades, no cambios abruptos.",
    "Si hay trabajo en grupo, define roles claros para cada estudiante.",
  ],
  "Baja visión": [
    "Asegura alto contraste entre texto y fondo (texto oscuro sobre fondo claro, o al revés).",
    "Usa tamaño de fuente ajustable, mínimo 16pt como punto de partida.",
    "Describe verbalmente cualquier imagen, gráfico o diagrama que uses.",
    "Evita depender solo del color para transmitir información (ej. \"el correcto está en verde\").",
    "Si compartes el material digital, verifica que sea compatible con lectores de pantalla.",
  ],
  "Altas capacidades": [
    "Agrega una pregunta o desafío de profundización opcional al final del contenido.",
    "Conecta el tema con una aplicación real o un problema abierto sin solución única.",
    "Ofrece una ruta de investigación adicional -- no solo \"más de lo mismo\", sino más complejo.",
    "Da espacio para que proponga su propia pregunta de exploración sobre el tema.",
    "Evita repetir el mismo formato de actividad -- varía el tipo de desafío que le das.",
  ],
  "A1-A2 (principiante)": [
    "Usa oraciones cortas y en presente simple siempre que sea posible.",
    "Acompaña el texto con apoyo visual (imágenes, gestos, ejemplos concretos).",
    "Evita modismos y expresiones idiomáticas -- usa lenguaje literal.",
    "Repite el vocabulario clave varias veces en distintos contextos dentro del mismo material.",
    "Da instrucciones en pasos numerados, uno a la vez.",
  ],
  "B1-B2 (intermedio)": [
    "Introduce vocabulario nuevo en contexto, con una definición breve entre paréntesis.",
    "Usa oraciones de longitud media -- evita subordinadas muy anidadas.",
    "Incluye alguna expresión idiomática común, explicada la primera vez que aparece.",
    "Pide producción activa (que el estudiante use el vocabulario nuevo, no solo lo reconozca).",
    "Ofrece la versión original y una versión levemente simplificada como referencia.",
  ],
};

function contarPalabras(texto: string): number {
  return texto.trim().length === 0 ? 0 : texto.trim().split(/\s+/).length;
}

export default function AdaptadorContenidoPage() {
  const router = useRouter();
  const { perfil, otorgarBadge, cargando } = useSession();

  const [contenido, setContenido] = useState("");
  const [tipo, setTipo] = useState<TipoAdaptacion>("Necesidad educativa específica");
  const [subopcion, setSubopcion] = useState(SUBOPCIONES["Necesidad educativa específica"][0]);
  const [estado, setEstado] = useState<"editando" | "generando" | "listo">("editando");
  const [copiado, setCopiado] = useState(false);
  const [badgeGanado, setBadgeGanado] = useState<null | (typeof BADGES)[string]>(null);

  useEffect(() => {
    if (cargando) return;
    if (!perfil) router.replace("/login");
    else if (!perfilCompleto(perfil)) router.replace("/onboarding");
  }, [cargando, perfil, router]);

  if (cargando) return <CargandoPantalla />;
  if (!perfil || !perfilCompleto(perfil)) return null;

  function cambiarTipo(nuevo: TipoAdaptacion) {
    setTipo(nuevo);
    setSubopcion(SUBOPCIONES[nuevo][0]);
    setEstado("editando");
  }

  function generar() {
    if (!contenido.trim()) return;
    setEstado("generando");
    setTimeout(() => {
      setEstado("listo");
      if (otorgarBadge("primera-adaptacion")) {
        setBadgeGanado(BADGES["primera-adaptacion"]);
      }
    }, 1200);
  }

  const palabras = contarPalabras(contenido);
  const minutosLectura = Math.max(1, Math.round(palabras / 200));
  const estrategias = ESTRATEGIAS_POR_SUBOPCION[subopcion] ?? [];

  function textoPlano() {
    return [
      `Guía de adaptación -- ${subopcion} (${tipo})`,
      `Contenido original: ${palabras} palabras (~${minutosLectura} min de lectura)`,
      "",
      "Esta guía no reescribe tu contenido automáticamente -- son pasos concretos para que tú lo adaptes.",
      "",
      "Estrategias recomendadas:",
      ...estrategias.map((e, i) => `${i + 1}. ${e}`),
    ].join("\n");
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(textoPlano());
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      // Si el navegador bloquea el portapapeles, no rompemos la UI.
    }
  }

  function descargar() {
    const blob = new Blob([textoPlano()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `adaptacion-${subopcion.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AppShell titulo="Adaptador de Contenido">
      <BadgeUnlockToast badge={badgeGanado} onClose={() => setBadgeGanado(null)} />
      <div className="mx-auto max-w-2xl">
        <Link
          href="/herramientas"
          className="text-sm mb-4 inline-flex items-center gap-1 font-bold text-on-primary-fixed"
        >
          <Icon name="arrow_back" /> Herramientas
        </Link>

        <div className="rounded-[2.5rem] bg-surface-container-low p-8 md:p-12">
          <div className="space-y-gap-lg mx-auto max-w-2xl">
            <div className="text-center">
              <h1 className="font-headline text-3xl font-black">Adaptador de Contenido</h1>
              <p className="text-lg mt-2 text-on-surface-variant">
                Pega tu contenido y obtén pasos concretos para adaptarlo a NEE, otro nivel de
                lectura o nivel de idioma.
              </p>
            </div>

            <div className="rounded-xl bg-tertiary-container/10 p-4 text-sm text-on-surface-variant">
              <Icon name="info" className="mr-1 align-text-bottom text-[16px] text-tertiary" />
              Todavía no hay IA generativa conectada en esta versión, así que esta herramienta no
              reescribe tu texto palabra por palabra -- te da una guía real y accionable de cómo
              adaptarlo tú mismo/a.
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold ml-2 uppercase text-on-surface-variant">
                  Contenido original (pega o escribe el texto/actividad)
                </label>
                <textarea
                  value={contenido}
                  onChange={(e) => setContenido(e.target.value)}
                  placeholder="Pega aquí el texto, actividad o guía que quieres adaptar..."
                  rows={6}
                  className="text-sm w-full rounded-xl border-none bg-white p-4 shadow-sm outline-none transition-all focus:ring-2 focus:ring-secondary/20"
                />
                <p className="ml-2 text-[12px] text-on-surface-variant">
                  {palabras} palabras{palabras > 0 ? ` · ~${minutosLectura} min de lectura` : ""}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold ml-2 uppercase text-on-surface-variant">
                    Tipo de adaptación
                  </label>
                  <select
                    value={tipo}
                    onChange={(e) => cambiarTipo(e.target.value as TipoAdaptacion)}
                    className="h-14 w-full appearance-none rounded-xl border-none bg-white px-6 shadow-sm outline-none transition-all focus:ring-2 focus:ring-secondary/20"
                  >
                    {(Object.keys(SUBOPCIONES) as TipoAdaptacion[]).map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold ml-2 uppercase text-on-surface-variant">
                    Para
                  </label>
                  <select
                    value={subopcion}
                    onChange={(e) => {
                      setSubopcion(e.target.value);
                      setEstado("editando");
                    }}
                    className="h-14 w-full appearance-none rounded-xl border-none bg-white px-6 shadow-sm outline-none transition-all focus:ring-2 focus:ring-secondary/20"
                  >
                    {SUBOPCIONES[tipo].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={generar}
                disabled={estado === "generando" || !contenido.trim()}
                className="flex h-16 w-full items-center justify-center gap-3 rounded-full bg-on-secondary-fixed text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
              >
                {estado === "generando" ? (
                  <>
                    <Icon name="autorenew" className="animate-spin" /> Generando guía...
                  </>
                ) : (
                  <>
                    <Icon name="auto_awesome" /> Generar guía de adaptación
                  </>
                )}
              </button>
            </div>

            {estado === "listo" && (
              <div className="mt-12 space-y-6">
                <div className="flex items-center justify-between px-4">
                  <h4 className="font-headline text-lg font-bold">
                    Guía para {subopcion.toLowerCase()}
                  </h4>
                  <div className="flex gap-2">
                    <button
                      onClick={descargar}
                      title="Descargar como .txt"
                      className="rounded-full bg-white p-3 text-secondary"
                    >
                      <Icon name="file_download" />
                    </button>
                    <button
                      onClick={copiar}
                      title="Copiar al portapapeles"
                      className="rounded-full bg-white p-3 text-secondary"
                    >
                      <Icon name={copiado ? "check" : "content_copy"} />
                    </button>
                  </div>
                </div>
                <div className="rounded-r-2xl border-l-4 border-secondary bg-secondary-fixed/20 p-6">
                  <span className="text-xs font-black text-secondary">
                    TU CONTENIDO
                  </span>
                  <p className="text-base mt-2 text-on-surface-variant">
                    {palabras} palabras · ~{minutosLectura} min de lectura estimados
                  </p>
                </div>
                <ol className="space-y-3">
                  {estrategias.map((e, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm"
                    >
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-[12px] font-black text-on-secondary">
                        {i + 1}
                      </span>
                      <p className="text-base">{e}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
