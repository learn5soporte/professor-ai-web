"use client";

import { useEffect, useRef } from "react";

type Particula = {
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
  angle: number;
};

/**
 * Confetti minimo -- puerto directo del script de canvas de code.html real
 * de Stitch (bloque_4_y_5_dashboard_y_ruta_formativa, screen-celebration).
 */
export function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particulas: Particula[] = [];
    for (let i = 0; i < 150; i++) {
      particulas.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        size: Math.random() * 8 + 4,
        color: i % 2 === 0 ? "#cba82f" : "#ffffff",
        speed: Math.random() * 3 + 2,
        angle: Math.random() * 6.28,
      });
    }

    let raf = 0;
    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particulas.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
        p.y += p.speed;
        p.angle += 0.1;
        if (p.y > canvas.height) p.y = -20;
      });
      raf = requestAnimationFrame(draw);
    }
    draw();

    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[100] h-full w-full"
    />
  );
}
