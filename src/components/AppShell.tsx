"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, ClipboardList, Map, UserRound, Lock, LogOut, Flame, Star } from "lucide-react";
import { useSession } from "@/lib/store/session";
import { calcularNivel } from "@/lib/gamification/badges";

type Tab = {
  href: string;
  label: string;
  icon: typeof Home;
  requiereTmaid: boolean;
};

const TABS: Tab[] = [
  { href: "/dashboard", label: "Inicio", icon: Home, requiereTmaid: false },
  { href: "/tmaid", label: "Diagnóstico", icon: ClipboardList, requiereTmaid: false },
  { href: "/rutas", label: "Rutas", icon: Map, requiereTmaid: true },
  { href: "/tmaid/resultado", label: "Perfil", icon: UserRound, requiereTmaid: true },
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
  const { nivel } = calcularNivel(puntos);

  useEffect(() => {
    if (!cargando) registrarActividadDiaria();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cargando]);

  return (
    <div className="min-h-screen bg-surface">
      <header className="glass-nav fixed top-0 z-50 flex w-full items-center justify-between px-6 py-4">
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
              <span className="flex items-center gap-1 rounded-full bg-secondary-fixed px-2.5 py-1 text-xs font-bold text-on-secondary-fixed">
                <Star size={12} fill="currentColor" /> Nv.{nivel} · {puntos} pts
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
          <button
            onClick={() => {
              reiniciar();
              router.push("/login");
            }}
            title="Reiniciar sesión de prueba"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant hover:text-primary"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <div className="px-6 pb-28 pt-20">{children}</div>

      <nav className="glass-nav fixed bottom-0 z-50 flex w-full items-center justify-around px-2 py-2">
        {TABS.map((tab) => {
          const activo = pathname === tab.href;
          const bloqueado = tab.requiereTmaid && !resultadoTmaid;
          const Icon = tab.icon;

          if (bloqueado) {
            return (
              <span
                key={tab.href}
                title="Completa el diagnóstico TMAID primero"
                className="flex flex-1 flex-col items-center gap-1 rounded-lg py-2 text-on-surface-variant opacity-40"
              >
                <Lock size={18} />
                <span className="font-label text-[10px] font-bold uppercase tracking-wide">
                  {tab.label}
                </span>
              </span>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-1 flex-col items-center gap-1 rounded-lg py-2 transition-colors ${
                activo
                  ? "text-primary"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              <Icon size={18} strokeWidth={activo ? 2.5 : 2} />
              <span className="font-label text-[10px] font-bold uppercase tracking-wide">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
