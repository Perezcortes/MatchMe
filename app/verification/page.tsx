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
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      alert('Por favor sube solo imágenes (JPEG, PNG, JPG)')
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
    // Comprimir imagen si es muy grande (especialmente para móviles)
    const compressedFile = await compressImage(file);
    
    const { data, error } = await supabase.storage
      .from('verification-docs')
      .upload(path, compressedFile, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Error uploading file:', error)
      throw new Error(`Error al subir archivo: ${error.message}`)
    }

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('verification-docs')
      .getPublicUrl(data.path)

    return publicUrl
  }

  // Función para comprimir imágenes (especialmente útil en móvil)
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      // Si el archivo es menor a 1MB, no comprimir
      if (file.size <= 1024 * 1024) {
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          
          // Redimensionar manteniendo aspect ratio
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let { width, height } = img;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          }, 'image/jpeg', 0.8);
        };
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar que todas las imágenes estén subidas
    if (!uploads.ineFront || !uploads.ineBack || !uploads.selfie) {
      alert('Por favor sube todas las imágenes requeridas')
      return
    }

    setUploading(true)

    try {
      // Obtener usuario actual
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error('Error getting user:', userError)
        throw userError
      }
      
      if (!user) {
        alert('Debes iniciar sesión para continuar')
        router.push('/login')
        return
      }

      // 1. Subir imágenes a Supabase Storage
      const userId = user.id
      const timestamp = Date.now()
      
      const ineFrontUrl = await uploadFile(uploads.ineFront, `${userId}/ine-front-${timestamp}.jpg`)
      const ineBackUrl = await uploadFile(uploads.ineBack, `${userId}/ine-back-${timestamp}.jpg`) 
      const selfieUrl = await uploadFile(uploads.selfie, `${userId}/selfie-${timestamp}.jpg`)

      // 2. Guardar en la base de datos - SOLO LAS COLUMNAS QUE EXISTEN
      const { error: verificationError } = await supabase
        .from('verification_docs')
        .insert({
          user_id: userId,
          ine_front_url: ineFrontUrl,
          ine_back_url: ineBackUrl,
          selfie_url: selfieUrl,
          is_verified: false
          // NO incluir submitted_at - la columna created_at se llena automáticamente
        })

      if (verificationError) {
        console.error('Database error:', verificationError)
        throw verificationError
      }

      // 3. Actualizar estado del usuario en la tabla users
      const { error: updateError } = await supabase
        .from('users')
        .update({ verification_status: 'pending' })
        .eq('id', userId)

      if (updateError) {
        console.error('Update error:', updateError)
        throw updateError
      }

      // 4. Redirigir al test de compatibilidad
      router.push('/test/objective')

    } catch (error: any) {
      console.error('Error en verificación:', error)
      alert(`Error al subir documentos: ${error.message || 'Por favor intenta de nuevo.'}`)
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
    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-400 transition-colors bg-white">
      <input
        type="file"
        ref={inputRef}
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFileSelect(type, file)
          // Limpiar el input para permitir seleccionar el mismo archivo otra vez
          e.target.value = ''
        }}
        className="hidden"
        capture={type === 'selfie' ? 'user' : 'environment'}
      />
      
      {uploads[type] ? (
        <div className="space-y-3">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm font-medium text-green-600 truncate">{uploads[type]?.name}</p>
          <div className="flex justify-center space-x-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-blue-600 text-sm hover:underline"
            >
              Cambiar
            </button>
            <button
              type="button"
              onClick={() => setUploads(prev => ({ ...prev, [type]: null }))}
              className="text-red-600 text-sm hover:underline"
            >
              Eliminar
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full space-y-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-lg p-2"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-gray-900 text-base">{label}</p>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          </div>
        </button>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-4 px-4 sm:py-8">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-4 sm:p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="bg-purple-600 rounded-full w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-4">
            <span className="text-lg sm:text-xl font-bold text-white">MM</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Verificación de identidad</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Paso 3 de 5</p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div className="bg-purple-600 h-2 rounded-full transition-all duration-300" style={{ width: '60%' }}></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* INE Frontal */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
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
            <label className="block text-sm font-medium text-gray-900 mb-2">
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
            <label className="block text-sm font-medium text-gray-900 mb-2">
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
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-blue-800 text-center leading-relaxed">
              <strong className="font-semibold">Tu privacidad es importante:</strong> Tu identidad será verificada para garantizar seguridad y exclusividad en la comunidad. Las imágenes de tu INE se encriptan y solo se usan para verificación.
            </p>
          </div>

          {/* Botón de envío */}
          <button
            type="submit"
            disabled={uploading || !uploads.ineFront || !uploads.ineBack || !uploads.selfie}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            {uploading ? 'Subiendo documentos...' : 'Continuar al test'}
          </button>
        </form>

        {/* Información adicional */}
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">¿Por qué pedimos tu INE?</h3>
          <ul className="text-xs sm:text-sm text-gray-700 space-y-1">
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