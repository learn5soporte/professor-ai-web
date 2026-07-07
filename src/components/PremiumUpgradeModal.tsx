"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";

/**
 * Upgrade a Tutor IA Premium -- base literal: code.html real de Stitch
 * (upgrade_a_tutor_ia_premium). El diseño de Stitch es un modal fijo con un
 * botón "Probar Premium 7 días gratis" que no hacía nada (sin backend de
 * pagos). Aquí el modal conserva el diseño exacto (panel visual navy,
 * lista de beneficios reales del producto, precio, CTA), pero el CTA es
 * honesto sobre el estado real de Fase 0: no hay integración de Stripe/
 * Hotmart todavía, así que en vez de simular una compra exitosa (lo que
 * engañaría al docente), el clic muestra un aviso real de "próximamente"
 * en vez de fingir que la suscripción se activó.
 */

export function PremiumUpgradeModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [mostrarAviso, setMostrarAviso] = useState(false);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-margin-mobile">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at center, rgba(7,25,65,0.95) 0%, rgba(0,0,0,1) 100%)",
        }}
        onClick={() => {
          onClose();
          setMostrarAviso(false);
        }}
      />
      <div className="relative flex min-h-[500px] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-inverse-surface text-inverse-on-surface shadow-2xl md:flex-row">
        <div className="relative overflow-hidden bg-primary-container md:w-5/12">
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-primary-container to-transparent p-8">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-tertiary-container shadow-[0_0_20px_rgba(203,168,47,0.4)]">
              <Icon name="auto_awesome" filled className="text-[36px] text-on-tertiary-container" />
            </div>
            <h3 className="font-headline-md text-headline-md mb-2 leading-tight">
              La IA que evoluciona contigo.
            </h3>
            <p className="text-body-sm opacity-70">Exclusivo para miembros Premium.</p>
          </div>
        </div>

        <div className="flex flex-col justify-between p-8 md:w-7/12 md:p-12">
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg">
                Desbloquea tu Tutor IA Personal
              </h2>
              <button
                onClick={() => {
                  onClose();
                  setMostrarAviso(false);
                }}
                className="text-outline transition-colors hover:text-white"
                aria-label="Cerrar"
              >
                <Icon name="close" className="text-[28px]" />
              </button>
            </div>
            <ul className="space-y-4">
              {[
                "Feedback inmediato y personalizado 24/7.",
                "Generación ilimitada de mapas mentales.",
                "Acceso prioritario a nuevos modelos GPT.",
                "Sincronización total con tu calendario.",
              ].map((beneficio) => (
                <li key={beneficio} className="flex items-start gap-4">
                  <Icon
                    name="check_circle"
                    filled
                    className="mt-1 text-tertiary-container"
                  />
                  <span className="text-body-md">{beneficio}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10 space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="font-headline-lg text-white">$9.90</span>
              <span className="text-body-md text-outline">/mes</span>
              <div className="ml-auto rounded-full bg-tertiary-fixed px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-on-tertiary-fixed">
                Oferta Limitada
              </div>
            </div>
            {!mostrarAviso ? (
              <button
                onClick={() => setMostrarAviso(true)}
                className="flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-secondary-container to-secondary py-5 text-label-lg font-bold text-on-secondary-container shadow-[0_0_20px_rgba(203,168,47,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Probar Premium 7 días gratis
                <Icon name="arrow_forward" />
              </button>
            ) : (
              <div className="rounded-2xl bg-white/5 p-5 text-center">
                <p className="text-body-sm text-white">
                  Los pagos todavía no están activos en esta versión de prueba. Cuando
                  lancemos Premium te avisaremos por correo para activarlo con un clic.
                </p>
              </div>
            )}
            <p className="text-center text-body-sm text-outline">
              Cancela cuando quieras. Sin compromiso.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
