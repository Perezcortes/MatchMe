import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex flex-col items-center justify-center p-8">
      {/* Logo */}
      <div className="bg-white rounded-2xl w-48 h-48 flex items-center justify-center mb-8 shadow-2xl p-4">
        <Image 
          src="/logo.jpg" 
          alt="MatchMe Logo" 
          width={120}
          height={120}
          className="rounded-lg object-cover"
          priority
        />
      </div>
      
      {/* Slogan */}
      <h1 className="text-5xl font-bold text-white text-center mb-4">
        MatchMe
      </h1>
      <p className="text-xl text-white/90 text-center mb-12 max-w-md leading-relaxed">
        "No es solo una app, es tu nueva historia"
      </p>
      
      {/* Botones */}
      <div className="space-y-4 w-full max-w-xs">
        <Link 
          href="/register"
          className="w-full bg-white text-purple-600 py-4 px-6 rounded-xl font-semibold text-center block hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Crear cuenta
        </Link>
        
        <Link 
          href="/login"
          className="w-full bg-transparent border-2 border-white text-white py-4 px-6 rounded-xl font-semibold text-center block hover:bg-white/10 transition-all duration-300 hover:border-white/80"
        >
          Iniciar sesión
        </Link>
      </div>
      
      {/* Texto informativo */}
      <div className="text-white/80 text-center mt-12 max-w-md space-y-2">
        <p className="text-sm">
          Conecta con personas afines basado en compatibilidad real
        </p>
        <div className="flex justify-center space-x-4 text-xs">
          <span className="flex items-center">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
            Amistad
          </span>
          <span className="flex items-center">
            <span className="w-2 h-2 bg-blue-400 rounded-full mr-1"></span>
            Networking
          </span>
          <span className="flex items-center">
            <span className="w-2 h-2 bg-pink-400 rounded-full mr-1"></span>
            Relaciones
          </span>
        </div>
      </div>
    </div>
  )
}