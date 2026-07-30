"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  TRADUCCIONES,
  type Idioma,
  type Traducciones,
} from "./traducciones";

/**
 * Proveedor de idioma ES/EN — client-side, compatible con el export
 * estático (GitHub Pages): sin rutas por locale ni middleware. La elección
 * se guarda en localStorage (misma estrategia que la sesión Fase 0) y el
 * primer render usa español (idioma por defecto del producto); si el
 * navegador está en inglés y no hay preferencia guardada, cambia a EN al
 * hidratar.
 */

const STORAGE_KEY = "professor-ai:idioma";

type IdiomaContextValue = {
  idioma: Idioma;
  cambiarIdioma: (idioma: Idioma) => void;
  t: Traducciones;
};

const IdiomaContext = createContext<IdiomaContextValue>({
  idioma: "es",
  cambiarIdioma: () => {},
  t: TRADUCCIONES.es,
});

export function IdiomaProvider({ children }: { children: ReactNode }) {
  const [idioma, setIdioma] = useState<Idioma>("es");

  useEffect(() => {
    let inicial: Idioma | null = null;
    try {
      const guardado = window.localStorage.getItem(STORAGE_KEY);
      if (guardado === "es" || guardado === "en") inicial = guardado;
    } catch {
      // localStorage bloqueado (modo privado estricto) -- seguimos en ES
    }
    if (!inicial && navigator.language?.toLowerCase().startsWith("en")) {
      inicial = "en";
    }
    if (inicial && inicial !== "es") setIdioma(inicial);
  }, []);

  useEffect(() => {
    document.documentElement.lang = idioma;
  }, [idioma]);

  function cambiarIdioma(nuevo: Idioma) {
    setIdioma(nuevo);
    try {
      window.localStorage.setItem(STORAGE_KEY, nuevo);
    } catch {
      // sin persistencia, pero el cambio aplica en esta visita
    }
  }

  return (
    <IdiomaContext.Provider
      value={{ idioma, cambiarIdioma, t: TRADUCCIONES[idioma] }}
    >
      {children}
    </IdiomaContext.Provider>
  );
}

export function useIdioma() {
  return useContext(IdiomaContext);
}
