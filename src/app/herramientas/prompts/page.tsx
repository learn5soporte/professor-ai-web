"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/store/session";
import { PROMPTS } from "@/lib/herramientas/prompts";
import { AppShell } from "@/components/AppShell";
import { BadgeUnlockToast } from "@/components/BadgeUnlockToast";
import { BADGES } from "@/lib/gamification/badges";
import { Icon } from "@/components/Icon";

/**
 * Banco de Prompts -- base literal: code.html real de Stitch
 * (banco_de_prompts_para_el_aula). Búsqueda + chips de categoría son
 * funcionales de verdad (filtran el catálogo real en src/lib/herramientas
 * /prompts.ts). "Guardados" persiste en localStorage -- no es decorativo.
 */

const FAVORITOS_KEY = "professor-ai:prompts-guardados";

export default function BancoPromptsPage() {
  const router = useRouter();
  const { perfil, otorgarBadge, cargando } = useSession();
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState<string>("Todos");
  const [expandidoIdx, setExpandidoIdx] = useState<number | null>(null);
  const [copiadoIdx, setCopiadoIdx] = useState<number | null>(null);
  const [guardados, setGuardados] = useState<string[]>([]);
  const [hidratado, setHidratado] = useState(false);
  const [badgeGanado, setBadgeGanado] = useState<null | (typeof BADGES)[string]>(
    null
  );

  useEffect(() => {
    if (cargando) return;
    if (!perfil) router.replace("/login");
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

  const categorias = useMemo(
    () => ["Todos", ...Array.from(new Set(PROMPTS.map((p) => p.categoria))), "Guardados"],
    []
  );

  const visibles = PROMPTS.filter((p) => {
    const coincideTexto =
      busqueda.trim() === "" ||
      p.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.paraQueSirve.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria =
      categoria === "Todos" ||
      (categoria === "Guardados" ? guardados.includes(p.titulo) : p.categoria === categoria);
    return coincideTexto && coincideCategoria;
  });

  if (cargando || !perfil) return null;

  async function usarEnClase(texto: string, idx: number) {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiadoIdx(idx);
      setTimeout(() => setCopiadoIdx((cur) => (cur === idx ? null : cur)), 1500);
      if (otorgarBadge("primer-prompt")) {
        setBadgeGanado(BADGES["primer-prompt"]);
      }
    } catch {
      // Si el navegador bloquea el portapapeles, no rompemos la UI.
    }
  }

  function toggleGuardado(titulo: string) {
    setGuardados((prev) =>
      prev.includes(titulo) ? prev.filter((t) => t !== titulo) : [...prev, titulo]
    );
  }

  return (
    <AppShell titulo="Banco de Prompts">
      <BadgeUnlockToast badge={badgeGanado} onClose={() => setBadgeGanado(null)} />
      <div className="mx-auto max-w-5xl space-y-gap-lg">
        <div>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-2">
            Banco de Prompts
          </h1>
          <p className="text-body-lg max-w-2xl text-on-surface-variant">
            Explora y utiliza prompts pedagógicos listos para copiar y pegar en tu
            asistente de IA favorito.
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
              placeholder="Buscar estrategias, evaluaciones o planificación..."
              type="text"
              className="atmospheric-shadow h-16 w-full rounded-xl border-none bg-white pl-14 pr-6 outline-none transition-all focus:ring-2 focus:ring-secondary/20"
            />
          </div>

          <div className="no-scrollbar -mx-2 flex items-center gap-md overflow-x-auto px-2 py-2">
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoria(cat)}
                className={`text-label-lg whitespace-nowrap rounded-full px-6 py-3 font-bold transition-all active:scale-95 ${
                  categoria === cat
                    ? "bg-primary text-on-primary shadow-lg shadow-primary/10"
                    : "atmospheric-shadow bg-white text-on-surface-variant hover:bg-surface-container-low"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {visibles.length === 0 && (
          <p className="py-12 text-center text-on-surface-variant">
            No encontramos prompts que coincidan. Prueba otra búsqueda o categoría.
          </p>
        )}

        <div className="grid grid-cols-1 gap-gap-lg md:grid-cols-2 lg:grid-cols-3">
          {visibles.map((p) => {
            const idx = PROMPTS.indexOf(p);
            const guardado = guardados.includes(p.titulo);
            const expandido = expandidoIdx === idx;
            return (
              <div
                key={p.titulo}
                className="atmospheric-shadow flex h-full flex-col rounded-xl bg-white/70 p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="mb-6 flex items-start justify-between">
                  <span className="text-[12px] font-bold uppercase tracking-wider text-on-tertiary-fixed-variant">
                    <span className="rounded-full bg-tertiary-fixed px-3 py-1">
                      {p.categoria}
                    </span>
                  </span>
                  <button
                    onClick={() => toggleGuardado(p.titulo)}
                    title={guardado ? "Quitar de guardados" : "Guardar"}
                    className="text-outline transition-colors hover:text-secondary"
                  >
                    <Icon name="bookmark" filled={guardado} />
                  </button>
                </div>
                <h3 className="font-headline-md mb-4 text-[20px] leading-tight">
                  {p.titulo}
                </h3>
                <p className="text-body-md mb-4 flex-grow text-on-surface-variant">
                  {p.paraQueSirve}
                </p>
                {expandido && (
                  <p className="text-body-sm mb-4 rounded-lg bg-surface-container-low p-3 font-mono text-on-surface">
                    {p.prompt}
                  </p>
                )}
                <button
                  onClick={() => setExpandidoIdx(expandido ? null : idx)}
                  className="mb-4 self-start text-sm font-semibold text-secondary hover:underline"
                >
                  {expandido ? "Ocultar prompt" : "Ver prompt completo"}
                </button>
                <div className="mt-auto flex items-center gap-md">
                  <button
                    onClick={() => usarEnClase(p.prompt, idx)}
                    className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-primary text-on-primary transition-opacity hover:opacity-90 active:scale-95"
                  >
                    <Icon name={copiadoIdx === idx ? "check" : "bolt"} className="text-[20px]" />
                    {copiadoIdx === idx ? "Copiado" : "Usar en clase"}
                  </button>
                  <button
                    onClick={() => usarEnClase(p.prompt, idx)}
                    title="Copiar prompt"
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
