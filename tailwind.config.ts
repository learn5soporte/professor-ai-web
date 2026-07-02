import type { Config } from "tailwindcss";

// Tokens de diseno: Humanist Futurist (Stitch - "Professor AI: Pedagogical OS")
// Fuente: export real de Stitch, stitch_professor_ai_pedagogical_os/professor_ai/DESIGN.md
// Base clara editorial (surface) + acentos Deep Navy / Royal Blue / Editorial Gold.
// Pantallas "especializadas" (splash, login, onboarding, intro TMAID) usan fondo navy inmersivo.
const config: Config = {
      content: [
              "./src/pages/**/*.{ts,tsx}",
              "./src/components/**/*.{ts,tsx}",
              "./src/app/**/*.{ts,tsx}",
              "./src/modules/**/*.{ts,tsx}",
            ],
      darkMode: "class",
      theme: {
              extend: {
                        colors: {
                                    surface: "#f8f9fa",
                                    "surface-dim": "#d8dadb",
                                    "surface-bright": "#f8f9fa",
                                    "surface-container-lowest": "#ffffff",
                                    "surface-container-low": "#f2f4f5",
                                    "surface-container": "#eceeef",
                                    "surface-container-high": "#e7e8e9",
                                    "surface-container-highest": "#e1e3e4",
                                    "on-surface": "#191c1d",
                                    "on-surface-variant": "#45464e",
                                    "inverse-surface": "#2e3132",
                                    "inverse-on-surface": "#eff1f2",
                                    outline: "#75767f",
                                    "outline-variant": "#c5c6d0",
                                    "surface-tint": "#4e5d89",

                                    primary: "#000000",
                                    "on-primary": "#ffffff",
                                    "primary-container": "#071941",
                                    "on-primary-container": "#7482b1",
                                    "inverse-primary": "#b6c5f7",
                                    "primary-fixed": "#dbe1ff",
                                    "primary-fixed-dim": "#b6c5f7",
                                    "on-primary-fixed": "#071941",
                                    "on-primary-fixed-variant": "#36456f",

                                    secondary: "#2552ca",
                                    "on-secondary": "#ffffff",
                                    "secondary-container": "#446ce4",
                                    "on-secondary-container": "#fffbff",
                                    "secondary-fixed": "#dce1ff",
                                    "secondary-fixed-dim": "#b6c4ff",
                                    "on-secondary-fixed": "#00164e",
                                    "on-secondary-fixed-variant": "#003baf",

                                    tertiary: "#735c00",
                                    "on-tertiary": "#ffffff",
                                    "tertiary-container": "#cba82f",
                                    "on-tertiary-container": "#4e3e00",
                                    "tertiary-fixed": "#ffe087",
                                    "tertiary-fixed-dim": "#e9c349",
                                    "on-tertiary-fixed": "#231a00",
                                    "on-tertiary-fixed-variant": "#574500",

                                    error: "#ba1a1a",
                                    "on-error": "#ffffff",
                                    "error-container": "#ffdad6",
                                    "on-error-container": "#93000a",

                                    background: "#f8f9fa",
                                    "on-background": "#191c1d",
                                    "surface-variant": "#e1e3e4",
                        },
                        fontFamily: {
                                    headline: ["var(--font-epilogue)", "sans-serif"],
                                    body: ["var(--font-manrope)", "sans-serif"],
                                    label: ["var(--font-manrope)", "sans-serif"],
                        },
                        borderRadius: {
                                    sm: "0.25rem",
                                    DEFAULT: "0.5rem",
                                    md: "0.75rem",
                                    lg: "1rem",
                                    xl: "1.5rem",
                                    full: "9999px",
                        },
                        spacing: {
                                    "gap-xl": "2rem",
                                    "gap-lg": "1.5rem",
                                    "gap-md": "1rem",
                                    "margin-page": "3rem",
                                    "margin-mobile": "1.25rem",
                        },
                        boxShadow: {
                                    atmospheric: "0px 20px 40px rgba(0, 11, 58, 0.06)",
                                    ambient: "0px 20px 40px rgba(0, 11, 58, 0.06)",
                        },
                        backdropBlur: {
                                    glass: "20px",
                        },
              },
      },
      plugins: [],
};

export default config;
