import { UserProfile } from './matching-algorithm'

export const sampleUsers: UserProfile[] = [
  {
    id: 'user1',
    objective: 'amistad',
    personality: {
      extraversion: 4.2,
      amabilidad: 4.8,
      escrupulosidad: 3.5,
      estabilidad_emocional: 4.0,
      apertura: 3.8
    },
    interests: ['musica', 'arte', 'lectura'],
    values: {
      life_goal: 'conocer_gente',
      core_values: 'honestidad',
      future_vision: 'viajando'
    },
    lifestyle: {
      schedule_management: 2,
      alcohol_consumption: 2,
      social_energy: 1,
      life_pace: 2
    },
    compatibility_vector: {
      openness: 3.8,
      conscientiousness: 3.5,
      extraversion: 4.2,
      agreeableness: 4.8,
      stability: 4.0,
      ambition: 0,
      family_orientation: 0,
      social_level: 1,
      structure_level: 2
    }
  },
  {
    id: 'user2',
    objective: 'networking',
    personality: {
      extraversion: 3.8,
      amabilidad: 4.0,
      escrupulosidad: 4.5,
      estabilidad_emocional: 3.2,
      apertura: 4.2
    },
    interests: ['tecnologia', 'emprendimiento', 'lectura'],
    values: {
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
    compatibility_vector: {
      openness: 4.2,
      conscientiousness: 4.5,
      extraversion: 3.8,
      agreeableness: 4.0,
      stability: 3.2,
      ambition: 1,
      family_orientation: 0,
      social_level: 2,
      structure_level: 1
    }
  },
  {
    id: 'user3',
    objective: 'relacion',
    personality: {
      extraversion: 2.8,
      amabilidad: 4.5,
      escrupulosidad: 3.8,
      estabilidad_emocional: 4.2,
      apertura: 3.5
    },
    interests: ['naturaleza', 'mascotas', 'cine_series'],
    values: {
      life_goal: 'relacion_seria',
      core_values: 'lealtad',
      future_vision: 'familia'
    },
    lifestyle: {
      schedule_management: 2,
      alcohol_consumption: 1,
      social_energy: 3,
      life_pace: 2
    },
    compatibility_vector: {
      openness: 3.5,
      conscientiousness: 3.8,
      extraversion: 2.8,
      agreeableness: 4.5,
      stability: 4.2,
      ambition: 0,
      family_orientation: 1,
      social_level: 3,
      structure_level: 2
    }
  },
  {
    id: 'user4',
    objective: 'amistad',
    personality: {
      extraversion: 4.5,
      amabilidad: 4.2,
      escrupulosidad: 3.2,
      estabilidad_emocional: 3.8,
      apertura: 4.5
    },
    interests: ['viajes', 'gastronomia', 'actividad_fisica'],
    values: {
      life_goal: 'conocer_gente',
      core_values: 'calma',
      future_vision: 'viajando'
    },
    lifestyle: {
      schedule_management: 3,
      alcohol_consumption: 2,
      social_energy: 1,
      life_pace: 1
    },
    compatibility_vector: {
      openness: 4.5,
      conscientiousness: 3.2,
      extraversion: 4.5,
      agreeableness: 4.2,
      stability: 3.8,
      ambition: 0,
      family_orientation: 0,
      social_level: 1,
      structure_level: 3
    }
  }
]