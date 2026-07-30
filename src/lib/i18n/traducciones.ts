/**
 * Diccionario bilingüe ES/EN — Fase i18n (2026-07-30).
 *
 * `es` es la fuente de verdad del shape (los textos originales de la app);
 * `en` está tipado contra `typeof es`, así TypeScript obliga a que ninguna
 * key quede sin traducir. Para agregar textos de un módulo nuevo: sumar las
 * keys en `es`, y el compilador exige su versión en `en`.
 */

const es = {
  splash: {
    badge: "Hecho para docentes",
    descripcion:
      "Tu asistente de IA para el aula. Diagnostica tu nivel, arma tu ruta y crea material en minutos, no en horas.",
    comenzar: "Comenzar gratis",
    yaTengoCuenta: "Ya tengo cuenta →",
    ejemplo: "Ej.: una rúbrica que toma 30 min a mano, aquí toma 5.",
    valor1: "Diagnóstico IA",
    valor2: "Rutas personalizadas",
    valor3: "Herramientas para el aula",
    perfilIa: "Tu Perfil IA",
    avanzado: "Avanzado",
    puntajePromedio: "Puntaje promedio",
    retoCompletado: "Reto completado",
  },
  login: {
    titulo: "Iniciar Sesión",
    subtituloReal: "Ingresa con el email y contraseña de tu cuenta.",
    subtituloDemo:
      "Prototipo Fase 0 -- sin cuenta real todavía. Cualquier email / contraseña te lleva al flujo completo.",
    email: "Email",
    password: "Contraseña",
    olvidaste: "¿Olvidaste tu contraseña?",
    entrar: "Entrar",
    entrando: "Entrando...",
    o: "o",
    continuarGoogle: "Continuar con Google",
    noTienesCuenta: "¿No tienes cuenta?",
    registrarse: "Registrarse",
    reenviar: "Reenviar correo de confirmación",
    reenviando: "Reenviando...",
    reenvioOk: "Correo reenviado -- revisa tu bandeja de entrada (o spam).",
  },
  registro: {
    titulo: "Crea tu cuenta",
    subtituloReal:
      "Usa un email y contraseña reales -- vas a necesitarlos para volver a entrar.",
    nombre: "Nombre completo",
    nombrePlaceholder: "Dr. Julian Casablancas",
    email: "Email",
    password: "Contraseña",
    terminos: "Acepto los términos y condiciones",
    crear: "Crear mi cuenta",
    creando: "Creando...",
    yaTienes: "¿Ya tienes cuenta?",
    iniciaSesion: "Inicia sesión",
    irLogin: "Ir a iniciar sesión",
    confirmaTitulo: "Confirma tu correo",
    confirmaTexto1:
      "Creamos tu cuenta. Revisa tu bandeja de entrada (o la carpeta de spam) en",
    confirmaTexto2:
      "y haz clic en el enlace de confirmación antes de iniciar sesión.",
    docenteFallback: "Docente",
  },
  shell: {
    inicio: "Inicio",
    diagnostico: "Diagnóstico",
    rutas: "Rutas",
    progreso: "Progreso",
    perfil: "Perfil",
    premium: "Premium",
    premiumTitle: "Conoce Tutor IA Premium",
    bloqueado: "Completa el diagnóstico TMAID primero",
    salir: "Cerrar sesión",
  },
} as const;

export type Traducciones = {
  [S in keyof typeof es]: { [K in keyof (typeof es)[S]]: string };
};

const en: Traducciones = {
  splash: {
    badge: "Built for educators",
    descripcion:
      "Your AI assistant for the classroom. Diagnose your level, build your pathway and create materials in minutes, not hours.",
    comenzar: "Start for free",
    yaTengoCuenta: "I already have an account →",
    ejemplo: "E.g.: a rubric that takes 30 min by hand takes 5 here.",
    valor1: "AI Diagnosis",
    valor2: "Personalized pathways",
    valor3: "Classroom tools",
    perfilIa: "Your AI Profile",
    avanzado: "Advanced",
    puntajePromedio: "Average score",
    retoCompletado: "Challenge completed",
  },
  login: {
    titulo: "Sign In",
    subtituloReal: "Sign in with your account email and password.",
    subtituloDemo:
      "Phase 0 prototype -- no real account yet. Any email / password takes you through the full flow.",
    email: "Email",
    password: "Password",
    olvidaste: "Forgot your password?",
    entrar: "Sign in",
    entrando: "Signing in...",
    o: "or",
    continuarGoogle: "Continue with Google",
    noTienesCuenta: "Don't have an account?",
    registrarse: "Sign up",
    reenviar: "Resend confirmation email",
    reenviando: "Resending...",
    reenvioOk: "Email resent -- check your inbox (or spam folder).",
  },
  registro: {
    titulo: "Create your account",
    subtituloReal:
      "Use a real email and password -- you'll need them to sign back in.",
    nombre: "Full name",
    nombrePlaceholder: "Dr. Julian Casablancas",
    email: "Email",
    password: "Password",
    terminos: "I accept the terms and conditions",
    crear: "Create my account",
    creando: "Creating...",
    yaTienes: "Already have an account?",
    iniciaSesion: "Sign in",
    irLogin: "Go to sign in",
    confirmaTitulo: "Confirm your email",
    confirmaTexto1:
      "Your account was created. Check your inbox (or spam folder) at",
    confirmaTexto2: "and click the confirmation link before signing in.",
    docenteFallback: "Educator",
  },
  shell: {
    inicio: "Home",
    diagnostico: "Diagnosis",
    rutas: "Pathways",
    progreso: "Progress",
    perfil: "Profile",
    premium: "Premium",
    premiumTitle: "Meet AI Tutor Premium",
    bloqueado: "Complete the TMAID diagnosis first",
    salir: "Sign out",
  },
};

export type Idioma = "es" | "en";

export const TRADUCCIONES: Record<Idioma, Traducciones> = { es, en };
