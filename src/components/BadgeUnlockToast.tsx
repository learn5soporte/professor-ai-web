"use client";

import { useEffect } from "react";
import { textoBadge, type Badge } from "@/lib/gamification/badges";
import { useIdioma } from "@/lib/i18n";

export function BadgeUnlockToast({
  badge,
  onClose,
}: {
  badge: Badge | null;
  onClose: () => void;
}) {
  const { idioma, t } = useIdioma();

  useEffect(() => {
    if (!badge) return;
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [badge, onClose]);

  if (!badge) return null;

  const { nombre } = textoBadge(badge, idioma);

  return (
    <div className="fixed inset-x-0 top-20 z-[60] flex justify-center px-6">
      <div className="flex items-center gap-3 rounded-full bg-primary-container px-5 py-3 text-white shadow-atmospheric">
        <span className="text-2xl">{badge.emoji}</span>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide opacity-80">
            {t.comun.badgeDesbloqueado}
          </p>
          <p className="text-sm font-bold">
            {nombre} · +{badge.puntos} {t.comun.ptsAbrev}
          </p>
        </div>
      </div>
    </div>
  );
}
