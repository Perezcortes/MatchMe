import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 flex flex-col items-center justify-center p-8">
      {/* Logo */}
      <div className="bg-white rounded-full w-32 h-32 flex items-center justify-center mb-8 shadow-2xl">
        <span className="text-2xl font-bold text-purple-600">MM</span>
      </div>
      
      {/* Slogan */}
      <h1 className="text-4xl font-bold text-white text-center mb-4">
        MatchMe
      </h1>
      <p className="text-xl text-white/90 text-center mb-12 max-w-md">
        "No es solo una app, es tu nueva historia"
      </p>
      
      {/* Botones */}
      <div className="space-y-4 w-full max-w-xs">
        <Link 
          href="/register"
          className="w-full bg-white text-purple-600 py-4 px-6 rounded-xl font-semibold text-center block hover:bg-gray-100 transition-colors shadow-lg"
        >
          Crear cuenta
        </Link>
        
        <Link 
          href="/login"
          className="w-full bg-transparent border-2 border-white text-white py-4 px-6 rounded-xl font-semibold text-center block hover:bg-white/10 transition-colors"
        >
          Iniciar sesión
        </Link>
      </div>
      
      {/* Texto informativo */}
      <p className="text-white/70 text-center mt-12 text-sm max-w-sm">
        Conecta con personas afines basado en compatibilidad real. Amistad, networking y relaciones significativas.
      </p>
    </div>
  )
}