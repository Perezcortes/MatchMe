'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Icon from '@/app/components/Icon'
import { ArrowRight, Share2, Download } from 'lucide-react'

const supabase = createClient()

export default function ReportPage() {
  const router = useRouter()
  const [report, setReport] = useState<string>('')
  const [loading, setLoading] = useState(true)

  // El mismo reporte de respaldo que usamos en Matches
  const fallbackReport = `Análisis de Personalidad (Generado):

* **Tus fortalezas:** Tu perfil indica que eres una persona resiliente y con una gran capacidad para conectar con los demás.
* **Tu entorno ideal:** Te desenvuelves mejor en ambientes donde se valora la creatividad y la colaboración abierta.
* **Consejo de conexión:** Aprovecha tu autenticidad; al compartir tus intereses genuinos, atraerás a las personas correctas.`

  useEffect(() => {
    const loadReport = async () => {
      try {
        setLoading(true)
        
        // 1. Verificar Sesión
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
            // Si no hay sesión, mostramos el demo por seguridad
            setReport(fallbackReport)
            setLoading(false)
            return
        }

        // 2. Obtener reporte de la DB
        const { data: userProfile, error } = await supabase
          .from('users')
          .select('ai_report')
          .eq('id', user.id)
          .limit(1)
          .maybeSingle()

        if (error || !userProfile || !userProfile.ai_report || userProfile.ai_report.length < 20) {
            // Si falla, no hay reporte o es muy corto (el genérico), usamos el Demo bonito
            console.warn("Usando reporte fallback")
            setReport(fallbackReport)
        } else {
            setReport(userProfile.ai_report)
        }

      } catch (error) {
        console.error(error)
        setReport(fallbackReport)
      } finally {
        setLoading(false)
      }
    }

    loadReport()
  }, [router])

  // Función para limpiar texto (Markdown simple)
  const renderContent = (text: string) => {
    return text.split('\n').map((line, index) => {
        const cleanLine = line.replace(/\*\*(.*?)\*\*/g, '$1')
        
        if (line.trim().startsWith('*') || line.trim().startsWith('-')) {
            return (
                <li key={index} className="mb-3 flex items-start text-gray-700">
                    <span className="mr-3 text-purple-500 mt-1 text-lg">•</span>
                    <span className="text-base" dangerouslySetInnerHTML={{ __html: line.replace(/^[\*\-]\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                </li>
            )
        }
        if (line.trim() !== '') {
             // Títulos o párrafos
             if (line.includes(':')) {
                 return <h3 key={index} className="text-lg font-bold text-purple-900 mt-4 mb-2" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '$1') }} />
             }
             return <p key={index} className="mb-2 text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
        }
        return null
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
            <div className="inline-block p-3 bg-white rounded-2xl shadow-sm mb-4">
                <Icon name="actividad_fisica" size={40} className="text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Tu Reporte Personal</h1>
            <p className="text-gray-500 mt-2">Generado por Inteligencia Artificial basado en tus respuestas</p>
        </div>

        {/* Card del Reporte */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-purple-100">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-1 h-2"></div>
            
            <div className="p-8 sm:p-10">
                <div className="prose prose-purple max-w-none">
                    <ul className="list-none pl-0 space-y-2">
                        {renderContent(report)}
                    </ul>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="bg-gray-50 p-6 border-t border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <button 
                    onClick={() => router.push('/matches')}
                    className="w-full sm:w-auto bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2 shadow-lg"
                >
                    Ver Mis Matches <ArrowRight size={18} />
                </button>
                
                <div className="flex gap-3 w-full sm:w-auto">
                    <button className="flex-1 sm:flex-none py-3 px-4 border border-gray-200 rounded-xl text-gray-600 hover:bg-white hover:border-purple-300 transition flex justify-center">
                        <Share2 size={20} />
                    </button>
                    <button className="flex-1 sm:flex-none py-3 px-4 border border-gray-200 rounded-xl text-gray-600 hover:bg-white hover:border-purple-300 transition flex justify-center">
                        <Download size={20} />
                    </button>
                </div>
            </div>
        </div>

        <p className="text-center text-gray-400 text-xs mt-8">
            Este análisis es generado automáticamente y puede no ser 100% preciso.
        </p>

      </div>
    </div>
  )
}