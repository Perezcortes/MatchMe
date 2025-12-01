// lib\matching-algorithm.ts
// Algoritmo de compatibilidad mejorado
// Interfaz auxiliar para los datos personales
interface PersonalData {
  name?: string;
  lastName?: string; // Agregado
  email?: string;
  age?: string | number; // Agregado (puede ser string del input o number)
  city?: string; // Agregado
  gender?: string; // Agregado
  orientation?: string; // Agregado
  // Permite cualquier otra propiedad futura sin romper el tipo
  [key: string]: any; 
}

export interface UserProfile {
  id: string;
  user_id: string;
  objective: string;
  big_five_scores: {
    extraversion: number;
    amabilidad: number;
    escrupulosidad: number;
    estabilidad_emocional: number;
    apertura: number;
  };
  interests: string[];
  values_goals: {
    life_goal?: string;
    core_values?: string;
    future_vision?: string;
  };
  lifestyle: any;
  compatibility_vector: any;
  user_data?: {
    // Usamos la nueva interfaz detallada aquí
    personal_data?: PersonalData;
  };
}

// Definir la interfaz MatchResult que faltaba
export interface MatchResult {
  user: UserProfile;
  compatibilityScore: number;
  breakdown: {
    personality: number;
    values: number;
    interests: number;
    lifestyle: number;
  };
  sharedInterests: string[];
}

// Ponderaciones mejoradas
const WEIGHTS = {
  personality: 0.35,
  values: 0.3,
  interests: 0.25,
  lifestyle: 0.1,
};

// Categorías de intereses para matching más inteligente
const INTEREST_CATEGORIES = {
  deportes: ["actividad_fisica"],
  creatividad: ["musica", "arte", "cine_series", "lectura"],
  tecnologia: ["tecnologia", "videojuegos", "emprendimiento"],
  naturaleza: ["naturaleza", "mascotas"],
  social: ["gastronomia", "viajes"],
};

export function calculateCompatibility(
  userA: UserProfile,
  userB: UserProfile
): MatchResult {
  // Validar datos requeridos
  if (!userA || !userB) {
    //console.error("Missing user data in compatibility calculation");
    return {
      user: userB,
      compatibilityScore: 0,
      breakdown: { personality: 0, values: 0, interests: 0, lifestyle: 0 },
      sharedInterests: [],
    };
  }

  // Usar big_five_scores en lugar de personality
  const personalityScore = calculatePersonalityMatch(
    userA.big_five_scores,
    userB.big_five_scores
  );
  // Usar values_goals en lugar de values
  const valuesScore = calculateValuesMatch(
    userA.values_goals,
    userB.values_goals,
    userA.objective
  );
  const { score: interestsScore, shared: sharedInterests } =
    calculateInterestsMatch(userA.interests || [], userB.interests || []);
  const lifestyleScore = calculateLifestyleMatch(
    userA.lifestyle,
    userB.lifestyle
  );

  // Aplicar ponderaciones
  const totalScore =
    personalityScore * WEIGHTS.personality +
    valuesScore * WEIGHTS.values +
    interestsScore * WEIGHTS.interests +
    lifestyleScore * WEIGHTS.lifestyle;

  return {
    user: userB,
    compatibilityScore: Math.round(totalScore * 100),
    breakdown: {
      personality: Math.round(personalityScore * 100),
      values: Math.round(valuesScore * 100),
      interests: Math.round(interestsScore * 100),
      lifestyle: Math.round(lifestyleScore * 100),
    },
    sharedInterests,
  };
}

function calculatePersonalityMatch(
  personalityA: any,
  personalityB: any
): number {
  // Validar que existan los objetos de personalidad
  if (!personalityA || !personalityB) {
    //console.warn("Missing personality data:", { personalityA, personalityB });
    return 0.5; // Score neutral si falta data
  }

  const traits = [
    "extraversion",
    "amabilidad",
    "escrupulosidad",
    "estabilidad_emocional",
    "apertura",
  ];
  let similarityScore = 0;
  let complementaryScore = 0;
  let validTraits = 0;

  traits.forEach((trait) => {
    // Validar que el trait exista en ambos objetos
    if (
      personalityA[trait] !== undefined &&
      personalityB[trait] !== undefined
    ) {
      const diff = Math.abs(personalityA[trait] - personalityB[trait]);
      const similarity = 1 - diff / 4;

      if (trait === "extraversion") {
        const diffModerate = Math.min(diff, 2) / 2;
        complementaryScore += diffModerate;
      } else if (trait === "estabilidad_emocional") {
        const avgStability = (personalityA[trait] + personalityB[trait]) / 2;
        complementaryScore += avgStability / 5;
      } else {
        similarityScore += similarity;
      }
      validTraits++;
    }
  });

  if (validTraits === 0) return 0.5; // Score neutral si no hay traits válidos

  const finalScore =
    (similarityScore * 0.7 + complementaryScore * 0.3) / validTraits;
  return Math.min(1, Math.max(0, finalScore));
}

function calculateValuesMatch(
  valuesA: any,
  valuesB: any,
  objective: string
): number {
  // Validar que existan los objetos de valores
  if (!valuesA || !valuesB) {
    //console.warn("Missing values data:", { valuesA, valuesB });
    return 0.5; // Score neutral si falta data
  }

  let score = 0;
  let totalWeight = 0;

  // Usar values_goals.life_goal en lugar de values.life_goal
  if (valuesA.life_goal && valuesB.life_goal) {
    totalWeight += 0.4;
    if (valuesA.life_goal === valuesB.life_goal) {
      score += 0.4;
    } else {
      const compatibilityMatrix: { [key: string]: { [key: string]: number } } =
        {
          relacion_seria: {
            algo_que_crezca: 0.3,
            conocer_gente: 0.1,
            carrera: 0.0,
            no_seguro: 0.2,
          },
          algo_que_crezca: {
            relacion_seria: 0.3,
            conocer_gente: 0.2,
            carrera: 0.1,
            no_seguro: 0.2,
          },
          conocer_gente: {
            relacion_seria: 0.1,
            algo_que_crezca: 0.2,
            carrera: 0.4,
            no_seguro: 0.3,
          },
          carrera: {
            relacion_seria: 0.0,
            algo_que_crezca: 0.1,
            conocer_gente: 0.4,
            no_seguro: 0.2,
          },
          no_seguro: {
            relacion_seria: 0.2,
            algo_que_crezca: 0.2,
            conocer_gente: 0.3,
            carrera: 0.2,
          },
        };
      score +=
        compatibilityMatrix[valuesA.life_goal]?.[valuesB.life_goal] || 0.1;
    }
  }

  // Usar values_goals.core_values en lugar de values.core_values
  if (valuesA.core_values && valuesB.core_values) {
    totalWeight += 0.35;
    if (valuesA.core_values === valuesB.core_values) {
      score += 0.35;
    } else {
      const valueGroups = [
        ["honestidad", "lealtad", "respeto"],
        ["responsabilidad", "ambicion", "crecimiento"],
        ["calma", "amor_propio", "bienestar"],
        ["aventura", "creatividad", "curiosidad"],
      ];

      const groupA = valueGroups.find((group) =>
        group.includes(valuesA.core_values)
      );
      const groupB = valueGroups.find((group) =>
        group.includes(valuesB.core_values)
      );

      if (groupA && groupB && groupA === groupB) {
        score += 0.25;
      } else if (groupA && groupB && haveOverlap(groupA, groupB)) {
        score += 0.15;
      } else {
        score += 0.1;
      }
    }
  }

  // Usar values_goals.future_vision en lugar of values.future_vision
  if (valuesA.future_vision && valuesB.future_vision) {
    totalWeight += 0.25;
    if (valuesA.future_vision === valuesB.future_vision) {
      score += 0.25;
    } else {
      const compatibleVisions = [
        ["independiente", "carrera", "emprendimiento"],
        ["familia", "tradicional", "estabilidad"],
        ["viajando", "minimalista", "experiencias"],
      ];

      const isCompatible = compatibleVisions.some(
        (group) =>
          group.includes(valuesA.future_vision) &&
          group.includes(valuesB.future_vision)
      );
      score += isCompatible ? 0.15 : 0.08;
    }
  }

  return totalWeight > 0 ? score / totalWeight : 0.5;
}

function calculateInterestsMatch(
  interestsA: string[],
  interestsB: string[]
): { score: number; shared: string[] } {
  if (!interestsA.length || !interestsB.length) {
    return { score: 0, shared: [] };
  }

  const exactMatches = interestsA.filter((interest) =>
    interestsB.includes(interest)
  );

  let categoryMatches = 0;
  Object.values(INTEREST_CATEGORIES).forEach((category) => {
    const hasA = interestsA.some((interest) => category.includes(interest));
    const hasB = interestsB.some((interest) => category.includes(interest));
    if (hasA && hasB) categoryMatches++;
  });

  const exactScore =
    exactMatches.length / Math.max(interestsA.length, interestsB.length);
  const categoryScore =
    categoryMatches / Object.keys(INTEREST_CATEGORIES).length;

  const totalScore = exactScore * 0.7 + categoryScore * 0.3;

  return {
    score: Math.min(1, totalScore),
    shared: exactMatches,
  };
}

function calculateLifestyleMatch(lifestyleA: any, lifestyleB: any): number {
  const factors = [
    "schedule_management",
    "alcohol_consumption",
    "social_energy",
    "life_pace",
  ];
  let totalScore = 0;

  factors.forEach((factor) => {
    if (lifestyleA[factor] !== undefined && lifestyleB[factor] !== undefined) {
      const diff = Math.abs(lifestyleA[factor] - lifestyleB[factor]);
      const factorScore = 1 - diff / 4;
      totalScore += factorScore;
    }
  });

  return factors.length > 0 ? totalScore / factors.length : 0.5;
}

function haveOverlap(arr1: string[], arr2: string[]): boolean {
  return arr1.some((item) => arr2.includes(item));
}

// Función para datos de ejemplo (fallback)
export function findBestMatches(
  currentUser: UserProfile,
  allUsers: UserProfile[],
  limit: number = 10
): MatchResult[] {
  const matches = allUsers
    .filter((user) => user.id !== currentUser.id)
    .map((user) => calculateCompatibility(currentUser, user))
    .filter((match) => match.compatibilityScore >= 30)
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
    .slice(0, limit);

  return matches;
}

// Función para datos reales
import { getRealUserProfiles } from "./user-service";
import { sampleUsers } from "./sample-data";

export async function findBestMatchesReal(
  currentUser: UserProfile,
  limit: number = 10
): Promise<MatchResult[]> {
  try {
    console.log("🔍 Starting real match search for user:", currentUser.id);
    console.log("👤 Current user data structure:", {
      hasBigFive: !!currentUser.big_five_scores,
      hasValuesGoals: !!currentUser.values_goals,
      hasInterests: Array.isArray(currentUser.interests),
      interestsCount: currentUser.interests?.length || 0,
    });

    const realProfiles = await getRealUserProfiles(currentUser.id);
    console.log("📊 Real profiles found:", realProfiles.length);

    // 🔥 **SOLUCIÓN CRÍTICA: Usar SOLO datos reales, nunca datos de muestra**
    if (realProfiles.length === 0) {
      console.log("❌ No real profiles found. User needs to wait for more users to join.");
      return []; // Devolver array vacío en lugar de usar datos de muestra
    }

    // Validar estructura de perfiles reales
    const validRealProfiles = realProfiles.filter((profile) => {
      const isValid =
        profile &&
        profile.big_five_scores &&
        Array.isArray(profile.interests) &&
        profile.values_goals;

      if (!isValid) {
        console.warn("❌ Invalid profile structure:", {
          id: profile.id,
          hasBigFive: !!profile.big_five_scores,
          hasValuesGoals: !!profile.values_goals,
          hasInterests: Array.isArray(profile.interests),
        });
      }

      return isValid;
    });

    console.log("✅ Valid real profiles:", validRealProfiles.length);

    // 🔥 **USAR SOLO PERFILES REALES VÁLIDOS**
    const allProfiles = [...validRealProfiles];

    if (allProfiles.length === 0) {
      console.log("❌ No valid real profiles available.");
      return [];
    }

    console.log("🎯 Using ONLY real user data, no sample data");

    // Calcular compatibilidad para todos los perfiles REALES
    const matches = allProfiles
      .map((user) => {
        try {
          console.log(`🎯 Calculating compatibility with real user: ${user.id}`);
          console.log("📋 Real user structure:", {
            name: user.user_data?.personal_data?.name,
            hasBigFive: !!user.big_five_scores,
            hasValuesGoals: !!user.values_goals,
            hasInterests: Array.isArray(user.interests),
          });

          const match = calculateCompatibility(currentUser, user);
          console.log(
            `✅ Compatibility with ${user.user_data?.personal_data?.name || user.id}: ${match.compatibilityScore}%`
          );
          return match;
        } catch (error) {
          console.error(
            `❌ Error calculating compatibility with ${user.id}:`,
            error
          );
          console.log("🔍 User data that caused error:", {
            id: user.id,
            big_five_scores: user.big_five_scores,
            values_goals: user.values_goals,
            interests: user.interests,
          });
          return null;
        }
      })
      .filter(
        (match): match is MatchResult =>
          match !== null && match.compatibilityScore >= 20 // Bajar el umbral para mostrar más matches reales
      )
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      .slice(0, limit);

    console.log(
      `🎉 Generated ${matches.length} REAL matches from ${allProfiles.length} real profiles`
    );

    // Log para debugging - mostrar nombres REALES
    matches.forEach((match, index) => {
      const userName = match.user.user_data?.personal_data?.name || 'Unknown';
      const userEmail = match.user.user_data?.personal_data?.email || 'No email';
      console.log(
        `🏆 Real Match ${index + 1}: ${match.compatibilityScore}% - ${userName} (${userEmail})`
      );
    });

    return matches;
  } catch (error) {
    console.error("❌ Error in findBestMatchesReal:", error);
    // 🔥 **NO USAR DATOS DE MUESTRA NI EN CASO DE ERROR**
    console.log("🔄 Returning empty array instead of sample data");
    return [];
  }
}
