// Algoritmo de compatibilidad mejorado

export interface UserProfile {
  id: string
  objective: string
  personality: {
    extraversion: number
    amabilidad: number
    escrupulosidad: number
    estabilidad_emocional: number
    apertura: number
  }
  interests: string[]
  values: any
  lifestyle: any
  compatibility_vector: any
  user_data?: {
    personal_data?: {
      name?: string
      email?: string
    }
  }
  user_id?: string // Agregar este campo
}

// Definir la interfaz MatchResult que faltaba
export interface MatchResult {
  user: UserProfile
  compatibilityScore: number
  breakdown: {
    personality: number
    values: number
    interests: number
    lifestyle: number
  }
  sharedInterests: string[]
}

// Ponderaciones mejoradas
const WEIGHTS = {
  personality: 0.35,
  values: 0.30,
  interests: 0.25,
  lifestyle: 0.10
}

// Categorías de intereses para matching más inteligente
const INTEREST_CATEGORIES = {
  deportes: ['actividad_fisica'],
  creatividad: ['musica', 'arte', 'cine_series', 'lectura'],
  tecnologia: ['tecnologia', 'videojuegos', 'emprendimiento'],
  naturaleza: ['naturaleza', 'mascotas'],
  social: ['gastronomia', 'viajes']
}

export function calculateCompatibility(userA: UserProfile, userB: UserProfile): MatchResult {
  const personalityScore = calculatePersonalityMatch(userA.personality, userB.personality)
  const valuesScore = calculateValuesMatch(userA.values, userB.values, userA.objective)
  const { score: interestsScore, shared: sharedInterests } = calculateInterestsMatch(userA.interests, userB.interests)
  const lifestyleScore = calculateLifestyleMatch(userA.lifestyle, userB.lifestyle)

  // Aplicar ponderaciones
  const totalScore = 
    (personalityScore * WEIGHTS.personality) +
    (valuesScore * WEIGHTS.values) +
    (interestsScore * WEIGHTS.interests) +
    (lifestyleScore * WEIGHTS.lifestyle)

  return {
    user: userB,
    compatibilityScore: Math.round(totalScore * 100),
    breakdown: {
      personality: Math.round(personalityScore * 100),
      values: Math.round(valuesScore * 100),
      interests: Math.round(interestsScore * 100),
      lifestyle: Math.round(lifestyleScore * 100)
    },
    sharedInterests
  }
}

function calculatePersonalityMatch(personalityA: any, personalityB: any): number {
  const traits = ['extraversion', 'amabilidad', 'escrupulosidad', 'estabilidad_emocional', 'apertura']
  let similarityScore = 0
  let complementaryScore = 0

  traits.forEach(trait => {
    const diff = Math.abs(personalityA[trait] - personalityB[trait])
    const similarity = 1 - (diff / 4)
    
    if (trait === 'extraversion') {
      const diffModerate = Math.min(diff, 2) / 2
      complementaryScore += diffModerate
    } else if (trait === 'estabilidad_emocional') {
      const avgStability = (personalityA[trait] + personalityB[trait]) / 2
      complementaryScore += avgStability / 5
    } else {
      similarityScore += similarity
    }
  })

  const finalScore = (similarityScore * 0.7 + complementaryScore * 0.3) / traits.length
  return Math.min(1, Math.max(0, finalScore))
}

function calculateValuesMatch(valuesA: any, valuesB: any, objective: string): number {
  let score = 0
  let totalWeight = 0

  if (valuesA.life_goal && valuesB.life_goal) {
    totalWeight += 0.4
    if (valuesA.life_goal === valuesB.life_goal) {
      score += 0.4
    } else {
      const compatibilityMatrix: { [key: string]: { [key: string]: number } } = {
        relacion_seria: { algo_que_crezca: 0.3, conocer_gente: 0.1, carrera: 0.0 },
        algo_que_crezca: { relacion_seria: 0.3, conocer_gente: 0.2, carrera: 0.1 },
        conocer_gente: { relacion_seria: 0.1, algo_que_crezca: 0.2, carrera: 0.4 },
        carrera: { relacion_seria: 0.0, algo_que_crezca: 0.1, conocer_gente: 0.4 }
      }
      score += compatibilityMatrix[valuesA.life_goal]?.[valuesB.life_goal] || 0
    }
  }

  if (valuesA.core_values && valuesB.core_values) {
    totalWeight += 0.35
    if (valuesA.core_values === valuesB.core_values) {
      score += 0.35
    } else {
      const valueGroups = [
        ['honestidad', 'lealtad', 'respeto'],
        ['responsabilidad', 'ambicion', 'crecimiento'],
        ['calma', 'amor_propio', 'bienestar'],
        ['aventura', 'creatividad', 'curiosidad']
      ]
      
      const groupA = valueGroups.find(group => group.includes(valuesA.core_values))
      const groupB = valueGroups.find(group => group.includes(valuesB.core_values))
      
      if (groupA && groupB && groupA === groupB) {
        score += 0.25
      } else if (groupA && groupB && haveOverlap(groupA, groupB)) {
        score += 0.15
      } else {
        score += 0.1
      }
    }
  }

  if (valuesA.future_vision && valuesB.future_vision) {
    totalWeight += 0.25
    if (valuesA.future_vision === valuesB.future_vision) {
      score += 0.25
    } else {
      const compatibleVisions = [
        ['independiente', 'carrera', 'emprendimiento'],
        ['familia', 'tradicional', 'estabilidad'],
        ['viajando', 'minimalista', 'experiencias']
      ]
      
      const isCompatible = compatibleVisions.some(group => 
        group.includes(valuesA.future_vision) && group.includes(valuesB.future_vision)
      )
      score += isCompatible ? 0.15 : 0.08
    }
  }

  return totalWeight > 0 ? score / totalWeight : 0.5
}

function calculateInterestsMatch(interestsA: string[], interestsB: string[]): { score: number, shared: string[] } {
  if (!interestsA.length || !interestsB.length) {
    return { score: 0, shared: [] }
  }

  const exactMatches = interestsA.filter(interest => interestsB.includes(interest))
  
  let categoryMatches = 0
  Object.values(INTEREST_CATEGORIES).forEach(category => {
    const hasA = interestsA.some(interest => category.includes(interest))
    const hasB = interestsB.some(interest => category.includes(interest))
    if (hasA && hasB) categoryMatches++
  })

  const exactScore = exactMatches.length / Math.max(interestsA.length, interestsB.length)
  const categoryScore = categoryMatches / Object.keys(INTEREST_CATEGORIES).length
  
  const totalScore = (exactScore * 0.7) + (categoryScore * 0.3)

  return {
    score: Math.min(1, totalScore),
    shared: exactMatches
  }
}

function calculateLifestyleMatch(lifestyleA: any, lifestyleB: any): number {
  const factors = ['schedule_management', 'alcohol_consumption', 'social_energy', 'life_pace']
  let totalScore = 0

  factors.forEach(factor => {
    if (lifestyleA[factor] !== undefined && lifestyleB[factor] !== undefined) {
      const diff = Math.abs(lifestyleA[factor] - lifestyleB[factor])
      const factorScore = 1 - (diff / 4)
      totalScore += factorScore
    }
  })

  return factors.length > 0 ? totalScore / factors.length : 0.5
}

function haveOverlap(arr1: string[], arr2: string[]): boolean {
  return arr1.some(item => arr2.includes(item))
}

// Función para datos de ejemplo (fallback)
export function findBestMatches(
  currentUser: UserProfile, 
  allUsers: UserProfile[], 
  limit: number = 10
): MatchResult[] {
  const matches = allUsers
    .filter(user => user.id !== currentUser.id)
    .map(user => calculateCompatibility(currentUser, user))
    .filter(match => match.compatibilityScore >= 30)
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
    .slice(0, limit)

  return matches
}

// Función para datos reales
import { getRealUserProfiles } from './user-service'
import { sampleUsers } from './sample-data'

export async function findBestMatchesReal(
  currentUser: UserProfile, 
  limit: number = 10
): Promise<MatchResult[]> {
  try {
    const realProfiles = await getRealUserProfiles(currentUser.id)
    
    let allProfiles = [...realProfiles]
    
    if (allProfiles.length < 5) {
      console.log('Complementing with sample data')
      const sampleProfiles = sampleUsers.filter(user => user.id !== currentUser.id)
      allProfiles = [...allProfiles, ...sampleProfiles]
    }

    const matches = allProfiles
      .map(user => calculateCompatibility(currentUser, user))
      .filter(match => match.compatibilityScore >= 30)
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      .slice(0, limit)

    console.log(`Generated ${matches.length} matches from ${allProfiles.length} total profiles`)
    return matches

  } catch (error) {
    console.error('Error in findBestMatchesReal:', error)
    return findBestMatches(currentUser, sampleUsers, limit)
  }
}