import { UserProfile } from './matching-algorithm'

export const sampleUsers: UserProfile[] = [
  {
    id: 'user1',
    user_id: 'user1',
    objective: 'amistad',
    big_five_scores: {
      extraversion: 4,
      amabilidad: 3,
      escrupulosidad: 2,
      estabilidad_emocional: 3,
      apertura: 4
    },
    interests: ['musica', 'arte', 'lectura'],
    values_goals: {
      life_goal: 'relacion_seria',
      core_values: 'honestidad',
      future_vision: 'familia'
    },
    lifestyle: {
      schedule_management: 3,
      alcohol_consumption: 2,
      social_energy: 4,
      life_pace: 2
    },
    compatibility_vector: {},
    user_data: {
      personal_data: {
        name: 'Javier Rodriguez',
        email: 'javier@ejemplo.com'
      }
    }
  },
  {
    id: 'user2',
    user_id: 'user2',
    objective: 'networking',
    big_five_scores: {
      extraversion: 3,
      amabilidad: 4,
      escrupulosidad: 3,
      estabilidad_emocional: 2,
      apertura: 3
    },
    interests: ['tecnologia', 'emprendimiento', 'lectura'],
    values_goals: {
      life_goal: 'carrera',
      core_values: 'responsabilidad',
      future_vision: 'independiente'
    },
    lifestyle: {
      schedule_management: 4,
      alcohol_consumption: 1,
      social_energy: 3,
      life_pace: 3
    },
    compatibility_vector: {},
    user_data: {
      personal_data: {
        name: 'Sofia Garcia',
        email: 'sofia@ejemplo.com'
      }
    }
  },
  {
    id: 'user3',
    user_id: 'user3',
    objective: 'relacion',
    big_five_scores: {
      extraversion: 2,
      amabilidad: 5,
      escrupulosidad: 4,
      estabilidad_emocional: 3,
      apertura: 2
    },
    interests: ['viajes', 'gastronomia', 'actividad_fisica'],
    values_goals: {
      life_goal: 'algo_que_crezca',
      core_values: 'lealtad',
      future_vision: 'tradicional'
    },
    lifestyle: {
      schedule_management: 2,
      alcohol_consumption: 3,
      social_energy: 2,
      life_pace: 1
    },
    compatibility_vector: {},
    user_data: {
      personal_data: {
        name: 'Elena Ramirez',
        email: 'elena@ejemplo.com'
      }
    }
  },
  {
    id: 'user4',
    user_id: 'user4',
    objective: 'amistad',
    big_five_scores: {
      extraversion: 3,
      amabilidad: 3,
      escrupulosidad: 3,
      estabilidad_emocional: 4,
      apertura: 3
    },
    interests: ['naturaleza', 'mascotas', 'cine_series'],
    values_goals: {
      life_goal: 'conocer_gente',
      core_values: 'aventura',
      future_vision: 'viajando'
    },
    lifestyle: {
      schedule_management: 3,
      alcohol_consumption: 2,
      social_energy: 3,
      life_pace: 2
    },
    compatibility_vector: {},
    user_data: {
      personal_data: {
        name: 'Daniel Torres',
        email: 'daniel@ejemplo.com'
      }
    }
  }
]