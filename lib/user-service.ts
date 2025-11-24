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
    // Actualizamos la columna personal_data que es un JSONB
    const { error } = await supabase
      .from('users')
      .update({ personal_data: data })
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
      .from('user_compatibility_profiles')
      .select('*')
      .neq('user_id', currentUserId)
      .not('big_five_scores', 'is', null)
      .not('interests', 'is', null)

    if (error) {
      console.error('Error fetching user profiles:', error)
      return []
    }

    // Eliminar duplicados y mantener el más reciente
    const uniqueProfilesMap = new Map()
    rawProfiles?.forEach(profile => {
      if (profile && profile.big_five_scores && Array.isArray(profile.interests)) {
        if (!uniqueProfilesMap.has(profile.user_id) || 
            new Date(profile.created_at) > new Date(uniqueProfilesMap.get(profile.user_id).created_at)) {
          uniqueProfilesMap.set(profile.user_id, profile)
        }
      }
    })

    const uniqueProfiles = Array.from(uniqueProfilesMap.values())
    const userIds = uniqueProfiles.map(profile => profile.user_id)

    if (userIds.length === 0) {
      return []
    }

    // Obtener datos de usuarios
    const { data: userRecords, error: usersError } = await supabase
      .from('users')
      .select('id, email, personal_data')
      .in('id', userIds)

    if (usersError) {
      console.error('Error fetching user records:', usersError)
    }

    // Crear mapa de datos de usuario
    const userDataMap = new Map()
    userRecords?.forEach(user => {
      const userData = extractUserDataFromPersonalData(user)
      userDataMap.set(user.id, userData)
    })

    // Construir perfiles completos
    const completeProfiles = uniqueProfiles.map((profile) => {
      const userData = userDataMap.get(profile.user_id)
      
      if (!userData) {
        return {
          ...profile,
          user_data: {
            personal_data: {
              name: `Usuario_${profile.user_id.substring(0, 8)}`,
              email: `user${profile.user_id.substring(0, 8)}@matchme.com`
            }
          }
        }
      }

      return {
        ...profile,
        user_data: {
          personal_data: userData
        }
      }
    })

    return completeProfiles

  } catch (error) {
    console.error('Error in getRealUserProfiles:', error)
    return []
  }
}

function extractUserDataFromPersonalData(userRecord: any) {
  const personalData = userRecord.personal_data
  const email = userRecord.email
  
  let fullName = ''

  // Parsear personal_data si es string
  let parsedPersonalData = personalData
  if (typeof personalData === 'string') {
    try {
      parsedPersonalData = JSON.parse(personalData)
    } catch (error) {
      parsedPersonalData = {}
    }
  }

  // Extraer nombre y apellido
  if (typeof parsedPersonalData === 'object' && parsedPersonalData !== null) {
    const firstName = parsedPersonalData.name || ''
    const lastName = parsedPersonalData.lastName || ''
    
    if (firstName && lastName) {
      fullName = `${firstName} ${lastName}`.trim()
    } else if (firstName) {
      fullName = firstName
    }
  }

  // Si no hay nombre, usar email
  if (!fullName && email) {
    fullName = extractNameFromEmail(email)
  }

  // Si todavía no hay nombre, generar uno
  if (!fullName) {
    fullName = `Usuario_${userRecord.id.substring(0, 8)}`
  }

  return {
    name: fullName,
    firstName: parsedPersonalData?.name || '',
    lastName: parsedPersonalData?.lastName || '',
    email: email,
    age: parsedPersonalData?.age,
    city: parsedPersonalData?.city,
    gender: parsedPersonalData?.gender,
    orientation: parsedPersonalData?.orientation
  }
}

function extractNameFromEmail(email: string): string {
  if (!email) return ''
  
  const emailPart = email.split('@')[0]
  
  if (emailPart.includes('.')) {
    const nameParts = emailPart.split('.')
    const formattedName = nameParts
      .filter(part => part.length > 1)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ')
    
    if (formattedName) return formattedName
  }
  
  if (emailPart.length > 2 && !emailPart.includes('user')) {
    return emailPart.charAt(0).toUpperCase() + emailPart.slice(1).toLowerCase()
  }
  
  return ''
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile, error } = await supabase
      .from('user_compatibility_profiles')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !profile) return null

    // Obtener datos del usuario
    const { data: userData } = await supabase
      .from('users')
      .select('email, personal_data')
      .eq('id', user.id)
      .single()

    return {
      ...profile,
      user_data: {
        personal_data: userData?.personal_data || { email: userData?.email }
      }
    }
  } catch (error) {
    console.error('Error getting current user profile:', error)
    return null
  }
}