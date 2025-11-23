import { createClient } from './supabase'
import { UserProfile } from './matching-algorithm'

const supabase = createClient()

// Función hash simple para generar nombres consistentes
function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash
}

// Función para generar información de usuario cuando no hay datos personales
function getUserDisplayInfo(userId: string, userData: any): { name: string, email: string } {
  // Si tenemos datos reales, usarlos
  if (userData?.personal_data?.name) {
    return {
      name: userData.personal_data.name,
      email: userData.personal_data.email || `user${userId.slice(0, 8)}@matchme.com`
    }
  }
  
  // Si no, generar un nombre basado en el ID para consistencia
  const names = ['Alex', 'Maria', 'Carlos', 'Ana', 'David', 'Laura', 'Javier', 'Sofia', 'Daniel', 'Elena']
  const lastNames = ['Garcia', 'Rodriguez', 'Martinez', 'Lopez', 'Hernandez', 'Gonzalez', 'Perez', 'Sanchez', 'Ramirez', 'Torres']
  
  const nameIndex = Math.abs(hashCode(userId)) % names.length
  const lastNameIndex = Math.abs(hashCode(userId + '1')) % lastNames.length
  
  return {
    name: `${names[nameIndex]} ${lastNames[lastNameIndex]}`,
    email: `user${userId.slice(0, 8)}@matchme.com`
  }
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    //console.log('🔄 Getting current user profile...')
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      //console.error('Auth error:', authError)
      return null
    }
    
    if (!user) {
      //console.log('❌ No authenticated user found')
      return null
    }

    //console.log('👤 Authenticated user:', user.id)

    // Obtener el perfil de compatibilidad
    const { data: profile, error: profileError } = await supabase
      .from('user_compatibility_profiles')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (profileError) {
      //console.error('❌ Error fetching user profile:', {
        //message: profileError.message,
        //details: profileError.details,
        //code: profileError.code
      //})
      
      if (profileError.code === 'PGRST116') {
        //console.log('📝 No compatibility profile found for user')
        return null
      }
      
      return null
    }

    if (!profile) {
      //console.log('📝 No compatibility profile found in database')
      return null
    }

    //console.log('✅ User profile found:', {
      //id: profile.id,
      //hasBigFive: !!profile.big_five_scores,
      //interestsCount: profile.interests?.length || 0
    //})

    // **SOLUCIÓN MEJORADA: Obtener datos personales de la tabla users**
    let userData = null
    try {
      const { data: personalData, error: personalError } = await supabase
        .from('users')
        .select('personal_data')
        .eq('id', user.id)

      if (personalError) {
        //console.warn('⚠️ Error fetching personal data:', personalError.message)
      } else if (personalData && personalData.length > 0) {
        const actualPersonalData = personalData[0].personal_data
        //console.log('✅ Personal data found from users table:', actualPersonalData)
        
        // Usar datos reales de la tabla users
        userData = {
          personal_data: actualPersonalData || {}
        }
      } else {
        //console.warn('⚠️ No personal data found in users table')
      }
    } catch (personalError) {
      //console.warn('⚠️ Error fetching personal data from users table:', personalError)
    }

    // Si no hay datos personales, usar datos básicos
    if (!userData) {
      const userInfo = getUserDisplayInfo(user.id, null)
      userData = {
        personal_data: userInfo
      }
      //console.log('🔄 Using generated personal data')
    }

    const fullProfile: UserProfile = {
      ...profile,
      user_data: userData
    }

    //console.log('🎉 Final user profile structure:', {
      //id: fullProfile.id,
      //userId: fullProfile.user_id,
      //objective: fullProfile.objective,
      //name: fullProfile.user_data?.personal_data?.name,
      //hasBigFive: !!fullProfile.big_five_scores,
      //interests: fullProfile.interests?.length
    //})

    return fullProfile

  } catch (error) {
    //console.error('💥 Unexpected error in getCurrentUserProfile:', error)
    return null
  }
}

export async function getRealUserProfiles(currentUserId: string): Promise<UserProfile[]> {
  try {
    //console.log('🔍 Fetching real user profiles from database...')
    
    // Obtener todos los perfiles de compatibilidad excepto el del usuario actual
    const { data: profiles, error } = await supabase
      .from('user_compatibility_profiles')
      .select('*')
      .neq('user_id', currentUserId)
      .order('created_at', { ascending: false })

    if (error) {
      //console.error('❌ Error fetching real user profiles:', {
        //message: error.message,
        //code: error.code,
        //details: error.details
      //})
      return []
    }

    //console.log(`📊 Found ${profiles?.length || 0} raw user profiles`)

    if (!profiles || profiles.length === 0) {
      //console.log('ℹ️ No other user profiles found in database')
      return []
    }

    // Validar y transformar los perfiles a la estructura esperada
    const validProfiles = profiles.filter(profile => {
      const isValid = 
        profile && 
        profile.big_five_scores && 
        Array.isArray(profile.interests) &&
        profile.values_goals &&
        profile.user_id !== currentUserId

      if (!isValid) {
        //console.warn('🚫 Invalid profile filtered out:', {
          //id: profile.id,
          //hasBigFive: !!profile.big_five_scores,
          //hasInterests: Array.isArray(profile.interests),
          //hasValues: !!profile.values_goals
        //})
      }
      
      return isValid
    })

    //console.log(`✅ Valid profiles after filtering: ${validProfiles.length}`)

    // **SOLUCIÓN: Filtrar perfiles duplicados por usuario**
    const uniqueProfilesMap = new Map()
    
    validProfiles.forEach(profile => {
      const existingProfile = uniqueProfilesMap.get(profile.user_id)
      
      if (!existingProfile || new Date(profile.created_at) > new Date(existingProfile.created_at)) {
        uniqueProfilesMap.set(profile.user_id, profile)
      }
    })

    const uniqueProfiles = Array.from(uniqueProfilesMap.values())
    //console.log(`👥 Unique users after deduplication: ${uniqueProfiles.length}`)

    // Obtener datos personales para perfiles únicos con manejo mejorado
    const profilesWithPersonalData = await Promise.all(
      uniqueProfiles.map(async (profile) => {
        try {
          let userData = null
          
          // **SOLUCIÓN MEJORADA: Manejar mejor la consulta de datos personales**
          const { data: personalData, error: userError } = await supabase
            .from('users')
            .select('personal_data')
            .eq('id', profile.user_id)

          if (userError) {
            //console.warn(`⚠️ Error fetching personal data for user ${profile.user_id}:`, userError.message)
            // Crear datos básicos del usuario
            const userInfo = getUserDisplayInfo(profile.user_id, null)
            userData = {
              personal_data: userInfo
            }
          } else if (personalData && personalData.length > 0) {
            // Tenemos datos personales
            const actualPersonalData = personalData[0].personal_data
            //console.log(`✅ Found personal data for ${profile.user_id}:`, actualPersonalData)
            
            const userInfo = getUserDisplayInfo(profile.user_id, { personal_data: actualPersonalData })
            userData = {
              personal_data: userInfo
            }
          } else {
            // No se encontraron datos personales
            //console.warn(`⚠️ No personal data found for user ${profile.user_id}`)
            const userInfo = getUserDisplayInfo(profile.user_id, null)
            userData = {
              personal_data: userInfo
            }
          }

          const fullProfile: UserProfile = {
            ...profile,
            user_data: userData
          }

          return fullProfile

        } catch (error) {
          //console.error(`💥 Unexpected error processing user data for ${profile.user_id}:`, error)
          // Retornar perfil con datos básicos en caso de error
          const userInfo = getUserDisplayInfo(profile.user_id, null)
          return {
            ...profile,
            user_data: {
              personal_data: userInfo
            }
          } as UserProfile
        }
      })
    )

    //console.log(`🎯 Final unique profiles with personal data: ${profilesWithPersonalData.length}`)
    
    // Log para debugging
    profilesWithPersonalData.forEach(profile => {
      const name = profile.user_data?.personal_data?.name || 'Unknown'
      const email = profile.user_data?.personal_data?.email || 'No email'
      //console.log(`   👤 ${name} (${email}) - ${profile.objective}`)
    })

    return profilesWithPersonalData

  } catch (error) {
    //console.error('💥 Unexpected error in getRealUserProfiles:', error)
    return []
  }
}