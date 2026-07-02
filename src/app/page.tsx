import Link from "next/link";

export default function Home() {
  return (
    <main className="dark-screen">
      <div className="dark-screen-glow-blue -left-20 -top-20 h-72 w-72" />
      <div className="dark-screen-glow-gold right-0 top-1/3 h-96 w-96" />

      <header className="relative z-10 flex w-full items-center justify-between px-6 py-4">
        <span className="font-headline text-xl font-black tracking-tighter text-white">
          Professor AI
        </span>
        <span className="font-label text-xs uppercase tracking-widest text-white/50">
          Prototipo clickeable · sin backend real aun
        </span>
      </header>

      <section className="relative z-10 mx-auto flex max-w-4xl flex-col gap-8 px-6 pb-24 pt-24">
        <div>
          <p className="font-label text-xs font-bold uppercase tracking-widest text-tertiary-fixed">
            Identidad visual: Humanist Futurist
          </p>
          <h1 className="mt-2 text-5xl font-black text-white">
            Tu asistente de IA para el aula.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/60">
            Diagnostica, crea y evoluciona contigo. Recorre el flujo completo:
            entra, cuentanos tu contexto, haz el diagnostico TMAID y llega a
            tu escritorio con una ruta personalizada — todo con datos
            simulados por ahora, listo para conectar a Supabase real.
          </p>
        </div>

        <div className="flex gap-4">
          <Link href="/login" className="btn-accent">
            Comenzar diagnostico →
          </Link>
        </div>

        <div className="rounded-xl bg-white/5 p-6 backdrop-blur-md">
          <h2 className="text-lg font-bold text-white">Recorrido del prototipo</h2>
          <p className="mt-2 text-sm text-white/50">
            /login → /onboarding → /tmaid → /tmaid/resultado → /dashboard →
            /herramientas/prompts. Modulos de codigo en{" "}
            <code>src/modules</code>.
          </p>
        </div>
      </section>
    </main>
  );
}
