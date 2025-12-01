"use server";

import { generateText, embed } from "ai";
import { createGoogleGenerativeAI } from '@ai-sdk/google'; // Cambio en la importación para configurar
import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createServerClientWrapper } from "@/lib/supabase-server";

// Configurar Google AI explícitamente
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Genera un reporte de personalidad basado en los datos del usuario
 */
export async function generatePersonalityReport(formData: FormData) {
  try {
    const goal = formData.get("goal") as string;
    const hobbies = formData.get("hobbies") as string;
    const values = formData.get("values") as string;
    const personality = formData.get("personality") as string;

    if (!goal || !hobbies || !values || !personality) {
      return { success: false, error: "Faltan campos requeridos" };
    }

    const prompt = `
      Basándote en la siguiente información del usuario, genera un reporte de autoconocimiento personalizado (máx 100 palabras):
      
      - Objetivo: ${goal}
      - Intereses: ${hobbies}
      - Valores: ${values}
      - Personalidad: ${personality}
      
      Estructura el reporte así:
      1. Fortalezas clave (2 líneas)
      2. Entorno ideal (1 línea)
      3. Consejo de conexión (1 línea)
      
      Usa formato Markdown simple.
    `;

    const { text: report } = await generateText({
      model: google("gemini-2.5-flash"), // Usamos 1.5-flash que es rápido y estable
      prompt,
    });

    return { success: true, report };
  } catch (error: any) {
    console.error("Error en generatePersonalityReport:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Guarda el perfil completo del usuario y obtiene matches
 */
export async function saveProfileAndGetMatches(fullProfile: any) {
  try {
    // 1. Preparar texto para el Reporte (Solo Texto)
    const description = `
      Objetivo: ${fullProfile.goal}.
      Personalidad Big Five: ${JSON.stringify(fullProfile.bigFive)}.
      Intereses: ${fullProfile.hobbies.join(", ")}.
      Valores: ${fullProfile.values.main}, futuro: ${fullProfile.values.future}.
      Estilo de vida: ${fullProfile.lifestyle.social}.
    `;

    // 2. Generar reporte de IA (ESTO SÍ ES REAL)
    let aiReport = "Tu perfil es interesante. Conecta con otros para descubrir más.";
    try {
      const { text } = await generateText({
        model: google("gemini-1.5-flash"), // O 'gemini-pro' si flash falla
        system: "Eres un psicólogo experto en perfiles de estudiantes. Sé breve, empático y usa formato Markdown.",
        prompt: `Genera un reporte de 3 puntos (Fortalezas, Entorno Ideal, Consejo) para: ${description}`,
      });
      aiReport = text;
    } catch (err) {
      console.warn("Error IA:", err);
    }

    // 3. Guardar perfil en DB (Sin vectores, solo datos)
    if (fullProfile.userId) {
      const { error: updateError } = await supabase
        .from("users")
        .update({
          goal: fullProfile.goal,
          big_five_scores: fullProfile.bigFive,
          hobbies_list: fullProfile.hobbies,
          value_main: fullProfile.values.main,
          value_future: fullProfile.values.future,
          lifestyle_social: fullProfile.lifestyle.social,
          lifestyle_alcohol: fullProfile.lifestyle.alcohol,
          lifestyle_rhythm: fullProfile.lifestyle.rhythm,
          ai_report: aiReport,
          test_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", fullProfile.userId);

      if (updateError) throw new Error("Error guardando datos: " + updateError.message);
    }

    // 4. Retornamos éxito (Los matches los generará el Frontend falsamente)
    return {
      success: true,
      report: aiReport,
      matches: [], // Array vacío, el front se encarga de inventarlos
    };

  } catch (error: any) {
    console.error("Error en action:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Calcula compatibilidad entre dos usuarios
 */
export async function calculateCompatibility(
  user1BigFive: any,
  user2BigFive: any,
  user1Hobbies: string[],
  user2Hobbies: string[],
  user1Values: string,
  user2Values: string,
  user1Lifestyle: string,
  user2Lifestyle: string
) {
  try {
    // Personality: Distancia euclidiana
    const personalityDistance = Math.sqrt(
      Object.keys(user1BigFive).reduce((sum, key) => {
        const diff = (user1BigFive[key] || 0) - (user2BigFive[key] || 0);
        return sum + diff * diff;
      }, 0)
    );
    const personalityScore = Math.max(0, 1 - personalityDistance / 4); // Normalizar

    // Hobbies: Porcentaje de coincidencias
    const commonHobbies = user1Hobbies.filter((h) => user2Hobbies.includes(h));
    const hobbiesScore =
      user1Hobbies.length === 0 || user2Hobbies.length === 0
        ? 0.5
        : commonHobbies.length /
          Math.max(user1Hobbies.length, user2Hobbies.length);

    // Values: Match exacto o parcial
    const valuesScore = user1Values === user2Values ? 1 : 0.6;

    // Lifestyle: Similar o no
    const lifestyleScore = user1Lifestyle === user2Lifestyle ? 1 : 0.7;

    // Score final (ponderado)
    const totalScore =
      personalityScore * 0.4 +
      valuesScore * 0.3 +
      hobbiesScore * 0.2 +
      lifestyleScore * 0.1;

    return {
      totalScore: Math.min(1, totalScore),
      breakdown: {
        personality: Math.min(1, personalityScore),
        values: valuesScore,
        hobbies: hobbiesScore,
        lifestyle: lifestyleScore,
      },
    };
  } catch (error: any) {
    console.error("Error calculating compatibility:", error);
    return {
      totalScore: 0.5,
      breakdown: {
        personality: 0.5,
        values: 0.5,
        hobbies: 0.5,
        lifestyle: 0.5,
      },
    };
  }
}

/**
 * Acción de servidor para cerrar sesión de forma segura
 */
export async function signOut() {
  // Usamos el wrapper que maneja las cookies del servidor
  const supabase = await createServerClientWrapper();

  await supabase.auth.signOut();

  // Redirigir al login después de cerrar sesión
  redirect("/login");
}
