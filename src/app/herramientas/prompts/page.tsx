"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, perfilCompleto } from "@/lib/store/session";
import { PROMPTS } from "@/lib/herramientas/prompts";
import { AppShell } from "@/components/AppShell";
import { BadgeUnlockToast } from "@/components/BadgeUnlockToast";
import { BADGES } from "@/lib/gamification/badges";
import { Icon } from "@/components/Icon";
import { CargandoPantalla } from "@/components/CargandoPantalla";
import { useIdioma } from "@/lib/i18n";

/**
 * Banco de Prompts -- base literal: code.html real de Stitch
 * (banco_de_prompts_para_el_aula). Búsqueda + chips de categoría son
 * funcionales de verdad (filtran el catálogo real en src/lib/herramientas
 * /prompts.ts). "Guardados" persiste en localStorage -- no es decorativo.
 * Fase i18n: los favoritos se siguen indexando por titulo.es (clave
 * canónica) para no perder los ya guardados; las categorías se filtran
 * por su clave canónica en español y se traducen solo al mostrar.
 *
 * Bug real reportado (feedback de un docente probando el prototipo,
 * 2026-07-23, vía WhatsApp): "no pudo usar el Banco de Prompts". Causa
 * raíz: "Usar en clase" dependía por completo de
 * `navigator.clipboard.writeText()`, sin fallback. Ahora: (1) se intenta
 * la Clipboard API si existe, (2) si falla o no existe, se usa un
 * fallback con document.execCommand("copy"), (3) si ambos fallan, el
 * prompt se expande automáticamente para que el docente pueda
 * seleccionarlo y copiarlo a mano, con un aviso explícito.
 */

const FAVORITOS_KEY = "professor-ai:prompts-guardados";

async function copiarAlPortapapeles(texto: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(texto);
      return true;
    } catch {
      // sigue al fallback de abajo
    }
  }
  try {
    const textarea = document.createElement("textarea");
    textarea.value = texto;
    textarea.style.position = "fixed";
    textarea.style.top = "-1000px";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const exito = document.execCommand("copy");
    document.body.removeChild(textarea);
    return exito;
  } catch {
    return false;
  }
}

export default function BancoPromptsPage() {
  const router = useRouter();
  const { perfil, otorgarBadge, cargando } = useSession();
  const { idioma, t } = useIdioma();
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState<string>("Todos");
  const [expandidoIdx, setExpandidoIdx] = useState<number | null>(null);
  const [copiadoIdx, setCopiadoIdx] = useState<number | null>(null);
  const [errorCopiadoIdx, setErrorCopiadoIdx] = useState<number | null>(null);
  const [guardados, setGuardados] = useState<string[]>([]);
  const [hidratado, setHidratado] = useState(false);
  const [badgeGanado, setBadgeGanado] = useState<null | (typeof BADGES)[string]>(
    null
  );

  useEffect(() => {
    if (cargando) return;
    if (!perfil) router.replace("/login");
    else if (!perfilCompleto(perfil)) router.replace("/onboarding");
  }, [cargando, perfil, router]);

  useEffect(() => {
    const raw = window.localStorage.getItem(FAVORITOS_KEY);
    if (raw) {
      try {
        setGuardados(JSON.parse(raw));
      } catch {
        // ignorar localStorage corrupto
      }
    }
    setHidratado(true);
  }, []);

  useEffect(() => {
    if (hidratado) {
      window.localStorage.setItem(FAVORITOS_KEY, JSON.stringify(guardados));
    }
  }, [guardados, hidratado]);

  const categoriaLabel: Record<string, string> = useMemo(
    () => ({
      Todos: t.herramientas.todos,
      Guardados: t.herramientas.guardadosCat,
      Planeación: t.herramientas.categoriaPlaneacion,
      Diferenciación: t.herramientas.categoriaDiferenciacion,
      Evaluación: t.herramientas.categoriaEvaluacion,
      Comunicación: t.herramientas.categoriaComunicacion,
    }),
    [t]
  );

  const categorias = useMemo(
    () => ["Todos", ...Array.from(new Set(PROMPTS.map((p) => p.categoria))), "Guardados"],
    []
  );

  const visibles = PROMPTS.filter((p) => {
    const coincideTexto =
      busqueda.trim() === "" ||
      p.titulo[idioma].toLowerCase().includes(busqueda.toLowerCase()) ||
      p.paraQueSirve[idioma].toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria =
      categoria === "Todos" ||
      (categoria === "Guardados" ? guardados.includes(p.titulo.es) : p.categoria === categoria);
    return coincideTexto && coincideCategoria;
  });

  if (cargando) return <CargandoPantalla />;
  if (!perfil || !perfilCompleto(perfil)) return null;

  async function usarEnClase(texto: string, idx: number) {
    const copiado = await copiarAlPortapapeles(texto);
    if (copiado) {
      setErrorCopiadoIdx(null);
      setCopiadoIdx(idx);
      setTimeout(() => setCopiadoIdx((cur) => (cur === idx ? null : cur)), 1500);
      if (otorgarBadge("primer-prompt")) {
        setBadgeGanado(BADGES["primer-prompt"]);
      }
      return;
    }
    // No se pudo copiar automáticamente (Clipboard API bloqueada o
    // ausente). En vez de fallar en silencio, mostramos el prompt
    // expandido y avisamos para que el docente pueda copiarlo a mano.
    setCopiadoIdx(null);
    setExpandidoIdx(idx);
    setErrorCopiadoIdx(idx);
    setTimeout(() => setErrorCopiadoIdx((cur) => (cur === idx ? null : cur)), 5000);
  }

  function toggleGuardado(tituloEs: string) {
    setGuardados((prev) =>
      prev.includes(tituloEs) ? prev.filter((x) => x !== tituloEs) : [...prev, tituloEs]
    );
  }

  return (
    <AppShell titulo={t.herramientas.bancoTitulo}>
      <BadgeUnlockToast badge={badgeGanado} onClose={() => setBadgeGanado(null)} />
      <div className="mx-auto max-w-5xl space-y-gap-lg">
        <Link
          href="/herramientas"
          className="text-sm mb-4 inline-flex items-center gap-1 font-bold text-on-primary-fixed"
        >
          <Icon name="arrow_back" /> {t.comun.herramientas}
        </Link>

        <div>
          <h1 className="font-headline text-3xl sm:text-4xl mb-2">
            {t.herramientas.bancoTitulo}
          </h1>
          <p className="text-lg max-w-2xl text-on-surface-variant">
            {t.herramientas.bancoSub}
          </p>
        </div>

        <div className="sticky top-20 z-30 space-y-gap-md bg-surface/80 py-2 backdrop-blur-sm">
          <div className="group relative">
            <Icon
              name="search"
              className="absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant"
            />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder={t.herramientas.buscarPlaceholder}
              type="text"
              className="atmospheric-shadow h-16 w-full rounded-xl border-none bg-white pl-14 pr-6 outline-none transition-all focus:ring-2 focus:ring-secondary/20"
            />
          </div>

          <div className="no-scrollbar -mx-2 flex items-center gap-md overflow-x-auto px-2 py-2">
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoria(cat)}
                className={`whitespace-nowrap rounded-full px-6 py-3 text-sm font-bold transition-all active:scale-95 ${
                  categoria === cat
                    ? "bg-primary text-on-primary shadow-lg shadow-primary/10"
                    : "atmospheric-shadow bg-white text-on-surface-variant hover:bg-surface-container-low"
                }`}
              >
                {categoriaLabel[cat] ?? cat}
              </button>
            ))}
          </div>
        </div>

        {visibles.length === 0 && (
          <p className="py-12 text-center text-on-surface-variant">
            {t.herramientas.sinResultados}
          </p>
        )}

        <div className="grid grid-cols-1 gap-gap-lg md:grid-cols-2 lg:grid-cols-3">
          {visibles.map((p) => {
            const idx = PROMPTS.indexOf(p);
            const guardado = guardados.includes(p.titulo.es);
            const expandido = expandidoIdx === idx;
            const conError = errorCopiadoIdx === idx;
            return (
              <div
                key={p.titulo.es}
                className="atmospheric-shadow flex h-full flex-col rounded-xl bg-white/70 p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="mb-6 flex items-start justify-between">
                  <span className="text-[12px] font-bold uppercase tracking-wider text-on-tertiary-fixed-variant">
                    <span className="rounded-full bg-tertiary-fixed px-3 py-1">
                      {categoriaLabel[p.categoria] ?? p.categoria}
                    </span>
                  </span>
                  <button
                    onClick={() => toggleGuardado(p.titulo.es)}
                    title={guardado ? t.herramientas.quitarGuardados : t.herramientas.guardarPrompt}
                    className="text-outline transition-colors hover:text-secondary"
                  >
                    <Icon name="bookmark" filled={guardado} />
                  </button>
                </div>
                <h3 className="font-headline text-lg font-bold mb-4 text-[20px] leading-tight">
                  {p.titulo[idioma]}
                </h3>
                <p className="text-base mb-4 flex-grow text-on-surface-variant">
                  {p.paraQueSirve[idioma]}
                </p>
                {expandido && (
                  <p className="text-sm mb-2 select-all rounded-lg bg-surface-container-low p-3 font-mono text-on-surface">
                    {p.prompt[idioma]}
                  </p>
                )}
                {conError && (
                  <p className="text-sm mb-2 rounded-lg bg-error-container/20 p-3 text-error">
                    {t.herramientas.errorCopiado}
                  </p>
                )}
                <button
                  onClick={() => setExpandidoIdx(expandido ? null : idx)}
                  className="mb-4 self-start text-sm font-semibold text-secondary hover:underline"
                >
                  {expandido ? t.herramientas.ocultarPrompt : t.herramientas.verPrompt}
                </button>
                <div className="mt-auto flex items-center gap-md">
                  <button
                    onClick={() => usarEnClase(p.prompt[idioma], idx)}
                    className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-primary text-on-primary transition-opacity hover:opacity-90 active:scale-95"
                  >
                    <Icon name={copiadoIdx === idx ? "check" : "bolt"} className="text-[20px]" />
                    {copiadoIdx === idx ? t.herramientas.copiado : t.herramientas.usarEnClase}
                  </button>
                  <button
                    onClick={() => usarEnClase(p.prompt[idioma], idx)}
                    title={t.herramientas.copiarPrompt}
                    className="atmospheric-shadow flex h-12 w-12 items-center justify-center rounded-full border border-outline-variant text-on-surface-variant transition-colors hover:bg-surface-container active:scale-95"
                  >
                    <Icon name={copiadoIdx === idx ? "check" : "content_copy"} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
