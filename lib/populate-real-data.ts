import { supabase } from './supabase'

// Datos basados en tu estudio de mercado - convertidos al formato de tu app
const realUserData = [
  {
    user_id: 'marco antonio',
    objective: 'amistad',
    big_five_scores: {
      extraversion: 3.2,
      amabilidad: 4.1,
      escrupulosidad: 3.8,
      estabilidad_emocional: 4.0,
      apertura: 3.5
    },
    interests: ['actividad_fisica', 'tecnologia', 'videojuegos'],
    values_goals: {
      life_goal: 'conocer_gente',
      core_values: 'honestidad',
      future_vision: 'estabilidad'
    },
    lifestyle: {
      schedule_management: 2,
      alcohol_consumption: 2,
      social_energy: 3,
      life_pace: 2
    },
    compatibility_vector: {}
  },
  {
    user_id: 'areli martinez',
    objective: 'networking',
    big_five_scores: {
      extraversion: 2.8,
      amabilidad: 4.3,
      escrupulosidad: 4.2,
      estabilidad_emocional: 3.5,
      apertura: 4.0
    },
    interests: ['lectura', 'tecnologia', 'emprendimiento'],
    values_goals: {
      life_goal: 'carrera',
      core_values: 'ambicion',
      future_vision: 'independiente'
    },
    lifestyle: {
      schedule_management: 1,
      alcohol_consumption: 1,
      social_energy: 2,
      life_pace: 1
    },
    compatibility_vector: {}
  },
  {
    user_id: 'hugo cesar',
    objective: 'amistad',
    big_five_scores: {
      extraversion: 3.5,
      amabilidad: 4.0,
      escrupulosidad: 3.2,
      estabilidad_emocional: 3.8,
      apertura: 3.7
    },
    interests: ['actividad_fisica', 'naturaleza', 'viajes'],
    values_goals: {
      life_goal: 'conocer_gente',
      core_values: 'lealtad',
      future_vision: 'viajando'
    },
    lifestyle: {
      schedule_management: 2,
      alcohol_consumption: 2,
      social_energy: 3,
      life_pace: 2
    },
    compatibility_vector: {}
  },
  {
    user_id: 'lizbeth munoz',
    objective: 'networking',
    big_five_scores: {
      extraversion: 3.8,
      amabilidad: 4.2,
      escrupulosidad: 3.5,
      estabilidad_emocional: 3.9,
      apertura: 3.6
    },
    interests: ['tecnologia', 'lectura', 'gastronomia'],
    values_goals: {
      life_goal: 'carrera',
      core_values: 'responsabilidad',
      future_vision: 'independiente'
    },
    lifestyle: {
      schedule_management: 2,
      alcohol_consumption: 1,
      social_energy: 2,
      life_pace: 2
    },
    compatibility_vector: {}
  },
  {
    user_id: 'joaquin torres',
    objective: 'networking',
    big_five_scores: {
      extraversion: 3.0,
      amabilidad: 4.1,
      escrupulosidad: 4.3,
      estabilidad_emocional: 3.4,
      apertura: 3.8
    },
    interests: ['musica', 'cine_series', 'tecnologia'],
    values_goals: {
      life_goal: 'algo_que_crezca',
      core_values: 'ambicion',
      future_vision: 'carrera'
    },
    lifestyle: {
      schedule_management: 1,
      alcohol_consumption: 2,
      social_energy: 2,
      life_pace: 1
    },
    compatibility_vector: {}
  },
  {
    user_id: 'zurisadai gualberto',
    objective: 'amistad',
    big_five_scores: {
      extraversion: 3.6,
      amabilidad: 4.4,
      escrupulosidad: 3.7,
      estabilidad_emocional: 4.1,
      apertura: 4.2
    },
    interests: ['naturaleza', 'actividad_fisica', 'lectura'],
    values_goals: {
      life_goal: 'conocer_gente',
      core_values: 'honestidad',
      future_vision: 'viajando'
    },
    lifestyle: {
      schedule_management: 2,
      alcohol_consumption: 1,
      social_energy: 3,
      life_pace: 2
    },
    compatibility_vector: {}
  },
  {
    user_id: 'yusdelia solano',
    objective: 'networking',
    big_five_scores: {
      extraversion: 3.3,
      amabilidad: 4.0,
      escrupulosidad: 4.1,
      estabilidad_emocional: 3.7,
      apertura: 3.5
    },
    interests: ['tecnologia', 'emprendimiento', 'viajes'],
    values_goals: {
      life_goal: 'carrera',
      core_values: 'responsabilidad',
      future_vision: 'independiente'
    },
    lifestyle: {
      schedule_management: 1,
      alcohol_consumption: 1,
      social_energy: 2,
      life_pace: 1
    },
    compatibility_vector: {}
  },
  {
    user_id: 'mario ortiz',
    objective: 'networking',
    big_five_scores: {
      extraversion: 3.7,
      amabilidad: 3.9,
      escrupulosidad: 3.8,
      estabilidad_emocional: 4.0,
      apertura: 3.6
    },
    interests: ['actividad_fisica', 'videojuegos', 'tecnologia'],
    values_goals: {
      life_goal: 'carrera',
      core_values: 'ambicion',
      future_vision: 'independiente'
    },
    lifestyle: {
      schedule_management: 2,
      alcohol_consumption: 2,
      social_energy: 3,
      life_pace: 2
    },
    compatibility_vector: {}
  },
  {
    user_id: 'erik palula',
    objective: 'amistad',
    big_five_scores: {
      extraversion: 3.4,
      amabilidad: 4.2,
      escrupulosidad: 3.6,
      estabilidad_emocional: 3.9,
      apertura: 4.3
    },
    interests: ['videojuegos', 'tecnologia', 'arte'],
    values_goals: {
      life_goal: 'conocer_gente',
      core_values: 'creatividad',
      future_vision: 'viajando'
    },
    lifestyle: {
      schedule_management: 2,
      alcohol_consumption: 1,
      social_energy: 2,
      life_pace: 2
    },
    compatibility_vector: {}
  },
  {
    user_id: 'david carmona',
    objective: 'amistad',
    big_five_scores: {
      extraversion: 3.1,
      amabilidad: 4.3,
      escrupulosidad: 3.9,
      estabilidad_emocional: 4.2,
      apertura: 3.7
    },
    interests: ['musica', 'lectura', 'naturaleza'],
    values_goals: {
      life_goal: 'conocer_gente',
      core_values: 'lealtad',
      future_vision: 'estabilidad'
    },
    lifestyle: {
      schedule_management: 2,
      alcohol_consumption: 1,
      social_energy: 2,
      life_pace: 2
    },
    compatibility_vector: {}
  }
]

export async function populateWithRealData() {
  try {
    let insertedCount = 0
    let errorCount = 0

    for (const userData of realUserData) {
      const { error } = await supabase
        .from('user_compatibility_profiles')
        .insert([userData])

      if (error) {
        console.error('Error inserting user:', userData.user_id, error)
        errorCount++
      } else {
        console.log('✅ Inserted user:', userData.user_id)
        insertedCount++
      }
    }
    
    console.log(`🎉 Finished populating real data: ${insertedCount} inserted, ${errorCount} errors`)
    return { success: true, inserted: insertedCount, errors: errorCount }
    
  } catch (error: any) {
    console.error('❌ Error populating real data:', error)
    return { success: false, error: error.message }
  }
}

// Función para verificar si ya existen datos
export async function checkExistingData() {
  try {
    const { data: profiles, error } = await supabase
      .from('user_compatibility_profiles')
      .select('user_id')
      .limit(5)

    if (error) {
      console.error('Error checking existing data:', error)
      return 0
    }

    return profiles?.length || 0
  } catch (error) {
    console.error('Error in checkExistingData:', error)
    return 0
  }
}