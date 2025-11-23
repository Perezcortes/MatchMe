// app/layout.tsx
import type { Metadata } from "next";
import { AuthProvider } from "./src/context/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "MatchMe - Conecta con tu tribu",
  description: "Optimiza tu círculo. Conecta con la gente correcta más rápido.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>❤️</text></svg>",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}