import type { Config } from "tailwindcss";

// Tokens de diseño: Lumina Academic (Stitch) — "The Enlightened Assistant"
// Fuente: stitch_professor_ai/lumina_academic/DESIGN.md
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
        // Primary — Autoridad (azul)
        primary: "#0040a1",
        "primary-container": "#0056d2",
        "on-primary": "#ffffff",
        "on-primary-container": "#ffffff",

        // Secondary — Calidez (dorado)
        secondary: "#7c5800",
        "secondary-container": "#feb700",
        "secondary-fixed": "#ffdea8",
        "on-secondary": "#ffffff",
        "on-secondary-fixed": "#271900",
        "on-secondary-container": "#271900",

        // Surfaces — jerarquía tonal ("No-Line" rule)
        surface: "#f8f9fa",
        "surface-container-low": "#f3f4f5",
        "surface-container": "#edeeef",
        "surface-container-high": "#e7e8e9",
        "surface-container-highest": "#e1e3e4",
        "surface-container-lowest": "#ffffff",

        "on-surface": "#191c1d",
        "on-surface-variant": "#444650",
        "outline-variant": "#c5c6d2",

        error: "#ba1a1a",
        "on-error": "#ffffff",
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
        // Ambient shadow — nunca negro puro, tinte primary
        ambient: "0px 20px 40px rgba(0, 64, 161, 0.06)",
      },
      backdropBlur: {
        glass: "24px",
      },
    },
  },
  plugins: [],
};

export default config;
