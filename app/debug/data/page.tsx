// app/debug/data/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { getCurrentUserProfile, getRealUserProfiles } from '@/lib/user-service'

export default function DebugData() {
  const [data, setData] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkData()
  }, [])

  const checkData = async () => {
    const supabase = createClient()
    const result: any = {}

    try {
      // 1. Verificar usuario actual
      const { data: { user } } = await supabase.auth.getUser()
      result.currentUser = user

      // 2. Verificar perfil actual
      const currentProfile = await getCurrentUserProfile()
      result.currentProfile = currentProfile

      // 3. Verificar perfiles de compatibilidad
      const { data: compProfiles, error: compError } = await supabase
        .from('user_compatibility_profiles')
        .select('*')

      result.compProfiles = compProfiles
      result.compError = compError

      // 4. Verificar usuarios
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')

      result.users = users
      result.usersError = usersError

      // 5. Verificar perfiles reales
      if (user) {
        const realProfiles = await getRealUserProfiles(user.id)
        result.realProfiles = realProfiles
      }

    } catch (error) {
      result.error = error
    } finally {
      setData(result)
      setLoading(false)
    }
  }

  if (loading) return <div className="p-8">Cargando datos de diagnóstico...</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Diagnóstico de Base de Datos</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Usuario Actual</h2>
          <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(data.currentUser, null, 2)}</pre>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Perfil Actual</h2>
          <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(data.currentProfile, null, 2)}</pre>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Perfiles de Compatibilidad ({data.compProfiles?.length || 0})</h2>
          {data.compError && <p className="text-red-600">Error: {JSON.stringify(data.compError)}</p>}
          <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(data.compProfiles, null, 2)}</pre>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Perfiles Reales Encontrados ({data.realProfiles?.length || 0})</h2>
          <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(data.realProfiles, null, 2)}</pre>
        </div>
      </div>
    </div>
  )
}