'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface UserReport {
  id: string
  reporter_user_id: string
  reported_user_id: string
  report_type: string
  description: string
  status: string
  created_at: string
  reporter_user: {
    personal_data: any
    email: string
  }
  reported_user: {
    personal_data: any
    email: string
  }
}

const reportTypeLabels: { [key: string]: string } = {
  inappropriate_behavior: 'Comportamiento inapropiado',
  fake_profile: 'Perfil falso',
  spam: 'Spam',
  harassment: 'Acoso',
  inappropriate_content: 'Contenido inapropiado',
  other: 'Otro'
}

const statusLabels: { [key: string]: string } = {
  pending: 'Pendiente',
  reviewed: 'Revisado',
  resolved: 'Resuelto',
  dismissed: 'Desestimado'
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<UserReport[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAdminAccess()
    loadReports()
  }, [])

  const checkAdminAccess = async () => {
    try {
      // 1. Obtener la sesión actual de forma segura
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !session?.user) {
        console.log('No hay sesión activa o error de sesión, redirigiendo al login.')
        router.push('/login')
        return
      }

      // 2. Verificar el rol del usuario en la base de datos
      const { data: userData, error: roleError } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (roleError || userData?.role !== 'admin') {
        console.warn('Acceso denegado: El usuario no tiene rol de admin.')
        alert('Acceso denegado. Solo administradores pueden acceder a esta página.')
        router.push('/') // Redirigir al home o a /matches
        return
      }

      // Si llegamos aquí, es admin. Podemos cargar los reportes.
      loadReports()

    } catch (error) {
      console.error('Error verificando acceso de admin:', error)
      router.push('/login')
    }
  }

  // Actualiza el useEffect para que SOLO llame a checkAdminAccess
  useEffect(() => {
    checkAdminAccess()
    // Eliminamos loadReports() de aquí porque ahora lo llamamos dentro de checkAdminAccess si todo sale bien.
  }, [])

  const loadReports = async () => {
    try {
      const { data, error } = await supabase
        .from('user_reports')
        .select(`
          *,
          reporter_user:users!reporter_user_id(personal_data, email),
          reported_user:users!reported_user_id(personal_data, email)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      setReports(data || [])
    } catch (error) {
      console.error('Error cargando reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateReportStatus = async (reportId: string, newStatus: string) => {
    setUpdating(reportId)

    try {
      const { error } = await supabase
        .from('user_reports')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId)

      if (error) throw error

      // Recargar reports
      await loadReports()

    } catch (error) {
      console.error('Error actualizando reporte:', error)
      alert('Error al actualizar el reporte')
    } finally {
      setUpdating(null)
    }
  }

  const takeModerationAction = async (reportedUserId: string, action: string, reason: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        alert('Debes iniciar sesión para realizar esta acción')
        return
      }

      const { error } = await supabase
        .from('user_moderation')
        .insert({
          user_id: reportedUserId,
          action_type: action,
          reason: reason,
          created_by: user.id
        })

      if (error) throw error

      alert('Acción de moderación aplicada correctamente')

    } catch (error) {
      console.error('Error aplicando moderación:', error)
      alert('Error al aplicar la acción de moderación')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando reportes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Panel de Moderación</h1>
            <div className="text-sm text-gray-500">
              {reports.filter(r => r.status === 'pending').length} reportes pendientes
            </div>
          </div>

          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {reportTypeLabels[report.report_type] || report.report_type}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Reportado por: {report.reporter_user?.personal_data?.name || report.reporter_user?.email}
                    </p>
                    <p className="text-sm text-gray-600">
                      Usuario reportado: {report.reported_user?.personal_data?.name || report.reported_user?.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                      }`}>
                      {statusLabels[report.status] || report.status}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(report.created_at).toLocaleDateString('es-MX')}
                    </div>
                  </div>
                </div>

                {report.description && (
                  <div className="bg-gray-50 p-3 rounded-lg mb-3">
                    <p className="text-sm text-gray-700">{report.description}</p>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="space-x-2">
                    <select
                      value={report.status}
                      onChange={(e) => updateReportStatus(report.id, e.target.value)}
                      disabled={updating === report.id}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>

                    <button
                      onClick={() => takeModerationAction(
                        report.reported_user_id,
                        'warning',
                        `Reporte: ${reportTypeLabels[report.report_type]}`
                      )}
                      className="text-sm bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    >
                      Advertir
                    </button>

                    <button
                      onClick={() => takeModerationAction(
                        report.reported_user_id,
                        'suspension',
                        `Suspensión por: ${reportTypeLabels[report.report_type]}`
                      )}
                      className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Suspender
                    </button>
                  </div>

                  {updating === report.id && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                  )}
                </div>
              </div>
            ))}

            {reports.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No hay reportes pendientes</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}