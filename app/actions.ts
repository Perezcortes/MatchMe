'use server';

import { generateText, embed } from 'ai';
import { google } from '@ai-sdk/google';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function saveProfileAndGetMatches(fullProfile: any) {
  try {
    // 1. Preparar el texto para el "ADN Matemático" (Vector)
    // Juntamos toda la info importante en un solo texto para la IA
    const description = `
      Objetivo: ${fullProfile.goal}.
      Personalidad Big Five: ${JSON.stringify(fullProfile.bigFive)}.
      Intereses: ${fullProfile.hobbies.join(", ")}.
      Valores: ${fullProfile.values.main}, futuro: ${fullProfile.values.future}.
      Estilo de vida: ${fullProfile.lifestyle.social}, ${fullProfile.lifestyle.rhythm}.
    `;

    // 2. Generar Vector (Embedding)
    const { embedding } = await embed({
      model: google.textEmbeddingModel('text-embedding-004'),
      value: description,
    });

    // 3. Generar Reporte de Autoconocimiento (IA Generativa)
    const { text: aiReport } = await generateText({
      model: google('gemini-2.5-flash'),
      system: 'Eres un psicólogo experto en perfiles de estudiantes.',
      prompt: `
        Genera un "Reporte de Autoconocimiento" (máx 60 palabras) para este usuario basado en:
        ${description}
        
        Estructura:
        - Tus fortalezas: (2 rasgos clave)
        - Tu entorno ideal: (dónde encaja mejor)
        - Consejo de conexión: (cómo romper el hielo)
        Usa formato Markdown simple (negritas).
      `,
    });

    // 4. Guardar Usuario en Base de Datos
    // Nota: En un caso real usaríamos el ID de autenticación. Aquí creamos uno nuevo.
    const { data: savedUser, error: saveError } = await supabase
      .from('users')
      .insert({
        name: fullProfile.name || 'Usuario Nuevo', // Recuperamos nombre si existe
        age: fullProfile.age || 20,
        goal: fullProfile.goal,
        big_five_scores: fullProfile.bigFive,
        hobbies_list: fullProfile.hobbies,
        value_main: fullProfile.values.main,
        ai_report: aiReport,
        embedding: embedding,
        verified: true // Asumimos verificado para el flujo
      })
      .select()
      .single();

    if (saveError) throw new Error(saveError.message);

    // 5. BUSCAR MATCHES (La magia del Vector Search)
    // Llamamos a la función SQL 'match_users' que creamos antes
    const { data: matches, error: matchError } = await supabase.rpc('match_users', {
      query_embedding: embedding,
      match_threshold: 0.1, // Umbral de similitud (0 a 1)
      match_count: 5 // Top 5 matches
    });

    if (matchError) throw new Error(matchError.message);

    return { success: true, report: aiReport, matches: matches };

  } catch (error: any) {
    console.error("Error backend:", error);
    return { success: false, error: error.message };
  }
}