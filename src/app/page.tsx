export default function Home() {
  return (
    <main className="min-h-screen bg-surface">
      <header className="glass-nav fixed top-0 z-50 flex w-full items-center justify-between px-6 py-4">
        <span className="font-headline text-xl font-black tracking-tighter text-primary">
          Professor AI
        </span>
        <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">
          Fase 0 · Setup
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
            Diagnostica, crea y evoluciona contigo. Este layout base confirma
            que los tokens de Lumina Academic (azul #0040a1, dorado #feb700,
            Plus Jakarta Sans + Manrope) están aplicados correctamente sobre
            Next.js + Tailwind.
          </p>
        </div>

        <div className="flex gap-4">
          <button className="btn-primary">Comenzar diagnóstico</button>
          <button className="btn-secondary">Ver mi ruta</button>
        </div>

        <div className="card">
          <h2 className="text-lg font-bold">Módulos (Fase 0 — estructura)</h2>
          <p className="mt-2 text-sm text-on-surface-variant">
            auth · onboarding · tmaid · dashboard · herramientas · seguimiento
            · institucional — ver <code>src/modules</code>.
          </p>
        </div>
      </section>
    </main>
  );
}
