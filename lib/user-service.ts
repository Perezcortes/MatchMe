import { supabase } from './supabase'
import { UserProfile } from './matching-algorithm'

// Interfaz para los datos que vamos a editar
export interface PersonalDataUpdate {
  name: string;
  lastName: string;
  age: string;
  city: string;
  gender: string;
  orientation: string;
}

export async function updateUserPersonalData(userId: string, data: PersonalDataUpdate) {
  try {
    const { error } = await supabase
      .from('users')
      .update({ 
        name: data.name,
        lastname: data.lastName,
        age: parseInt(data.age),
        city: data.city,
        gender: data.gender,
        orientation: data.orientation
      })
      .eq('id', userId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error updating user personal data:', error);
    return { success: false, error };
  }
}

export async function getRealUserProfiles(currentUserId: string): Promise<UserProfile[]> {
  try {
    const { data: rawProfiles, error } = await supabase
      .from('users')
      .select('*')
      .neq('id', currentUserId)
      .not('big_five_scores', 'is', null) // Aquí sí exigimos test completo para los matches
      .not('hobbies_list', 'is', null)

    if (error) {
      console.error('Error fetching user profiles:', error)
      return []
    }

    if (!rawProfiles || rawProfiles.length === 0) return []

    // Mapeo corregido
    const completeProfiles: UserProfile[] = rawProfiles.map((user: any) => {
      return {
        id: user.id,
        user_id: user.id,
        objective: user.goal,
        big_five_scores: user.big_five_scores,
        interests: user.hobbies_list || [],
        
        values_goals: {
            core_values: user.value_main,
            future_vision: user.value_future,
            life_goal: user.goal
        },
        
        lifestyle: {
            social: user.lifestyle_social,
            alcohol: user.lifestyle_alcohol,
            rhythm: user.lifestyle_rhythm
        },
        compatibility_vector: null,
        created_at: user.created_at,
        
        user_data: {
          personal_data: {
            name: user.name ? `${user.name} ${user.lastname || ''}`.trim() : 'Estudiante Anónimo',
            email: user.email,
            age: user.age,
            city: user.city,
            gender: user.gender,
            orientation: user.orientation
          }
        }
      } as UserProfile
    })

    return completeProfiles

  } catch (error) {
    console.error('Error in getRealUserProfiles:', error)
    return []
  }
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    // 1. Obtener usuario autenticado
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        console.warn("getCurrentUserProfile: No auth user")
        return null
    }

    // 2. Obtener perfil de forma INDESTRUCTIBLE
    // Usamos .limit(1) en lugar de .single()/.maybeSingle() para evitar error 406
    const { data: profiles, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .limit(1)

    if (error) {
        console.error("getCurrentUserProfile DB Error:", error)
        return null
    }

    // Si la lista está vacía, no hay perfil
    if (!profiles || profiles.length === 0) {
        console.warn("getCurrentUserProfile: No profile found in DB")
        return null
    }

    const profile = profiles[0] // Tomamos el primero manualmente

    // 3. Validación y Mapeo
    // Aceptamos el perfil si tiene al menos un objetivo (goal)
    const hasBasicData = profile.goal || profile.name;

    if (!hasBasicData) {
        console.warn("getCurrentUserProfile: Perfil existe pero está vacío")
        return null
    }

    return {
      id: profile.id,
      user_id: profile.id,
      objective: profile.goal || 'amistad',
      big_five_scores: profile.big_five_scores || {},
      interests: profile.hobbies_list || [],
      
      values_goals: {
          core_values: profile.value_main || '',
          future_vision: profile.value_future || '',
          life_goal: profile.goal || ''
      },
      
      lifestyle: {
          social: profile.lifestyle_social || '',
          alcohol: profile.lifestyle_alcohol || '',
          rhythm: profile.lifestyle_rhythm || ''
      },
      compatibility_vector: null,
      created_at: profile.created_at,
      user_data: {
        personal_data: {
            name: profile.name ? `${profile.name} ${profile.lastname || ''}`.trim() : 'Yo',
            email: profile.email,
            age: profile.age,
            city: profile.city,
            gender: profile.gender,
            orientation: profile.orientation
        }
      }
    } as UserProfile

  } catch (error) {
    console.error('Error getting current user profile:', error)
    return null
  }
}