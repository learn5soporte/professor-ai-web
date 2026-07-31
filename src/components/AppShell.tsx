"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, ClipboardList, Map, BarChart3, UserRound, Lock, LogOut, Flame, Star, Sparkles } from "lucide-react";
import { useSession } from "@/lib/store/session";
import { useIdioma } from "@/lib/i18n";
import type { Traducciones } from "@/lib/i18n/traducciones";
import { calcularNivel } from "@/lib/gamification/badges";
import { PremiumUpgradeModal } from "@/components/PremiumUpgradeModal";
import { LanguageToggle } from "@/components/LanguageToggle";

type Tab = {
  href: string;
  labelKey: keyof Traducciones["shell"];
  icon: typeof Home;
  requiereTmaid: boolean;
};

const TABS: Tab[] = [
  { href: "/dashboard", labelKey: "inicio", icon: Home, requiereTmaid: false },
  { href: "/tmaid", labelKey: "diagnostico", icon: ClipboardList, requiereTmaid: false },
  { href: "/rutas", labelKey: "rutas", icon: Map, requiereTmaid: true },
  { href: "/progreso", labelKey: "progreso", icon: BarChart3, requiereTmaid: true },
  { href: "/tmaid/resultado", labelKey: "perfil", icon: UserRound, requiereTmaid: true },
];

export function AppShell({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    perfil,
    resultadoTmaid,
    reiniciar,
    puntos,
    racha,
    registrarActividadDiaria,
    cargando,
  } = useSession();
  const { t } = useIdioma();
  const { nivel } = calcularNivel(puntos);
  const [mostrarPremium, setMostrarPremium] = useState(false);

  useEffect(() => {
    if (!cargando) registrarActividadDiaria();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cargando]);

  return (
    <div className="min-h-screen bg-surface">
      <header className="glass-nav fixed top-0 z-50 flex w-full items-center justify-between px-6 py-4 print:hidden">
        <div className="flex items-center gap-3">
          <span className="font-headline text-lg font-black tracking-tighter text-primary">
            Professor AI
          </span>
          <span className="hidden text-on-surface-variant sm:inline">·</span>
          <span className="hidden font-label text-xs font-bold uppercase tracking-widest text-secondary sm:inline">
            {titulo}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {perfil && (
            <div className="hidden items-center gap-3 sm:flex">
              <button
                onClick={() => setMostrarPremium(true)}
                className="flex items-center gap-1 rounded-full bg-primary-container px-2.5 py-1 text-xs font-bold text-white transition-opacity hover:opacity-90"
                title={t.shell.premiumTitle}
              >
                <Sparkles size={12} /> {t.shell.premium}
              </button>
              <span className="gold-chip">
                <Star size={12} fill="currentColor" /> {t.comun.nivelAbrev}{nivel} · {puntos}{" "}
                {t.comun.ptsAbrev}
              </span>
              {racha > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-surface-container-low px-2.5 py-1 text-xs font-bold text-on-surface">
                  <Flame size={12} className="text-secondary" /> {racha}
                </span>
              )}
              <span className="text-sm font-semibold text-on-surface">
                {perfil.nombre}
              </span>
            </div>
          )}
          <LanguageToggle variante="claro" />
          <button
            onClick={() => {
              reiniciar();
              router.push("/login");
            }}
            title={t.shell.salir}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant hover:text-primary"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <div className="px-6 pb-28 pt-20 print:p-0">{children}</div>

      <nav className="glass-nav fixed bottom-0 z-50 flex w-full items-center justify-around px-2 py-2 print:hidden">
        {TABS.map((tab) => {
          const activo = pathname === tab.href;
          const bloqueado = tab.requiereTmaid && !resultadoTmaid;
          const Icon = tab.icon;

          if (bloqueado) {
            return (
              <span
                key={tab.href}
                title={t.shell.bloqueado}
                className="flex flex-1 flex-col items-center gap-1 rounded-lg py-2 text-on-surface-variant opacity-40"
              >
                <Lock size={18} />
                <span className="font-label text-[10px] font-bold uppercase tracking-wide">
                  {t.shell[tab.labelKey]}
                </span>
              </span>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`mx-1 flex flex-1 flex-col items-center gap-1 rounded-full py-2 transition-colors ${
                activo
                  ? "bg-primary-container text-white"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              <Icon size={18} strokeWidth={activo ? 2.5 : 2} />
              <span className="font-label text-[10px] font-bold uppercase tracking-wide">
                {t.shell[tab.labelKey]}
              </span>
            </Link>
          );
        })}
      </nav>

      <PremiumUpgradeModal open={mostrarPremium} onClose={() => setMostrarPremium(false)} />
    </div>
  );
}
