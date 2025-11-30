// app/actions.ts
"use server";

import { generateText, embed } from "ai";
import { google } from "@ai-sdk/google";
import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createServerClientWrapper } from "@/lib/supabase-server";

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
      model: google("gemini-2.5-flash"),
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
    // 1. Preparar texto para embeddings
    const description = `
      Objetivo: ${fullProfile.goal}.
      Personalidad Big Five: ${JSON.stringify(fullProfile.bigFive)}.
      Intereses: ${fullProfile.hobbies.join(", ")}.
      Valores: ${fullProfile.values.main}, futuro: ${fullProfile.values.future}.
      Estilo de vida: ${fullProfile.lifestyle.social}, ${
      fullProfile.lifestyle.alcohol
    }.
    `;

    // 2. Generar embedding
    let embedding: number[] = [];
    try {
      const { embedding: generatedEmbedding } = await embed({
        model: google.textEmbeddingModel("text-embedding-004"),
        value: description,
      });
      embedding = generatedEmbedding;
    } catch (err) {
      console.warn("Error generando embedding:", err);
      // Continuar sin embedding (fallback)
    }

    // 3. Generar reporte de IA
    let aiReport = "";
    try {
      const { text: report } = await generateText({
        model: google("gemini-2.5-flash"),
        system: "Eres un psicólogo experto en perfiles de estudiantes.",
        prompt: `
          Genera un "Reporte de Autoconocimiento" (máx 60 palabras) basado en:
          ${description}
          
          Estructura:
          - Tus fortalezas: (2 rasgos clave)
          - Tu entorno ideal: (dónde encaja mejor)
          - Consejo de conexión: (cómo romper el hielo)
          Usa formato Markdown simple.
        `,
      });
      aiReport = report;
    } catch (err) {
      console.warn("Error generando reporte:", err);
      aiReport = "Reporte no disponible en este momento";
    }

    // 4. Actualizar usuario con embedding y reporte
    if (fullProfile.userId) {
      const { error: updateError } = await supabase
        .from("users")
        .update({
          big_five_scores: fullProfile.bigFive,
          hobbies_list: fullProfile.hobbies,
          value_main: fullProfile.values.main,
          value_future: fullProfile.values.future,
          lifestyle_social: fullProfile.lifestyle.social,
          lifestyle_alcohol: fullProfile.lifestyle.alcohol,
          lifestyle_rhythm: fullProfile.lifestyle.rhythm,
          goal: fullProfile.goal,
          ai_report: aiReport,
          embedding: embedding.length > 0 ? embedding : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", fullProfile.userId);

      if (updateError) {
        console.warn("Error updating user:", updateError);
      }
    }

    // 5. Buscar matches (si el embedding se generó correctamente)
    let matches = [];
    if (embedding.length > 0) {
      try {
        const { data: matchData, error: matchError } = await supabase.rpc(
          "match_users",
          {
            query_embedding: embedding,
            match_threshold: 0.1,
            match_count: 5,
          }
        );

        if (matchError) {
          console.warn("Error en match_users:", matchError);
        } else {
          matches = matchData || [];
        }
      } catch (err) {
        console.warn("Error buscando matches:", err);
      }
    }

    return {
      success: true,
      report: aiReport,
      matches: matches,
    };
  } catch (error: any) {
    console.error("Error en saveProfileAndGetMatches:", error);
    return {
      success: false,
      error: error.message || "Error al procesar el perfil",
    };
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
