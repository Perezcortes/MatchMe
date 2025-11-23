'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  reportedUserId: string
  reportedUserName?: string
}

const reportTypes = [
  {
    id: 'inappropriate_behavior',
    label: 'Comportamiento inapropiado',
    description: 'Lenguaje o acciones ofensivas'
  },
  {
    id: 'fake_profile', 
    label: 'Perfil falso',
    description: 'Información personal falsa o suplantación'
  },
  {
    id: 'spam',
    label: 'Spam',
    description: 'Mensajes no solicitados o promocionales'
  },
  {
    id: 'harassment',
    label: 'Acoso',
    description: 'Comportamiento acosador o intimidatorio'
  },
  {
    id: 'inappropriate_content',
    label: 'Contenido inapropiado',
    description: 'Fotos o contenido ofensivo'
  },
  {
    id: 'other',
    label: 'Otro',
    description: 'Otra razón no listada'
  }
]

export default function ReportModal({ 
  isOpen, 
  onClose, 
  reportedUserId, 
  reportedUserName 
}: ReportModalProps) {
  const [selectedType, setSelectedType] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedType) {
      alert('Por favor selecciona un tipo de reporte')
      return
    }

    setIsSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        alert('Debes iniciar sesión para reportar')
        return
      }

      const { error } = await supabase
        .from('user_reports')
        .insert({
          reporter_user_id: user.id,
          reported_user_id: reportedUserId,
          report_type: selectedType,
          description: description || null,
          status: 'pending'
        })

      if (error) throw error

      alert('Reporte enviado correctamente. Revisaremos tu reporte pronto.')
      onClose()
      resetForm()

    } catch (error: any) {
      console.error('Error enviando reporte:', error)
      alert('Error al enviar el reporte. Por favor intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setSelectedType('')
    setDescription('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-red-50 border-b border-red-200 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-red-900">Reportar Usuario</h3>
              <p className="text-red-700 mt-1">
                {reportedUserName ? `Reportando a ${reportedUserName}` : 'Reportando usuario'}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-red-500 hover:text-red-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Tipo de reporte */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de reporte *
            </label>
            <div className="space-y-2">
              {reportTypes.map((type) => (
                <label key={type.id} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="reportType"
                    value={type.id}
                    checked={selectedType === type.id}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="mt-1 text-red-600 focus:ring-red-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{type.label}</div>
                    <div className="text-sm text-gray-500">{type.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción adicional (opcional)
            </label>
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Proporciona más detalles sobre el incidente..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Información importante */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="text-sm text-yellow-800">
                <strong>Importante:</strong> Los reportes falsos pueden resultar en la suspensión de tu cuenta. 
                Solo reporta comportamientos que violen nuestros términos de servicio.
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!selectedType || isSubmitting}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Reporte'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}