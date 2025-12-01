'use client'

import { useState, useRef, useEffect } from 'react' // Importar useEffect
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Upload, CheckCircle, Shield, ScanFace, Loader2 } from 'lucide-react'

// Cliente Supabase
const supabase = createClient()

export default function Verification() {
  const router = useRouter()
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisStep, setAnalysisStep] = useState('')
  const [uploading, setUploading] = useState(false)
  
  const [uploads, setUploads] = useState<{ineFront: File|null, ineBack: File|null, selfie: File|null}>({
    ineFront: null, ineBack: null, selfie: null
  })

  const ineFrontRef = useRef<HTMLInputElement>(null)
  const ineBackRef = useRef<HTMLInputElement>(null)
  const selfieRef = useRef<HTMLInputElement>(null)

  // --- NUEVO: Verificar sesión al cargar ---
  useEffect(() => {
    const checkSession = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            // Si no hay usuario, mandamos al login para que entre y vuelva aquí
            alert("Tu sesión expiró. Por favor inicia sesión nuevamente.")
            router.push('/login')
        }
    }
    checkSession()
  }, [router])

  const handleFileSelect = (type: 'ineFront' | 'ineBack' | 'selfie', file: File) => {
    if (file.size > 5 * 1024 * 1024) return alert('Máximo 5MB por imagen')
    setUploads(prev => ({ ...prev, [type]: file }))
  }

  const simulateAI = async () => {
    setAnalyzing(true)
    const steps = ['Escaneando documento...', 'Validando hologramas...', 'Comparando biometría...', 'Verificación exitosa ✅']
    for (const step of steps) {
        setAnalysisStep(step)
        await new Promise(r => setTimeout(r, 1200))
    }
    setAnalyzing(false)
  }

  const uploadFile = async (file: File, path: string) => {
    const { error } = await supabase.storage.from('documents').upload(path, file, { upsert: true })
    if (error) throw error
    return path
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploads.ineFront || !uploads.ineBack || !uploads.selfie) return alert('Faltan documentos')

    try {
        await simulateAI()
        setUploading(true)

        // Verificamos usuario de nuevo justo antes de subir
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
            alert('Sesión expirada. Inicia sesión de nuevo.')
            router.push('/login')
            return
        }

        const ts = Date.now()
        const [front, back, selfie] = await Promise.all([
            uploadFile(uploads.ineFront!, `${user.id}/front_${ts}.jpg`),
            uploadFile(uploads.ineBack!, `${user.id}/back_${ts}.jpg`),
            uploadFile(uploads.selfie!, `${user.id}/selfie_${ts}.jpg`)
        ])

        const { error: updateError } = await supabase
            .from('users')
            .update({
                ine_front_path: front,
                ine_back_path: back,
                selfie_path: selfie,
                verification_status: 'pending',
                identity_verified: true
            })
            .eq('id', user.id)

        if (updateError) throw updateError

        router.push('/test/objective')

    } catch (error: any) {
        console.error(error)
        alert('Error: ' + error.message)
    } finally {
        setUploading(false)
    }
  }

  // Componente de UI
  const UploadCard = ({ type, label, icon: Icon, inputRef }: any) => (
    <div onClick={() => inputRef.current?.click()} className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition ${uploads[type as keyof typeof uploads] ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-purple-400'}`}>
        <input type="file" ref={inputRef} accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFileSelect(type, e.target.files[0])} />
        {uploads[type as keyof typeof uploads] ? (
            <>
                <CheckCircle className="text-green-500 w-8 h-8 mb-2" />
                <p className="text-xs font-bold text-green-700">Listo</p>
            </>
        ) : (
            <>
                <Icon className="text-gray-400 w-8 h-8 mb-2" />
                <p className="text-sm font-medium text-gray-600">{label}</p>
            </>
        )}
    </div>
  )

  if (analyzing) {
    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center text-white">
            <ScanFace size={80} className="text-blue-400 animate-pulse mb-6" />
            <h2 className="text-2xl font-bold mb-2">Analizando Identidad</h2>
            <p className="text-blue-200 font-mono">{analysisStep}</p>
            <div className="w-64 h-1 bg-gray-800 mt-6 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 animate-[width_3s_ease-in-out_infinite]" style={{width: '100%'}}></div>
            </div>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6">
        <div className="text-center mb-8">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Verificación Biométrica</h1>
            <p className="text-gray-500 text-sm mt-2">Sube tu INE y una selfie para validar tu cuenta.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <UploadCard type="ineFront" label="INE Frente" icon={Upload} inputRef={ineFrontRef} />
                <UploadCard type="ineBack" label="INE Reverso" icon={Upload} inputRef={ineBackRef} />
            </div>
            <UploadCard type="selfie" label="Tomar Selfie" icon={ScanFace} inputRef={selfieRef} />

            <div className="bg-blue-50 p-3 rounded-lg flex gap-3 border border-blue-100">
                <Shield className="w-5 h-5 text-blue-600 shrink-0" />
                <p className="text-xs text-blue-800">Tus datos biométricos son procesados por IA segura y encriptada.</p>
            </div>

            <button type="submit" disabled={uploading} className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold hover:bg-purple-700 transition flex justify-center items-center gap-2">
                {uploading ? <Loader2 className="animate-spin" /> : 'Verificar y Continuar'}
            </button>
        </form>
      </div>
    </div>
  )
}