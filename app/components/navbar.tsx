// app/components/navbar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Icon from './Icon'
import { signOut } from '@/app/actions'

export default function Navbar() {
  const pathname = usePathname()

  // Lista de rutas donde NO queremos mostrar la barra de navegación
  const hiddenRoutes = ['/login', '/register', '/verification', '/'];
  
  // Si la ruta actual está en la lista de ocultas, o empieza por /admin, no renderizamos nada.
  if (hiddenRoutes.includes(pathname) || pathname.startsWith('/admin')) {
    return null
  }

  const isActive = (path: string) => pathname === path

  return (
    <nav className="bg-gradient-to-r from-purple-600 to-blue-500 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Lado izquierdo: Logo y Enlaces de Navegación */}
          <div className="flex items-center">
            {/* Logo "MM" como en el login */}
            <Link href="/matches" className="flex-shrink-0 flex items-center mr-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center shadow-sm hover:bg-white/30 transition-colors">
                <span className="text-lg font-bold text-white">MM</span>
              </div>
            </Link>
            {/* Enlaces de navegación (solo Desktop) */}
            <div className="hidden sm:flex sm:space-x-8 ml-4">
              <Link
                href="/matches"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 h-16 ${
                  isActive('/matches')
                    ? 'border-white text-white'
                    : 'border-transparent text-purple-100 hover:text-white hover:border-purple-200'
                }`}
              >
                <Icon name="networking" size={18} className="mr-2" />
                Matches
              </Link>
              <Link
                href="/profile"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 h-16 ${
                  isActive('/profile')
                    ? 'border-white text-white'
                    : 'border-transparent text-purple-100 hover:text-white hover:border-purple-200'
                }`}
              >
                <Icon name="usuario" size={18} className="mr-2" />
                Mi Perfil
              </Link>
            </div>
          </div>

          {/* Lado derecho: Botón de Cerrar Sesión */}
          <div className="flex items-center">
            <button
              onClick={() => signOut()}
              className="inline-flex items-center px-4 py-2 border border-white/30 rounded-full text-sm font-medium text-white bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-purple-600 focus:ring-white transition-all backdrop-blur-sm shadow-sm"
            >
              <Icon name="logout" size={16} className="mr-2 text-white" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
              <span className="sm:hidden">Salir</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Barra de navegación inferior para móviles (se mantiene simple y blanca para contraste) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-3 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-20 safe-area-bottom">
         <Link href="/matches" className={`flex flex-col items-center flex-1 py-1 ${isActive('/matches') ? 'text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}>
            <Icon name="networking" size={24} className={isActive('/matches') ? 'text-purple-600' : 'text-gray-400'} />
            <span className="text-xs mt-1 font-medium">Matches</span>
         </Link>
         <Link href="/profile" className={`flex flex-col items-center flex-1 py-1 ${isActive('/profile') ? 'text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}>
            <Icon name="usuario" size={24} className={isActive('/profile') ? 'text-purple-600' : 'text-gray-400'} />
            <span className="text-xs mt-1 font-medium">Perfil</span>
         </Link>
      </div>
    </nav>
  )
}