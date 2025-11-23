import { supabase } from './supabase'
import { UserProfile } from './matching-algorithm'

export interface DatabaseUserProfile {
  id: string
  user_id: string
  objective: string
  big_five_scores: {
    extraversion: number
    amabilidad: number
    escrupulosidad: number
    estabilidad_emocional: number
    apertura: number
  }
  interests: string[]
  values_goals: {
    life_goal: string
    core_values: string
    future_vision: string
  }
  lifestyle: {
    schedule_management: number
    alcohol_consumption: number
    social_energy: number
    life_pace: number
  }
  compatibility_vector: any
  created_at: string
  user_data?: {
    personal_data?: {
      name?: string
      email?: string
    }
  }
}

export async function getRealUserProfiles(excludeUserId?: string): Promise<UserProfile[]> {
  try {
    let query = supabase
      .from('user_compatibility_profiles')
      .select(`
        *,
        users!inner (
          personal_data
        )
      `)
      .order('created_at', { ascending: false })

    // Solo excluir si es un UUID válido
    if (excludeUserId && isValidUUID(excludeUserId)) {
      query = query.neq('user_id', excludeUserId)
    }

    const { data: profiles, error } = await query

    if (error) {
      console.error('Error fetching user profiles:', error)
      return []
    }

    if (!profiles || profiles.length === 0) {
      console.log('No user profiles found in database')
      return []
    }

    // Convertir a formato UserProfile
    const userProfiles: UserProfile[] = profiles.map(profile => ({
      id: profile.user_id,
      objective: profile.objective,
      personality: profile.big_five_scores,
      interests: profile.interests,
      values: profile.values_goals,
      lifestyle: profile.lifestyle,
      compatibility_vector: profile.compatibility_vector,
      // Agregar datos del usuario
      user_data: profile.users?.personal_data
    }))

    console.log(`Found ${userProfiles.length} real user profiles`)
    return userProfiles

  } catch (error) {
    console.error('Error in getRealUserProfiles:', error)
    return []
  }
}

// Función auxiliar para validar UUID
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

// Obtener datos básicos del usuario actual
export async function getCurrentUserProfile() {
  try {
    const profileData = localStorage.getItem('userProfile')
    if (!profileData) return null

    const profile = JSON.parse(profileData)
    
    // Obtener el user_id real del usuario actual
    const { data: { user } } = await supabase.auth.getUser()
    
    return {
      ...profile,
      id: user?.id || 'current-user',
      user_id: user?.id
    }
  } catch (error) {
    console.error('Error getting current user profile:', error)
    return null
  }
}