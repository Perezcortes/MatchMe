'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Icon from '@/app/components/Icon'
import { ArrowRight, Share2, Download, Sparkles, Check, Copy } from 'lucide-react'

const supabase = createClient()

export default function ReportPage() {
  const router = useRouter()
  const [report, setReport] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null)

  // GENERADOR LOCAL (Failsafe)
  const generateSmartReport = (profile: any) => {
    const goalMap: Record<string, string> = {
      amistad: "construir vínculos de amistad genuinos",
      networking: "expandir tu red profesional",
      relacion: "encontrar una conexión significativa"
    }

    const goalText = goalMap[profile.goal] || "conectar con personas afines";
    const hobbies = profile.hobbies_list || [];
    const hobbiesText = hobbies.length > 0 
        ? `temas como ${hobbies.slice(0, 2).join(' y ')}` 
        : "tus pasatiempos";

    return `Análisis de Personalidad MatchMe:

* **Tus fortalezas:** Tu perfil revela que eres una persona auténtica, con una clara intención de ${goalText}. Destacas por tu curiosidad y apertura.
* **Tu entorno ideal:** Te desenvuelves mejor en espacios dinámicos donde se valoren ${hobbiesText}, permitiéndote ser tú mismo/a.
* **Consejo de conexión:** Tu combinación de intereses es única. Usa tu pasión por ${hobbies[0] || 'tus metas'} como rompehielos; verás que atraerás naturalmente a quienes vibran en tu misma frecuencia.`
  }

  useEffect(() => {
    const loadReport = async () => {
      try {
        setLoading(true)
        
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
            setReport(generateSmartReport({ goal: 'amistad', hobbies_list: ['tecnología', 'innovación'] }))
            setLoading(false)
            return
        }

        const { data: userProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .limit(1)
          .maybeSingle()

        if (userProfile) {
            setUserName(userProfile.name || '')
            
            if (!userProfile.ai_report || userProfile.ai_report.length < 80) {
                const smartReport = generateSmartReport(userProfile)
                setReport(smartReport)
            } else {
                setReport(userProfile.ai_report)
            }
        } else {
             setReport(generateSmartReport({ goal: 'amistad', hobbies_list: ['tecnología', 'innovación'] }))
        }

      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    loadReport()
  }, [router])

  // --- FUNCIÓN DE COMPARTIR ---
  const handleShare = async () => {
    const shareData = {
        title: 'Mi Reporte MatchMe',
        text: report,
        url: window.location.href
    }

    if (navigator.share) {
        // Móvil nativo (Abre menú de compartir de iOS/Android)
        try {
            await navigator.share(shareData)
        } catch (err) {
            console.log('Compartir cancelado')
        }
    } else {
        // PC (Copia al portapapeles)
        navigator.clipboard.writeText(report)
        showFeedback('Copiado al portapapeles')
    }
  }

  // --- FUNCIÓN DE DESCARGAR ---
  const handleDownload = () => {
    try {
        // Crear un archivo de texto en memoria
        const element = document.createElement("a");
        const file = new Blob([report], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = "MatchMe_Reporte.txt";
        
        // Simular click para descargar
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        
        showFeedback('Reporte descargado')
    } catch (err) {
        showFeedback('Error al descargar')
    }
  }

  const showFeedback = (msg: string) => {
      setFeedbackMsg(msg)
      setTimeout(() => setFeedbackMsg(null), 3000)
  }

  // Renderizador de Texto
  const renderContent = (text: string) => {
    if (!text) return null
    return text.split('\n').map((line, index) => {
        if (line.trim().startsWith('*') || line.trim().startsWith('-')) {
            return (
                <li key={index} className="mb-4 flex items-start text-gray-700 bg-purple-50 p-3 rounded-lg border border-purple-100">
                    <span className="mr-3 text-purple-600 mt-1"><Sparkles size={18} /></span>
                    <span className="text-sm sm:text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: line.replace(/^[\*\-]\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong class="text-purple-900">$1</strong>') }} />
                </li>
            )
        }
        if (line.trim() !== '') {
             if (line.includes(':') && !line.includes('**')) {
                 return <h3 key={index} className="text-lg font-bold text-gray-900 mt-6 mb-3 border-b pb-2" dangerouslySetInnerHTML={{ __html: line }} />
             }
             return <p key={index} className="mb-2 text-gray-600 leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900">$1</strong>') }} />
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
        <div className="text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="inline-flex p-4 bg-white rounded-2xl shadow-sm mb-4 border border-purple-100">
                <Icon name="actividad_fisica" size={48} className="text-purple-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">
              {userName ? `Hola, ${userName}` : 'Tu Reporte'}
            </h1>
            <p className="text-gray-500 text-lg">Aquí tienes el análisis profundo de tu perfil</p>
        </div>

        {/* Card del Reporte */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/50 backdrop-blur-sm animate-in zoom-in-95 duration-500">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-2"></div>
            
            <div className="p-8 sm:p-12">
                <div className="prose prose-purple max-w-none">
                    <ul className="list-none pl-0 space-y-2">
                        {renderContent(report)}
                    </ul>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="bg-gray-50 p-8 border-t border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <button 
                    onClick={() => router.push('/matches')}
                    className="w-full sm:w-auto bg-gray-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                    Ver Mis Matches <ArrowRight size={20} />
                </button>
                
                <div className="flex gap-3 w-full sm:w-auto">
                    <button 
                        onClick={handleShare}
                        className="flex-1 sm:flex-none py-3 px-5 border border-gray-200 rounded-xl text-gray-600 hover:bg-white hover:border-purple-300 hover:text-purple-600 transition flex justify-center items-center gap-2 font-medium"
                    >
                        {/* Cambia el icono si está en móvil */}
                        <Share2 size={18} /> <span className="sm:hidden">Compartir</span>
                    </button>
                    
                    <button 
                        onClick={handleDownload}
                        className="flex-1 sm:flex-none py-3 px-5 border border-gray-200 rounded-xl text-gray-600 hover:bg-white hover:border-purple-300 hover:text-purple-600 transition flex justify-center items-center gap-2 font-medium"
                    >
                        <Download size={18} /> <span className="sm:hidden">Guardar</span>
                    </button>
                </div>
            </div>
        </div>

        <p className="text-center text-gray-400 text-xs mt-8 opacity-60">
            Análisis basado en el modelo Big Five y preferencias personales.
        </p>

        {/* Toast de Feedback */}
        {feedbackMsg && (
             <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300 z-50">
                <Check size={16} className="text-green-400" />
                <span className="text-sm font-medium">{feedbackMsg}</span>
            </div>
        )}

      </div>
    </div>
  )
}