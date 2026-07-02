import Link from "next/link";
import { DarkScreen } from "@/components/DarkScreen";

/**
 * SCREEN 1: SPLASH -- base literal: code.html real de Stitch
 * (bloque_1_y_2_acceso_y_onboarding), sin adaptar estructura ni copy.
 */
export default function SplashPage() {
  return (
    <DarkScreen>
      <section className="flex w-full max-w-4xl flex-col items-center justify-center px-margin-mobile text-center">
        <div className="relative mb-8">
          <div className="glow-node pulse-ai flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-tr from-secondary to-on-secondary-fixed md:h-40 md:w-40">
            <span className="font-headline-lg text-headline-lg font-black text-white md:text-display-lg">
              P
            </span>
          </div>
        </div>
        <h1 className="font-headline-lg mb-4 text-headline-lg-mobile font-black tracking-tighter md:font-display-lg md:text-display-lg">
          Professor AI
        </h1>
        <p className="font-body-lg mx-auto mb-12 max-w-md text-body-lg text-white/50">
          Tu asistente de IA para el aula. Diagnostica, crea y evoluciona
          contigo.
        </p>
        <div className="flex justify-center gap-2">
          <div className="loader-dot h-3 w-3 rounded-full bg-tertiary-fixed-dim" />
          <div className="loader-dot h-3 w-3 rounded-full bg-tertiary-fixed-dim" />
          <div className="loader-dot h-3 w-3 rounded-full bg-tertiary-fixed-dim" />
        </div>
        <Link
          href="/login"
          className="mt-12 text-xs font-bold uppercase tracking-widest text-white/40 transition-colors hover:text-white"
        >
          Comenzar →
        </Link>
      </section>
    </DarkScreen>
  );
}
