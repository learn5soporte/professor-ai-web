"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lightbulb } from "lucide-react";
import { useSession, type PerfilDocente } from "@/lib/store/session";
import { AppShell } from "@/components/AppShell";
import { BadgeUnlockToast } from "@/components/BadgeUnlockToast";
import { BADGES } from "@/lib/gamification/badges";

const NIVELES = ["Primaria", "Secundaria", "Universidad", "Formación corporativa"];
const USO_PREVIO = ["Nunca", "Algo", "Regularmente"];

const STEPS = [
  "nivelEducativo",
  "materia",
  "pais",
  "usoPrevioIA",
  "mayorDesafio",
] as const;

const CONTEXTO: Record<(typeof STEPS)[number], string> = {
  nivelEducativo:
    "Usamos esto para ajustar el lenguaje y la complejidad de todo lo que te mostremos después — no es lo mismo IA para primaria que para universidad.",
  materia:
    "Cada herramienta y ejemplo que generemos parte de tu disciplina, para que nunca tengas que \"traducir\" contenido genérico a tu materia.",
  pais:
    "Nos ayuda a considerar el contexto educativo local (currículo, idioma, recursos disponibles) al sugerirte actividades.",
  usoPrevioIA:
    "Así calibramos tu diagnóstico TMAID: si ya tienes experiencia, no te haremos empezar de cero.",
  mayorDesafio:
    "Tu ruta personalizada se ancla a este desafío — cada reto que te propongamos apunta a resolverlo.",
};

export default function OnboardingPage() {
  const router = useRouter();
  const { perfil, guardarPerfil, otorgarBadge, cargando } = useSession();
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
  });

  useEffect(() => {
    if (cargando) return;
    if (!perfil) router.replace("/login");
  }, [cargando, perfil, router]);

  const key = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const canContinue = form[key].trim().length > 0;

  function next() {
    if (!canContinue) return;
    if (isLast) {
      guardarPerfil({ nombre: perfil?.nombre ?? "Docente", ...form });
      const gano = otorgarBadge("primeros-pasos");
      if (gano) setBadgeGanado(BADGES["primeros-pasos"]);
      setTimeout(() => router.push("/tmaid"), gano ? 1200 : 0);
      return;
    }
    setStep((s) => s + 1);
  }

  function back() {
    if (step === 0) return;
    setStep((s) => s - 1);
  }

  if (cargando || !perfil) return null;

  return (
    <AppShell titulo="Onboarding">
      <BadgeUnlockToast badge={badgeGanado} onClose={() => setBadgeGanado(null)} />
      <div className="mx-auto flex max-w-3xl flex-col gap-6 lg:flex-row lg:items-start">
        <div className="card w-full lg:max-w-lg">
          <div className="mb-6 flex items-center justify-between">
            <p className="font-label text-xs font-bold uppercase tracking-widest text-secondary">
              Paso {step + 1} de {STEPS.length}
            </p>
            <div className="flex gap-1">
              {STEPS.map((s, i) => (
                <span
                  key={s}
                  className={`h-1.5 w-6 rounded-full ${
                    i <= step ? "bg-primary" : "bg-surface-container-highest"
                  }`}
                />
              ))}
            </div>
          </div>

          {key === "nivelEducativo" && (
            <StepPregunta titulo="¿En qué nivel enseñas?">
              <div className="grid grid-cols-2 gap-3">
                {NIVELES.map((nivel) => (
                  <OpcionBoton
                    key={nivel}
                    activo={form.nivelEducativo === nivel}
                    onClick={() =>
                      setForm((f) => ({ ...f, nivelEducativo: nivel }))
                    }
                  >
                    {nivel}
                  </OpcionBoton>
                ))}
              </div>
            </StepPregunta>
          )}

          {key === "materia" && (
            <StepPregunta titulo="¿Cuál es tu materia o área principal?">
              <CampoTexto
                placeholder="Ej. Matemáticas, Historia, Biología..."
                value={form.materia}
                onChange={(v) => setForm((f) => ({ ...f, materia: v }))}
              />
            </StepPregunta>
          )}

          {key === "pais" && (
            <StepPregunta titulo="¿En qué país/región trabajas?">
              <CampoTexto
                placeholder="Ej. Colombia, México, Florida (EE.UU.)..."
                value={form.pais}
                onChange={(v) => setForm((f) => ({ ...f, pais: v }))}
              />
            </StepPregunta>
          )}

          {key === "usoPrevioIA" && (
            <StepPregunta titulo="¿Has usado IA antes en tu trabajo docente?">
              <div className="flex flex-col gap-3">
                {USO_PREVIO.map((uso) => (
                  <OpcionBoton
                    key={uso}
                    activo={form.usoPrevioIA === uso}
                    onClick={() =>
                      setForm((f) => ({ ...f, usoPrevioIA: uso }))
                    }
                  >
                    {uso}
                  </OpcionBoton>
                ))}
              </div>
            </StepPregunta>
          )}

          {key === "mayorDesafio" && (
            <StepPregunta titulo="¿Cuál es tu mayor desafío hoy en el aula?">
              <CampoTexto
                placeholder="Ej. Motivar a estudiantes desconectados, falta de tiempo..."
                value={form.mayorDesafio}
                onChange={(v) => setForm((f) => ({ ...f, mayorDesafio: v }))}
              />
            </StepPregunta>
          )}

          <div className="mt-8 flex justify-between">
            <button
              onClick={back}
              disabled={step === 0}
              className="rounded-full px-5 py-2 text-sm font-semibold text-on-surface-variant disabled:opacity-0"
            >
              Atrás
            </button>
            <button
              onClick={next}
              disabled={!canContinue}
              className="btn-primary disabled:opacity-40"
            >
              {isLast ? "Ir al diagnóstico →" : "Continuar →"}
            </button>
          </div>
        </div>

        <div className="w-full rounded-xl bg-secondary-fixed p-5 lg:max-w-xs">
          <div className="flex items-center gap-2 text-on-secondary-fixed">
            <Lightbulb size={18} />
            <p className="font-label text-xs font-bold uppercase tracking-widest">
              Por qué preguntamos esto
            </p>
          </div>
          <p className="mt-2 text-sm text-on-secondary-fixed">{CONTEXTO[key]}</p>
        </div>
      </div>
    </AppShell>
  );
}

function StepPregunta({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1 className="mb-5 text-2xl font-black text-on-surface">{titulo}</h1>
      {children}
    </div>
  );
}

function OpcionBoton({
  activo,
  onClick,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-4 py-3 text-left text-sm font-semibold transition-colors ${
        activo
          ? "bg-primary text-on-primary"
          : "bg-surface-container-low text-on-surface hover:bg-surface-container"
      }`}
    >
      {children}
    </button>
  );
}

function CampoTexto({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <input
      autoFocus
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg bg-surface-container-low px-4 py-3 text-on-surface outline-none ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary"
    />
  );
}
