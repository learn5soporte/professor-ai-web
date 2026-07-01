"use client";

import { useEffect } from "react";
import type { Badge } from "@/lib/gamification/badges";

export function BadgeUnlockToast({
  badge,
  onClose,
}: {
  badge: Badge | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!badge) return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [badge, onClose]);

  if (!badge) return null;

  return (
    <div className="fixed inset-x-0 top-20 z-[60] flex justify-center px-6">
      <div className="flex items-center gap-3 rounded-full bg-primary px-5 py-3 text-on-primary shadow-ambient">
        <span className="text-2xl">{badge.emoji}</span>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide opacity-80">
            ¡Badge desbloqueado!
          </p>
          <p className="text-sm font-bold">
            {badge.nombre} · +{badge.puntos} pts
          </p>
        </div>
      </div>
    </div>
  );
}
