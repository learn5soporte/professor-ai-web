"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, type PerfilDocente } from "@/lib/store/session";
import { BadgeUnlockToast } from "@/components/BadgeUnlockToast";
import { BADGES } from "@/lib/gamification/badges";
import { DarkScreen } from "@/components/DarkScreen";
import { Icon } from "@/components/Icon";
import { CargandoPantalla } from "@/components/CargandoPantalla";
import { useIdioma } from "@/lib/i18n";
import { localizarValorPerfil } from "@/lib/i18n/valores";

/**
 * Onboarding (4 pasos) + transicion "Analizando tu perfil" -- base literal:
 * code.html real de Stitch (bloque_1_y_2_acceso_y_onboarding, screens
 * onboarding-1..4 y screen-analysis).
 *
 * Fase i18n: los VALORES que se guardan en el perfil (nivelEducativo,
 * materia, usoPrevioIA, mayorDesafio, objetivoPrincipal) se mantienen en
 * español como clave canónica; solo la etiqueta visible se traduce con
 * localizarValorPerfil() según el idioma activo (ver lib/i18n/valores.ts).
 */

/**
 * Taxonomia completa de niveles de ensenanza (jul 2026): el negocio es
 * B2B y B2C, asi que el onboarding debe mostrar todo el alcance real del
 * producto (6 niveles), no solo los que estan activos para este demo/
 * piloto. Secundaria y Educacion Superior son los unicos "activo: true"
 * -- los otros 4 se muestran con la etiqueta "Proximamente" y no son
 * seleccionables, para que el docente vea el panorama completo sin que
 * parezca un gate de pago (por eso "Proximamente" y no "Modo Pro": no hay
 * un tier pago real todavia). Ver memoria del proyecto para el detalle
 * de esta decision.
 */
const NIVELES: { valor: string; icono: string; activo: boolean }[] = [
  { valor: "Educación Inicial", icono: "child_care", activo: false },
  { valor: "Primaria", icono: "auto_stories", activo: false },
  { valor: "Secundaria", icono: "school", activo: true },
  { valor: "Educación Superior", icono: "account_balance", activo: true },
  { valor: "Formación Corporativa", icono: "business", activo: false },
  { valor: "Independiente / Cursos propios", icono: "person", activo: false },
];

const MATERIAS_SUGERIDAS = [
  "Matemáticas",
  "Historia",
  "Lengua y Literatura",
  "Física",
  "Arte",
  "Programación",
];

const RELACION_IA: { valor: string; icono: string; descKey: "relacionExploradorDesc" | "relacionCuriosoDesc" | "relacionAplicadorDesc" }[] = [
  { valor: "Explorador", icono: "explore", descKey: "relacionExploradorDesc" },
  { valor: "Curioso", icono: "psychology", descKey: "relacionCuriosoDesc" },
  { valor: "Aplicador", icono: "rocket_launch", descKey: "relacionAplicadorDesc" },
];

const DESAFIOS = ["Falta de tiempo", "Engagement alumnos", "Evaluación rápida"];

const OBJETIVOS = [
  { valor: "Ahorrar tiempo", icono: "timer" },
  { valor: "Aprender IA", icono: "auto_awesome" },
  { valor: "Evaluar mejor", icono: "grading" },
  { valor: "Ser referente", icono: "workspace_premium" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { perfil, guardarPerfil, otorgarBadge, cargando } = useSession();
  const { idioma, t } = useIdioma();
  const [step, setStep] = useState(0);
  const [badgeGanado, setBadgeGanado] = useState<null | (typeof BADGES)[string]>(
    null
  );
  const [form, setForm] = useState<Omit<PerfilDocente, "nombre">>({
    nivelEducativo: perfil?.nivelEducativo ?? "",
    materia: perfil?.materia ?? "",
    pais: perfil?.pais ?? "",
    usoPrevioIA: perfil?.usoPrevioIA ?? "",
    mayorDesafio: perfil?.mayorDesafio ?? "",
    objetivoPrincipal: perfil?.objetivoPrincipal ?? "",
  });
  const [mensajeIdx, setMensajeIdx] = useState(0);

  const mensajesAnalisis = [
    t.onboarding.analisis1,
    t.onboarding.analisis2,
    t.onboarding.analisis3,
    t.onboarding.analisis4,
    t.onboarding.analisis5,
  ];

  useEffect(() => {
    if (cargando) return;
    if (!perfil) router.replace("/login");
  }, [cargando, perfil, router]);

  // Paso 4 (analysis): rota mensajes y navega a /tmaid, tal como
  // startAnalysisRotation() en code.html.
  useEffect(() => {
    if (step !== 4) return;
    setMensajeIdx(0);
    const rotacion = setInterval(() => {
      setMensajeIdx((i) => Math.min(i + 1, mensajesAnalisis.length - 1));
    }, 900);
    const salida = setTimeout(() => {
      guardarPerfil({ nombre: perfil?.nombre ?? "Docente", ...form });
      const gano = otorgarBadge("primeros-pasos");
      if (gano) setBadgeGanado(BADGES["primeros-pasos"]);
      setTimeout(() => router.push("/tmaid"), gano ? 900 : 0);
    }, 4200);
    return () => {
      clearInterval(rotacion);
      clearTimeout(salida);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  if (cargando) return <CargandoPantalla oscuro />;
  if (!perfil) return null;

  const canContinue =
    (step === 0 && form.nivelEducativo.trim().length > 0) ||
    (step === 1 && form.materia.trim().length > 0) ||
    (step === 2 && form.usoPrevioIA.trim().length > 0) ||
    (step === 3 && form.objetivoPrincipal.trim().length > 0);

  function next() {
    if (step < 3 && !canContinue) return;
    setStep((s) => s + 1);
  }

  function back() {
    if (step === 0) return;
    setStep((s) => s - 1);
  }

  if (step === 4) {
    return (
      <DarkScreen>
        <section className="flex w-full max-w-xl flex-col items-center justify-center px-margin-mobile py-margin-page text-center">
          <div className="relative mb-12 h-48 w-48">
            <div className="pulse-ai absolute inset-0 rounded-full bg-secondary opacity-20 blur-3xl" />
            <div className="relative flex h-full w-full items-center justify-center rounded-full border-2 border-tertiary-fixed-dim/30">
              <div className="pulse-ai flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-tr from-secondary to-on-secondary-fixed">
                <span className="font-headline text-6xl font-black text-white">
                  P
                </span>
              </div>
            </div>
          </div>
          <div className="flex h-20 flex-col justify-center">
            <h2 className="font-headline animate-pulse text-2xl font-bold text-white">
              {mensajesAnalisis[mensajeIdx]}
            </h2>
          </div>
          <div className="mx-auto mt-8 h-1 w-full max-w-sm overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-tertiary-fixed-dim transition-all duration-500"
              style={{ width: `${((mensajeIdx + 1) / mensajesAnalisis.length) * 100}%` }}
            />
          </div>
          <p className="mt-8 text-sm font-bold uppercase tracking-[0.2em] text-white/40">
            {t.onboarding.motorActivo}
          </p>
        </section>
      </DarkScreen>
    );
  }

  return (
    <DarkScreen>
      <BadgeUnlockToast badge={badgeGanado} onClose={() => setBadgeGanado(null)} />
      <section className="w-full max-w-2xl px-margin-mobile py-margin-page">
        <div className="mb-12 flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full ${
                i < step ? "bg-tertiary-fixed-dim" : i === step ? "bg-secondary" : "bg-white/10"
              }`}
            />
          ))}
        </div>

        {step === 0 && (
          <>
            <h2 className="font-headline mb-8 text-3xl font-black sm:text-4xl">
              {t.onboarding.pasoNivel}
            </h2>
            <div className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-2">
              {NIVELES.map((n) => {
                const selected = form.nivelEducativo === n.valor;
                return (
                  <button
                    key={n.valor}
                    type="button"
                    disabled={!n.activo}
                    onClick={() => n.activo && setForm((f) => ({ ...f, nivelEducativo: n.valor }))}
                    className={`glass-card relative flex items-center gap-4 rounded-xl border p-6 text-left transition-all ${
                      !n.activo
                        ? "cursor-not-allowed border-white/5 opacity-50"
                        : selected
                        ? "border-tertiary-fixed-dim/50 bg-white/10"
                        : "border-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-surface-container-lowest/10">
                      <Icon name={n.icono} className="text-tertiary-fixed-dim" />
                    </div>
                    <span className="font-headline text-lg font-bold text-white">
                      {localizarValorPerfil(n.valor, idioma)}
                    </span>
                    {!n.activo && (
                      <span className="font-label absolute right-3 top-3 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/50">
                        {t.comun.proximamente}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h2 className="font-headline mb-4 text-3xl font-black sm:text-4xl">
              {t.onboarding.pasoMateria}
            </h2>
            <p className="mb-8 text-white/50">{t.onboarding.pasoMateriaSub}</p>
            <div className="glass-card mb-8 flex items-center rounded-xl p-4">
              <Icon name="search" className="mr-3 text-white/30" />
              <input
                type="text"
                value={form.materia}
                onChange={(e) => setForm((f) => ({ ...f, materia: e.target.value }))}
                placeholder={t.onboarding.materiaPlaceholder}
                className="flex-1 border-none bg-transparent text-white placeholder:text-white/20 focus:ring-0"
              />
            </div>
            <div className="mb-12 flex flex-wrap gap-3">
              {MATERIAS_SUGERIDAS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, materia: m }))}
                  className={`rounded-full border px-6 py-2 transition-colors ${
                    form.materia === m
                      ? "border-secondary bg-secondary text-white"
                      : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                  }`}
                >
                  {localizarValorPerfil(m, idioma)}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="font-headline mb-8 text-3xl font-black sm:text-4xl">
              {t.onboarding.pasoRelacion}
            </h2>
            <div className="mb-12 space-y-4">
              {RELACION_IA.map((r) => {
                const selected = form.usoPrevioIA === r.valor;
                return (
                  <button
                    key={r.valor}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, usoPrevioIA: r.valor }))}
                    className="glass-card flex w-full items-center justify-between rounded-2xl border border-white/5 p-6 text-left transition-all"
                  >
                    <div className="flex items-center gap-6">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-secondary/40 to-transparent">
                        <Icon name={r.icono} filled className="text-3xl" />
                      </div>
                      <div>
                        <h4 className="font-headline text-lg font-bold text-white">
                          {localizarValorPerfil(r.valor, idioma)}
                        </h4>
                        <p className="text-sm text-white/50">{t.onboarding[r.descKey]}</p>
                      </div>
                    </div>
                    <div
                      className={`h-6 w-6 rounded-full border-2 ${
                        selected ? "border-tertiary bg-tertiary" : "border-white/20"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <div className="mb-12">
              <h3 className="font-headline mb-4 text-lg font-bold">{t.onboarding.pasoDesafio}</h3>
              <div className="flex flex-wrap gap-2">
                {DESAFIOS.map((d) => {
                  const selected = form.mayorDesafio === d;
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, mayorDesafio: d }))}
                      className={`rounded-full border px-4 py-1 text-sm font-bold transition-colors ${
                        selected
                          ? "border-tertiary/30 bg-tertiary/20 text-tertiary-fixed-dim"
                          : "border-white/10 bg-white/5 text-white/40 hover:bg-white/10"
                      }`}
                    >
                      {localizarValorPerfil(d, idioma)}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="font-headline mb-8 text-center text-3xl font-black sm:text-4xl">
              {t.onboarding.pasoObjetivo}
            </h2>
            <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {OBJETIVOS.map((o) => {
                const selected = form.objetivoPrincipal === o.valor;
                return (
                  <button
                    key={o.valor}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, objetivoPrincipal: o.valor }))}
                    className={`glass-card flex flex-col items-center gap-4 rounded-3xl border-2 p-8 text-center transition-all hover:-translate-y-1 ${
                      selected ? "border-tertiary-fixed-dim bg-white/10 scale-[1.02]" : "border-transparent"
                    }`}
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary-container/20">
                      <Icon name={o.icono} filled className="text-4xl" />
                    </div>
                    <h4 className="font-headline text-lg font-bold text-white">
                      {localizarValorPerfil(o.valor, idioma)}
                    </h4>
                  </button>
                );
              })}
            </div>
          </>
        )}

        <div className="mt-8 flex justify-between">
          <button
            onClick={back}
            disabled={step === 0}
            className="rounded-full px-5 py-2 text-sm font-semibold text-white/50 disabled:opacity-0"
          >
            {t.comun.atras}
          </button>
          {step < 3 ? (
            <button
              onClick={next}
              disabled={!canContinue}
              className="flex items-center gap-2 rounded-full bg-secondary px-10 py-4 font-bold shadow-lg hover:shadow-secondary/20 disabled:opacity-40"
            >
              {t.comun.continuar} <Icon name="arrow_forward" />
            </button>
          ) : (
            <button
              onClick={next}
              disabled={!canContinue}
              className="btn-accent px-16 py-5 text-lg shadow-2xl shadow-secondary/40 hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
            >
              {t.onboarding.finalizar}
            </button>
          )}
        </div>
      </section>
    </DarkScreen>
  );
}
