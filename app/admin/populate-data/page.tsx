'use client'

import { useState, useEffect } from 'react'
import { populateWithRealData, checkExistingData } from '@/lib/populate-real-data'

export default function PopulateDataPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [existingProfiles, setExistingProfiles] = useState(0)

  useEffect(() => {
    loadExistingData()
  }, [])

  const loadExistingData = async () => {
    const count = await checkExistingData()
    setExistingProfiles(count)
  }

  const handlePopulate = async () => {
    setLoading(true)
    setMessage('')
    try {
      const result = await populateWithRealData()
      
      if (result.success) {
        setMessage(`✅ ¡Datos poblados exitosamente! Se insertaron ${result.inserted} perfiles.`)
        // Recargar el conteo
        await loadExistingData()
      } else {
        setMessage(`❌ Error: ${result.error}`)
      }
    } catch (error: any) {
      setMessage('❌ Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClearData = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar todos los perfiles? Esta acción no se puede deshacer.')) {
      return
    }

    setLoading(true)
    setMessage('')
    try {
      // Nota: En producción, deberías usar una función segura del servidor
      // Esto es solo para desarrollo
      const { error } = await fetch('/api/admin/clear-profiles', {
        method: 'POST'
      }).then(res => res.json())

      if (error) {
        setMessage('❌ Error al limpiar datos: ' + error.message)
      } else {
        setMessage('✅ Datos limpiados exitosamente')
        setExistingProfiles(0)
      }
    } catch (error: any) {
      setMessage('❌ Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Administrar Base de Datos</h1>
          <p className="text-gray-600">
            Gestiona los datos de perfiles de usuarios para testing
          </p>
        </div>

        {/* Estadísticas */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">Estadísticas Actuales</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{existingProfiles}</div>
              <div className="text-sm text-blue-800">Perfiles existentes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">10</div>
              <div className="text-sm text-green-800">Perfiles disponibles</div>
            </div>
          </div>
        </div>

        {/* Información */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-800 mb-2">📋 Información Importante</h3>
          <ul className="text-yellow-700 text-sm space-y-1">
            <li>• Se insertarán 10 perfiles basados en tu estudio de mercado</li>
            <li>• Los perfiles tienen datos realistas de personalidad e intereses</li>
            <li>• Esto mejorará significativamente la calidad de los matches</li>
            <li>• Los datos se almacenan en la tabla user_compatibility_profiles</li>
          </ul>
        </div>

        {/* Botones de acción */}
        <div className="space-y-4">
          <button
            onClick={handlePopulate}
            disabled={loading || existingProfiles >= 5}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Poblando datos...' : 'Poblar con datos reales (10 perfiles)'}
          </button>

          {existingProfiles > 0 && (
            <button
              onClick={handleClearData}
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Limpiando...' : 'Limpiar todos los datos'}
            </button>
          )}
        </div>

        {/* Mensajes de estado */}
        {message && (
          <div className={`mt-4 p-3 rounded-lg ${
            message.includes('✅') ? 'bg-green-100 text-green-800 border border-green-200' : 
            message.includes('❌') ? 'bg-red-100 text-red-800 border border-red-200' : 
            'bg-blue-100 text-blue-800 border border-blue-200'
          }`}>
            {message}
          </div>
        )}

        {/* Instrucciones */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">🚀 Próximos pasos:</h3>
          <ol className="text-gray-600 text-sm space-y-1 list-decimal list-inside">
            <li>Haz clic en "Poblar con datos reales"</li>
            <li>Ve a la página de matches (/matches)</li>
            <li>¡Disfruta de matches más realistas y diversos!</li>
          </ol>
        </div>
      </div>
    </div>
  )
}