// Algoritmo de compatibilidad basado en los 4 pilares

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
}

export interface MatchResult {
  user: UserProfile
  compatibilityScore: number
  breakdown: {
    personality: number
    values: number
    interests: number
    lifestyle: number
  }
}

// Ponderaciones según la investigación
const WEIGHTS = {
  personality: 0.40, // 40%
  values: 0.30,      // 30%
  interests: 0.20,   // 20%
  lifestyle: 0.10    // 10%
}

export function calculateCompatibility(userA: UserProfile, userB: UserProfile): MatchResult {
  const personalityScore = calculatePersonalityMatch(userA.personality, userB.personality)
  const valuesScore = calculateValuesMatch(userA.values, userB.values, userA.objective)
  const interestsScore = calculateInterestsMatch(userA.interests, userB.interests)
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
    }
  }
}

function calculatePersonalityMatch(personalityA: any, personalityB: any): number {
  // Distancia euclidiana en los 5 rasgos (invertida para que menor distancia = mayor compatibilidad)
  const traits = ['extraversion', 'amabilidad', 'escrupulosidad', 'estabilidad_emocional', 'apertura']
  let squaredDifferences = 0

  traits.forEach(trait => {
    const diff = personalityA[trait] - personalityB[trait]
    squaredDifferences += diff * diff
  })

  const distance = Math.sqrt(squaredDifferences)
  // Convertir distancia a score (0-1), donde 0 distancia = 1 score, max distancia = 0 score
  const maxDistance = Math.sqrt(5 * 4 * 4) // Máxima distancia posible (diferencia de 4 en los 5 rasgos)
  return Math.max(0, 1 - (distance / maxDistance))
}

function calculateValuesMatch(valuesA: any, valuesB: any, objective: string): number {
  let score = 0
  let totalQuestions = 0

  // Pregunta de objetivo de relación
  if (valuesA.life_goal && valuesB.life_goal) {
    totalQuestions++
    if (valuesA.life_goal === valuesB.life_goal) {
      score += 1
    } else if (
      (valuesA.life_goal === 'relacion_seria' && valuesB.life_goal === 'algo_que_crezca') ||
      (valuesA.life_goal === 'algo_que_crezca' && valuesB.life_goal === 'relacion_seria')
    ) {
      score += 0.7 // Compatibilidad parcial
    }
  }

  // Pregunta de valores principales
  if (valuesA.core_values && valuesB.core_values) {
    totalQuestions++
    if (valuesA.core_values === valuesB.core_values) {
      score += 1
    } else {
      // Algunas combinaciones tienen compatibilidad parcial
      const compatiblePairs = [
        ['honestidad', 'lealtad'],
        ['responsabilidad', 'ambicion'],
        ['calma', 'amor_propio']
      ]
      const isPartiallyCompatible = compatiblePairs.some(pair => 
        (pair.includes(valuesA.core_values) && pair.includes(valuesB.core_values))
      )
      score += isPartiallyCompatible ? 0.5 : 0.2
    }
  }

  // Pregunta de visión futura
  if (valuesA.future_vision && valuesB.future_vision) {
    totalQuestions++
    if (valuesA.future_vision === valuesB.future_vision) {
      score += 1
    } else {
      // Compatibilidad parcial para visiones similares
      const similarPairs = [
        ['independiente', 'carrera'],
        ['familia', 'tradicional'],
        ['viajando', 'minimalista']
      ]
      const isSimilar = similarPairs.some(pair => 
        (pair.includes(valuesA.future_vision) && pair.includes(valuesB.future_vision))
      )
      score += isSimilar ? 0.6 : 0.3
    }
  }

  return totalQuestions > 0 ? score / totalQuestions : 0.5
}

function calculateInterestsMatch(interestsA: string[], interestsB: string[]): number {
  if (!interestsA.length || !interestsB.length) return 0

  // Calcular intersección de intereses
  const commonInterests = interestsA.filter(interest => 
    interestsB.includes(interest)
  ).length

  // Score basado en el porcentaje de intereses en común
  const maxPossibleCommon = Math.min(interestsA.length, interestsB.length)
  return maxPossibleCommon > 0 ? commonInterests / maxPossibleCommon : 0
}

function calculateLifestyleMatch(lifestyleA: any, lifestyleB: any): number {
  const factors = ['schedule_management', 'alcohol_consumption', 'social_energy', 'life_pace']
  let totalDifference = 0

  factors.forEach(factor => {
    if (lifestyleA[factor] && lifestyleB[factor]) {
      const diff = Math.abs(lifestyleA[factor] - lifestyleB[factor])
      totalDifference += diff
    }
  })

  // Convertir diferencia a score (menor diferencia = mayor compatibilidad)
  const maxDifference = factors.length * 2 // Máxima diferencia posible
  return Math.max(0, 1 - (totalDifference / maxDifference))
}

// Función para encontrar los mejores matches
export function findBestMatches(
  currentUser: UserProfile, 
  allUsers: UserProfile[], 
  limit: number = 10
): MatchResult[] {
  const matches = allUsers
    .filter(user => user.id !== currentUser.id) // Excluir al usuario actual
    .map(user => calculateCompatibility(currentUser, user))
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore) // Ordenar por score descendente
    .slice(0, limit)

  return matches
}