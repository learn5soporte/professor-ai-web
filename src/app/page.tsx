import Link from "next/link";
import { Icon } from "@/components/Icon";

/**
 * SCREEN 1: SPLASH -- v2 (2026-07-23): pantalla de inicio rediseñada a
 * pedido del usuario ("más llamativa, más pro"), combinando 3 direcciones
 * propuestas: mockup flotante del diagnóstico, fondo con movimiento sutil
 * (en vez de los 2 blobs estáticos de la v1) y una cifra concreta de
 * apoyo. Ya NO reutiliza <DarkScreen> (compartido con login/registro/
 * onboarding/intro TMAID) -- se arma el fondo a mano con las mismas
 * clases base (.dark-screen) más clases nuevas (.dot-grid,
 * .splash-orbit, .float-card*) que viven solo en este archivo, así las
 * otras pantallas inmersivas no cambian.
 *
 * El mockup "Tu Perfil IA" de la derecha reutiliza el mismo radar SVG que
 * /tmaid/resultado, con valores de ejemplo fijos (no reales) -- es una
 * vista previa honesta del producto, no una estadística inventada sobre
 * el usuario. Oculto en móvil (lg:block) a propósito: el feedback de un
 * docente probando el prototipo reportó cuadros que no se ven completos
 * en pantallas chicas, así que se evita sumar una tarjeta flotante
 * compleja ahí hasta auditar ese problema por separado.
 */

const VALOR_PROPUESTA: { icono: string; texto: string }[] = [
  { icono: "psychology", texto: "Diagnóstico IA" },
  { icono: "route", texto: "Rutas personalizadas" },
  { icono: "handyman", texto: "Herramientas para el aula" },
];

export default function SplashPage() {
  return (
    <div className="dark-screen">
      <div className="dot-grid pointer-events-none fixed inset-0 z-0 opacity-[0.15]" />
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute right-0 top-0 h-[500px] w-[500px] translate-x-1/3 -translate-y-1/3 rounded-full bg-tertiary-fixed-dim/20 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[600px] w-[600px] -translate-x-1/3 translate-y-1/3 rounded-full bg-secondary-container/20 blur-[150px]" />
        <div className="splash-orbit absolute left-1/2 top-1/2 h-[420px] w-[420px] rounded-full bg-secondary/10 blur-[100px]" />
      </div>

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center gap-12 px-margin-mobile py-16 lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:px-margin-page">
        {/* Columna de texto */}
        <section className="flex w-full max-w-xl flex-col items-center text-center lg:items-start lg:text-left">
          <span className="glass-card mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-tertiary-fixed-dim">
            <span className="glow-node pulse-ai h-2 w-2 rounded-full bg-tertiary-fixed-dim" />
            Hecho para docentes
          </span>

          <h1 className="font-headline-lg mb-4 text-5xl font-black leading-[1.05] tracking-tighter sm:text-6xl md:text-7xl">
            <span className="bg-gradient-to-r from-white to-tertiary-fixed-dim bg-clip-text text-transparent">
              Professor AI
            </span>
          </h1>

          <p className="font-body-lg mx-auto mb-8 max-w-md text-lg text-white/60 lg:mx-0">
            Tu asistente de IA para el aula. Diagnostica tu nivel, arma tu
            ruta y crea material en minutos, no en horas.
          </p>

          <div className="mb-6 flex flex-col items-center gap-4 sm:flex-row lg:items-start">
            <Link
              href="/registro"
              className="btn-accent inline-flex items-center gap-2"
            >
              Comenzar gratis
              <Icon name="arrow_forward" />
            </Link>
            <Link
              href="/login"
              className="text-sm font-bold text-white/50 transition-colors hover:text-white"
            >
              Ya tengo cuenta →
            </Link>
          </div>

          <p className="mb-6 text-sm font-bold text-tertiary-fixed-dim">
            Ej.: una rúbrica que toma 30 min a mano, aquí toma 5.
          </p>

          <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
            {VALOR_PROPUESTA.map((v) => (
              <span
                key={v.texto}
                className="glass-card flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-white/70"
              >
                <Icon
                  name={v.icono}
                  className="text-sm text-tertiary-fixed-dim"
                />
                {v.texto}
              </span>
            ))}
          </div>
        </section>

        {/* Mockup flotante -- solo en desktop, ver nota arriba */}
        <section className="relative hidden w-full max-w-sm shrink-0 lg:block">
          <div className="float-card glass-card relative rounded-3xl p-6 shadow-atmospheric">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-white/40">
                Tu Perfil IA
              </span>
              <span className="gold-chip">Avanzado</span>
            </div>
            <svg
              className="mx-auto h-auto w-full max-w-[220px]"
              viewBox="-40 -10 280 220"
            >
              <polygon
                fill="none"
                points="100,20 180,100 100,180 20,100"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />
              <polygon
                fill="none"
                points="100,40 160,100 100,160 40,100"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />
              <polygon
                fill="none"
                points="100,60 140,100 100,140 60,100"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />
              <line
                x1="100"
                y1="20"
                x2="100"
                y2="180"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />
              <line
                x1="20"
                y1="100"
                x2="180"
                y2="100"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />
              <polygon
                fill="rgba(37,82,202,0.4)"
                points="100,36 148,100 100,148 44,100"
                stroke="#cba82f"
                strokeWidth="3"
              />
            </svg>
            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
              <span className="text-xs text-white/50">Puntaje promedio</span>
              <span className="text-sm font-bold text-white">78%</span>
            </div>
          </div>

          <div className="float-card-delay glass-card absolute -bottom-6 -left-10 flex items-center gap-2 rounded-2xl px-4 py-3 shadow-atmospheric">
            <Icon name="military_tech" className="text-tertiary-fixed-dim" />
            <div>
              <p className="text-xs font-bold text-white">+30 XP</p>
              <p className="text-[10px] text-white/40">Reto completado</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
