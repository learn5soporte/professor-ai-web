"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, perfilCompleto } from "@/lib/store/session";
import {
  PREGUNTAS_LIKERT,
  PREGUNTA_ABIERTA,
  ESCALA_LIKERT,
  type Dimension,
} from "@/lib/tmaid/preguntas";
import { calcularResultadoTmaid, ETIQUETA_DIMENSION } from "@/lib/tmaid/scoring";
import { BadgeUnlockToast } from "@/components/BadgeUnlockToast";
import { BADGES } from "@/lib/gamification/badges";
import { DarkScreen } from "@/components/DarkScreen";
import { Icon } from "@/components/Icon";
import { CargandoPantalla } from "@/components/CargandoPantalla";

/**
 * Diagnostico TMAID -- base literal: code.html real de Stitch
 * (bloque_3_diagn_stico_tmaid): SCREEN 9 (intro oscura), SCREEN 10 (Likert,
 * header fijo tipo glass-card), SCREEN 11 (pregunta abierta) y SCREEN 12
 * (procesando). El resultado (SCREEN 13) vive en /tmaid/resultado.
 *
 * Bug real encontrado en auditoría (2026-07-23): "miedos" (la respuesta a
 * PREGUNTA_ABIERTA) se capturaba y se mostraba en pantalla, pero nunca se
 * pasaba a calcularResultadoTmaid() -- se descartaba por completo, aunque
 * la pantalla de "procesando" dice literalmente que la IA está
 * "analizando tus respuestas". Ahora sí se pasa (ver scoring.ts).
 *
 * Rediseño de la intro (jul 2026, aprobado en Claude Design): el ícono
 * genérico "psychology" (cabeza + engranaje) se reemplazó por "radar"
 * (evoca diagnóstico/medición, no "IA leyendo tu mente"). Los 4 chips de
 * dimensión pasaron de una fila horizontal con nombres genéricos a una
 * pila vertical con ícono + color propio por dimensión, usando los
 * nombres descriptivos de ETIQUETA_DIMENSION. Se agregó un párrafo corto
 * debajo nombrando el modelo TMAID (Test de Madurez IA Docente, ver
 * src/modules/tmaid/README.md) en vez de decir solo "marco propio de
 * Learn5" -- TMAID sí es un modelo con nombre propio, no un framework
 * externo tipo DigCompEdu/SAMR/TPACK. Ver memoria del proyecto.
 *
 * v2 (2026-07-30): el CTA de la intro ("Comenzar Diagnóstico") pasa de un
 * pill azul (bg-secondary) a .btn-gold-glow, mismo tratamiento dorado
 * aprobado en Claude Design ya aplicado en las otras pantallas oscuras
 * (Splash/Login/Registro/Recuperar/Onboarding). Las pantallas de Likert y
 * pregunta abierta usan un sistema visual claro distinto (btn-primary
 * sobre fondo claro) y quedan fuera de este cambio a propósito.
 */

const TOTAL_LIKERT = PREGUNTAS_LIKERT.length;
const TOTAL_PASOS = TOTAL_LIKERT + 1; // + pregunta abierta

const ICONOS_PROCESANDO = ["insights", "school", "precision_manufacturing"];

const ORDEN_DIMENSIONES: Dimension[] = [
  "conocimientoIA",
  "usoHerramientas",
  "integracionAula",
  "actitudCambio",
];

const DIMENSION_VISUAL: Record<
  Dimension,
  { icon: string; badgeClass: string; iconClass: string }
> = {
  conocimientoIA: {
    icon: "lightbulb",
    badgeClass: "bg-tertiary-fixed-dim/20",
    iconClass: "text-tertiary-fixed-dim",
  },
  usoHerramientas: {
    icon: "build",
    badgeClass: "bg-secondary-fixed-dim/20",
    iconClass: "text-secondary-fixed-dim",
  },
  integracionAula: {
    icon: "hub",
    badgeClass: "bg-emerald-400/20",
    iconClass: "text-emerald-400",
  },
  actitudCambio: {
    icon: "rocket_launch",
    badgeClass: "bg-pink-400/20",
    iconClass: "text-pink-400",
  },
};

type Paso = "intro" | number | "procesando";

export default function TmaidPage() {
  const router = useRouter();
  const { perfil, guardarResultadoTmaid, otorgarBadge, cargando } = useSession();
  const [paso, setPaso] = useState<Paso>("intro");
  const [respuestas, setRespuestas] = useState<Record<string, number>>({});
  const [miedos, setMiedos] = useState("");
  const [badgeGanado, setBadgeGanado] = useState<null | (typeof BADGES)[string]>(
    null
  );
  const [iconoIdx, setIconoIdx] = useState(0);

  useEffect(() => {
    if (cargando) return;
    if (!perfil) router.replace("/login");
    else if (!perfilCompleto(perfil)) router.replace("/onboarding");
  }, [cargando, perfil, router]);

  useEffect(() => {
    if (paso !== "procesando") return;
    const rotacion = setInterval(() => {
      setIconoIdx((i) => (i + 1) % ICONOS_PROCESANDO.length);
    }, 800);
    const salida = setTimeout(() => {
      if (!perfil) {
        router.push("/onboarding");
        return;
      }
      const resultado = calcularResultadoTmaid(respuestas, perfil, miedos);
      guardarResultadoTmaid(resultado);
      const gano = otorgarBadge("diagnostico-completo");
      if (gano) setBadgeGanado(BADGES["diagnostico-completo"]);
      setTimeout(() => router.push("/tmaid/resultado"), gano ? 900 : 0);
    }, 3500);
    return () => {
      clearInterval(rotacion);
      clearTimeout(salida);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paso]);

  if (cargando) return <CargandoPantalla oscuro />;
  if (!perfil || !perfilCompleto(perfil)) return null;

  const esIntro = paso === "intro";
  const esProcesando = paso === "procesando";
  const idx = typeof paso === "number" ? paso : 0;
  const esPreguntaAbierta = typeof paso === "number" && paso === TOTAL_LIKERT;
  const pregunta = typeof paso === "number" && !esPreguntaAbierta ? PREGUNTAS_LIKERT[idx] : null;

  const puedeContinuar = esPreguntaAbierta
    ? true
    : pregunta
    ? respuestas[pregunta.id] !== undefined
    : false;

  function seleccionar(valor: number) {
    if (!pregunta) return;
    setRespuestas((r) => ({ ...r, [pregunta.id]: valor }));
  }

  function siguiente() {
    if (esIntro) {
      setPaso(0);
      return;
    }
    if (!puedeContinuar) return;
    if (esPreguntaAbierta) {
      setPaso("procesando");
      return;
    }
    setPaso(idx + 1);
  }

  function atras() {
    if (typeof paso !== "number") return;
    if (paso === 0) {
      setPaso("intro");
      return;
    }
    setPaso(paso - 1);
  }

  // SCREEN 9: INTRO
  if (esIntro) {
    return (
      <DarkScreen>
        <section className="relative z-10 max-w-2xl px-margin-mobile text-center">
          <div className="relative mx-auto mb-8 flex h-24 w-24 items-center justify-center">
            <div className="absolute inset-0 animate-pulse rounded-full bg-secondary-container/30 blur-xl" />
            <Icon name="radar" filled className="text-[64px] text-tertiary-fixed-dim" />
          </div>
          <h1 className="font-headline mb-6 text-3xl font-black text-white sm:text-4xl">
            Tu Diagnóstico Docente IA
          </h1>
          <div className="mb-6 flex flex-col items-center gap-3">
            {ORDEN_DIMENSIONES.map((dim) => {
              const visual = DIMENSION_VISUAL[dim];
              return (
                <div
                  key={dim}
                  className="atmospheric-shadow flex w-full max-w-xs items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 backdrop-blur-sm"
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${visual.badgeClass}`}
                  >
                    <Icon name={visual.icon} filled className={`text-[18px] ${visual.iconClass}`} />
                  </span>
                  <span className="font-label text-xs font-bold uppercase tracking-wide text-white">
                    {ETIQUETA_DIMENSION[dim]}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="mx-auto mb-12 max-w-md text-sm leading-relaxed text-white/60">
            Estas 4 dimensiones son el modelo TMAID (Test de Madurez IA Docente) de Learn5: miden qué sabes, qué tanto lo usas, qué tanto lo integras a tu enseñanza y qué tan abierto estás a seguir aprendiendo.
          </p>
          <button
            onClick={siguiente}
            className="group btn-gold-glow px-8 py-4 text-lg"
          >
            Comenzar Diagnóstico
            <Icon name="arrow_forward" className="transition-transform group-hover:translate-x-1" />
          </button>
        </section>
      </DarkScreen>
    );
  }

  // SCREEN 12: PROCESSING
  if (esProcesando) {
    return (
      <DarkScreen>
        <div className="relative z-10 mb-12 h-48 w-48">
          <div className="absolute inset-0 rounded-full border-4 border-white/10" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-b-transparent border-l-transparent border-r-secondary border-t-tertiary" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon
              name={ICONOS_PROCESANDO[iconoIdx]}
              filled
              className="text-4xl text-on-secondary"
            />
          </div>
        </div>
        <div className="relative z-10 text-center">
          <h3 className="font-headline mb-4 text-xl font-bold text-white">Procesando tu perfil...</h3>
          <p className="animate-pulse text-base text-white/60">
            Nuestra IA está analizando tus respuestas para generar tu ruta personalizada.
          </p>
        </div>
      </DarkScreen>
    );
  }

  // SCREEN 11: OPEN QUESTION
  if (esPreguntaAbierta) {
    return (
      <div className="min-h-screen bg-surface pb-12 pt-24">
        <BadgeUnlockToast badge={badgeGanado} onClose={() => setBadgeGanado(null)} />
        <HeaderProgreso dimensionLabel="Integración Curricular" paso={TOTAL_PASOS} total={TOTAL_PASOS} />
        <div className="mx-auto flex w-full max-w-3xl flex-col px-margin-mobile">
          <h2 className="font-headline mb-8 text-2xl font-bold text-primary">
            {PREGUNTA_ABIERTA.texto}
          </h2>
          <div className="relative">
            <textarea
              value={miedos}
              onChange={(e) => setMiedos(e.target.value.slice(0, 500))}
              maxLength={500}
              placeholder={PREGUNTA_ABIERTA.placeholder}
              className="atmospheric-shadow h-64 w-full rounded-xl border-none bg-white/40 p-8 text-lg backdrop-blur-md transition-all placeholder:text-outline focus:bg-white/60 focus:ring-2 focus:ring-secondary/20"
            />
            <div className="font-label absolute bottom-6 right-8 text-sm font-bold text-tertiary">
              {miedos.length} / 500
            </div>
          </div>
          <div className="mt-12 flex justify-between">
            <button onClick={atras} className="rounded-full px-5 py-2 text-sm font-semibold text-on-surface-variant">
              Atrás
            </button>
            <button
              onClick={siguiente}
              className="font-label inline-flex items-center gap-4 rounded-full bg-primary px-10 py-4 text-base font-bold text-on-primary transition-all hover:bg-on-primary-fixed-variant"
            >
              Finalizar Diagnóstico
              <Icon name="auto_awesome" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // SCREEN 10: LIKERT QUESTION
  return (
    <div className="min-h-screen bg-surface pb-12 pt-24">
      <BadgeUnlockToast badge={badgeGanado} onClose={() => setBadgeGanado(null)} />
      <HeaderProgreso
        dimensionLabel={pregunta ? ETIQUETA_DIMENSION[pregunta.dimension] : ""}
        paso={idx + 1}
        total={TOTAL_PASOS}
      />
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center px-margin-mobile">
        {pregunta?.ejemplo && (
          <span className="mb-4 inline-flex items-center gap-1 rounded-full bg-tertiary-fixed px-3 py-1 text-[11px] font-black uppercase tracking-widest text-on-tertiary-fixed">
            <Icon name="auto_stories" className="text-[14px]" /> Escenario
          </span>
        )}
        <h2 className="font-headline mb-16 px-4 text-center text-2xl font-bold text-primary">
          {pregunta?.texto}
        </h2>
        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-5">
          {ESCALA_LIKERT.map((opcion) => {
            const selected = pregunta ? respuestas[pregunta.id] === opcion.valor : false;
            return (
              <button
                key={opcion.valor}
                onClick={() => seleccionar(opcion.valor)}
                className={`atmospheric-shadow group flex flex-col items-center gap-4 rounded-xl border-2 p-6 text-center transition-all active:scale-95 ${
                  selected ? "border-secondary bg-secondary-fixed" : "border-transparent bg-white hover:bg-secondary-fixed"
                }`}
              >
                <span className="text-sm text-on-surface-variant">{opcion.etiqueta}</span>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${
                    selected ? "border-secondary" : "border-outline-variant group-hover:border-secondary"
                  }`}
                >
                  <div
                    className={`h-4 w-4 rounded-full transition-colors ${
                      selected ? "bg-secondary" : "bg-transparent group-hover:bg-secondary"
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>
        <div className="mt-12 flex w-full justify-between">
          <button onClick={atras} className="rounded-full px-5 py-2 text-sm font-semibold text-on-surface-variant">
            Atrás
          </button>
          <button
            onClick={siguiente}
            disabled={!puedeContinuar}
            className="btn-primary disabled:opacity-40"
          >
            Continuar →
          </button>
        </div>
      </div>
    </div>
  );
}

function HeaderProgreso({
  dimensionLabel,
  paso,
  total,
}: {
  dimensionLabel: string;
  paso: number;
  total: number;
}) {
  return (
    <header className="glass-card fixed left-0 top-0 z-50 flex w-full flex-col gap-2 px-margin-mobile py-4">
      <div className="font-label flex items-center justify-between text-xs font-bold text-on-surface-variant">
        <span>
          DIMENSIÓN:{" "}
          <span className="font-bold uppercase tracking-wider text-tertiary">
            {dimensionLabel}
          </span>
        </span>
        <span>
          {paso} / {total}
        </span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-surface-container-highest">
        <div
          className="h-full rounded-full bg-tertiary-container transition-all duration-700"
          style={{ width: `${(paso / total) * 100}%` }}
        />
      </div>
    </header>
  );
}
