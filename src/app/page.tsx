import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-surface">
      <header className="glass-nav fixed top-0 z-50 flex w-full items-center justify-between px-6 py-4">
        <span className="font-headline text-xl font-black tracking-tighter text-primary">
          Professor AI
        </span>
        <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">
          Prototipo clickeable · sin backend real aún
        </span>
      </header>

      <section className="mx-auto flex max-w-4xl flex-col gap-8 px-6 pb-24 pt-32">
        <div>
          <p className="font-label text-xs font-bold uppercase tracking-widest text-secondary">
            Identidad visual: Lumina Academic
          </p>
          <h1 className="mt-2 text-5xl font-black text-on-surface">
            Tu asistente de IA para el aula.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-on-surface-variant">
            Diagnostica, crea y evoluciona contigo. Recorre el flujo completo:
            entra, cuéntanos tu contexto, haz el diagnóstico TMAID y llega a
            tu escritorio con una ruta personalizada — todo con datos
            simulados por ahora, listo para conectar a Supabase real.
          </p>
        </div>

        <div className="flex gap-4">
          <Link href="/login" className="btn-primary">
            Comenzar diagnóstico →
          </Link>
        </div>

        <div className="card">
          <h2 className="text-lg font-bold">Recorrido del prototipo</h2>
          <p className="mt-2 text-sm text-on-surface-variant">
            /login → /onboarding → /tmaid → /tmaid/resultado → /dashboard →
            /herramientas/prompts. Módulos de código en{" "}
            <code>src/modules</code>.
          </p>
        </div>
      </section>
    </main>
  );
}
