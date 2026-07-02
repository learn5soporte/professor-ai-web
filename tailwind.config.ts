import type { Config } from "tailwindcss";

// Tokens de diseno: Humanismo Futurista (Stitch - "Professor AI: Pedagogical OS")
// Estetica navy + dorado, glassmorphism, "No-Line Rule" con jerarquia por elevacion.
// Reemplaza a Lumina Academic (Fase 0) tras decision del 2026-07-01.
const config: Config = {
    content: [
          "./src/pages/**/*.{ts,tsx}",
          "./src/components/**/*.{ts,tsx}",
          "./src/app/**/*.{ts,tsx}",
          "./src/modules/**/*.{ts,tsx}",
        ],
    theme: {
          extend: {
                  colors: {
                            // Primary - Dorado (accion, CTA, insignias)
                    primary: "#d9a727",
                            "primary-container": "#f0ce6b",
                            "on-primary": "#1b140a",
                            "on-primary-container": "#1b140a",

                            // Secondary - Dorado suave (acentos, kickers, chips)
                            secondary: "#e8c874",
                            "secondary-container": "#b8892a",
                            "secondary-fixed": "#3a2e12",
                            "on-secondary": "#1b140a",
                            "on-secondary-fixed": "#f5e1a8",
                            "on-secondary-container": "#1b140a",

                            // Surfaces - navy profundo, jerarquia tonal ("No-Line" rule)
                            surface: "#0a1130",
                            "surface-container-low": "#101b3e",
                            "surface-container": "#182552",
                            "surface-container-high": "#1e2d5e",
                            "surface-container-highest": "#263875",
                            "surface-container-lowest": "#16214a",

                            "on-surface": "#f3efe4",
                            "on-surface-variant": "#a9b2d6",
                            "outline-variant": "#2e3b6e",

                            error: "#f2545b",
                            "on-error": "#1a0505",
                  },
                  fontFamily: {
                            headline: ["var(--font-plus-jakarta-sans)", "sans-serif"],
                            body: ["var(--font-manrope)", "sans-serif"],
                            label: ["var(--font-manrope)", "sans-serif"],
                  },
                  borderRadius: {
                            DEFAULT: "0.25rem",
                            lg: "2rem",
                            xl: "3rem",
                            full: "9999px",
                  },
                  boxShadow: {
                            // Ambient shadow - elevacion sobre fondo navy, nunca negro puro
                    ambient: "0px 20px 40px rgba(0, 0, 0, 0.45)",
                  },
                  backdropBlur: {
                            glass: "24px",
                  },
          },
    },
    plugins: [],
};

export default config;
