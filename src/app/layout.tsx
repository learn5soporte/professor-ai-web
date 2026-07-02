import type { Metadata } from "next";
import { Epilogue, Manrope } from "next/font/google";
import { SessionProvider } from "@/lib/store/session";
import "./globals.css";

// Tipografia Humanist Futurist (DESIGN.md real): Epilogue (headlines) + Manrope (body/labels)
const epilogue = Epilogue({
  subsets: ["latin"],
  variable: "--font-epilogue",
  weight: ["400", "700", "800"],
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Professor AI | Learn5",
  description:
    "Tu asistente de IA para el aula. Diagnostica, crea y evoluciona contigo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${epilogue.variable} ${manrope.variable}`}>
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
