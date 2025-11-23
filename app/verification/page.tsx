'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function Verification() {
  const router = useRouter()
  const supabase = createClient()
  const [uploading, setUploading] = useState(false)
  const [uploads, setUploads] = useState({
    ineFront: null as File | null,
    ineBack: null as File | null,
    selfie: null as File | null
  })

  const ineFrontRef = useRef<HTMLInputElement | null>(null)
  const ineBackRef = useRef<HTMLInputElement | null>(null)
  const selfieRef = useRef<HTMLInputElement | null>(null)

  const handleFileSelect = (type: 'ineFront' | 'ineBack' | 'selfie', file: File) => {
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor sube solo imágenes (JPEG, PNG)')
      return
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen debe ser menor a 5MB')
      return
    }

    setUploads(prev => ({
      ...prev,
      [type]: file
    }))
  }

  const uploadFile = async (file: File, path: string): Promise<string> => {
    const { data, error } = await supabase.storage
      .from('verification-docs')
      .upload(path, file)

    if (error) throw error

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('verification-docs')
      .getPublicUrl(data.path)

    return publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    try {
      // Validar que todas las imágenes estén subidas
      if (!uploads.ineFront || !uploads.ineBack || !uploads.selfie) {
        alert('Por favor sube todas las imágenes requeridas')
        return
      }

      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        alert('Debes iniciar sesión para continuar')
        router.push('/login')
        return
      }

      // 1. Subir imágenes a Supabase Storage
      const userId = user.id
      
      const ineFrontUrl = await uploadFile(uploads.ineFront, `${userId}/ine-front.jpg`)
      const ineBackUrl = await uploadFile(uploads.ineBack, `${userId}/ine-back.jpg`) 
      const selfieUrl = await uploadFile(uploads.selfie, `${userId}/selfie.jpg`)

      // 2. Guardar en la base de datos
      const { error: verificationError } = await supabase
        .from('verification_docs')
        .insert({
          user_id: userId,
          ine_front_url: ineFrontUrl,
          ine_back_url: ineBackUrl,
          selfie_url: selfieUrl,
          is_verified: false // Pendiente de revisión manual
        })

      if (verificationError) throw verificationError

      // 3. Actualizar estado del usuario
      await supabase
        .from('users')
        .update({ verification_status: 'pending' })
        .eq('id', userId)

      // 4. Redirigir al test de compatibilidad
      router.push('/test/objective')

    } catch (error) {
      console.error('Error en verificación:', error)
      alert('Error al subir documentos. Por favor intenta de nuevo.')
    } finally {
      setUploading(false)
    }
  }

  const FileUpload = ({ 
    type, 
    label, 
    description,
    inputRef 
  }: { 
    type: 'ineFront' | 'ineBack' | 'selfie'
    label: string
    description: string
    inputRef: React.RefObject<HTMLInputElement | null>
  }) => (
    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-400 transition-colors">
      <input
        type="file"
        ref={inputRef}
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleFileSelect(type, e.target.files[0])}
        className="hidden"
        capture={type === 'selfie' ? 'user' : undefined}
      />
      
      {uploads[type] ? (
        <div className="space-y-2">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm font-medium text-green-600">{uploads[type]?.name}</p>
          <button
            type="button"
            onClick={() => setUploads(prev => ({ ...prev, [type]: null }))}
            className="text-red-600 text-sm hover:underline"
          >
            Cambiar
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full space-y-2"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-sm text-gray-500">{description}</p>
        </button>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-purple-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <span className="text-xl font-bold text-white">MM</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Verificación de identidad</h1>
          <p className="text-gray-600 mt-2">Paso 3 de 5</p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
          <div className="bg-purple-600 h-2 rounded-full transition-all duration-300" style={{ width: '60%' }}></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* INE Frontal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              INE - Frontal *
            </label>
            <FileUpload
              type="ineFront"
              label="Subir frente de INE"
              description="JPG o PNG, max 5MB"
              inputRef={ineFrontRef}
            />
          </div>

          {/* INE Reverso */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              INE - Reverso *
            </label>
            <FileUpload
              type="ineBack"
              label="Subir reverso de INE" 
              description="JPG o PNG, max 5MB"
              inputRef={ineBackRef}
            />
          </div>

          {/* Selfie */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selfie de verificación *
            </label>
            <FileUpload
              type="selfie"
              label="Tomar selfie"
              description="Selfie claro donde se vea tu rostro"
              inputRef={selfieRef}
            />
          </div>

          {/* Mensaje legal */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 text-center">
              <strong>Tu privacidad es importante:</strong> Tu identidad será verificada para garantizar seguridad y exclusividad en la comunidad. Las imágenes de tu INE se encriptan y solo se usan para verificación.
            </p>
          </div>

          {/* Botón de envío */}
          <button
            type="submit"
            disabled={uploading || !uploads.ineFront || !uploads.ineBack || !uploads.selfie}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? 'Subiendo documentos...' : 'Continuar al test'}
          </button>
        </form>

        {/* Información adicional */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">¿Por qué pedimos tu INE?</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Verificar que eres mayor de 18 años</li>
            <li>• Prevenir perfiles falsos</li>
            <li>• Garantizar un ambiente seguro para todos</li>
            <li>• Cumplir con los términos de servicio</li>
          </ul>
        </div>
      </div>
    </div>
  )
}