"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, type PerfilDocente } from "@/lib/store/session";

const NIVELES = ["Primaria", "Secundaria", "Universidad", "Formación corporativa"];
const USO_PREVIO = ["Nunca", "Algo", "Regularmente"];

const STEPS = [
  "nivelEducativo",
  "materia",
  "pais",
  "usoPrevioIA",
  "mayorDesafio",
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const { perfil, guardarPerfil } = useSession();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Omit<PerfilDocente, "nombre">>({
    nivelEducativo: perfil?.nivelEducativo ?? "",
    materia: perfil?.materia ?? "",
    pais: perfil?.pais ?? "",
    usoPrevioIA: perfil?.usoPrevioIA ?? "",
    mayorDesafio: perfil?.mayorDesafio ?? "",
  });

  const key = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const canContinue = form[key].trim().length > 0;

  function next() {
    if (!canContinue) return;
    if (isLast) {
      guardarPerfil({ nombre: perfil?.nombre ?? "Docente", ...form });
      router.push("/tmaid");
      return;
    }
    setStep((s) => s + 1);
  }

  function back() {
    if (step === 0) return;
    setStep((s) => s - 1);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-6">
      <div className="card w-full max-w-lg">
        <div className="mb-6 flex items-center justify-between">
          <p className="font-label text-xs font-bold uppercase tracking-widest text-secondary">
            Onboarding · Paso {step + 1} de {STEPS.length}
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
                  onClick={() => setForm((f) => ({ ...f, nivelEducativo: nivel }))}
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
                  onClick={() => setForm((f) => ({ ...f, usoPrevioIA: uso }))}
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
    </main>
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
