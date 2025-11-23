import Link from 'next/link';
import { HeartHandshake } from 'lucide-react'; // Icono provisional de logo

export default function WelcomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-900 text-white p-6 relative overflow-hidden">
      
      {/* Decoración de fondo */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-500 opacity-10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>

      <div className="z-10 flex flex-col items-center text-center space-y-8 max-w-md w-full">
        
        {/* LOGO */}
        <div className="bg-white p-4 rounded-3xl shadow-2xl mb-4">
          <HeartHandshake size={64} className="text-blue-600" />
        </div>

        {/* TITULO Y SLOGAN */}
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tight">MatchMe</h1>
          <p className="text-xl font-light text-blue-100 italic">
            "No es solo una app, es tu nueva historia"
          </p>
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="w-full space-y-4 pt-8">
          <Link href="/register" className="block w-full">
            <button className="w-full py-4 px-6 bg-white text-blue-900 font-bold text-lg rounded-xl shadow-lg hover:bg-gray-50 transform hover:scale-105 transition-all">
              Crear cuenta
            </button>
          </Link>
          
          <button className="w-full py-4 px-6 bg-transparent border-2 border-white/30 text-white font-semibold text-lg rounded-xl hover:bg-white/10 transition-all">
            Iniciar sesión
          </button>
        </div>

        <p className="text-xs text-blue-200 mt-8">
          Optimiza tu círculo. Conecta con la gente correcta más rápido.
        </p>
      </div>
    </main>
  );
}