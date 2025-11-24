// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AuthProvider from './components/auth-provider'
// 1. Importar el Navbar
import Navbar from './components/navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MatchMe - Encuentra conexiones significativas',
  description: 'Conecta con personas afines basado en compatibilidad real de personalidad, valores e intereses',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          {/* 2. Insertar el Navbar aquí, dentro del AuthProvider pero fuera del main */}
          <Navbar />
          <main className="min-h-screen bg-gray-50 pb-16 sm:pb-0"> {/* Added pb-16 for mobile nav spacing */}
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}